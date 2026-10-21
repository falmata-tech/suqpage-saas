import assert from "node:assert/strict";
import { test } from "node:test";
import vm from "node:vm";
import { build } from "esbuild";
import { createClient } from "@supabase/supabase-js";
import { createUiText } from "../lib/i18n/core";
import am from "../lib/i18n/messages/am.json";
import om from "../lib/i18n/messages/om.json";
import so from "../lib/i18n/messages/so.json";
import ti from "../lib/i18n/messages/ti.json";

type Element = { type: string; props: Record<string, unknown> & { children?: unknown } };
type Effect = { deps: unknown[]; cleanup?: () => void };
type App = {
  session: unknown; ready: boolean; authIssue: string; logoutIssue: boolean; logoutPending: boolean;
  basket: unknown; signOut: () => Promise<void>; ownerRequest: (path: string) => Promise<unknown>;
  setBasket: (value: unknown) => void;
};
const ownerSession = { access_token: "local_bearer_fixture_only", user: { id: "local-owner" } };
const settle = () => new Promise<void>(resolve => setImmediate(resolve));
function fixture() {
  const state = {
    states: [] as unknown[], refs: [] as { current: unknown }[], effects: [] as Effect[], pendingEffects: [] as (() => void)[],
    stateCursor: 0, refCursor: 0, effectCursor: 0, providerSession: ownerSession as typeof ownerSession | null,
    callback: undefined as ((event: string, session: unknown) => void) | undefined,
    sdkError: null as Error | null, deleteFailure: false, deleteCalls: 0, sdkCalls: 0, sessionStatus: 200,
    requests: [] as string[], routes: [] as string[], app: {} as Record<string, unknown>,
    t: createUiText({}), auth: {} as Record<string, unknown>,
    authOptions: undefined as { auth?: { lock?: unknown } } | undefined,
  };
  state.auth = { auth: {
    getSession: async () => ({ data: { session: state.providerSession } }),
    onAuthStateChange: (callback: typeof state.callback) => { state.callback = callback; return { data: { subscription: { unsubscribe() {} } } }; },
    stopAutoRefresh() {}, startAutoRefresh() {},
    signOut: async (options: { scope: string }) => { assert.equal(options.scope, "local"); state.sdkCalls++; return { error: state.sdkError }; },
  } };
  return state;
}
const bundled = build({
  entryPoints: ["apps/mobile/src/runtime.tsx", "apps/mobile/app/(tabs)/account.tsx", "apps/mobile/src/owner-business.tsx"],
  bundle: true, write: false, outdir: "/tmp/suqpage-logout-ui", platform: "node", format: "cjs",
  define: { "process.env.EXPO_PUBLIC_SUPABASE_URL": '"https://auth.example.invalid"', "process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY": '"public-test-key"', "process.env.EXPO_PUBLIC_API_ORIGIN": '"https://suqpage.com"', "process.env.EXPO_PUBLIC_OWNER_EMAIL_CHANGE_ENABLED": '"0"' },
  plugins: [{ name: "logout-platform-ports", setup(builder) {
    builder.onResolve({ filter: /^(react(?:\/jsx-runtime)?|react-native|expo-router|expo-secure-store|@supabase\/supabase-js)$/ }, args => ({ path: args.path, namespace: "ports" }));
    builder.onResolve({ filter: /(?:^|\/)(runtime|ui|owner-forms|owner-profile|CountrySelector|CitySelector|AttentionAlerts|owner-edit-navigation|OwnerEditConfirmation)$/ }, args => ({ path: args.path.split("/").at(-1)!, namespace: "ports" }));
    builder.onLoad({ filter: /.*/, namespace: "ports" }, args => ({ loader: "js", contents:
      args.path === "react" ? `
        export const useState=initial=>{const i=fixture.stateCursor++;if(!(i in fixture.states))fixture.states[i]=typeof initial==='function'?initial():initial;return [fixture.states[i],value=>{fixture.states[i]=typeof value==='function'?value(fixture.states[i]):value;}];};
        export const useRef=initial=>{const i=fixture.refCursor++;return fixture.refs[i]||(fixture.refs[i]={current:initial});};
        export const useEffect=(create,deps)=>{const i=fixture.effectCursor++,old=fixture.effects[i];if(!old||deps.some((value,j)=>value!==old.deps[j]))fixture.pendingEffects.push(()=>{old?.cleanup?.();fixture.effects[i]={deps,cleanup:create()};});};
        export const useCallback=fn=>fn,createContext=()=>({Provider:'Provider'}),useContext=()=>fixture.app;export default {};
      ` : args.path === "react/jsx-runtime" ? `export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
        : args.path === "react-native" ? `export const Platform={OS:'android'},View='View',Text='Text',Pressable='Pressable',AppState={addEventListener:()=>({remove(){}})},StyleSheet={create:value=>value},useWindowDimensions=()=>({width:390,height:844,fontScale:1});`
        : args.path === "expo-router" ? `export const useFocusEffect=()=>{},useLocalSearchParams=()=>({}),router={push(){},navigate(){},replace:path=>fixture.routes.push(path)};`
        : args.path === "expo-secure-store" ? `export const getItemAsync=async()=>null,setItemAsync=async()=>{},deleteItemAsync=async()=>{fixture.deleteCalls++;if(fixture.deleteFailure)throw Error('private device failure');fixture.providerSession=null;};`
        : args.path === "@supabase/supabase-js" ? `export const createClient=(_url,_key,options)=>{fixture.authOptions=options;return fixture.auth;};`
        : args.path === "runtime" ? `export const useApp=()=>fixture.app,useLoad=()=>({data:null,error:'',loading:false,reload(){}}),request=async()=>{throw Error('Unexpected login request');},auth=fixture.auth,API='https://suqpage.com';`
        : args.path === "ui" ? `export const Screen='Screen',Copy='Copy',Card='Card',Field='Field',Button='Button',Status='Status',Chip='Chip',Photo='Photo',Icon='Icon',s={},colors={},useOpenLink=()=>()=>{};`
        : args.path === "owner-forms" ? `export const Setup='Setup',useAction=()=>({busy:false,isBusy:()=>false,run:async fn=>{try{await fn();}catch{}}}),ActionStatus='ActionStatus',pickImages=async()=>[],addAsset=async()=>{};`
        : args.path === "owner-edit-navigation" ? `export const useOwnerEditGuard=state=>({confirming:false,changed(){},checkpoint:()=>0,requestLeave:leave=>{if(!state.busy&&!state.isBusy?.())leave();},keepEditing(){},discard(){},complete:leave=>leave?.()});`
        : args.path === "owner-profile" ? `export const OwnerProfile='OwnerProfile';`
        : args.path === "AttentionAlerts" ? `export const OwnerAlerts='OwnerAlerts';`
        : `export default '${args.path}';`
    }));
  }}],
});

async function component(entry: "runtime" | "account" | "owner-business", state: ReturnType<typeof fixture>) {
  const output = (await bundled).outputFiles.find(file => file.path.endsWith(`/${entry}.js`))!;
  const module = { exports: {} as { RuntimeProvider: (props: { children: string }) => Element; default: () => Element; Settings: (props: Record<string, unknown>) => Element } };
  vm.runInNewContext(output.text, { module, exports: module.exports, fixture: state, URL, URLSearchParams, Request, Response, AbortController, Uint8Array, setTimeout, clearTimeout, fetch: async (input: string) => {
    const path = new URL(input).pathname; state.requests.push(path);
    return Response.json(state.sessionStatus === 403 && path.endsWith("/session") ? { error: "Staff accounts sign in on the website.", code: "staff_web_only" } : {}, { status: path.endsWith("/session") ? state.sessionStatus : 200 });
  } });
  function render() {
    state.stateCursor = 0; state.refCursor = 0; state.effectCursor = 0;
    const root = entry === "runtime" ? module.exports.RuntimeProvider({ children: "screen" }) : entry === "account" ? module.exports.default() : module.exports.Settings({ home: { user: { name: "Local Owner", email: "local@example.test", phone: "" } } });
    state.pendingEffects.splice(0).forEach(run => run()); return root;
  }
  return { render, value: () => render().props.value as App, unmount: () => state.effects.forEach(effect => effect.cleanup?.()) };
}
async function admitted(state: ReturnType<typeof fixture>) {
  const mounted = await component("runtime", state); mounted.render(); await settle(); mounted.render(); await settle(); mounted.render();
  assert.ok(mounted.value().session); return mounted;
}
function nodes(value: unknown): Element[] {
  if (!value || typeof value !== "object") return [];
  const element = value as Element; return [element, ...[element.props.children].flat(Infinity).flatMap(nodes)];
}

test("BE-044 actual Runtime handles SDK result and storage logout failures with immediate private clearing and a retry fence", async () => {
  for (const failure of ["sdk", "storage"]) {
    const state = fixture(), mounted = await admitted(state);
    assert.equal(state.authOptions?.auth?.lock, undefined, "Use current SDK coordination, without the deprecated orphan-promise lock");
    mounted.value().setBasket({ private: "old selection" });
    if (failure === "sdk") state.sdkError = new Error("private provider detail"); else state.deleteFailure = true;
    const first = mounted.value().signOut(), second = mounted.value().signOut(); assert.equal(first, second);
    let app = mounted.value(); assert.equal(app.session, null); assert.equal(app.basket, null); assert.equal(app.logoutPending, true);
    await assert.rejects(app.ownerRequest("owner/home"), error => (error as { status?: number }).status === 401);
    await assert.rejects(first, /^Error: Unable to connect\. Please try again\.$/);
    app = mounted.value(); assert.equal(app.logoutIssue, true); assert.equal(app.logoutPending, false); assert.equal(state.deleteCalls, 1);
    assert.equal(app.authIssue, "Unable to connect. Please try again.");
    state.callback!("TOKEN_REFRESHED", ownerSession); assert.equal(mounted.value().session, null, "An old Auth event cannot re-admit the failed logout");
    state.sdkError = null; state.deleteFailure = false; await app.signOut(); app = mounted.value();
    assert.equal(app.logoutIssue, false); assert.equal(app.logoutPending, false); assert.equal(app.authIssue, ""); assert.equal(app.session, null); assert.equal(state.deleteCalls, 2);
    mounted.unmount();
  }
});

test("BE-044 ordinary logout removes only the local session and automatic staff denial retains website guidance", async () => {
  const owner = fixture(), mounted = await admitted(owner); await mounted.value().signOut();
  assert.equal(owner.sdkCalls, 1); assert.equal(owner.deleteCalls, 1); assert.equal(mounted.value().session, null); assert.equal(mounted.value().logoutIssue, false); mounted.unmount();
  const staff = fixture(); staff.sessionStatus = 403; const denied = await component("runtime", staff);
  for (let i = 0; i < 5; i++) { denied.render(); await settle(); }
  assert.equal(denied.value().session, null); assert.equal(denied.value().authIssue, "Staff accounts sign in on the website.");
  assert.equal(denied.value().logoutIssue, false); denied.unmount();
});

test("FE-053 actual Account blocks new login during pending/failed logout and handles retry rejection in every locale", async () => {
  for (const messages of [{}, am, om, so, ti]) {
    const state = fixture(), t = createUiText(messages); let retries = 0;
    state.app = { session: null, ready: true, t, authIssue: "Unable to connect. Please try again.", logoutIssue: true, logoutPending: false, authRetryAvailable: false, signOut: async () => { retries++; throw Error("safe logout failure"); } };
    const account = await component("account", state); let tree = nodes(account.render());
    assert.equal(tree.some(node => node.type === "Field" && node.props.label === t("Email")), false);
    const retry = tree.find(node => node.type === "Button" && node.props.label === t("Retry"))!; assert.ok(retry);
    (retry.props.onPress as () => void)(); await settle(); assert.equal(retries, 1);
    state.app.logoutIssue = false; state.app.logoutPending = true; tree = nodes(account.render());
    assert.equal(tree.some(node => node.type === "Field" && node.props.label === t("Email")), false);
    assert.ok(tree.some(node => node.type === "Status" && node.props.loading === true));
    state.app.logoutPending = false; tree = nodes(account.render()); assert.ok(tree.some(node => node.type === "Field" && node.props.label === t("Email")));
    assert.ok(!tree.some(node => node.type === "Button" && node.props.label === t("Blocked businesses")), "Guest Account focuses on sign-in and legal links; listing safety remains contextual");
    account.unmount();
  }
});

test("FE-053/FE-056 Change-email and private Settings sign-out handle rejection while Account stays a compact hub", async () => {
  for (const mode of ["change", "settings"]) {
    const state = fixture(); let calls = 0;
    state.app = { session: null, ready: true, t: state.t, authIssue: "", authRetryAvailable: mode === "change", logoutIssue: false, logoutPending: false, clearAuthIssue() {}, signOut: async () => { calls++; throw Error("safe logout failure"); } };
    const mounted = await component(mode === "settings" ? "owner-business" : "account", state);
    const button = nodes(mounted.render()).find(node => node.type === "Button" && node.props.label === (mode === "change" ? "Change email" : "Sign out"))!; assert.ok(button);
    (button.props.onPress as () => void)(); await settle(); assert.equal(calls, 1);
    if (mode === "settings") assert.deepEqual(state.routes, ["/account"]);
    mounted.unmount();
  }
  const state=fixture();state.app={session:ownerSession,ready:true,t:state.t,logoutIssue:false,logoutPending:false};const account=await component('account',state);
  const tree=nodes(account.render());assert.ok(!tree.some(node=>node.type==='Button'&&['Sign out','Delete account','About Suqpage','Blocked businesses','Privacy','Terms'].includes(String(node.props.label))),'Signed-in hub must not append private settings or legal actions below its destinations');account.unmount();
});

test("BE-044 installed SDK propagates failed logout storage deletion without a secondary unhandled rejection", async () => {
  const encode = (data: unknown) => Buffer.from(JSON.stringify(data)).toString("base64url");
  const token = [encode({ alg: "HS256", typ: "JWT" }), encode({ sub: "00000000-0000-4000-8000-000000000001", exp: Math.floor(Date.now() / 1000) + 3600 }), "local_signature_fixture"].join(".");
  const key = "suqpage-local-logout-sdk", memory = new Map([[key, JSON.stringify({ access_token: token, refresh_token: "local_refresh_fixture", token_type: "bearer", expires_in: 3600, expires_at: Math.floor(Date.now() / 1000) + 3600, user: { id: "00000000-0000-4000-8000-000000000001", email: "local@example.test" } })]]);
  const storage = {
    getItem: async (name: string) => memory.get(name) || null,
    setItem: async (name: string, value: string) => { memory.set(name, value); },
    removeItem: async (name: string) => { if (name === key) throw Error("local storage removal failed"); memory.delete(name); },
  };
  const client = createClient("https://auth.example.invalid", "public-test-key", {
    auth: { storageKey: key, storage, persistSession: true, autoRefreshToken: false, detectSessionInUrl: false },
    global: { fetch: async () => new Response(null, { status: 204 }) },
  });
  await assert.rejects(client.auth.signOut({ scope: "local" }), /^Error: local storage removal failed$/);
  // Node's test runner fails on an unhandled rejection; allow all queued SDK
  // work to settle after the caller has handled the storage failure.
  await settle(); await settle();
});
