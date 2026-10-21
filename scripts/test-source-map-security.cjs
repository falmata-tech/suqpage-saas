const assert = require('node:assert/strict');
const { spawnSync } = require('node:child_process');

// DEP-042/S59: exercise the upstream indexed-map security fix with bounded work.
const run = spawnSync(process.execPath, ['-e', `
  const assert = require('node:assert/strict');
  const { SourceMapConsumer, SourceMapGenerator } = require('source-map-js');
  const base = { version: 3, sources: ['input.js'], names: [], mappings: 'AAAA' };
  const section = (line, map = base) => ({ version: 3, sections: [{ offset: { line, column: 0 }, map }] });
  for (const line of [-1, 0.5, Infinity, Number.MAX_SAFE_INTEGER, '3']) {
    assert.throws(() => new SourceMapConsumer(section(line)), /offset/i);
  }
  assert.throws(() => new SourceMapConsumer(section(6000000, section(6000000))), /offset/i);
  const valid = new SourceMapConsumer(section(2));
  const positions = [];
  valid.eachMapping(mapping => positions.push(mapping));
  assert.equal(positions[0].generatedLine, 3);
  assert.equal(positions[0].originalLine, 1);
  const mapped = new SourceMapConsumer(SourceMapGenerator.fromSourceMap(new SourceMapConsumer(base)).toJSON());
  assert.deepEqual(mapped.originalPositionFor({ line: 1, column: 0 }), {
    source: 'input.js', line: 1, column: 0, name: null,
  });
`], { encoding: 'utf8', timeout: 5000 });
assert.ifError(run.error);
assert.equal(run.status, 0, run.stderr);
console.log('Source-map security: invalid and excessive nested offsets rejected; valid indexed mappings preserved.');
