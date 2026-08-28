import { getAllStoriesFlat, formatEditionDate } from "@/lib/editions";
import SearchClient from "@/components/SearchClient";

export default function SearchPage() {
  const items = getAllStoriesFlat().map(({ story, edition }) => ({
    story,
    editionDate: formatEditionDate(edition.date),
  }));

  return (
    <div style={{ maxWidth: 640, margin: "0 auto" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", marginBottom: 24 }}>Search</h1>
      <SearchClient items={items} />
    </div>
  );
}
