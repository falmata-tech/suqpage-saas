const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');

function assertWebInstall(directory = process.cwd()) {
  const root = fs.realpathSync(directory);
  const resolve = createRequire(path.join(root, 'package.json')).resolve;
  for (const name of ['expo', '@expo/cli', 'react-native', 'braces', 'node-forge']) {
    let installed = false;
    try { resolve(`${name}/package.json`); installed = true; }
    catch (error) {
      if (error.code !== 'MODULE_NOT_FOUND') throw error;
    }
    assert.equal(installed, false, `Web installation includes ${name}; use a clean, isolated root/contracts installation.`);
  }
  const contracts = fs.realpathSync(resolve('@africmade/contracts'));
  assert.ok(contracts.startsWith(path.join(root, 'packages', 'contracts') + path.sep), 'Shared contracts must resolve inside this release tree.');
  for (const name of ['next', 'react', 'pg', 'typescript']) {
    const resolved = fs.realpathSync(resolve(`${name}/package.json`));
    assert.ok(resolved.startsWith(path.join(root, 'node_modules') + path.sep), `${name} must come from this clean install, not an ancestor.`);
  }
}

module.exports = { assertWebInstall };
if (require.main === module) {
  assertWebInstall();
  console.log('Web root/shared install verified; native build tools are absent.');
}
