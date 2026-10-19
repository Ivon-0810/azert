import { SectionTitle } from "@/components/Blocks";
import { getPerfBudgets, getRoadmap, getSpecEntities, getWorldStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

const SEVERITY_COLOR: Record<string, string> = {
  Bloquant: "border-igm-rose/50 text-igm-rose",
  Majeur: "border-igm-amber/50 text-igm-amber",
  Mineur: "border-igm-neon/50 text-igm-neon",
};

export default async function DataPage() {
  const [entities, roadmap, budgets, stats] = await Promise.all([
    getSpecEntities(),
    getRoadmap(),
    getPerfBudgets(),
    getWorldStats(),
  ]);

  const totalColumns = entities.reduce((s, e) => s + e.columnCount, 0);

  return (
    <div>
      <SectionTitle
        eyebrow="DB-03 · Big Data & graphe"
        title="Architecture de la base de données graphe"
        description="IGM Manager embarque un moteur de stockage colonnaire orienté relations, sans dépendance externe : nœuds (Person, Club, Competition, Match, Contract), arêtes stockées en CSR compressé, attributs sérialisés sur 8 bits et masque de connaissance sur 6 bits. Objectif : 520 000 personnes chargées en moins de 4 secondes et requêtes de scouting sous 25 ms."
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {[
          { label: "Domaines modélisés", value: String(entities.length) },
          { label: "Colonnes cible", value: String(totalColumns) },
          { label: "Lignes prototype", value: String(stats.players + stats.teams) },
          { label: "Matchs stockés", value: String(stats.matches) },
          { label: "Évènements", value: String(stats.events) },
          { label: "Budget mémoire", value: "≤ 1,9 Go" },
        ].map((m) => (
          <div key={m.label} className="panel-flat p-4">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">{m.label}</p>
            <p className="mono mt-1.5 text-lg font-bold text-igm-ink">{m.value}</p>
          </div>
        ))}
      </div>

      <section className="mt-10 space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-igm-ink">
          Entités et relations
        </h2>
        {entities.map((e) => (
          <div key={e.id} className="panel p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="tag border-igm-acid/40 text-igm-acid">{e.domain}</span>
                  <span className="mono text-[11px] text-igm-neon">{e.tableName}</span>
                </div>
                <h3 className="mt-2 text-[16px] font-bold text-igm-ink">{e.name}</h3>
                <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-igm-muted">
                  {e.purpose}
                </p>
              </div>
              <div className="flex gap-2">
                <div className="rounded-lg border border-igm-line bg-igm-void/60 px-3 py-2 text-center">
                  <p className="mono text-[9px] uppercase tracking-[0.1em] text-igm-muted">Volumétrie</p>
                  <p className="mono text-[13px] font-bold text-igm-ink">{e.targetRows}</p>
                </div>
                <div className="rounded-lg border border-igm-line bg-igm-void/60 px-3 py-2 text-center">
                  <p className="mono text-[9px] uppercase tracking-[0.1em] text-igm-muted">Colonnes</p>
                  <p className="mono text-[13px] font-bold text-igm-ink">{e.columnCount}</p>
                </div>
                <div className="rounded-lg border border-igm-line bg-igm-void/60 px-3 py-2 text-center">
                  <p className="mono text-[9px] uppercase tracking-[0.1em] text-igm-muted">Stockage</p>
                  <p className="mono text-[11px] font-bold text-igm-ink">{e.storage}</p>
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
              <div className="overflow-x-auto rounded-lg border border-igm-line">
                <table className="w-full min-w-[420px] text-left text-[12px]">
                  <thead>
                    <tr className="border-b border-igm-line text-[9.5px] uppercase tracking-[0.1em] text-igm-muted">
                      <th className="px-3 py-2">Champ</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {e.fields.map((f, i) => (
                      <tr key={f.name} className={i % 2 === 0 ? "bg-igm-void/40" : ""}>
                        <td className="mono px-3 py-1.5 text-igm-ink">{f.name}</td>
                        <td className="mono px-3 py-1.5 text-igm-neon">{f.type}</td>
                        <td className="px-3 py-1.5 text-igm-muted">{f.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="space-y-3">
                <div className="rounded-lg border border-igm-line bg-igm-void/40 p-3">
                  <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-igm-muted">
                    Index
                  </p>
                  <ul className="mono mt-2 space-y-1 text-[11px] text-igm-acid/90">
                    {e.indexes.map((i) => (
                      <li key={i}>{i}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-igm-line bg-igm-void/40 p-3">
                  <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-igm-muted">
                    Arêtes du graphe
                  </p>
                  <ul className="mono mt-2 space-y-1 text-[11px] text-igm-neon/90">
                    {e.relations.map((r) => (
                      <li key={r}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-igm-ink">
          Budgets de performance
        </h2>
        <div className="panel overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13px]">
            <thead>
              <tr className="border-b border-igm-line text-[10px] uppercase tracking-[0.12em] text-igm-muted">
                <th className="px-4 py-3">Métrique</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Outil de mesure</th>
                <th className="px-4 py-3">Sévérité</th>
                <th className="px-4 py-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id} className="border-b border-igm-line/40 last:border-0">
                  <td className="px-4 py-3 text-igm-ink">{b.metric}</td>
                  <td className="mono px-4 py-3 text-igm-acid">{b.budget}</td>
                  <td className="px-4 py-3 text-igm-muted">{b.tooling}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`tag border ${SEVERITY_COLOR[b.severity] ?? "border-igm-line text-igm-muted"}`}
                    >
                      {b.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[12px] text-igm-muted">{b.notes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-igm-ink">
          Roadmap de production
        </h2>
        <div className="space-y-3">
          {roadmap.map((r) => (
            <div key={r.id} className="panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="tag border-igm-neon/40 text-igm-neon">{r.phase}</span>
                  <span className="mono text-[11px] text-igm-muted">{r.window}</span>
                </div>
                <span className="mono text-[11px] text-igm-acid">{r.progress} %</span>
              </div>
              <h3 className="mt-3 text-[15px] font-bold text-igm-ink">{r.title}</h3>
              <p className="mt-1.5 max-w-4xl text-[13px] leading-relaxed text-igm-muted">{r.focus}</p>

              <div className="mt-4 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
                <div>
                  <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-igm-muted">
                    Livrables
                  </p>
                  <ul className="mt-2 space-y-1.5">
                    {r.deliverables.map((d) => (
                      <li key={d} className="flex gap-2 text-[12.5px] text-igm-muted">
                        <span className="text-igm-acid">▸</span>
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-igm-line bg-igm-void/50 p-3">
                  <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-igm-muted">
                    Critères de sortie
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-igm-muted">
                    {r.exitCriteria}
                  </p>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-igm-void">
                    <div
                      className="h-full bg-gradient-to-r from-igm-neon to-igm-acid"
                      style={{ width: `${r.progress}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
