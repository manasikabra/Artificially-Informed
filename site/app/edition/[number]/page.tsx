import { notFound } from "next/navigation";
import { getAllEditions, getEditionByNumber, formatEditionDate } from "@/lib/editions";
import StoryCard from "@/components/StoryCard";

export function generateStaticParams() {
  return getAllEditions().map((edition) => ({ number: String(edition.number) }));
}

export default async function EditionPage({ params }: { params: Promise<{ number: string }> }) {
  const { number } = await params;
  const edition = getEditionByNumber(Number(number));
  if (!edition) notFound();

  const [lead, ...rest] = edition.stories;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          marginBottom: 24,
          flexWrap: "wrap",
          gap: 8,
        }}
      >
        <span className="meta">{formatEditionDate(edition.date)}</span>
        <span className="meta">
          No. {String(edition.number).padStart(3, "0")} · {edition.stories.length} stories
        </span>
      </div>

      {lead && <StoryCard story={lead} size="large" />}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0 32px" }}>
        {rest.map((story) => (
          <StoryCard key={story.slug} story={story} />
        ))}
      </div>
    </div>
  );
}
