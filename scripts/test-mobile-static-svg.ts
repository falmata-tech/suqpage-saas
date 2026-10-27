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
      b.onResolve({ filter: /^(react|react\/jsx-runtime|react-native|react-native-svg|expo-file-system|expo-crypto)$|^\.\/(runtime|open-link|LoadingBar)$/ }, args => ({ path: args.path, namespace: 'fixture' }));
      b.onLoad({ filter: /.*/, namespace: 'fixture' }, args => ({ loader: 'js', contents:
        args.path === 'react' ? `export const useState=v=>[photoFixture.state??v,x=>{photoFixture.state=x;}],useEffect=f=>photoFixture.effects.push(f),createContext=value=>({value,Provider:'Provider'}),useContext=context=>context.value;export default {useState,useEffect,createContext,useContext};` :
        args.path === 'react/jsx-runtime' ? `export const jsx=(type,props)=>({type,props}),jsxs=jsx;` :
        args.path === 'react-native' ? `export const View='View',Text='Text',Pressable='Pressable',TextInput='TextInput',ScrollView='ScrollView',Image='Image',ActivityIndicator='ActivityIndicator',KeyboardAvoidingView='KeyboardAvoidingView';export const Platform={OS:${JSON.stringify(platform)}},StyleSheet={create:x=>x},Alert={},useWindowDimensions=()=>({width:390,height:844});` :
        args.path === 'react-native-svg' ? `export default 'Svg';export const Path='Path',SvgUri='SvgUri';` :
        args.path === './runtime' ? `export const API='https://suqpage.com',useApp=()=>({session:{access_token:'private-test-token'}}),mediaUrl=ref=>'https://suqpage.com'+ref,auth={auth:{getSession:async()=>({data:{session:{access_token:'current-session-token'}}})}};` :
        args.path === './LoadingBar' ? `export default ()=>null;` :
        args.path === 'expo-file-system' ? `export const Paths={cache:'file:///app/cache'};export class File{constructor(path,name){this.uri=path+'/'+name;this.exists=false;}write(bytes){photoFixture.written=bytes;this.exists=true;}delete(){this.exists=false;photoFixture.deleted++;}}` :
        args.path === 'expo-crypto' ? `export const randomUUID=()=> 'controlled-private-image';` :
        `export const openLink=async()=>{};` }));
    }}] });
    const mod = { exports: {} as { Photo: (props: {refPath:string; privateImage?:boolean; height?:number}) => Element } };
    const photoFixture = {state:null as string|null,effects:[] as Array<()=>()=>void>,written:null as Uint8Array|null,deleted:0};
    const requests:Array<{url:string;authorization:string|undefined}> = [];
    vm.runInNewContext(result.outputFiles[0].text, { module: mod, exports: mod.exports, URL, URLSearchParams, Blob, AbortController, setTimeout, clearTimeout, console, photoFixture,
      fetch:async(url:string,options:{headers:{Authorization?:string}})=>{requests.push({url,authorization:options.headers.Authorization});return new Response(new Uint8Array([1,2,3]),{headers:{'content-type':'image/png'}});}
    });
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
    photoFixture.effects=[];
    const priv = photo({ refPath: '/api/page-drafts/private-photo', privateImage: true });
    assert.equal(priv.type,'View','private media remains a placeholder until the authenticated fetch completes');
    const cleanup=photoFixture.effects[0]();
    for(let retry=0;retry<20&&!photoFixture.state;retry++)await new Promise(resolve=>setTimeout(resolve,5));
    assert.ok(photoFixture.state,'private resource was loaded');
    assert.equal(requests.length,1);assert.match(requests[0].url,/^https:\/\/suqpage.com\/api\/mobile\/v1\/owner\/media\?ref=/);
    assert.equal(requests[0].authorization,'Bearer current-session-token','the fetch uses refreshed Auth rather than a cached token');
    const loaded=photo({refPath:'/api/page-drafts/private-photo',privateImage:true});assert.equal(loaded.type,'Image');
    const source=loaded.props.source as {uri:string;headers?:unknown};assert.equal(source.headers,undefined,'native image caches never receive bearer headers');
    assert.match(source.uri,platform==='web'?/^blob:/:/^file:\/\/\/app\/cache\//);
    cleanup();if(platform!=='web')assert.equal(photoFixture.deleted,1,'private cache bytes are released on cleanup');
  }
});
