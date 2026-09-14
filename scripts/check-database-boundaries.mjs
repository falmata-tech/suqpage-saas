import fs from 'node:fs';
import path from 'node:path';
const forbidden = /node:sqlite|better-sqlite3|sql\.js|\bDatabaseSync\b|MIRTPAGE_DB_PATH|(?:from\s*|import\s*\()["'][^"']*(?:\/db|\/schema|product-upkeep-sqlite|request-sqlite)["']/;
const violations = [];
function inspect(root) {
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const file = path.join(root, entry.name);
    if (entry.isDirectory()) inspect(file);
    else if (/\.(?:ts|tsx|mjs|cjs|js|sh|json|ya?ml)$/.test(file) && file !== 'scripts/check-database-boundaries.mjs') {
      const source = fs.readFileSync(file, 'utf8');
      // Negative regression assertions may name a banned driver; imports and configuration may not.
      const lines = source.split('\n');
      lines.forEach((line, index) => { if (!line.includes('assert.doesNotMatch') && forbidden.test(line)) violations.push(`${file}:${index + 1}`); });
      if (/^["']use client["']/.test(source.trimStart()) && /from ["'][^"']*(?:runtime-sql|postgres-runtime|postgres-catalog-repository|\bpg)["']/.test(source)) violations.push(`${file}: client imports database adapter`);
    }
  }
}
for (const root of ['app','components','lib','scripts','tests','.github']) inspect(root);
if (violations.length) { console.error(`Invalid database boundaries:\n${violations.join('\n')}`); process.exitCode = 1; }
else console.log('PostgreSQL-only runtime, tooling and test database boundaries passed.');
