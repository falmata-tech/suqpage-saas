import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { checkSources, admitScriptFiles } from './check-workflow-scripts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const sources = (files) => new Map(Object.entries(files).map(([name, source]) => [path.join(root, 'scripts', `__workflow_fixture_${name}`), source]));
let cases = 0;
function check(name, run) { run(); cases++; console.log(`ok ${name}`); }

check('valid ESM and Node imports', () => {
  assert.deepEqual(checkSources(sources({ 'valid.mjs': 'import assert from "node:assert/strict"; import fs from "node:fs"; assert.equal(typeof fs.readFileSync, "function"); export const ready = true;' })), []);
});
check('valid CommonJS and Node globals', () => {
  assert.deepEqual(checkSources(sources({ 'valid.cjs': 'const fs = require("node:fs"); module.exports = () => fs.readFileSync(process.argv[1], "utf8");' })), []);
});
check('undefined assertion binding', () => {
  assert(checkSources(sources({ 'missing.mjs': 'assert.equal(1, 1);' })).some((item) => item.code === 2304 && item.line === 1));
});
check('undefined object shorthand', () => {
  assert(checkSources(sources({ 'missing.mjs': 'export const value = { expectedResult };' })).some((item) => item.code === 18004));
});
check('misspelled named import', () => {
  const result = checkSources(sources({ 'main.mjs': 'import { knownValu } from "./__workflow_fixture_dependency.mjs"; export { knownValu };', 'dependency.mjs': 'export const knownValue = 1;' }));
  assert(result.some((item) => item.code === 2305 || item.code === 2724));
});
check('unresolved module', () => {
  assert(checkSources(sources({ 'missing.mjs': 'import { x } from "./__workflow_fixture_absent.mjs"; export { x };' })).some((item) => item.code === 2307));
});
check('explicit TypeScript companion imports resolve without executing', () => {
  assert.deepEqual(checkSources(sources({ 'main.mjs': 'import { value } from "./__workflow_fixture_dependency.ts"; export { value };', 'dependency.ts': 'export const value: number = 1; throw new Error("MUST NOT EXECUTE");' })), []);
  assert.deepEqual(admitScriptFiles(['scripts/test-netlify-readiness.mjs'], ['lib/platform-assets.ts']), [path.join(root, 'scripts/test-netlify-readiness.mjs'), path.join(root, 'lib/platform-assets.ts')]);
  for (const entry of ['.env', '.local/private.ts', '../outside.ts', 'lib/private/example.ts', 'node_modules/example/index.d.ts', 'lib/']) {
    assert.throws(() => admitScriptFiles(['scripts/test-netlify-readiness.mjs'], [entry]));
  }
});
check('syntax failure', () => {
  assert(checkSources(sources({ 'syntax.mjs': 'export const broken = ;' })).some((item) => item.code >= 1000 && item.code < 2000));
});
check('imports and top-level effects never execute', () => {
  const fixture = sources({ 'main.mjs': 'import "./__workflow_fixture_inert.mjs"; throw new Error("MUST NOT EXECUTE");', 'inert.mjs': 'process.exit(99); export {};' });
  assert.deepEqual(checkSources(fixture), []);
});
check('compiler suppressions cannot hide missing bindings', () => {
  assert(checkSources(sources({ 'suppressed.mjs': '// @ts-nocheck\nmissingBinding();' })).some((item) => item.code === 'suppression'));
});
check('private/outside/noncanonical/directory/TypeScript selections rejected', () => {
  for (const entry of ['.env', '.local/private.mjs', '/tmp/example.mjs', '../outside.mjs', 'scripts/../.env', 'scripts/', 'scripts/test.ts', 'scripts/.env.mjs', 'scripts\\check-runtime-baseline.mjs']) {
    assert.throws(() => admitScriptFiles([entry]));
  }
  assert.throws(() => admitScriptFiles([]));
  assert.throws(() => admitScriptFiles(['scripts/check-runtime-baseline.mjs', 'scripts/check-runtime-baseline.mjs']));
});
check('canonical public files accepted without loading their code', () => {
  assert.deepEqual(admitScriptFiles(['scripts/check-runtime-baseline.mjs']), [path.join(root, 'scripts/check-runtime-baseline.mjs')]);
});
check('checker gate and contributor contract stay wired', () => {
  const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
  assert.equal(pkg.scripts['check:workflow-scripts'], 'node scripts/check-workflow-scripts.mjs');
  assert(pkg.scripts['test:workflow'].includes('node scripts/test-workflow-script-quality.mjs'));
  assert(pkg.scripts['test:workflow'].includes('node scripts/check-workflow-scripts.mjs'));
  assert(fs.readFileSync(path.join(root, 'AGENTS.md'), 'utf8').includes('npm run check:workflow-scripts -- scripts/<file>'));
});
check('actual isolated entry resolves symlinked installed declarations without hiding errors', () => {
  const fixture = fs.realpathSync(fs.mkdtempSync(path.join(os.tmpdir(), 'mirtpage-workflow-symlink-')));
  try {
    fs.mkdirSync(path.join(fixture, 'scripts'));
    fs.copyFileSync(path.join(root, 'scripts/check-workflow-scripts.mjs'), path.join(fixture, 'scripts/check-workflow-scripts.mjs'));
    fs.symlinkSync(fs.realpathSync(path.join(root, 'node_modules')), path.join(fixture, 'node_modules'), 'dir');
    fs.writeFileSync(path.join(fixture, 'scripts/valid.mjs'), 'import assert from "node:assert/strict"; import fs from "node:fs"; assert.ok(fs); throw new Error("MUST NOT EXECUTE");');
    fs.writeFileSync(path.join(fixture, 'scripts/missing.mjs'), 'assert.equal(1, 1);');
    fs.writeFileSync(path.join(fixture, 'scripts/import.mjs'), 'import { nonExistentMirtpageExport } from "node:fs"; export { nonExistentMirtpageExport };');
    const run = (...args) => spawnSync(process.execPath, [path.join(fixture, 'scripts/check-workflow-scripts.mjs'), ...args], { cwd: fixture, env: { PATH: process.env.PATH }, encoding: 'utf8', timeout: 30000 });
    const valid = run('scripts/valid.mjs');
    assert.equal(valid.status, 0, valid.stderr);
    assert.match(valid.stdout, /static only, no target execution/);
    const missing = run('scripts/missing.mjs');
    assert.equal(missing.status, 1, missing.stderr);
    assert.match(missing.stderr, /TS2304/);
    const badImport = run('scripts/import.mjs');
    assert.equal(badImport.status, 1, badImport.stderr);
    assert.match(badImport.stderr, /TS2305/);
    fs.symlinkSync(path.join(root, 'scripts/check-runtime-baseline.mjs'), path.join(fixture, 'scripts/escape.mjs'));
    assert.equal(run('scripts/escape.mjs').status, 2, 'Selected source symlinks must remain rejected');
    assert.equal(run('--include', '../private.ts', 'scripts/valid.mjs').status, 2, 'Companion paths must remain confined');
  } finally { fs.rmSync(fixture, { recursive: true, force: true }); }
});
console.log(`Workflow script quality regressions passed (${cases} cases; in-memory/isolated fixtures, no target execution).`);
