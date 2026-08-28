import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import type { Edition, Lens } from "./types";

export type { Lens, Story, Edition, LensMeta } from "./types";
export { LENSES, lensLabel } from "./types";

const EDITIONS_DIR = path.join(process.cwd(), "..", "pipeline", "data", "editions");

let cachedEditions: Edition[] | null = null;

export function getAllEditions(): Edition[] {
  if (cachedEditions) return cachedEditions;
  const files = readdirSync(EDITIONS_DIR).filter((f) => f.endsWith(".json"));
  const editions = files.map((f) => JSON.parse(readFileSync(path.join(EDITIONS_DIR, f), "utf-8")) as Edition);
  editions.sort((a, b) => b.number - a.number);
  cachedEditions = editions;
  return editions;
}

export function getLatestEdition(): Edition | null {
  const editions = getAllEditions();
  return editions[0] ?? null;
}

export function getEditionByNumber(number: number): Edition | null {
  return getAllEditions().find((e) => e.number === number) ?? null;
}

export interface StoryWithEdition {
  story: Edition["stories"][number];
  edition: Pick<Edition, "number" | "date">;
}

export function getAllStoriesFlat(): StoryWithEdition[] {
  const editions = getAllEditions();
  return editions.flatMap((edition) =>
    edition.stories.map((story) => ({ story, edition: { number: edition.number, date: edition.date } })),
  );
}

export function getStoryBySlug(slug: string): StoryWithEdition | null {
  return getAllStoriesFlat().find((item) => item.story.slug === slug) ?? null;
}

export function getStoriesByLens(lens: Lens): StoryWithEdition[] {
  return getAllStoriesFlat().filter((item) => item.story.lenses.includes(lens));
}

export function formatEditionDate(date: string): string {
  return new Date(`${date}T00:00:00+05:30`).toLocaleDateString("en-US", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}
