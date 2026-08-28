export interface RawItem {
  sourceId: string;
  sourceName: string;
  title: string;
  url: string;
  publishedAt: string | null; // ISO string if known
  excerpt: string; // short text snippet used for the filter pass
  fullText?: string; // populated during fetch for scrape sources, reused by the write pass
}

export type Lens = "industry-usecases" | "l-and-d" | "ai-education" | "india-ecosystem";

export interface FilteredItem {
  url: string; // matches RawItem.url, used to join back to FullItem
  relevance_score: number; // 1-10
  lenses: Lens[];
  why_it_matters: string;
  potential_use: string | null;
  summary: string;
}

export interface Story {
  slug: string;
  primary_lens: Lens;
  lenses: Lens[];
  relevance_score: number;
  headline: string;
  dek: string;
  summary: string;
  why_it_matters: string;
  potential_use: string | null;
  sources: { title: string; publisher: string; url: string }[];
}

export interface Edition {
  number: number;
  date: string; // YYYY-MM-DD
  stories: Story[];
}
