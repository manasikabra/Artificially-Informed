import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Edition, Story } from "./types.js";

const editionsDir = fileURLToPath(new URL("../data/editions", import.meta.url));

function editionFiles(): string[] {
  if (!existsSync(editionsDir)) return [];
  return readdirSync(editionsDir).filter((f) => f.endsWith(".json"));
}

function nextEditionNumber(): number {
  const files = editionFiles();
  if (files.length === 0) return 1;
  const numbers = files.map((f) => Number.parseInt(f.slice(0, 3), 10)).filter((n) => !Number.isNaN(n));
  return Math.max(0, ...numbers) + 1;
}

function existingSlugs(): Set<string> {
  const slugs = new Set<string>();
  for (const file of editionFiles()) {
    const edition = JSON.parse(readFileSync(`${editionsDir}/${file}`, "utf-8")) as Edition;
    for (const story of edition.stories) slugs.add(story.slug);
  }
  return slugs;
}

// Story slugs are generated per-item by the write step and only checked for
// uniqueness within that step's own batch, so the same underlying story
// covered on two different days (or a coincidentally similar headline) can
// collide with an already-published slug. Slugs are the routing key for
// /stories/[slug], so collisions must be resolved before writing an edition.
function dedupeSlugs(stories: Story[]): Story[] {
  const taken = existingSlugs();
  return stories.map((story) => {
    if (!taken.has(story.slug)) {
      taken.add(story.slug);
      return story;
    }
    let suffix = 2;
    let candidate = `${story.slug}-${suffix}`;
    while (taken.has(candidate)) {
      suffix += 1;
      candidate = `${story.slug}-${suffix}`;
    }
    taken.add(candidate);
    return { ...story, slug: candidate };
  });
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

export function assembleEdition(stories: Story[], date: string): Edition {
  const sorted = [...stories].sort((a, b) => b.relevance_score - a.relevance_score);
  return { number: nextEditionNumber(), date, stories: dedupeSlugs(sorted) };
}

export function writeEdition(edition: Edition): string {
  mkdirSync(editionsDir, { recursive: true });
  const filename = `${pad(edition.number, 3)}-${edition.date}.json`;
  const filePath = `${editionsDir}/${filename}`;
  writeFileSync(filePath, JSON.stringify(edition, null, 2) + "\n", "utf-8");
  return filePath;
}
