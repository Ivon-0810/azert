/**
 * IGM MANAGER ENGINE — Match Engine "Slice v0.4"
 * ------------------------------------------------------------------
 * Tranche fonctionnelle du moteur décrit dans le GDD (chapitre ME-02).
 * Déterministe : même graine + mêmes entrées => même déroulé.
 * Simule 90 minutes par phases de possession, avec xG, fatigue,
 * pressing, cartons, coups de pied arrêtés et remplacements.
 */

export type EnginePlayer = {
  id: number;
  name: string;
  position: string;
  role: string;
  currentAbility: number;
  potentialAbility: number;
  morale: number;
  sharpness: number;
  fitness: number;
  injuryRisk: number;
  attributes: Record<string, number>;
};

export type EngineTeam = {
  id: number;
  name: string;
  shortName: string;
  colour: string;
  reputation: number;
  formation: string;
  routineOffensive: string;
  routineDefensive: string;
  players: EnginePlayer[];
};

export type EngineTactics = {
  mentality: number; // 0-100 (0 = très défensif, 100 = très offensif)
  tempo: number; // 0-100
  pressing: number; // 0-100
  width: number; // 0-100
  defensiveLine: number; // 0-100
  routineOffensive: string;
  routineDefensive: string;
};

export type EngineEventType =
  | "kickoff"
  | "half-time"
  | "full-time"
  | "goal"
  | "chance"
  | "save"
  | "off-target"
  | "card"
  | "injury"
  | "sub"
  | "set-piece"
  | "note";

export type EngineEvent = {
  minute: number;
  type: EngineEventType;
  phase: string;
  teamId: number | null;
  teamName: string;
  playerId: number | null;
  playerName: string;
  description: string;
  xg: number;
  homeScore: number;
  awayScore: number;
};

export type EngineStats = {
  possession: number;
  shots: number;
  onTarget: number;
  xg: number;
  passes: number;
  passAccuracy: number;
  finalThirdEntries: number;
  duels: number;
  duelsWon: number;
  tackles: number;
  interceptions: number;
  cards: number;
  ppda: number;
  condition: number;
};

export type PlayerRating = {
  playerId: number;
  name: string;
  position: string;
  minutes: number;
  rating: number;
  goals: number;
  assists: number;
  xg: number;
  condition: number;
};

export type MatchSimulation = {
  seed: string;
  homeScore: number;
  awayScore: number;
  homeStats: EngineStats;
  awayStats: EngineStats;
  events: EngineEvent[];
  possessionTimeline: { minute: number; home: number }[];
  xgTimeline: { minute: number; home: number; away: number }[];
  ratings: Record<string, PlayerRating[]>;
  zoneTilt: { home: number; away: number };
  lines: { home: string; away: string };
};

/* ----------------------------- utilitaires ----------------------------- */

function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a: number) {
  return function next(): number {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value));

const round1 = (value: number) => Math.round(value * 10) / 10;

/* ----------------------- sélection et évaluation ----------------------- */

const POSITION_BAND: Record<string, "G" | "D" | "M" | "F"> = {
  GK: "G",
  DC: "D",
  DL: "D",
  DR: "D",
  DM: "M",
  MC: "M",
  ML: "M",
  MR: "M",
  AMC: "M",
  ST: "F",
  AML: "F",
  AMR: "F",
};

const ROLE_WEIGHTS: Record<string, string[]> = {
  G: ["Reflexes", "Positionnement", "Concentration", "Commandement"],
  D: ["Tacle", "Marquage", "Positionnement", "Force", "Vitesse"],
  M: ["Passes", "Vision", "Endurance", "Technique", "Décisions"],
  F: ["Finition", "Dribble", "Vitesse", "Passes", "Anticipation"],
};

function attr(player: EnginePlayer, key: string): number {
  return player.attributes[key] ?? 10;
}

function bandOf(player: EnginePlayer): "G" | "D" | "M" | "F" {
  return POSITION_BAND[player.position] ?? "M";
}

function positionalFit(player: EnginePlayer, band: "G" | "D" | "M" | "F"): number {
  const own = bandOf(player);
  if (own === band) return 1;
  if (
    (own === "D" && band === "M") ||
    (own === "M" && band === "D") ||
    (own === "M" && band === "F") ||
    (own === "F" && band === "M")
  ) {
    return 0.82;
  }
  return 0.55;
}

type Lineup = {
  gk: EnginePlayer;
  defence: EnginePlayer[];
  midfield: EnginePlayer[];
  attack: EnginePlayer[];
  bench: EnginePlayer[];
  formation: string;
};

const SHAPES: Record<string, [number, number, number]> = {
  "4-4-2": [4, 4, 2],
  "4-2-3-1": [4, 5, 1],
  "4-3-3": [4, 3, 3],
  "3-5-2": [5, 3, 2],
  "5-3-2": [5, 3, 2],
  "4-1-4-1": [4, 5, 1],
  "4-4-1-1": [4, 5, 1],
};

export function pickLineup(team: EngineTeam): Lineup {
  const shape = SHAPES[team.formation] ?? [4, 4, 2];
  const pool = [...team.players].sort(
    (a, b) => b.currentAbility * positionalFit(b, "M") - a.currentAbility * positionalFit(a, "M"),
  );
  const gkPool = pool.filter((p) => bandOf(p) === "G");
  const gk = gkPool[0] ?? pool[0];
  const taken = new Set<number>([gk.id]);
  const rest = pool.filter((p) => !taken.has(p.id));

  const bands: ["D" | "M" | "F", number][] = [
    ["D", shape[0]],
    ["M", shape[1]],
    ["F", shape[2]],
  ];
  const groups: Record<"D" | "M" | "F", EnginePlayer[]> = { D: [], M: [], F: [] };
  for (const [band, wanted] of bands) {
    const sorted = [...rest].sort(
      (a, b) =>
        b.currentAbility * positionalFit(b, band) - a.currentAbility * positionalFit(a, band),
    );
    for (const player of sorted) {
      if (groups[band].length >= wanted) break;
      if (taken.has(player.id)) continue;
      groups[band].push(player);
      taken.add(player.id);
    }
  }
  // Complétion si l'effectif est trop court sur une bande
  for (const band of ["D", "M", "F"] as const) {
    const sorted = [...rest].sort(
      (a, b) =>
        b.currentAbility * positionalFit(b, band) - a.currentAbility * positionalFit(a, band),
    );
    for (const player of sorted) {
      const need = band === "D" ? 3 : band === "M" ? 3 : 1;
      if (groups[band].length >= need) break;
      if (taken.has(player.id)) continue;
      groups[band].push(player);
      taken.add(player.id);
    }
  }

  const bench = rest.filter((p) => !taken.has(p.id)).slice(0, 7);
  return {
    gk,
    defence: groups.D,
    midfield: groups.M,
    attack: groups.F,
    bench,
    formation: team.formation,
  };
}

type Sector = { rating: number; players: EnginePlayer[]; fatigue: number };

function sectorRating(
  players: EnginePlayer[],
  keys: string[],
  fatigue: number,
  moraleAvg: number,
): number {
  if (players.length === 0) return 40;
  const raw = players.reduce((sum, p) => {
    const attrScore = keys.reduce((s, k) => s + attr(p, k), 0) / keys.length;
    return sum + (attrScore * 4.2 + p.currentAbility * 0.55);
  }, 0) / players.length;
  const moraleMod = 0.9 + moraleAvg / 500; // 0.9 → 1.1
  const fatigueMod = 1 - fatigue * 0.22;
  return clamp(raw * moraleMod * fatigueMod, 20, 100);
}

/* ------------------------------ modificateurs ------------------------------ */

const ROUTINE_OFF: Record<string, number> = {
  "Centre au premier poteau": 0.105,
  "Centre remise en jeu courte": 0.085,
  "Bloc agressif devant le gardien": 0.12,
  "Combinaison au corner": 0.095,
  "Frappe directe": 0.075,
  "Centre enroulé au second poteau": 0.115,
};

const ROUTINE_DEF: Record<string, number> = {
  "Marquage de zone strict": 1.05,
  "Marquage homme à homme": 0.95,
  "Bloc bas avec libéro": 1.0,
  "Pression sur le frappeur": 0.98,
  "Dégagement en couloir": 1.02,
  "Ligne haute de hors-jeu": 0.9,
};

export const ROUTINES_OFFENSIVES = Object.keys(ROUTINE_OFF);
export const ROUTINES_DEFENSIVES = Object.keys(ROUTINE_DEF);

function tacticsContext(t: EngineTactics, opp: EngineTactics, home: boolean) {
  const mentality = (t.mentality - 50) / 50; // -1..1
  const tempo = (t.tempo - 50) / 50;
  const pressing = (t.pressing - 50) / 50;
  const width = (t.width - 50) / 50;
  const line = (t.defensiveLine - 50) / 50;
  const homeAdv = home ? 1.055 : 1.0;

  // Effet de contre-tactique : un bloc bas face à une équipe très offensive
  const antiBlock = clamp(1 - opp.mentality / 100 * 0.22 * (1 - mentality * 0.4), 0.7, 1.05);
  // Largeurs opposées : jouer dans le couloir faible
  const widthMismatch = 1 + width * (1 - 0.5 * Math.abs(width - (opp.width - 50) / 50));
  // Ligne haute : plus d'interceptions, mais plus de risques
  const lineRisk = 1 + line * 0.3;

  return {
    mentality,
    tempo,
    pressing,
    width,
    line,
    homeAdv,
    attackMod:
      homeAdv *
      (1 + mentality * 0.16 + tempo * 0.05) *
      antiBlock *
      widthMismatch *
      (1 + line * 0.06),
    defenceMod: homeAdv * (1 - mentality * 0.13) * (1 + line * 0.05),
    midfieldMod: homeAdv * (1 + tempo * 0.07 + pressing * 0.06),
    pressingMod: 1 + pressing * 0.34,
    fatigueMod: 1 + pressing * 0.3 + tempo * 0.14 + mentality * 0.08,
    setPieceMod:
      (ROUTINE_OFF[t.routineOffensive] ?? 0.095) / (ROUTINE_DEF[opp.routineDefensive] ?? 1.0) / 0.1,
    lineRisk,
  };
}

/* --------------------------------- moteur --------------------------------- */

export type SimulateOptions = {
  seed: string;
  home: EngineTeam;
  away: EngineTeam;
  homeTactics: EngineTactics;
  awayTactics: EngineTactics;
};

export function simulateMatch({
  seed,
  home,
  away,
  homeTactics,
  awayTactics,
}: SimulateOptions): MatchSimulation {
  const rnd = mulberry32(hashSeed(`${seed}|${home.id}|${away.id}`));
  const homeLineup = pickLineup(home);
  const awayLineup = pickLineup(away);

  const events: EngineEvent[] = [];
  const possessionTimeline: { minute: number; home: number }[] = [];
  const xgTimeline: { minute: number; home: number; away: number }[] = [];

  const pitch = (side: "home" | "away") => (side === "home" ? home : away);
  const lineupOf = (side: "home" | "away") =>
    side === "home" ? homeLineup : awayLineup;
  const tacticsOf = (side: "home" | "away") =>
    side === "home" ? homeTactics : awayTactics;

  const state = {
    homeScore: 0,
    awayScore: 0,
    possessionHomeTicks: 0,
    home: emptyStats(),
    away: emptyStats(),
    fatigue: { home: 0, away: 0 },
    onPitch: {
      home: [homeLineup.gk, ...homeLineup.defence, ...homeLineup.midfield, ...homeLineup.attack],
      away: [awayLineup.gk, ...awayLineup.defence, ...awayLineup.midfield, ...awayLineup.attack],
    },
    minutesPlayed: new Map<number, number>(),
    goals: new Map<number, number>(),
    assists: new Map<number, number>(),
    xgByPlayer: new Map<number, number>(),
    ratings: new Map<number, number[]>(),
    subsUsed: { home: 0, away: 0 },
  };

  const pushEvent = (
    e: Omit<EngineEvent, "homeScore" | "awayScore" | "teamName" | "playerName" | "playerId"> &
      Partial<Pick<EngineEvent, "teamName" | "playerName" | "playerId">>,
  ) => {
    events.push({
      ...e,
      teamName: e.teamId === home.id ? home.name : e.teamId === away.id ? away.name : "—",
      playerName: e.playerName ?? "",
      playerId: e.playerId ?? null,
      homeScore: state.homeScore,
      awayScore: state.awayScore,
    });
  };

  const track = (side: "home" | "away", fn: (s: MutableStats) => void) => {
    fn(side === "home" ? state.home : state.away);
  };

  const moraleAvg = (side: "home" | "away") => {
    const list = state.onPitch[side].filter((p) => bandOf(p) !== "G");
    if (list.length === 0) return 50;
    return list.reduce((s, p) => s + p.morale, 0) / list.length;
  };

  pushEvent({
    minute: 0,
    type: "kickoff",
    phase: "Coup d'envoi",
    teamId: home.id,
    description: `Coup d'envoi au ${home.name} — ${home.name} (${homeLineup.formation}) reçoit ${away.name} (${awayLineup.formation}).`,
    xg: 0,
  });

  const stoppage = 1 + Math.floor(rnd() * 4);
  const totalMinutes = 90 + stoppage;
  let cumulativeHomeXg = 0;
  let cumulativeAwayXg = 0;

  for (let minute = 1; minute <= totalMinutes; minute += 1) {
    for (const side of ["home", "away"] as const) {
      for (const p of state.onPitch[side]) {
        state.minutesPlayed.set(p.id, (state.minutesPlayed.get(p.id) ?? 0) + 1);
      }
    }

    const hm = moraleAvg("home");
    const am = moraleAvg("away");
    const hCtx = tacticsContext(homeTactics, awayTactics, true);
    const aCtx = tacticsContext(awayTactics, homeTactics, false);

    const sectors = (side: "home" | "away") => {
      const lu = lineupOf(side);
      const ctx = side === "home" ? hCtx : aCtx;
      const morale = side === "home" ? hm : am;
      const fatigue = state.fatigue[side];
      return {
        defence: sectorRating(lu.defence, ROLE_WEIGHTS.D, fatigue, morale) * ctx.defenceMod,
        midfield:
          sectorRating(lu.midfield, ROLE_WEIGHTS.M, fatigue, morale) * ctx.midfieldMod,
        attack: sectorRating(lu.attack, ROLE_WEIGHTS.F, fatigue, morale) * ctx.attackMod,
        gk: sectorRating([lu.gk], ROLE_WEIGHTS.G, fatigue, morale),
        ctx,
        lu,
      };
    };

    const H = sectors("home");
    const A = sectors("away");

    // Duel de possession
    const hMid = H.midfield * (1 + hCtx.tempo * 0.04);
    const aMid = A.midfield * (1 + aCtx.tempo * 0.04);
    const pHome = clamp(hMid / (hMid + aMid), 0.2, 0.8);
    const homeHasBall = rnd() < pHome;
    state.possessionHomeTicks += homeHasBall ? 1 : 0;

    const atk = homeHasBall ? H : A;
    const def = homeHasBall ? A : H;
    const side: "home" | "away" = homeHasBall ? "home" : "away";
    const opp: "home" | "away" = homeHasBall ? "away" : "home";

    const passesThisMinute = Math.round(
      6 + (atk.ctx.tempo + 0.6) * 5 + rnd() * 5 + (atk.midfield / 22),
    );
    track(side, (s) => {
      s.passes += passesThisMinute;
      s.passAccuracy += 0.72 + atk.midfield / 420 + (1 - atk.ctx.tempo) * 0.05;
      s.passAccuracyCount += 1;
      s.finalThirdEntries += rnd() < 0.22 + atk.ctx.mentality * 0.1 ? 1 : 0;
      s.duels += 2 + Math.round(rnd() * 3);
      s.duelsWon += rnd() < 0.42 + (atk.midfield - def.midfield) / 260 ? 1 : 0;
    });

    // Pression adverse : récupérations hautes
    const pressEffect = def.ctx.pressingMod * (def.midfield / 60);
    track(opp, (s) => {
      s.interceptions += rnd() < 0.3 * pressEffect ? 1 : 0;
      s.tackles += rnd() < 0.34 * pressEffect ? 1 : 0;
      s.ppda += 8.5 - pressEffect * 1.8 + rnd();
      s.ppdaCount += 1;
    });

    // Création d'occasion
    // Taux de création calibré pour ~12,5 tirs par équipe et par match
    const creationChance =
      0.27 *
      (atk.attack / (atk.attack + def.defence * 1.02)) *
      2 *
      (1 + atk.ctx.tempo * 0.07) *
      (1 + pressEffect * 0.05);

    if (rnd() < creationChance) {
      const isSetPiece = rnd() < 0.24;
      const phase = isSetPiece
        ? pickPhase(rnd, "set")
        : pickPhase(rnd, atk.ctx.tempo > 0.35 ? "transition" : "buildup");

      const shooterPool = [...atk.lu.attack, ...atk.lu.midfield];
      const shooter = weightedPick(shooterPool, rnd, (p) =>
        bandOf(p) === "F" ? 3 : bandOf(p) === "M" ? 1.4 : 0.5,
      );

      let xg = baseXgForPhase(phase);
      xg *= 1 + ((shooter?.currentAbility ?? 90) - 100) / 420;
      xg *= clamp(atk.attack / (atk.attack + def.defence), 0.35, 0.72) * 1.55;
      if (isSetPiece) xg *= atk.ctx.setPieceMod;
      xg *= 1 - (def.gk - 60) / 900;
      xg *= side === "home" ? 1.03 : 0.99;
      xg = clamp(xg, 0.01, 0.92);

      const gk = def.lu.gk;
      // Modèle de conversion : P(but) ≈ xG modulé par la finition et le gardien
      const finishMod = 1 + (shooter ? (attr(shooter, "Finition") - 12) / 70 : 0);
      const gkMod = 1 - (attr(gk, "Reflexes") - 12) / 110;
      const goalProb = clamp(
        xg * finishMod * gkMod * (side === "home" ? 1.06 : 1.0),
        0.004,
        0.95,
      );
      const goal = rnd() < goalProb;
      const onTarget = goal || rnd() < 0.34;

      track(side, (s) => {
        s.shots += 1;
        s.onTarget += onTarget ? 1 : 0;
        s.xg += xg;
      });
      if (shooter) state.xgByPlayer.set(shooter.id, (state.xgByPlayer.get(shooter.id) ?? 0) + xg);
      if (side === "home") cumulativeHomeXg += xg;
      else cumulativeAwayXg += xg;

      if (goal && shooter) {
        state.goals.set(shooter.id, (state.goals.get(shooter.id) ?? 0) + 1);
        if (side === "home") state.homeScore += 1;
        else state.awayScore += 1;
        const creatorPool = [...atk.lu.midfield, ...atk.lu.attack].filter((p) => p.id !== shooter?.id);
        const creator = weightedPick(creatorPool, rnd, (p) =>
          bandOf(p) === "M" ? 3 : 1.2,
        );
        if (creator) state.assists.set(creator.id, (state.assists.get(creator.id) ?? 0) + 1);
        pushEvent({
          minute,
          type: "goal",
          phase,
          teamId: pitch(side).id,
          playerId: shooter.id,
          playerName: shooter.name,
          description: `BUT ! ${shooter.name} (${shooter.position}) conclut ${describePhase(phase)} — xG ${xg.toFixed(2)}${creator ? `, passe décisive de ${creator.name}` : ""}.`,
          xg,
        });
      } else if (onTarget) {
        pushEvent({
          minute,
          type: "save",
          phase,
          teamId: pitch(side).id,
          playerId: shooter?.id ?? null,
          playerName: shooter?.name ?? "",
          description: `Arrêt de ${gk.name} ! ${shooter?.name ?? "Le tireur"} déclenche ${describePhase(phase)} (xG ${xg.toFixed(2)}) et le gardien s'interpose.`,
          xg,
        });
      } else if (rnd() < 0.42) {
        pushEvent({
          minute,
          type: "off-target",
          phase,
          teamId: pitch(side).id,
          playerId: shooter?.id ?? null,
          playerName: shooter?.name ?? "",
          description: `${shooter?.name ?? "Le tireur"} manque le cadre ${describePhase(phase)} — occasion de xG ${xg.toFixed(2)} gâchée.`,
          xg,
        });
      } else {
        pushEvent({
          minute,
          type: "chance",
          phase,
          teamId: pitch(side).id,
          playerId: shooter?.id ?? null,
          playerName: shooter?.name ?? "",
          description: `Occasion : ${shooter?.name ?? "l'attaquant"} est battu par la défense ${describePhase(phase)} (xG ${xg.toFixed(2)}).`,
          xg,
        });
      }
    }

    // Fautes et cartons
    const foulRisk = 0.09 * def.ctx.pressingMod * (1 + (def.ctx.mentality + 1) * 0.1);
    if (rnd() < foulRisk) {
      const guilty = weightedPick([...def.lu.defence, ...def.lu.midfield], rnd, () => 1);
      const yellow = rnd() < 0.34;
      if (yellow) {
        track(opp, (s) => {
          s.cards += 1;
        });
        pushEvent({
          minute,
          type: "card",
          phase: "Duel",
          teamId: pitch(opp).id,
          playerId: guilty?.id ?? null,
          playerName: guilty?.name ?? "",
          description: `Carton jaune pour ${guilty?.name ?? "un défenseur"} — faute dans l'axe, arbitre sévère sur le bloc.`,
          xg: 0,
        });
      }
    }

    // Blessures
    const injuryRisk = 0.004 * (1 + state.fatigue[side] * 1.4);
    if (rnd() < injuryRisk) {
      const victim = weightedPick(state.onPitch[side], rnd, () => 1);
      if (victim) {
        pushEvent({
          minute,
          type: "injury",
          phase: "Médical",
          teamId: pitch(side).id,
          playerId: victim.id,
          playerName: victim.name,
          description: `${victim.name} reste au sol (ischio suspectée) — risque d'entrée estimé à ${victim.injuryRisk}%.`,
          xg: 0,
        });
      }
    }

    // Fatigue
    state.fatigue.home = clamp(
      state.fatigue.home + 0.0085 * hCtx.fatigueMod * (1 - avg(state.onPitch.home, "Endurance") / 40),
      0,
      1,
    );
    state.fatigue.away = clamp(
      state.fatigue.away + 0.0085 * aCtx.fatigueMod * (1 - avg(state.onPitch.away, "Endurance") / 40),
      0,
      1,
    );

    // Remplacements automatiques
    for (const s of ["home", "away"] as const) {
      if (state.subsUsed[s] >= 4) continue;
      const threshold = 0.52 + state.subsUsed[s] * 0.06;
      if (state.fatigue[s] > threshold && minute > 55 && rnd() < 0.5) {
        const candidates = state.onPitch[s]
          .filter((p) => bandOf(p) !== "G")
          .sort((a, b) => attr(b, "Endurance") - attr(a, "Endurance"));
        const outgoing = candidates[0];
        const bench = lineupOf(s).bench.filter((p) => !state.onPitch[s].includes(p));
        const incoming = bench[0];
        if (outgoing && incoming) {
          state.subsUsed[s] += 1;
          state.onPitch[s] = state.onPitch[s].map((p) => (p.id === outgoing.id ? incoming : p));
          pushEvent({
            minute,
            type: "sub",
            phase: "Remplacement",
            teamId: pitch(s).id,
            playerId: incoming.id,
            playerName: incoming.name,
            description: `Changement : ${incoming.name} (${incoming.position}) remplace ${outgoing.name} — fraîcheur physique recherchée.`,
            xg: 0,
          });
        }
      }
    }

    possessionTimeline.push({
      minute,
      home: round1((state.possessionHomeTicks / minute) * 100),
    });
    xgTimeline.push({
      minute,
      home: round1(cumulativeHomeXg),
      away: round1(cumulativeAwayXg),
    });

    if (minute === 45) {
      pushEvent({
        minute: 45,
        type: "half-time",
        phase: "Mi-temps",
        teamId: null,
        description: `Mi-temps : ${home.name} ${state.homeScore}-${state.awayScore} ${away.name}. xG ${cumulativeHomeXg.toFixed(2)} - ${cumulativeAwayXg.toFixed(2)}.`,
        xg: 0,
      });
      state.fatigue.home = clamp(state.fatigue.home - 0.12, 0, 1);
      state.fatigue.away = clamp(state.fatigue.away - 0.12, 0, 1);
    }
  }

  pushEvent({
    minute: totalMinutes,
    type: "full-time",
    phase: "Coup de sifflet final",
    teamId: null,
    description: `Fin du match : ${home.name} ${state.homeScore}-${state.awayScore} ${away.name} (xG ${state.home.xg.toFixed(2)} - ${state.away.xg.toFixed(2)}).`,
    xg: 0,
  });

  const totalTicks = totalMinutes;
  const homePoss = round1((state.possessionHomeTicks / totalTicks) * 100);

  const finalize = (side: "home" | "away"): EngineStats => {
    const s = side === "home" ? state.home : state.away;
    return {
      possession: side === "home" ? homePoss : round1(100 - homePoss),
      shots: s.shots,
      onTarget: s.onTarget,
      xg: round1(s.xg * 10) / 10,
      passes: s.passes,
      passAccuracy: s.passAccuracyCount ? round1((s.passAccuracy / s.passAccuracyCount) * 100) : 0,
      finalThirdEntries: s.finalThirdEntries,
      duels: s.duels,
      duelsWon: s.duelsWon,
      tackles: s.tackles,
      interceptions: s.interceptions,
      cards: s.cards,
      ppda: s.ppdaCount ? round1(s.ppda / s.ppdaCount) : 0,
      condition: round1((1 - state.fatigue[side]) * 100),
    };
  };

  const ratingsFor = (side: "home" | "away"): PlayerRating[] => {
    const lu = lineupOf(side);
    const win =
      (side === "home" && state.homeScore > state.awayScore) ||
      (side === "away" && state.awayScore > state.homeScore);
    const draw = state.homeScore === state.awayScore;
    const teamBonus = win ? 0.55 : draw ? 0.2 : -0.1;
    const all = [lu.gk, ...lu.defence, ...lu.midfield, ...lu.attack, ...lu.bench];
    return all.map((p) => {
      const minutes = state.minutesPlayed.get(p.id) ?? 0;
      const goals = state.goals.get(p.id) ?? 0;
      const assists = state.assists.get(p.id) ?? 0;
      const xg = state.xgByPlayer.get(p.id) ?? 0;
      let rating = 6.2;
      rating += goals * 0.95 + assists * 0.5 + (xg - goals * 0.7) * 0.25;
      rating += (p.morale - 50) / 90;
      rating += (p.currentAbility - 105) / 55;
      rating += teamBonus;
      if (bandOf(p) === "G") {
        const conceded = side === "home" ? state.awayScore : state.homeScore;
        rating += Math.max(-0.9, 0.65 - conceded * 0.42);
      }
      rating += minutes > 60 ? 0.12 : 0;
      return {
        playerId: p.id,
        name: p.name,
        position: p.position,
        minutes,
        rating: round1(clamp(rating, 3.5, 10)),
        goals,
        assists,
        xg: round1(xg * 100) / 100,
        condition: round1(clamp(100 - minutes * 0.55, 40, 100)),
      };
    });
  };

  const zoneTilt = {
    home: round1(clamp(38 + (finalize("home").possession - 50) * 0.42 + (homeTactics.mentality - 50) * 0.12, 20, 68)),
    away: 0,
  };
  zoneTilt.away = round1(clamp(100 - zoneTilt.home, 20, 68));

  return {
    seed,
    homeScore: state.homeScore,
    awayScore: state.awayScore,
    homeStats: finalize("home"),
    awayStats: finalize("away"),
    events,
    possessionTimeline,
    xgTimeline,
    ratings: { home: ratingsFor("home"), away: ratingsFor("away") },
    zoneTilt,
    lines: { home: homeLineup.formation, away: awayLineup.formation },
  };
}

/* ------------------------------- helpers ------------------------------- */

type MutableStats = EngineStats & { passAccuracyCount: number; ppdaCount: number };

function emptyStats(): MutableStats {
  return {
    possession: 0,
    shots: 0,
    onTarget: 0,
    xg: 0,
    passes: 0,
    passAccuracy: 0,
    passAccuracyCount: 0,
    finalThirdEntries: 0,
    duels: 0,
    duelsWon: 0,
    tackles: 0,
    interceptions: 0,
    cards: 0,
    ppda: 0,
    ppdaCount: 0,
    condition: 100,
  };
}

function avg(players: EnginePlayer[], key: string): number {
  if (players.length === 0) return 12;
  return players.reduce((s, p) => s + attr(p, key), 0) / players.length;
}

function weightedPick<T>(
  list: T[],
  rnd: () => number,
  weight: (item: T) => number,
): T | undefined {
  if (list.length === 0) return undefined;
  const total = list.reduce((s, i) => s + Math.max(0.001, weight(i)), 0);
  let r = rnd() * total;
  for (const item of list) {
    r -= Math.max(0.001, weight(item));
    if (r <= 0) return item;
  }
  return list[list.length - 1];
}

function pickPhase(
  rnd: () => number,
  mode: "set" | "transition" | "buildup",
): string {
  const table =
    mode === "set"
      ? [
          "Corner",
          "Corner",
          "Coup franc",
          "Touche longue",
          "Corner",
          "Coup franc indirect",
        ]
      : mode === "transition"
        ? [
            "Contre-attaque",
            "Transition rapide",
            "Longue transversale",
            "Contre-attaque",
            "Attaque placée",
          ]
        : [
            "Attaque placée",
            "Attaque placée",
            "Centre après surcharge",
            "Combinaison dans le couloir",
            "Frappe de loin",
            "Passage dans le dos",
          ];
  return table[Math.floor(rnd() * table.length)];
}

function baseXgForPhase(phase: string): number {
  switch (phase) {
    case "Penalty":
      return 0.76;
    case "Corner":
      return 0.09;
    case "Coup franc":
      return 0.07;
    case "Coup franc indirect":
      return 0.08;
    case "Touche longue":
      return 0.06;
    case "Contre-attaque":
      return 0.19;
    case "Transition rapide":
      return 0.15;
    case "Longue transversale":
      return 0.12;
    case "Frappe de loin":
      return 0.05;
    case "Passage dans le dos":
      return 0.31;
    case "Centre après surcharge":
      return 0.13;
    case "Combinaison dans le couloir":
      return 0.16;
    default:
      return 0.12;
  }
}

function describePhase(phase: string): string {
  switch (phase) {
    case "Corner":
      return "sur corner";
    case "Coup franc":
      return "sur coup franc direct";
    case "Coup franc indirect":
      return "après un coup franc joué à deux";
    case "Touche longue":
      return "à la réception d'une touche longue";
    case "Contre-attaque":
      return "en contre-attaque";
    case "Transition rapide":
      return "en transition rapide";
    case "Longue transversale":
      return "sur changement d'aile";
    case "Attaque placée":
      return "au terme d'une attaque placée";
    case "Centre après surcharge":
      return "à la retombée d'un centre après surcharge du couloir";
    case "Combinaison dans le couloir":
      return "après une combinaison dans le couloir";
    case "Frappe de loin":
      return "de loin";
    case "Passage dans le dos":
      return "sur un passage dans le dos de la défense";
    default:
      return "";
  }
}

export function defaultTactics(team: {
  tempo: number;
  pressing: number;
  width: number;
  mentality: number;
  defensiveLine: number;
  routineOffensive: string;
  routineDefensive: string;
}): EngineTactics {
  return {
    mentality: team.mentality,
    tempo: team.tempo,
    pressing: team.pressing,
    width: team.width,
    defensiveLine: team.defensiveLine,
    routineOffensive: team.routineOffensive,
    routineDefensive: team.routineDefensive,
  };
}
