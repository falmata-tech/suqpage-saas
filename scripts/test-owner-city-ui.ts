import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';

type Node = {type: string | ((props: Record<string, unknown>) => Node); props: Record<string, unknown> & {children?: Node | Node[]}};
test('FE-056 actual native business form blocks stale city saves and preserves exact coordinates until a new selection', async () => {
  const fixture={business:{name:'QA store',logo_path:'',content_version:3},proposal:{version:2,country_code:'ET',city:'Addis Ababa',region:'Addis Ababa',location_mode:'storefront',latitude:9.012,longitude:38.712,place_id:'old-city'},existing:null,place:{id:'old-city',name:'Addis Ababa',localName:'',kind:'city',region:'Addis Ababa',latitude:9.03,longitude:38.74,countryCode:'ET'},category:'electronics'};
  const runtime={states:[] as unknown[],cursor:0,loads:0,writes:[] as unknown[],fixture};
  const result=await build({entryPoints:['apps/mobile/src/owner-business.tsx'],bundle:true,write:false,format:'cjs',platform:'node',define:{'process.env.EXPO_PUBLIC_OWNER_EMAIL_CHANGE_ENABLED':'"0"'},plugins:[{name:'owner-ui-ports',setup(b){
    b.onResolve({filter:/^(react(?:\/jsx-runtime)?|react-native|expo-router|\.\/runtime|\.\/ui|\.\/owner-forms|\.\/CountrySelector|\.\/CitySelector|\.\/LocationVisibilityChoices|\.\/OwnerLocationPicker|\.\/AttentionAlerts|\.\/owner-edit-navigation|\.\/OwnerEditConfirmation)$/},a=>({path:a.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=initial;return [fixture.states[i],value=>{fixture.states[i]=value}]};export const useRef=initial=>({current:initial}),Fragment='Fragment';export default {Fragment};`
      :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
      :a.path==='react-native'?`export const View='View',Text='Text',StyleSheet={create:value=>value},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
      :a.path==='expo-router'?`export const router={push(){}};`
      :a.path==='./runtime'?`export const useApp=()=>({t:s=>s,ownerRequest:async(path,body)=>{if(body)fixture.writes.push({path,body});return fixture.fixture;}}),useLoad=()=>({data:fixture.loads++===0?fixture.fixture:{categories:[]},loading:false,error:'',reload(){}}),request=async()=>({categories:[]}),API='http://127.0.0.1:3102',auth={};`
      :a.path==='./ui'?`export const Copy='Copy',Field='Field',Chip='Chip',Button='Button',Card='Card',Status='Status',Photo='Photo',s={},colors={},useOpenLink=()=>async()=>{};`
      :a.path==='./owner-forms'?`export const useAction=()=>({busy:false,isBusy:()=>false,run:fn=>fn()}),ActionStatus='ActionStatus',pickImages=async()=>[],addAsset=async()=>{};`
      :a.path==='./owner-edit-navigation'?`export const useOwnerEditGuard=state=>({confirming:false,changed(){},checkpoint:()=>0,requestLeave:leave=>{if(!state.busy&&!state.isBusy?.())leave();},keepEditing(){},discard(){},complete:leave=>leave?.()});`
      :a.path==='./AttentionAlerts'?`export const OwnerAlerts='OwnerAlerts';`
      :`export default '${a.path.slice(2)}';`}));
  }}]});
  const module={exports:{} as {BusinessForm:()=>Node}};vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,fixture:runtime,FormData});
  const nodes=(root:Node):Node[]=>[root,...[root.props.children].flat().filter((n):n is Node=>Boolean(n)&&typeof n==='object').flatMap(nodes)];
  const forms=nodes(module.exports.BusinessForm()).filter(n=>typeof n.type==='function'&&n.props.data===fixture);
  assert.equal(forms.length,1,'Exactly one actual business form consumes the authoritative loaded fixture');
  const form=forms[0]!;
  const render=()=>{runtime.cursor=0;return nodes((form.type as (p:Record<string,unknown>)=>Node)(form.props));};
  const save=(tree:Node[])=>tree.find(n=>n.type==='Button'&&n.props.label==='Save changes')!;
  const select=(tree:Node[],place:unknown)=>(tree.find(n=>n.type==='CitySelector')!.props.onSelect as (value:unknown)=>void)(place);
  const visibility=(tree:Node[])=>tree.find(n=>n.type==='LocationVisibilityChoices')!;
  let tree=render();assert.equal(save(tree).props.disabled,false);
  await (save(tree).props.onPress as ()=>Promise<void>)();
  assert.equal((runtime.writes[0] as {body:{latitude:string}}).body.latitude,'9.012','Saving another field preserves the exact storefront coordinate');
  (visibility(tree).props.onChange as (value:'area'|'storefront')=>void)('area');tree=render();
  assert.equal(save(tree).props.disabled,false,'City-only mode permits saving without a public pin');
  await (save(tree).props.onPress as ()=>Promise<void>)();
  const areaWrite=runtime.writes[1] as {body:{mode:string;latitude:string;longitude:string}};
  assert.equal(areaWrite.body.mode,'area');assert.equal(areaWrite.body.latitude,'');assert.equal(areaWrite.body.longitude,'');
  assert.equal((visibility(tree).props.value as string),'area','The visible choice matches the submitted location visibility');
  (visibility(tree).props.onChange as (value:'area'|'storefront')=>void)('storefront');tree=render();
  assert.equal((visibility(tree).props.value as string),'storefront');
  select(tree,null);tree=render();assert.equal(save(tree).props.disabled,true,'Typing a replacement city invalidates old save authority');
  select(tree,{...fixture.place,id:'new-city',name:'Hawassa',region:'Sidama',latitude:7.05,longitude:38.49});tree=render();assert.equal(save(tree).props.disabled,true,'A changed city requires a fresh exact pin when map visibility is selected');
  const picker=tree.find(n=>n.type==='OwnerLocationPicker')!;(picker.props.onChange as (value:{latitude:number;longitude:number})=>void)({latitude:7.05,longitude:38.49});tree=render();assert.equal(save(tree).props.disabled,false);
  await (save(tree).props.onPress as ()=>Promise<void>)();const last=runtime.writes.at(-1) as {body:{placeId:string;city:string;latitude:string}};
  assert.equal(last.body.placeId,'new-city');assert.equal(last.body.city,'Hawassa');assert.equal(last.body.latitude,'7.05');
  assert.ok(tree.some(n=>n.type==='Status'&&typeof n.props.retry==='function'),'Category loading has actionable retry');
});
