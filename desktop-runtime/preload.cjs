const { contextBridge, ipcRenderer } = require("electron");

if (process.platform === "win32") contextBridge.exposeInMainWorld("desktopUpdates", {
  version: () => ipcRenderer.invoke("desktop-updates:version"),
  check: () => ipcRenderer.invoke("desktop-updates:check"),
  install: () => ipcRenderer.invoke("desktop-updates:install"),
  onProgress: (callback) => {
    const listener = (_event, progress) => callback(progress);
    ipcRenderer.on("desktop-updates:progress", listener);
    return () => ipcRenderer.removeListener("desktop-updates:progress", listener);
  },
  releases: () => ipcRenderer.invoke("desktop-updates:releases"),
});
