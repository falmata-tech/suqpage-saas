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
