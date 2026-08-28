import Parser from "rss-parser";
import * as cheerio from "cheerio";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";
import { sources, type Source } from "./sources.js";
import type { RawItem } from "./types.js";
import { mapWithConcurrency } from "./concurrency.js";

const SCRAPE_CONCURRENCY = 5;

const REQUEST_TIMEOUT_MS = 15_000;

const rssParser = new Parser({
  headers: { "User-Agent": "Mozilla/5.0 (compatible; ArtificiallyInformedBot/0.1)" },
  timeout: REQUEST_TIMEOUT_MS,
});

const HOURS_LOOKBACK = 48;

function timeoutSignal(): AbortSignal {
  return AbortSignal.timeout(REQUEST_TIMEOUT_MS);
}

function isRecent(isoDate: string | null): boolean {
  if (!isoDate) return true; // keep undated items, let dedupe/state handle repeats
  const published = new Date(isoDate).getTime();
  if (Number.isNaN(published)) return true;
  return Date.now() - published < HOURS_LOOKBACK * 60 * 60 * 1000;
}

async function fetchRss(source: Extract<Source, { type: "rss" }>): Promise<RawItem[]> {
  try {
    const feed = await rssParser.parseURL(source.feedUrl);
    return (feed.items ?? [])
      .filter((item) => isRecent(item.isoDate ?? null))
      .map((item) => ({
        sourceId: source.id,
        sourceName: source.name,
        title: item.title?.trim() ?? "(untitled)",
        url: item.link?.trim() ?? "",
        publishedAt: item.isoDate ?? null,
        excerpt: (item.contentSnippet ?? item.content ?? "").slice(0, 600).trim(),
      }))
      .filter((item) => item.url);
  } catch (err) {
    console.warn(`[fetch] RSS failed for ${source.id}: ${(err as Error).message}`);
    return [];
  }
}

async function fetchScrape(source: Extract<Source, { type: "scrape" }>): Promise<RawItem[]> {
  try {
    const res = await fetch(source.listUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArtificiallyInformedBot/0.1)" },
      signal: timeoutSignal(),
    });
    if (!res.ok) {
      console.warn(`[fetch] scrape list failed for ${source.id}: HTTP ${res.status}`);
      return [];
    }
    const html = await res.text();
    const $ = cheerio.load(html);

    const links = new Set<string>();
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")?.trim();
      if (href && source.linkPattern.test(href)) {
        links.add(new URL(href, source.baseUrl).toString());
      }
    });

    const urls = Array.from(links).slice(0, source.maxItems);
    return mapWithConcurrency(urls, SCRAPE_CONCURRENCY, async (url): Promise<RawItem> => {
      const article = await fetchArticleText(url);
      return {
        sourceId: source.id,
        sourceName: source.name,
        title: article?.title ?? url,
        url,
        publishedAt: null,
        excerpt: (article?.excerpt ?? "").slice(0, 600),
        fullText: article?.fullText,
      };
    });
  } catch (err) {
    console.warn(`[fetch] scrape failed for ${source.id}: ${(err as Error).message}`);
    return [];
  }
}

export interface ArticleText {
  title: string;
  excerpt: string;
  fullText: string;
}

export async function fetchArticleText(url: string): Promise<ArticleText | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; ArtificiallyInformedBot/0.1)" },
      signal: timeoutSignal(),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const dom = new JSDOM(html, { url });
    const reader = new Readability(dom.window.document);
    const parsed = reader.parse();
    if (!parsed) return null;
    const fullText = (parsed.textContent ?? "").trim();
    return {
      title: parsed.title?.trim() ?? url,
      excerpt: fullText.slice(0, 600),
      fullText,
    };
  } catch (err) {
    console.warn(`[fetch] article extraction failed for ${url}: ${(err as Error).message}`);
    return null;
  }
}

async function fetchOne(source: Source): Promise<RawItem[]> {
  const items =
    source.type === "rss"
      ? await fetchRss(source)
      : source.type === "scrape"
        ? await fetchScrape(source)
        : (console.warn(`[fetch] skipping ${source.id}: client-rendered listing, no scraper yet (see README)`), []);
  console.log(`[fetch] ${source.id}: ${items.length} item(s)`);
  return items;
}

export async function fetchAllSources(): Promise<RawItem[]> {
  const results = await Promise.all(sources.map(fetchOne));
  return results.flat();
}

// Allows `npm run fetch:test` to sanity-check source connectivity in isolation.
if (import.meta.url === `file://${process.argv[1]}`) {
  const items = await fetchAllSources();
  console.log(`Fetched ${items.length} items total`);
  for (const item of items) {
    console.log(`- [${item.sourceName}] ${item.title} (${item.url})`);
  }
}
