import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';

type Element={type:string;props:Record<string,unknown>&{children?:unknown}};
// Actual Featured component; controlled React/native/runtime/router ports.
// The separate installed-Yoga test supplies real geometry, not this JSX fixture.
const source=build({entryPoints:['apps/mobile/app/(tabs)/featured.tsx'],bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'featured-grid-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|expo-router|(?:\.\.\/\.\.\/src\/|\.\/)(?:runtime|ui|chrome|SponsorCarousel|blocked-businesses))$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const createContext=initial=>({Provider:'ContextProvider',initial}),useContext=context=>context.initial;export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return[fixture.states[i],value=>fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value];};export const useRef=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]={current:initial};return fixture.states[i];};export const useCallback=fn=>fn,useEffect=()=>{};export default {};`
  :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable',ScrollView='ScrollView',Platform={OS:'android'},StyleSheet={create:value=>value},useWindowDimensions=()=>fixture.dimensions;`
  :a.path==='expo-router'?`export const router={push:value=>fixture.routes.push(value)},useFocusEffect=()=>{};`
  :a.path.endsWith('/runtime')?`export const useApp=()=>({t:key=>key}),request=()=>{throw Error('Unexpected network request');},useLoad=()=>fixture.load;`
  :a.path.endsWith('/ui')?`export const Screen='Screen',Copy='Copy',Photo='Photo',Status='Status',Icon='Icon',useOpenLink=()=>async()=>true,colors={ink:'#222',muted:'#667',brand:'#c43a00',line:'#ddd',soft:'#fff1e9',background:'#fff'};`
  :a.path.endsWith('/blocked-businesses')?`export const useBlockedBusinesses=()=>({ready:true,list:[]});`
  :a.path.endsWith('/SponsorCarousel')?`export const SponsorCarousel='SponsorCarousel';`
  :`export const CategoryArt='CategoryArt';`
 }));
}}]});
const nodes=(value:unknown):Element[]=>Array.isArray(value)?value.flatMap(nodes):!value||typeof value!=='object'?[]:[value as Element,...nodes((value as Element).props.children)];
const style=(node:Element)=>Object.assign({},...[node.props.style].flat(Infinity).filter(v=>v&&typeof v==='object')) as Record<string,unknown>;
const plain=<T>(value:T):T=>JSON.parse(JSON.stringify(value));
async function setup(){
 const slots=Array.from({length:5},(_,index)=>({slot:index+1,shop:{handle:'fixture-shop-'+(index+1),name:'Business '+(index+1),heroImagePath:'',city:'Fixture city',isDemo:true}}));
 const fixture={cursor:0,states:[] as unknown[],routes:[] as unknown[],dimensions:{width:390,height:844,fontScale:1},load:{loading:false,error:'',reload(){},data:{exclude:'',program:{date:'2026-10-20',schedule:[{weekday:2,dayLabel:'Tuesday',dateIso:'2026-10-20',dateLabel:'20 Oct',industryKey:'retail',industryLabel:'Retail',isToday:true}],broadcastLabel:'Today',tiktokUrl:'',youtubeUrl:'',policy:{startMinute:1230,endMinute:1440,presentationMinutes:30,changeoverMinutes:5,sponsorMentionCount:4,sponsorMentionMinutes:5},sponsors:[],slots}}}};
 const module={exports:{} as{default:()=>Element}};vm.runInNewContext((await source).outputFiles[0].text,{module,exports:module.exports,fixture});
 const render=()=>{fixture.cursor=0;return nodes(module.exports.default());};return{fixture,render};
}
test('FE-053 S151 Featured measures its own content and preserves five slots through narrow/wide/text transitions',async()=>{
 const f=await setup();let tree=f.render();const grid=tree.find(n=>n.props.testID==='featured-business-grid');assert.ok(grid);assert.equal(style(grid).gap,12);
 const measure=grid.props.onLayout as(event:{nativeEvent:{layout:{width:number}}})=>void;
 const cards=()=>tree.filter(n=>String(n.props.testID||'').startsWith('featured-business-')&&n.props.testID!=='featured-business-grid');
 assert.equal(cards().length,5);assert.ok(cards().every(card=>style(card).width==='100%'),'Unmeasured slots use full width');
 for(const sample of[{width:284,fontScale:1,two:false},{width:375.619049,fontScale:1,two:true},{width:724,fontScale:1,two:true},{width:724,fontScale:1.31,two:false},{width:311,fontScale:1,two:false},{width:312,fontScale:1.3,two:true}]){
  f.fixture.dimensions.fontScale=sample.fontScale;measure({nativeEvent:{layout:{width:sample.width}}});tree=f.render();
  assert.deepEqual(cards().map(n=>n.props.testID),[1,2,3,4,5].map(id=>'featured-business-'+id),'Resize never changes canonical slot order or drops the odd card');
  for(const card of cards()){const current=style(card);if(sample.two){assert.equal(current.width,undefined);assert.equal(current.flexBasis,'47%');assert.equal(current.flexGrow,1);assert.equal(current.minWidth,0);}else{assert.equal(current.width,'100%');assert.equal(current.flexBasis,undefined);}}
  const before=style(cards()[0]);for(const invalid of[0,-1,NaN,Infinity]){measure({nativeEvent:{layout:{width:invalid}}});tree=f.render();assert.deepEqual(style(cards()[0]),before);}
 }
 const last=tree.find(n=>n.props.accessibilityLabel==='Business 5');assert.ok(last);(last.props.onPress as()=>void)();assert.deepEqual(plain(f.fixture.routes),[{pathname:'/shop/[handle]',params:{handle:'fixture-shop-5'}}]);
 const day=tree.find(n=>n.props.testID==='featured-category-2');assert.ok(day);(day.props.onPress as()=>void)();tree=f.render();assert.equal((tree.find(n=>n.props.testID==='featured-category-2')!.props.accessibilityState as{selected:boolean}).selected,true);
});
