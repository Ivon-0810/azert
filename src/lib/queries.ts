import { asc, desc, eq, inArray, sql } from "drizzle-orm";
import { db } from "@/db";
import { ensureReady } from "@/db/bootstrap";
import {
  gddBlocks,
  gddChapters,
  matchEvents,
  matches,
  perfBudgets,
  players,
  roadmapItems,
  specEntities,
  teams,
  type GddBlock,
  type GddChapter,
  type Match,
  type MatchEvent,
  type PerfBudget,
  type Player,
  type RoadmapItem,
  type SpecEntity,
  type Team,
} from "@/db/schema";

export type ChapterWithBlocks = GddChapter & { blocks: GddBlock[] };
export type TeamWithSquad = Team & { squad: Player[] };
export type MatchWithTeams = Match & {
  homeName: string;
  awayName: string;
  homeShort: string;
  awayShort: string;
};

export async function getChapters(): Promise<ChapterWithBlocks[]> {
  await ensureReady();
  const chapters = await db.select().from(gddChapters).orderBy(asc(gddChapters.orderIndex));
  const blocks = await db.select().from(gddBlocks).orderBy(asc(gddBlocks.orderIndex));
  return chapters.map((chapter) => ({
    ...chapter,
    blocks: blocks.filter((b) => b.chapterId === chapter.id),
  }));
}

export async function getChapter(slug: string): Promise<ChapterWithBlocks | null> {
  await ensureReady();
  const [chapter] = await db
    .select()
    .from(gddChapters)
    .where(eq(gddChapters.slug, slug))
    .limit(1);
  if (!chapter) return null;
  const blocks = await db
    .select()
    .from(gddBlocks)
    .where(eq(gddBlocks.chapterId, chapter.id))
    .orderBy(asc(gddBlocks.orderIndex));
  return { ...chapter, blocks };
}

export async function getSpecEntities(): Promise<SpecEntity[]> {
  await ensureReady();
  return db.select().from(specEntities).orderBy(asc(specEntities.id));
}

export async function getRoadmap(): Promise<RoadmapItem[]> {
  await ensureReady();
  return db.select().from(roadmapItems).orderBy(asc(roadmapItems.id));
}

export async function getPerfBudgets(): Promise<PerfBudget[]> {
  await ensureReady();
  return db.select().from(perfBudgets).orderBy(asc(perfBudgets.id));
}

export async function getTeams(): Promise<Team[]> {
  await ensureReady();
  return db.select().from(teams).orderBy(desc(teams.reputation));
}

export async function getTeamWithSquad(teamId: number): Promise<TeamWithSquad | null> {
  await ensureReady();
  const [team] = await db.select().from(teams).where(eq(teams.id, teamId)).limit(1);
  if (!team) return null;
  const squad = await db
    .select()
    .from(players)
    .where(eq(players.teamId, teamId))
    .orderBy(desc(players.currentAbility));
  return { ...team, squad };
}

export async function getAllSquads(): Promise<TeamWithSquad[]> {
  await ensureReady();
  const allTeams = await db.select().from(teams).orderBy(desc(teams.reputation));
  const allPlayers = await db.select().from(players).orderBy(desc(players.currentAbility));
  return allTeams.map((team) => ({
    ...team,
    squad: allPlayers.filter((p) => p.teamId === team.id),
  }));
}

export async function getRecentMatches(limit = 12): Promise<MatchWithTeams[]> {
  await ensureReady();
  const rows = await db
    .select({
      match: matches,
      homeName: teams.name,
    })
    .from(matches)
    .innerJoin(teams, eq(matches.homeTeamId, teams.id))
    .orderBy(desc(matches.id))
    .limit(limit);

  const awayIds = [...new Set(rows.map((r) => r.match.awayTeamId))];
  const awayTeams = awayIds.length
    ? await db.select().from(teams).where(inArray(teams.id, awayIds))
    : [];

  return rows.map((row) => {
    const away = awayTeams.find((t) => t.id === row.match.awayTeamId);
    return {
      ...row.match,
      homeName: row.homeName,
      awayName: away?.name ?? "—",
      homeShort: row.homeName.slice(0, 3).toUpperCase(),
      awayShort: (away?.name ?? "—").slice(0, 3).toUpperCase(),
    };
  });
}

export async function getMatchEvents(matchId: number): Promise<MatchEvent[]> {
  await ensureReady();
  return db
    .select()
    .from(matchEvents)
    .where(eq(matchEvents.matchId, matchId))
    .orderBy(asc(matchEvents.id));
}

export async function getWorldStats() {
  await ensureReady();
  const result = (await db.execute<{
    chapters: string;
    blocks: string;
    players: string;
    teams: string;
    matches: string;
    events: string;
  }>(sql`
    select
      (select count(*)::text from gdd_chapters) as chapters,
      (select count(*)::text from gdd_blocks) as blocks,
      (select count(*)::text from players) as players,
      (select count(*)::text from teams) as teams,
      (select count(*)::text from matches) as matches,
      (select count(*)::text from match_events) as events
  `)) as unknown as { rows: Record<string, string>[] };
  const r = result?.rows?.[0] ?? {};
  return {
    chapters: Number(r.chapters ?? 0),
    blocks: Number(r.blocks ?? 0),
    players: Number(r.players ?? 0),
    teams: Number(r.teams ?? 0),
    matches: Number(r.matches ?? 0),
    events: Number(r.events ?? 0),
  };
}

export async function getEngineMetrics() {
  await ensureReady();
  const result = (await db.execute<{
    sims: string;
    goals: string;
    xg: string;
    home_wins: string;
    draws: string;
    away_wins: string;
    avg_home_goals: string;
    avg_away_goals: string;
  }>(sql`
    select
      count(*)::text as sims,
      coalesce(sum(home_goals + away_goals), 0)::text as goals,
      coalesce(round(avg(home_xg + away_xg)::numeric, 2), 0)::text as xg,
      count(*) filter (where home_goals > away_goals)::text as home_wins,
      count(*) filter (where home_goals = away_goals)::text as draws,
      count(*) filter (where away_goals > home_goals)::text as away_wins,
      coalesce(round(avg(home_goals)::numeric, 2), 0)::text as avg_home_goals,
      coalesce(round(avg(away_goals)::numeric, 2), 0)::text as avg_away_goals
    from matches
  `)) as unknown as { rows: Record<string, string>[] };
  const r = result?.rows?.[0] ?? {};
  return {
    sims: Number(r.sims ?? 0),
    goals: Number(r.goals ?? 0),
    xg: Number(r.xg ?? 0),
    homeWins: Number(r.home_wins ?? 0),
    draws: Number(r.draws ?? 0),
    awayWins: Number(r.away_wins ?? 0),
    avgHomeGoals: Number(r.avg_home_goals ?? 0),
    avgAwayGoals: Number(r.avg_away_goals ?? 0),
  };
}
