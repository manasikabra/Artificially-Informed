import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const statePath = fileURLToPath(new URL("../state/seen_urls.json", import.meta.url));

export function loadSeenUrls(): Set<string> {
  if (!existsSync(statePath)) return new Set();
  try {
    const data = JSON.parse(readFileSync(statePath, "utf-8"));
    return new Set(Array.isArray(data) ? data : []);
  } catch {
    return new Set();
  }
}

export function saveSeenUrls(urls: Set<string>): void {
  mkdirSync(fileURLToPath(new URL("../state", import.meta.url)), { recursive: true });
  writeFileSync(statePath, JSON.stringify(Array.from(urls).sort(), null, 2) + "\n", "utf-8");
}
