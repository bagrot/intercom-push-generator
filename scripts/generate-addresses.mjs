import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const source = process.argv[2];
if (!source) throw new Error("Передайте путь к Excel-файлу с адресами");

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const output = path.join(root, "public", "addresses.json");
const workbook = XLSX.readFile(source, { dense: true });
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: false, defval: "" });
if (String(rows[0]?.[0] ?? "").trim().toLocaleLowerCase("ru") !== "адрес") {
  throw new Error("В первом столбце ожидается заголовок «Адрес»");
}

const addresses = [...new Set(rows.slice(1).map((row) => String(row[0] ?? "").trim()).filter(Boolean))];
if (addresses.length < 1000) throw new Error("Слишком мало адресов: проверьте исходный файл");
fs.writeFileSync(output, JSON.stringify(addresses), "utf8");
console.log(`Исходных строк: ${rows.length - 1}; уникальных адресов: ${addresses.length}; файл: ${output}`);
