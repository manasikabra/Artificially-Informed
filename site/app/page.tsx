import Link from "next/link";
import { getLatestEdition } from "@/lib/editions";
import StoryCard from "@/components/StoryCard";

export default function HomePage() {
  const edition = getLatestEdition();

  if (!edition || edition.stories.length === 0) {
    return <p>No editions published yet.</p>;
  }

  const [lead, ...others] = edition.stories;
  const rightStack = others.slice(0, 2);
  const row2 = others.slice(2, 5);
  const remaining = others.slice(5);

  return (
    <div>
      {/* Hero: lead story + stacked pair */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: rightStack.length ? "1.1fr 1fr" : "1fr",
          gap: "0 40px",
          paddingBottom: 24,
          borderBottom: "1px solid var(--border)",
          marginBottom: 24,
        }}
      >
        <StoryCard story={lead} size="large" bordered={false} />
        {rightStack.length > 0 && (
          <div>
            {rightStack.map((story, i) => (
              <StoryCard key={story.slug} story={story} bordered={i < rightStack.length - 1} />
            ))}
          </div>
        )}
      </div>

      {/* Three-column strip */}
      {row2.length > 0 && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${row2.length}, 1fr)`,
            gap: 0,
            paddingBottom: 8,
            borderBottom: remaining.length ? "1px solid var(--border)" : undefined,
            marginBottom: remaining.length ? 32 : 0,
          }}
        >
          {row2.map((story, i) => (
            <div key={story.slug} style={{ borderLeft: i > 0 ? "1px solid var(--border)" : undefined, padding: i > 0 ? "0 24px" : "0 24px 0 0" }}>
              <StoryCard story={story} size="compact" bordered={false} />
            </div>
          ))}
        </div>
      )}

      {/* Remaining stories */}
      {remaining.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0 32px" }}>
          {remaining.map((story) => (
            <StoryCard key={story.slug} story={story} />
          ))}
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: 24 }}>
        <Link href={`/edition/${edition.number}`} className="meta" style={{ textDecoration: "underline" }}>
          View full edition ({edition.stories.length} stories)
        </Link>
      </div>
    </div>
  );
}
