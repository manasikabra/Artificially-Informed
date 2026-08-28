import Anthropic from "@anthropic-ai/sdk";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { fetchArticleText } from "./fetch.js";
import type { FilteredItem, RawItem, Story } from "./types.js";

const promptPath = fileURLToPath(new URL("../prompts/write_prompt.md", import.meta.url));
const WRITE_PROMPT = readFileSync(promptPath, "utf-8");

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

const StoryDraftSchema = z.object({
  slug: z.string(),
  headline: z.string(),
  dek: z.string(),
  summary: z.string(),
  why_it_matters: z.string(),
  potential_use: z.string().nullable(),
});

export interface GroupMember {
  raw: RawItem;
  filtered: FilteredItem;
}

export async function writeStory(group: GroupMember[]): Promise<Story | null> {
  const client = new Anthropic();

  const articles = await Promise.all(
    group.map(async (member) => {
      const article = await fetchArticleText(member.raw.url);
      return {
        source: member.raw.sourceName,
        url: member.raw.url,
        title: member.raw.title,
        fullText: (article?.fullText ?? member.raw.excerpt).slice(0, 12000),
      };
    }),
  );

  const curatorNotes = group.map((member) => ({
    source: member.raw.sourceName,
    url: member.raw.url,
    relevance_score: member.filtered.relevance_score,
    lenses: member.filtered.lenses,
    why_it_matters: member.filtered.why_it_matters,
    potential_use: member.filtered.potential_use,
    summary: member.filtered.summary,
  }));

  const isMultiSource = group.length > 1;

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: WRITE_PROMPT,
    tools: [
      {
        name: "submit_story",
        description: "Submit the finished digest story.",
        input_schema: {
          type: "object",
          properties: {
            slug: { type: "string" },
            headline: { type: "string" },
            dek: { type: "string" },
            summary: { type: "string" },
            why_it_matters: { type: "string" },
            potential_use: { type: ["string", "null"] },
          },
          required: ["slug", "headline", "dek", "summary", "why_it_matters"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_story" },
    messages: [
      {
        role: "user",
        content: `${
          isMultiSource
            ? `This story is covered by ${group.length} sources describing the same underlying development. Synthesize them into one story; do not write it as ${group.length} separate items.\n\n`
            : ""
        }Source article(s):\n${articles
          .map((a) => `--- ${a.source} (${a.url}) ---\nOriginal title: ${a.title}\n\n${a.fullText}`)
          .join("\n\n")}\n\nCurator's earlier assessment per source:\n${JSON.stringify(curatorNotes, null, 2)}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    console.warn(`[write] no tool_use block for ${group.map((m) => m.raw.url).join(", ")}`);
    return null;
  }

  const parsed = StoryDraftSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    console.warn(`[write] response failed schema validation for ${group.map((m) => m.raw.url).join(", ")}: ${parsed.error.message}`);
    return null;
  }

  const draft = parsed.data;
  const lenses = Array.from(new Set(group.flatMap((m) => m.filtered.lenses)));
  const relevanceScore = Math.max(...group.map((m) => m.filtered.relevance_score));
  const primaryMember = [...group].sort((a, b) => b.filtered.relevance_score - a.filtered.relevance_score)[0];

  return {
    slug: draft.slug,
    primary_lens: primaryMember.filtered.lenses[0],
    lenses,
    relevance_score: relevanceScore,
    headline: draft.headline,
    dek: draft.dek,
    summary: draft.summary,
    why_it_matters: draft.why_it_matters,
    potential_use: draft.potential_use,
    sources: group.map((m) => ({ title: m.raw.title, publisher: m.raw.sourceName, url: m.raw.url })),
  };
}
