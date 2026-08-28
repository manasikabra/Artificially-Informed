# Pipeline (Milestone 1)

Fetches your 14 sources, filters with your curation prompt, writes structured
stories, and assembles a numbered daily edition JSON file under `data/editions/`.

## Setup

```bash
cd pipeline
npm install
cp .env.example .env   # then fill in ANTHROPIC_API_KEY
npm run run
```

`npm run fetch:test` runs only the fetch stage and prints what it found, useful
for checking source connectivity without spending API calls.

## State

`state/seen_urls.json` tracks every URL the pipeline has already evaluated
(kept or rejected), so re-running the pipeline doesn't re-surface yesterday's
items. Delete it if you ever want a clean slate.

## Pipeline stages

`fetch` → `filter` (your curation prompt) → `cluster` (merges same-story
coverage from multiple outlets into one entry with multiple sources, like
newspaper.fyi's "Go deeper" links) → `write` (produces the final story JSON)
→ `assemble` (bundles into a numbered edition).

## Known gaps (by design, for v1)

- **AI4Bharat** (`ai4bharat.iitm.ac.in/blog`) renders its post list client-side
  (Next.js), so it can't be scraped with a plain HTTP GET. It's wired into
  `sources.ts` as `type: "scrape-js"` and currently returns nothing. Fix later
  with a headless-browser fetch, or just check it manually — it updates
  infrequently.
- **Scrape sources have no reliable published date** (Anthropic News, Sarvam,
  IndiaAI), so recency filtering for those relies entirely on `seen_urls.json`
  rather than a lookback window.
