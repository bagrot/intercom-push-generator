const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { Readable, Transform } = require("node:stream");
const { pipeline } = require("node:stream/promises");

async function saveVerifiedInstaller(body, directory, asset, report = () => {}) {
  await fs.promises.mkdir(directory, { recursive: true });
  const target = path.join(directory, asset.name);
  const partial = `${target}.part`;
  await fs.promises.rm(partial, { force: true });
  try {
    const hash = crypto.createHash("sha256");
    let received = 0;
    let lastPercent = -1;
    const progress = new Transform({
      transform(chunk, _encoding, callback) {
        received += chunk.length;
        if (received > asset.size) return callback(new Error("Размер скачанного файла не совпадает с релизом."));
        hash.update(chunk);
        const percent = Math.floor(received * 100 / asset.size);
        if (percent !== lastPercent) {
          lastPercent = percent;
          report({ phase: "downloading", percent });
        }
        callback(null, chunk);
      },
    });
    await pipeline(Readable.fromWeb(body), progress, fs.createWriteStream(partial));
    report({ phase: "verifying", percent: 100 });
    if (received !== asset.size || hash.digest("hex") !== asset.sha256) throw new Error("Контрольная сумма установщика не совпадает с опубликованной версией.");
    await fs.promises.rm(target, { force: true });
    await fs.promises.rename(partial, target);
    return target;
  } finally {
    await fs.promises.rm(partial, { force: true });
  }
}

module.exports = { saveVerifiedInstaller };
