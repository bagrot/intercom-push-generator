const { test } = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");
const { saveVerifiedInstaller } = require("./download.cjs");

test("downloads and verifies the installer before making it available", async () => {
  const directory = await fs.promises.mkdtemp(path.join(os.tmpdir(), "intercom-update-"));
  try {
    const content = Buffer.from("test installer contents");
    const asset = { name: "test.exe", size: content.length, sha256: crypto.createHash("sha256").update(content).digest("hex") };
    const progress = [];
    const target = await saveVerifiedInstaller(Readable.toWeb(Readable.from([content])), directory, asset, (value) => progress.push(value));
    assert.deepEqual(await fs.promises.readFile(target), content);
    assert.equal(progress.at(-1).phase, "verifying");
    await assert.rejects(saveVerifiedInstaller(Readable.toWeb(Readable.from([Buffer.from("tampered contents")])), directory, asset), /Размер|Контрольная сумма/);
    assert.deepEqual(await fs.promises.readFile(target), content);
    assert.equal(fs.existsSync(`${target}.part`), false);
  } finally {
    await fs.promises.rm(directory, { recursive: true, force: true });
  }
});
