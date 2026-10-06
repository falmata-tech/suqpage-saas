import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const root=fs.realpathSync(process.argv[2]||process.cwd());
const expected=process.argv[3];assert.match(expected||'',/^[a-f0-9]{64}$/,'Supply the SHA-256 of the reviewed/tested archive');
const manifestPath=path.join(root,'.netlify/functions/manifest.json');
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
assert.equal(manifest.version,1);assert.equal(manifest.functions.length,1);
const fn=manifest.functions[0];assert.equal(fn.name,'___netlify-server-handler');assert.equal(fn.bundler,'none');assert.equal(fn.runtimeVersion,'nodejs24.x');
assert.equal(fs.realpathSync(fn.path),path.join(root,'.netlify/functions/___netlify-server-handler.zip'));
assert.equal(crypto.createHash('sha256').update(fs.readFileSync(fn.path)).digest('hex'),expected,'Function archive differs from tested artifact');
// CLI otherwise re-bundles after its two-minute cache TTL. This receipt certifies
// current bytes against the reviewed digest; it never rebuilds or edits the ZIP.
manifest.timestamp=Date.now();fs.writeFileSync(manifestPath,JSON.stringify(manifest));
console.log('Verified exact function archive; refreshed deploy cache receipt.');
