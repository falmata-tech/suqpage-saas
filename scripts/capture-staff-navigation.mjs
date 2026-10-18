import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import pg from 'pg';
import {chromium,expect as browserExpect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {createUiText} from '../lib/i18n/core.ts';

// Disposable, labelled navigation fixtures; every action and screen uses real HTTP/SQL.
// Creation does not emit waiting-work alerts to existing teams. No customer rows change.
process.loadEnvFile('.local/supabase-runtime.env');
const base=process.env.SUQPAGE_TEST_WEB_BASE_URL||'http://127.0.0.1:3102',out='.local/staff-navigation-review/actual';
assert.equal(new URL(process.env.SUQPAGE_POSTGRES_URL).hostname,'127.0.0.1');
assert.equal(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).origin,'http://127.0.0.1:54321');
const pool=new pg.Pool({connectionString:process.env.SUQPAGE_POSTGRES_URL});
// Availability/new-staff commands now intentionally drain waiting work. Run only
// against a separately booted fixture server/schema, never the shared preview.
assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname)&&new URL(base).port!=='3102','Use a dedicated local fixture server, not the shared preview.');
const fixtureSchema=(await pool.query('SELECT current_schema() name')).rows[0].name;
assert.ok(/^suqpage_[a-z0-9_]+$/.test(fixtureSchema),'Use a dedicated Suqpage fixture schema before creating staff or saving receiving availability.');

const auth=createClient(process.env.NEXT_PUBLIC_SUPABASE_URL,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const browser=await chromium.launch(),expect=browserExpect.configure({timeout:22000});
const suffix=crypto.randomUUID().slice(0,8),users=[],providers=[],cases=[],businesses=[],errors=[],checks=[];
fs.mkdirSync(out,{recursive:true,mode:0o700});
async function account(name,role,scope,businessId=null){
 const email=`navigation-${name.toLowerCase().replaceAll(' ','-')}-${suffix}@example.test`;
 const a=await auth.auth.admin.createUser({email,email_confirm:true});assert.equal(a.error,null);providers.push(a.data.user.id);
 const id=Number((await pool.query("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES($1,'fixture',$2,$3,$4,0) RETURNING id",[email,'LOCAL QA '+name,role==='client'?'owner':'admin',businessId])).rows[0].id);users.push(id);
 await pool.query('INSERT INTO user_access_profiles(user_id,access_role) VALUES($1,$2)',[id,role]);
 await pool.query("INSERT INTO auth_identity_links(user_id,provider,provider_user_id,email_at_link,created_at) VALUES($1,'supabase',$2,$3,$4)",[id,a.data.user.id,email,Date.now()]);
 if(scope)await pool.query('INSERT INTO support_agent_settings(user_id,enabled,queue_scope,max_open_conversations,updated_at) VALUES($1,1,$2,3,$3)',[id,scope,Date.now()]);
 return {id,email};
}
async function web(email){
 const cookies=[],client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL,key,{cookies:{getAll:()=>[],setAll:v=>cookies.push(...v)}});
 const l=await auth.auth.admin.generateLink({type:'magiclink',email});assert.equal(l.error,null);
 assert.equal((await client.auth.verifyOtp({email,token:l.data.properties.email_otp,type:'email'})).error,null);
 const ctx=await browser.newContext();await ctx.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));
 const p=await ctx.newPage();p.setDefaultNavigationTimeout(60000);p.on('pageerror',e=>errors.push({message:e.message,stack:e.stack,url:p.url()}));return {ctx,p};
}
async function shot(p,name,width){
 await p.setViewportSize({width,height:width===1440?1000:844});await p.evaluate(()=>document.fonts.ready);await p.waitForTimeout(400);
 assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');
 const clip=await p.locator('.workspace-mobile-tabs a>span').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().width>0).some(n=>n.scrollWidth>n.clientWidth+1));assert.equal(clip,false,name+' clipped mobile label');
 await p.screenshot({path:`${out}/${name}-${width}.png`,fullPage:true,style:'nextjs-portal{visibility:hidden}'});
}
function origin(p,scope,status='active'){const q=new URL(p.url()).searchParams;assert.equal(q.get('queue'),scope);assert.equal(q.get('status'),status);assert.equal(q.get('q'),suffix);assert.equal(q.get('page'),'2');}
async function active(p,href){await expect(p.locator('.sidebar .workspace-nav a[aria-current=page]')).toHaveCount(1);await expect(p.locator('.sidebar .workspace-nav a[aria-current=page]')).toHaveAttribute('href',href);}
async function state(id){return (await pool.query('SELECT status,assigned_user_id,resolved_at FROM support_conversations WHERE id=$1',[id])).rows[0];}
async function reply(p,text){await p.locator('#support-reply').fill(text);await p.locator('.support-reply button').click();await expect(p.locator('#support-reply')).toHaveValue('');await expect(p.getByText(text,{exact:true})).toBeVisible();}
try{
 const root=(await pool.query('SELECT p.access_role,u.business_id FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.email=$1',[process.env.SUQPAGE_TEST_ADMIN_EMAIL])).rows[0];assert.equal(root?.access_role,'platform_admin');assert.equal(root.business_id,null);
 const admin=await account('Admin','platform_admin'),support=await account('Support','team_member','support'),transport=await account('Transport','team_member','transport');
 const business=Number((await pool.query("INSERT INTO businesses(handle,name,design_key,status) VALUES($1,$2,'composition','active') RETURNING id",['navigation-qa-'+suffix,'LOCAL QA Store '+suffix])).rows[0].id);businesses.push(business);
 const owner=await account('Owner','client',null,business);
 for(const queue of ['support','transport'])for(let i=0;i<21;i++){
  const now=Date.now()+i,ref='SUP-QA-'+crypto.randomBytes(5).toString('hex').toUpperCase();
  const args=[ref,'LOCAL QA Customer '+suffix,queue==='support'?'Cover photo question '+(i+1):'Addis Ababa → Adama',now];
  const c=queue==='support'?await pool.query("INSERT INTO support_conversations(public_ref,participant_kind,business_id,opened_by_user_id,assistance_category,requester_label,subject,status,created_at,updated_at,last_message_at) VALUES($1,'client',$5,$6,'general',$2,$3,'waiting',$4,$4,$4) RETURNING id",[...args,business,owner.id]):await pool.query("INSERT INTO support_conversations(public_ref,participant_kind,visitor_token_hash,visitor_session_expires_at,assistance_category,requester_label,subject,status,visitor_phone,transport_origin,transport_destination,created_at,updated_at,last_message_at) VALUES($1,'visitor',$5,$6,'shipment_observation',$2,$3,'waiting','+251911002255','Addis Ababa','Adama',$4,$4,$4) RETURNING id",[...args,crypto.randomBytes(32).toString('hex'),now+86400000]);
  const id=Number(c.rows[0].id);cases.push(id);
  await pool.query('INSERT INTO support_messages(conversation_id,sender_user_id,sender_kind,sender_key,body,idempotency_key,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)',[id,queue==='support'?owner.id:null,queue==='support'?'user':'visitor',queue==='support'?'user:'+owner.id:'visitor:'+id,'LOCAL QA Please help with this request.',crypto.randomUUID(),now]);
 }
 const a=await web(admin.email),s=await web(support.email),tr=await web(transport.email);
 console.log('QA isolated admin/support/transport fixtures ready');
 const selected={};
 for(const [queue,agent]of [['support',s],['transport',tr]]){
  const list=base+`/dashboard/support?queue=${queue}&status=active&q=${suffix}&page=2`;
  await agent.p.goto(list);await expect(agent.p.locator('.support-row')).toHaveCount(10);await active(agent.p,'/dashboard/support?queue='+queue);
  const row=agent.p.locator('.support-row').first(),href=await row.getAttribute('href'),id=Number(href.split('?')[0].split('/').at(-1));selected[queue]=id;
  await row.click();origin(agent.p,queue);await active(agent.p,'/dashboard/support?queue='+queue);
  await expect(agent.p.getByRole('link',{name:'Back to inbox',exact:true})).toHaveAttribute('href',list.slice(base.length));
  await agent.p.getByRole('button',{name:'Claim conversation',exact:true}).click();await expect(agent.p.locator('#support-reply')).toBeVisible();origin(agent.p,queue);assert.equal(Number((await state(id)).assigned_user_id),queue==='support'?support.id:transport.id);
  await agent.p.goBack();await expect(agent.p).toHaveURL(list);await expect(agent.p.locator('.support-row')).toHaveCount(10);
  await agent.p.goto(base+href);await agent.p.locator('#support-reply').fill(' ');await agent.p.locator('.support-reply button').click();await expect(agent.p.locator('.error')).toBeVisible();origin(agent.p,queue);
  await reply(agent.p,'LOCAL QA reply from '+queue);origin(agent.p,queue);
  await a.p.goto(base+href);await a.p.getByRole('combobox',{name:'Assign support agent',exact:true}).selectOption(String(queue==='support'?support.id:transport.id));await a.p.locator('.support-reassign button').click();await expect(a.p.getByText('Support conversation updated.',{exact:true})).toBeVisible();origin(a.p,queue);
  if(queue==='transport'){
   await agent.p.locator('input[name=company]').fill('LOCAL QA Carrier');await agent.p.locator('input[name=contact]').fill('+251911002266');await agent.p.getByRole('button',{name:'Save company',exact:true}).click();await expect(agent.p.getByText('Company saved',{exact:true})).toBeVisible();origin(agent.p,queue);
  }
  await agent.p.getByRole('button',{name:queue==='transport'?'Mark resolved':'Close',exact:true}).click();await expect(agent.p.getByRole('button',{name:'Reopen',exact:true})).toBeVisible();origin(agent.p,queue);assert.equal((await state(id)).status,'closed');
  await agent.p.getByRole('button',{name:'Reopen',exact:true}).click();await expect(agent.p.locator('#support-reply')).toBeVisible();origin(agent.p,queue);
  await agent.p.getByRole('link',{name:'Back to inbox',exact:true}).click();await expect(agent.p).toHaveURL(list);
  checks.push(queue+': page-two search → claim/failed-reply/reply/assignment/'+(queue==='transport'?'handoff/':'')+'close/reopen → exact list; browser Back after mutation returns to the list.');
  await agent.p.goto(base+'/dashboard/support?queue='+(queue==='support'?'transport':'support'));await expect(agent.p).toHaveURL(new RegExp('queue='+queue));await expect(agent.p.locator('.sidebar .workspace-nav a[href="/dashboard/support?queue='+(queue==='support'?'transport':'support')+'"]').first()).toHaveCount(0);
  for(const width of [1440,390,320])await shot(agent.p,queue+'-agent',width);
 }
 await tr.p.goto(base+'/dashboard/support/'+selected.support);await expect(tr.p.getByText('This conversation is unavailable.',{exact:true})).toBeVisible();await expect(tr.p).toHaveURL(/queue=transport/);await expect(tr.p.getByText('LOCAL QA reply from support',{exact:true})).toHaveCount(0);
 await a.p.goto(base+'/dashboard/support/'+selected.transport+'?queue=support');await active(a.p,'/dashboard/support?queue=transport');
 await a.p.goto(base+'/dashboard/support/'+selected.transport);await expect(a.p.getByRole('link',{name:'Back to inbox',exact:true})).toHaveAttribute('href','/dashboard/support?queue=transport&status=active');checks.push('Direct/alert cases highlight their actual queue; forged foreign agent links reveal no transcript and return to their permitted inbox.');
 await a.p.goto(base+'/dashboard/admin/businesses');const global=await a.p.locator('.sidebar .workspace-nav a').evaluateAll(nodes=>nodes.filter(n=>n.href.includes('/dashboard/admin')||n.href.includes('queue=')).map(n=>n.getAttribute('href')));
 await a.p.goto(base+'/dashboard?business='+business);assert.deepEqual(await a.p.locator('.sidebar .workspace-nav a').evaluateAll(nodes=>nodes.filter(n=>n.href.includes('/dashboard/admin')||n.href.includes('queue=')).map(n=>n.getAttribute('href'))),[...global,...(await a.p.locator('.sidebar .workspace-nav a').evaluateAll(nodes=>nodes.filter(n=>n.href.includes('/dashboard/admin/businesses/')||/\/dashboard\/admin\/discovery\/\d+/.test(n.href)).map(n=>n.getAttribute('href'))))]);
 await expect(a.p.locator('.sidebar .workspace-brand')).toHaveAttribute('href','/dashboard/admin');checks.push('Opening a business retains the admin menu and stable overview destination.');
 await a.p.goto(base+'/dashboard/admin/staff?q='+suffix);await expect(a.p.locator('.data-table tbody tr')).toHaveCount(2);await a.p.getByRole('link',{name:'Manage',exact:true}).first().click();await expect(a.p.getByRole('heading',{name:'Workload & availability',exact:true})).toBeVisible();await active(a.p,'/dashboard/admin/staff');
 const settingsOrigin=new URL(a.p.url()).searchParams.get('q');await expect(a.p.locator('input[name=maxOpenConversations]')).toHaveCount(0);await a.p.getByRole('button',{name:'Save',exact:true}).click();await expect(a.p.getByText('Support agent settings saved.',{exact:true})).toBeVisible();assert.equal(new URL(a.p.url()).searchParams.get('q'),settingsOrigin);await active(a.p,'/dashboard/admin/staff');await expect(a.p.locator('.workspace-breadcrumbs a')).toHaveAttribute('href','/dashboard/admin/staff');checks.push('Staff → Manage → workload settings → Save preserves the selected agent and keeps Staff active.');
 console.log('QA real staff actions and return paths passed');
 for(const locale of ['en','am','om','so','ti']){
  const t=locale==='en'?v=>v:createUiText(JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
  await a.ctx.addCookies([{name:'suqpage-language',value:locale,url:base}]);
  for(const [name,path,heading,activeHref]of [
   ['inbox','/dashboard/support?queue=transport&status=active&q='+suffix+'&page=2','Transport','/dashboard/support?queue=transport'],
   ['conversation','/dashboard/support/'+selected.transport+'?queue=transport&status=active&q='+suffix+'&page=2',null,'/dashboard/support?queue=transport'],
   ['staff','/dashboard/admin/staff?q='+suffix,'Staff','/dashboard/admin/staff'],
   ['workload','/dashboard/support/agents?q='+encodeURIComponent(transport.email),'Workload & availability','/dashboard/admin/staff']
  ]){
   await a.p.goto(base+path);if(heading)await expect(a.p.getByRole('heading',{name:t(heading),exact:true})).toBeVisible();await active(a.p,activeHref);
   for(const width of [1440,390,320])await shot(a.p,name+'-'+locale,width);
  }
  await a.p.setViewportSize({width:320,height:844});await a.p.getByRole('button',{name:t('Open all workspace navigation'),exact:true}).click();await expect(a.p.getByRole('dialog',{name:t('Workspace menu'),exact:true})).toBeVisible();await shot(a.p,'menu-'+locale,320);await a.p.keyboard.press('Escape');await expect(a.p.getByRole('button',{name:t('Open all workspace navigation'),exact:true})).toBeFocused();
 }
 if(errors.length)fs.writeFileSync(out+'/browser-errors.json',JSON.stringify(errors,null,2),{mode:0o600});
 assert.deepEqual(errors,[]);checks.push('All five languages at desktop/390/320: singular active area, no overflow/clipped tabs, accessible mobile drawer and focus restoration.');
 fs.writeFileSync(out+'/verified.json',JSON.stringify({checks,realHttp:true,fixtureCreation:'Labelled local SQL fixtures; actions use the real web adapters',mockedSuccessResponses:0,localOnly:true,productionWrites:0,locales:['en','am','om','so','ti'],viewports:[1440,390,320]},null,2),{mode:0o600});console.log('PASS '+checks.join('\n'));
}finally{
 await browser.close();
 const recipients=[...users.map(id=>'user:'+id),...cases.map(id=>'visitor:'+id)];
 await pool.query('DELETE FROM attention_preferences WHERE recipient_key=ANY($1::text[])',[recipients]);await pool.query('DELETE FROM attention_subscriptions WHERE recipient_key=ANY($1::text[])',[recipients]);
 await pool.query("DELETE FROM attention_notifications WHERE source_key IN (SELECT 'support-reassigned:'||id FROM support_events WHERE conversation_id=ANY($1::bigint[]))",[cases]);
 for(const id of cases)await pool.query('DELETE FROM support_conversations WHERE id=$1',[id]);
 for(const id of businesses)await pool.query('DELETE FROM businesses WHERE id=$1',[id]);
 for(const id of users)await pool.query('DELETE FROM users WHERE id=$1',[id]);
 for(const id of providers)await auth.auth.admin.deleteUser(id);await pool.end();
}
