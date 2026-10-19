/**
 * IGM MANAGER — Pont contextuel sécurisé (sandbox)
 * Expose uniquement les API nécessaires au rendu : aucune règle de jeu
 * ne doit être exécutée côté interface (chapitre AR-01).
 */
const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("igm", {
  engine: {
    info: () => ipcRenderer.invoke("igm:engine-info"),
  },
  platform: process.platform,
  versions: {
    electron: process.versions.electron,
    chrome: process.versions.chrome,
    node: process.versions.node,
  },
});
