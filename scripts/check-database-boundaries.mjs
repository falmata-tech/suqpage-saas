import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const manifestPath = path.join(root, "architecture", "sqlite-boundaries.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
const allowed = new Set(manifest.allowedDirectSqliteModules);
const extensions = new Set([".js", ".mjs", ".ts", ".tsx"]);
const directDatabaseBoundary = /node:sqlite|from\s+["'](?:@\/lib\/db|\.{1,2}\/db)["']/;

function sourceFiles(directory) {
  if (!fs.existsSync(directory)) return [];
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return extensions.has(path.extname(entry.name)) ? [full] : [];
  });
}

const actual = [...sourceFiles(path.join(root, "app")), ...sourceFiles(path.join(root, "lib"))]
  .filter((file) => directDatabaseBoundary.test(fs.readFileSync(file, "utf8")))
  .map((file) => path.relative(root, file))
  .sort();
const unapproved = actual.filter((file) => !allowed.has(file));
const retired = [...allowed].filter((file) => !actual.includes(file)).sort();

if (unapproved.length) {
  console.error("Unreviewed direct SQLite boundaries:\n" + unapproved.map((file) => `- ${file}`).join("\n"));
  console.error("Move the query behind an existing port or update ADR-0013 and the reviewed inventory explicitly.");
  process.exit(1);
}

console.log(JSON.stringify({
  runtimeStatus: manifest.runtimeStatus,
  approvedDirectModules: actual.length,
  retiredInventoryEntries: retired.length,
  newDirectModules: 0,
  knownDialectWorkItems: manifest.knownDialectWork.length,
}));
