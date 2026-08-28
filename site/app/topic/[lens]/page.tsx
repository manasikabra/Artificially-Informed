import { notFound } from "next/navigation";
import { LENSES, getStoriesByLens, formatEditionDate, type Lens } from "@/lib/editions";
import StoryCard from "@/components/StoryCard";

export function generateStaticParams() {
  return LENSES.map((lens) => ({ lens: lens.slug }));
}

export default async function TopicPage({ params }: { params: Promise<{ lens: string }> }) {
  const { lens } = await params;
  const meta = LENSES.find((l) => l.slug === lens);
  if (!meta) notFound();

  const items = getStoriesByLens(lens as Lens);

  return (
    <div>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", margin: "0 0 4px" }}>{meta.label}</h1>
      <p style={{ color: "var(--text-muted)", margin: "0 0 32px" }}>{meta.description}</p>

      {items.length === 0 ? (
        <p style={{ color: "var(--text-muted)" }}>No stories yet in this topic.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0 32px" }}>
          {items.map(({ story, edition }) => (
            <StoryCard key={story.slug} story={story} meta={formatEditionDate(edition.date)} />
          ))}
        </div>
      )}
    </div>
  );
}
