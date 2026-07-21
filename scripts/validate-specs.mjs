import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const files = [];
for (const directory of ["specs/frontend", "specs/backend", "specs/deployment", "docs/adr"]) {
  const absolute = path.join(root, directory);
  if (!fs.existsSync(absolute)) continue;
  for (const name of fs.readdirSync(absolute)) if (name.endsWith(".md")) files.push(path.join(directory, name));
}

const failures = [];
const documents = new Map();
const parseList = (raw) => raw.trim().replace(/^\[|\]$/g, "").split(",").map((item) => item.trim()).filter(Boolean);
for (const file of files) {
  const text = fs.readFileSync(path.join(root, file), "utf8");
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) { failures.push(`${file}: missing YAML front matter`); continue; }
  const meta = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-z_]+):\s*(.*)$/);
    if (field) meta[field[1]] = field[2].trim();
  }
  for (const key of ["id", "title", "status", "related"]) if (!meta[key]) failures.push(`${file}: missing ${key}`);
  if (meta.id && documents.has(meta.id)) failures.push(`${file}: duplicate id ${meta.id}`);
  if (meta.id && !new RegExp(`(^${meta.id.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`).test(path.basename(file, ".md"))) failures.push(`${file}: filename must start with ${meta.id}`);
  const isAdr = meta.id?.startsWith("ADR-");
  const isBase = meta.id?.endsWith("_BASE");
  const statuses = isAdr ? ["proposed", "accepted", "superseded", "rejected"] : ["draft", "ready", "in_progress", "done", "deprecated"];
  if (meta.status && !statuses.includes(meta.status)) failures.push(`${file}: invalid status ${meta.status}`);
  if (!isAdr && !isBase) {
    if (!/change_level:\s*L[0-4]/.test(match[1])) failures.push(`${file}: missing change_level L0-L4`);
    for (const heading of ["Problem", "Scenario", "Test plan", "Rollout"]) if (!new RegExp(`^## .*${heading}`, "mi").test(text)) failures.push(`${file}: missing ${heading} section`);
    if (!/\bGIVEN\b[\s\S]*\bWHEN\b[\s\S]*\bTHEN\b/.test(text)) failures.push(`${file}: missing GIVEN/WHEN/THEN scenario`);
    if (meta.status === "done" && !/Evidence:/i.test(text)) failures.push(`${file}: done spec must record Evidence`);
  }
  if (meta.id) documents.set(meta.id, { file, related: parseList(meta.related || "[]") });
}

for (const [id, document] of documents) {
  for (const related of document.related) {
    if (!documents.has(related)) failures.push(`${document.file}: related ID ${related} does not exist`);
    else if (/^(FE|BE|DEP)-\d+$/.test(id) && /^(FE|BE|DEP)-\d+$/.test(related) && !documents.get(related).related.includes(id)) failures.push(`${document.file}: ${related} must link back to ${id}`);
  }
}

const traceability = fs.readFileSync(path.join(root, "specs/TRACEABILITY.md"), "utf8");
for (const [id, document] of documents) {
  if (!id.endsWith("_BASE") && !id.startsWith("ADR-") && !traceability.includes(id)) failures.push(`${document.file}: ${id} missing from specs/TRACEABILITY.md`);
}

if (failures.length) {
  console.error("Specification validation failed:\n" + failures.map((failure) => `- ${failure}`).join("\n"));
  process.exit(1);
}
console.log(`Validated ${documents.size} specs/ADRs and traceability links.`);
