import type { GddChapterSeed } from "./types";

export const techChapters: GddChapterSeed[] = [
  {
    slug: "pipeline-ci-cd",
    code: "CI-13",
    category: "Build",
    title: "Compilation & déploiement : application Windows (.exe) via GitHub Actions",
    subtitle:
      "Un pipeline unique, quatre artefacts signés, trois canaux de diffusion.",
    ownerRole: "DevOps Lead / Release Manager",
    keywords: ["CI/CD", "GitHub Actions", "Electron", "Tauri", "signature", "release"],
    summary:
      "Le dépôt unique d'IGM Manager produit, à chaque push étiqueté, un exécutable Windows autonome (IGMManager.exe) accompagné d'un installateur .msi, d'une archive portable .zip et d'un bundle de symboles de débogage, tous signés et publiés sur un canal Stable, Beta ou Nightly.",
    blocks: [
      {
        kind: "spec",
        title: "Cible de build Windows",
        meta: [
          { label: "Binaire principal", value: "IGMManager.exe — application Windows x64, 100 % autonome (offline-first), taille cible 480–720 Mo décompressé" },
          { label: "Empaqueteur applicatif", value: "Tauri 2 (Rust + WebView2) pour la coquille « Manager Client » ; Electron 34 en variante Desktop Legacy maintenue pour la compatibilité Linux/macOS" },
          { label: "Cœur natif", value: "igm_engine.dll (C++20 / CMake) chargé via FFI N-API ; build MSVC v143, /std:c++20, /O2, /LTCG" },
          { label: "Installateurs", value: "WiX Toolset 5 (.msi), Inno Setup (.exe), MSIX pour le Microsoft Store" },
          { label: "Signature", value: "Azure Trusted Signing (EV) sur les .exe/.dll/.msi, horodatage RFC 3161" },
          { label: "Distributeur", value: "Steam (build via Steamworks CLI), itch.io, GitHub Releases, site officiel (auto-update)" },
        ],
      },
      {
        kind: "list",
        title: "Étages du pipeline GitHub Actions",
        items: [
          "STAGE 1 — static-analysis : clang-tidy, clang-format --dry-run, cppcheck, analyse des include (lint d'architecture), audit des dépendances (cargo audit / npm audit).",
          "STAGE 2 — build-matrix : windows-2025 (x64 + arm64), ubuntu-24.04, macos-15 ; cache sccache + vcpkg ; build Debug et Release.",
          "STAGE 3 — unit-tests : Catch2, 8 400 tests, matrice de shards parallèles (8 jobs), couverture exigée ≥ 78 % sur /engine.",
          "STAGE 4 — golden-replay : 12 000 replis dorés du moteur, tolérance zéro divergence ; échec = blocage du merge.",
          "STAGE 5 — sim-validation : 100 000 matchs simulés (job de 25 min en matrice), vérification des distributions de buts, cartons, blessures et possession.",
          "STAGE 6 — package : CMake/CPack + Tauri build, génération des installateurs, hachage SHA-256, signature à distance.",
          "STAGE 7 — smoke-test : installation silencieuse sur runner Windows, lancement headless, vérification /health du service local et fermeture propre.",
          "STAGE 8 — release : création du draft GitHub Release, upload des artefacts, publication du canal selon l'étiquette (vX.Y.Z / beta / nightly), génération du changelog.",
        ],
      },
      {
        kind: "table",
        title: "Déclencheurs et canaux",
        meta: [
          { label: "Déclencheur", value: "Résultat" },
          { label: "push sur feature/*", value: "Stages 1 à 3, artefact non signé « dev build », durée ≤ 11 min" },
          { label: "pull request sur main", value: "Stages 1 à 5, rapport de simulation joint, nécessaire pour merge" },
          { label: "push sur main", value: "Stages 1 à 6, publication du canal Nightly, auto-update activé" },
          { label: "tag v*.*.*-beta.N", value: "Stages 1 à 8, canal Beta, collecte de télémétrie de gameplay" },
          { label: "tag v*.*.*", value: "Stages 1 à 8 + déploiement Steam + Store, canal Stable, figeage de la base de données" },
        ],
      },
      {
        kind: "paragraph",
        title: "Structure du dépôt (monorepo)",
        body:
          "Le monorepo est organisé en modules CMake : /engine (moteur de match, C++), /simcore (monde persistant), /graphdb (stockage), /shell (interface native), /client (coquille Tauri/Electron chargée depuis Next.js pour la partie portail et services web), /tools (éditeur de base, générateurs, calibrateur), /data (bases de joueurs, règles, identités nationales), /tests (unitaires, replis dorés, simulateurs), /.github/workflows (pipelines). Cette organisation permet de compiler uniquement la couche concernée par un commit et de conserver un cache de build utile entre les exécutions.",
      },
      {
        kind: "callout",
        title: "Sécurité de la chaîne de build",
        body:
          "Aucun secret n'est stocké dans le dépôt : les certificats de signature sont appelés via OIDC GitHub ↔ Azure Trusted Signing. Les artefacts sont vérifiés par hash avant publication, et chaque release est accompagnée d'une attestation de provenance (Sigstore). Le dépôt applique la protection de branche, la signature de commit obligatoire et la revue de code obligatoire sur /engine et /data.",
      },
    ],
  },
  {
    slug: "roadmap-qa",
    code: "QA-14",
    category: "Production",
    title: "Roadmap de production, assurance qualité & budgets de performance",
    subtitle:
      "26 mois, 9 jalons, 4 000 cas de test, zéro régression déterministe.",
    ownerRole: "Producer / QA Lead",
    keywords: ["roadmap", "milestones", "QA", "performance", "tests"],
    summary:
      "La production suit une logique de tranches verticales : chaque jalon livre un système complet, jouable et testé, plutôt qu'une accumulation de fonctionnalités partielles.",
    blocks: [
      {
        kind: "list",
        title: "Stratégie de test",
        items: [
          "Tests unitaires : 8 400 cas sur les systèmes de règles (moral, contrats, blessures, xG, développement).",
          "Tests de propriétés : invariants vérifiés sur 100 000 simulations (aucun budget négatif, aucune masse salariale négative, population mondiale stable, aucun joueur de moins de 14 ans).",
          "Replis dorés : déterminisme du moteur, toute divergence bloque la release.",
          "Tests de charge : chargement de la base, simulation de 10 saisons consécutives, mesure de la dérive de mémoire (< 120 Mo sur 10 saisons).",
          "Playtests : 40 sessions, 12 panels de joueurs FM expérimentés, mesure du temps de prise en main et de la lisibilité des causes.",
          "Tests de localisation : pseudo-localisation, troncature de texte, polices non latines (Cyrillique, arabe, CJK).",
        ],
      },
      {
        kind: "spec",
        title: "Critères de sortie (Definition of Done d'un jalon)",
        meta: [
          { label: "Bugs bloquants", value: "0 ouvert ; bugs majeurs ≤ 4 avec contournement documenté" },
          { label: "Couverture /engine", value: "≥ 78 % lignes, ≥ 65 % branches" },
          { label: "Frame time moteur", value: "p95 ≤ 12,5 ms à 60 FPS sur GTX 1650 + Ryzen 5 3600" },
          { label: "Stabilité", value: "0 crash sur 200 h de soak test automatisé" },
          { label: "Équilibrage", value: "Distribution des scores à ±0,06 but/match des cibles réelles du football européen" },
          { label: "Accessibilité", value: "Audit WCAG AA sans anomalie bloquante" },
        ],
      },
      {
        kind: "callout",
        title: "Risques majeurs et mitigations",
        body:
          "R1 — Complexité du moteur de match (élevée) : mitigation par tranche verticale et replis dorés dès le premier jour. R2 — Volumétrie de la base (élevée) : mitigation par stockage colonnaire et tests de charge hebdomadaires. R3 — Dérive d'équilibrage (moyenne) : mitigation par calibration automatique en CI sur 100 000 matchs. R4 — Fuite de secrets de signature (critique) : mitigation OIDC, pas de secret persistant. R5 — Perte de lisibilité pour le joueur novice (moyenne) : mitigation par mode Délégation et tutoriel contextuel testé en playtest à chaque jalon.",
      },
    ],
  },
];
