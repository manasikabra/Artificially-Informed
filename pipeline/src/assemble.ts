import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import type { Edition, Story } from "./types.js";

const editionsDir = fileURLToPath(new URL("../data/editions", import.meta.url));

function nextEditionNumber(): number {
  if (!existsSync(editionsDir)) return 1;
  const files = readdirSync(editionsDir).filter((f) => f.endsWith(".json"));
  if (files.length === 0) return 1;
  const numbers = files.map((f) => Number.parseInt(f.slice(0, 3), 10)).filter((n) => !Number.isNaN(n));
  return Math.max(0, ...numbers) + 1;
}

function pad(n: number, width: number): string {
  return String(n).padStart(width, "0");
}

export function assembleEdition(stories: Story[], date: string): Edition {
  const sorted = [...stories].sort((a, b) => b.relevance_score - a.relevance_score);
  return { number: nextEditionNumber(), date, stories: sorted };
}

export function writeEdition(edition: Edition): string {
  mkdirSync(editionsDir, { recursive: true });
  const filename = `${pad(edition.number, 3)}-${edition.date}.json`;
  const filePath = `${editionsDir}/${filename}`;
  writeFileSync(filePath, JSON.stringify(edition, null, 2) + "\n", "utf-8");
  return filePath;
}
