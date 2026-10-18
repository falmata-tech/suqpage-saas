import assert from "node:assert/strict";
import { test } from "node:test";
import { createRequire } from "node:module";
import { build } from "esbuild";
import { chromium, type Page } from "playwright";
import type { BuyingConversation } from "../lib/buying-conversation-contract";

type Pending = { id: number; path: string; method: string; body?: { action?: string; publicRef?: string; idempotencyKey?: string } };
type Harness = {
  mount: (screen: "parent" | "web" | "native", props?: Record<string, unknown>) => void;
  pending: Pending[];
  resolve: (id: number, conversation: BuyingConversation | null, extra?: Record<string, unknown>) => void;
  reject: (id: number) => void;
  blur: () => void;
  focus: () => void;
  storage: string[];
  getReads: number;
};
const caseView = (publicRef: string, assignedUserName: string | null = null, status: BuyingConversation["status"] = "open"): BuyingConversation => ({
  publicRef, assignedUserName, status, category: "shipment_observation", agentJoined: false, messages: [],
});
// These race fixtures intentionally represent already explicitly accepted joins;
// unaccepted assignment privacy is covered by test-client-chat-state-ui.ts.
const joinedView=(publicRef:string,name:string):BuyingConversation=>({...caseView(publicRef,name),agentJoined:true});
const require = createRequire(import.meta.url);

// Actual React components and DOM, with only HTTP/device/lifecycle ports replaced.
const bundle = build({
  stdin: { resolveDir: process.cwd(), loader: "tsx", contents: `
    import React from 'react';import {createRoot} from 'react-dom/client';import {flushSync} from 'react-dom';
    import Parent from './components/PublicSupportChat';import Web from './components/BuyingConversation';import Native from './apps/mobile/app/buying';
    const root=createRoot(document.getElementById('root'));let screen;
    window.harness.mount=(kind,props={})=>flushSync(()=>root.render(kind==='parent'?<Parent key={kind}/>:kind==='web'?<Web key={kind} onAnother={()=>{}} {...props}/>:kind==='native'?<Native key={kind}/>:null));
  ` },
  bundle: true, write: false, format: "iife", platform: "browser", loader: { ".css": "empty" },
  plugins: [{ name: "chat-test-ports", setup(builder) {
    builder.onResolve({filter:/^react(?:\/jsx(?:-dev)?-runtime)?$/},args=>({path:require.resolve(args.path)}));
    builder.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:'css-port'}));
    builder.onLoad({filter:/.*/,namespace:'css-port'},()=>({loader:'js',contents:'export default {};'}));
    builder.onResolve({ filter: /^(?:next\/navigation|next\/link|@\/lib\/i18n\/ui|react-native|expo-router|expo-crypto|\.\.\/src\/(runtime|ui|ChatReadSentinel|AttentionAlerts|TransportPlanView)|\.\/ChatReadObserver|\.\/AttentionAlerts|\.\/LoadingBar)$/ }, args => ({ path: args.path, namespace: "ports" }));
    builder.onLoad({ filter: /.*/, namespace: "ports" }, args => ({ loader: "jsx", resolveDir: process.cwd(), contents:
      args.path === "next/navigation" ? `import {useMemo} from 'react';export const usePathname=()=>location.pathname;export const useSearchParams=()=>useMemo(()=>new URLSearchParams(location.search),[location.search]);`
        : args.path === "next/link" ? `import React from 'react';export default props=><a {...props}/>;`
        : args.path === "@/lib/i18n/ui" ? `export const useUiText=()=>window.harness.t;`
        : args.path === "react-native" ? `export const AppState={currentState:'active'},View='div',StyleSheet={create:v=>v};`
        : args.path === "expo-router" ? `export const router={push:()=>{throw Error('Unexpected visitor navigation');},replace:()=>{throw Error('Unexpected visitor navigation');}};import {useEffect} from 'react';
          // Every focus hook owns its cleanup; route focus/blur fans out to all mounted subscriptions.
          const subscriptions=new Set();let focused=true;
          const stop=entry=>{entry.cleanup?.();entry.cleanup=undefined;};
          const blur=()=>{focused=false;for(const entry of subscriptions)stop(entry);};
          const focus=()=>{if(focused)return;focused=true;for(const entry of subscriptions)entry.cleanup=entry.run()||undefined;};
          export const useFocusEffect=fn=>useEffect(()=>{const entry={run:fn,cleanup:undefined};subscriptions.add(entry);window.harness.blur=blur;window.harness.focus=focus;if(focused)entry.cleanup=fn()||undefined;return()=>{subscriptions.delete(entry);stop(entry);};},[fn]);`
        : args.path === "expo-crypto" ? `export const randomUUID=()=>crypto.randomUUID();`
        : args.path === "../src/runtime" ? `
          export const useApp=()=>({t:window.harness.t,locale:'en'});
          export const secure={getItem:async()=>{window.harness.getReads++;return 'fixture-token';},setItem:async(k,v)=>{window.harness.storage.push('set');},removeItem:async()=>{window.harness.storage.push('remove');}};
          export const request=(path,options)=>window.harness.call(path,options);
          export class ApiFailure extends Error{};
        ` : args.path === "../src/ui" ? `
          import React from 'react';export const Screen=({children})=><main>{children}</main>,Card=({children})=><section>{children}</section>,Copy=({children})=><p>{children}</p>,colors={};
          export const Field=({label,onChangeText,...props})=><label>{label}<textarea aria-label={label} {...props} onChange={e=>onChangeText(e.target.value)}/></label>;
          export const Button=({label,onPress,disabled})=><button disabled={disabled} onClick={onPress}>{label}</button>;
          export const Status=({loading,error})=><div role='status'>{loading?'Loading':''}{error}</div>;
        ` : args.path === "./ChatReadObserver" ? `export const useVisibleChatRead=()=>{};`
        : args.path === "./LoadingBar" ? `import React from 'react';export default ()=> <div role="progressbar" aria-label="Loading">Loading</div>;`
        : args.path === "../src/TransportPlanView" ? `export const TransportPlanSummary=()=>null;export default()=>null;`
        : args.path === "../src/AttentionAlerts" ? `export const TransportAlerts=()=>null;`
        : /ChatReadSentinel$/.test(args.path) ? `export const ChatReadTranscript=({children})=>children;export default ()=>null;` : `export default ()=>null;`
    }));
  } }],
});
const setup = `
  let serial=0;const responses=new Map();
  window.harness={pending:[],storage:[],getReads:0,t:(key,values={})=>key.replace(/\\{(\\w+)\\}/g,(_,key)=>values[key]||''),
    call:(path,options={})=>new Promise((resolve,reject)=>{const id=++serial;window.harness.pending.push({id,path,method:options.body?'POST':'GET',body:options.body});responses.set(id,{resolve,reject});}),
    resolve:(id,conversation,extra={})=>{const item=responses.get(id);if(!item)throw Error('Missing pending response '+id);responses.delete(id);window.harness.pending=window.harness.pending.filter(item=>item.id!==id);item.resolve({conversation,...extra});},
    reject:id=>{const item=responses.get(id);responses.delete(id);window.harness.pending=window.harness.pending.filter(item=>item.id!==id);item.reject(Error('fixture unavailable'));},
    blur:()=>{},focus:()=>{},
  };
  window.fetch=async(path,options={})=>{
    if(String(path).includes('attention'))return {ok:true,json:async()=>({unread:0})};
    const payload=await window.harness.call(String(path),{body:options.body?JSON.parse(options.body):undefined});
    return {ok:true,json:async()=>payload};
  };
`;
async function pending(page: Page, method = "GET") {
  await page.waitForFunction(method => (window as unknown as { harness: Harness }).harness.pending.some(item => item.method === method), method);
  return page.evaluate(method => (window as unknown as { harness: Harness }).harness.pending.filter(item => item.method === method), method);
}
async function resolve(page: Page, id: number, conversation: BuyingConversation | null, extra?: Record<string, unknown>) {
  await page.evaluate(({ id, conversation, extra }) => (window as unknown as { harness: Harness }).harness.resolve(id, conversation, extra), { id, conversation, extra });
}
async function mount(page: Page, screen: "parent" | "web" | "native", props?: Record<string, unknown>) {
  await page.evaluate(({ screen, props }) => (window as unknown as { harness: Harness }).harness.mount(screen, props), { screen, props });
}
async function boot(page: Page) {
  await page.route('http://localhost:45678/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
  await page.goto('http://localhost:45678/');
  await page.addScriptTag({ content: setup });
  await page.addScriptTag({ content: (await bundle).outputFiles[0].text });
}

test("FE-019 recovery, assignment and lifecycle snapshots cannot replace a newer case or mutation", { timeout: 90_000 }, async () => {
  await bundle;
  const browser = await chromium.launch({ headless: true, timeout: 20_000 });
  const errors: string[] = [];
  try {
    let page = await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);
    await mount(page,"parent");const first=(await pending(page))[0];
    await page.locator('[aria-haspopup=dialog]').click();
    await page.waitForFunction(()=> (window as unknown as {harness:Harness}).harness.pending.length>=2);
    const second=(await pending(page)).find(item=>item.id!==first.id)!;
    await resolve(page,second.id,joinedView("SUP-NEW","Current agent"));
    const childGet=(await pending(page)).find(item=>item.id!==first.id)!;
    await resolve(page,childGet.id,joinedView("SUP-NEW","Current agent"));
    await page.getByText('Current agent joined your chat',{exact:true}).waitFor();
    await resolve(page,first.id,joinedView("SUP-OLD","Stale agent"));
    assert.equal(await page.locator('[data-chat-reference]').textContent(),'SUP-NEW');
    assert.equal(await page.getByText('Stale agent joined your chat',{exact:true}).count(),0);
    await page.getByRole('button',{name:'Close',exact:true}).click();
    await page.locator('[aria-haspopup=dialog]').click();
    await page.getByRole('progressbar',{name:'Loading',exact:true}).waitFor();
    assert.equal(await page.locator('[data-chat-reference]').count(),0,'Fresh recovery hides the cached receipt until the current session is verified');
    await page.evaluate(()=>document.querySelector('dialog')!.dispatchEvent(new Event('close')));
    assert.equal(await page.locator('dialog').evaluate(dialog=>(dialog as HTMLDialogElement).open),true,'A queued close from the previous opening cannot dismiss the fresh recovery');
    await page.getByRole('progressbar',{name:'Loading',exact:true}).waitFor();
    assert.equal(await page.getByText('Current agent joined your chat',{exact:true}).count(),0,'Opening must not claim cached assignment before recovery');
    const recovered=(await pending(page))[0];await resolve(page,recovered.id,caseView('SUP-NEW'));
    const fresh=(await pending(page))[0];await resolve(page,fresh.id,caseView('SUP-NEW'));
    await page.getByText('Waiting for our team',{exact:true}).waitFor();
    await page.keyboard.press('Escape');
    await page.waitForFunction(()=>!document.querySelector('dialog')?.hasAttribute('open'));
    await page.close();

    page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);
    const initial=joinedView('SUP-WEB','Old assignee');await mount(page,'web',{initial,active:true});
    await page.getByText('Checking…',{exact:true}).waitFor();
    await resolve(page,(await pending(page))[0].id,caseView('SUP-WEB'));
    await page.getByText('Waiting for our team',{exact:true}).waitFor();
    await mount(page,'web',{initial:joinedView('SUP-WEB','Stale parent seed'),active:true});
    assert.equal(await page.getByText('Stale parent seed joined your chat',{exact:true}).count(),0,'Same-case parent recovery must not roll back the canonical child snapshot');
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    const staleGet=(await pending(page))[0];await page.getByRole('button',{name:'End chat',exact:true}).click();
    const closePost=(await pending(page,'POST'))[0];assert.equal(closePost.body?.publicRef,'SUP-WEB');
    await resolve(page,closePost.id,caseView('SUP-WEB',null,'closed'));
    await page.getByText('Chat ended',{exact:true}).waitFor();
    await resolve(page,staleGet.id,joinedView('SUP-WEB','Late assignee'));
    assert.equal(await page.getByText('Chat ended',{exact:true}).count(),1,'Delayed GET must not reopen a closed chat');
    assert.equal(await page.getByText('Late assignee joined your chat',{exact:true}).count(),0);
    assert.equal(await page.getByText('Connection interrupted. Retrying…',{exact:true}).count(),0);
    await page.close();

    page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);
    await mount(page,'web',{initial:caseView('SUP-ACK'),active:true});await resolve(page,(await pending(page))[0].id,caseView('SUP-ACK'));
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));const abortedGet=(await pending(page))[0];
    await page.getByLabel('Reply',{exact:true}).fill('Successful current message');await page.getByRole('button',{name:'Send',exact:true}).click();
    await resolve(page,(await pending(page,'POST'))[0].id,joinedView('SUP-ACK','Current acknowledged agent'));
    await page.getByText('Current acknowledged agent joined your chat',{exact:true}).waitFor();
    await page.evaluate(id=>(window as unknown as {harness:Harness}).harness.reject(id),abortedGet.id);
    assert.equal(await page.getByText('Current acknowledged agent joined your chat',{exact:true}).count(),1,'An aborted older poll failure must not mark a newer acknowledged chat disconnected');
    assert.equal(await page.getByText('Connection interrupted. Retrying…',{exact:true}).count(),0);
    await page.close();

    page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);
    await mount(page,'web',{initial:caseView('SUP-SEND'),active:true});await resolve(page,(await pending(page))[0].id,caseView('SUP-SEND'));
    await page.getByLabel('Reply',{exact:true}).fill('Retained unsent draft');await page.getByRole('button',{name:'Send',exact:true}).click();
    const foreignPost=(await pending(page,'POST'))[0];await resolve(page,foreignPost.id,joinedView('SUP-FOREIGN','Foreign assignee'));
    await page.getByRole('alert').waitFor();assert.equal(await page.getByLabel('Reply',{exact:true}).inputValue(),'Retained unsent draft');
    assert.equal(await page.locator('[data-chat-reference]').textContent(),'SUP-SEND');
    await page.getByRole('button',{name:'Send',exact:true}).click();const latePost=(await pending(page,'POST'))[0];
    assert.equal(latePost.body?.idempotencyKey,foreignPost.body?.idempotencyKey,'Retry must retain the original message idempotency key');
    await mount(page,'web',{initial:caseView('SUP-SEND'),active:false});
    await resolve(page,latePost.id,joinedView('SUP-SEND','Inactive assignee'));
    assert.equal(await page.getByLabel('Reply',{exact:true}).inputValue(),'Retained unsent draft','Inactive mutation acknowledgement must not clear a newer draft');
    assert.equal(await page.getByText('Inactive assignee joined your chat',{exact:true}).count(),0);
    await page.close();

    page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await page.clock.install();await boot(page);await mount(page,'native');
    await resolve(page,(await pending(page))[0].id,joinedView('SUP-NATIVE','Initial assignee'));
    await page.getByText('Initial assignee joined your chat',{exact:true}).waitFor();
    await page.evaluate(()=>{const h=(window as unknown as {harness:Harness}).harness;h.blur();h.focus();});
    await page.getByText('Checking…',{exact:true}).waitFor();
    assert.equal(await page.getByText('Initial assignee joined your chat',{exact:true}).count(),0,'Native refocus hides stale assignment until current recovery');
    await resolve(page,(await pending(page))[0].id,caseView('SUP-NATIVE'));
    await page.getByText('Waiting for our team',{exact:true}).waitFor();
    await page.clock.fastForward(5000);const nativeStaleGet=(await pending(page))[0];
    await page.getByRole('button',{name:'End chat',exact:true}).click();const nativePost=(await pending(page,'POST'))[0];
    assert.equal(nativePost.body?.publicRef,'SUP-NATIVE');await resolve(page,nativePost.id,caseView('SUP-NATIVE',null,'closed'));
    await page.getByText('Chat ended',{exact:true}).waitFor();
    await resolve(page,nativeStaleGet.id,joinedView('SUP-NATIVE','Late native assignee'));
    assert.equal(await page.getByText('Chat ended',{exact:true}).count(),1,'Native delayed GET must not reopen a closed chat');
    assert.equal(await page.getByText('Late native assignee joined your chat',{exact:true}).count(),0);
    assert.equal(await page.getByText('SUP-NATIVE',{exact:true}).count(),1,'Public reference stays visible in the native screen');
    assert.deepEqual(await page.evaluate(()=>(window as unknown as {harness:Harness}).harness.storage),[],'Assignment refresh and End must not rewrite recovery storage');
    await page.close();

    page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);await mount(page,'native');
    const nativeGet=(await pending(page))[0];
    await page.evaluate(()=>(window as unknown as {harness:Harness}).harness.blur());
    await resolve(page,nativeGet.id,joinedView('SUP-LATE','Wrong screen assignee'));
    assert.equal(await page.getByText('Wrong screen assignee joined your chat',{exact:true}).count(),0,'A response after route blur must not apply');
    await page.close();

    page=await browser.newPage();page.on('pageerror',error=>errors.push(error.message));await boot(page);await mount(page,'native');
    await resolve(page,(await pending(page))[0].id,caseView('SUP-NATIVE-SEND'));
    await page.getByLabel('Message',{exact:true}).fill('Native retained draft');await page.getByRole('button',{name:'Send reply',exact:true}).click();
    const nativeForeign=(await pending(page,'POST'))[0];await resolve(page,nativeForeign.id,caseView('SUP-OTHER'));
    await page.getByText('Support could not be updated.',{exact:true}).waitFor();
    assert.equal(await page.getByLabel('Message',{exact:true}).inputValue(),'Native retained draft');
    await page.getByRole('button',{name:'Send reply',exact:true}).click();const nativeLatePost=(await pending(page,'POST'))[0];
    assert.equal(nativeLatePost.body?.idempotencyKey,nativeForeign.body?.idempotencyKey);
    await page.evaluate(()=>(window as unknown as {harness:Harness}).harness.blur());
    await resolve(page,nativeLatePost.id,joinedView('SUP-NATIVE-SEND','Late native mutation'));
    assert.equal(await page.getByLabel('Message',{exact:true}).inputValue(),'Native retained draft');
    assert.equal(await page.getByText('Late native mutation joined your chat',{exact:true}).count(),0);
    await page.close();
    assert.deepEqual(errors,[], 'All actual components must run without browser exceptions');
  } catch(error) { console.error(JSON.stringify({browserErrors:errors}));throw error; }
  finally {await browser.close();}
});
