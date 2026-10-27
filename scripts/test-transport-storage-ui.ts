import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { build } from "esbuild";
import { createUiText, type UiText } from "../lib/i18n/core";
import am from "../lib/i18n/messages/am.json";
import om from "../lib/i18n/messages/om.json";
import so from "../lib/i18n/messages/so.json";
import ti from "../lib/i18n/messages/ti.json";

type Element = { type: string; props: Record<string, unknown> & { children?: unknown } };
type Effect = { deps: unknown[]; cleanup?: () => void };
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
const bundle = build({
  entryPoints: ["apps/mobile/app/buying.tsx", "apps/mobile/src/use-transport-unread.ts"], outdir: "/tmp/suqpage-transport-storage-ui", bundle: true, write: false,
  format: "cjs", platform: "node",
  plugins: [{ name: "transport-device-ports", setup(builder) {
    builder.onResolve({ filter: /^\.\/runtime$/ }, args => args.importer.endsWith("use-transport-unread.ts") ? { path: "../src/runtime", namespace: "ports" } : undefined);
    builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-native|expo-router|expo-crypto|\.\.\/src\/(runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView|TransportCoordinator))$/ }, args => ({ path: args.path, namespace: "ports" }));
    builder.onLoad({ filter: /.*/, namespace: "ports" }, args => ({ loader: "js", contents:
      args.path === "react" ? `
        export const useState=initial=>{const i=fixture.stateCursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return [fixture.states[i],value=>{fixture.updates++;fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];};
        export const useRef=initial=>{const i=fixture.stateCursor++;if(!(i in fixture.states))fixture.states[i]={current:initial};return fixture.states[i];};
        export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pendingEffects.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};
        export const useCallback=fn=>fn;export default {};
      ` : args.path === "react/jsx-runtime" ? `export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
        : args.path === "react-native" ? `export const AppState={currentState:'active'},View='View',Text='Text',Pressable='Pressable',ScrollView='ScrollView',StyleSheet={create:value=>value},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
        : args.path === "expo-router" ? `export const router={push:()=>{throw Error('Unexpected visitor navigation');},replace:()=>{throw Error('Unexpected visitor navigation');}},useFocusEffect=fn=>{fixture.focus=()=>{const stop=fn();if(stop)fixture.focusStops.push(stop);return stop;};};`
        : args.path === "expo-crypto" ? `export const randomUUID=()=> 'local-idempotency-fixture';`
        : args.path === "../src/runtime" ? `
          export const transportStorageKey=fixture.storageKey;export const useApp=()=>({t:fixture.t,locale:'en'});
          export const secure={getItem:key=>{fixture.readKeys.push(key);return fixture.memory?Promise.resolve(fixture.memory.get(key)||null):fixture.reads.shift();},removeItem:async key=>{fixture.removals.push(key);fixture.memory?.delete(key);},setItem:async(key,value)=>{if(!fixture.memory)throw Error('Unexpected storage write');fixture.writes.push(key);fixture.memory.set(key,value);}};
          export const request=async(path,options)=>{fixture.requests.push({path,options});if(path==='transport/attention')return{unread:2};if(fixture.failRestore&&!options.body)throw new ApiFailure('Expired synthetic session',401);if(options.body){if(!fixture.memory)throw Error('Unexpected mutation');if(options.body.action==='close')fixture.closed=true;return{token:options.body.action==='start'?'SYNTHETIC_DEV_GUEST':undefined,conversation:{status:fixture.closed?'closed':'open',publicRef:'LOCAL-RECOVERY',messages:[],assignedUserName:null,agentJoined:false}};}return {conversation:{status:'open',publicRef:'LOCAL-RECOVERY',messages:[],assignedUserName:null,agentJoined:false}};};
          export class ApiFailure extends Error{constructor(message,status){super(message);this.status=status;}};
        ` : args.path === "../src/ui" ? `export const Screen='Screen',Copy='Copy',Card='Card',Field='Field',Button='Button',Status='Status',Icon='Icon',useOpenLink=()=>()=>{},colors={};`
        : args.path === "../src/TransportPlanView" ? `export const TransportPlanSummary=()=>null;export default()=>null;`
        : args.path === "../src/TransportCoordinator" ? `export default 'TransportCoordinator';`
        : args.path === "../src/AttentionAlerts" ? `export const TransportAlerts='TransportAlerts';`
        : `export const ChatReadTranscript='ChatReadTranscript';export default 'ChatReadSentinel';`
    }));
  }}],
});

async function screen(reads: Promise<string | null>[], t: UiText = value => value, options: { storageKey?: string; memory?: Map<string,string>; failRestore?: boolean; entry?: "buying" | "use-transport-unread" } = {}) {
  const fixture = {
    storageKey: options.storageKey || "suqpage-transport", memory: options.memory, writes: [] as string[], closed: false, failRestore: options.failRestore || false,
    reads, readKeys: [] as string[], removals: [] as string[], requests: [] as { path: string; options: { buyingToken?: string; body?: unknown } }[],
    focusStops: [] as (()=>void)[], states: [] as unknown[], stateCursor: 0, effectCursor: 0, updates: 0,
    effects: [] as Effect[], pendingEffects: [] as (() => void)[], focus: undefined as (() => (() => void) | undefined) | undefined, t,
  };
  const module = { exports: {} as { default: () => Element; useTransportUnread: () => number } };
  vm.runInNewContext((await bundle).outputFiles.find(file=>file.path.endsWith(`/${options.entry || "buying"}.js`))!.text, { module, exports: module.exports, fixture, performance, setTimeout, clearTimeout, setInterval:()=>1, clearInterval:()=>{}, AbortController });
  function nodes(value: unknown): Element[] {
    if (!value || typeof value !== "object") return [];
    const element = value as Element;
    return [element, ...[element.props.children].flat(Infinity).flatMap(nodes)];
  }
  function render() {
    fixture.stateCursor = 0; fixture.effectCursor = 0;
    const tree = nodes(module.exports.default());
    fixture.pendingEffects.splice(0).forEach(run => run());
    return tree;
  }
  return { fixture, render, unread: () => { fixture.stateCursor=0; return module.exports.useTransportUnread(); }, unmount: () => { fixture.focusStops.forEach(stop=>stop());fixture.effects.forEach(effect => effect.cleanup?.()); } };
}
const settle = () => new Promise<void>(resolve => setImmediate(resolve));
const button = (tree: Element[], label: string) => tree.find(node => node.type === "Button" && node.props.label === label);
const status = (tree: Element[]) => tree.find(node => node.type === "Status")!;

test("FE-053 failed device recovery shows localized Retry and never offers a new chat until storage is known", async () => {
  for (const messages of [{}, am, om, so, ti]) {
    const t = createUiText(messages), first = deferred<string | null>(), retry = deferred<string | null>();
    const { fixture, render, unmount } = await screen([first.promise, retry.promise], t);
    let tree = render(); assert.equal(status(tree).props.loading, true);
    first.reject(new Error("private device-key detail")); await settle(); tree = render();
    assert.equal(status(tree).props.loading, false);
    assert.equal(status(tree).props.error, "Unable to connect. Please try again.");
    assert.ok(!JSON.stringify(tree).includes("private device-key detail"));
    assert.equal(button(tree, t("Start chat")), undefined);
    const retryButton = button(tree, t("Try again")); assert.ok(retryButton);
    (retryButton.props.onPress as () => void)(); render(); tree = render();
    assert.equal(status(tree).props.loading, true); assert.equal(button(tree, t("Start chat")), undefined);
    retry.resolve(null); await settle(); tree = render();
    assert.equal(status(tree).props.loading, false); assert.ok(button(tree, t("Start chat")));
    assert.deepEqual(fixture.readKeys, ["suqpage-transport", "suqpage-transport"]);
    assert.deepEqual(fixture.removals, []); assert.deepEqual(fixture.requests, []);
    unmount();
  }
});

test("FE-053 recovery Retry restores its saved conversation without deleting or creating a session", async () => {
  const first = deferred<string | null>(), retry = deferred<string | null>();
  const { fixture, render, unmount } = await screen([first.promise, retry.promise]);
  render(); first.reject(new Error("storage unavailable")); await settle();
  (button(render(), "Try again")!.props.onPress as () => void)(); render();
  retry.resolve("LOCAL_RECOVERY_TOKEN"); await settle();
  let tree = render(); assert.equal(status(tree).props.loading, true); assert.equal(button(tree, "Start chat"), undefined);
  const stop = fixture.focus!(); await settle(); tree = render();
  assert.equal(status(tree).props.loading, false); assert.ok(button(tree, "Send reply"));
  assert.equal(fixture.requests.length, 1); assert.equal(fixture.requests[0].path, "transport");
  assert.equal(fixture.requests[0].options.buyingToken, "LOCAL_RECOVERY_TOKEN");
  assert.equal(fixture.requests[0].options.body, undefined); assert.deepEqual(fixture.removals, []);
  stop?.(); unmount();
});

test("FE-053 a recovery read resolving or rejecting after unmount cannot change private screen state", async () => {
  for (const fail of [false, true]) {
    const read = deferred<string | null>(); const { fixture, render, unmount } = await screen([read.promise]);
    render(); unmount(); const updates = fixture.updates;
    if (fail) read.reject(new Error("late storage failure")); else read.resolve("LATE_TOKEN");
    await settle(); assert.equal(fixture.updates, updates); assert.deepEqual(fixture.requests, []); assert.deepEqual(fixture.removals, []);
  }
});


const devGuestKey = "suqpage-transport.dev." + Array.from(new URL("http://127.0.0.1:3112").origin, character=>character.charCodeAt(0).toString(16).padStart(2,"0")).join("");
test("BE-044 actual DEV Buying never restores legacy guest bytes; new chat, close and another chat use only selected key", async t => {
  const memory=new Map([["suqpage-transport","SYNTHETIC_PRODUCTION_GUEST"]]);
  const mounted=await screen([],value=>value,{storageKey:devGuestKey,memory});
  t.after(mounted.unmount);mounted.render();await settle();let tree=mounted.render();const stopEmpty=mounted.fixture.focus!();
  assert.deepEqual(mounted.fixture.readKeys,[devGuestKey]);assert.equal(mounted.fixture.requests.length,0);
  for(const label of ["From","To","Name","Phone"]){const field=tree.find(node=>node.type==="Field"&&node.props.label===label)!;assert.ok(field);(field.props.onChangeText as(value:string)=>void)("Synthetic local test");}
  tree=mounted.render();(tree.find(node=>node.type==='TransportCoordinator')!.props.onSelect as(value:string)=>void)('shared-trucks-logistics');tree=mounted.render();assert.equal(button(tree,"Start chat")?.props.disabled,false);
  (button(tree,"Start chat")!.props.onPress as()=>void)();await settle();tree=mounted.render();
  assert.deepEqual(mounted.fixture.writes,[devGuestKey]);assert.equal(memory.get(devGuestKey),"SYNTHETIC_DEV_GUEST");
  const stopPoll=mounted.fixture.focus!();await settle();tree=mounted.render();
  (button(tree,"End chat")!.props.onPress as()=>void)();await settle();tree=mounted.render();
  (button(tree,"Send another request")!.props.onPress as()=>void)();await settle();mounted.render();
  assert.deepEqual(mounted.fixture.removals,[devGuestKey]);assert.equal(memory.has(devGuestKey),false);
  assert.equal(memory.get("suqpage-transport"),"SYNTHETIC_PRODUCTION_GUEST");
  assert.ok(mounted.fixture.requests.every(call=>call.options.buyingToken!=="SYNTHETIC_PRODUCTION_GUEST"));
  stopPoll?.();stopEmpty?.();mounted.unmount();
});

test("BE-044 actual DEV Buying removes only its selected expired guest session", async t => {
  const memory=new Map([["suqpage-transport","SYNTHETIC_PRODUCTION_GUEST"],[devGuestKey,"SYNTHETIC_EXPIRED_DEV"]]);
  const mounted=await screen([],value=>value,{storageKey:devGuestKey,memory,failRestore:true});
  t.after(mounted.unmount);mounted.render();await settle();mounted.render();const stop=mounted.fixture.focus!();await settle();mounted.render();
  assert.deepEqual(mounted.fixture.readKeys,[devGuestKey]);assert.deepEqual(mounted.fixture.removals,[devGuestKey]);
  assert.equal(memory.get("suqpage-transport"),"SYNTHETIC_PRODUCTION_GUEST");
  assert.equal(mounted.fixture.requests[0]?.options.buyingToken,"SYNTHETIC_EXPIRED_DEV");
  stop?.();mounted.unmount();
});

test("BE-044 actual unread hook reads only selected DEV guest key and never sends the legacy token", async t => {
  for(const local of [false,true]){
    const memory=new Map([["suqpage-transport","SYNTHETIC_PRODUCTION_GUEST"]]);if(local)memory.set(devGuestKey,"SYNTHETIC_DEV_GUEST");
    const mounted=await screen([],value=>value,{storageKey:devGuestKey,memory,entry:"use-transport-unread"});
    t.after(mounted.unmount);assert.equal(mounted.unread(),0);const stop=mounted.fixture.focus!();await settle();
    assert.deepEqual(mounted.fixture.readKeys,[devGuestKey]);assert.deepEqual(mounted.fixture.removals,[]);
    assert.equal(mounted.unread(),local?2:0);
    assert.equal(mounted.fixture.requests.length,local?1:0);
    if(local){assert.equal(mounted.fixture.requests[0].path,"transport/attention");assert.equal(mounted.fixture.requests[0].options.buyingToken,"SYNTHETIC_DEV_GUEST");}
    assert.equal(memory.get("suqpage-transport"),"SYNTHETIC_PRODUCTION_GUEST");stop?.();mounted.unmount();
  }
});
