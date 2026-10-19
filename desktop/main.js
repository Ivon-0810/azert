/**
 * IGM MANAGER — Coquille applicative Windows (IGM.Shell)
 * ------------------------------------------------------------------
 * Point d'entrée de l'exécutable `IGMManager.exe`. La coquille Electron
 * charge le portail Next.js (rendu de l'interface) et lance le service
 * local de simulation (IGM.SimCore / IGM.MatchEngine) en processus fils.
 *
 * Dans le build de production :
 *   - `npm run build` produit le bundle serveur autonome (Next standalone) ;
 *   - `electron-builder` empaquette ce fichier + le bundle dans un .exe NSIS ;
 *   - WiX Toolset génère la variante .msi pour les déploiements entreprise.
 */

const { app, BrowserWindow, ipcMain, shell } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");

const isDev = !app.isPackaged;
const APP_PORT = process.env.IGM_PORT || 4173;

/** Processus de simulation natif (igm_engine.dll chargée via un service Node). */
let simProcess = null;

function startSimulationService() {
  if (simProcess) return;
  const entry = path.join(__dirname, "server.js");
  simProcess = spawn(process.execPath, [entry], {
    env: { ...process.env, NODE_ENV: "production", PORT: String(APP_PORT) },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  });
  simProcess.stdout.on("data", (chunk) => {
    process.stdout.write(`[simcore] ${chunk}`);
  });
  simProcess.stderr.on("data", (chunk) => {
    process.stderr.write(`[simcore:err] ${chunk}`);
  });
  simProcess.on("exit", (code) => {
    simProcess = null;
    if (code !== 0 && !app.isQuitting) {
      // Le service doit toujours être disponible : redémarrage automatique.
      setTimeout(startSimulationService, 1500);
    }
  });
}

async function waitForService(timeoutMs = 30000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const res = await fetch(`http://127.0.0.1:${APP_PORT}/api/health`);
      if (res.ok) return true;
    } catch {
      // service pas encore prêt
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  return false;
}

async function createWindow() {
  const win = new BrowserWindow({
    width: 1600,
    height: 960,
    minWidth: 1280,
    minHeight: 760,
    backgroundColor: "#05080e",
    autoHideMenuBar: true,
    title: "IGM Manager",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  const ready = await waitForService();
  if (!ready) {
    await win.loadURL(
      "data:text/html;charset=utf-8," +
        encodeURIComponent(
          "<body style='background:#05080e;color:#e7edf6;font-family:system-ui;padding:40px'>" +
            "<h1>IGM Manager</h1><p>Le service de simulation n'a pas répondu. Relancez l'application.</p></body>",
        ),
    );
    return;
  }

  await win.loadURL(`http://127.0.0.1:${APP_PORT}`);
  if (isDev) win.webContents.openDevTools({ mode: "detach" });
}

ipcMain.handle("igm:engine-info", () => ({
  version: app.getVersion(),
  platform: process.platform,
  determinism: "xorshift128+ seedé par (match_id, tick)",
  tickRate: 60,
}));

app.whenReady().then(() => {
  startSimulationService();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  app.isQuitting = true;
  if (simProcess) simProcess.kill();
});
