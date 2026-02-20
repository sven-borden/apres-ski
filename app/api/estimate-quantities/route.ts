import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { ShoppingUnit } from "@/lib/types";

const VALID_UNITS: ShoppingUnit[] = ["kg", "g", "L", "dL", "cl", "pcs", "bottles", "packs"];

// In-memory rate limiter (persists across requests in the same server process)
const rateLimitMap = new Map<string, { lastRequest: number; dailyCount: number; day: string }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

interface RequestBody {
  mealDescription: string;
  headcount: number;
  items: { id: string; text: string }[];
}

interface EstimatedItem {
  id: string;
  quantity: number | null;
  unit: ShoppingUnit | null;
}

export async function POST(request: Request) {
  // Token auth
  const expectedToken = process.env.NEXT_PUBLIC_ESTIMATE_API_TOKEN;
  if (expectedToken) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 },
      );
    }
  }

  // Rate limiting
  const ip = getClientIp(request);
  const now = Date.now();
  const todayUTC = new Date().toISOString().slice(0, 10);
  const entry = rateLimitMap.get(ip);

  if (entry) {
    // Reset daily count on new day
    if (entry.day !== todayUTC) {
      entry.dailyCount = 0;
      entry.day = todayUTC;
    }

    // 1 request per 60 seconds
    if (now - entry.lastRequest < 60_000) {
      return NextResponse.json(
        { error: "Rate limited — please wait a minute before trying again" },
        { status: 429 },
      );
    }

    // 10 requests per day
    if (entry.dailyCount >= 10) {
      return NextResponse.json(
        { error: "Daily limit reached — try again tomorrow" },
        { status: 429 },
      );
    }

    entry.lastRequest = now;
    entry.dailyCount += 1;
  } else {
    rateLimitMap.set(ip, { lastRequest: now, dailyCount: 1, day: todayUTC });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY not configured" },
      { status: 500 },
    );
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { mealDescription, headcount, items } = body;

  if (!mealDescription || typeof mealDescription !== "string") {
    return NextResponse.json({ error: "mealDescription is required" }, { status: 400 });
  }
  if (!headcount || typeof headcount !== "number" || headcount < 1) {
    return NextResponse.json({ error: "headcount must be a positive number" }, { status: 400 });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
  }

  const itemsList = items
    .map((item) => `- id: "${item.id}", item: "${item.text}"`)
    .join("\n");

  const prompt = `You are estimating grocery shopping quantities for a ski chalet dinner.

Meal: ${mealDescription}
Number of people: ${headcount}

These are hungry skiers after a full day on the slopes — estimate generous portions (20-30% more than standard servings).

Shopping items:
${itemsList}

For each item, estimate the quantity and unit needed. Rules:
- Use ONLY these units: kg, g, L, dL, cl, pcs, bottles, packs
- Round to practical shopping amounts (e.g. 1.5 kg, not 1.37 kg)
- Items that are clearly apero/drinks/snacks NOT part of the dinner recipe should get null for both quantity and unit
- If unsure whether an item belongs to the recipe, estimate it anyway

Return ONLY a JSON array, no other text. Each element must have exactly these fields:
{ "id": "<item id>", "quantity": <number or null>, "unit": "<unit or null>" }`;

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-sonnet-4-6-20250514",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const textBlock = message.content.find((b) => b.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json({ error: "No text response from AI" }, { status: 500 });
    }

    // Extract JSON array from response (handle markdown code blocks)
    let jsonStr = textBlock.text.trim();
    const jsonMatch = jsonStr.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return NextResponse.json({ error: "Could not parse AI response" }, { status: 500 });
    }
    jsonStr = jsonMatch[0];

    const parsed: unknown[] = JSON.parse(jsonStr);

    // Validate and sanitize
    const validItems: EstimatedItem[] = parsed
      .filter((item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && "id" in item,
      )
      .map((item) => {
        const id = String(item.id);
        const quantity = typeof item.quantity === "number" ? item.quantity : null;
        const rawUnit = typeof item.unit === "string" ? item.unit : null;
        const unit = rawUnit && VALID_UNITS.includes(rawUnit as ShoppingUnit)
          ? (rawUnit as ShoppingUnit)
          : null;

        return { id, quantity, unit };
      });

    return NextResponse.json({ items: validItems });
  } catch (err) {
    console.error("Estimate quantities error:", err);
    return NextResponse.json(
      { error: "Failed to estimate quantities" },
      { status: 500 },
    );
  }
}
