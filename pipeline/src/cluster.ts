import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";
import type { FilteredItem } from "./types.js";

const MODEL = process.env.CLAUDE_MODEL ?? "claude-sonnet-5";

const ClustersSchema = z.object({
  clusters: z.array(z.array(z.string())),
});

const CLUSTER_SYSTEM_PROMPT = `You group today's kept digest items by real-world story, not by source.

Two items belong in the same group only if they describe the same underlying
development/announcement/event - e.g. one outlet's original post and another
outlet's coverage of that same post. Items that are merely on a similar topic
or from the same company but describe different developments stay in separate
groups.

You will be given a JSON array of items, each with a url, headline-ish summary,
and why_it_matters. Call the \`submit_clusters\` tool with an array of groups.
Every group is an array of urls (one or more). Every input url must appear in
exactly one group. Most groups will have exactly one url - only group urls
together when you are confident they cover the same story.`;

export async function clusterItems(items: FilteredItem[]): Promise<FilteredItem[][]> {
  if (items.length <= 1) return items.map((item) => [item]);

  const client = new Anthropic();

  const candidates = items.map((item) => ({
    url: item.url,
    summary: item.summary,
    why_it_matters: item.why_it_matters,
  }));

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: CLUSTER_SYSTEM_PROMPT,
    tools: [
      {
        name: "submit_clusters",
        description: "Submit the grouping of items by underlying story.",
        input_schema: {
          type: "object",
          properties: {
            clusters: {
              type: "array",
              items: { type: "array", items: { type: "string" } },
            },
          },
          required: ["clusters"],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_clusters" },
    messages: [
      {
        role: "user",
        content: `Items (JSON array):\n\n${JSON.stringify(candidates, null, 2)}`,
      },
    ],
  });

  const toolUse = message.content.find((block) => block.type === "tool_use");
  const byUrl = new Map(items.map((item) => [item.url, item]));

  if (!toolUse || toolUse.type !== "tool_use") {
    console.warn("[cluster] no tool_use block in response, falling back to no clustering");
    return items.map((item) => [item]);
  }

  const parsed = ClustersSchema.safeParse(toolUse.input);
  if (!parsed.success) {
    console.warn(`[cluster] response failed schema validation, falling back to no clustering: ${parsed.error.message}`);
    return items.map((item) => [item]);
  }

  const seen = new Set<string>();
  const groups: FilteredItem[][] = [];
  for (const urls of parsed.data.clusters) {
    const group = urls.map((url) => byUrl.get(url)).filter((item): item is FilteredItem => Boolean(item));
    if (group.length === 0) continue;
    for (const item of group) seen.add(item.url);
    groups.push(group);
  }

  // Anything the model missed becomes its own singleton group.
  for (const item of items) {
    if (!seen.has(item.url)) groups.push([item]);
  }

  return groups;
}
