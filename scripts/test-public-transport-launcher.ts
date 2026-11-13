import assert from "node:assert/strict";
import {test} from "node:test";
import vm from "node:vm";
import fs from "node:fs";
import {build} from "esbuild";
import type {Offering,Shop} from "@africmade/contracts";
import {TRANSPORT_COPY} from "../lib/i18n/transport-copy";
import {publicInquiryPlacement} from "../lib/public-transport-placement";

type Node = {type: string | ((props: Record<string, unknown>) => unknown);props: Record<string, unknown> & {children?: unknown}};
const webPublic = ["/", "/discover", "/featured", "/privacy", "/terms", "/contact-success", "/@merchant", "/@missing-showroom", "/tracking", "/tracking/SHP-AAAAAAAAAAAAAAAAAAAA"];
const nativePublic = ["/featured", "/shop/merchant", "/shop/missing-showroom", "/product", "/inquiry"];
const excluded = ["/account", "/account-deletion", "/login", "/request", "/setup", "/owner/setup", "/owner/page", "/owner/support", "/owner/settings", "/owner/chat", "/dashboard", "/dashboard/profile", "/dashboard/support", "/dashboard/admin/staff", "/buying", "/blocked-businesses", "/invite/token", "/api/public-support", "/unknown-private-screen"];

test("FE-078 public dock policy exposes saved inquiry actions only", () => {
  for(const path of ["/", "/about", "/featured", "/tracking", ...excluded]) for(const platform of ["web","native"] as const) assert.equal(publicInquiryPlacement(path,platform),null,path);
  assert.equal(publicInquiryPlacement('/@merchant','web'),'shell');
  assert.equal(publicInquiryPlacement('/shop/merchant','native'),'shell');
  assert.equal(publicInquiryPlacement('/product','native'),'shell');
  for(const path of ['components/AboutAudience.tsx','apps/mobile/app/(tabs)/about.tsx'])assert.doesNotMatch(fs.readFileSync(path,'utf8'),/chat=transport|navigate\('\/buying'\)/);
});

async function shell(entry: string) {
  // Bundle the real route composition and native launcher with controlled router,
  // session, safe-area and data ports; this is not HTTP, DB or Android evidence.
  const fixture = {path: "/", signedIn: false, width: 390, height: 844, bottom: 0, params:{} as Record<string,string>, basket:null as {shop:Shop;items:Array<{product:Offering;quantity:string;options:Record<string,string>}>}|null, routes: [] as string[]};
  const result = await build({entryPoints: [entry],bundle: true,write: false,format: "cjs",platform: "node",plugins: [{name: "public-launcher-ports",setup(b) {
    b.onResolve({filter: /^@\/components\/PublicActionDock$/}, args => ({path: args.path, namespace: "ports"}));
    b.onResolve({filter: /^(react(?:\/jsx-runtime)?|react-native|react-native-safe-area-context|expo-router|expo-status-bar|react-native-svg|next\/navigation|next\/link|lucide-react)$/}, args => ({path: args.path, namespace: "ports"}));
    // Footer presentation/navigation is exercised with real RNWeb in test-about-audiences.
    b.onResolve({filter: /(?:^|\/)(?:runtime|ui|main-navigation|AttentionAlerts|blocked-businesses|use-business-inquiry|use-transport-unread|overlay-visibility|LanguageSelector|AfricMadeBrand|NavigationPendingIndicator|PublicMobileNavigation|PublicSupportChat|PublicSiteFooter|i18n\/ui|owner-edit-navigation)$/}, args => ({path: args.path.endsWith('/i18n/ui')?'uiText':args.path.split("/").at(-1)!, namespace: "ports"}));
    b.onLoad({filter: /.*/,namespace: "ports"}, args => ({loader: "jsx",contents:
      args.path === "react" ? "export const useState=value=>[value,()=>{}],useEffect=()=>{},createContext=initial=>({Provider:props=>({type:'ScrollInsetProvider',props}),initial}),useContext=context=>context.initial;export default {};"
      : args.path === "react/jsx-runtime" ? "export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';"
      : args.path === "react-native" ? "export const View='View',Text='Text',Pressable='Pressable',Modal='Modal',ScrollView='ScrollView',StyleSheet={create:value=>value},useWindowDimensions=()=>({width:fixture.width,height:fixture.height});"
      : args.path === "react-native-safe-area-context" ? "export const SafeAreaProvider=props=>props.children,useSafeAreaInsets=()=>({bottom:fixture.bottom,top:0,left:0,right:0});"
      : args.path === "expo-router" ? "export const router={push:path=>fixture.routes.push(path)},usePathname=()=>fixture.path,useGlobalSearchParams=()=>fixture.params||{},useRootNavigationState=()=>({key:'test-root'}),Stack=Object.assign(props=>({type:'Stack',props}),{Screen:'StackScreen'});"
      : args.path === "expo-status-bar" ? "export const StatusBar='StatusBar';"
      : args.path === "react-native-svg" ? "export const SvgXml='SvgXml';"
      : args.path === "next/navigation" ? "export const usePathname=()=>fixture.path;"
      : args.path === "next/link" ? "export default props=>({type:'a',props});"
      : args.path === "lucide-react" ? "export const FileText='Icon',Info='Icon',LayoutDashboard='Icon',LogIn='Icon',Map='Icon',Menu='Icon',Shield='Icon',Star='Icon',Store='Icon';"
      : args.path === "runtime" ? "export const useApp=()=>({t:value=>value,session:fixture.signedIn?{user:{id:'owner'}}:null,basket:fixture.basket}),useLoad=()=>({data:fixture.basket?.shop||null,loading:false,error:''}),request=async()=>{throw Error('Unexpected API read');},RuntimeProvider=props=>props.children,languageNames={en:'English'},locales=['en'],enabledLocales=['en'],API='http://127.0.0.1:3102';"
      : args.path === "use-business-inquiry" ? "export const useBusinessInquiry=shop=>({items:shop&&fixture.basket?.shop.id===shop.id?fixture.basket.items:[]});"
      : args.path === "ui" ? "export const Brand='Brand',Icon='NativeIcon',colors={ink:'#222',line:'#ddd',brand:'#c43a00',background:'#f6f8f7'},useOpenLink=()=>()=>{};"
      : args.path === "use-transport-unread" ? "export const useTransportUnread=()=>0;"
      : args.path === "overlay-visibility" ? "export const registerOverlay=()=>()=>{},overlayIsOpen=()=>false;"
      : args.path === "AttentionAlerts" ? "export const OwnerAttentionProvider=props=>props.children;"
      : args.path === "owner-edit-navigation" ? "export const OwnerEditNavigationProvider=props=>props.children,useOwnerNavigation=()=>leave=>leave();"
      : args.path === "blocked-businesses" ? "export const BlockedBusinessProvider=props=>props.children,useBlockedBusinesses=()=>({ready:true,list:[]});"
      : args.path === "NavigationPendingIndicator" ? "export const NavigationPendingProvider=props=>props.children,NavigationPendingMain=props=>({type:'main',props});export default 'Pending';"
      : args.path === "PublicSupportChat" ? "export default 'PublicTransportChat';"
      : args.path === "@/components/PublicActionDock" ? "export const PublicActionDockProvider=props=>[props.children,props.enabled?props.transport:null];"
      : args.path === "uiText" ? "export const useUiText=()=>value=>value;"
      : `export default '${args.path}';`,
    }));
  }}]});
  const module = {exports: {} as {default: (props: Record<string, unknown>) => unknown}};
  vm.runInNewContext(result.outputFiles[0].text, {module,exports: module.exports,fixture});
  function visit(value: unknown, nodes: Node[]): void {
    if (Array.isArray(value)) {for (const item of value) visit(item, nodes);return;}
    if (!value || typeof value !== "object") return;
    const node = value as Node;
    if (typeof node.type === "function") {visit(node.type(node.props), nodes);return;}
    nodes.push(node);visit(node.props.children, nodes);
  }
  return {fixture,render: () => {const nodes: Node[]=[];visit(module.exports.default({signedIn: fixture.signedIn,children: "Public page"}), nodes);return nodes;}};
}

test("FE-078 actual public shells never mount transport for visitors or signed-in accounts", async () => {
  for(const entry of ["components/PublicAppFrame.tsx","apps/mobile/app/_layout.tsx"]){
    const {fixture,render}=await shell(entry);
    for(const signedIn of [false,true])for(const path of [...webPublic,...nativePublic,...excluded]){
      Object.assign(fixture,{signedIn,path});const nodes=render();
      assert.equal(nodes.filter(node=>node.type==='PublicTransportChat'||node.props.testID==='public-transport-launcher').length,0,entry+' '+path);
    }
  }
});

test("FE-078 native showroom/product retains its current saved inquiry list",async()=>{
  const {fixture,render}=await shell('apps/mobile/app/_layout.tsx');
  const product:Offering={id:1,name:'Test item',description:'Catalog detail',kind:'standard_product',availability:'available',priceMinor:null,media:[],published:true,quantityMode:'optional',options:[]};
  const shop:Shop={id:7,handle:'demo-saved-business',name:'Saved business',about:'Catalog',cover:'',videoUrl:'',contacts:{},products:[product],version:1,status:'active',isDemo:true};
  fixture.basket={shop,items:[{product,quantity:'',options:{}}]};
  for(const path of ['/shop/'+shop.handle,'/product']){fixture.path=path;fixture.params={handle:shop.handle,id:'1'};assert.equal(render().filter(node=>node.props.testID==='public-inquiry-list').length,1,path);}
  for(const path of ['/','/featured','/inquiry',...excluded]){fixture.path=path;assert.equal(render().filter(node=>node.props.testID==='public-inquiry-list').length,0,path);}
});

test("FE-078 retired native transport deep link redirects before any chat or credential hook",async()=>{
  const result=await build({entryPoints:['apps/mobile/app/buying.tsx'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'redirect-only',setup(b){
    b.onResolve({filter:/^expo-router$/},()=>({path:'router',namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},()=>({contents:"export const Redirect='Redirect';"}));
  }}]});
  const module={exports:{} as {default:()=>{type:string;props:{href:string}}}};
  vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require,process});
  const tree=module.exports.default();assert.equal(tree.type,'Redirect');assert.equal(tree.props.href,'/account');
});
