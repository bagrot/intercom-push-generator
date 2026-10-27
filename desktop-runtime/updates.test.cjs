const { test } = require("node:test");
const assert = require("node:assert/strict");
const { compareVersions, publicFileApiUrl, isYandexDownloadUrl, installerAsset, releaseState } = require("./updates.cjs");

test("compares numeric versions rather than strings", () => {
  assert.equal(compareVersions("v0.2.10", "0.2.9"), 1);
  assert.equal(compareVersions("0.2.0", "v0.2.0"), 0);
  assert.equal(compareVersions("0.1.9", "0.2.0"), -1);
  assert.equal(compareVersions("latest", "0.2.0"), null);
});

test("accepts only the matching installer and checksum from the public folder manifest", () => {
  const manifest = { version: "0.2.4", file: "Intercom-Push-Generator-Setup-0.2.4.exe", size: 100,
    sha256: "a".repeat(64), notes: "  Исправления интерфейса  " };
  assert.equal(releaseState("0.2.3", manifest).status, "update");
  assert.equal(releaseState("0.2.3", manifest).releaseNotes, "Исправления интерфейса");
  assert.equal(releaseState("0.2.4", manifest).status, "current");
  assert.equal(installerAsset(manifest).sha256, "a".repeat(64));
  assert.equal(releaseState("0.2.3", { ...manifest, file: "other.exe" }).status, "unavailable");
  assert.equal(releaseState("0.2.3", { ...manifest, sha256: "" }).status, "unavailable");
  assert.equal(releaseState("0.2.3", { ...manifest, size: -1 }).status, "unavailable");
});

test("builds a path scoped to the public folder and restricts download hosts", () => {
  const url = new URL(publicFileApiUrl("latest.json"));
  assert.equal(url.searchParams.get("path"), "/latest.json");
  assert.match(url.searchParams.get("public_key"), /^https:\/\/disk\.yandex\.ru\/d\//);
  assert.equal(isYandexDownloadUrl("https://downloader.disk.yandex.ru/file"), true);
  assert.equal(isYandexDownloadUrl("https://evil.example/file"), false);
  assert.equal(isYandexDownloadUrl("http://downloader.disk.yandex.ru/file"), false);
});
