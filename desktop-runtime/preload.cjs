const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("desktopUpdates", {
  version: () => ipcRenderer.invoke("desktop-updates:version"),
  check: () => ipcRenderer.invoke("desktop-updates:check"),
  download: () => ipcRenderer.invoke("desktop-updates:download"),
  releases: () => ipcRenderer.invoke("desktop-updates:releases"),
});
