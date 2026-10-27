import path from "node:path";
import { rcedit } from "rcedit";

const [exePath, iconPath] = process.argv.slice(2);
if (!exePath || !iconPath) throw new Error("Usage: node scripts/set-desktop-icon.mjs <exe> <icon.ico>");
await rcedit(path.resolve(exePath), { icon: path.resolve(iconPath) });
console.log("Embedded desktop icon in", exePath);
