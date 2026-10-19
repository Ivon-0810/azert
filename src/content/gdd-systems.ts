import type { GddChapterSeed } from "./types";

export const systemsChapters: GddChapterSeed[] = [
  {
    slug: "tactiques-avancees",
    code: "TC-04",
    category: "Gameplay",
    title: "Tactiques avancées, rôles modernes & créateur de coups de pied arrêtés",
    subtitle:
      "34 actions, 38 rôles, 5 phases de jeu, 14 instructions individuelles, un atelier de CPA complet.",
    ownerRole: "Lead Game Designer — Systems",
    keywords: ["tactique", "rôles", "pressing", "CPA", "instructions", "familiarité"],
    summary:
      "Le système tactique sépare la structure (formation, cadres, rôles) des consignes (mentality, pressing, tempo) et des instructions individuelles. La Familiarité Tactique, acquise à l'entraînement, module l'efficacité réelle de l'application des consignes sur le terrain.",
    blocks: [
      {
        kind: "spec",
        title: "Grille tactique complète",
        meta: [
          { label: "Formations", value: "42 dispositions de base + éditeur de positions libres (10 cadres de base par joueur)" },
          { label: "Rôles", value: "38 rôles (19 offensifs, 13 défensifs, 6 milieux), chacun avec 3 variantes (défensif/équilibré/offensif)" },
          { label: "Mentality équipe", value: "7 niveaux — Très défensif → Très offensif (agissant sur la hauteur du bloc, la prise de risque et la largeur)" },
          { label: "Consignes d'équipe", value: "18 : tempo, largeur, profondeur, pressing (5 niveaux + contre-pressing), ligne défensive, hors-jeu, tacles, dégagements, centres,.transitions (contre-attaque / possession)" },
          { label: "Instructions individuelles", value: "14 par joueur (marquage serré, pressing plus/moins, rester en position, percées, appels de balle, conduite, tirs lointains)" },
          { label: "Familiarité tactique", value: "0–100 % par « shape » ; au-dessus de 70 %, les écarts de position et le taux d'erreur diminuent de 30 %" },
        ],
      },
      {
        kind: "table",
        title: "Rôles modernes (extrait normalisé)",
        meta: [
          { label: "Rôle", value: "Comportement clé & attributs dominants" },
          { label: "Libero / Ball-Playing Defender", value: "Sortie de balle par la progression au sol ; Passes, Vision, Composure" },
          { label: "Inverted Full-Back", value: "Entre dans l'axe en possession, redevient latéral hors possession ; Positionnement, Endurance" },
          { label: "Anchor / Double Pivot", value: "Fixe la ligne médiane, couvre les transitions ; Tacle, Anticipation, Positionnement" },
          { label: "Regista / Deep-Lying Playmaker", value: "Distribue depuis la base ; Passes, Vision, Décisions" },
          { label: "Mezzala", value: "Occupe le demi-espace, appui intérieur ; Sans ballon, Passes, Endurance" },
          { label: "Inside Forward / Winger", value: "Percussion intérieure ou largeur + centres ; Dribble, Vitesse, Finition" },
          { label: "False Nine / Pressing Forward", value: "Décroisage créatif ou perturbation défensive première ; Vision / Agression, Tacle" },
          { label: "Complete Forward", value: "Tous les registres, dépend de Finition, Force, Dribble, Passes" },
        ],
      },
      {
        kind: "paragraph",
        title: "Créateur de coups de pied arrêtés (Set-Piece Workshop)",
        body:
          "Le joueur dessine des routines sur un tableau tactique interactif. Chaque routine est un enchaînement de 6 slots : position initiale, trajectoire de course, point de frappe, écran/obstruction, répartition au second ballon, et couverture de contre-attaque. Les routines sont évaluées par le moteur de la même manière qu'une action de jeu courant : la probabilité de but d'un corner dépend de la qualité de la frappe, du placement, des attributs aériens des acteurs, de la routine adverse et de l'arbitrage de l'obstruction. Les routines opposées peuvent être espionnées via l'analyse adverse, et contredire en amont d'un match.",
      },
      {
        kind: "list",
        title: "Phases de jeu gérées",
        items: [
          "Construction courte / longue depuis les gardiens (5 options, dont la sortie « troisièmehomme »)",
          "Progression par couloirs ou demi-espaces, avec chevauchements et underlaps",
          "Création finale : 12 schémas dont « surcharge du couloir », « pivot + deuxième vague », « tirs lointains autorisés »",
          "Pressing haut / bloc médian / bloc bas avec pièges de côté (trap inside / trap outside)",
          "Couverture défensive : marquage de zone, homme à homme, mixte, échanges (swap) et presse de compensation",
          "Transitions offensives et défensives : contre-attaque immédiate ou remise en forme organisée, contre-pressing 5 s",
        ],
      },
      {
        kind: "formula",
        title: "Application effective d'une consigne",
        body:
          "Effectif(consigne) = Consigne_cible ± (1 − Familiarité) · k · Bruit_Individuel\navec k = 12 % pour les consignes de position, 20 % pour le pressing, 8 % pour le tempo.\nUn joueur avec Faiblesse « Suit mal les instructions » (trait) ajoute +50 % au bruit ; un joueur avec « Meneur » le réduit de 25 % pour ses coéquipiers de couloir.",
      },
      {
        kind: "callout",
        title: "Anti-tunneling",
        body:
          "Aucune tactique n'est « la meilleure » : chaque avantage structurel crée une vulnérabilité mesurable (une ligne haute accroît les xG concédés sur ballons longs de 18 %, un pressing très élevé coûte 22 % d'énergie supplémentaire et augmente le risque de carton). L'écran d'aperçu tactique affiche explicitement ces compromis, en pourcentage.",
      },
    ],
  },
  {
    slug: "scouting-recrutement",
    code: "SC-05",
    category: "Gameplay",
    title: "Scouting, masquage d'attributs & réseau de recrutement",
    subtitle:
      "Voir, croiser, douter : la connaissance est une ressource rare et périssable.",
    ownerRole: "Game Designer — Recruitment Systems",
    keywords: ["scouting", "attribute masking", "connaissance", "rapports", "filtres"],
    summary:
      "Le recrutement repose sur un modèle de connaissance partielle : le club ne connaît d'un joueur que ce que son réseau a observé, avec une marge d'erreur qui se réduit avec le nombre de rapports, la qualité des recruteurs et la diversité des compétitions observées.",
    blocks: [
      {
        kind: "paragraph",
        title: "Modèle de connaissance (Attribute Masking)",
        body:
          "Chaque attribut d'une personne est encodé sur 8 bits pour la vérité et 6 bits pour le niveau de connaissance du club (0–63). À l'affichage, l'attribut est remplacé par une fourchette dont la largeur dépend de la connaissance : « 12–16 » si elle est faible, une étoile et une valeur exacte si elle est complète. Un attribut non observé apparaît comme « ? ». La connaissance se dégrade de 1,5 point par saison sans observation et disparaît complètement après 24 mois.",
      },
      {
        kind: "formula",
        title: "Erreur d'estimation d'un rapport de scouting",
        body:
          "σ_attr = 4,2 · (1 − Connaissance/63) · (1 / (1 + 0,18 · NoteJugementRecruteur)) · ModificateurDistance\nσ_potentiel = σ_attr · 1,7 · (1 + (22 − Âge)/10)\nUn recruteur « Jugement des joueurs 18 / Jugement du potentiel 16 » sur un joueur de 19 ans observé 6 fois produit une fourchette de CA de ±2,4 et de PA de ±6,1.",
      },
      {
        kind: "list",
        title: "Boucle de recrutement",
        items: [
          "1. DÉFINIR : 25 critères de filtre (poste, âge, CA/PA, valeur, salaire, nationalité, rayon géographique, clause, contrat restant, style de jeu attendu).",
          "2. ASSIGNER : 40 recruteurs, 8 secteurs, budget d'assignations limité (coût en temps réel : 1 assignation = 2 semaines).",
          "3. OBSERVER : rapports détaillés (force/faiblesse), rapports de match, données vidéo (clips générés depuis le moteur), suivi sur 3, 6, 12 mois.",
          "4. CROISER : 5 sources indépendantes maximum ; si deux sources divergent de plus de 4 points sur un attribut clé, un « rapport contradictoire » est émis.",
          "5. DÉCIDER : shortlist, note du recruteur vs note de l'entraîneur, avis de l'adjoint, comparaison avec l'effectif actuel.",
          "6. NÉGOCIER : transfert, prêt, contrat, clauses, salaire, primes, agent, image, temps de jeu.",
        ],
      },
      {
        kind: "table",
        title: "Types d'acquisition",
        meta: [
          { label: "Type", value: "Particularités modélisées" },
          { label: "Achat ferme", value: "Frais de transfert, échelonnement (2–4 annuités), bonus de réalisation, % à la revente, solde du club vendeur" },
          { label: "Prêt sec / avec option", value: "Frais de prêt, prise en charge salariale 0–100 %, clause de rappel, interdiction de jouer contre le club prêteur" },
          { label: "Prêt bancaire du joueur", value: "Achat à crédit avec échéancier et impact sur le ratio d'endettement" },
          { label: "Libre / fin de contrat", value: "Indemnité de formation, prime à la signature, précontrat 6 mois avant échéance" },
          { label: "Clause libératoire", value: "Paiement direct au joueur, déclenché par toute offre égale ou supérieure" },
          { label: "Échange", value: "Joueur(s) + somme, valorisation négociée séparément, plus-values comptables" },
        ],
      },
      {
        kind: "callout",
        title: "Risque assumé",
        body:
          "L'IA de recrutement adverse n'a jamais accès aux attributs réels des joueurs : elle utilise les mêmes rapports brouillés que le joueur. Un club riche peut donc se tromper lourdement, ce qui produit un marché des transferts crédible, avec des « flops » structurels et des coups de génie.",
      },
    ],
  },
  {
    slug: "contrats-finances",
    code: "CT-06",
    category: "Gameplay",
    title: "Contrats complexes, salaires & gouvernance financière",
    subtitle:
      "58 champs de négociation, 4 agrégats comptables, conformité UEFA.",
    ownerRole: "Game Designer — Economy",
    keywords: ["contrat", "masse salariale", "FFP", "agents", "budget"],
    summary:
      "L'économie d'IGM Manager modélise le football comme une entreprise : comptabilité d'engagement, amortissement des frais de transfert, conformité aux règles de durabilité financière de l'UEFA, pouvoir des agents et guerre des salaires interne.",
    blocks: [
      {
        kind: "spec",
        title: "Champs de négociation",
        meta: [
          { label: "Salaire", value: "Base hebdomadaire + prime de signature + prime de loyauté + primes d'apparition/but/passe/clean sheet" },
          { label: "Durée", value: "1 à 5 ans, avec option et contre-option club/joueur" },
          { label: "Clauses", value: "Libératoire, revente (%), minimale de temps de jeu, de non-relégation, de qualification européenne, de sortie en fin de prêt" },
          { label: "Statut", value: "Indispensable / Important / Rotation / Prospect / Surnuméraire — agit sur le moral et les attentes" },
          { label: "Agent", value: "Commission (5–15 %), relation manager/agent, influence sur la negociation" },
          { label: "Image", value: "Droits à l'image, merchandising, bonus collectif" },
          { label: "Bonus d'équipe", value: "Victoire, qualification, victoire en coupe, titre de champion" },
        ],
      },
      {
        kind: "table",
        title: "Agrégats suivis",
        meta: [
          { label: "Indicateur", value: "Définition & usage" },
          { label: "Masse salariale", value: "Somme des salaires chargés, primes incluses ; comparée au plafond interne du board" },
          { label: "Ratios UEFA", value: "Squad Cost Ratio (salaires + amortissements + agents) / revenus ; seuils 70/80/90 %" },
          { label: "Amortissement", value: "Frais de transfère / durée du contrat, passé en charges annuelles" },
          { label: "Cash-flow", value: "Échelonnements encaissés/versés, échéances à 12/24/36 mois" },
          { label: "Budget transfert", value: "Enveloppe en valeur nette et en masse salariale autorisée, ajustée par le board chaque trimestre" },
        ],
      },
      {
        kind: "list",
        title: "Dynamiques économiques",
        items: [
          "Marché des transferts à 6 fenêtres avec fenêtre de pré-saison, deadline dynamique et enchères de dernière heure.",
          "Inflation du marché : la moyenne des transferts mondiaux croît avec l'indice TV des championnats simulés.",
          "Pouvoir des agents : un agent mécontent peut verrouiller un joueur, organiser une fuite presse ou pousser un départ.",
          "Rémunération et hiérarchie : un joueur mieux payé que le leader du vestiaire déclenche une friction sociale mesurable.",
          "Gestion des prêts bancaires, du refinancement, des relégations (clauses de baisse salariale automatique 25–40 %).",
          "Événements de club : rachat, dette propriétaire, nouveau stade, sponsor principal renégocié.",
        ],
      },
    ],
  },
  {
    slug: "vestiaire-dynamique",
    code: "VD-07",
    category: "Gameplay",
    title: "Vestiaire, hiérarchie sociale, moral & causeries",
    subtitle:
      "Un graphe social de 25 à 40 nœuds, 16 traits de personnalité, 9 dynamiques de groupe.",
    ownerRole: "Game Designer — Human Systems",
    keywords: ["vestiaire", "moral", "causerie", "leadership", "happiness"],
    summary:
      "Le vestiaire est un système social simulé : chaque joueur possède une personnalité stable, des relations bilatérales avec ses coéquipiers, un niveau de bonheur multidimensionnel et une position dans la hiérarchie informelle. Le manager agit par la parole, les actes et le temps de jeu.",
    blocks: [
      {
        kind: "spec",
        title: "Dimensions du moral",
        meta: [
          { label: "Moral global", value: "0–100, visible ; combinaison pondérée des 5 sous-moral" },
          { label: "Confiance", value: "Séries de performances, temps de jeu, causeries de soutien" },
          { label: "Ambiance", value: "Relations avec les coéquipiers, dynamique de groupe,-langage de club" },
          { label: "Fidélité", value: "Attachement au club, ambition, intérêts concurrents" },
          { label: "Reconnaissance", value: "Statut contractuel, salaire relatif, place dans la hiérarchie sportive" },
          { label: "Forme mentale", value: "Fatigue, pression médiatique, vie personnelle (événements aléatoires contextuels)" },
        ],
      },
      {
        kind: "list",
        title: "Hiérarchie sociale et groupes",
        items: [
          "5 niveaux hiérarchiques : Leader incontesté, Cadre, Élément suivi, Nouveau, Périphérique.",
          "Groupes d'influence : nationaux, d'âge, d'ancienneté, de langue, de religion, d'agent, d'académie.",
          "Rôles sociaux : Capitaine, Vice-capitaine, Leader vocal, Leader silencieux, Médiateur, Perturbateur.",
          "Frictions : concurrence au même poste, jalousie salariale, trahison de parole, sélection non justifiée.",
          "Coalitions : si deux groupes dominants entrent en conflit, une « crise de vestiaire » se déclenche avec 4 issues possibles (rébellion, soumission, départ, démission du manager).",
        ],
      },
      {
        kind: "table",
        title: "Causeries & interactions",
        meta: [
          { label: "Interaction", value: "Effet modélisé" },
          { label: "Causerie individuelle", value: "12 tons × 18 sujets ; efficacité dépend de la personnalité et de la crédibilité du manager" },
          { label: "Réunion d'équipe", value: "Impact sur le moral collectif, la cohésion et l'acceptation tactique" },
          { label: "Critique publique", value: "Gains à court terme possibles, risque élevé de perte de confiance" },
          { label: "Promesse", value: "Contrat moral : temps de jeu, transfert, prolongation — tenu ou rompu, avec mémoire de 24 mois" },
          { label: "Sanction / amende", value: "Cohérence avec le règlement intérieur, effet sur la discipline de groupe" },
        ],
      },
      {
        kind: "formula",
        title: "Effet du moral sur la performance",
        body:
          "MultiplicateurPerformance = 0,88 + 0,0024 · MoralGlobal + 0,0012 · CohésionÉquipe + 0,0018 · (LeadershipProche · MeneurProche)\nCe multiplicateur s'applique aux probabilités de réussite technique (passe, tacle, tir) avant tirage aléatoire, plafonné à 1,12 et plancher à 0,85.",
      },
    ],
  },
  {
    slug: "formation-newgens",
    code: "FO-08",
    category: "Gameplay",
    title: "Centre de formation & génération de Newgens",
    subtitle:
      "12 000 joueurs générés par saison, identités footballistiques nationales.",
    ownerRole: "Game Designer — Youth & World Gen",
    keywords: ["newgen", "académie", "génération", "développement", "scouting interne"],
    summary:
      "Les newgens remplacent les joueurs partant à la retraite afin de maintenir la population mondiale stable. Ils sont générés à partir de profils nationaux et de club, puis se développent selon la charge d'entraînement, les minutes jouées, la qualité des installations et l'encadrement.",
    blocks: [
      {
        kind: "paragraph",
        title: "Pipeline de génération",
        body:
          "Chaque saison, le système calcule le déficit de population par nation et par tranche d'âge, puis génère les newgens manquants. La génération combine une distribution d'attributs propre à chaque « identité footballistique nationale » (ex. : plus de dribbleurs offensifs au Brésil, plus de milieux de récupération en France, plus de défenseurs physiques en Allemagne), un historique de production du club et des contraintes de réputation. Chaque newgen reçoit une identité (nom, prénom, visage procédural, agent, personnalité, historique familial) et un PA tiré dans une loi de puissance dépendant du niveau de l'académie.",
      },
      {
        kind: "formula",
        title: "Développement d'un jeune",
        body:
          "ΔCA_annuel = Base(Âge) · QualitéEntraînement · TempsDeJeu^0,35 · PédagogieStaff · (1 − RisqueBlessure) · ModificateurPersonnalité\nBase(Âge) : 15 ans = 7,0 ; 18 ans = 5,2 ; 21 ans = 3,1 ; 24 ans = 1,2 ; ≥ 28 ans = 0 (déclin ensuite).\nUn prêt réussi dans un club où le joueur est titulaire vaut 1,6× le développement interne en formation réserviste.",
      },
      {
        kind: "list",
        title: "Gestion de l'académie",
        items: [
          "Budget, niveau et réputation du centre de formation ; 6 niveaux d'installations (junior, intégré, élite…).",
          "Staff dédié : directeur du centre, entraîneurs par poste, préparateur physique, médecin, analyste, référent scolaire.",
          "Équipes jeunes et calendrier complet (U18, U21, coupes jeunes, UEFA Youth League pour les clubs qualifiés).",
          "Plan de développement individuel : 5 axes d'entraînement, entraînement de trait de personnalité, mentorat par un senior.",
          "Intégration : contrats de premier pro, prêts, domino de temps de jeu, suivi de la carrière après départ.",
        ],
      },
    ],
  },
  {
    slug: "medical-fitness",
    code: "MD-09",
    category: "Gameplay",
    title: "Centre médical, charge de travail & gestion du risque",
    subtitle:
      "78 types de blessures, 4 marqueurs de charge, prédictivité probabiliste.",
    ownerRole: "Game Designer — Sports Science",
    keywords: ["médical", "charge", "blessure", "fatigue", "prévention"],
    summary:
      "Le modèle médical distingue la condition aiguë (état du jour) de la charge chronique (cumul sur 6 semaines). Le joueur gère le risque en arbitrant entre fraîcheur et rythme de compétition, avec un corps médical qui ne donne que des probabilités.",
    blocks: [
      {
        kind: "spec",
        title: "Marqueurs suivis",
        meta: [
          { label: "Condition physique", value: "0–100 %, état du jour" },
          { label: "Fraîcheur / fatigue aiguë", value: "0–100 %, récupération à court terme (48 h)" },
          { label: "Charge chronique (ACWR)", value: "Rapport charge 7 jours / moyenne 28 jours ; zone de risque 1,3–1,6" },
          { label: "Jambes / risque de surmenage", value: "Indice composite alimenté par les sprints et duels en match" },
          { label: "Récupération de blessure", value: "Rehab progressive : 4 paliers avant retour à la compétition" },
          { label: "Fiabilité du diagnostic", value: "Le médecin annonce une fourchette (ex. 3–5 semaines) et peut se tromper" },
        ],
      },
      {
        kind: "table",
        title: "Catégories de blessures (extrait)",
        meta: [
          { label: "Zone", value: "Exemples et mécanismes" },
          { label: "Musculaire", value: "Ischio, adducteurs, mollet — liées à la fatigue et au manque d'échauffement" },
          { label: "Ligamentaire", value: "LCA, entorses — contacts et appuis, durée 6–10 mois" },
          { label: "Os / stress", value: "Fractures de fatigue — sur-entraînement répété" },
          { label: "Tendineuse", value: "Tendon d'Achille, rotulien — charge chronique excessive" },
          { label: "Commotion", value: "Protocole de retour en 6 étapes, décision médicale bloquante" },
          { label: "Maladie / hors terrain", value: "Grippes, viroses, retour de sélection, événements personnels" },
        ],
      },
      {
        kind: "formula",
        title: "Probabilité de blessure sur un cycle hebdomadaire",
        body:
          "P(blessure) = 0,011 · (ACWR/1,2)^2,4 · (1 + (100 − Condition)/70) · RisqueIntrinsèque · ModificateurÂge · ModificateurPrévention\nOù RisqueIntrinsèque provient de l'historique médical (0,7–2,3) et ModificateurPrévention réduit jusqu'à 18 % avec un staff médical d'élite et une planification parfaite.",
      },
      {
        kind: "list",
        title: "Prévention et entraînement",
        items: [
          "Planification d'entraînement hebdomadaire par joueur : intensité, volume, focus technique, physique, tactique, CPA.",
          "Pré-saison avec fondations aérobies, impact direct sur la tolérance à la charge de la saison.",
          "Programmes individuels de prévention (renforcement, mobilité, proprioception).",
          "Gestion des retours de sélection, des voyages long-courriers et des fuseaux horaires.",
          "Injections de cortisone, port d'un masque, opérations programmées en saison, deuxième avis médical.",
        ],
      },
    ],
  },
  {
    slug: "data-hub",
    code: "DH-10",
    category: "Gameplay",
    title: "Data Hub : xG, xA, zones d'influence & analyse post-match",
    subtitle:
      "Le tableau de bord d'analyse, du clip vidéo à la modélisation prédictive.",
    ownerRole: "Game Designer — Analytics",
    keywords: ["xG", "xA", "PPDA", "zones", "analyse", "prédictif"],
    summary:
      "Le Data Hub agrège les 1,4 M d'événements de match générés par le moteur en indicateurs lisibles et actionnables : xG par tir, xA par passe, zones d'influence, réseaux de passes, PPDA, et modèles prédictifs de performance.",
    blocks: [
      {
        kind: "paragraph",
        title: "Chaîne de production des données",
        body:
          "Chaque tick du moteur émet un évènement avec horodatage, positions exactes des 22 joueurs, vitesse du ballon, décision prise et résultat. Les événements sont agrégés à chaud (match en cours) et à froid (post-match, saison, carrière) dans un entrepôt vectoriel colonnaire. Toutes les métriques avancées sont calculées à partir de ces données brutes, jamais injectées artificiellement : le xG d'un tir est une fonction de la position, de l'angle, de la distance, du type de frappe, de la pression exercée et du placement du gardien.",
      },
      {
        kind: "formula",
        title: "Modèle xG interne",
        body:
          "xG(tir) = σ( −2,34 + 0,86·ln(Distance) − 0,42·AngleOuvert + 0,31·TypeAssisté + 0,27·ContreAttaque − 0,58·PressionAdverse + 0,19·PiedFort + 0,34·TêteSurCentre − 0,22·GardienHorsLigne )\nCalibré sur 4,2 M de tirs simulés, Brier score 0,071, valider par validation croisée sur 5 saisons.",
      },
      {
        kind: "table",
        title: "Indicateurs du Data Hub",
        meta: [
          { label: "Indicateur", value: "Usage décisionnel" },
          { label: "xG / xGA", value: "Qualité réelle des occasions créées et concédées, comparée aux buts" },
          { label: "xA / Passes progressives", value: "Création, progression, rupture de lignes" },
          { label: "PPDA / intensité de presse", value: "Efficacité du pressing et hauteur du bloc" },
          { label: "Zones d'influence", value: "Carte thermique moyenne par joueur, comparaison au rôle attendu" },
          { label: "Réseau de passes", value: "Cohésion offensive, nœuds isolés, sur-dépendance à un créateur" },
          { label: "Duels gagnés / second ballons", value: "Dominance physique et transition" },
          { label: "Modèle prédictif", value: "Projection de points sur 10 journées avec intervalle de confiance" },
        ],
      },
      {
        kind: "list",
        title: "Outils d'analyse",
        items: [
          "Revue de match : 2D synchronisée avec les évènements, filtre par phase, par joueur, par type d'action.",
          "Comparaison d'effectif : radar d'attributs, courbes de développement, projection de CA à 3 ans.",
          "Rapport d'adversaire : tendances de formation, gardien face aux centres, faiblesses sur couloir, scenarios de CPA.",
          "Recherche par données : requête multi-critères sur tous les indicateurs avancés du monde simulé.",
          "Export : CSV / image / rapport imprimable pour la communauté.",
        ],
      },
    ],
  },
  {
    slug: "board-medias",
    code: "BM-11",
    category: "Gameplay",
    title: "Comité directeur, conférences de presse & écosystème médiatique",
    subtitle:
      "Une politique de club, des actionnaires, une presse à mémoire et des réseaux sociaux vivants.",
    ownerRole: "Game Designer — Narrative & Politics",
    keywords: ["board", "presse", "médias", "sponsors", "pression"],
    summary:
      "Le manager est évalué par un comité directeur aux objectifs explicites et implicites, observé par une presse à mémoire longue, et exposé à un écosystème social qui amplifie chaque crise comme chaque exploit.",
    blocks: [
      {
        kind: "spec",
        title: "Comité directeur & gouvernance",
        meta: [
          { label: "Objectifs explicites", value: "Position en championnat, coupes, européen, budget, jeunes du centre, style de jeu" },
          { label: "Objectifs implicites", value: "Stabilité, image du club, rentabilité, patience du propriétaire" },
          { label: "Confiance du board", value: "0–100, recalculée chaque mois : résultats, conformité au projet, gestion financière, relation presse" },
          { label: "Types de propriétaires", value: "Actionnariat populaire, propriétaire unique, fonds d'investissement, État, multi-clubs" },
          { label: "Issues", value: "Soutien total, avertissement, restrictions budgétaires, licenciement (12 profils de sortie)" },
        ],
      },
      {
        kind: "list",
        title: "Médias et pression",
        items: [
          "Conférence de presse : 40 questions contextuelles, 6 tons de réponse, mémorisation sur 24 mois par journal.",
          "Fuites : indiscrétions sur les négociations, sur le vestiaire, sur l'avenir du manager.",
          "Réseaux sociaux simulés : 6 plateformes, 14 comptes types, engouement et vindicte selon les résultats.",
          "Supporters : indice de satisfaction, groupes ultra, motions de défiance, ambiance en stade.",
          "Sponsors et partenaires : clauses de résultats, exposition médiatique, révision annuelle des contrats.",
        ],
      },
      {
        kind: "formula",
        title: "Confiance du board",
        body:
          "Confiance = 50 + 0,34·(Points − Objectif·0,92) + 0,12·(MargeFinancière) + 0,08·(SatisfactionSupporters) − 0,20·(ÉcartStyleDeJeu) + ModificateursNarratifs\nRéévaluée chaque mois ; en dessous de 20, une réunion de crise se déclenche avec ultimatum à 30 jours.",
      },
    ],
  },
  {
    slug: "interface-ux",
    code: "UX-12",
    category: "Produit",
    title: "Interface, accessibilité & localisation",
    subtitle:
      "110 écrans, navigation à 2 clics, densité d'information maîtrisée.",
    ownerRole: "UX Lead",
    keywords: ["UI", "UX", "accessibilité", "localisation", "thèmes"],
    summary:
      "L'interface d'IGM Manager privilégie la densité lisible et la navigation par contexte : chaque écran répond à une question, et le joueur peut construire son propre tableau de bord.",
    blocks: [
      {
        kind: "list",
        title: "Principes d'interface",
        items: [
          "Règle des deux clics : toute information critique d'un écran est atteignable en deux clics maximum depuis l'écran précédent.",
          "Layout en colonnes redimensionnables, onglets persistants, filtres enregistrés, vues personnalisées exportables.",
          "Écran d'accueil « Manager Dashboard » : widgets configurables (effectif, moral, blessés, mercato, presse, board).",
          "Surlignage sémantique universel : vert = progression, orange = vigilance, rouge = alerte, avec bulle explicative sur la cause.",
          "Mode « Delegation » : un assistant propose les actions recommandées et peut exécuter automatiquement les modules délégués.",
        ],
      },
      {
        kind: "spec",
        title: "Accessibilité & localisation",
        meta: [
          { label: "Taille de police", value: "80 % à 200 %, refonte dynamique, police dislexia-friendly optionnelle" },
          { label: "Contraste", value: "Trois thèmes (Sombre FM-like, Clair, Contraste élevé), validation WCAG AA" },
          { label: "Navigation clavier", value: "100 % des actions, raccourcis remappables, 42 raccourcis par défaut" },
          { label: "Réduction de charge", value: "Mode « simulation instantanée », désactivation des animations de match et du son" },
          { label: "Langues", value: "18 langues, texte extensible de 35 %, formats de date/nombre/salaires localisés" },
          { label: "Lecture d'écran", value: "Arborescence ARIA-like complète sur les écrans critiques" },
        ],
      },
    ],
  },
];
