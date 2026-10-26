const REPO_RELEASES = "https://github.com/bagrot/intercom-push-generator/releases";

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

function releaseUrls(payload) {
  const version = versionParts(String(payload?.tag_name || ""));
  const expectedName = version ? `Intercom-Push-Generator-Setup-${version.join(".")}.exe` : "";
  const releaseUrl = typeof payload?.html_url === "string" && payload.html_url.startsWith(REPO_RELEASES + "/tag/")
    ? payload.html_url : REPO_RELEASES;
  const asset = Array.isArray(payload?.assets)
    ? payload.assets.find((item) => item?.name === expectedName
      && typeof item?.browser_download_url === "string"
      && item.browser_download_url.startsWith(REPO_RELEASES + "/download/"))
    : null;
  return { releaseUrl, downloadUrl: asset?.browser_download_url || releaseUrl };
}

function releaseState(currentVersion, payload) {
  const latestVersion = String(payload?.tag_name || "").replace(/^v/, "");
  const comparison = compareVersions(latestVersion, currentVersion);
  if (comparison === null) return { status: "unavailable", currentVersion, message: "Не удалось прочитать версию релиза." };
  if (comparison <= 0) return { status: "current", currentVersion, latestVersion };
  return { status: "update", currentVersion, latestVersion, releaseUrl: releaseUrls(payload).releaseUrl };
}

module.exports = { compareVersions, releaseState, releaseUrls };
