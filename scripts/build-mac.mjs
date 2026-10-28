import { spawnSync } from "node:child_process";
import { copyFileSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// Keep electron-builder outside the pnpm workspace. Otherwise it includes the
// web project's production dependencies in the app, including native sharp
// binaries that prevent the x64 and arm64 packages from merging.
const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const runtime = join(root, "desktop-runtime");
const site = join(root, "dist", "client");
const icon = join(root, "build", "icon.png");
const output = join(root, "release");
const packageJson = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
const config = JSON.parse(readFileSync(join(root, "scripts", "electron-builder.mac.json"), "utf8"));
const project = mkdtempSync(join(tmpdir(), "intercom-push-mac-"));

try {
  for (const filename of readdirSync(runtime)) {
    if (filename.endsWith(".cjs") && !filename.endsWith(".test.cjs") || filename === "package.json" || filename === "icon.png") {
      copyFileSync(join(runtime, filename), join(project, filename));
    }
  }
  config.electronVersion = packageJson.devDependencies.electron;
  config.directories = { output };
  config.files = ["*.cjs", "package.json", "icon.png"];
  config.extraResources = [{ from: site, to: "site" }];
  config.mac.icon = icon;
  const configPath = join(project, "electron-builder.json");
  writeFileSync(configPath, JSON.stringify(config, null, 2));

  const cli = join(root, "node_modules", "electron-builder", "out", "cli", "cli.js");
  const result = spawnSync(process.execPath, [cli, "--projectDir", project, "--mac", "dir", "--universal", "--config", configPath, "--publish", "never"], {
    cwd: root,
    env: process.env,
    stdio: "inherit",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exitCode = result.status ?? 1;
} finally {
  rmSync(project, { recursive: true, force: true });
}
