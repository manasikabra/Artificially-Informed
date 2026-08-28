"use client";

import { useMemo, useState } from "react";
import StoryCard from "./StoryCard";
import type { Story } from "@/lib/types";

export interface SearchableStory {
  story: Story;
  editionDate: string;
}

export default function SearchClient({ items }: { items: SearchableStory[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return items
      .filter(({ story }) => {
        const haystack = `${story.headline} ${story.dek} ${story.summary}`.toLowerCase();
        return haystack.includes(q);
      })
      .slice(0, 30);
  }, [query, items]);

  return (
    <div>
      <input
        type="search"
        autoFocus
        placeholder="Search stories..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          padding: "12px 14px",
          fontSize: "16px",
          border: "1px solid var(--border)",
          borderRadius: 6,
          background: "var(--bg-elevated)",
          color: "var(--text)",
          marginBottom: 28,
        }}
      />
      {query.trim() && results.length === 0 && <p style={{ color: "var(--text-muted)" }}>No matches.</p>}
      {results.map(({ story, editionDate }) => (
        <StoryCard key={story.slug} story={story} meta={editionDate} />
      ))}
    </div>
  );
}
