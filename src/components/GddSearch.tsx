"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";

type SearchResult = {
  chapterSlug: string;
  chapterTitle: string;
  code: string;
  blockTitle: string;
  kind: string;
  snippet: string;
};

export function GddSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [total, setTotal] = useState(0);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setTotal(0);
      return;
    }
    const handle = setTimeout(() => {
      startTransition(async () => {
        try {
          const res = await fetch(`/api/gdd/search?q=${encodeURIComponent(query.trim())}`);
          const data = (await res.json()) as { results: SearchResult[]; total: number };
          setResults(data.results ?? []);
          setTotal(data.total ?? 0);
        } catch {
          setResults([]);
        }
      });
    }, 220);
    return () => clearTimeout(handle);
  }, [query]);

  return (
    <div className="panel p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <div className="flex flex-1 items-center gap-3 rounded-lg border border-igm-line bg-igm-void/70 px-3 py-2.5">
          <span className="mono text-xs text-igm-neon">/</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher dans les 14 chapitres : pressing, xG, newgen, ACWR, attribute masking, WiX, signature…"
            className="w-full bg-transparent text-[13.5px] text-igm-ink outline-none placeholder:text-igm-muted/60"
          />
          {pending ? <span className="mono text-[10px] text-igm-acid">scan…</span> : null}
        </div>
        <p className="mono text-[10px] uppercase tracking-[0.16em] text-igm-muted">
          {total > 0 ? `${total} correspondance(s)` : "index plein-texte"}
        </p>
      </div>

      {results.length > 0 ? (
        <ul className="mt-4 max-h-[420px] space-y-2 overflow-y-auto">
          {results.map((r, i) => (
            <li key={i}>
              <Link
                href={`/gdd/${r.chapterSlug}`}
                className="block rounded-lg border border-igm-line/70 bg-igm-void/40 p-3 transition hover:border-igm-acid/40"
              >
                <div className="flex items-center gap-2">
                  <span className="mono text-[10px] font-bold text-igm-neon">{r.code}</span>
                  <span className="tag">{r.kind}</span>
                  <span className="truncate text-[11px] text-igm-muted">{r.chapterTitle}</span>
                </div>
                <p className="mt-1.5 text-[13px] font-semibold text-igm-ink">{r.blockTitle}</p>
                <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-igm-muted">
                  …{r.snippet}…
                </p>
              </Link>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
