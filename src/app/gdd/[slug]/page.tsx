import Link from "next/link";
import { notFound } from "next/navigation";
import { BlockList } from "@/components/Blocks";
import { getChapter, getChapters } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [chapter, all] = await Promise.all([getChapter(slug), getChapters()]);
  if (!chapter) notFound();

  const index = all.findIndex((c) => c.slug === slug);
  const previous = index > 0 ? all[index - 1] : null;
  const next = index < all.length - 1 ? all[index + 1] : null;

  return (
    <div>
      <nav className="mono mb-6 flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-igm-muted">
        <Link href="/gdd" className="hover:text-igm-acid">
          GDD
        </Link>
        <span className="text-igm-muted/40">/</span>
        <span className="text-igm-neon">{chapter.code}</span>
      </nav>

      <header className="panel relative overflow-hidden p-7">
        <div className="pitch-lines pointer-events-none absolute inset-0 opacity-30" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag border-igm-acid/40 text-igm-acid">{chapter.category}</span>
            <span className="tag">Chapitre {index + 1} / {all.length}</span>
            <span className="tag">Propriétaire : {chapter.ownerRole}</span>
          </div>
          <h1 className="mt-4 text-2xl font-black leading-tight tracking-tight md:text-[34px]">
            {chapter.title}
          </h1>
          <p className="mt-2 text-[14px] italic text-igm-muted">{chapter.subtitle}</p>
          <p className="mt-4 max-w-4xl text-[14px] leading-relaxed text-igm-muted">
            {chapter.summary}
          </p>
          <div className="mt-5 flex flex-wrap gap-1.5">
            {chapter.keywords.map((k) => (
              <span key={k} className="tag">
                {k}
              </span>
            ))}
          </div>
        </div>
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px]">
        <BlockList blocks={chapter.blocks} />

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <div className="panel-flat p-4">
            <p className="mono text-[10px] uppercase tracking-[0.16em] text-igm-muted">
              Contenu du chapitre
            </p>
            <ul className="mt-3 space-y-2">
              {chapter.blocks.map((b, i) => (
                <li key={b.id} className="text-[12.5px] leading-snug text-igm-muted">
                  <span className="mono mr-2 text-[10px] text-igm-neon/70">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  {b.title}
                </li>
              ))}
            </ul>
          </div>

          <div className="panel-flat p-4">
            <p className="mono text-[10px] uppercase tracking-[0.16em] text-igm-muted">
              Navigation
            </p>
            <div className="mt-3 space-y-3">
              {previous ? (
                <Link
                  href={`/gdd/${previous.slug}`}
                  className="block rounded-lg border border-igm-line/70 p-3 transition hover:border-igm-acid/40"
                >
                  <p className="mono text-[10px] text-igm-muted">← Précédent</p>
                  <p className="mt-1 text-[12.5px] font-semibold text-igm-ink">{previous.title}</p>
                </Link>
              ) : null}
              {next ? (
                <Link
                  href={`/gdd/${next.slug}`}
                  className="block rounded-lg border border-igm-line/70 p-3 transition hover:border-igm-acid/40"
                >
                  <p className="mono text-[10px] text-igm-muted">Suivant →</p>
                  <p className="mt-1 text-[12.5px] font-semibold text-igm-ink">{next.title}</p>
                </Link>
              ) : null}
            </div>
          </div>

          <div className="panel-flat p-4">
            <p className="mono text-[10px] uppercase tracking-[0.16em] text-igm-muted">
              Sommaire complet
            </p>
            <ul className="mt-3 space-y-1.5">
              {all.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/gdd/${c.slug}`}
                    className={`flex items-center gap-2 text-[12px] transition hover:text-igm-acid ${
                      c.slug === slug ? "text-igm-acid" : "text-igm-muted"
                    }`}
                  >
                    <span className="mono text-[10px] text-igm-muted/60">{c.code}</span>
                    <span className="truncate">{c.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
