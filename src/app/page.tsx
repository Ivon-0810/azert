import Link from "next/link";
import { BlockList, Metric, SectionTitle } from "@/components/Blocks";
import { getChapters, getEngineMetrics, getWorldStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

const PILLARS = [
  {
    id: "P1",
    title: "Causalité totale",
    text: "Chaque résultat découle d'une chaîne de règles traçable : tactique → exécution → xG → résultat → moral → vestiaire → performance.",
  },
  {
    id: "P2",
    title: "Profondeur sans friction",
    text: "Tout module complexe est délégable à un Directeur Sportif automatique, sans jamais masquer la causalité des évènements.",
  },
  {
    id: "P3",
    title: "Monde vivant persistant",
    text: "118 ligues, 2 300 clubs, 520 000 personnes simulées à des niveaux de fidélité différenciés (LOD 0 → 3).",
  },
  {
    id: "P4",
    title: "Transparence progressive",
    text: "Le scouting approxime mais n'invente jamais : le masquage d'attributs est une marge d'erreur, pas un mensonge.",
  },
  {
    id: "P5",
    title: "Répétabilité & équité",
    text: "Moteur déterministe par graine. Une même situation produit exactement le même déroulé : exigence e-sport et de débogage.",
  },
];

const CIBLES = [
  { metric: "Buts / match (domicile)", cible: "1,52", reel: "Référence Europe TOP-5 (moyenne 2024-2026)" },
  { metric: "Buts / match (extérieur)", cible: "1,19", reel: "Avantage du terrain modélisé à +5,5 %" },
  { metric: "xG total / match", cible: "2,55", reel: "Calibrage sur 4,2 M de tirs simulés" },
  { metric: "Possession médiane", cible: "52 / 48 %", reel: "Dérive liée au rapport de forces au milieu" },
];

export default async function HomePage() {
  const [chapters, stats, metrics] = await Promise.all([
    getChapters(),
    getWorldStats(),
    getEngineMetrics(),
  ]);

  const chapter = chapters.find((c) => c.slug === "vision-produit");

  return (
    <div>
      <section className="panel relative overflow-hidden p-8 md:p-10">
        <div className="pitch-lines pointer-events-none absolute inset-0 opacity-40" />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <span className="tag border-igm-acid/40 text-igm-acid">Game Design Document</span>
            <span className="tag">Architecture technique</span>
            <span className="tag">Prototype moteur jouable</span>
            <span className="tag border-igm-amber/40 text-igm-amber">v1.4</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-4xl font-black leading-[1.05] tracking-tight md:text-6xl">
            IGM MANAGER
            <span className="block text-igm-acid">Simulation de gestion football totale</span>
          </h1>
          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-igm-muted">
            Reproduction intégrale de l&apos;expérience de référence du genre : moteur de match temps
            réel à 60 FPS, base de données graphe de plus de 500 000 personnes simulées en
            multithread, tactiques et rôles modernes, créateur de coups de pied arrêtés, scouting avec
            masquage d&apos;attributs, vestiaire et hiérarchie sociale, centre médical et charge de
            travail, Data Hub xG/xA, gouvernance de club et écosystème médiatique — le tout compilé
            en application Windows signée via GitHub Actions.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link
              href="/engine"
              className="glow-acid rounded-lg bg-igm-acid px-5 py-2.5 text-sm font-bold text-igm-void transition hover:brightness-110"
            >
              ▶ Lancer le prototype du Match Engine
            </Link>
            <Link
              href="/gdd"
              className="rounded-lg border border-igm-line bg-igm-panel2 px-5 py-2.5 text-sm font-semibold text-igm-ink transition hover:border-igm-neon/50"
            >
              Parcourir les 14 chapitres
            </Link>
            <Link
              href="/pipeline"
              className="rounded-lg border border-igm-line bg-igm-panel2 px-5 py-2.5 text-sm font-semibold text-igm-ink transition hover:border-igm-neon/50"
            >
              Pipeline .exe (CI/CD)
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <Metric label="Chapitres GDD" value={String(stats.chapters)} hint="Vision → production" />
        <Metric label="Blocs rédactionnels" value={String(stats.blocks)} hint="Specs, algos, tables" />
        <Metric
          label="Clubs prototype"
          value={String(stats.teams)}
          hint="IGM Super League (tranche LOD 0)"
        />
        <Metric
          label="Joueurs générés"
          value={String(stats.players)}
          hint="Newgens déterministes"
        />
        <Metric label="Matchs simulés" value={String(metrics.sims)} hint="Persistés en PostgreSQL" />
        <Metric label="Évènements stockés" value={String(stats.events)} hint="Journal horodaté" />
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <SectionTitle
            eyebrow="Fondations"
            title="Les cinq piliers de design"
            description="Toute décision de conception est rattachée à l'un de ces piliers. Une proposition qui ne sert aucun pilier est refusée en revue."
          />
          <div className="space-y-3">
            {PILLARS.map((p) => (
              <div key={p.id} className="panel flex gap-4 p-4">
                <span className="mono grid h-9 w-9 shrink-0 place-items-center rounded-md border border-igm-acid/40 bg-igm-acid/10 text-xs font-bold text-igm-acid">
                  {p.id}
                </span>
                <div>
                  <h3 className="text-[14px] font-bold text-igm-ink">{p.title}</h3>
                  <p className="mt-1 text-[13px] leading-relaxed text-igm-muted">{p.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <SectionTitle
            eyebrow="Cibles d'équilibrage"
            title="Calibration du moteur"
            description="Le moteur de la tranche prototype est comparé en continu aux cibles statistiques du football européen professionnel."
          />
          <div className="panel p-5">
            <table className="w-full text-left text-[13px]">
              <thead>
                <tr className="border-b border-igm-line">
                  <th className="pb-2 font-semibold text-igm-muted">Indicateur</th>
                  <th className="pb-2 text-right font-semibold text-igm-muted">Cible</th>
                </tr>
              </thead>
              <tbody>
                {CIBLES.map((c) => (
                  <tr key={c.metric} className="border-b border-igm-line/60 last:border-0">
                    <td className="py-2.5">
                      <p className="text-igm-ink">{c.metric}</p>
                      <p className="text-[11px] text-igm-muted/70">{c.reel}</p>
                    </td>
                    <td className="mono py-2.5 text-right font-bold text-igm-acid">{c.cible}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="mt-5 rounded-lg border border-igm-line bg-igm-void/60 p-4">
              <p className="mono text-[10px] uppercase tracking-[0.16em] text-igm-muted">
                Mesure live (base de données)
              </p>
              <div className="mt-3 grid grid-cols-2 gap-4 text-[13px]">
                <div>
                  <p className="text-igm-muted">Domicile</p>
                  <p className="mono text-lg font-bold text-igm-ink">
                    {metrics.avgHomeGoals.toFixed(2)} but/match
                  </p>
                </div>
                <div>
                  <p className="text-igm-muted">Extérieur</p>
                  <p className="mono text-lg font-bold text-igm-ink">
                    {metrics.avgAwayGoals.toFixed(2)} but/match
                  </p>
                </div>
                <div>
                  <p className="text-igm-muted">xG cumulé moyen</p>
                  <p className="mono text-lg font-bold text-igm-ink">{metrics.xg.toFixed(2)}</p>
                </div>
                <div>
                  <p className="text-igm-muted">Buts marqués</p>
                  <p className="mono text-lg font-bold text-igm-ink">{metrics.goals}</p>
                </div>
              </div>
              <p className="mt-4 text-[11px] leading-relaxed text-igm-muted">
                {metrics.sims === 0
                  ? "Aucune simulation enregistrée : lancez le prototype pour alimenter le banc de calibration."
                  : `Échantillon : ${metrics.sims} matchs. Répartition V/N/D à domicile : ${metrics.homeWins}/${metrics.draws}/${metrics.awayWins}.`}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-10">
        <SectionTitle
          eyebrow="Extrait du GDD"
          title={chapter?.title ?? "Vision"}
          description={chapter?.subtitle}
        />
        {chapter ? <BlockList blocks={chapter.blocks} /> : null}
      </section>

      <section className="mt-10">
        <SectionTitle
          eyebrow="Sommaire"
          title="Les 14 chapitres du document de conception"
          description="Chaque chapitre est stocké en base et versionné : rédaction, spécifications, modèles mathématiques et tables de référence."
        />
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {chapters.map((c) => (
            <Link
              key={c.id}
              href={`/gdd/${c.slug}`}
              className="panel group p-4 transition hover:border-igm-acid/40"
            >
              <div className="flex items-center justify-between">
                <span className="mono text-[10px] font-bold uppercase tracking-[0.18em] text-igm-neon">
                  {c.code}
                </span>
                <span className="tag">{c.category}</span>
              </div>
              <h3 className="mt-3 text-[14px] font-bold leading-snug text-igm-ink group-hover:text-igm-acid">
                {c.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-[12.5px] leading-relaxed text-igm-muted">
                {c.summary}
              </p>
              <p className="mono mt-3 text-[10px] uppercase tracking-[0.14em] text-igm-muted/60">
                {c.blocks.length} blocs · {c.ownerRole}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
