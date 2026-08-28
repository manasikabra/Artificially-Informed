import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import type { FilteredItem, Lens, RawItem } from "./types.js";

const LENS_VALUES = ["industry-usecases", "l-and-d", "ai-education", "india-ecosystem"] as const;

const FilteredItemSchema = z.object({
  url: z.string(),
  relevance_score: z.number().min(1).max(10),
  lenses: z.array(z.enum(LENS_VALUES)).min(1),
  why_it_matters: z.string(),
  potential_use: z.string().nullable(),
  summary: z.string(),
});

const SubmitFilteredItemsSchema = z.object({
  items: z.array(FilteredItemSchema),
});

const promptPath = fileURLToPath(new URL("../prompts/filter_prompt.md", import.meta.url));
const FILTER_PROMPT = readFileSync(promptPath, "utf-8");

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

export async function filterItems(items: RawItem[]): Promise<FilteredItem[]> {
  if (items.length === 0) return [];

  const client = new Anthropic();

  const candidates = items.map((item, index) => ({
    index,
    source: item.sourceName,
    title: item.title,
    url: item.url,
    published_at: item.publishedAt,
    excerpt: item.excerpt,
  }));

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 8000,
    system: FILTER_PROMPT,
    tools: [
      {
        name: "submit_filtered_items",
        description: "Submit the subset of candidate items worth keeping in today's digest.",
        input_schema: {
          type: "object",
          properties: {
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  url: { type: "string", description: "Must match a candidate item's url exactly." },
                  relevance_score: { type: "integer", minimum: 1, maximum: 10 },
                  lenses: {
                    type: "array",
                    items: { type: "string", enum: LENS_VALUES as unknown as string[] },
                    minItems: 1,
                  },
                  why_it_matters: { type: "string" },
                  potential_use: { type: ["string", "null"] },
                  summary: { type: "string" },
                },
                required: ["url", "relevance_score", "lenses", "why_it_matters", "summary"],
              },
            },
          },
          required: ["items"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_filtered_items" },
    messages: [
      {
        role: "user",
        content: `Candidate items (JSON array):\n\n${JSON.stringify(candidates, null, 2)}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.warn("[filter] no tool_use block in response");
    return [];
  }

  const parsed = SubmitFilteredItemsSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    console.warn(`[filter] response failed schema validation: ${parsed.error.message}`);
    return [];
  }

  const knownUrls = new Set(items.map((i) => i.url));
  return parsed.data.items.filter((item) => {
    const known = knownUrls.has(item.url);
    if (!known) console.warn(`[filter] dropping item with unrecognized url: ${item.url}`);
    return known;
  }) as FilteredItem[];
}
