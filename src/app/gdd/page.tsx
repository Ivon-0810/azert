import Link from "next/link";
import { GddSearch } from "@/components/GddSearch";
import { SectionTitle } from "@/components/Blocks";
import { getChapters } from "@/lib/queries";

export const dynamic = "force-dynamic";

const KIND_COLORS: Record<string, string> = {
  Produit: "border-igm-neon/40 text-igm-neon",
  Architecture: "border-igm-acid/40 text-igm-acid",
  Moteur: "border-igm-rose/40 text-igm-rose",
  Données: "border-igm-amber/40 text-igm-amber",
  Gameplay: "border-igm-neon/40 text-igm-neon",
  Build: "border-igm-acid/40 text-igm-acid",
  Production: "border-igm-amber/40 text-igm-amber",
};

export default async function GddIndexPage() {
  const chapters = await getChapters();
  const categories = [...new Set(chapters.map((c) => c.category))];
  const blockCount = chapters.reduce((s, c) => s + c.blocks.length, 0);

  return (
    <div>
      <SectionTitle
        eyebrow="Document de conception"
        title="IGM Manager — GDD intégral"
        description={`${chapters.length} chapitres, ${blockCount} blocs rédactionnels : vision produit, architecture logicielle, moteur de match, base de données graphe, mécaniques de jeu, humain, données, gouvernance, build et production.`}
      />

      <GddSearch />

      <div className="mt-8 space-y-10">
        {categories.map((category) => (
          <section key={category}>
            <div className="mb-4 flex items-center gap-3">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-igm-ink">
                {category}
              </h2>
              <span className="h-px flex-1 bg-igm-line" />
              <span className="mono text-[10px] text-igm-muted">
                {chapters.filter((c) => c.category === category).length} chapitre(s)
              </span>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {chapters
                .filter((c) => c.category === category)
                .map((c) => (
                  <Link
                    key={c.id}
                    href={`/gdd/${c.slug}`}
                    className="panel group flex flex-col p-5 transition hover:border-igm-acid/40"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="mono text-[11px] font-bold tracking-[0.18em] text-igm-neon">
                        {c.code}
                      </span>
                      <span
                        className={`tag border ${
                          KIND_COLORS[c.category] ?? "border-igm-line text-igm-muted"
                        }`}
                      >
                        {c.category}
                      </span>
                    </div>
                    <h3 className="mt-3 text-[15px] font-bold leading-snug text-igm-ink group-hover:text-igm-acid">
                      {c.title}
                    </h3>
                    <p className="mt-1 text-[12.5px] italic leading-snug text-igm-muted/80">
                      {c.subtitle}
                    </p>
                    <p className="mt-3 line-clamp-4 text-[13px] leading-relaxed text-igm-muted">
                      {c.summary}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {c.keywords.map((k) => (
                        <span key={k} className="tag">
                          {k}
                        </span>
                      ))}
                    </div>
                    <div className="mono mt-4 flex items-center justify-between border-t border-igm-line pt-3 text-[10px] uppercase tracking-[0.14em] text-igm-muted/70">
                      <span>{c.ownerRole}</span>
                      <span>{c.blocks.length} blocs</span>
                    </div>
                  </Link>
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
