import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllStoriesFlat, getStoryBySlug, lensLabel, formatEditionDate } from "@/lib/editions";

export function generateStaticParams() {
  return getAllStoriesFlat().map(({ story }) => ({ slug: story.slug }));
}

export default async function StoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const item = getStoryBySlug(slug);
  if (!item) notFound();
  const { story, edition } = item;

  const paragraphs = story.summary.split(/\n\n+/).filter(Boolean);

  return (
    <article style={{ maxWidth: 720, margin: "0 auto" }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
        {story.lenses.map((lens) => (
          <span key={lens} className="eyebrow">
            {lensLabel(lens)}
          </span>
        ))}
      </div>

      <h1
        style={{
          fontFamily: "var(--font-serif)",
          fontWeight: 600,
          fontSize: "40px",
          lineHeight: 1.15,
          margin: "0 0 12px",
        }}
      >
        {story.headline}
      </h1>

      <p style={{ fontFamily: "var(--font-serif)", fontStyle: "italic", fontSize: "19px", color: "var(--text-muted)", margin: "0 0 16px" }}>
        {story.dek}
      </p>

      <div className="meta" style={{ marginBottom: 32 }}>
        Edition of {formatEditionDate(edition.date)} · No. {String(edition.number).padStart(3, "0")}
      </div>

      <div style={{ fontSize: "17px", lineHeight: 1.7 }}>
        {paragraphs.map((p, i) => (
          <p key={i} style={{ margin: "0 0 18px" }}>
            {p}
          </p>
        ))}
      </div>

      <section
        style={{
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 8,
          padding: "18px 20px",
          margin: "24px 0",
        }}
      >
        <div className="eyebrow" style={{ marginBottom: 8 }}>
          Why it matters
        </div>
        <p style={{ margin: 0, lineHeight: 1.6, fontSize: "15px" }}>{story.why_it_matters}</p>
      </section>

      {story.potential_use && (
        <section
          style={{
            background: "var(--accent-soft-bg)",
            border: "1px solid var(--accent-soft-border)",
            borderRadius: 8,
            padding: "18px 20px",
            margin: "24px 0",
          }}
        >
          <div className="eyebrow" style={{ marginBottom: 8 }}>
            Potential use
          </div>
          <p style={{ margin: 0, lineHeight: 1.6, fontSize: "15px" }}>{story.potential_use}</p>
        </section>
      )}

      <section style={{ marginTop: 32 }}>
        <div className="eyebrow" style={{ marginBottom: 10 }}>
          Go deeper
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
          {story.sources.map((source) => (
            <li key={source.url} style={{ marginBottom: 10 }}>
              <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline", fontSize: "15px" }}>
                {source.title}
              </a>
              <div className="meta" style={{ marginTop: 2 }}>
                {source.publisher}
              </div>
            </li>
          ))}
        </ul>
      </section>

      <div style={{ marginTop: 40, borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <Link href={`/edition/${edition.number}`} className="meta" style={{ textDecoration: "none" }}>
          ← Edition No. {String(edition.number).padStart(3, "0")}
        </Link>
        {" · "}
        <Link href="/" className="meta" style={{ textDecoration: "none" }}>
          Home
        </Link>
      </div>
    </article>
  );
}
