import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";

// In-memory rate limiter (persists across requests in the same server process)
const rateLimitMap = new Map<string, { lastRequest: number; dailyCount: number; day: string }>();

function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return "unknown";
}

interface RequestBody {
  items: { id: string; text: string }[];
}

interface GroupResult {
  canonicalName: string;
  itemIds: string[];
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

    // 5 requests per 60 seconds
    if (now - entry.lastRequest < 12_000) {
      return NextResponse.json(
        { error: "Rate limited — please wait a minute before trying again" },
        { status: 429 },
      );
    }

    // 50 requests per day
    if (entry.dailyCount >= 50) {
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

  const { items } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
  }

  const itemsList = items
    .map((item) => `- id: "${item.id}", text: "${item.text}"`)
    .join("\n");

  const prompt = `You are grouping grocery shopping items for a ski chalet trip. Items may be in French or English.

Items:
${itemsList}

Group items that refer to the same ingredient or product, even if:
- They use different languages (e.g. "beurre" and "butter")
- They have slight spelling variations (e.g. "tomates" and "tomate")
- They have different specificity (e.g. "cream" and "heavy cream" should be grouped)

For each group, pick the most descriptive name as the canonical name. Preserve the original language if all items in a group use the same language.

Items that don't match anything else should be in their own group (with just their own ID).

Use the group_items tool to return the grouped results.`;

  const groupItemsTool: Anthropic.Messages.Tool = {
    name: "group_items",
    description: "Group shopping items by ingredient",
    input_schema: {
      type: "object" as const,
      properties: {
        groups: {
          type: "array",
          items: {
            type: "object",
            properties: {
              canonicalName: { type: "string", description: "The best canonical name for this group of items" },
              itemIds: { type: "array", items: { type: "string" }, description: "IDs of items in this group" },
            },
            required: ["canonicalName", "itemIds"],
          },
        },
      },
      required: ["groups"],
    },
  };

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
      tools: [groupItemsTool],
      tool_choice: { type: "tool", name: "group_items" },
    });

    const toolBlock = message.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") {
      return NextResponse.json({ error: "No tool response from AI" }, { status: 500 });
    }

    const input = toolBlock.input as { groups: unknown[] };

    // Validate and sanitize
    const groups: GroupResult[] = (input.groups ?? [])
      .filter((item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null && "canonicalName" in item && "itemIds" in item,
      )
      .map((item) => ({
        canonicalName: String(item.canonicalName),
        itemIds: Array.isArray(item.itemIds) ? item.itemIds.map(String) : [],
      }))
      .filter((g) => g.itemIds.length > 0);

    return NextResponse.json({ groups });
  } catch (err) {
    console.error("Group shopping items error:", err);
    return NextResponse.json(
      { error: "Failed to group items" },
      { status: 500 },
    );
  }
}
