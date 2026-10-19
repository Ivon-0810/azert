# IGM Manager — Coquille applicative Windows (`IGMManager.exe`)

Ce dossier contient la couche d'empaquetage de l'application bureau décrite au
chapitre **CI-13** du GDD. Le cœur de simulation reste indépendant de la
présentation : la coquille ne fait que charger l'interface et superviser le
service de simulation local.

## Fichiers

| Fichier            | Rôle                                                                 |
| ------------------ | -------------------------------------------------------------------- |
| `main.js`          | Processus principal Electron : fenêtre, cycle de vie, supervision    |
|                    | du service local de simulation, redémarrage automatique, ouverture    |
|                    | de liens externes en navigateur système.                             |
| `preload.js`       | Pont contextuel sandboxé (`contextIsolation`, `nodeIntegration: false`). |
| `builder.json`     | Configuration `electron-builder` (cible NSIS, icône, signature).      |

## Contrats respectés

- **Aucune règle de jeu dans le processus UI** (chapitre AR-01, règle d'or).
- **Démarrage** : le service doit répondre sur `/api/health` en moins de 30 s,
  sinon écran d'erreur explicite.
- **Arrêt propre** : `before-quit` termine le processus de simulation.
- **Signature** : `Azure Trusted Signing` via OIDC, aucun certificat local.

## Empaquetage local

```bash
npm ci
npm run build                # bundle serveur autonome
npx electron-builder --win --x64 --publish never
```

Produits :

- `dist/IGMManager.exe` — exécutable portable
- `dist/IGMManager-Setup.exe` — installateur NSIS
- `dist/IGMManager-x64.msi` — installateur entreprise (WiX Toolset 5)
- `dist/IGMManager-portable.zip` — archive autonome

## CI/CD

Le workflow `.github/workflows/windows-build.yml` exécute les 8 stages du
pipeline (analyse statique → build matricielle → tests → replis dorés →
validation de simulation → empaquetage → smoke test → publication).
