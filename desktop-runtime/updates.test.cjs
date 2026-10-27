const { test } = require("node:test");
const assert = require("node:assert/strict");
const { compareVersions, releaseState, releaseUrls, installerAsset, releaseNotes } = require("./updates.cjs");

test("compares numeric versions rather than strings", () => {
  assert.equal(compareVersions("v0.2.10", "0.2.9"), 1);
  assert.equal(compareVersions("0.2.0", "v0.2.0"), 0);
  assert.equal(compareVersions("0.1.9", "0.2.0"), -1);
  assert.equal(compareVersions("latest", "0.2.0"), null);
});

test("finds only the matching installer in the official repository", () => {
  const payload = {
    tag_name: "v0.2.1",
    html_url: "https://github.com/bagrot/intercom-push-generator/releases/tag/v0.2.1",
    assets: [
      { name: "Intercom-Push-Generator-Setup-0.2.0.exe", browser_download_url: "https://github.com/bagrot/intercom-push-generator/releases/download/v0.2.1/old.exe" },
      { name: "Intercom-Push-Generator-Setup-0.2.1.exe", browser_download_url: "https://github.com/bagrot/intercom-push-generator/releases/download/v0.2.1/Intercom-Push-Generator-Setup-0.2.1.exe", size: 100, digest: `sha256:${"a".repeat(64)}` },
    ],
  };
  assert.equal(releaseState("0.2.0", payload).status, "update");
  assert.match(releaseUrls(payload).downloadUrl, /Setup-0\.2\.1\.exe$/);
  assert.equal(releaseState("0.2.1", payload).status, "current");
  assert.equal(releaseUrls({ ...payload, assets: [{ name: "Intercom-Push-Generator-Setup-0.2.1.exe", browser_download_url: "https://evil.example/installer.exe" }] }).downloadUrl, payload.html_url);
  assert.equal(installerAsset(payload).sha256, "a".repeat(64));
  assert.equal(releaseState("0.2.0", { ...payload, assets: [{ ...payload.assets[1], digest: "" }] }).status, "unavailable");
  assert.equal(releaseState("0.2.0", { ...payload, assets: [{ ...payload.assets[1], browser_download_url: "https://evil.example/installer.exe" }] }).status, "unavailable");
  assert.equal(releaseNotes({ body: "  Исправления интерфейса  " }), "Исправления интерфейса");
});
