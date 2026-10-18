import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { test } from "node:test";
import vm from "node:vm";
import type { ReactElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { build } from "esbuild";

test("FE-019/FE-026 workload is read-first with uncapped counts and one deliberate bounded editor", async () => {
  const fixture = {
    allowed: true,
    admin: true,
    queries: [] as Array<{ status: string }>,
    summary: { totalAgents: 3, availableAgents: 2, waitingConversations: 7, openAssignments: 243 },
    result: { page: 1, totalPages: 1, totalItems: 1, firstItem: 1, lastItem: 1, items: [
      { userId: 8, name: "QA agent", email: "qa@example.invalid", openConversations: 137, enabled: true, accessRole: "team_member", queueScope: "transport" },
    ] },
  };
  const bundle = await build({ entryPoints: ["app/dashboard/support/agents/page.tsx"], bundle: true, write: false, format: "cjs", platform: "node", external: ["react", "react/jsx-runtime"], plugins: [{
    name: "workload-controlled-ports",
    setup(b) {
      b.onResolve({filter:/\.module\.css$/},a=>({path:a.path,namespace:'css'}));b.onLoad({filter:/.*/,namespace:'css'},()=>({contents:'export default new Proxy({}, {get:(_,key)=>key});'}));
      b.onResolve({ filter: /^(?:next\/(?:link|navigation)|@\/(?:app\/support-actions|lib\/(?:auth|capabilities|support|i18n\/server)|components\/(?:DashboardShell|CollectionToolbar|PaginationNav|FocusedEditForm|TransportSupport\.module\.css)))$/ }, args => ({ path: args.path, namespace: "ports" }));
      b.onLoad({ filter: /.*/, namespace: "ports" }, args => ({ loader: "js", contents:
        args.path === "next/navigation" ? `export const redirect=url=>{throw Object.assign(new Error("redirect"),{url})};`
          : args.path === "next/link" ? `import React from "react";export default props=>React.createElement("a",props);`
          : args.path === "@/lib/auth" ? `export const requireUser=async()=>({id:1,access_role:"platform_admin"});`
          : args.path === "@/lib/capabilities" ? `export const hasCapability=(_,capability)=>fixture.allowed&&(capability!=='platform:admin'||fixture.admin);`
          : args.path === "@/lib/i18n/server" ? `export const getUiText=async()=>((text,values={})=>text.replace(/\{([^}]+)\}/g,(_,key)=>String(values[key]??"")));`
          : args.path === "@/lib/support" ? `export const getSupportAgentSummary=async()=>fixture.summary,listSupportAgentWorkloadsPage=async(_,query)=>{fixture.queries.push(query);return fixture.result};`
          : args.path === "@/app/support-actions" ? `export const updateSupportAgentSettingEditAction=()=>{};`
          : args.path.endsWith(".css") ? `export default {agentList:"fixture-agent-list"};`
          : args.path.endsWith("CollectionToolbar") ? `import React from "react";export default props=>React.createElement("form",{"data-active":String(props.activeFilters)},props.children);`
          : args.path.endsWith("PaginationNav") ? `import React from "react";export default props=>React.createElement("nav",{"data-status":props.params.status});`
          : args.path.endsWith("FocusedEditForm") ? `import React from "react";export default props=>React.createElement("form",{"data-focused-editor":true},props.children,React.createElement("button",null,"Save changes"),React.createElement("a",{href:props.cancelHref},"Cancel"));`
          : `import React from "react";export default props=>React.createElement("main",null,props.children);`,
      }));
    },
  }] });
  type Query = { status?: string; saved?: string; routed?: string; remaining?: string; q?:string; page?:string; edit?:string; back_q?:string; back_page?:string; back_status?:string;back_origin?:string;back_role?:string };
  const module = { exports: {} as { default: (props: { searchParams: Promise<Query> }) => Promise<ReactElement> } };
  vm.runInNewContext(bundle.outputFiles[0].text, { module, exports: module.exports, fixture, require: createRequire(import.meta.url),URLSearchParams });
  const render = async (query: Query = {}) => renderToStaticMarkup(await module.exports.default({ searchParams: Promise.resolve(query) }));
  let html = await render({ saved: "agent", routed: "100", remaining: "7" });
  assert.match(html, /data-label="Open conversations"><strong>137<\/strong>/);
  assert.match(html, /Paused<\/small><strong>1<\/strong>/);
  assert.match(html, /Assigned 100 waiting conversations\. Still waiting: 7\./);
  assert.match(html, /fewest open conversations/);
  assert.match(html, /Pausing new chats keeps existing conversations assigned/);
  assert.doesNotMatch(html, /maxOpenConversations|Conversation limit|At capacity|<progress|value="full"/);
  assert.match(html, /value="enabled"/);
  assert.match(html, /value="disabled"/);
  assert.doesNotMatch(html, /name="enabled"|name="queueScope"|name="userId"|data-focused-editor|<details/,'Saved list rows must not be active forms or accordions');
  const editLink=html.match(/href="([^"]*edit=8[^"]*)"/)?.[1].replaceAll('&amp;','&');assert.ok(editLink);
  const editParams=new URL(editLink,'https://suqpage.invalid').searchParams;
  assert.equal(editParams.get('q'),'qa@example.invalid');assert.equal(editParams.get('edit'),'8');
  html=await render({edit:'8',q:'qa@example.invalid',back_q:'QA',back_page:'2',back_status:'disabled'});
  assert.equal((html.match(/data-focused-editor/g)||[]).length,1);
  assert.match(html,/name="userId" value="8"/);assert.match(html,/name="enabled"/);assert.match(html,/name="queueScope"/);
  assert.match(html,/name="view_q" value="QA"/);assert.match(html,/name="view_page" value="2"/);assert.match(html,/name="view_status" value="disabled"/);
  assert.match(html,/href="\/dashboard\/support\/agents\?q=QA&amp;page=2&amp;status=disabled">Cancel/,'Cancel must restore the bounded originating list');
  assert.doesNotMatch(html,/<table|data-active=|<details/,'A selected editor must not sit inside a list of active controls');
  html=await render({edit:'8',q:'qa@example.invalid',back_origin:'staff',back_q:'QA',back_page:'2',back_role:'transport_agent'});
  assert.match(html,/href="\/dashboard\/admin\/staff\?q=QA&amp;page=2&amp;role=transport_agent">Cancel/);assert.match(html,/name="view_origin" value="staff"/);assert.match(html,/name="view_role" value="transport_agent"/);
  html=await render({edit:'8',back_origin:'https://other.invalid',back_role:'platform_admin'});assert.doesNotMatch(html,/name="view_origin"|name="view_role"|href="https:\/\/other/);
  fixture.admin=false;html=await render({edit:'8',back_origin:'staff',back_q:'QA',back_role:'transport_agent'});assert.doesNotMatch(html,/name="view_origin"|name="view_role"|href="\/dashboard\/admin\/staff/,'Operations staff do not receive admin account-navigation or return hints');fixture.admin=true;
  html=await render({edit:'8',q:'qa@example.invalid',back_q:'https://other.invalid/path',back_page:'9999999',back_status:'full'});
  assert.match(html,/href="\/dashboard\/support\/agents\?q=https%3A%2F%2Fother.invalid%2Fpath">Cancel/,'Search text can never become an external return URL');
  assert.doesNotMatch(html,/name="view_page"|name="view_status"/,'Invalid return pagination and retired status must be discarded');
  for(const edit of ['-1','0','8x','1e1','9007199254740992','9']){
    html=await render({edit});assert.doesNotMatch(html,/data-focused-editor|name="userId"|name="queueScope"/);assert.match(html,/That support agent is unavailable\./);
  }
  html = await render({ status: "available" });
  assert.equal(fixture.queries.at(-1)?.status, "enabled", "Legacy available links use the receiving filter");
  assert.match(html, /value="enabled" selected=""/);
  html = await render({ status: "full" });
  assert.equal(fixture.queries.at(-1)?.status, "", "A retired capacity filter cannot silently constrain or mislabel results");
  assert.match(html, /data-active="false"/);
  for (const routed of ["-1", "NaN", "1e2", "9007199254740992"]) {
    html = await render({ saved: "agent", routed, remaining: "7" });
    assert.doesNotMatch(html, /Still waiting:/, "Invalid command counts must not become a success claim");
  }
  html = await render({ saved: "agent", routed: "0", remaining: "0" });
  assert.match(html, /Assigned 0 waiting conversations\. Still waiting: 0\./);
  fixture.allowed = false;
  await assert.rejects(render(), (error: unknown) => Boolean(error && typeof error === "object" && "url" in error && error.url === "/dashboard/support"));
});

test("FE-026 focused workload save retains sanitized failures while legacy redirect and routing feedback stay intact", async () => {
  const fixture={failure:"",role:'platform_admin',calls:[] as unknown[],revalidated:[] as string[],scheduled:0};
  const bundle=await build({entryPoints:['app/support-actions.ts'],bundle:true,write:false,format:'cjs',platform:'node',plugins:[{name:'setting-action-ports',setup(b){
    b.onResolve({filter:/^(?:next\/(?:cache|navigation)|@\/lib\/(?:auth|capabilities|attention-after|support-video-requests|catalog-runtime|support|security|support-media))$/},args=>({path:args.path,namespace:'ports'}));
    b.onLoad({filter:/.*/,namespace:'ports'},args=>({loader:'js',contents:
      args.path==='next/navigation'?`export const RedirectType={replace:'replace'},redirect=(url,type)=>{throw Object.assign(new Error('redirect'),{url,type});};`
      :args.path==='next/cache'?`export const revalidatePath=path=>fixture.revalidated.push(path);`
      :args.path==='@/lib/auth'?`export const requireUser=async()=>({id:1,access_role:fixture.role});`
      :args.path==='@/lib/capabilities'?`export const isQueueAgent=()=>false,hasCapability=(user,capability)=>capability==='platform:admin'&&user.access_role==='platform_admin';`
      :args.path==='@/lib/attention-after'?`export const scheduleAttentionDelivery=()=>fixture.scheduled++;`
      :args.path==='@/lib/security'?`export const audit=async()=>{};`
      :args.path==='@/lib/catalog-runtime'?`export const runtimeBusinessById=async()=>null;`
      :args.path==='@/lib/support-video-requests'?`export const createVideoRequest=async()=>{},reviewVideoRequest=async()=>{};`
      :args.path==='@/lib/support-media'?`export class SupportAttachmentError extends Error{};export const stageSupportAttachment=async()=>null;`
      :`export class SupportError extends Error{};export const updateSupportAgentSetting=async(user,input)=>{fixture.calls.push({user,input});if(fixture.failure==='typed')throw new SupportError('Support agent settings are invalid.');if(fixture.failure==='private')throw Error('private database connection detail');return {routed:100,remaining:7};};export const routeWaitingSupportConversations=async()=>({routed:0,remaining:0});export const joinSupportConversation=async()=>{throw Error('Unexpected Join in workload-setting test');},claimSupportConversation=async()=>{},closeSupportConversation=async()=>{},createSupportConversation=async()=>{},postSupportMessage=async()=>{},reopenSupportConversation=async()=>{},reassignSupportConversation=async()=>{},saveTransportHandoff=async()=>{};`
    }));
  }}]});
  const module={exports:{} as {updateSupportAgentSettingEditAction:(form:FormData)=>Promise<void|{error:string}>;updateSupportAgentSettingAction:(form:FormData)=>Promise<void>}};
  vm.runInNewContext(bundle.outputFiles[0].text,{module,exports:module.exports,fixture,URLSearchParams,FormData});
  function form(){const data=new FormData();for(const [key,value] of Object.entries({userId:'8',queueScope:'transport',enabled:'on',view_q:'QA',view_page:'2',view_status:'disabled'}))data.set(key,value);return data;}
  fixture.failure='typed';let result=await module.exports.updateSupportAgentSettingEditAction(form());assert.equal(result?.error,'Support agent settings are invalid.');assert.equal(fixture.scheduled,0);assert.equal(fixture.revalidated.length,0);
  fixture.failure='private';result=await module.exports.updateSupportAgentSettingEditAction(form());assert.equal(result?.error,'Support could not be updated.');assert.ok(!JSON.stringify(result).includes('private database'));
  await assert.rejects(module.exports.updateSupportAgentSettingAction(form()),(error:unknown)=>Boolean(error&&typeof error==='object'&&'url'in error&&String(error.url).includes('error=Support%20could%20not%20be%20updated.')),'Legacy action retains its bounded failure redirect');
  fixture.failure='';await assert.rejects(module.exports.updateSupportAgentSettingEditAction(form()),(error:unknown)=>{
    if(!error||typeof error!=='object'||!('url'in error))return false;
    const url=new URL(String(error.url),'https://suqpage.invalid');assert.equal(url.pathname,'/dashboard/support/agents');assert.equal(url.searchParams.get('q'),'QA');assert.equal(url.searchParams.get('page'),'2');assert.equal(url.searchParams.get('status'),'disabled');assert.equal(url.searchParams.get('saved'),'agent');assert.equal(url.searchParams.get('routed'),'100');assert.equal(url.searchParams.get('remaining'),'7');return true;
  });
  assert.equal(fixture.scheduled,1);assert.deepEqual(fixture.revalidated,['/dashboard/support/agents','/dashboard/support']);
  const staff=form();staff.set('view_origin','staff');staff.set('view_role','transport_agent');
  await assert.rejects(module.exports.updateSupportAgentSettingEditAction(staff),(error:unknown)=>(error as {url?:string}).url==='/dashboard/admin/staff?q=QA&page=2&role=transport_agent&saved=agent&routed=100&remaining=7');
  staff.set('view_role','platform_admin');staff.set('view_page','1e9');staff.set('returnTo','https://other.invalid');
  await assert.rejects(module.exports.updateSupportAgentSettingEditAction(staff),(error:unknown)=>(error as {url?:string}).url==='/dashboard/admin/staff?q=QA&saved=agent&routed=100&remaining=7');
  fixture.role='operations_manager';
  await assert.rejects(module.exports.updateSupportAgentSettingEditAction(staff),(error:unknown)=>(error as {url?:string}).url==='/dashboard/support/agents?q=QA&status=disabled&saved=agent&routed=100&remaining=7','Only a platform administrator may return to the private Staff account list');
  fixture.role='platform_admin';staff.set('view_origin','https://other.invalid');
  await assert.rejects(module.exports.updateSupportAgentSettingEditAction(staff),(error:unknown)=>(error as {url?:string}).url==='/dashboard/support/agents?q=QA&status=disabled&saved=agent&routed=100&remaining=7');
});
