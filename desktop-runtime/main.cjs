const { app, BrowserWindow, dialog, ipcMain, net, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { PUBLIC_FOLDER, publicFileApiUrl, isYandexDownloadUrl, releaseState, installerAsset } = require("./updates.cjs");
const { saveVerifiedInstaller } = require("./download.cjs");

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};
const PORT = 3210; // Keep the origin stable so local templates and imported addresses persist across updates.

let server;
let mainWindow;
let latestInstaller = null;
let installing = false;

function siteRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, "site") : path.join(__dirname, "..", "dist", "client");
}

function startStaticServer() {
  const root = path.resolve(siteRoot());
  return new Promise((resolve, reject) => {
    const localServer = http.createServer((request, response) => {
      let pathname;
      try {
        pathname = decodeURIComponent(new URL(request.url || "/", "http://localhost").pathname);
      } catch {
        response.writeHead(400).end("Bad request");
        return;
      }
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      let target = path.resolve(root, relative);
      if (target !== root && !target.startsWith(root + path.sep)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (fs.existsSync(target) && fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
      else if (!fs.existsSync(target) && !path.extname(target)) target = path.join(root, "index.html");
      fs.readFile(target, (error, content) => {
        if (error) {
          response.writeHead(404).end("Not found");
          return;
        }
        response.writeHead(200, {
          "Content-Type": MIME[path.extname(target)] || "application/octet-stream",
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
        });
        response.end(content);
      });
    });
    localServer.once("error", reject);
    localServer.listen(PORT, "127.0.0.1", () => resolve(localServer));
  });
}

async function checkForUpdates() {
  const currentVersion = app.getVersion();
  try {
    const response = await net.fetch(await publicDownloadUrl("latest.json"), { cache: "no-store" });
    if (!response.ok) throw new Error(`Manifest: HTTP ${response.status}`);
    const raw = await response.text();
    if (raw.length > 20000) throw new Error("Файл версии слишком большой.");
    const manifest = JSON.parse(raw);
    const state = releaseState(currentVersion, manifest);
    latestInstaller = state.status === "update" ? installerAsset(manifest) : null;
    return state;
  } catch {
    latestInstaller = null;
    return { status: "unavailable", currentVersion, message: "Не удалось проверить обновления на Яндекс Диске. Попробуйте позже." };
  }
}

async function publicDownloadUrl(name) {
  const response = await net.fetch(publicFileApiUrl(name), { cache: "no-store" });
  if (!response.ok) throw new Error(`Яндекс Диск: HTTP ${response.status}`);
  const payload = await response.json();
  if (!isYandexDownloadUrl(payload?.href)) throw new Error("Яндекс Диск вернул недопустимую ссылку.");
  return payload.href;
}

async function downloadInstaller(asset, sender) {
  const directory = path.join(app.getPath("userData"), "updates");
  const response = await net.fetch(await publicDownloadUrl(asset.name), { cache: "no-store" });
  if (!response.ok || !response.body) throw new Error(`Не удалось скачать установщик (HTTP ${response.status}).`);
  return saveVerifiedInstaller(response.body, directory, asset, (progress) => {
    if (!sender.isDestroyed()) sender.send("desktop-updates:progress", progress);
  });
}

ipcMain.handle("desktop-updates:version", () => app.getVersion());
ipcMain.handle("desktop-updates:check", checkForUpdates);
ipcMain.handle("desktop-updates:install", async (event) => {
  if (!app.isPackaged) return { ok: false, message: "Установка обновления доступна в собранном приложении." };
  if (!latestInstaller) return { ok: false, message: "Сначала проверьте наличие обновления." };
  if (installing) return { ok: false, message: "Обновление уже загружается." };
  installing = true;
  try {
    const installer = await downloadInstaller(latestInstaller, event.sender);
    if (!event.sender.isDestroyed()) event.sender.send("desktop-updates:progress", { phase: "launching", percent: 100 });
    const error = await shell.openPath(installer);
    if (error) throw new Error(`Не удалось запустить установщик: ${error}`);
    setTimeout(() => app.quit(), 800);
    return { ok: true };
  } catch (error) {
    return { ok: false, message: error instanceof Error ? error.message : "Не удалось установить обновление." };
  } finally {
    installing = false;
  }
});
ipcMain.handle("desktop-updates:releases", async () => {
  await shell.openExternal(PUBLIC_FOLDER);
  return true;
});

async function createWindow() {
  try {
    server = await startStaticServer();
    const address = server.address();
    const origin = `http://127.0.0.1:${address.port}`;
    mainWindow = new BrowserWindow({
      width: 1500,
      height: 960,
      minWidth: 1040,
      minHeight: 720,
      title: "Генератор пушей — Электронный дом",
      autoHideMenuBar: true,
      webPreferences: {
        preload: path.join(__dirname, "preload.cjs"),
        contextIsolation: true,
        nodeIntegration: false,
      },
    });
    mainWindow.webContents.setWindowOpenHandler(() => ({ action: "deny" }));
    mainWindow.webContents.on("will-navigate", (event, url) => {
      if (!url.startsWith(origin + "/")) event.preventDefault();
    });
    await mainWindow.loadURL(origin);
  } catch (error) {
    dialog.showErrorBox("Генератор пушей — Электронный дом", error.message);
    app.quit();
  }
}

if (!app.requestSingleInstanceLock()) app.quit();
else {
  app.on("second-instance", () => {
    if (mainWindow?.isMinimized()) mainWindow.restore();
    mainWindow?.focus();
  });
  app.whenReady().then(createWindow);
  app.on("window-all-closed", () => app.quit());
  app.on("before-quit", () => server?.close());
}
