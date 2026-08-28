export type Lens = "industry-usecases" | "l-and-d" | "ai-education" | "india-ecosystem";

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

export interface LensMeta {
  slug: Lens;
  label: string;
  description: string;
}

export const LENSES: LensMeta[] = [
  { slug: "industry-usecases", label: "Industry Usecases", description: "What Applicative AI could build, offer, teach, or use." },
  { slug: "ai-education", label: "AI Education", description: "Concepts, capabilities, and developments worth understanding." },
  { slug: "l-and-d", label: "L&D", description: "Workshop demos, case studies, and teaching material." },
  { slug: "india-ecosystem", label: "India Ecosystem", description: "How AI is developing in India." },
];

export function lensLabel(lens: Lens): string {
  return LENSES.find((l) => l.slug === lens)?.label ?? lens;
}
