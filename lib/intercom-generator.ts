import { SCENARIOS, type ScenarioId, type TemplateRecord } from "./intercom-config";

export type TimeRangeValue = {
  id: string;
  startHour: string;
  startMinute: string;
  endHour: string;
  endMinute: string;
};

export type SessionValue = {
  id: string;
  date: string;
  entrances: string[];
  timeRanges: TimeRangeValue[];
  residentEntranceStart: string;
  residentEntranceEnd: string;
};

export type GeneratorValues = {
  address: string;
  installationStart: string;
  installationEnd: string;
  code: string;
  issueDate: string;
  issueEndDate: string;
  codeOffDate: string;
  completionDate: string;
  sessions: SessionValue[];
};

export type GeneratedOutput = TemplateRecord & { newsBodyHtml: string };

const MONTHS = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];

function parseDate(raw: string) {
  const [year, month, day] = raw.split("-").map(Number);
  if (!year || month < 1 || month > 12 || !day) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day ? { year, month, day } : null;
}

export function formatRuDate(raw: string) {
  const date = parseDate(raw);
  return date ? `${date.day} ${MONTHS[date.month - 1]}` : "";
}

export function formatDateRange(startRaw: string, endRaw: string) {
  const start = parseDate(startRaw);
  const end = parseDate(endRaw);
  if (start && end) {
    if (start.year === end.year && start.month === end.month) {
      return start.day === end.day ? formatRuDate(startRaw) : `с ${start.day} по ${end.day} ${MONTHS[end.month - 1]}`;
    }
    if (start.year === end.year) return `с ${start.day} ${MONTHS[start.month - 1]} по ${end.day} ${MONTHS[end.month - 1]}`;
    return `с ${start.day} ${MONTHS[start.month - 1]} ${start.year} года по ${end.day} ${MONTHS[end.month - 1]} ${end.year} года`;
  }
  if (start) return `с ${formatRuDate(startRaw)}`;
  if (end) return `до ${formatRuDate(endRaw)}`;
  return "";
}

function hasStart(range?: TimeRangeValue) { return !!range && range.startHour !== "" && range.startMinute !== ""; }
function hasEnd(range?: TimeRangeValue) { return !!range && range.endHour !== "" && range.endMinute !== ""; }

export function formatTimeRange(range?: TimeRangeValue) {
  if (!range) return "";
  const start = hasStart(range) ? `${range.startHour}:${range.startMinute}` : "";
  const end = hasEnd(range) ? `${range.endHour}:${range.endMinute}` : "";
  if (start && end) return `с ${start} до ${end}`;
  if (start) return `с ${start}`;
  if (end) return `до ${end}`;
  return "";
}

function entrancePhrase(value: string) {
  const entrance = value.trim();
  return entrance && entrance !== "__manual__" ? `в подъезде № ${entrance}` : "";
}

function residentsPhrase(startRaw: string, endRaw: string) {
  const start = startRaw.trim();
  const end = endRaw.trim();
  if (start && end) return start === end ? `для жителей подъезда № ${start}` : `для жителей подъездов с ${start} по ${end}`;
  if (start) return `для жителей подъезда № ${start}`;
  if (end) return `для жителей подъездов до ${end}`;
  return "";
}

export function formatSession(session: SessionValue) {
  const parts = [
    formatRuDate(session.date),
    formatTimeRange(session.timeRanges[0]),
    entrancePhrase(session.entrances[0] ?? ""),
    residentsPhrase(session.residentEntranceStart, session.residentEntranceEnd),
  ].filter(Boolean);
  return parts.length ? `${parts.join(" ")}.` : "";
}

function cleanText(value: string) {
  return value.replace(/[ \t]+\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/[ \t]{2,}/g, " ").trim();
}

function render(template: string, variables: Record<string, string>) {
  let output = template;
  for (const [key, value] of Object.entries(variables)) output = output.split(`{{${key}}}`).join(value);
  return cleanText(output.replace(/{{[A-Z_]+}}/g, ""));
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

export function textToHtml(value: string) {
  const linkify = (line: string) => escapeHtml(line).replace(/(Инструкция для (?:iOS|Android)): (https:\/\/ed\.mos\.ru\/storage\/[a-z0-9-]+)/g, (_match, label: string, url: string) => `<a href="${url}">${label}</a>`);
  return value.split(/\n{2,}/).map((block) => {
    const lines = block.split("\n");
    if (lines.every((line) => line.startsWith("- "))) return `<ul>${lines.map((line) => `<li>${linkify(line.slice(2))}</li>`).join("")}</ul>`;
    return `<p>${lines.map(linkify).join("<br>")}</p>`;
  }).join("");
}

export function validateValues(scenarioId: ScenarioId, values: GeneratorValues) {
  const errors: string[] = [];
  const scenario = SCENARIOS.find((item) => item.id === scenarioId);
  if (scenario?.addressRequired && !values.address.trim()) errors.push("Выберите адрес");
  if (scenario?.fields.includes("installationDates") && !values.installationStart && !values.installationEnd) errors.push("Укажите хотя бы одну дату работ");
  if (scenario?.fields.includes("issueDates") && !values.issueDate) errors.push("Укажите первую дату выдачи ключей");
  if (values.installationStart && values.installationEnd && values.installationEnd < values.installationStart) errors.push("Дата окончания работ раньше даты начала");
  if (values.issueDate && values.issueEndDate && values.issueEndDate < values.issueDate) errors.push("Конец выдачи раньше её начала");
  if (scenario?.fields.includes("sessions")) for (const session of values.sessions) {
    if (session.residentEntranceEnd.trim() && !session.residentEntranceStart.trim()) errors.push("Сначала укажите первый подъезд диапазона");
    const range = session.timeRanges[0];
    if (!range) continue;
    if ((range.startHour === "") !== (range.startMinute === "") || (range.endHour === "") !== (range.endMinute === "")) errors.push("Укажите часы и минуты вместе");
    if (hasStart(range) && hasEnd(range)) {
      const start = Number(range.startHour) * 60 + Number(range.startMinute);
      const end = Number(range.endHour) * 60 + Number(range.endMinute);
      if (end <= start) errors.push("Окончание интервала должно быть позже начала");
    }
  }
  return [...new Set(errors)];
}

export function generateOutput(scenarioId: ScenarioId, values: GeneratorValues, template: TemplateRecord): GeneratedOutput {
  const address = values.address.trim();
  const sessions = values.sessions.map(formatSession).filter(Boolean);
  const installationPeriod = formatDateRange(values.installationStart, values.installationEnd);
  const issuePeriod = values.issueEndDate ? formatDateRange(values.issueDate, values.issueEndDate) : formatRuDate(values.issueDate);
  const code = values.code.trim().toUpperCase();
  const codeOffDate = formatRuDate(values.codeOffDate);
  const completionDate = formatRuDate(values.completionDate);
  const variables: Record<string, string> = {
    ADDRESS: address,
    ADDRESS_SUFFIX: address ? ` по адресу: ${address}` : "",
    INSTALLATION_PERIOD: scenarioId === "installation_start" ? installationPeriod.replace(" по ", " до ") : installationPeriod,
    INSTALLATION_VERB: values.installationStart && !values.installationEnd ? "начнутся" : "пройдут",
    CODE_PARAGRAPH: code ? `\n\nВременный код для входа в подъезд: ${code}, далее — нажать кнопку с изображением трубки.` : "",
    CODE_CONTINUES_PARAGRAPH: code
      ? `Временный код для входа (${code} «трубка») продолжит действовать до окончания монтажных работ.\n\n`
      : "Временный код для входа продолжит действовать до окончания монтажных работ.\n\n",
    ISSUE_PERIOD: issuePeriod,
    ISSUE_EVENT: values.issueEndDate ? `будет проходить ${issuePeriod}` : `состоится ${issuePeriod}`,
    SESSIONS_PARAGRAPH: sessions.length ? `\n\nКлючи можно будет получить:\n${sessions.join("\n")}` : "",
    SESSIONS_RESCHEDULE_PARAGRAPH: sessions.length ? `\n\nВремя и место выдачи ключей:\n${sessions.join("\n")}` : "",
    CODE_OFF_PARAGRAPH: codeOffDate ? `\n\nВременный код для входа в подъезд будет отключен ${codeOffDate}.` : "",
    COMPLETION_SENTENCE: completionDate ? ` Ориентировочная дата завершения работ — ${completionDate}.` : "",
  };
  const newsTitle = render(template.newsTitle, variables);
  // Previously saved templates contain a fixed verb; keep their generated text date-aware too.
  const newsBodyTemplate = scenarioId === "installation_reschedule"
    ? template.newsBody.replace("пройдут {{INSTALLATION_PERIOD}}", "{{INSTALLATION_VERB}} {{INSTALLATION_PERIOD}}")
    : template.newsBody;
  const newsBody = render(newsBodyTemplate, variables);
  const pushTitle = render(template.pushTitle, variables);
  const pushBody = render(template.pushBody, variables);
  return { newsTitle, newsBody, newsBodyHtml: textToHtml(newsBody), pushTitle, pushBody };
}

export function emptyTimeRange(): TimeRangeValue {
  return { id: crypto.randomUUID(), startHour: "", startMinute: "", endHour: "", endMinute: "" };
}

export function emptySession(): SessionValue {
  return { id: crypto.randomUUID(), date: "", entrances: [""], timeRanges: [emptyTimeRange()], residentEntranceStart: "", residentEntranceEnd: "" };
}

export function emptyValues(): GeneratorValues {
  return { address: "", installationStart: "", installationEnd: "", code: "", issueDate: "", issueEndDate: "", codeOffDate: "", completionDate: "", sessions: [emptySession()] };
}
