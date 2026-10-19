export type BlockKind =
  | "paragraph"
  | "spec"
  | "list"
  | "formula"
  | "table"
  | "callout";

export type GddBlockSeed = {
  kind: BlockKind;
  title: string;
  body?: string;
  items?: string[];
  meta?: { label: string; value: string }[];
};

export type GddChapterSeed = {
  slug: string;
  code: string;
  category: string;
  title: string;
  subtitle: string;
  summary: string;
  ownerRole: string;
  keywords: string[];
  blocks: GddBlockSeed[];
};

export type SpecEntitySeed = {
  domain: string;
  name: string;
  tableName: string;
  purpose: string;
  targetRows: string;
  columnCount: number;
  storage: string;
  fields: { name: string; type: string; note: string }[];
  indexes: string[];
  relations: string[];
};

export type RoadmapSeed = {
  phase: string;
  window: string;
  title: string;
  focus: string;
  deliverables: string[];
  exitCriteria: string;
  progress: number;
};

export type PerfBudgetSeed = {
  metric: string;
  budget: string;
  tooling: string;
  severity: string;
  notes: string;
};
