const assert = require('node:assert/strict');
const {createRequire} = require('node:module');
const {execFileSync} = require('node:child_process');
const query = require('query-string');
for (const text of ['grass', 'የቤት ዕቃ', 'እንኳን ደህና', 'a & b / c', '100%', '😀']) {
  assert.equal(query.parse(query.stringify({q: text})).q, text);
}
assert.deepEqual([...query.parse('category=home&category=care').category], ['home', 'care']);
// Run adversarial decoding in a bounded process, so a regression cannot hang CI.
execFileSync(process.execPath, ['-e', "require('query-string').parse('q='+('%FE%FF%00%C0%AF'.repeat(2000)))"], {timeout: 3000});
// GHSA-qr28-fpjm-wq7f: distinct runs exercise the quadratic replacement path
// left in decoder 0.5.0; repeated identical runs alone do not cover it.
execFileSync(process.execPath, ['-e', `
  let encoded = '';
  for (let i = 0; i < 32000; i++) {
    encoded += '%' + (i >> 8).toString(16).padStart(2, '0')
      + '%' + (i & 255).toString(16).padStart(2, '0') + 'x';
  }
  require('query-string').parse('q=' + encoded + '%zz');
`], {timeout: 3000});
const xcodeRequire = createRequire(require.resolve('xcode'));
assert.match(xcodeRequire('uuid').v4(), /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
console.log('Mobile dependency compatibility passed: Unicode/query round trips, bounded malformed input and Xcode UUID v4.');

// DEP-042: the exact fingerprint consumer uses only retained minimatch APIs.
// Exercise its real path selection and hashing, including negation; resolving a
// patched version alone does not establish compatibility of a major upgrade.
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const fingerprintRequire = createRequire(require.resolve('@expo/fingerprint'));
assert.equal(fingerprintRequire('./../package.json').version, '0.20.16',
  'Review the scoped minimatch override when Expo fingerprint changes.');
assert.equal(fingerprintRequire('minimatch/package.json').version, '11.0.8');
const fingerprintPaths = fingerprintRequire('./utils/Path');
for (const [file, patterns, ignored] of [
  ['android/build/output.bin', ['**/android/build/**/*'], true],
  ['android/app/src/Main.kt', ['**/android/build/**/*'], false],
  ['../node_modules/library/index.js', ['**/node_modules/**'], true],
  ['native/generated/Keep.kt', ['native/generated/**', '!native/generated/Keep.kt'], false],
  ['native/generated/drop.kt', ['native/generated/**', '!native/generated/Keep.kt'], true],
  ['native/.cache/state', ['native/.cache/**'], true],
  ['native/src/ሰላም.kt', ['native/**/ሰላም.kt'], true],
  ['ios/Pods/Library/file.m', ['**/ios/Pods/**/*'], true],
]) assert.equal(fingerprintPaths.isIgnoredPath(file, patterns), ignored, file);
execFileSync(process.execPath, ['--max-old-space-size=96', '-e', `
  const {createRequire} = require('node:module');
  const {Minimatch} = createRequire(require.resolve('@expo/fingerprint'))('minimatch');
  try { new Minimatch('a/**/../'.repeat(32) + 'a', {optimizationLevel: 2}); }
  catch (error) { if (!(error instanceof RangeError)) throw error; }
`], {timeout: 3000, stdio: 'pipe'});

async function verifyFingerprint() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'africmade-fingerprint-'));
  try {
    const files = {
      'native/src/Main.kt': 'fun main()=1\n',
      'native/src/ሰላም.kt': 'hello\n',
      'native/generated/Keep.kt': 'keep\n',
      'native/generated/drop.kt': 'drop\n',
      'native/build/output.bin': 'build\n',
      'native/.cache/state': 'cache\n',
    };
    for (const [file, text] of Object.entries(files)) {
      fs.mkdirSync(path.dirname(path.join(root, file)), {recursive: true});
      fs.writeFileSync(path.join(root, file), text);
    }
    const {normalizeOptionsAsync} = fingerprintRequire('./Options');
    const {createFingerprintFromSourcesAsync} = fingerprintRequire('./hash/Hash');
    const options = await normalizeOptionsAsync(root, {platforms: [], ignorePaths: [
      'native/generated/**', '!native/generated/Keep.kt', 'native/build/**', 'native/.cache/**',
    ]});
    const fingerprint = () => createFingerprintFromSourcesAsync([
      {type: 'dir', filePath: 'native', reasons: ['compatibility-fixture']},
    ], root, options);
    const before = await fingerprint();
    // Independently recorded on fingerprint 0.20.16/minimatch 10.2.6 before the
    // override. Absolute temporary paths do not enter this directory hash.
    assert.equal(before.hash, 'd35f43100b8f9eea999628f2d0c48c1945307863');
    for (const file of ['native/generated/drop.kt', 'native/build/output.bin', 'native/.cache/state'])
      fs.writeFileSync(path.join(root, file), 'changed ignored output\n');
    assert.equal((await fingerprint()).hash, before.hash, 'Ignored generated files must not invalidate the native fingerprint.');
    fs.writeFileSync(path.join(root, 'native/generated/Keep.kt'), 'changed retained source\n');
    assert.notEqual((await fingerprint()).hash, before.hash, 'Negated retained sources must still invalidate the fingerprint.');
    console.log('Expo fingerprint compatibility passed: real path inclusion/exclusion, stable hashes and bounded glob preprocessing.');
  } finally {
    fs.rmSync(root, {recursive: true, force: true});
  }
}
void verifyFingerprint().catch(error => { console.error(error); process.exitCode = 1; });
