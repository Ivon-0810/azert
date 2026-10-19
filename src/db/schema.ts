import {
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* 1. DOCUMENT DE CONCEPTION (GDD) — chapitres & blocs rédactionnels   */
/* ------------------------------------------------------------------ */

export const gddChapters = pgTable("gdd_chapters", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 90 }).notNull().unique(),
  code: varchar("code", { length: 16 }).notNull(),
  orderIndex: integer("order_index").notNull(),
  category: varchar("category", { length: 48 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  subtitle: varchar("subtitle", { length: 260 }).notNull(),
  summary: text("summary").notNull(),
  ownerRole: varchar("owner_role", { length: 90 }).notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const gddBlocks = pgTable("gdd_blocks", {
  id: serial("id").primaryKey(),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => gddChapters.id, { onDelete: "cascade" }),
  orderIndex: integer("order_index").notNull(),
  kind: varchar("kind", { length: 24 }).notNull(), // paragraph | spec | list | formula | table | callout
  title: varchar("title", { length: 220 }).notNull(),
  body: text("body"),
  items: jsonb("items").$type<string[]>().notNull().default([]),
  meta: jsonb("meta")
    .$type<{ label: string; value: string }[]>()
    .notNull()
    .default([]),
});

/* ------------------------------------------------------------------ */
/* 2. BLUEPRINT DATA-MODEL (cible : 500 000+ entités)                  */
/* ------------------------------------------------------------------ */

export const specEntities = pgTable("spec_entities", {
  id: serial("id").primaryKey(),
  domain: varchar("domain", { length: 48 }).notNull(),
  name: varchar("name", { length: 90 }).notNull(),
  tableName: varchar("table_name", { length: 90 }).notNull(),
  purpose: text("purpose").notNull(),
  targetRows: varchar("target_rows", { length: 40 }).notNull(),
  columnCount: integer("column_count").notNull(),
  storage: varchar("storage", { length: 40 }).notNull(),
  fields: jsonb("fields")
    .$type<{ name: string; type: string; note: string }[]>()
    .notNull()
    .default([]),
  indexes: jsonb("indexes").$type<string[]>().notNull().default([]),
  relations: jsonb("relations").$type<string[]>().notNull().default([]),
});

/* ------------------------------------------------------------------ */
/* 3. ROADMAP / QA / BUDGETS DE PERFORMANCE                            */
/* ------------------------------------------------------------------ */

export const roadmapItems = pgTable("roadmap_items", {
  id: serial("id").primaryKey(),
  phase: varchar("phase", { length: 60 }).notNull(),
  window: varchar("window", { length: 40 }).notNull(),
  title: varchar("title", { length: 180 }).notNull(),
  focus: text("focus").notNull(),
  deliverables: jsonb("deliverables").$type<string[]>().notNull().default([]),
  exitCriteria: text("exit_criteria").notNull(),
  progress: integer("progress").notNull().default(0),
});

export const perfBudgets = pgTable("perf_budgets", {
  id: serial("id").primaryKey(),
  metric: varchar("metric", { length: 140 }).notNull(),
  budget: varchar("budget", { length: 80 }).notNull(),
  tooling: varchar("tooling", { length: 140 }).notNull(),
  severity: varchar("severity", { length: 24 }).notNull(),
  notes: text("notes").notNull(),
});

/* ------------------------------------------------------------------ */
/* 4. PROTOTYPE JOUABLE — ligue, effectifs, matchs simulés            */
/* ------------------------------------------------------------------ */

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 90 }).notNull(),
  shortName: varchar("short_name", { length: 12 }).notNull(),
  city: varchar("city", { length: 60 }).notNull(),
  country: varchar("country", { length: 40 }).notNull(),
  league: varchar("league", { length: 60 }).notNull(),
  colour: varchar("colour", { length: 12 }).notNull(),
  reputation: integer("reputation").notNull(),
  facilities: integer("facilities").notNull(),
  baseFormation: varchar("base_formation", { length: 12 }).notNull(),
  tempo: integer("tempo").notNull().default(50),
  pressing: integer("pressing").notNull().default(50),
  width: integer("width").notNull().default(50),
  mentality: integer("mentality").notNull().default(50),
  defensiveLine: integer("defensive_line").notNull().default(50),
  routineOffensive: varchar("routine_offensive", { length: 60 }).notNull(),
  routineDefensive: varchar("routine_defensive", { length: 60 }).notNull(),
});

export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  teamId: integer("team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 90 }).notNull(),
  position: varchar("position", { length: 4 }).notNull(),
  role: varchar("role", { length: 60 }).notNull(),
  age: integer("age").notNull(),
  nationality: varchar("nationality", { length: 40 }).notNull(),
  currentAbility: integer("current_ability").notNull(),
  potentialAbility: integer("potential_ability").notNull(),
  morale: integer("morale").notNull(),
  sharpness: integer("sharpness").notNull(),
  fitness: integer("fitness").notNull(),
  injuryRisk: integer("injury_risk").notNull(),
  value: integer("value").notNull(),
  wage: integer("wage").notNull(),
  contractUntil: integer("contract_until").notNull(),
  attributes: jsonb("attributes").$type<Record<string, number>>().notNull(),
});

export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  homeTeamId: integer("home_team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  awayTeamId: integer("away_team_id")
    .notNull()
    .references(() => teams.id, { onDelete: "cascade" }),
  competition: varchar("competition", { length: 60 }).notNull(),
  homeGoals: integer("home_goals").notNull(),
  awayGoals: integer("away_goals").notNull(),
  homeXg: real("home_xg").notNull(),
  awayXg: real("away_xg").notNull(),
  possessionHome: real("possession_home").notNull(),
  homeShots: integer("home_shots").notNull(),
  awayShots: integer("away_shots").notNull(),
  homeOnTarget: integer("home_on_target").notNull(),
  awayOnTarget: integer("away_on_target").notNull(),
  homePasses: integer("home_passes").notNull(),
  awayPasses: integer("away_passes").notNull(),
  seed: varchar("seed", { length: 40 }).notNull(),
  tacticsHome: jsonb("tactics_home").$type<Record<string, number | string>>().notNull(),
  tacticsAway: jsonb("tactics_away").$type<Record<string, number | string>>().notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const matchEvents = pgTable("match_events", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id")
    .notNull()
    .references(() => matches.id, { onDelete: "cascade" }),
  minute: integer("minute").notNull(),
  type: varchar("type", { length: 24 }).notNull(),
  phase: varchar("phase", { length: 40 }).notNull(),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "set null" }),
  playerId: integer("player_id").references(() => players.id, { onDelete: "set null" }),
  description: text("description").notNull(),
  xgDelta: real("xg_delta").notNull().default(0),
  homeScore: integer("home_score").notNull().default(0),
  awayScore: integer("away_score").notNull().default(0),
});

export type GddChapter = typeof gddChapters.$inferSelect;
export type GddBlock = typeof gddBlocks.$inferSelect;
export type SpecEntity = typeof specEntities.$inferSelect;
export type RoadmapItem = typeof roadmapItems.$inferSelect;
export type PerfBudget = typeof perfBudgets.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Player = typeof players.$inferSelect;
export type Match = typeof matches.$inferSelect;
export type MatchEvent = typeof matchEvents.$inferSelect;
