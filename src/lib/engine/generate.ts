/**
 * Générateur d'effectifs — implémente la tranche « Newgens » (chapitre FO-08)
 * du GDD : génération déterministe depuis une graine, profils nationaux,
 * répartition par poste, attributs corrélés au potentiel.
 */

export const ATTRIBUTE_KEYS = [
  "Finition",
  "Passes",
  "Vision",
  "Dribble",
  "Technique",
  "Tacle",
  "Marquage",
  "Positionnement",
  "Anticipation",
  "Décisions",
  "Concentration",
  "Vitesse",
  "Endurance",
  "Force",
  "Reflexes",
  "Commandement",
  "Leadership",
  "Détermination",
] as const;

export type AttributeKey = (typeof ATTRIBUTE_KEYS)[number];

export const PROTOTYPE_LEAGUE = "IGM Super League";

export type TeamSeed = {
  name: string;
  shortName: string;
  city: string;
  country: string;
  colour: string;
  reputation: number;
  facilities: number;
  formation: string;
  tempo: number;
  pressing: number;
  width: number;
  mentality: number;
  defensiveLine: number;
  routineOffensive: string;
  routineDefensive: string;
  strength: number;
};

export const TEAM_SEEDS: TeamSeed[] = [
  {
    name: "Athletic Vanguardia",
    shortName: "VAN",
    city: "Bilbao-Nord",
    country: "Espagne",
    colour: "#e11d48",
    reputation: 7600,
    facilities: 88,
    formation: "4-2-3-1",
    tempo: 62,
    pressing: 78,
    width: 66,
    mentality: 64,
    defensiveLine: 74,
    routineOffensive: "Centre enroulé au second poteau",
    routineDefensive: "Pression sur le frappeur",
    strength: 1.0,
  },
  {
    name: "Racing Solera",
    shortName: "SOL",
    city: "Marseille-Port",
    country: "France",
    colour: "#38bdf8",
    reputation: 7350,
    facilities: 82,
    formation: "4-3-3",
    tempo: 74,
    pressing: 68,
    width: 58,
    mentality: 68,
    defensiveLine: 66,
    routineOffensive: "Combinaison au corner",
    routineDefensive: "Marquage de zone strict",
    strength: 0.97,
  },
  {
    name: "FC Nordstern",
    shortName: "NOR",
    city: "Hambourg",
    country: "Allemagne",
    colour: "#a3e635",
    reputation: 7200,
    facilities: 86,
    formation: "3-5-2",
    tempo: 58,
    pressing: 82,
    width: 72,
    mentality: 58,
    defensiveLine: 80,
    routineOffensive: "Centre au premier poteau",
    routineDefensive: "Ligne haute de hors-jeu",
    strength: 0.96,
  },
  {
    name: "Calcio Aurelia",
    shortName: "AUR",
    city: "Turin",
    country: "Italie",
    colour: "#f8fafc",
    reputation: 7400,
    facilities: 84,
    formation: "4-4-2",
    tempo: 44,
    pressing: 46,
    width: 40,
    mentality: 42,
    defensiveLine: 38,
    routineOffensive: "Centre remise en jeu courte",
    routineDefensive: "Bloc bas avec libéro",
    strength: 0.95,
  },
  {
    name: "Praia Atlético",
    shortName: "PRA",
    city: "Lisboa",
    country: "Portugal",
    colour: "#facc15",
    reputation: 6900,
    facilities: 78,
    formation: "4-3-3",
    tempo: 68,
    pressing: 62,
    width: 62,
    mentality: 66,
    defensiveLine: 60,
    routineOffensive: "Bloc agressif devant le gardien",
    routineDefensive: "Marquage homme à homme",
    strength: 0.92,
  },
  {
    name: "Ajax Kanaal",
    shortName: "KAN",
    city: "Rotterdam",
    country: "Pays-Bas",
    colour: "#fb923c",
    reputation: 6700,
    facilities: 92,
    formation: "4-2-3-1",
    tempo: 66,
    pressing: 74,
    width: 60,
    mentality: 62,
    defensiveLine: 72,
    routineOffensive: "Frappe directe",
    routineDefensive: "Pression sur le frappeur",
    strength: 0.9,
  },
  {
    name: "São Pedro FC",
    shortName: "SAO",
    city: "São Paulo",
    country: "Brésil",
    colour: "#22d3ee",
    reputation: 6500,
    facilities: 70,
    formation: "4-1-4-1",
    tempo: 70,
    pressing: 54,
    width: 74,
    mentality: 70,
    defensiveLine: 58,
    routineOffensive: "Centre enroulé au second poteau",
    routineDefensive: "Dégagement en couloir",
    strength: 0.87,
  },
  {
    name: "Thames United",
    shortName: "THA",
    city: "Londres-Est",
    country: "Angleterre",
    colour: "#818cf8",
    reputation: 6400,
    facilities: 74,
    formation: "4-4-1-1",
    tempo: 76,
    pressing: 70,
    width: 52,
    mentality: 60,
    defensiveLine: 64,
    routineOffensive: "Centre au premier poteau",
    routineDefensive: "Marquage de zone strict",
    strength: 0.85,
  },
  {
    name: "Kraken IF",
    shortName: "KRA",
    city: "Copenhague",
    country: "Danemark",
    colour: "#f472b6",
    reputation: 5900,
    facilities: 68,
    formation: "4-4-2",
    tempo: 56,
    pressing: 66,
    width: 46,
    mentality: 54,
    defensiveLine: 62,
    routineOffensive: "Combinaison au corner",
    routineDefensive: "Marquage de zone strict",
    strength: 0.78,
  },
  {
    name: "Oural Emerald",
    shortName: "OUR",
    city: "Kazan",
    country: "Russie",
    colour: "#4ade80",
    reputation: 5600,
    facilities: 62,
    formation: "5-3-2",
    tempo: 40,
    pressing: 44,
    width: 38,
    mentality: 40,
    defensiveLine: 34,
    routineOffensive: "Centre remise en jeu courte",
    routineDefensive: "Bloc bas avec libéro",
    strength: 0.74,
  },
];

const FIRST_NAMES = [
  "Lucas", "Mateo", "Enzo", "Théo", "Noah", "Gabriel", "Rafael", "Diego", "Milo", "Andrés",
  "Kwame", "Youssef", "Emre", "Nikola", "Viktor", "Jonas", "Pieter", "Sander", "Otto", "Ivan",
  "Kenji", "Tariq", "Amadou", "Bruno", "Diogo", "Kasper", "Magnus", "Aleksandar", "Finn", "Léo",
  "Samuel", "Elias", "Marco", "Julien", "Antoine", "Rui", "Dario", "Milan", "Aurélien", "Bastien",
];

const LAST_NAMES = [
  "Varela", "Okonkwo", "Della-Rocca", "Nakamura", "Bergström", "Ferreira", "Kovačić", "Lindqvist",
  "Mbaye", "Rousseau", "Almeida", "Petrov", "Van-Dijk-Rey", "Sørensen", "Ibarra", "Marchetti",
  "Duboys", "Van-Cleef", "Hassan", "Zubiri", "Larsen", "Mancini", "Cardoso", "Nowak", "Beaumont",
  "Santini", "Rivera", "Aydın", "Ekwe", "Torres", "Björk", "Delacroix", "Rossi", "Fontaine",
];

const POSITIONS: { position: string; band: "G" | "D" | "M" | "F"; role: string; count: number }[] = [
  { position: "GK", band: "G", role: "Gardien — Libéro du cadre", count: 2 },
  { position: "DC", band: "D", role: "Défenseur central — Balle au pied", count: 3 },
  { position: "DC", band: "D", role: "Défenseur central — Stoppeur", count: 1 },
  { position: "DL", band: "D", role: "Latéral gauche — Inverted Full-Back", count: 1 },
  { position: "DR", band: "D", role: "Latéral droit — Wing-Back", count: 1 },
  { position: "DM", band: "M", role: "Sentinelle — Anchor", count: 2 },
  { position: "MC", band: "M", role: "Milieu — Regista", count: 2 },
  { position: "MC", band: "M", role: "Milieu — Mezzala", count: 2 },
  { position: "AML", band: "F", role: "Ailier gauche — Inside Forward", count: 2 },
  { position: "AMR", band: "F", role: "Ailier droit — Winger", count: 2 },
  { position: "AMC", band: "M", role: "Meneur — Advanced Playmaker", count: 2 },
  { position: "ST", band: "F", role: "Attaquant — Pressing Forward", count: 2 },
  { position: "ST", band: "F", role: "Attaquant — Complete Forward", count: 1 },
];

const BAND_WEIGHTS: Record<"G" | "D" | "M" | "F", Partial<Record<AttributeKey, number>>> = {
  G: { Reflexes: 3, Commandement: 2, Positionnement: 2, Concentration: 2, Anticipation: 2 },
  D: { Tacle: 3, Marquage: 3, Positionnement: 2, Force: 2, Vitesse: 2, Concentration: 2 },
  M: { Passes: 3, Vision: 3, "Décisions": 2, Technique: 2, Endurance: 2, Anticipation: 2 },
  F: { Finition: 3, Dribble: 2, Vitesse: 2, Technique: 2, Anticipation: 2, Passes: 2 },
};

function mulberry32(a: number) {
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hash(text: string): number {
  let h = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type GeneratedPlayer = {
  name: string;
  position: string;
  role: string;
  age: number;
  nationality: string;
  currentAbility: number;
  potentialAbility: number;
  morale: number;
  sharpness: number;
  fitness: number;
  injuryRisk: number;
  value: number;
  wage: number;
  contractUntil: number;
  attributes: Record<string, number>;
};

/** Génère l'effectif complet d'un club (22 joueurs) de façon déterministe. */
export function generateSquad(team: TeamSeed, season: number): GeneratedPlayer[] {
  const rnd = mulberry32(hash(`${team.name}|newgens|${season}`));
  const players: GeneratedPlayer[] = [];
  const baseLevel = 92 + (team.reputation - 5000) / 62; // ~110-125 pour les gros clubs

  let index = 0;
  for (const slot of POSITIONS) {
    for (let i = 0; i < slot.count; i += 1) {
      index += 1;
      const isYouth = i === slot.count - 1;
      const age = isYouth
        ? 17 + Math.floor(rnd() * 3)
        : slot.band === "G"
          ? 24 + Math.floor(rnd() * 9)
          : 21 + Math.floor(rnd() * 11);

      // Développement : le CA croît jusqu'à ~27 ans puis décline
      const ageCurve =
        age <= 20
          ? 0.68 + (age - 16) * 0.07
          : age <= 27
            ? 0.96 + (age - 21) * 0.006
            : Math.max(0.72, 1.12 - (age - 27) * 0.028);

      const ca = Math.round(
        (baseLevel + (rnd() - 0.5) * 14) * ageCurve * (isYouth ? 0.74 : 1) * team.strength,
      );
      const ceiling = Math.round(
        ca + (isYouth ? 18 + rnd() * 22 : Math.max(0, 14 - (age - 20)) + rnd() * 8) * team.strength,
      );

      const attributes: Record<string, number> = {};
      for (const key of ATTRIBUTE_KEYS) {
        const weight = BAND_WEIGHTS[slot.band][key] ?? 1;
        const raw = ca / 6.4 + (rnd() - 0.5) * 5 + (weight - 1) * 1.5;
        attributes[key] = Math.max(1, Math.min(20, Math.round(raw)));
      }

      const name = `${FIRST_NAMES[Math.floor(rnd() * FIRST_NAMES.length)]} ${
        LAST_NAMES[Math.floor(rnd() * LAST_NAMES.length)]
      }`;

      players.push({
        name: `${name} #${index}`,
        position: slot.position,
        role: slot.role,
        age,
        nationality: team.country,
        currentAbility: ca,
        potentialAbility: Math.max(ca, ceiling),
        morale: Math.round(52 + rnd() * 34 + (team.reputation - 6000) / 400),
        sharpness: Math.round(70 + rnd() * 28),
        fitness: Math.round(82 + rnd() * 16),
        injuryRisk: Math.round(2 + rnd() * 9),
        value: Math.round(
          (Math.pow(Math.max(ca, 60), 3.1) / 52000) * (1 + (28 - Math.min(age, 33)) * 0.055),
        ),
        wage: Math.round((ca / 8) * (12 + rnd() * 8)),
        contractUntil: season + 1 + Math.floor(rnd() * 4),
        attributes,
      });
    }
  }

  return players;
}
