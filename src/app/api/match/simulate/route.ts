import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import { matchEvents, matches, players, teams } from "@/db/schema";
import {
  ROUTINES_DEFENSIVES,
  ROUTINES_OFFENSIVES,
  simulateMatch,
  type EnginePlayer,
  type EngineTactics,
  type EngineTeam,
} from "@/lib/engine/matchEngine";
import { getMatchEvents } from "@/lib/queries";

export const dynamic = "force-dynamic";

type Body = {
  homeTeamId?: number;
  awayTeamId?: number;
  seed?: string;
  persist?: boolean;
  homeTactics?: Partial<EngineTactics>;
  awayTactics?: Partial<EngineTactics>;
};

const clamp = (v: unknown, fallback: number) => {
  const n = Number(v);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(0, Math.min(100, Math.round(n)));
};

const routineOff = (value: unknown, fallback: string) =>
  typeof value === "string" && ROUTINES_OFFENSIVES.includes(value) ? value : fallback;

const routineDef = (value: unknown, fallback: string) =>
  typeof value === "string" && ROUTINES_DEFENSIVES.includes(value) ? value : fallback;

export async function POST(request: Request) {
  try {
    await ensureReady();
    const body = (await request.json()) as Body;
    const homeTeamId = Number(body.homeTeamId);
    const awayTeamId = Number(body.awayTeamId);

    if (
      !Number.isInteger(homeTeamId) ||
      !Number.isInteger(awayTeamId) ||
      homeTeamId === awayTeamId
    ) {
      return Response.json(
        { error: "Sélectionnez deux clubs différents." },
        { status: 400 },
      );
    }

    const teamRows = await db
      .select()
      .from(teams)
      .where(inArray(teams.id, [homeTeamId, awayTeamId]));
    const homeRow = teamRows.find((t) => t.id === homeTeamId);
    const awayRow = teamRows.find((t) => t.id === awayTeamId);
    if (!homeRow || !awayRow) {
      return Response.json({ error: "Club introuvable." }, { status: 404 });
    }

    const squad = await db
      .select()
      .from(players)
      .where(inArray(players.teamId, [homeTeamId, awayTeamId]));

    const toEngineTeam = (row: typeof homeRow): EngineTeam => ({
      id: row.id,
      name: row.name,
      shortName: row.shortName,
      colour: row.colour,
      reputation: row.reputation,
      formation: row.baseFormation,
      routineOffensive: row.routineOffensive,
      routineDefensive: row.routineDefensive,
      players: squad
        .filter((p) => p.teamId === row.id)
        .map<EnginePlayer>((p) => ({
          id: p.id,
          name: p.name,
          position: p.position,
          role: p.role,
          currentAbility: p.currentAbility,
          potentialAbility: p.potentialAbility,
          morale: p.morale,
          sharpness: p.sharpness,
          fitness: p.fitness,
          injuryRisk: p.injuryRisk,
          attributes: p.attributes ?? {},
        })),
    });

    const homeTactics: EngineTactics = {
      mentality: clamp(body.homeTactics?.mentality, homeRow.mentality),
      tempo: clamp(body.homeTactics?.tempo, homeRow.tempo),
      pressing: clamp(body.homeTactics?.pressing, homeRow.pressing),
      width: clamp(body.homeTactics?.width, homeRow.width),
      defensiveLine: clamp(body.homeTactics?.defensiveLine, homeRow.defensiveLine),
      routineOffensive: routineOff(
        body.homeTactics?.routineOffensive,
        homeRow.routineOffensive,
      ),
      routineDefensive: routineDef(
        body.homeTactics?.routineDefensive,
        homeRow.routineDefensive,
      ),
    };

    const awayTactics: EngineTactics = {
      mentality: clamp(body.awayTactics?.mentality, awayRow.mentality),
      tempo: clamp(body.awayTactics?.tempo, awayRow.tempo),
      pressing: clamp(body.awayTactics?.pressing, awayRow.pressing),
      width: clamp(body.awayTactics?.width, awayRow.width),
      defensiveLine: clamp(body.awayTactics?.defensiveLine, awayRow.defensiveLine),
      routineOffensive: routineOff(
        body.awayTactics?.routineOffensive,
        awayRow.routineOffensive,
      ),
      routineDefensive: routineDef(
        body.awayTactics?.routineDefensive,
        awayRow.routineDefensive,
      ),
    };

    const seed =
      typeof body.seed === "string" && body.seed.trim().length > 0
        ? body.seed.trim().slice(0, 40)
        : `IGM-${Date.now().toString(36).toUpperCase()}`;

    const simulation = simulateMatch({
      seed,
      home: toEngineTeam(homeRow),
      away: toEngineTeam(awayRow),
      homeTactics,
      awayTactics,
    });

    let matchId: number | null = null;
    if (body.persist !== false) {
      const [inserted] = await db
        .insert(matches)
        .values({
          homeTeamId,
          awayTeamId,
          competition: "IGM Super League — Prototype",
          homeGoals: simulation.homeScore,
          awayGoals: simulation.awayScore,
          homeXg: simulation.homeStats.xg,
          awayXg: simulation.awayStats.xg,
          possessionHome: simulation.homeStats.possession,
          homeShots: simulation.homeStats.shots,
          awayShots: simulation.awayStats.shots,
          homeOnTarget: simulation.homeStats.onTarget,
          awayOnTarget: simulation.awayStats.onTarget,
          homePasses: simulation.homeStats.passes,
          awayPasses: simulation.awayStats.passes,
          seed,
          tacticsHome: homeTactics as unknown as Record<string, number | string>,
          tacticsAway: awayTactics as unknown as Record<string, number | string>,
        })
        .returning({ id: matches.id });

      matchId = inserted.id;

      const relevant = simulation.events.filter((e) =>
        ["goal", "save", "off-target", "chance", "card", "injury", "sub", "half-time", "full-time"].includes(
          e.type,
        ),
      );
      if (relevant.length > 0) {
        await db.insert(matchEvents).values(
          relevant.map((e) => ({
            matchId: inserted.id,
            minute: e.minute,
            type: e.type,
            phase: e.phase,
            teamId: e.teamId,
            playerId: e.playerId,
            description: e.description,
            xgDelta: e.xg,
            homeScore: e.homeScore,
            awayScore: e.awayScore,
          })),
        );
      }
    }

    return Response.json({
      matchId,
      simulation,
      homeTeam: { id: homeRow.id, name: homeRow.name, colour: homeRow.colour, formation: homeRow.baseFormation },
      awayTeam: { id: awayRow.id, name: awayRow.name, colour: awayRow.colour, formation: awayRow.baseFormation },
    });
  } catch (error) {
    console.error("simulate failed", error);
    return Response.json(
      { error: "Échec de la simulation.", detail: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const matchId = Number(url.searchParams.get("matchId"));
  if (!Number.isInteger(matchId)) {
    return Response.json({ error: "matchId requis" }, { status: 400 });
  }
  const events = await getMatchEvents(matchId);
  return Response.json({ matchId, events });
}
