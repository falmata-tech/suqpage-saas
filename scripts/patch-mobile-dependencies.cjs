// Expo Router 57 pins query-string 7, whose decoder import predates the fixed
// ESM decoder. Keep upstream logic; adapt only its import. Remove when Expo
// supports the fixed decoder itself. DEP-042 tracks the temporary adapter.
const fs = require('node:fs');
const path = require('node:path');
const {createRequire} = require('node:module');
if (process.env.SUQPAGE_INSTALL_TARGET === 'web') {
  require('./check-web-install.cjs').assertWebInstall();
  console.log('Verified isolated web install; no mobile compatibility adapter needed.');
  process.exit(0);
}
if (process.env.SUQPAGE_INSTALL_TARGET) throw Error('Unknown Suqpage install target.');
const file = require.resolve('query-string');
if (typeof createRequire(file)('decode-uri-component').default !== 'function')
  throw Error('The fixed decoder was not installed. Restore the reviewed lockfile and run npm ci; do not bypass this check.');
const metadata = JSON.parse(fs.readFileSync(path.join(path.dirname(file), 'package.json'), 'utf8'));
if (metadata.version !== '7.1.3') throw Error('Review the query-string compatibility adapter before upgrading.');
const original = "const decodeComponent = require('decode-uri-component');";
const replacement = "const decodeComponent = require('decode-uri-component').default;";
const source = fs.readFileSync(file, 'utf8');
if (source.includes(replacement)) process.exit(0);
if (source.split(original).length !== 2) throw Error('Unexpected query-string decoder import; refusing to patch.');
fs.writeFileSync(file, source.replace(original, replacement));
console.log('Applied query-string compatibility import for the security-fixed decoder.');
