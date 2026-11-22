import assert from 'node:assert/strict';
import {test} from 'node:test';
import {runInNewContext} from 'node:vm';
import {build} from 'esbuild';

test('FE-078 retired native tracking and plan screens open Market without reading data', async () => {
  for (const entry of ['tracking.tsx','tracking/[reference].tsx','transport-plan.tsx']) {
    const bundle = await build({
      entryPoints: ['apps/mobile/app/'+entry],
      bundle: true,
      format: 'cjs',
      platform: 'node',
      write: false,
      jsx: 'automatic',
      external: ['expo-router','react/jsx-runtime'],
      metafile: true,
    });
    assert.deepEqual(Object.keys(bundle.metafile.inputs), ['apps/mobile/app/'+entry]);
    const module = {exports: {} as {default(): unknown}};
    runInNewContext(bundle.outputFiles[0].text,{
      module,
      exports: module.exports,
      require(specifier:string) {
        if (specifier === 'expo-router') return {Redirect: 'Redirect'};
        if (specifier === 'react/jsx-runtime') return {
          jsx: (type:string,props:unknown) => ({type,props}),
        };
        throw new Error('Unexpected dependency for retired screen');
      },
    });
    assert.equal(JSON.stringify(module.exports.default()),JSON.stringify({
      type:'Redirect',
      props:{href:'/'},
    }),entry);
  }
});
