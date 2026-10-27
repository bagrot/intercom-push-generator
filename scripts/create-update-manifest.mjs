import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const { version } = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
const file = `Intercom-Push-Generator-Setup-${version}.exe`;
const installerPath = path.join(root, "release", file);
const notesPath = path.join(root, "release-notes", `${version}.md`);
const installer = fs.readFileSync(installerPath);
const manifest = {
  version,
  file,
  size: installer.length,
  sha256: crypto.createHash("sha256").update(installer).digest("hex"),
  notes: fs.existsSync(notesPath) ? fs.readFileSync(notesPath, "utf8").trim() : "",
};
fs.writeFileSync(path.join(root, "release", "latest.json"), JSON.stringify(manifest, null, 2) + "\n");
console.log(`Created release/latest.json for ${file}`);
