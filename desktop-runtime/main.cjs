const { app, BrowserWindow, dialog, ipcMain, net, shell } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { releaseState, releaseUrls } = require("./updates.cjs");

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
const RELEASE_API = "https://api.github.com/repos/bagrot/intercom-push-generator/releases/latest";
const PORT = 3210; // Keep the origin stable so local templates and imported addresses persist across updates.

let server;
let mainWindow;
let latestDownloadUrl = "";

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
    const response = await net.fetch(RELEASE_API, {
      headers: {
        Accept: "application/vnd.github+json",
        "User-Agent": "intercom-push-generator-desktop",
      },
    });
    if (response.status === 404) return { status: "unavailable", currentVersion, message: "На GitHub пока нет опубликованного релиза." };
    if (!response.ok) throw new Error(`GitHub: HTTP ${response.status}`);
    const payload = await response.json();
    const state = releaseState(currentVersion, payload);
    latestDownloadUrl = state.status === "update" ? releaseUrls(payload).downloadUrl : "";
    return state;
  } catch {
    return { status: "unavailable", currentVersion, message: "Не удалось проверить GitHub. Попробуйте позже." };
  }
}

ipcMain.handle("desktop-updates:version", () => app.getVersion());
ipcMain.handle("desktop-updates:check", checkForUpdates);
ipcMain.handle("desktop-updates:download", async () => {
  if (!latestDownloadUrl) return false;
  await shell.openExternal(latestDownloadUrl);
  return true;
});
ipcMain.handle("desktop-updates:releases", async () => {
  await shell.openExternal("https://github.com/bagrot/intercom-push-generator/releases");
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
