import { MatchLab, type LabTeam } from "@/components/MatchLab";
import { SectionTitle } from "@/components/Blocks";
import { getEngineMetrics, getAllSquads, getRecentMatches } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function EnginePage() {
  const [squads, recent, metrics] = await Promise.all([
    getAllSquads(),
    getRecentMatches(10),
    getEngineMetrics(),
  ]);

  const labTeams: LabTeam[] = squads.map((t) => {
    const avg = t.squad.length
      ? Math.round(t.squad.reduce((s, p) => s + p.currentAbility, 0) / t.squad.length)
      : 0;
    return {
      id: t.id,
      name: t.name,
      shortName: t.shortName,
      colour: t.colour,
      reputation: t.reputation,
      formation: t.baseFormation,
      tempo: t.tempo,
      pressing: t.pressing,
      width: t.width,
      mentality: t.mentality,
      defensiveLine: t.defensiveLine,
      routineOffensive: t.routineOffensive,
      routineDefensive: t.routineDefensive,
      squadSize: t.squad.length,
      avgAbility: avg,
    };
  });

  return (
    <div>
      <SectionTitle
        eyebrow="ME-02 · Tranche fonctionnelle"
        title="Match Engine — prototype jouable"
        description="Cette page exécute une version opérationnelle de la logique du moteur décrite au chapitre ME-02 : évaluation des secteurs par attributs et moral, pondération tactique (mentalité, tempo, pressing, largeur, ligne défensive), duels de possession minute par minute, création d'occasions par phase, modèle xG par type de tir, fatigue et remplacements, cartons, blessures et routines de coups de pied arrêtés. Chaque match est persisté en PostgreSQL avec son journal d'évènements horodaté."
      />

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          { label: "Boucle logique", value: "90 + arrêts", hint: "1 tick = 1 minute de jeu" },
          { label: "Phases modélisées", value: "12", hint: "Placée, contre, CPA, touche…" },
          { label: "Sorties par match", value: "13 statistiques", hint: "xG, PPDA, duels…" },
          { label: "Déterminisme", value: "Graine 128 bits", hint: "Rejeu strict à l'identique" },
        ].map((m) => (
          <div key={m.label} className="panel-flat p-4">
            <p className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">{m.label}</p>
            <p className="mono mt-1.5 text-lg font-bold text-igm-ink">{m.value}</p>
            <p className="mt-1 text-[11px] text-igm-muted/70">{m.hint}</p>
          </div>
        ))}
      </div>

      <MatchLab teams={labTeams} />

      <section className="mt-10">
        <SectionTitle
          eyebrow="Persistance"
          title="Historique des simulations"
          description={`Toutes les simulations sont écrites en base et rejouables par leur graine. ${metrics.sims} match(s) enregistré(s), ${metrics.goals} but(s) marqué(s).`}
        />

        {recent.length === 0 ? (
          <div className="panel p-6 text-[13px] text-igm-muted">
            Aucun match enregistré pour l&apos;instant. Lancez une simulation ci-dessus : le résultat,
            les tactiques utilisées et le journal des évènements seront persistés.
          </div>
        ) : (
          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[860px] text-left text-[13px]">
              <thead>
                <tr className="border-b border-igm-line text-[10px] uppercase tracking-[0.12em] text-igm-muted">
                  <th className="px-4 py-3">Match</th>
                  <th className="px-4 py-3 text-center">Score</th>
                  <th className="px-4 py-3 text-right">xG</th>
                  <th className="px-4 py-3 text-right">Poss.</th>
                  <th className="px-4 py-3 text-right">Tirs</th>
                  <th className="px-4 py-3 text-right">Cadrés</th>
                  <th className="px-4 py-3">Graine</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((m) => (
                  <tr key={m.id} className="border-b border-igm-line/40 last:border-0">
                    <td className="px-4 py-2.5">
                      <span className="text-igm-ink">{m.homeName}</span>
                      <span className="text-igm-muted"> vs </span>
                      <span className="text-igm-ink">{m.awayName}</span>
                    </td>
                    <td className="mono px-4 py-2.5 text-center font-bold text-igm-acid">
                      {m.homeGoals} - {m.awayGoals}
                    </td>
                    <td className="mono px-4 py-2.5 text-right text-igm-muted">
                      {m.homeXg.toFixed(1)} - {m.awayXg.toFixed(1)}
                    </td>
                    <td className="mono px-4 py-2.5 text-right text-igm-muted">
                      {m.possessionHome.toFixed(0)} %
                    </td>
                    <td className="mono px-4 py-2.5 text-right text-igm-muted">
                      {m.homeShots} - {m.awayShots}
                    </td>
                    <td className="mono px-4 py-2.5 text-right text-igm-muted">
                      {m.homeOnTarget} - {m.awayOnTarget}
                    </td>
                    <td className="mono px-4 py-2.5 text-[11px] text-igm-muted/70">{m.seed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
