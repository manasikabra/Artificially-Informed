import Link from "next/link";
import { lensLabel, type Story } from "@/lib/types";

const HEADLINE_SIZE = { large: "30px", regular: "20px", compact: "18px" };
const DEK_SIZE = { large: "16px", regular: "14px", compact: "13px" };

export default function StoryCard({
  story,
  size = "regular",
  meta,
  bordered = true,
}: {
  story: Story;
  size?: "large" | "regular" | "compact";
  meta?: string;
  bordered?: boolean;
}) {
  return (
    <article
      style={
        bordered
          ? { paddingBottom: 20, marginBottom: 20, borderBottom: "1px solid var(--border)" }
          : undefined
      }
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
        <div className="eyebrow">{lensLabel(story.primary_lens)}</div>
        {meta && <div className="meta">{meta}</div>}
      </div>
      <h2 style={{ margin: "6px 0 8px" }}>
        <Link
          href={`/stories/${story.slug}`}
          style={{
            fontFamily: "var(--font-serif)",
            fontWeight: 600,
            fontSize: HEADLINE_SIZE[size],
            lineHeight: 1.2,
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          {story.headline}
        </Link>
      </h2>
      <p style={{ color: "var(--text-muted)", fontSize: DEK_SIZE[size], margin: "0 0 10px", lineHeight: 1.5 }}>
        {story.dek}
      </p>
      <Link href={`/stories/${story.slug}`} className="eyebrow" style={{ textDecoration: "none" }}>
        Read →
      </Link>
    </article>
  );
}
