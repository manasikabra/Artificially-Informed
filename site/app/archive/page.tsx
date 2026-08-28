import Link from "next/link";
import { getAllEditions, formatEditionDate } from "@/lib/editions";

export default function ArchivePage() {
  const editions = getAllEditions();

  return (
    <div style={{ maxWidth: 520, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", textAlign: "center", marginBottom: 32 }}>Archive</h1>
      {editions.map((edition) => (
        <Link
          key={edition.number}
          href={`/edition/${edition.number}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            padding: "14px 0",
            borderBottom: "1px solid var(--border)",
            textDecoration: "none",
            color: "var(--text)",
          }}
        >
          <span style={{ fontFamily: "var(--font-serif)", fontSize: "17px" }}>{formatEditionDate(edition.date)}</span>
          <span className="meta">
            No. {String(edition.number).padStart(3, "0")} · {edition.stories.length} stories
          </span>
        </Link>
      ))}
      <p className="meta" style={{ textAlign: "center", marginTop: 32 }}>
        Curated by Manasi Kabra
      </p>
    </div>
  );
}
