import { readFile } from "node:fs/promises";
import path from "node:path";
import { SectionTitle } from "@/components/Blocks";
import { getChapter } from "@/lib/queries";

export const dynamic = "force-dynamic";

const STAGES = [
  {
    id: "1",
    name: "Analyse statique",
    detail:
      "Lint d'architecture (includes UI ↔ simulation interdits), formatage, audit des dépendances. Durée cible ≤ 2 min.",
    colour: "#35d0ff",
  },
  {
    id: "2",
    name: "Build matricielle",
    detail:
      "windows-2025 x64 + arm64, ubuntu-24.04, macos-15. CMake + Ninja, cache sccache et vcpkg, build Debug et Release.",
    colour: "#7ee787",
  },
  {
    id: "3",
    name: "Tests unitaires",
    detail:
      "8 400 cas shardés en 8 jobs parallèles. Exigence de couverture ≥ 78 % sur /engine.",
    colour: "#35d0ff",
  },
  {
    id: "4",
    name: "Replis dorés",
    detail:
      "12 000 replis du moteur de match. Tolérance zéro divergence : garantit le déterminisme exigé par le pilier P5.",
    colour: "#ffb84d",
  },
  {
    id: "5",
    name: "Validation de simulation",
    detail:
      "100 000 matchs simulés contre PostgreSQL de service. Contrôle des distributions de buts, cartons, blessures, possession.",
    colour: "#ffb84d",
  },
  {
    id: "6",
    name: "Empaquetage Windows",
    detail:
      "electron-builder (NSIS) + WiX Toolset 5 (.msi) + archive portable. Signature Azure Trusted Signing via OIDC.",
    colour: "#ff5d7a",
  },
  {
    id: "7",
    name: "Smoke test",
    detail:
      "Installation silencieuse sur runner Windows, lancement headless, attente de /api/health, contrôle Authenticode, arrêt propre.",
    colour: "#ff5d7a",
  },
  {
    id: "8",
    name: "Publication",
    detail:
      "Draft GitHub Release + attestation de provenance + déploiement Steam/Store selon le canal (Stable, Beta, Nightly).",
    colour: "#7ee787",
  },
];

const TRIGGERS = [
  ["push sur feature/*", "Stages 1 → 3, artefact non signé, ≤ 11 min"],
  ["pull request sur main", "Stages 1 → 5, rapport de simulation joint, obligatoire pour merger"],
  ["push sur main", "Stages 1 → 6, canal Nightly, auto-update activé"],
  ["tag v*.*.*-beta.N", "Stages 1 → 8, canal Beta, télémétrie de gameplay activée"],
  ["tag v*.*.*", "Stages 1 → 8 + Steam + Microsoft Store, figeage de la base de données"],
];

const ARTIFACTS = [
  { name: "IGMManager.exe", detail: "Exécutable portable Windows x64, autonome (offline-first)", size: "≈ 310 Mo" },
  { name: "IGMManager-Setup.exe", detail: "Installateur NSIS : raccourcis, désinstalleur, per-user", size: "≈ 240 Mo" },
  { name: "IGMManager-x64.msi", detail: "Installateur entreprise (per-machine, déploiement GPO)", size: "≈ 235 Mo" },
  { name: "IGMManager-portable.zip", detail: "Archive autonome, sans installation ni registre", size: "≈ 190 Mo" },
  { name: "symbols.zip", detail: "PDB + cartes sources pour le crash reporting et l'analyse post-mortem", size: "≈ 420 Mo" },
];

export default async function PipelinePage() {
  const [chapter, yaml] = await Promise.all([
    getChapter("pipeline-ci-cd"),
    readFile(path.join(process.cwd(), ".github/workflows/windows-build.yml"), "utf8").catch(
      () => "# Fichier .github/workflows/windows-build.yml introuvable dans cet environnement.",
    ),
  ]);

  return (
    <div>
      <SectionTitle
        eyebrow="CI-13 · Compilation & déploiement"
        title="Produire IGMManager.exe avec GitHub Actions"
        description="Le dépôt unique produit, à chaque étiquette, un exécutable Windows signé, un installateur .msi, une archive portable et un bundle de symboles. Le workflow ci-dessous est le fichier réel présent dans le dépôt : il est exécuté tel quel par GitHub Actions."
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {STAGES.map((s) => (
          <div key={s.id} className="panel p-5">
            <div className="flex items-center gap-3">
              <span
                className="mono grid h-8 w-8 place-items-center rounded-md text-[13px] font-black"
                style={{ background: `${s.colour}1f`, color: s.colour, border: `1px solid ${s.colour}55` }}
              >
                {s.id}
              </span>
              <h3 className="text-[14px] font-bold text-igm-ink">{s.name}</h3>
            </div>
            <p className="mt-3 text-[12.5px] leading-relaxed text-igm-muted">{s.detail}</p>
          </div>
        ))}
      </section>

      <section className="mt-10 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-igm-ink">
            Workflow réel — .github/workflows/windows-build.yml
          </h2>
          <div className="panel overflow-hidden">
            <div className="flex items-center gap-2 border-b border-igm-line bg-igm-void/60 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-igm-rose/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-igm-amber/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-igm-acid/70" />
              <span className="mono ml-2 text-[11px] text-igm-muted">
                8 stages · 3 canaux · signature OIDC
              </span>
            </div>
            <pre className="mono max-h-[620px] overflow-auto p-4 text-[11px] leading-relaxed text-igm-muted">
              <code>{yaml}</code>
            </pre>
          </div>
        </div>

        <div className="space-y-6">
          <div className="panel p-5">
            <h3 className="text-[14px] font-bold text-igm-ink">Déclencheurs et canaux</h3>
            <table className="mt-3 w-full text-left text-[12.5px]">
              <tbody>
                {TRIGGERS.map(([t, r]) => (
                  <tr key={t} className="border-b border-igm-line/50 last:border-0">
                    <td className="mono py-2 pr-3 align-top text-[11px] text-igm-neon">{t}</td>
                    <td className="py-2 text-igm-muted">{r}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="panel p-5">
            <h3 className="text-[14px] font-bold text-igm-ink">Artefacts publiés</h3>
            <ul className="mt-3 space-y-3">
              {ARTIFACTS.map((a) => (
                <li key={a.name} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="mono text-[12.5px] text-igm-ink">{a.name}</p>
                    <p className="text-[11.5px] text-igm-muted">{a.detail}</p>
                  </div>
                  <span className="mono shrink-0 text-[11px] text-igm-acid">{a.size}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="panel p-5">
            <h3 className="text-[14px] font-bold text-igm-ink">Coquille applicative</h3>
            <ul className="mt-3 space-y-2 text-[12.5px] text-igm-muted">
              <li>
                <span className="mono text-igm-neon">desktop/main.js</span> — processus principal :
                fenêtre, supervision du service de simulation, redémarrage automatique.
              </li>
              <li>
                <span className="mono text-igm-neon">desktop/preload.js</span> — pont contextuel
                sandboxé, aucune règle de jeu côté interface.
              </li>
              <li>
                <span className="mono text-igm-neon">desktop/builder.json</span> — cibles NSIS / MSI /
                ZIP, signature RFC 3161, canal GitHub Releases.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {chapter ? (
        <section className="mt-10">
          <h2 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-igm-ink">
            Chapitre CI-13 du GDD
          </h2>
          <div className="space-y-5">
            {chapter.blocks.map((b) => (
              <section key={b.id} className="panel p-5">
                <div className="mb-3 flex items-center gap-3">
                  <span className="mono text-[10px] uppercase tracking-[0.18em] text-igm-acid">
                    {b.kind}
                  </span>
                  <span className="h-px flex-1 bg-igm-line" />
                </div>
                <h3 className="text-[15px] font-bold text-igm-ink">{b.title}</h3>
                {b.body ? (
                  <p className="mt-3 whitespace-pre-line text-[13.5px] leading-relaxed text-igm-muted">
                    {b.body}
                  </p>
                ) : null}
                {b.items.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {b.items.map((item, i) => (
                      <li key={i} className="flex gap-3 text-[13px] leading-relaxed text-igm-muted">
                        <span className="mono text-[11px] text-igm-neon/70">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
                {b.meta.length > 0 ? (
                  <div className="mt-4 overflow-hidden rounded-lg border border-igm-line">
                    <table className="w-full border-collapse text-left text-[13px]">
                      <tbody>
                        {b.meta.map((row, i) => (
                          <tr key={i} className={i % 2 === 0 ? "bg-igm-void/40" : "bg-igm-void/10"}>
                            <th className="w-[38%] px-3 py-2 align-top font-semibold text-igm-ink/90">
                              {row.label}
                            </th>
                            <td className="px-3 py-2 align-top text-igm-muted">{row.value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
