"use client";

import { useMemo, useState } from "react";

export type SquadPlayer = {
  id: number;
  name: string;
  position: string;
  role: string;
  age: number;
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

export type SquadTeam = {
  id: number;
  name: string;
  city: string;
  country: string;
  colour: string;
  formation: string;
  reputation: number;
  facilities: number;
  squad: SquadPlayer[];
};

const POSITIONS = ["Tous", "GK", "DC", "DL", "DR", "DM", "MC", "AMC", "AML", "AMR", "ST"];

function mask(value: number, knowledge: number, scale = 20): string {
  if (knowledge < 6) return "?";
  const width = Math.round((1 - knowledge / 63) * (scale / 2.6));
  if (width <= 0) return String(value);
  const low = Math.max(1, value - width);
  const high = Math.min(scale, value + width);
  return low === high ? String(low) : `${low}-${high}`;
}

function bar(value: number, max = 20) {
  const pct = (value / max) * 100;
  const colour = pct > 70 ? "bg-igm-acid" : pct > 45 ? "bg-igm-neon" : pct > 25 ? "bg-igm-amber" : "bg-igm-rose";
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-igm-void">
      <div className={`h-full ${colour}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

export function SquadBrowser({ teams }: { teams: SquadTeam[] }) {
  const [teamId, setTeamId] = useState(teams[0]?.id ?? 0);
  const [position, setPosition] = useState("Tous");
  const [sortKey, setSortKey] = useState<"ca" | "pa" | "age" | "value" | "morale">("ca");
  const [knowledge, setKnowledge] = useState(63);
  const [search, setSearch] = useState("");

  const team = teams.find((t) => t.id === teamId);
  const attributeKeys = useMemo(() => {
    const first = team?.squad[0]?.attributes ?? {};
    return Object.keys(first);
  }, [team]);

  const rows = useMemo(() => {
    if (!team) return [];
    return team.squad
      .filter((p) => (position === "Tous" ? true : p.position === position))
      .filter((p) => (search ? p.name.toLowerCase().includes(search.toLowerCase()) : true))
      .sort((a, b) => {
        switch (sortKey) {
          case "pa":
            return b.potentialAbility - a.potentialAbility;
          case "age":
            return a.age - b.age;
          case "value":
            return b.value - a.value;
          case "morale":
            return b.morale - a.morale;
          default:
            return b.currentAbility - a.currentAbility;
        }
      });
  }, [team, position, search, sortKey]);

  const trueAvg = team
    ? Math.round(team.squad.reduce((s, p) => s + p.currentAbility, 0) / Math.max(1, team.squad.length))
    : 0;

  return (
    <div className="space-y-5">
      <div className="panel p-5">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_1fr]">
          <label className="block">
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">Club</span>
            <select
              value={teamId}
              onChange={(e) => setTeamId(Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-igm-line bg-igm-void px-3 py-2 text-[13px] text-igm-ink outline-none"
            >
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.city})
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">Poste</span>
            <select
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-igm-line bg-igm-void px-3 py-2 text-[13px] text-igm-ink outline-none"
            >
              {POSITIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">Tri</span>
            <select
              value={sortKey}
              onChange={(e) => setSortKey(e.target.value as typeof sortKey)}
              className="mt-1.5 w-full rounded-lg border border-igm-line bg-igm-void px-3 py-2 text-[13px] text-igm-ink outline-none"
            >
              <option value="ca">Capacité actuelle</option>
              <option value="pa">Potentiel</option>
              <option value="age">Âge</option>
              <option value="value">Valeur</option>
              <option value="morale">Moral</option>
            </select>
          </label>

          <label className="block">
            <span className="mono text-[10px] uppercase tracking-[0.14em] text-igm-muted">
              Recherche
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Nom du joueur…"
              className="mt-1.5 w-full rounded-lg border border-igm-line bg-igm-void px-3 py-2 text-[13px] text-igm-ink outline-none focus:border-igm-acid/50"
            />
          </label>
        </div>

        <div className="mt-5 rounded-lg border border-igm-line bg-igm-void/60 p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="mono text-[10px] uppercase tracking-[0.14em] text-igm-amber">
                Modèle de connaissance — attribute masking (SC-05)
              </p>
              <p className="mt-1 text-[12px] text-igm-muted">
                Connaissance du club sur ses propres joueurs :{" "}
                <span className="mono font-bold text-igm-acid">{knowledge}/63</span> — soit{" "}
                {Math.round((knowledge / 63) * 100)} % d&apos;attributs révélés.
              </p>
            </div>
            <div className="flex gap-2">
              {[6, 20, 40, 63].map((k) => (
                <button
                  key={k}
                  type="button"
                  onClick={() => setKnowledge(k)}
                  className={`mono rounded-md border px-2.5 py-1.5 text-[11px] ${
                    knowledge === k
                      ? "border-igm-acid/60 bg-igm-acid/10 text-igm-acid"
                      : "border-igm-line text-igm-muted"
                  }`}
                >
                  {k === 6 ? "Jamais vu" : k === 20 ? "1 rapport" : k === 40 ? "6 rapports" : "Connaissance totale"}
                </button>
              ))}
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={63}
            value={knowledge}
            onChange={(e) => setKnowledge(Number(e.target.value))}
            className="mt-3 w-full"
          />
          <p className="mt-2 text-[11px] leading-relaxed text-igm-muted/80">
            σ_attr = 4,2 · (1 − Connaissance/63) · 1 / (1 + 0,18 · JugementRecruteur) · ModificateurDistance.
            Un attribut jamais observé est affiché « ? » ; la connaissance se dégrade de 1,5 point par
            saison sans observation et disparaît après 24 mois.
          </p>
        </div>
      </div>

      {team ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {[
              { label: "Effectif", value: String(team.squad.length) },
              { label: "CA moyen (réel)", value: String(trueAvg) },
              { label: "Formation", value: team.formation },
              { label: "Installations", value: `${team.facilities}/100` },
              { label: "Notoriété", value: String(team.reputation) },
            ].map((m) => (
              <div key={m.label} className="panel-flat p-3">
                <p className="mono text-[9.5px] uppercase tracking-[0.12em] text-igm-muted">
                  {m.label}
                </p>
                <p className="mono mt-1 text-[15px] font-bold text-igm-ink">{m.value}</p>
              </div>
            ))}
          </div>

          <div className="panel overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left text-[12px]">
              <thead>
                <tr className="border-b border-igm-line text-[9.5px] uppercase tracking-[0.1em] text-igm-muted">
                  <th className="sticky left-0 bg-igm-panel px-3 py-3">Joueur</th>
                  <th className="px-2 py-3">P</th>
                  <th className="px-2 py-3 text-right">Âge</th>
                  <th className="px-2 py-3 text-right">CA</th>
                  <th className="px-2 py-3 text-right">PA</th>
                  <th className="px-2 py-3 text-right">Moral</th>
                  <th className="px-2 py-3 text-right">Risque</th>
                  <th className="px-2 py-3 text-right">Valeur</th>
                  {attributeKeys.map((k) => (
                    <th key={k} className="px-1.5 py-3 text-center" title={k}>
                      {k.slice(0, 3).toUpperCase()}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((p) => (
                  <tr key={p.id} className="border-b border-igm-line/30 last:border-0 hover:bg-igm-void/40">
                    <td className="sticky left-0 bg-igm-panel px-3 py-2">
                      <p className="font-semibold text-igm-ink">{p.name}</p>
                      <p className="text-[10px] text-igm-muted/70">{p.role}</p>
                    </td>
                    <td className="mono px-2 py-2 text-igm-neon">{p.position}</td>
                    <td className="mono px-2 py-2 text-right text-igm-muted">{p.age}</td>
                    <td className="mono px-2 py-2 text-right font-bold text-igm-ink">
                      {mask(p.currentAbility, knowledge, 200)}
                    </td>
                    <td className="mono px-2 py-2 text-right text-igm-acid">
                      {mask(p.potentialAbility, knowledge, 200)}
                    </td>
                    <td className="px-2 py-2 text-right">
                      <div className="ml-auto w-14">
                        <p className="mono text-[10.5px] text-igm-muted">{mask(p.morale, knowledge, 100)}</p>
                        {bar(p.morale, 100)}
                      </div>
                    </td>
                    <td className="mono px-2 py-2 text-right text-igm-muted">
                      {mask(p.injuryRisk, knowledge, 100)}
                    </td>
                    <td className="mono px-2 py-2 text-right text-igm-muted">
                      {p.value >= 1000
                        ? `${(p.value / 1000).toFixed(1)} M€`
                        : `${p.value} k€`}
                    </td>
                    {attributeKeys.map((k) => {
                      const v = p.attributes[k] ?? 0;
                      return (
                        <td key={k} className="px-1.5 py-2 text-center" title={`${k} : ${v}`}>
                          <span className="mono text-[11px] text-igm-muted">{mask(v, knowledge)}</span>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-igm-muted/70">
            Les valeurs en clair correspondent à la vérité interne du moteur ; les fourchettes
            correspondent à ce qu&apos;un club avec {knowledge}/63 de connaissance afficherait. Un
            recruteur adverse ne voit jamais ces valeurs : il ne voit que ses propres estimations.
          </p>
        </>
      ) : null}
    </div>
  );
}
