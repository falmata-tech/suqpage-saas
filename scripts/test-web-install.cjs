const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { spawnSync } = require('node:child_process');
const { assertWebInstall } = require('./check-web-install.cjs');
const root = fs.mkdtempSync(path.join(os.tmpdir(), 'suqpage-web-boundary-'));
function write(name, value) {
  const file = path.join(root, name);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, value);
}
try {
  write('package.json', '{"private":true}');
  for (const name of ['next', 'react', 'pg', 'typescript']) write(`node_modules/${name}/package.json`, JSON.stringify({ name, version: '0.0.0-test' }));
  write('packages/contracts/package.json', '{"name":"@suqpage/contracts","main":"index.js"}');
  write('packages/contracts/index.js', 'module.exports = {};');
  fs.mkdirSync(path.join(root, 'node_modules/@suqpage'), { recursive: true });
  fs.symlinkSync('../../packages/contracts', path.join(root, 'node_modules/@suqpage/contracts'));
  assert.doesNotThrow(() => assertWebInstall(root));
  for (const name of ['expo', '@expo/cli', 'react-native', 'braces', 'node-forge']) {
    write(`node_modules/${name}/package.json`, JSON.stringify({ name, version: '0.0.0-test' }));
    assert.throws(() => assertWebInstall(root), /Web installation includes/);
    fs.rmSync(path.join(root, 'node_modules', name), { recursive: true });
  }
  for (const name of ['patch-mobile-dependencies.cjs', 'check-web-install.cjs']) write(`scripts/${name}`, fs.readFileSync(path.join(__dirname, name)));
  const run = target => spawnSync(process.execPath, ['scripts/patch-mobile-dependencies.cjs'], {
    cwd: root, env: { ...process.env, SUQPAGE_INSTALL_TARGET: target }, encoding: 'utf8',
  });
  assert.equal(run('web').status, 0, 'Explicit isolated web lifecycle succeeds');
  assert.notEqual(run('').status, 0, 'Normal missing mobile install fails rather than silently skipping');
  assert.notEqual(run('unknown').status, 0, 'Unknown install target fails');
  write('node_modules/expo/package.json', '{"name":"expo","version":"0.0.0-test"}');
  assert.notEqual(run('web').status, 0, 'Web target cannot bypass a contaminated install');
  console.log('Web install boundary: clean target, five excluded packages, lifecycle and fail-closed checks passed.');
} finally {
  fs.rmSync(root, { recursive: true, force: true });
}
