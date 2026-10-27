const PUBLIC_FOLDER = "https://disk.yandex.ru/d/yRC7UiZ1fFeR5A";
const PUBLIC_API = "https://cloud-api.yandex.net/v1/disk/public/resources/download";

function versionParts(value) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)$/.exec(String(value || ""));
  return match ? match.slice(1).map(Number) : null;
}

function compareVersions(a, b) {
  const left = versionParts(a);
  const right = versionParts(b);
  if (!left || !right) return null;
  for (let index = 0; index < 3; index++) {
    if (left[index] !== right[index]) return Math.sign(left[index] - right[index]);
  }
  return 0;
}

function publicFileApiUrl(name) {
  const url = new URL(PUBLIC_API);
  url.searchParams.set("public_key", PUBLIC_FOLDER);
  url.searchParams.set("path", `/${name}`);
  return url.toString();
}

function isYandexDownloadUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && /(^|\.)yandex\.(ru|net|com)$/.test(url.hostname);
  } catch {
    return false;
  }
}

function installerAsset(manifest) {
  const version = versionParts(manifest?.version);
  if (!version) return null;
  const name = `Intercom-Push-Generator-Setup-${version.join(".")}.exe`;
  if (manifest?.file !== name || !Number.isSafeInteger(manifest?.size) || manifest.size <= 0
      || !/^[a-f0-9]{64}$/i.test(String(manifest?.sha256 || ""))) return null;
  return { name, size: manifest.size, sha256: manifest.sha256.toLowerCase() };
}

function releaseState(currentVersion, manifest) {
  const latestVersion = String(manifest?.version || "");
  const comparison = compareVersions(latestVersion, currentVersion);
  if (comparison === null) return { status: "unavailable", currentVersion, message: "Не удалось прочитать версию обновления." };
  if (comparison <= 0) return { status: "current", currentVersion, latestVersion };
  if (!installerAsset(manifest)) return { status: "unavailable", currentVersion, message: "В папке нет данных для проверенного установщика Windows." };
  const releaseNotes = typeof manifest.notes === "string" ? manifest.notes.trim().slice(0, 12000) : "";
  return { status: "update", currentVersion, latestVersion, releaseUrl: PUBLIC_FOLDER,
    releaseNotes: releaseNotes || "Описание изменений для этой версии не указано." };
}

module.exports = { PUBLIC_FOLDER, compareVersions, publicFileApiUrl, isYandexDownloadUrl, installerAsset, releaseState };
