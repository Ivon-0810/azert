import { getChapters } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const q = (url.searchParams.get("q") ?? "").trim().toLowerCase();

  if (q.length < 2) {
    return Response.json({ results: [], query: q });
  }

  const chapters = await getChapters();
  const results: {
    chapterSlug: string;
    chapterTitle: string;
    code: string;
    blockTitle: string;
    kind: string;
    snippet: string;
  }[] = [];

  for (const chapter of chapters) {
    const haystack = `${chapter.title} ${chapter.subtitle} ${chapter.summary} ${chapter.keywords.join(" ")}`.toLowerCase();
    if (haystack.includes(q)) {
      results.push({
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        code: chapter.code,
        blockTitle: chapter.summary.slice(0, 80) + "…",
        kind: "chapter",
        snippet: chapter.summary,
      });
    }

    for (const block of chapter.blocks) {
      const text = [
        block.title,
        block.body ?? "",
        block.items.join(" \n "),
        block.meta.map((m) => `${m.label} ${m.value}`).join(" \n "),
      ]
        .join(" \n ")
        .toLowerCase();
      if (!text.includes(q)) continue;
      const index = text.indexOf(q);
      const snippet = text
        .slice(Math.max(0, index - 90), index + 160)
        .replace(/\s+/g, " ")
        .trim();
      results.push({
        chapterSlug: chapter.slug,
        chapterTitle: chapter.title,
        code: chapter.code,
        blockTitle: block.title,
        kind: block.kind,
        snippet,
      });
    }
  }

  return Response.json({ query: q, results: results.slice(0, 24), total: results.length });
}
