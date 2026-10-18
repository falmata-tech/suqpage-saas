import assert from "node:assert/strict";
import {test} from "node:test";
import vm from "node:vm";
import {build} from "esbuild";
import type {Offering,Shop} from "@suqpage/contracts";
import {publicTransportPlacement} from "../lib/public-transport-placement";

type Node = {type: string | ((props: Record<string, unknown>) => unknown);props: Record<string, unknown> & {children?: unknown}};
const webPublic = ["/", "/discover", "/featured", "/about", "/privacy", "/terms", "/contact-success", "/@merchant", "/@missing-showroom", "/tracking", "/tracking/SHP-AAAAAAAAAAAAAAAAAAAA"];
const nativePublic = ["/featured", "/about", "/shop/merchant", "/shop/missing-showroom", "/product", "/inquiry"];
const excluded = ["/account", "/account-deletion", "/login", "/request", "/setup", "/owner/setup", "/owner/page", "/owner/support", "/owner/settings", "/owner/chat", "/dashboard", "/dashboard/profile", "/dashboard/support", "/dashboard/admin/staff", "/buying", "/blocked-businesses", "/invite/token", "/api/public-support", "/unknown-private-screen"];

test("FE-036 public transport placement is explicit and excludes account, staff, setup and conversation routes", () => {
  for (const route of webPublic) assert.equal(publicTransportPlacement(route, "web"), "shell", route);
  for (const route of nativePublic) assert.equal(publicTransportPlacement(route, "native"), "shell", route);
  assert.equal(publicTransportPlacement("/", "native"), "market", "Market retains its existing handle-safe placement");
  assert.equal(publicTransportPlacement("/about/", "native"), "shell");
  for (const platform of ["web", "native"] as const) {
    for (const route of [...excluded, "https://example.test/about", "/owner/../about", "/@merchant/private", "/shop/merchant/private"]) {
      assert.equal(publicTransportPlacement(route, platform), null, `${platform} ${route}`);
    }
  }
  assert.equal(publicTransportPlacement("/shop/merchant", "web"), null, "Native URL adapters do not invent web routes");
  assert.equal(publicTransportPlacement("/privacy", "native"), null, "Native legal actions retain their web destination");
  for(const path of ['/tracking','/tracking/SHP-AAAAAAAAAAAAAAAAAAAA'])assert.equal(publicTransportPlacement(path,'native'),null,'The native tracking portal does not duplicate its transport return entry');
});

async function shell(entry: string) {
  // Bundle the real route composition and native launcher with controlled router,
  // session, safe-area and data ports; this is not HTTP, DB or Android evidence.
  const fixture = {path: "/", signedIn: false, width: 390, height: 844, bottom: 0, params:{} as Record<string,string>, basket:null as {shop:Shop;items:Array<{product:Offering;quantity:string;options:Record<string,string>}>}|null, routes: [] as string[]};
  const result = await build({entryPoints: [entry],bundle: true,write: false,format: "cjs",platform: "node",plugins: [{name: "public-launcher-ports",setup(b) {
    b.onResolve({filter: /^@\/components\/PublicActionDock$/}, args => ({path: args.path, namespace: "ports"}));
    b.onResolve({filter: /^(react(?:\/jsx-runtime)?|react-native|react-native-safe-area-context|expo-router|expo-status-bar|react-native-svg|next\/navigation|next\/link|lucide-react)$/}, args => ({path: args.path, namespace: "ports"}));
    b.onResolve({filter: /(?:^|\/)(?:runtime|ui|main-navigation|AttentionAlerts|blocked-businesses|use-business-inquiry|use-transport-unread|overlay-visibility|LanguageSelector|SuqpageBrand|NavigationPendingIndicator|PublicMobileNavigation|PublicSupportChat|i18n\/ui|owner-edit-navigation)$/}, args => ({path: args.path.endsWith('/i18n/ui')?'uiText':args.path.split("/").at(-1)!, namespace: "ports"}));
    b.onLoad({filter: /.*/,namespace: "ports"}, args => ({loader: "jsx",contents:
      args.path === "react" ? "export const useState=value=>[value,()=>{}],useEffect=()=>{};export default {};"
      : args.path === "react/jsx-runtime" ? "export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';"
      : args.path === "react-native" ? "export const View='View',Text='Text',Pressable='Pressable',Modal='Modal',ScrollView='ScrollView',StyleSheet={create:value=>value},useWindowDimensions=()=>({width:fixture.width,height:fixture.height});"
      : args.path === "react-native-safe-area-context" ? "export const SafeAreaProvider=props=>props.children,useSafeAreaInsets=()=>({bottom:fixture.bottom,top:0,left:0,right:0});"
      : args.path === "expo-router" ? "export const router={push:path=>fixture.routes.push(path)},usePathname=()=>fixture.path,useGlobalSearchParams=()=>fixture.params||{},Stack=Object.assign(props=>({type:'Stack',props}),{Screen:'StackScreen'});"
      : args.path === "expo-status-bar" ? "export const StatusBar='StatusBar';"
      : args.path === "react-native-svg" ? "export const SvgXml='SvgXml';"
      : args.path === "next/navigation" ? "export const usePathname=()=>fixture.path;"
      : args.path === "next/link" ? "export default props=>({type:'a',props});"
      : args.path === "lucide-react" ? "export const FileText='Icon',Info='Icon',LayoutDashboard='Icon',LogIn='Icon',Map='Icon',Menu='Icon',Shield='Icon',Star='Icon';"
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

test("FE-036 actual public shell mounts one transport entry on public routes for guests and owners, never private routes", async () => {
  const {fixture,render} = await shell("components/PublicAppFrame.tsx");
  for (const signedIn of [false, true]) {
    fixture.signedIn=signedIn;
    for (const path of webPublic) {fixture.path=path;assert.equal(render().filter(node=>node.type==="PublicTransportChat").length,1,path);}
    for (const path of excluded) {fixture.path=path;assert.equal(render().filter(node=>node.type==="PublicTransportChat").length,0,path);}
  }
});

test("FE-053 actual native root uses one48px transport entry above navigation and leaves Market/private/chat routes alone", async () => {
  const {fixture,render} = await shell("apps/mobile/app/_layout.tsx");
  const style=(node:Node)=>Object.assign({},...[node.props.style].flat().filter(value=>value&&typeof value==='object')) as Record<string,unknown>;
  for (const signedIn of [false,true]) for (const height of [568,844]) for (const bottom of [0,34]) {
    Object.assign(fixture,{signedIn,height,bottom});
    for (const path of nativePublic) {
      fixture.path=path;const nodes=render(),entries=nodes.filter(node=>node.type==='Pressable'&&node.props.testID==='public-transport-launcher');
      assert.equal(entries.length,1,path);assert.equal(entries[0].props.accessibilityLabel,'Want help with transport/shipping? · Chat live with our agents');
      assert.equal(style(entries[0]).minWidth,48);assert.equal(style(entries[0]).minHeight,48,'The Pressable itself is48px, not just its wrapper');
      const overlay=nodes.find(node=>node.props.testID==='public-transport-overlay')!;
      assert.equal(style(overlay).bottom,60+bottom+12);assert.equal(style(overlay).right,12);
      assert.equal(style(overlay).pointerEvents,'box-none');assert.ok(!Object.hasOwn(overlay.props,'pointerEvents'),'Supported style hit testing leaves the map and content reachable without RNWeb warnings');
      const stack=nodes.find(node=>node.type==='Stack')!;
      assert.ok((stack.props.screenOptions as {contentStyle:{paddingBottom:number}}).contentStyle.paddingBottom>=72,'Public primary actions have reserved space above the overlay');
      (entries[0].props.onPress as ()=>void)();assert.equal(fixture.routes.at(-1),'/buying');
    }
    for (const path of ['/',...excluded]) {fixture.path=path;const nodes=render();assert.equal(nodes.filter(node=>node.props.testID==='public-transport-overlay').length,0,path);assert.equal((nodes.find(node=>node.type==='Stack')!.props.screenOptions as {contentStyle:{paddingBottom:number}}).contentStyle.paddingBottom,0);}
  }
});


test("FE-053 S118 actual native root shows saved-list access only on its matching showroom/product, retaining transport and private exclusions",async()=>{
  const{fixture,render}=await shell('apps/mobile/app/_layout.tsx');
  const product:Offering={id:1,name:'Test item',description:'Catalog detail',kind:'standard_product',availability:'available',priceMinor:null,media:[],published:true,quantityMode:'optional',options:[]};
  const shop:Shop={id:7,handle:'demo-saved-business',name:'Saved business',about:'Catalog',cover:'',videoUrl:'',contacts:{},products:[product],version:1,status:'active',isDemo:true};
  fixture.basket={shop,items:[{product,quantity:'',options:{}}]};
  fixture.path='/inquiry';fixture.params={};let tree=render();assert.equal(tree.filter(node=>node.props.testID==='public-inquiry-list').length,0);assert.equal(tree.filter(node=>node.props.testID==='public-transport-launcher').length,1);
  fixture.params={id:'99',handle:'another-business'};tree=render();assert.equal(tree.filter(node=>node.props.testID==='public-inquiry-list').length,0,'The composer never advertises another business list');
  for(const path of nativePublic.filter(path=>path!=='/inquiry')){fixture.path=path;assert.equal(render().filter(node=>node.props.testID==='public-inquiry-list').length,0,path);}
  fixture.path='/shop/'+shop.handle;fixture.params={};assert.equal(render().filter(node=>node.props.testID==='public-inquiry-list').length,1);
  fixture.path='/product';fixture.params={handle:shop.handle,id:'1'};assert.equal(render().filter(node=>node.props.testID==='public-inquiry-list').length,1);
  for(const path of ['/',...excluded]){fixture.path=path;assert.equal(render().filter(node=>node.props.testID==='public-inquiry-list').length,0,path);}
});
