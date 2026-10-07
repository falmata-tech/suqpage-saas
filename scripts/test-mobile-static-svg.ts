import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import vm from 'node:vm';
import { isStaticSeedSvg } from '../apps/mobile/src/static-svg';

test('FE-053 owned static SVG paths exclude remote, private and traversal inputs', () => {
  for (const ref of ['/uploads/seed/portfolio/afia-botanics/logo.svg', '/uploads/seed/example.svg']) assert.equal(isStaticSeedSvg(ref), true);
  for (const ref of ['https://suqpage.com/uploads/seed/logo.svg', '//evil.test/logo.svg', '/uploads/seed/../private.svg', '/uploads/seed/%2e%2e/private.svg', '/uploads/seed/logo.svg?q=x', '/uploads/seed/logo.svg#x', '/uploads/private/logo.svg', '/api/page-drafts/logo.svg', '/uploads/seed/logo.svg\n', '/uploads/seed/logo.jpg', 'data:image/svg+xml,test']) assert.equal(isStaticSeedSvg(ref), false, ref);
});

type Element = { type: string; props: Record<string, unknown> & { children?: Element } };
test('FE-053 actual native Photo branch renders SVG without Auth and preserves raster/private/web paths', async () => {
  for (const platform of ['android', 'ios', 'web']) {
    const result = await build({ entryPoints: ['apps/mobile/src/ui.tsx'], bundle: true, platform: 'node', format: 'cjs', write: false, jsx: 'automatic', loader: {'.png':'dataurl'}, plugins: [{ name: 'controlled-photo-ports', setup(b) {
      b.onResolve({ filter: /^(react|react\/jsx-runtime|react-native|react-native-svg)$|^\.\/runtime$|^\.\/open-link$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'js', contents:
        args.path === 'react' ? `export const useState=v=>[v,()=>{}],useEffect=()=>{};export default {useState,useEffect};` :
        args.path === 'react/jsx-runtime' ? `export const jsx=(type,props)=>({type,props}),jsxs=jsx;` :
        args.path === 'react-native' ? `export const View='View',Text='Text',Pressable='Pressable',TextInput='TextInput',ScrollView='ScrollView',Image='Image',ActivityIndicator='ActivityIndicator',KeyboardAvoidingView='KeyboardAvoidingView';export const Platform={OS:${JSON.stringify(platform)}},StyleSheet={create:x=>x},Alert={};` :
        args.path === 'react-native-svg' ? `export default 'Svg';export const Path='Path',SvgUri='SvgUri';` :
        args.path === './runtime' ? `export const API='https://suqpage.com',useApp=()=>({session:{access_token:'private-test-token'}}),mediaUrl=ref=>'https://suqpage.com'+ref;` :
        `export const openLink=async()=>{};` }));
    }}] });
    const mod = { exports: {} as { Photo: (props: {refPath:string; privateImage?:boolean; height?:number}) => Element } };
    vm.runInNewContext(result.outputFiles[0].text, { module: mod, exports: mod.exports, URL, URLSearchParams });
    const photo = mod.exports.Photo;
    const logo = photo({ refPath: '/uploads/seed/portfolio/afia-botanics/logo.svg', height: 90 });
    if (platform !== 'web') {
      const svg = logo.props.children!;
      assert.equal(svg.type, 'SvgUri'); assert.equal(svg.props.uri, 'https://suqpage.com/uploads/seed/portfolio/afia-botanics/logo.svg');
      assert.equal(svg.props.height, 90); assert.equal(svg.props.headers, undefined); assert.equal(svg.props.preserveAspectRatio, 'xMidYMid meet');
      assert.ok(svg.props.fallback); assert.equal(svg.props.onError, photo({ refPath: '/uploads/seed/portfolio/afia-botanics/logo.svg' }).props.children!.props.onError, 'stable callback prevents render-driven fetch loops');
    } else assert.equal(logo.type, 'Image');
    assert.equal(photo({ refPath: '/uploads/seed/photo.jpg' }).type, 'Image');
    assert.equal(photo({ refPath: '/uploads/private/untrusted.svg' }).type, 'Image');
    const priv = photo({ refPath: '/api/page-drafts/private-photo', privateImage: true });
    if (platform !== 'web') {
      assert.equal(priv.type, 'Image');
      const source = priv.props.source as {uri:string;headers:{Authorization:string}};
      assert.match(source.uri, /^https:\/\/suqpage.com\/api\/mobile\/v1\/owner\/media\?ref=/); assert.equal(source.headers.Authorization, 'Bearer private-test-token');
    }
  }
});
