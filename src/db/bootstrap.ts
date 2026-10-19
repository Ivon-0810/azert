import { sql } from "drizzle-orm";
import { db } from "@/db";
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
} from "@/db/schema";
import { coreChapters } from "@/content/gdd-core";
import { systemsChapters } from "@/content/gdd-systems";
import { techChapters } from "@/content/gdd-tech";
import {
  perfBudgetsSeed,
  roadmapSeed,
  specEntitiesSeed,
} from "@/content/blueprint";
import { TEAM_SEEDS, generateSquad } from "@/lib/engine/generate";

const DDL = [
  `create table if not exists gdd_chapters (
    id serial primary key,
    slug varchar(90) not null unique,
    code varchar(16) not null,
    order_index integer not null,
    category varchar(48) not null,
    title varchar(180) not null,
    subtitle varchar(260) not null,
    summary text not null,
    owner_role varchar(90) not null,
    keywords jsonb not null default '[]'::jsonb,
    created_at timestamp not null default now()
  )`,
  `create table if not exists gdd_blocks (
    id serial primary key,
    chapter_id integer not null references gdd_chapters(id) on delete cascade,
    order_index integer not null,
    kind varchar(24) not null,
    title varchar(220) not null,
    body text,
    items jsonb not null default '[]'::jsonb,
    meta jsonb not null default '[]'::jsonb
  )`,
  `create table if not exists spec_entities (
    id serial primary key,
    domain varchar(48) not null,
    name varchar(90) not null,
    table_name varchar(90) not null,
    purpose text not null,
    target_rows varchar(40) not null,
    column_count integer not null,
    storage varchar(40) not null,
    fields jsonb not null default '[]'::jsonb,
    indexes jsonb not null default '[]'::jsonb,
    relations jsonb not null default '[]'::jsonb
  )`,
  `create table if not exists roadmap_items (
    id serial primary key,
    phase varchar(60) not null,
    "window" varchar(40) not null,
    title varchar(180) not null,
    focus text not null,
    deliverables jsonb not null default '[]'::jsonb,
    exit_criteria text not null,
    progress integer not null default 0
  )`,
  `create table if not exists perf_budgets (
    id serial primary key,
    metric varchar(140) not null,
    budget varchar(80) not null,
    tooling varchar(140) not null,
    severity varchar(24) not null,
    notes text not null
  )`,
  `create table if not exists teams (
    id serial primary key,
    name varchar(90) not null,
    short_name varchar(12) not null,
    city varchar(60) not null,
    country varchar(40) not null,
    league varchar(60) not null,
    colour varchar(12) not null,
    reputation integer not null,
    facilities integer not null,
    base_formation varchar(12) not null,
    tempo integer not null default 50,
    pressing integer not null default 50,
    width integer not null default 50,
    mentality integer not null default 50,
    defensive_line integer not null default 50,
    routine_offensive varchar(60) not null,
    routine_defensive varchar(60) not null
  )`,
  `create table if not exists players (
    id serial primary key,
    team_id integer not null references teams(id) on delete cascade,
    name varchar(90) not null,
    position varchar(4) not null,
    role varchar(60) not null,
    age integer not null,
    nationality varchar(40) not null,
    current_ability integer not null,
    potential_ability integer not null,
    morale integer not null,
    sharpness integer not null,
    fitness integer not null,
    injury_risk integer not null,
    value integer not null,
    wage integer not null,
    contract_until integer not null,
    attributes jsonb not null default '{}'::jsonb
  )`,
  `create table if not exists matches (
    id serial primary key,
    home_team_id integer not null references teams(id) on delete cascade,
    away_team_id integer not null references teams(id) on delete cascade,
    competition varchar(60) not null,
    home_goals integer not null,
    away_goals integer not null,
    home_xg real not null,
    away_xg real not null,
    possession_home real not null,
    home_shots integer not null,
    away_shots integer not null,
    home_on_target integer not null,
    away_on_target integer not null,
    home_passes integer not null,
    away_passes integer not null,
    seed varchar(40) not null,
    tactics_home jsonb not null default '{}'::jsonb,
    tactics_away jsonb not null default '{}'::jsonb,
    created_at timestamp not null default now()
  )`,
  `create table if not exists match_events (
    id serial primary key,
    match_id integer not null references matches(id) on delete cascade,
    minute integer not null,
    type varchar(24) not null,
    phase varchar(40) not null,
    team_id integer references teams(id) on delete set null,
    player_id integer references players(id) on delete set null,
    description text not null,
    xg_delta real not null default 0,
    home_score integer not null default 0,
    away_score integer not null default 0
  )`,
  `create index if not exists gdd_blocks_chapter_idx on gdd_blocks(chapter_id)`,
  `create index if not exists players_team_idx on players(team_id)`,
  `create index if not exists match_events_match_idx on match_events(match_id)`,
];

const SEASON = 2026;

async function count(table: string): Promise<number> {
  const result = await db.execute<{ n: string }>(
    sql.raw(`select count(*)::text as n from ${table}`),
  );
  const rows = (result as unknown as { rows: { n: string }[] }).rows ?? [];
  return Number(rows[0]?.n ?? "0");
}

async function applySchema() {
  for (const statement of DDL) {
    await db.execute(sql.raw(statement));
  }
}

async function seedContent() {
  const chapters = [...coreChapters, ...systemsChapters, ...techChapters];

  if ((await count("gdd_chapters")) === 0) {
    let order = 0;
    for (const chapter of chapters) {
      order += 1;
      const [inserted] = await db
        .insert(gddChapters)
        .values({
          slug: chapter.slug,
          code: chapter.code,
          orderIndex: order,
          category: chapter.category,
          title: chapter.title,
          subtitle: chapter.subtitle,
          summary: chapter.summary,
          ownerRole: chapter.ownerRole,
          keywords: chapter.keywords,
        })
        .returning({ id: gddChapters.id });

      let blockOrder = 0;
      for (const block of chapter.blocks) {
        blockOrder += 1;
        await db.insert(gddBlocks).values({
          chapterId: inserted.id,
          orderIndex: blockOrder,
          kind: block.kind,
          title: block.title,
          body: block.body ?? null,
          items: block.items ?? [],
          meta: block.meta ?? [],
        });
      }
    }
  }

  if ((await count("spec_entities")) === 0) {
    await db.insert(specEntities).values(specEntitiesSeed);
  }

  if ((await count("roadmap_items")) === 0) {
    await db.insert(roadmapItems).values(roadmapSeed);
  }

  if ((await count("perf_budgets")) === 0) {
    await db.insert(perfBudgets).values(perfBudgetsSeed);
  }
}

async function seedWorld() {
  if ((await count("teams")) > 0) return;

  for (const seed of TEAM_SEEDS) {
    const [team] = await db
      .insert(teams)
      .values({
        name: seed.name,
        shortName: seed.shortName,
        city: seed.city,
        country: seed.country,
        league: "IGM Super League",
        colour: seed.colour,
        reputation: seed.reputation,
        facilities: seed.facilities,
        baseFormation: seed.formation,
        tempo: seed.tempo,
        pressing: seed.pressing,
        width: seed.width,
        mentality: seed.mentality,
        defensiveLine: seed.defensiveLine,
        routineOffensive: seed.routineOffensive,
        routineDefensive: seed.routineDefensive,
      })
      .returning({ id: teams.id });

    const squad = generateSquad(seed, SEASON);
    await db.insert(players).values(squad.map((p) => ({ ...p, teamId: team.id })));
  }
}

async function run() {
  await applySchema();
  await db.execute(sql`select pg_advisory_lock(918273645)`);
  try {
    await seedContent();
    await seedWorld();
  } finally {
    await db.execute(sql`select pg_advisory_unlock(918273645)`);
  }
}

const globalForBootstrap = globalThis as typeof globalThis & {
  __igmBootstrap?: Promise<void>;
};

/** Crée le schéma et charge les données de référence si nécessaire. */
export function ensureReady(): Promise<void> {
  if (!globalForBootstrap.__igmBootstrap) {
    globalForBootstrap.__igmBootstrap = run().catch((error) => {
      globalForBootstrap.__igmBootstrap = undefined;
      throw error;
    });
  }
  return globalForBootstrap.__igmBootstrap;
}

export { matchEvents, matches };
