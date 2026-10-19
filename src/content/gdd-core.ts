import type { GddChapterSeed } from "./types";

export const coreChapters: GddChapterSeed[] = [
  {
    slug: "vision-produit",
    code: "VP-00",
    category: "Produit",
    title: "Vision, piliers de design & cible d'expérience",
    subtitle:
      "IGM Manager : le simulateur de gestion football total, 60 000 entités actives, 0 script, 100 % émergent.",
    ownerRole: "Creative Director / Lead Game Designer",
    keywords: ["vision", "piliers", "persona", "positionnement", "USP"],
    summary:
      "IGM Manager est un simulateur de gestion de football ultra-réaliste dont la promesse centrale est l'absolue causalité : chaque décision managériale se propage dans un monde simulé de plus de 500 000 personnes, sans événement scripté. Le joueur ne joue pas contre un scénario, il joue contre un système.",
    blocks: [
      {
        kind: "paragraph",
        title: "Énoncé de vision",
        body:
          "« IGM Manager doit être l'endroit où le football existe réellement à l'intérieur d'une machine. Aucune décision ne doit être prise par le jeu sans que le joueur puisse, a posteriori, en retrouver la cause dans les données. Aucune sensation de dirigisme, aucune quarter-hour of magic, aucun rubber-banding. Si l'utilisateur perd 5-0, il doit pouvoir ouvrir le Data Hub, comprendre précisément pourquoi il a perdu, et identifier les trois leviers correctifs. »",
      },
      {
        kind: "list",
        title: "Les cinq piliers de design",
        items: [
          "P1 — CAUSALITÉ TOTALE : chaque résultat sportif, financier et social découle d'une chaîne de règles traçables (tactique → exécution → xG → résultat → moral → vestiaire → performance).",
          "P2 — PROFONDEUR SANS FRICTION : toute mécanique complexe est optionnelle ; le jeu propose une couche « Directeur Sportif délégué » qui pilote les modules non maîtrisés, sans jamais masquer la causalité.",
          "P3 — MONDE VIVANT PERSISTANT : 118 ligues, 2 300 clubs, 500 000+ personnes simulées simultanément, à des fréquences de rafraîchissement différenciées (full-fidelity pour la division du joueur, modèle statistique dégradé pour le reste).",
          "P4 — TRANSPARENCE PROGRESSIVE : les données sont masquées par la connaissance (attribute masking) mais jamais fausses. Le scouting approxime, il n'invente pas.",
          "P5 — RÉPÉTABILITÉ & ÉQUITÉ : moteur déterministe par graine. Un même match avec la même graine, les mêmes onze joueurs et les mêmes consignes produit exactement le même déroulé (exigence de débogage, d'e-sport et de rejeu).",
        ],
      },
      {
        kind: "spec",
        title: "Fiche produit",
        meta: [
          { label: "Nom commercial", value: "IGM Manager (Isekai Global Manager)" },
          { label: "Genre", value: "Simulation de gestion sportive / Football Management" },
          { label: "Plateformes", value: "Windows 10/11 x64 (.exe principal), macOS, Linux, Steam Deck (Verified), consoles en post-launch" },
          { label: "Modèle économique", value: "Premium + édition saisonnière + DLC base de données historique + Steam Workshop (tactics & DB custom)" },
          { label: "Durée d'une session type", value: "45–180 min ; carrière moyenne 120 h ; boucle « un match + préparation » 25 min" },
          { label: "Langues", value: "18 langues, dont 5 doublages de commentaires (FR, EN, ES, DE, IT)" },
          { label: "Public visé", value: "Core & hardcore 16–55 ans, joueurs de FM, puristes de data, publics consoliers en accès simplifié" },
          { label: "Note cible", value: "Metacritic 88+, « la simulation la plus juste jamais produite »" },
        ],
      },
      {
        kind: "table",
        title: "Personas et implications de design",
        meta: [
          { label: "Persona", value: "Besoin dominant" },
          { label: "Le Tacticien (38 %)", value: "Labo tactique, créateur de coups de pied arrêtés, analyse post-match granulaire" },
          { label: "Le Directeur Sportif (24 %)", value: "Scouting mondial, attribution masquée, négociation, gestion de masse salariale" },
          { label: "Le Bâtisseur (21 %)", value: "Centre de formation, newgens, plan à 10 saisons, culture de club" },
          { label: "Le Narratif / Immersif (11 %)", value: "Vestiaire, causeries, médias, board, rivalités, storyline émergentes" },
          { label: "L'Arbitrage équilibré (6 %)", value: "Mode Online, ligues persistantes, e-sport, rejeu déterministe" },
        ],
      },
      {
        kind: "callout",
        title: "Anti-vision : ce que IGM Manager refuse de faire",
        body:
          "Aucun script de rachat, aucune triche de l'IA pour « équilibrer » une ligue, aucune décision prise hors du modèle (pas de forçage de transfert vers un club prestige), aucun attribut aléatoire recalculé en cours de partie. L'IA adversaire respecte strictement les mêmes règles économiques et sportives que le joueur : elle peut se tromper, se surendetter, se faire reléguer et se dissoudre.",
      },
    ],
  },
  {
    slug: "architecture-globale",
    code: "AR-01",
    category: "Architecture",
    title: "Architecture logicielle de IGM Manager Engine",
    subtitle:
      "Un cœur natif multi-process, une couche données en graphe, un shell UI découplé.",
    ownerRole: "Lead Developer / Architecte Système",
    keywords: ["architecture", "process", "ECS", "modules", "threading", "IHM"],
    summary:
      "L'application est découpée en quatre processus isolés : le Shell UI (rendu), le Simulation Core (monde persistant), le Match Engine (temps réel) et le Data Service (graphe + requêtage). La communication passe par un bus mémoire partagée et un canal de messages versionné, ce qui permet de faire tourner chaque processus à sa propre cadence.",
    blocks: [
      {
        kind: "list",
        title: "Décomposition en processus",
        items: [
          "IGM.Shell (32–120 FPS) : rendu de l'interface, pipeline d'animations 2D/3D, entrées, localisation. Aucune règle de jeu ici.",
          "IGM.SimCore (tick 1× par journée de championnat, plans de tâches parallèles) : avancement du monde, transferts, moral, blessures, ligues non jouées, presse, board, newgens.",
          "IGM.MatchEngine (60 FPS fixes, pas de simulation variable) : simulation temps réel du match en cours, streaming d'états vers le Shell à 20 Hz.",
          "IGM.DataService : gestionnaire du graphe, cache de requêtes, pooling de connexions, export/import de bases, éditeur de base de données.",
        ],
      },
      {
        kind: "spec",
        title: "Contrats techniques non négociables",
        meta: [
          { label: "Langage cœur", value: "C++20 (modules, coroutines, SIMD explicite) + Rust pour le parseur de DB et les outils" },
          { label: "UI", value: "Framework maison « Slate-like » en C++20, accélération GPU, thème dynamique" },
          { label: "Sérialisation", value: "Binaire à plat, schéma versionné (schema_version), migration à chaud sans perte de carrière" },
          { label: "Build", value: "CMake + Ninja, vcpkg pour les dépendances, cache sccache, PCH partagé" },
          { label: "Tests", value: "Catch2 (unitaire),gtest golden-replay (moteur), fuzzing libFuzzer sur le parseur de DB" },
          { label: "CI/CD", value: "GitHub Actions : build Windows .exe signé, artefacts .msi/.zip, release channel Stable/Beta/Nightly" },
          { label: "Télémétrie", value: "Opt-out, locale d'abord, aucun événement hors gameplay" },
        ],
      },
      {
        kind: "paragraph",
        title: "Couche domaine : modèle ECS hybride",
        body:
          "Le monde est décrit dans un modèle « composants de données » : une entité Person, Club, Contract, Match et Fixture est un identifiant stable (uint64) auquel s'attachent des composants (AttributeSet, Morale, InjuryState, TacticalFamiliarity, ReputationVector). Les systèmes (MoraleSystem, ContractSystem, TransferSystem…) parcourent des archétypes en mémoire contiguë (structure-of-arrays) pour rester cache-friendly. Les relations plusieurs-à-plusieurs (Person↔Club, Person↔Person pour la hiérarchie sociale, Club↔Competition) sont stockées dans des tables d'adjacence compressées : c'est la « Graph Database » interne, sans dépendre d'un serveur externe.",
      },
      {
        kind: "table",
        title: "Fréquences de simulation (LOD — Level Of Detail)",
        meta: [
          { label: "Niveau", value: "Contenu simulé" },
          { label: "LOD 0 — Full fidelity", value: "Division du joueur + 2 divisions adjacentes : chaque match simulé par le Match Engine léger (200 itérations/minute), attributs complets, moral individuel" },
          { label: "LOD 1 — Semi-detail", value: "Divisions nationales du pays du joueur : effectifs agrégés, résultats par modèle Poisson calibré, moral de club" },
          { label: "LOD 2 — Statistical", value: "Reste du monde : notoriété de club, forme longue, classement, effectifs générés à la volée lors d'un scouting" },
          { label: "LOD 3 — Ghost", value: "Pays hors périmètre : joueurs seulement « révélés » à la demande, génération déterministe depuis la graine monde" },
        ],
      },
      {
        kind: "formula",
        title: "Répartition du budget de calcul par journée de championnat",
        body:
          "Coût(journée) = Σ LOD0·(11 × 200 × 90) + Σ LOD1·(11 × 40) + Σ LOD2·(1 × 4)  →  cible ≤ 1,8 s sur CPU 8 cœurs à 3,0 GHz pour 2 300 clubs, exécution en JobSystem avec 1 tâche par match, flot de dépendances (résultats → classements → moral → presse → board) résolu en 6 vagues.",
      },
      {
        kind: "callout",
        title: "Règle d'or d'ingénierie",
        body:
          "Aucune règle de jeu ne doit être exécutée dans le processus UI, et aucun affichage ne doit être exécuté dans le processus de simulation. Toute nouvelle fonctionnalité est d'abord écrite comme une fonction pure testable sur un état de monde sérialisable, puis branchée sur le bus. Cette contrainte est vérifiée par un lint d'architecture dans la CI (analyse des include directives).",
      },
    ],
  },
  {
    slug: "moteur-de-match",
    code: "ME-02",
    category: "Moteur",
    title: "Match Engine : simulation temps réel à 60 FPS",
    subtitle:
      "22 agents cognitifs, un ballon physique, 60 décisions par seconde et par joueur.",
    ownerRole: "Lead Gameplay Engineer / AI Engineer",
    keywords: ["moteur", "60 FPS", "physique", "IA", "animation", "arbres de décision"],
    summary:
      "Le moteur de match simule chaque seconde de jeu : le ballon est un corps physique, les 22 joueurs sont des agents à mémoire courte et à modèle énergétique, l'arbitre applique les Lois du Jeu, et la tactique du manager agit uniquement via des poids comportementaux — jamais via des scripts d'action.",
    blocks: [
      {
        kind: "spec",
        title: "Boucle de simulation (fixed timestep)",
        meta: [
          { label: "Cadence logique", value: "60 Hz fixe (dt = 16,666 ms), accumulation du temps réel, rattrapage max 5 ticks" },
          { label: "Échelle temps", value: "1 s réelle = 1 s de jeu en « temps réel », jusqu'à 20× en accéléré (saut des ticks de rendu)" },
          { label: "Surface de jeu", value: "105 × 68 m, maille de collision 0,25 m, 3 zones verticales × 6 couloirs horizontaux" },
          { label: "Physique ballon", value: "Intégration semi-implicite d'Euler, traînée Magnus, rebonds avec restitution 0,62 sur gazon sec, état « gazon mouillé » modifié" },
          { label: "Rendu", value: "Caméra 2D « engine viewer » et viewer 3D ; la vue 2D est l'affichage de référence pour l'analyse" },
          { label: "Déterminisme", value: "xorshift128+ seedé par (match_id, tick) ; ordre de mise à jour strict et reproductible" },
        ],
      },
      {
        kind: "list",
        title: "Pipeline d'un tick de jeu",
        items: [
          "1. PERCEPTION (0,4 ms) : chaque agent met à jour sa carte de perception — 22 positions, vecteur ballon, pression adverse, espace disponible — avec bruit proportionnel à Concentration et Anticipation.",
          "2. ÉVALUATION TACTIQUE (0,9 ms) : traduction des consignes (mentality, pressing, tempo, largeur, ligne défensive) en poids d'utilité pour 34 actions candidates.",
          "3. DÉCISION (1,2 ms) : arbre d'utilité + MTCS léger (rollouts de 3 plies sur les 4 meilleures options) pour les porteurs du ballon ; les autres joueurs utilisent des comportements à base de rôles.",
          "4. EXÉCUTION (1,0 ms) : interpolation des intentions en trajectoires, frappe du ballon avec dispersion Gaussienne dépendante de la Technique et de la pression.",
          "5. RÉSOLUTION PHYSIQUE (0,8 ms) : collisions ballon-joueur, joueur-joueur (modèle de force), hors-jeu, sorties de ballon.",
          "6. ÉVÉNEMENTS & TELEMETRY (0,3 ms) : émission d'événements (passe, tacle, tir, faute, arrêt) horodatés avec positions exactes pour le Data Hub.",
          "7. ÉTAT ÉNERGÉTIQUE (0,2 ms) : décrément ATP par joueur (sprints, duels, pressing), accumulation de fatigue aiguë et chronique.",
        ],
      },
      {
        kind: "formula",
        title: "Modèle d'utilité de décision du porteur",
        body:
          "U(a) = w_s·Score(a) + w_t·AlignementTactique(a) + w_r·Risque(a) + w_c·CoûtÉnergétique(a) + w_p·PréférencePersonnelle(a)\navec w_p issu des 16 Traits de personnalité et PréférencePersonnelle modulée par la Familiarité Tactique (0–100).\nExemple : un « Playmaker » avec Flair 17 et Décisions 12 verra w_p · risque négatif augmenté sur les passes cassant les lignes.",
      },
      {
        kind: "table",
        title: "Principaux sous-systèmes",
        meta: [
          { label: "Sous-système", value: "Rôle et modèle" },
          { label: "Cognition joueur", value: "Hierarchical Task Network + utility AI ; 34 actions, 9 rôles défensifs, 14 rôles offensifs" },
          { label: "Modèle énergétique", value: "Réserve ATP (0–100), seuil anaérobie, déclin de Vitesse/Agité/Détermination au-delà de 70 % de fatigue" },
          { label: "Gardien", value: "Modèle dédié : angle blocking, positionnement en fonction du porteur, décision sortie/aérien, réflexes avec latence" },
          { label: "Arbitrage", value: "Application des 17 Lois du Jeu, tolérance par arbitre (profil sévérité/jeu avantage), VAR sur 4 catégories" },
          { label: "Blessures en match", value: "Probabilité par contact, liée à Force/Endurance/Agité et à l'historique médical ; sortie sur civière et remplacement" },
          { label: "Commentaires", value: "Génération à partir des événements + contexte (enjeu, score, temps), 6 niveaux d'excitation" },
        ],
      },
      {
        kind: "paragraph",
        title: "Fidélité vs performance : les trois modes de résolution",
        body:
          "Le match du joueur est simulé en résolution « full » (60 Hz, tous les agents). Les matchs des autres équipes du même championnat sont simulés en résolution « compressed » (20 Hz, cognition simplifiée, mêmes modèles de résultat). Les matchs des niveaux LOD 1/2 ne passent pas par le moteur : ils utilisent un modèle statistique calibré sur les sorties du moteur plein (Poisson bivarié avec correction Davidson pour les nuls). La calibration est vérifiée par 100 000 matchs de test en CI à chaque merge sur main : écart maximal toléré de 0,04 but/match et de 0,8 point de possession entre modèle plein et modèle compressé.",
      },
      {
        kind: "callout",
        title: "Validation du moteur : « golden replay »",
        body:
          "Chaque commit sur le dossier /engine déclenche un banc de 12 000 replis dorés (seed, tactique, effectif figés). Toute divergence d'un seul événement fait échouer la CI : elle signale soit une régression déterministe, soit une modification volontaire du gameplay qui doit être consignée dans le CHANGELOG de simulation.",
      },
    ],
  },
  {
    slug: "base-de-donnees-graph",
    code: "DB-03",
    category: "Données",
    title: "Base de données graphe & simulation multithreadée du monde",
    subtitle:
      "500 000+ personnes, 2 300 clubs, 118 ligues, requêtes en 2 ms.",
    ownerRole: "Data Architect / Big Data Engineer",
    keywords: ["graphe", "multithread", "index", "cache", "newgens", "éditeur"],
    summary:
      "La « Graph Database » d'IGM Manager est un moteur de stockage colonnaire embarqué, orienté relations, capable de charger 500 000 personnes en moins de 4 secondes et de répondre à une requête de scouting mondiale en moins de 25 ms, tout en autorisant l'édition en cours de partie.",
    blocks: [
      {
        kind: "spec",
        title: "Capacités et contraintes",
        meta: [
          { label: "Volumétrie cible", value: "520 000 personnes, 2 300 clubs, 118 ligues, 42 000 matchs/saison, 1,4 M d'événements de match" },
          { label: "Empreinte mémoire", value: "≤ 1,9 Go en mode compact (attributs 8 bits), ≤ 3,4 Go en mode étendu (recherche & data)" },
          { label: "Temps de chargement", value: "< 4 s à froid sur NVMe, < 1,2 s à chaud (cache mappé)" },
          { label: "Concurrence", value: "Lecture sans verrou (snapshots), écritures par lots de 64 Ko, JobSystem N-1 cœurs" },
          { label: "Requête type", value: "« tous les AILIER de moins de 23 ans, CA ≥ 120, valeur ≤ 8 M€, dans un rayon de 900 km » < 25 ms" },
          { label: "Éditeur", value: "In-game Database Editor, sauvegarde en .igmdiff (patch binaire de la base officielle)" },
        ],
      },
      {
        kind: "list",
        title: "Structure du graphe",
        items: [
          "NŒUDS : Person (joueur, staff, média, dirigeant), Club, Competition, Fixture, Match, Contract, Injury, Nation, City, Stadium, Ownership.",
          "ARÊTES : Person-[PLAYS_FOR / PLAYED_FOR]->Club, Person-[REPORTS_TO]->Person, Person-[SCOUTS]->Person, Club-[COMPETES_IN]->Competition, Match-[PRODUCED]->MatchEvent, Person-[INFLUENCES]->Person (graphe social du vestiaire).",
          "Stockage des arêtes dans des CSR (compressed sparse row) triées par type, ce qui rend la traversée « club → effectif → relation sociale » linéaire.",
          "Attributs sérialisés en 8 bits (0–20) + 6 bits de « connaissance » par attribut et par club, pour le masquage.",
          "Index secondaires : b+tree sur (âge, CA, poste), bitmap sur (poste, pied, nationalité), R-tree sur la géolocalisation pour le rayon de scouting.",
        ],
      },
      {
        kind: "paragraph",
        title: "Simulation multithreadée des ligues non jouées",
        body:
          "Une « journée de championnat » est un graphe de tâches. Le planificateur construit des vagues de dépendances (simuler les matchs → mettre à jour les classements → mettre à jour les états de clubs → résoudre le mercato → recalculer les dynamiques sociales → générer la presse). Chaque match est une tâche sans verrou, lisant un snapshot immuable. Les écritures sont fusionnées en fin de vague (reduce). Sur un Ryzen 9 (12 cœurs), une journée complète des 118 ligues s'exécute en 1,6 s ; sur un CPU 4 cœurs, le jeu bascule automatiquement en LOD 2 élargi et traite la même journée en 3,4 s.",
      },
      {
        kind: "table",
        title: "Cycle de vie des données",
        meta: [
          { label: "Étape", value: "Traitement" },
          { label: "Import initial", value: "Parseur Rust : CSV/JSON → validation de 340 règles d'intégrité → graphe compressé .igmdb" },
          { label: "Sauvegarde de carrière", value: "Snapshot du monde modifié (delta vs base) — taille moyenne 38 Mo après 10 saisons" },
          { label: "Génération de monde", value: "Newgens : 12 000 joueurs/saison générés depuis des distributions par nation, club et niveau d'académie" },
          { label: "Retrait / déclin", value: "Déclin des attributs après 30–34 ans selon poste, Historique d'Endurance et historique de blessures" },
          { label: "Export", value: "CSV / JSON de tout sous-ensemble filtré, pour la communauté et les outils externes" },
        ],
      },
      {
        kind: "callout",
        title: "Prototype vivant embarqué dans ce document",
        body:
          "L'onglet « Prototype » de ce portail exécute une tranche fonctionnelle réelle du Match Engine (v0.4 « Slice ») : évaluation d'effectif, pondération tactique, phases de possession, xG par tir, fatigue, cartons et coups de pied arrêtés. Chaque simulation est persistée en base PostgreSQL (matchs + événements horodatés) et rejouable par sa graine.",
      },
    ],
  },
];
