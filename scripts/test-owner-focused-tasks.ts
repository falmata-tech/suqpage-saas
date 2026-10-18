import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {ownerPageTask,ownerPageReturn,OWNER_PAGE_TASKS} from '../lib/owner-page-tasks';

type Element={type:string|((props:Record<string,unknown>)=>unknown);props:Record<string,unknown>&{children?:unknown}};
const contacts={phone:'+12025550121',email:'business@example.invalid',website:'https://business.example.invalid/',whatsapp:'+12025550122',telegram:'fixture_shop',tiktok:'fixture_shop',instagram:'fixture_shop',facebook:'fixture_shop'};
const content={template:'profile-v1',coverStyle:'blended',introduction:'',about:'Saved business story',heroImage:'/seed/shop.webp',videoUrl:'https://www.youtube.com/watch?v=M7lc1UVf-VE',accentColor:'#087F75',contacts};
const draft={version:4,content,assistanceEnabled:false};
const home={user:{name:'Private owner',email:'private@example.invalid',phone:'+12025550123'},shop:{id:18,name:'Fixture shop',handle:'fixture-shop',status:'draft',about:content.about,cover:content.heroImage,videoUrl:content.videoUrl,contacts,accentColor:content.accentColor,products:[]},draft,publicationRevision:1,issues:[{label:'Add your real contact details'}]};
const bundled=build({entryPoints:['components/OwnerPageEditor.tsx','apps/mobile/src/owner-forms.tsx'],outdir:'/tmp/suqpage-owner-focused-test',bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'focused-owner-ports',setup(b){
 b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
 b.onResolve({filter:/^(react(?:\/jsx-runtime)?|react-native|next\/navigation|expo-router(?:\/react-navigation)?|expo-file-system|expo-crypto|expo-image-picker|lucide-react|@\/lib\/i18n\/ui|\.\/(?:runtime|ui|chrome|image-upload|CitySelector|CountrySelector|owner-handle|StorefrontAccentPicker|ShowroomContent|showroom\/ShowroomApp|LoadingBar))$/},a=>({path:a.path,namespace:'ports'}));
 b.onLoad({filter:/.*/,namespace:'ports'},a=>({loader:'js',contents:
  a.path==='react'?`export const useState=initial=>fixture.state(initial),useRef=initial=>fixture.ref(initial),useEffect=(fn,deps)=>fixture.effect(fn,deps),useMemo=(fn,deps)=>fixture.memo(fn,deps),useDeferredValue=value=>value,useCallback=fn=>fn,createContext=()=>({}),useContext=()=>null;export default {};`
  :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
  :a.path==='react-native'?`export const View='View',Text='Text',Pressable='Pressable',Platform={OS:'web'},Alert={alert(){throw Error('Unexpected native alert');}};`
  :a.path==='lucide-react'?`export const Eye='Eye',Pencil='Pencil',Save='Save',LoaderCircle='LoaderCircle',Check='Check',Upload='Upload',Globe='Globe',Undo2='Undo2',ExternalLink='ExternalLink',Palette='Palette',ArrowLeft='ArrowLeft';`
  :a.path==='@/lib/i18n/ui'?`export const useUiText=()=>s=>s;`
  :a.path==='next/navigation'?`export const useRouter=()=>({push:path=>fixture.routes.push(path),refresh:()=>fixture.refreshes++});`
  :a.path==='expo-router'?`export const router={push:path=>fixture.routes.push(path),setParams:params=>fixture.params.push(params)},useFocusEffect=()=>{},useIsFocused=()=>true,useNavigation=()=>({dispatch:action=>fixture.routes.push(action)});`
  :a.path==='expo-router/react-navigation'?`export const usePreventRemove=()=>{};`
  :a.path==='expo-crypto'?`export const randomUUID=()=> 'fixture-key';`
  :a.path==='expo-file-system'?`export class File {constructor(){throw Error('Unexpected file access');}}`
  :a.path==='expo-image-picker'?`export const launchImageLibraryAsync=async()=>{throw Error('Unexpected photo picker');};`
  :a.path==='./runtime'?`export const useApp=()=>({t:s=>s,ownerRequest:fixture.ownerRequest}),useLoad=()=>({}),request=async()=>{throw Error('Unexpected public read');},auth={},API='http://127.0.0.1:3102';`
  :a.path==='./ui'?`export const Copy='Copy',Icon='Icon',Card='Card',Field='Field',Button='Button',Chip='Chip',Photo='Photo',Status='Status',s={},colors={},useOpenLink=()=>()=>{};`
  :a.path==='./chrome'?`export const Sheet='Sheet';`
  :a.path==='./image-upload'?`export const appendPickedImage=async()=>{throw Error('Unexpected upload');};`
  :a.path==='./owner-handle'?`export const HandleInput='HandleInput',HandleEditor='HandleEditor';`
  :a.path==='./ShowroomContent'?`export const ShowroomContent='ShowroomContent';`
  :`export default '${a.path.split('/').at(-1)}';`
 }));
}}]});
// Execute the extracted confirmation child so the original native Keep/Discard
// assertions still exercise its real UI and guard. SDK lifecycle is covered by
// test-mobile-owner-edit-navigation.ts; only its native boundary is controlled here.
function nodes(value:unknown,visible=true):Element[]{if(!value||typeof value!=='object')return[];const node=value as Element;if(typeof node.type==='function'&&node.type.name==='OwnerEditConfirmation')return nodes(node.type(node.props),visible);if(visible&&(node.type==='Sheet'&&node.props.visible===false||node.type==='dialog'&&!((node.props.ref as{current:{open:boolean}})?.current?.open)))return[];return[node,...[node.props.children].flat(Infinity).flatMap(value=>nodes(value,visible))];}
function text(value:unknown):string{if(Array.isArray(value))return value.map(text).join('');if(value&&typeof value==='object')return text((value as Element).props.children);return typeof value==='string'?value:'';}
function named(tree:Element[],label:string){const node=tree.find(node=>node.type==='Button'&&node.props.label===label||node.type==='Pressable'&&node.props.accessibilityLabel===label||node.type==='button'&&text(node.props.children)===label);assert.ok(node,label);return node;}
function press(node:Element){const fn=node.props.onClick||node.props.onPress;return(fn as()=>unknown)();}
function input(tree:Element[],key:string){const node=tree.find(node=>node.props.id===key||node.type==='Field'&&node.props.label===key);assert.ok(node,key);return node;}
function edit(node:Element,value:string){if(node.type==='Field')(node.props.onChangeText as(value:string)=>void)(value);else(node.props.onChange as(event:unknown)=>void)({target:{value}});}
async function flush(){await new Promise<void>(resolve=>setImmediate(resolve));}
async function fixture(platform:'web'|'native',initialTask='about',returnTo:unknown='showroom'){
 const fixture={values:[] as unknown[],refs:[] as Array<{current:unknown}>,effects:[] as Array<()=>void>,effectDeps:[] as Array<unknown[]|undefined>,memos:[] as Array<{deps:unknown[];value:unknown}>,cursor:0,refCursor:0,effectCursor:0,memoCursor:0,changed:false,routes:[] as unknown[],params:[] as unknown[],refreshes:0,writes:[] as Array<Record<string,unknown>>,fail:false,defer:null as null|(()=>Promise<void>),saved:structuredClone(draft),home:structuredClone(home),location:{href:'http://127.0.0.1:3102/dashboard/page-editor?view=edit'},
  state(initial:unknown):[unknown,(value:unknown)=>void]{const i=this.cursor++;if(!(i in this.values))this.values[i]=typeof initial==='function'?(initial as()=>unknown)():initial;return[this.values[i],value=>{const next=typeof value==='function'?(value as(v:unknown)=>unknown)(this.values[i]):value;if(!Object.is(next,this.values[i]))this.changed=true;this.values[i]=next;}];},
  ref(initial:unknown){const i=this.refCursor++;return this.refs[i]||(this.refs[i]={current:initial});},
  effect(fn:()=>void,deps:unknown[]){const i=this.effectCursor++,before=this.effectDeps[i];if(!before||deps.some((value,j)=>!Object.is(value,before[j]))){this.effectDeps[i]=deps;this.effects.push(fn);}},
  memo(fn:()=>unknown,deps:unknown[]){const i=this.memoCursor++,before=this.memos[i];if(!before||deps.some((value,j)=>!Object.is(value,before.deps[j])))this.memos[i]={deps,value:fn()};return this.memos[i].value;},
  ownerRequest:async(path:string,body?:Record<string,unknown>)=>{if(path==='owner/home')return fixture.home;assert.equal(path,'owner/page');return write(body!);},
 };
 async function write(body:Record<string,unknown>){fixture.writes.push(structuredClone(body));if(fixture.defer)await fixture.defer();if(fixture.fail)throw Error('This page has newer saved changes. Reload before saving.');assert.equal(body.version,fixture.saved.version,'Every command must use the last acknowledged version');fixture.saved={...fixture.saved,version:fixture.saved.version+1,...(body.content?{content:structuredClone(body.content) as typeof content}:{}),...(body.action==='assistance'?{assistanceEnabled:body.enabled as boolean}:{})};return structuredClone(fixture.saved);}
 const output=(await bundled).outputFiles.find(file=>file.path.endsWith(platform==='web'?'/OwnerPageEditor.js':'/owner-forms.js'))!;
 const module={exports:{} as Record<string,(props:Record<string,unknown>)=>Element>};
 const window={location:fixture.location,history:{state:{},replaceState(_state:unknown,_unused:string,url:URL){fixture.location.href=url.href;}},addEventListener(){},removeEventListener(){}};
 vm.runInNewContext(output.text,{module,exports:module.exports,fixture,window,URL,FormData,AbortController,setTimeout,clearTimeout,fetch:async(_url:string,init:RequestInit)=>{try{return{ok:true,json:async()=>await write(JSON.parse(String(init.body)))}}catch(error){return{ok:false,json:async()=>({error:(error as Error).message})}}}});
 const props:Record<string,unknown>=platform==='web'?{catalog:{business:{id:18,name:'Fixture shop',handle:'fixture-shop',status:'draft',description:'Saved business story',hero_image_path:'/seed/shop.webp'},products:[{name:'Real item',description:'Real product',is_published:1}]},initialDraft:structuredClone(draft),initialTask,owner:true,returnTo,locationConfirmed:true}:{home:fixture.home,reload(){},initialTask,onSaved:()=>fixture.routes.push('saved'),onCancel:()=>fixture.routes.push('cancelled')};
 const render=()=>{let root:Element;for(let pass=0;pass<5;pass++){fixture.cursor=0;fixture.refCursor=0;fixture.effectCursor=0;fixture.memoCursor=0;fixture.changed=false;root=module.exports[platform==='web'?'default':'PageEditor'](props);for(const node of nodes(root,false))if(node.type==='dialog'){const ref=node.props.ref as{current:unknown};if(!ref.current)ref.current={open:false,showModal(){(this as{open:boolean}).open=true;},close(){(this as{open:boolean}).open=false;}};}for(const effect of fixture.effects.splice(0))effect();if(!fixture.changed)return nodes(root);}throw Error('Controlled hook fixture did not settle');};
 return{fixture,props,render};
}

test('FE-056 focused task and return hints are bounded',()=>{
 for(const task of OWNER_PAGE_TASKS)assert.equal(ownerPageTask(task.key),task.key);
 for(const value of [undefined,'all','https://evil.invalid','__proto__'])assert.equal(ownerPageTask(value),'about');
 assert.equal(ownerPageReturn('profile'),'/dashboard/profile');for(const value of ['showroom','https://evil.invalid',undefined])assert.equal(ownerPageReturn(value),'/dashboard/profile/showroom');
});
test('FE-056 consented staff cannot open the owner-only Team editing controls through a task hint',async()=>{
 const f=await fixture('web','team');f.props.owner=false;const tree=f.render();assert.ok(input(tree,'shop-about'));assert.ok(!tree.some(node=>node.type==='input'&&node.props.type==='checkbox'));assert.ok(!tree.some(node=>node.type==='button'&&text(node.props.children)==='Allow team editing'));assert.equal(f.fixture.writes.length,0);
});
test('FE-056 focused web tasks have one visible title, accessible fields and publication controls only in Preview',async()=>{
 for(const task of ['about','video','cover']){
  const f=await fixture('web',task),tree=f.render();
  const legend=tree.find(node=>node.type==='legend');assert.ok(legend);assert.equal(legend.props.className,'sr-only');
  assert.equal(tree.filter(node=>node.type==='h1').length,1);
  assert.ok(!tree.some(node=>node.props['aria-label']==='Page publication'));
  const field=tree.find(node=>node.type==='label'||node.props.id==='shop-cover-label');assert.ok(field);assert.equal(field.props.className,'sr-only');
 }
 const f=await fixture('web');(f.props.catalog as{business:{status:string}}).business.status='active';f.props.initialPublication={revision:1,content};let tree=f.render();assert.ok(!tree.some(node=>node.type==='button'&&text(node.props.children)==='Restore previous'));
 press(named(tree,'Preview'));tree=f.render();assert.ok(named(tree,'Restore previous'));assert.ok(tree.some(node=>node.props['aria-label']==='Page publication'));
});
test('FE-056 focused native tasks hide duplicate visible field labels while retaining accessible names and Preview publication',async()=>{
 for(const task of ['about','video']){const f=await fixture('native',task),tree=f.render();const field=tree.find(node=>node.type==='Field');assert.ok(field);assert.equal(field.props.hideLabel,true);assert.equal(field.props.label,task==='about'?'About the business':'Business video');assert.ok(!tree.some(node=>node.type==='Button'&&node.props.label==='Publish'));press(named(tree,'Preview'));assert.ok(named(f.render(),'Publish'));}
 const color=await fixture('native','color');assert.ok(!color.render().some(node=>node.type==='Button'&&node.props.label==='Publish'),'Color changes remain a focused editing task over the full preview');
});
test('FE-056 native focused actions pair Save and Cancel and keep quiet navigation accessible',async()=>{
 const f=await fixture('native'),tree=f.render();
 const save=named(tree,'Save changes'),cancel=named(tree,'Cancel'),back=named(tree,'Back to your page'),preview=named(tree,'Preview');
 assert.equal(save.props.wrapLabel,true);assert.equal(cancel.props.wrapLabel,true);
 const row=tree.find(node=>node.type==='View'&&(node.props.style as{flexDirection?:string})?.flexDirection==='row'&&Array.isArray(node.props.children)&&node.props.children.filter(Boolean).length===2&&nodes(node).includes(save)&&nodes(node).includes(cancel));assert.ok(row);assert.equal((row.props.style as{flexWrap:string}).flexWrap,'wrap');
 for(const control of [back,preview]){assert.equal(control.type,'Pressable');assert.equal(control.props.accessibilityRole,'button');assert.ok(Number((control.props.style as{minHeight:number}).minHeight)>=48);}
 press(preview);assert.ok(named(f.render(),'Publish'),'Preview keeps its original callback and publication reachability');
});

for(const platform of ['web','native'] as const)test(`FE-056 ${platform} opens exactly the chosen task and preserves social contacts on an unrelated save`,async()=>{
 for(const task of ['about','video','contacts','team','color']){
  const f=await fixture(platform,task),tree=f.render(),fields=tree.filter(node=>node.type==='Field'||['input','textarea'].includes(String(node.type)));
  assert.ok(!tree.some(node=>['details','summary','HandleEditor'].includes(String(node.type))));
  assert.equal(fields.length,task==='contacts'?8:task==='color'||task==='team'&&platform==='native'?0:1,task);
  assert.equal(f.fixture.writes.length,0,'Opening a task cannot save anything');
  if(task==='color'){assert.ok(tree.some(node=>node.type==='StorefrontAccentPicker'));assert.ok(tree.some(node=>node.type===(platform==='web'?'ShowroomApp':'ShowroomContent')));}
 }
 const f=await fixture(platform),tree=f.render();edit(input(tree,platform==='web'?'shop-about':'About the business'),'Revised business story');
 await press(named(f.render(),platform==='web'?'Save':'Save changes'));await flush();
 assert.equal(f.fixture.writes.length,1);assert.deepEqual(JSON.parse(JSON.stringify(f.fixture.writes[0].content)),{...content,about:'Revised business story'});assert.equal(f.fixture.writes[0].version,4);
 assert.deepEqual(f.fixture.routes,[platform==='web'?'/dashboard/profile/showroom?saved=page':'saved']);
});

for(const platform of ['web','native'] as const)test(`FE-056 ${platform} failed save retains input, prevents duplicates and permits explicit retry`,async()=>{
 const f=await fixture(platform,'video');
 let tree=f.render();edit(input(tree,platform==='web'?'shop-video':'Business video'),'https://www.youtube.com/watch?v=aqz-KE-bpKQ');
 let release:()=>void=()=>{};f.fixture.defer=()=>new Promise<void>(resolve=>{release=resolve;});
 const save=named(f.render(),platform==='web'?'Save':'Save changes');const first=press(save);press(save);await flush();assert.equal(f.fixture.writes.length,1,'The retained pending handler must not send twice');
 f.fixture.fail=true;release();await first;await flush();tree=f.render();assert.equal(input(tree,platform==='web'?'shop-video':'Business video').props.value,'https://www.youtube.com/watch?v=aqz-KE-bpKQ');assert.equal(f.fixture.routes.length,0);
 f.fixture.defer=null;f.fixture.fail=false;await press(named(tree,platform==='web'?'Save':'Save changes'));await flush();assert.equal(f.fixture.writes.length,2);assert.equal(f.fixture.writes[1].version,4,'Failure never invents a new persisted version');
});

for(const platform of ['web','native'] as const)test(`FE-056 ${platform} switching to Team editing preserves earlier edits and saves permission at the returned version`,async()=>{
 const f=await fixture(platform);edit(input(f.render(),platform==='web'?'shop-about':'About the business'),'Retained across tasks');f.props.initialTask='team';let tree=f.render();
 if(platform==='web')(tree.find(node=>node.type==='input'&&node.props.type==='checkbox')!.props.onChange as(event:unknown)=>void)({target:{checked:true}});else press(tree.find(node=>node.type==='Chip')!);
 await press(named(f.render(),platform==='web'?'Save':'Save changes'));await flush();
 assert.deepEqual(f.fixture.writes.map(body=>[body.action,body.version]),[['save',4],['assistance',5]]);assert.equal((f.fixture.writes[0].content as{about:string}).about,'Retained across tasks');assert.deepEqual(JSON.parse(JSON.stringify((f.fixture.writes[0].content as{contacts:unknown}).contacts)),contacts);assert.equal(f.fixture.writes[1].enabled,true);
 assert.ok(!Object.hasOwn(f.fixture.writes[1],'content'),'Permission command remains the existing narrow contract');
});

for(const platform of ['web','native'] as const)test(`FE-056 ${platform} Cancel confirms unsaved work without sending it`,async()=>{
 const f=await fixture(platform);edit(input(f.render(),platform==='web'?'shop-about':'About the business'),'Keep this entered text');press(named(f.render(),'Cancel'));let tree=f.render();assert.ok(named(tree,'Keep editing'));assert.equal(f.fixture.routes.length,0);press(named(tree,'Keep editing'));tree=f.render();assert.equal(input(tree,platform==='web'?'shop-about':'About the business').props.value,'Keep this entered text');press(named(tree,'Cancel'));press(named(f.render(),'Discard changes'));assert.equal(f.fixture.writes.length,0);assert.deepEqual(f.fixture.routes,[platform==='web'?'/dashboard/profile/showroom':'cancelled']);
});

for(const platform of ['web','native'] as const)test(`FE-056 ${platform} publication readiness opens the real contacts task without discarding the profile`,async()=>{
 const f=await fixture(platform);f.props.initialPreview=true;press(named(f.render(),'Publish'));await flush();let tree=f.render();
 if(platform==='web'){const target=tree.find(node=>node.type==='a'&&text(node.props.children)==='Add your real contact details');assert.ok(target);assert.equal(target.props.href,'?view=edit&task=contacts');(target.props.onClick as(event:unknown)=>void)({preventDefault(){}});}
 else press(named(tree,'Add your real contact details'));
 tree=f.render();assert.equal(tree.filter(node=>node.type==='Field'||node.type==='input').length,8);assert.equal(f.fixture.writes.length,0);assert.equal(input(tree,platform==='web'?'public-whatsapp':'WhatsApp number').props.value,contacts.whatsapp);
});

for(const platform of ['web','native'] as const)test(`FE-056 ${platform} an unsaved Team editing change survives a later About save`,async()=>{
 const f=await fixture(platform,'team');let tree=f.render();if(platform==='web')(tree.find(node=>node.type==='input'&&node.props.type==='checkbox')!.props.onChange as(event:unknown)=>void)({target:{checked:true}});else press(tree.find(node=>node.type==='Chip')!);
 f.props.initialTask='about';tree=f.render();edit(input(tree,platform==='web'?'shop-about':'About the business'),'Changed after permission selection');await press(named(f.render(),platform==='web'?'Save':'Save changes'));await flush();
 assert.deepEqual(f.fixture.writes.map(body=>[body.action,body.version]),[['save',4],['assistance',5]]);assert.equal(f.fixture.saved.assistanceEnabled,true);assert.equal(f.fixture.saved.content.about,'Changed after permission selection');
});
