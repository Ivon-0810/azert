"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { EngineTactics, MatchSimulation } from "@/lib/engine/matchEngine";
import { ROUTINES_DEFENSIVES, ROUTINES_OFFENSIVES } from "@/lib/engine/matchEngine";

export type LabTeam = {
  id: number;
  name: string;
  shortName: string;
  colour: string;
  reputation: number;
  formation: string;
  tempo: number;
  pressing: number;
  width: number;
  mentality: number;
  defensiveLine: number;
  routineOffensive: string;
  routineDefensive: string;
  squadSize: number;
  avgAbility: number;
};

type SimResponse = {
  matchId: number | null;
  simulation: MatchSimulation;
  homeTeam: { id: number; name: string; colour: string; formation: string };
  awayTeam: { id: number; name: string; colour: string; formation: string };
};

const SLIDERS: { key: keyof EngineTactics; label: string; hint: string }[] = [
  { key: "mentality", label: "Mentalité", hint: "Très défensif → Très offensif" },
  { key: "tempo", label: "Tempo", hint: "Possession lente → jeu direct" },
  { key: "pressing", label: "Pressing", hint: "Bloc bas → pressing très élevé" },
  { key: "width", label: "Largeur", hint: "Serré → très large" },
  { key: "defensiveLine", label: "Ligne défensive", hint: "Très basse → très haute" },
];

const MENTALITY_LABEL = (v: number) => {
  if (v < 20) return "Très défensive";
  if (v < 40) return "Défensive";
  if (v < 60) return "Équilibrée";
  if (v < 80) return "Offensive";
  return "Très offensive";
};

export function MatchLab({ teams }: { teams: LabTeam[] }) {
  const [homeId, setHomeId] = useState(teams[0]?.id ?? 0);
  const [awayId, setAwayId] = useState(teams[1]?.id ?? 0);
  const [seed, setSeed] = useState("IGM-2026-DEMO");
  const [homeTactics, setHomeTactics] = useState<EngineTactics>(toTactics(teams[0]));
  const [awayTactics, setAwayTactics] = useState<EngineTactics>(toTactics(teams[1]));
  const [result, setResult] = useState<SimResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [minute, setMinute] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(4);
  const [batch, setBatch] = useState<{ label: string; value: string }[] | null>(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const t = teams.find((x) => x.id === homeId);
    if (t) setHomeTactics(toTactics(t));
  }, [homeId, teams]);

  useEffect(() => {
    const t = teams.find((x) => x.id === awayId);
    if (t) setAwayTactics(toTactics(t));
  }, [awayId, teams]);

  useEffect(() => {
    if (!playing || !result) return;
    const last = result.simulation.xgTimeline.length;
    if (minute >= last) {
      setPlaying(false);
      return;
    }
    const handle = setTimeout(() => setMinute((m) => Math.min(last, m + 1)), 1100 / speed);
    return () => clearTimeout(handle);
  }, [playing, minute, result, speed]);

  const simulate = async (nextSeed?: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/match/simulate", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          homeTeamId: homeId,
          awayTeamId: awayId,
          seed: nextSeed ?? seed,
          homeTactics,
          awayTactics,
        }),
      });
      const data = (await res.json()) as SimResponse & { error?: string };
      if (!res.ok || data.error) throw new Error(data.error ?? "Échec de la simulation");
      setResult(data);
      setMinute(0);
      setBatch(null);
      if (nextSeed) setSeed(nextSeed);
      requestAnimationFrame(() => {
        timelineRef.current?.scrollTo({ top: 0 });
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  const runBatch = async () => {
    setBatchLoading(true);
    setError(null);
    try {
      const runs: { home: number; away: number; xg: number; poss: number }[] = [];
      for (let i = 0; i < 12; i += 1) {
        const res = await fetch("/api/match/simulate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            homeTeamId: homeId,
            awayTeamId: awayId,
            seed: `BATCH-${seed}-${i}`,
            homeTactics,
            awayTactics,
          }),
        });
        const data = (await res.json()) as SimResponse;
        runs.push({
          home: data.simulation.homeScore,
          away: data.simulation.awayScore,
          xg: data.simulation.homeStats.xg + data.simulation.awayStats.xg,
          poss: data.simulation.homeStats.possession,
        });
      }
      const homeWins = runs.filter((r) => r.home > r.away).length;
      const draws = runs.filter((r) => r.home === r.away).length;
      const avg = (f: (r: (typeof runs)[number]) => number) =>
        runs.reduce((s, r) => s + f(r), 0) / runs.length;
      setBatch([
        { label: "Échantillon", value: `${runs.length} matchs` },
        { label: "Victoires domicile", value: `${homeWins} (${Math.round((homeWins / runs.length) * 100)} %)` },
        { label: "Nuls", value: `${draws}` },
        { label: "Buts domicile / match", value: avg((r) => r.home).toFixed(2) },
        { label: "Buts extérieur / match", value: avg((r) => r.away).toFixed(2) },
        { label: "xG total moyen", value: avg((r) => r.xg).toFixed(2) },
        { label: "Possession domicile", value: `${avg((r) => r.poss).toFixed(1)} %` },
      ]);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBatchLoading(false);
    }
  };

  const sim = result?.simulation;
  const visibleEvents = useMemo(
    () => (sim ? sim.events.filter((e) => e.minute <= minute) : []),
    [sim, minute],
  );
  const finalMinute = sim?.xgTimeline.length ?? 0;
  const shown = sim
    ? sim.xgTimeline[Math.min(minute, finalMinute - 1)] ?? { minute: 0, home: 0, away: 0 }
    : null;
  const homeColor = result?.homeTeam.colour ?? "#35d0ff";
  const awayColor = result?.awayTeam.colour ?? "#7ee787";

  return (
    <div className="space-y-6">
      {/* ---------------- Contrôles tactiques ---------------- */}
      <div className="grid gap-4 xl:grid-cols-2">
        <TacticPanel
          side="Domicile"
          team={teams.find((t) => t.id === homeId)}
          teams={teams}
          value={homeId}
          onSelect={setHomeId}
          tactics={homeTactics}
          onChange={setHomeTactics}
          accent="#35d0ff"
        />
        <TacticPanel
          side="Extérieur"
          team={teams.find((t) => t.id === awayId)}
          teams={teams}
          value={awayId}
          onSelect={setAwayId}
          tactics={awayTactics}
          onChange={setAwayTactics}
          accent="#7ee787"
        />
      </div>

      <div className="panel flex flex-wrap items-end gap-4 p-5">
        <label className="flex-1 min-w-[220px]">
          <span className="mono block text-[10px] uppercase tracking-[0.16em] text-igm-muted">
            Graine déterministe
          </span>
          <input
            value={seed}
            onChange={(e) => setSeed(e.target.value)}
            className="mono mt-2 w-full rounded-lg border border-igm-line bg-igm-void/70 px-3 py-2 text-[13px] text-igm-ink outline-none focus:border-igm-acid/50"
          />
          <span className="mt-1 block text-[11px] text-igm-muted/70">
            Même graine + mêmes consignes = déroulé strictement identique (exigence P5).
          </span>
        </label>
        <button
          type="button"
          disabled={loading || homeId === awayId}
          onClick={() => simulate()}
          className="glow-acid rounded-lg bg-igm-acid px-6 py-3 text-sm font-bold text-igm-void transition hover:brightness-110 disabled:opacity-40"
        >
          {loading ? "Simulation…" : "▶ Simuler le match"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={() => simulate(seed)}
          className="rounded-lg border border-igm-line bg-igm-panel2 px-4 py-3 text-sm font-semibold text-igm-ink transition hover:border-igm-neon/50 disabled:opacity-40"
        >
          ⟳ Rejouer la même graine
        </button>
        <button
          type="button"
          disabled={batchLoading || homeId === awayId}
          onClick={runBatch}
          className="rounded-lg border border-igm-amber/40 bg-igm-amber/10 px-4 py-3 text-sm font-semibold text-igm-amber transition hover:bg-igm-amber/20 disabled:opacity-40"
        >
          {batchLoading ? "Banc de calibration…" : "⧗ Banc : 12 simulations"}
        </button>
      </div>

      {error ? (
        <div className="rounded-lg border border-igm-rose/40 bg-igm-rose/10 p-4 text-[13px] text-igm-rose">
          {error}
        </div>
      ) : null}

      {batch ? (
        <div className="panel p-5">
          <p className="mono text-[10px] uppercase tracking-[0.18em] text-igm-amber">
            Banc de calibration automatique
          </p>
          <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
            {batch.map((b) => (
              <div key={b.label} className="rounded-lg border border-igm-line bg-igm-void/50 p-3">
                <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-igm-muted">
                  {b.label}
                </p>
                <p className="mono mt-1 text-[15px] font-bold text-igm-ink">{b.value}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-[11px] text-igm-muted">
            Comparer aux cibles : 1,52 but/match domicile, 1,19 extérieur, 2,55 xG cumulés. Un écart
            supérieur à 0,06 bloque la branche en CI (stage sim-validation).
          </p>
        </div>
      ) : null}

      {/* ---------------- Rendu du match ---------------- */}
      {sim && result ? (
        <>
          <div className="panel overflow-hidden">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-igm-line bg-igm-void/50 p-5">
              <div className="flex items-center gap-4">
                <TeamBadge colour={homeColor} name={result.homeTeam.name} formation={sim.lines.home} />
                <span className="mono text-3xl font-black">
                  {visibleEvents.length > 0
                    ? `${visibleEvents[visibleEvents.length - 1].homeScore}-${visibleEvents[visibleEvents.length - 1].awayScore}`
                    : "0-0"}
                </span>
                <TeamBadge colour={awayColor} name={result.awayTeam.name} formation={sim.lines.away} right />
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (minute >= finalMinute) setMinute(0);
                    setPlaying((p) => !p);
                  }}
                  className="rounded-lg bg-igm-neon px-4 py-2 text-[13px] font-bold text-igm-void"
                >
                  {playing ? "❚❚ Pause" : "▶ Lecture"}
                </button>
                {[1, 4, 12].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setSpeed(s)}
                    className={`mono rounded-lg border px-3 py-2 text-[12px] ${
                      speed === s
                        ? "border-igm-acid/60 bg-igm-acid/10 text-igm-acid"
                        : "border-igm-line text-igm-muted"
                    }`}
                  >
                    ×{s}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setPlaying(false);
                    setMinute(finalMinute);
                  }}
                  className="mono rounded-lg border border-igm-line px-3 py-2 text-[12px] text-igm-muted"
                >
                  Fin
                </button>
              </div>
            </div>

            <div className="grid gap-0 lg:grid-cols-[1.4fr_1fr]">
              {/* Timeline + graphes */}
              <div className="border-b border-igm-line p-5 lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between">
                  <p className="mono text-[10px] uppercase tracking-[0.18em] text-igm-muted">
                    Minute {Math.min(minute, finalMinute)} / {finalMinute} · seed {sim.seed}
                  </p>
                  <p className="mono text-[10px] text-igm-muted">
                    xG live {shown ? `${shown.home.toFixed(2)} - ${shown.away.toFixed(2)}` : "0.00 - 0.00"}
                  </p>
                </div>

                <input
                  type="range"
                  min={0}
                  max={finalMinute}
                  value={minute}
                  onChange={(e) => {
                    setPlaying(false);
                    setMinute(Number(e.target.value));
                  }}
                  className="mt-4 w-full"
                />

                <XgChart
                  data={sim.xgTimeline}
                  minute={minute}
                  homeColour={homeColor}
                  awayColour={awayColor}
                />

                <div className="mt-5 space-y-3">
                  <PossessionBar
                    home={sim.homeStats.possession}
                    homeColour={homeColor}
                    awayColour={awayColor}
                    homeName={result.homeTeam.name}
                    awayName={result.awayTeam.name}
                  />
                  <ZoneTilt tilt={sim.zoneTilt} />
                </div>
              </div>

              {/* Journal */}
              <div ref={timelineRef} className="max-h-[560px] overflow-y-auto p-5">
                <p className="mono mb-3 text-[10px] uppercase tracking-[0.18em] text-igm-muted">
                  Journal des évènements ({visibleEvents.length})
                </p>
                <ul className="space-y-2">
                  {visibleEvents.map((e, i) => (
                    <li
                      key={i}
                      className={`rounded-lg border p-3 text-[12.5px] leading-relaxed ${
                        e.type === "goal"
                          ? "border-igm-acid/50 bg-igm-acid/10"
                          : e.type === "card" || e.type === "injury"
                            ? "border-igm-amber/40 bg-igm-amber/5"
                            : "border-igm-line/70 bg-igm-void/40"
                      }`}
                    >
                      <div className="mono flex items-center gap-2 text-[10px] uppercase tracking-[0.12em] text-igm-muted">
                        <span className="font-bold text-igm-ink">{e.minute}&apos;</span>
                        <span>{e.phase}</span>
                        {e.xg > 0 ? <span className="text-igm-neon">xG {e.xg.toFixed(2)}</span> : null}
                      </div>
                      <p className="mt-1 text-igm-muted">{e.description}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Statistiques */}
          <div className="panel p-5">
            <p className="mono text-[10px] uppercase tracking-[0.18em] text-igm-muted">
              Data Hub — statistiques complètes
            </p>
            <div className="mt-4 space-y-2.5">
              {(
                [
                  ["Possession", `${sim.homeStats.possession} %`, `${sim.awayStats.possession} %`, sim.homeStats.possession],
                  ["Tirs", sim.homeStats.shots, sim.awayStats.shots, norm(sim.homeStats.shots, sim.awayStats.shots)],
                  ["Tirs cadrés", sim.homeStats.onTarget, sim.awayStats.onTarget, norm(sim.homeStats.onTarget, sim.awayStats.onTarget)],
                  ["xG", sim.homeStats.xg.toFixed(2), sim.awayStats.xg.toFixed(2), norm(sim.homeStats.xg, sim.awayStats.xg)],
                  ["Passes", sim.homeStats.passes, sim.awayStats.passes, norm(sim.homeStats.passes, sim.awayStats.passes)],
                  ["Précision passes", `${sim.homeStats.passAccuracy} %`, `${sim.awayStats.passAccuracy} %`, sim.homeStats.passAccuracy],
                  ["Entrées 30 derniers mètres", sim.homeStats.finalThirdEntries, sim.awayStats.finalThirdEntries, norm(sim.homeStats.finalThirdEntries, sim.awayStats.finalThirdEntries)],
                  ["Tacles", sim.homeStats.tackles, sim.awayStats.tackles, norm(sim.homeStats.tackles, sim.awayStats.tackles)],
                  ["Interceptions", sim.homeStats.interceptions, sim.awayStats.interceptions, norm(sim.homeStats.interceptions, sim.awayStats.interceptions)],
                  ["Duels gagnés", sim.homeStats.duelsWon, sim.awayStats.duelsWon, norm(sim.homeStats.duelsWon, sim.awayStats.duelsWon)],
                  ["PPDA (intensité de presse)", sim.homeStats.ppda, sim.awayStats.ppda, 100 - sim.homeStats.ppda * 6],
                  ["Cartons", sim.homeStats.cards, sim.awayStats.cards, norm(sim.homeStats.cards, sim.awayStats.cards)],
                  ["Condition moyenne", `${sim.homeStats.condition} %`, `${sim.awayStats.condition} %`, sim.homeStats.condition],
                ] as [string, string | number, string | number, number][]
              ).map(([label, h, a, ratio]) => (
                <StatRow key={label} label={label} home={h} away={a} ratio={clamp(ratio, 3, 97)} homeColour={homeColor} awayColour={awayColor} />
              ))}
            </div>
          </div>

          {/* Notes des joueurs */}
          <div className="grid gap-4 lg:grid-cols-2">
            {(["home", "away"] as const).map((side) => (
              <div key={side} className="panel p-5">
                <p className="mono text-[10px] uppercase tracking-[0.18em] text-igm-muted">
                  {side === "home" ? result.homeTeam.name : result.awayTeam.name} — notes individuelles
                </p>
                <table className="mt-3 w-full text-left text-[12.5px]">
                  <thead>
                    <tr className="border-b border-igm-line text-[10px] uppercase tracking-[0.12em] text-igm-muted">
                      <th className="pb-2">Joueur</th>
                      <th className="pb-2">Poste</th>
                      <th className="pb-2 text-right">Min</th>
                      <th className="pb-2 text-right">B</th>
                      <th className="pb-2 text-right">PD</th>
                      <th className="pb-2 text-right">xG</th>
                      <th className="pb-2 text-right">Note</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sim.ratings[side]
                      .filter((p) => p.minutes > 0)
                      .sort((a, b) => b.rating - a.rating)
                      .map((p) => (
                        <tr key={p.playerId} className="border-b border-igm-line/40 last:border-0">
                          <td className="py-1.5 pr-2 text-igm-ink">{p.name}</td>
                          <td className="mono py-1.5 pr-2 text-igm-muted">{p.position}</td>
                          <td className="mono py-1.5 text-right text-igm-muted">{p.minutes}</td>
                          <td className="mono py-1.5 text-right text-igm-acid">{p.goals || ""}</td>
                          <td className="mono py-1.5 text-right text-igm-neon">{p.assists || ""}</td>
                          <td className="mono py-1.5 text-right text-igm-muted">{p.xg.toFixed(2)}</td>
                          <td className="mono py-1.5 text-right font-bold text-igm-ink">{p.rating.toFixed(1)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

/* ------------------------------ sous-composants ------------------------------ */

function toTactics(team?: LabTeam): EngineTactics {
  return {
    mentality: team?.mentality ?? 50,
    tempo: team?.tempo ?? 50,
    pressing: team?.pressing ?? 50,
    width: team?.width ?? 50,
    defensiveLine: team?.defensiveLine ?? 50,
    routineOffensive: team?.routineOffensive ?? ROUTINES_OFFENSIVES[0],
    routineDefensive: team?.routineDefensive ?? ROUTINES_DEFENSIVES[0],
  };
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));
const norm = (h: number, a: number) => (h + a === 0 ? 50 : (h / (h + a)) * 100);

function TacticPanel({
  side,
  team,
  teams,
  value,
  onSelect,
  tactics,
  onChange,
  accent,
}: {
  side: string;
  team?: LabTeam;
  teams: LabTeam[];
  value: number;
  onSelect: (id: number) => void;
  tactics: EngineTactics;
  onChange: (t: EngineTactics) => void;
  accent: string;
}) {
  return (
    <div className="panel p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="mono text-[10px] uppercase tracking-[0.18em]" style={{ color: accent }}>
          {side}
        </p>
        <select
          value={value}
          onChange={(e) => onSelect(Number(e.target.value))}
          className="rounded-lg border border-igm-line bg-igm-void px-3 py-2 text-[13px] text-igm-ink outline-none"
        >
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name} — {t.formation} (CA moy. {t.avgAbility})
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 space-y-3">
        {SLIDERS.map((s) => (
          <label key={s.key} className="block">
            <span className="flex items-center justify-between text-[12px]">
              <span className="font-semibold text-igm-ink">{s.label}</span>
              <span className="mono text-[11px] text-igm-muted">
                {s.key === "mentality"
                  ? `${tactics.mentality} · ${MENTALITY_LABEL(tactics.mentality)}`
                  : String(tactics[s.key])}
              </span>
            </span>
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Number(tactics[s.key])}
              onChange={(e) => onChange({ ...tactics, [s.key]: Number(e.target.value) })}
              className="mt-2 w-full"
            />
            <span className="mt-1 block text-[10.5px] text-igm-muted/60">{s.hint}</span>
          </label>
        ))}

        <div className="grid gap-3 sm:grid-cols-2">
          <label>
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-igm-muted">
              Routine offensive (CPA)
            </span>
            <select
              value={tactics.routineOffensive}
              onChange={(e) => onChange({ ...tactics, routineOffensive: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-igm-line bg-igm-void px-2.5 py-2 text-[12px] text-igm-ink outline-none"
            >
              {ROUTINES_OFFENSIVES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
          <label>
            <span className="mono text-[10px] uppercase tracking-[0.12em] text-igm-muted">
              Couverture défensive (CPA)
            </span>
            <select
              value={tactics.routineDefensive}
              onChange={(e) => onChange({ ...tactics, routineDefensive: e.target.value })}
              className="mt-1.5 w-full rounded-lg border border-igm-line bg-igm-void px-2.5 py-2 text-[12px] text-igm-ink outline-none"
            >
              {ROUTINES_DEFENSIVES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {team ? (
        <p className="mono mt-4 border-t border-igm-line pt-3 text-[10px] uppercase tracking-[0.12em] text-igm-muted/70">
          {team.squadSize} joueurs · notoriété {team.reputation} · {team.formation}
        </p>
      ) : null}
    </div>
  );
}

function TeamBadge({
  colour,
  name,
  formation,
  right,
}: {
  colour: string;
  name: string;
  formation: string;
  right?: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${right ? "flex-row-reverse text-right" : ""}`}>
      <span
        className="grid h-11 w-11 place-items-center rounded-lg text-[13px] font-black text-igm-void"
        style={{ background: colour }}
      >
        {name.slice(0, 3).toUpperCase()}
      </span>
      <div>
        <p className="text-[14px] font-bold text-igm-ink">{name}</p>
        <p className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">{formation}</p>
      </div>
    </div>
  );
}

function XgChart({
  data,
  minute,
  homeColour,
  awayColour,
}: {
  data: { minute: number; home: number; away: number }[];
  minute: number;
  homeColour: string;
  awayColour: string;
}) {
  const visible = data.slice(0, Math.max(1, minute));
  const max = Math.max(1, ...data.map((d) => Math.max(d.home, d.away)));
  const w = 100;
  const h = 42;
  const path = (key: "home" | "away") =>
    visible
      .map((d, i) => {
        const x = (i / Math.max(1, data.length - 1)) * w;
        const y = h - (d[key] / max) * h;
        return `${i === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)}`;
      })
      .join(" ");

  return (
    <div className="mt-4 rounded-lg border border-igm-line bg-igm-void/60 p-3">
      <div className="flex items-center justify-between">
        <p className="mono text-[9.5px] uppercase tracking-[0.14em] text-igm-muted">
          Courbe xG cumulée
        </p>
        <div className="mono flex gap-3 text-[9.5px]">
          <span style={{ color: homeColour }}>■ domicile</span>
          <span style={{ color: awayColour }}>■ extérieur</span>
        </div>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="mt-2 h-28 w-full">
        {[0.25, 0.5, 0.75].map((g) => (
          <line
            key={g}
            x1="0"
            x2={w}
            y1={h * g}
            y2={h * g}
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="0.3"
          />
        ))}
        <path d={path("home")} fill="none" stroke={homeColour} strokeWidth="0.8" />
        <path d={path("away")} fill="none" stroke={awayColour} strokeWidth="0.8" strokeDasharray="1.5 1" />
      </svg>
    </div>
  );
}

function PossessionBar({
  home,
  homeColour,
  awayColour,
  homeName,
  awayName,
}: {
  home: number;
  homeColour: string;
  awayColour: string;
  homeName: string;
  awayName: string;
}) {
  return (
    <div>
      <div className="mono flex justify-between text-[10px] uppercase tracking-[0.12em] text-igm-muted">
        <span>{homeName}</span>
        <span>{home.toFixed(1)} % possession</span>
        <span>{awayName}</span>
      </div>
      <div className="mt-1.5 flex h-3 overflow-hidden rounded-full bg-igm-void">
        <div style={{ width: `${home}%`, background: homeColour }} />
        <div style={{ width: `${100 - home}%`, background: awayColour, opacity: 0.75 }} />
      </div>
    </div>
  );
}

function ZoneTilt({ tilt }: { tilt: { home: number; away: number } }) {
  return (
    <div>
      <p className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">
        Zone d&apos;influence (part du terrain contrôlée)
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1">
        <div className="h-10 rounded-l-md bg-igm-neon/25" />
        <div className="h-10 bg-igm-void/60" />
        <div className="h-10 rounded-r-md bg-igm-acid/25" />
      </div>
      <div className="mono mt-1.5 flex justify-between text-[10px] text-igm-muted">
        <span>{tilt.home} % campé chez l&apos;adversaire</span>
        <span>{tilt.away} %</span>
      </div>
    </div>
  );
}

function StatRow({
  label,
  home,
  away,
  ratio,
  homeColour,
  awayColour,
}: {
  label: string;
  home: string | number;
  away: string | number;
  ratio: number;
  homeColour: string;
  awayColour: string;
}) {
  return (
    <div className="grid grid-cols-[90px_1fr_90px] items-center gap-3 md:grid-cols-[140px_1fr_140px]">
      <span className="mono text-right text-[13px] font-bold text-igm-ink">{home}</span>
      <div>
        <p className="mb-1 text-center text-[11px] text-igm-muted">{label}</p>
        <div className="flex h-2 overflow-hidden rounded-full bg-igm-void">
          <div style={{ width: `${ratio}%`, background: homeColour }} />
          <div style={{ width: `${100 - ratio}%`, background: awayColour, opacity: 0.75 }} />
        </div>
      </div>
      <span className="mono text-[13px] font-bold text-igm-ink">{away}</span>
    </div>
  );
}
