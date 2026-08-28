import "dotenv/config";
import { fetchAllSources } from "./fetch.js";
import { filterItems } from "./filter.js";
import { clusterItems } from "./cluster.js";
import { writeStory, type GroupMember } from "./write.js";
import { assembleEdition, writeEdition } from "./assemble.js";
import { loadSeenUrls, saveSeenUrls } from "./state.js";
import type { Story } from "./types.js";

function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date());
}

async function main() {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error("ANTHROPIC_API_KEY is not set. Copy .env.example to .env and fill it in.");
    process.exit(1);
  }

  console.log("[run] fetching sources...");
  const rawItems = await fetchAllSources();
  console.log(`[run] fetched ${rawItems.length} raw items`);

  const seenUrls = loadSeenUrls();
  const newItems = rawItems.filter((item) => !seenUrls.has(item.url));
  console.log(`[run] ${newItems.length} items are new since last run`);

  if (newItems.length === 0) {
    console.log("[run] nothing new, exiting");
    return;
  }

  console.log("[run] filtering...");
  const filtered = await filterItems(newItems);
  console.log(`[run] kept ${filtered.length} of ${newItems.length} items`);

  console.log("[run] clustering duplicate coverage...");
  const groups = await clusterItems(filtered);
  const multiSourceGroups = groups.filter((g) => g.length > 1).length;
  console.log(`[run] ${filtered.length} items -> ${groups.length} stories (${multiSourceGroups} merged from multiple sources)`);

  const rawByUrl = new Map(newItems.map((item) => [item.url, item]));

  console.log("[run] writing stories...");
  const stories: Story[] = [];
  for (const group of groups) {
    const members: GroupMember[] = group
      .map((filtered) => {
        const raw = rawByUrl.get(filtered.url);
        return raw ? { raw, filtered } : null;
      })
      .filter((m): m is GroupMember => m !== null);
    if (members.length === 0) continue;
    const story = await writeStory(members);
    if (story) {
      stories.push(story);
      console.log(`  wrote: ${story.headline}${members.length > 1 ? ` (${members.length} sources)` : ""}`);
    }
  }

  // Mark every fetched item (kept or not) as seen so rejected items aren't re-evaluated tomorrow.
  for (const item of rawItems) seenUrls.add(item.url);
  saveSeenUrls(seenUrls);

  if (stories.length === 0) {
    console.log("[run] no stories survived the write step, no edition written");
    return;
  }

  const edition = assembleEdition(stories, todayIST());
  const filePath = writeEdition(edition);
  console.log(`[run] wrote edition ${edition.number} (${edition.stories.length} stories) to ${filePath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
