import XLSX from "xlsx";
import { writeFileSync } from "node:fs";

const source = "C:/Users/user/Downloads/Генератор ПУШИ УмРеши.xlsx";
const destination = new URL("../lib/barrier-templates.json", import.meta.url);
const workbook = XLSX.readFile(source);
const rows = XLSX.utils.sheet_to_json(workbook.Sheets["Шлагбаумы"], { header: 1, defval: "" });
const ids = [
  "barrier_new", "barrier_operation", "barrier_replacement", "barrier_widget",
  "barrier_entry_rules", "barrier_maintenance", "barrier_connection",
  "barrier_plate_restored", "barrier_plate_issues", "barrier_radars",
  "barrier_operator", "barrier_no_quorum", "barrier_commercial",
];
const templates = Object.fromEntries(ids.map((id, index) => {
  const row = rows[index + 1];
  const clean = (value) => String(value ?? "").replace(/\r\n/g, "\n")
    .replaceAll('href="transport.mos.ru/feedback"', 'href="https://transport.mos.ru/feedback"')
    .replaceAll(' target="_blank"', "").replaceAll(' rel="noopener noreferrer"', "").trim();
  const template = { newsTitle: clean(row[2]), newsBody: clean(row[3]), pushTitle: clean(row[4]), pushBody: clean(row[5]) };
  if (id === "barrier_operation") template.newsBody = template.newsBody.replaceAll("ДАТА НАЧАЛА РАБОТЫ + 1", "{{BARRIER_OPERATION_NEXT_DATE}}").replaceAll("ДАТА НАЧАЛА РАБОТЫ", "{{BARRIER_OPERATION_DATE}}");
  if (id === "barrier_maintenance") {
    template.newsBody = template.newsBody.replaceAll("ДАТА с ВРЕМЯ НАЧАЛА до ВРЕМЯ ОКОНЧАНИЯ", "{{BARRIER_WORK_DATE}}{{BARRIER_WORK_TIME}}").replaceAll("ДАТА", "{{BARRIER_WORK_DATE}}");
    template.newsTitle = template.newsTitle.replaceAll("ДАТА", "{{BARRIER_WORK_DATE}}");
    template.pushBody = template.pushBody.replaceAll("ДАТА", "{{BARRIER_WORK_DATE}}");
  }
  if (id === "barrier_connection") template.newsBody = template.newsBody.replaceAll("В период с ДАТА1 по ДАТА2", "{{BARRIER_OUTAGE_PERIOD}}");
  if (id === "barrier_radars") template.newsBody = template.newsBody.replaceAll("С ДАТА", "{{BARRIER_RADAR_START}}");
  return [id, template];
}));
writeFileSync(destination, `${JSON.stringify(templates, null, 2)}\n`, "utf8");
console.log(`Imported ${ids.length} barrier scenarios`);
