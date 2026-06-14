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
  locale?: string;
}

interface CategoryResult {
  categoryName: string;
  items: { canonicalName: string; itemIds: string[] }[];
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

  const { items, locale } = body;

  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: "items must be a non-empty array" }, { status: 400 });
  }

  const isFrench = locale !== "en";
  const itemsList = items
    .map((item) => `- id: "${item.id}", text: "${item.text}"`)
    .join("\n");

  const suggestedCategories = isFrench
    ? "Fruits & Légumes, Produits laitiers, Viande & Poisson, Boulangerie, Épicerie, Boissons, Surgelés, Snacks & Apéro, Condiments & Sauces, Autre"
    : "Produce, Dairy, Meat & Fish, Bakery, Pantry, Beverages, Frozen, Snacks & Appetizers, Condiments & Sauces, Other";

  const prompt = `Categorize and group these grocery shopping items. Every item must appear exactly once.

Rules:
1. Group duplicate/similar items (spelling variations, different languages, different specificity) under one canonical name.
2. Assign EVERY item (including singletons) to a grocery store category.
3. Return categories in grocery-aisle order.
4. Use ${isFrench ? "French" : "English"} for all category names and canonical names.
5. Suggested categories: ${suggestedCategories}. You may create additional categories if needed.

Items:
${itemsList}`;

  const categorizeAndGroupTool: Anthropic.Messages.Tool = {
    name: "categorize_and_group_items",
    description: "Categorize and group shopping items by grocery aisle",
    input_schema: {
      type: "object" as const,
      properties: {
        categories: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category_name: { type: "string", description: "Grocery store category name" },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    canonical_name: { type: "string", description: "The best canonical name for this item or group" },
                    item_ids: { type: "array", items: { type: "string" }, description: "IDs of items in this group (1 for singletons, 2+ for merged)" },
                  },
                  required: ["canonical_name", "item_ids"],
                },
              },
            },
            required: ["category_name", "items"],
          },
        },
      },
      required: ["categories"],
    },
  };

  try {
    const client = new Anthropic({ apiKey });
    const message = await client.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
      tools: [categorizeAndGroupTool],
      tool_choice: { type: "tool", name: "categorize_and_group_items" },
    });

    if (message.stop_reason === "max_tokens") {
      console.error("[group-shopping-items] response truncated (max_tokens)");
      return NextResponse.json({ error: "AI response truncated" }, { status: 500 });
    }

    const toolBlock = message.content.find((b) => b.type === "tool_use");
    if (!toolBlock || toolBlock.type !== "tool_use") {
      return NextResponse.json({ error: "No tool response from AI" }, { status: 500 });
    }

    const input = toolBlock.input as Record<string, unknown>;

    // Validate and sanitize — handle both camelCase and snake_case from the model
    const rawCategories = Array.isArray(input.categories) ? input.categories : [];
    const categories: CategoryResult[] = rawCategories
      .filter((cat): cat is Record<string, unknown> =>
        typeof cat === "object" && cat !== null &&
        ("categoryName" in cat || "category_name" in cat) &&
        ("items" in cat && Array.isArray(cat.items)),
      )
      .map((cat) => {
        const categoryName = String(cat.categoryName ?? cat.category_name);
        const rawItems = Array.isArray(cat.items) ? cat.items : [];
        const parsedItems = rawItems
          .filter((item): item is Record<string, unknown> =>
            typeof item === "object" && item !== null &&
            ("canonicalName" in item || "canonical_name" in item) &&
            ("itemIds" in item || "item_ids" in item),
          )
          .map((item) => {
            const name = item.canonicalName ?? item.canonical_name;
            const ids = item.itemIds ?? item.item_ids;
            return {
              canonicalName: String(name),
              itemIds: Array.isArray(ids) ? ids.map(String) : [],
            };
          })
          .filter((g) => g.itemIds.length > 0);
        return { categoryName, items: parsedItems };
      })
      .filter((cat) => cat.items.length > 0);

    return NextResponse.json({ categories });
  } catch (err) {
    console.error("Group shopping items error:", err);
    return NextResponse.json(
      { error: "Failed to group items" },
      { status: 500 },
    );
  }
}
