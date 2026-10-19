import { SquadBrowser, type SquadTeam } from "@/components/SquadBrowser";
import { SectionTitle } from "@/components/Blocks";
import { getAllSquads, getWorldStats } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function SquadsPage() {
  const [squads, stats] = await Promise.all([getAllSquads(), getWorldStats()]);

  const teams: SquadTeam[] = squads.map((t) => ({
    id: t.id,
    name: t.name,
    city: t.city,
    country: t.country,
    colour: t.colour,
    formation: t.baseFormation,
    reputation: t.reputation,
    facilities: t.facilities,
    squad: t.squad.map((p) => ({
      id: p.id,
      name: p.name,
      position: p.position,
      role: p.role,
      age: p.age,
      currentAbility: p.currentAbility,
      potentialAbility: p.potentialAbility,
      morale: p.morale,
      sharpness: p.sharpness,
      fitness: p.fitness,
      injuryRisk: p.injuryRisk,
      value: p.value,
      wage: p.wage,
      contractUntil: p.contractUntil,
      attributes: p.attributes ?? {},
    })),
  }));

  return (
    <div>
      <SectionTitle
        eyebrow="FO-08 · Newgens & effectifs"
        title="Base de joueurs générée"
        description={`${stats.players} joueurs générés de façon déterministe (graine par club) selon le pipeline de newgens : répartition par poste, courbe de développement par âge, PA en loi de puissance dépendant du niveau d'académie, personnalité et état médical. Utilisez le curseur de connaissance pour simuler le masquage d'attributs.`}
      />

      <SquadBrowser teams={teams} />

      <section className="mt-10 grid gap-4 lg:grid-cols-3">
        {[
          {
            title: "Courbe de développement",
            body: "ΔCA_annuel = Base(Âge) · QualitéEntraînement · TempsDeJeu^0,35 · PédagogieStaff · (1 − RisqueBlessure) · ModificateurPersonnalité. Base : 15 ans = 7,0 ; 18 ans = 5,2 ; 21 ans = 3,1 ; 24 ans = 1,2 ; ≥ 28 ans = 0.",
          },
          {
            title: "Renouvellement de la population",
            body: "Chaque saison, le système mesure le déficit de population par nation et par tranche d'âge puis génère les newgens manquants : 12 000 joueurs par saison dans le monde complet, identités nationales différenciées.",
          },
          {
            title: "Déclin et retraite",
            body: "Le déclin démarre entre 30 et 34 ans selon le poste, l'historique d'Endurance et les blessures subies. Les retraites libèrent des places dans les effectifs et déclenchent la génération compensatoire.",
          },
        ].map((c) => (
          <div key={c.title} className="panel p-5">
            <h3 className="text-[14px] font-bold text-igm-ink">{c.title}</h3>
            <p className="mono mt-2 whitespace-pre-line text-[11.5px] leading-relaxed text-igm-muted">
              {c.body}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
