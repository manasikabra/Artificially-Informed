import Link from "next/link";
import { LENSES, getLatestEdition, formatEditionDate } from "@/lib/editions";
import ThemeToggle from "./ThemeToggle";

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ verticalAlign: -2 }}>
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export default function Nav() {
  const latest = getLatestEdition();

  return (
    <header style={{ borderBottom: "1px solid var(--border)" }}>
      <div className="container" style={{ position: "relative", padding: "32px 20px 16px", textAlign: "center" }}>
        <div style={{ position: "absolute", top: 4, right: 20 }}>
          <ThemeToggle />
        </div>
        <Link href="/" style={{ textDecoration: "none" }}>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "44px",
              fontWeight: 600,
              margin: 0,
              letterSpacing: "-0.01em",
              color: "var(--text)",
            }}
          >
            Artificially
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "26px", fontWeight: 500, color: "var(--accent)" }}>
              .informed
            </span>
          </h1>
        </Link>
        <p
          style={{
            fontFamily: "var(--font-serif)",
            fontStyle: "italic",
            color: "var(--text-muted)",
            margin: "8px 0 0",
            fontSize: "14px",
          }}
        >
          A daily brief on what's worth knowing in AI.
        </p>
      </div>

      <div
        className="container"
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "10px 20px",
          borderTop: "1px solid var(--border)",
        }}
      >
        <span className="meta">{latest ? formatEditionDate(latest.date) : ""}</span>
        <span className="meta" style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {latest && <span>No. {String(latest.number).padStart(3, "0")}</span>}
          <Link href="/archive" style={{ textDecoration: "none", color: "inherit" }}>
            Archive
          </Link>
          <Link href="/search" style={{ textDecoration: "none", color: "inherit" }} aria-label="Search">
            <SearchIcon />
          </Link>
        </span>
      </div>

      <nav
        className="container"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: 22,
          flexWrap: "wrap",
          padding: "12px 20px",
          borderTop: "1px solid var(--border)",
        }}
      >
        {LENSES.map((lens) => (
          <Link
            key={lens.slug}
            href={`/topic/${lens.slug}`}
            style={{
              textDecoration: "none",
              color: "var(--text)",
              fontFamily: "var(--font-mono)",
              fontSize: "12px",
              fontWeight: 500,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
            }}
          >
            {lens.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
