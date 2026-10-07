const { app, BrowserWindow, dialog } = require("electron");
const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const PORT = 3210;
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

function siteRoot() {
  return app.isPackaged ? path.join(process.resourcesPath, "site") : path.join(__dirname, "..", "dist", "client");
}

function startStaticServer() {
  const root = path.resolve(siteRoot());
  return new Promise((resolve, reject) => {
    const server = http.createServer((request, response) => {
      const pathname = decodeURIComponent((request.url || "/").split("?")[0]);
      const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
      let target = path.resolve(root, relative);
      if (!target.startsWith(root)) {
        response.writeHead(403).end("Forbidden");
        return;
      }
      if (!fs.existsSync(target) || fs.statSync(target).isDirectory()) target = path.join(root, "index.html");
      fs.readFile(target, (error, content) => {
        if (error) {
          response.writeHead(404).end("Not found");
          return;
        }
        response.writeHead(200, { "Content-Type": MIME[path.extname(target)] || "application/octet-stream" });
        response.end(content);
      });
    });
    server.once("error", reject);
    server.listen(PORT, "127.0.0.1", () => resolve(server));
  });
}

async function createWindow() {
  try {
    await startStaticServer();
  } catch (error) {
    dialog.showErrorBox("Генератор пушей — Домофоны", error.message);
    app.quit();
    return;
  }
  const window = new BrowserWindow({
    width: 1500,
    height: 960,
    minWidth: 1040,
    minHeight: 720,
    title: "Генератор пушей — Домофоны",
    autoHideMenuBar: true,
    webPreferences: { contextIsolation: true, nodeIntegration: false },
  });
  await window.loadURL(`http://127.0.0.1:${PORT}`);
}

app.whenReady().then(createWindow);
app.on("window-all-closed", () => app.quit());
