import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
type Element={type:string;props:Record<string,unknown>&{children?:Element}};
test('FE-053 B03 actual native Support and preview icons have distinct 24px outlines instead of the unknown-name arrow',async()=>{
 const result=await build({entryPoints:['apps/mobile/src/ui.tsx'],bundle:true,write:false,platform:'node',format:'cjs',loader:{'.png':'dataurl'},plugins:[{name:'native-icon-platform-ports',setup(b){
  b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|react-native-svg|expo-file-system|expo-crypto|\.\/(?:runtime|LoadingBar|open-link))$/},a=>({path:a.path,namespace:'port'}));
  b.onLoad({filter:/.*/,namespace:'port'},a=>({loader:'js',contents:a.path==='react'?`export const createContext=()=>({}),useContext=()=>0;export default {};`
   :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
   :a.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable',TextInput='TextInput',ScrollView='ScrollView',Image='Image',ActivityIndicator='ActivityIndicator',KeyboardAvoidingView='KeyboardAvoidingView',Platform={OS:'android'},StyleSheet={create:value=>value},Alert={},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
   :a.path==='react-native-svg'?`export default 'Svg';export const Path='Path',SvgUri='SvgUri';`
   :a.path==='expo-file-system'?`export class File{};export const Paths={};`
   :a.path==='expo-crypto'?`export const randomUUID=()=>{throw Error('Unexpected random ID');};`
   :a.path==='./runtime'?`export const useApp=()=>({t:value=>value}),mediaUrl=value=>value,API='https://fixture.invalid',auth=null;`
   :a.path==='./open-link'?`export const openLink=()=>{throw Error('Unexpected external action');};`
   :`export default 'LoadingBar';`}));
 }}]});
 const module={exports:{} as{Icon:(props:{name:string;size:number;color:string})=>Element}};vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports});
 const render=(name:string)=>module.exports.Icon({name,size:24,color:'#c43a00'}),fallback=render('unknown-icon');
 const paths:string[]=[];for(const name of['headphones','eye']){
  const icon=render(name);assert.equal(icon.type,'Svg');assert.equal(icon.props.viewBox,'0 0 24 24');assert.equal(icon.props.width,24);assert.equal(icon.props.height,24);assert.equal(icon.props.fill,'none');const path=icon.props.children!;assert.equal(path.type,'Path');assert.equal(path.props.stroke,'#c43a00');assert.equal(path.props.strokeWidth,1.8);assert.equal(path.props.strokeLinecap,'round');assert.equal(path.props.strokeLinejoin,'round');assert.notEqual(path.props.d,fallback.props.children!.props.d);assert.ok(typeof path.props.d==='string'&&/[a-z]/i.test(path.props.d));paths.push(path.props.d);
 }
 assert.notEqual(paths[0],paths[1]);
});
