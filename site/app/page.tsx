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
  const hasMore = edition.stories.length > 6;

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
          }}
        >
          {row2.map((story, i) => (
            <div key={story.slug} style={{ borderLeft: i > 0 ? "1px solid var(--border)" : undefined, padding: i > 0 ? "0 24px" : "0 24px 0 0" }}>
              <StoryCard story={story} size="compact" bordered={false} />
            </div>
          ))}
        </div>
      )}

      {hasMore && (
        <div style={{ textAlign: "center", marginTop: 24, paddingTop: 24, borderTop: "1px solid var(--border)" }}>
          <Link href={`/edition/${edition.number}`} className="meta" style={{ textDecoration: "underline" }}>
            {edition.stories.length - 6} more stories today — view full edition
          </Link>
        </div>
      )}
    </div>
  );
}
