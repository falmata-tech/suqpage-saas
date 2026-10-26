import type {Page} from '@playwright/test';
import {test, expect} from './fixtures';
import { execFileSync } from "node:child_process";
import {createRequire} from 'node:module';
import fs from 'node:fs';
import os from 'node:os';
import path from "node:path";
import pg from 'pg';

const {browserSupabasePorts,inspectBrowserServices,browserServicesReady}=createRequire(path.resolve('package.json'))('./scripts/acceptance-supabase-readiness.mjs') as {
  browserSupabasePorts():{api:number;db:number};
  inspectBrowserServices(projectId:string):unknown;
  browserServicesReady(projectId:string,services:unknown):boolean;
};

// This case writes only through the real admin form. Refuse it before sign-in
// unless the target is the runner's current disposable project, not a dev DB.
function disposableFeaturedTarget(baseURL:string|undefined){
  const environment=process.env,credentials=environment.SUQPAGE_TEST_CREDENTIALS||'',runnerRoot=path.dirname(credentials),ports=browserSupabasePorts();
  if(environment.SUQPAGE_RUNTIME_PROFILE!=='browser-test'||environment.SUQPAGE_LOCAL_SUPABASE_PROFILE!=='browser-test'||environment.SUQPAGE_DATABASE_DRIVER!=='postgres'||!baseURL||baseURL!==environment.SUQPAGE_TEST_BASE_URL||credentials!==environment.SUQPAGE_CREDENTIAL_PATH||path.basename(credentials)!=='credentials.txt'||path.dirname(runnerRoot)!==os.tmpdir()||!/^suqpage-acceptance-[A-Za-z0-9]+$/.test(path.basename(runnerRoot)))throw new Error('Featured mutation acceptance requires its disposable runner target.');
  const connectionString=environment.SUQPAGE_POSTGRES_URL||'';let origin:URL,provider:URL,database:URL;
  try{origin=new URL(baseURL);provider=new URL(environment.SUQPAGE_SUPABASE_URL||'');database=new URL(connectionString);}catch{throw new Error('Featured acceptance requires valid disposable app/API/database bindings.');}
  if(origin.protocol!=='http:'||origin.hostname!=='127.0.0.1'||!origin.port||provider.protocol!=='http:'||!['127.0.0.1','localhost'].includes(provider.hostname)||Number(provider.port)!==ports.api||environment.NEXT_PUBLIC_SUPABASE_URL!==environment.SUQPAGE_SUPABASE_URL||!['127.0.0.1','localhost'].includes(database.hostname)||Number(database.port)!==ports.db||connectionString!==environment.SUQPAGE_POSTGRES_DIRECT_URL||connectionString!==environment.SUQPAGE_LOCAL_POSTGRES_URL)throw new Error('Featured acceptance database/API bindings differ from its disposable runner.');
  const config=fs.readFileSync(path.join(runnerRoot,'supabase-browser-project/supabase/config.toml'),'utf8'),projectId=/^project_id = "([^"]+)"$/m.exec(config)?.[1]||'';
  if(!/^suqpage-browser-[0-9]+$/.test(projectId)||Number(/^\[api\]\r?\n[\s\S]*?^port = (\d+)$/m.exec(config)?.[1])!==ports.api||Number(/^\[db\]\r?\n[\s\S]*?^port = (\d+)$/m.exec(config)?.[1])!==ports.db||!browserServicesReady(projectId,inspectBrowserServices(projectId)))throw new Error('Featured acceptance disposable project identity/readiness is not verified.');
  return {origin:origin.origin,connectionString};
}
async function readFeaturedOverride(target:ReturnType<typeof disposableFeaturedTarget>,dateIso:string){
  if(!/^\d{4}-\d{2}-\d{2}$/.test(dateIso))throw new Error('A canonical Featured date is required.');
  const client=new pg.Client({connectionString:target.connectionString,connectionTimeoutMillis:5000,statement_timeout:5000,options:'-c default_transaction_read_only=on'});
  try{
    await client.connect();
    const day=await client.query<{mode:string}>('SELECT mode FROM featured_program_days WHERE date_iso=$1',[dateIso]);
    const lineup=await client.query<{business_id:number;position:number}>('SELECT business_id,position FROM featured_program_lineup WHERE date_iso=$1 ORDER BY position,business_id',[dateIso]);
    return {day:day.rows,lineup:lineup.rows.map(row=>({businessId:Number(row.business_id),position:Number(row.position)}))};
  }finally{await client.end();}
}

const mailpitURL = process.env.SUQPAGE_TEST_MAILPIT_URL!;
let loginAttempt = 0;
const installControlledVideoFixture = (handle = "selam-weave") =>
  JSON.parse(
    execFileSync(
      process.execPath,
      [path.join(process.cwd(), "scripts/acceptance-video-fixture.mjs"), handle],
      { encoding: "utf8" },
    ),
  ) as { handle: string; updated: boolean };
async function latestEmailCode(email: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const response = await fetch(`${mailpitURL}/api/v1/messages`);
    if (response.ok) {
      const inbox = await response.json() as { messages?: Array<{ To?: Array<{ Address?: string }>; Snippet?: string }> };
      const message = inbox.messages?.find((item) => item.To?.some((recipient) => recipient.Address === email));
      const code = /\b(\d{6})\b/.exec(message?.Snippet || "")?.[1];
      if (code) return code;
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`No local email code arrived for ${email}.`);
}
async function loginWithEmailCode(page: Page, email: string, destination: RegExp = /\/dashboard(?:[/?#]|$)/) {
  loginAttempt += 1;
  await page.context().setExtraHTTPHeaders({ "x-forwarded-for": `198.51.100.${10 + loginAttempt}` });
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByRole("button", { name: "Continue with email" }).click();
  await expect(page.getByLabel("Six-digit code")).toBeVisible();
  await page.getByLabel("Six-digit code").fill(await latestEmailCode(email));
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await expect(page).toHaveURL(destination);
}
async function signOut(page: Page) {
  const accountSignOut=page.getByRole('main').getByRole('button',{name:'Sign out',exact:true});
  if (!await accountSignOut.isVisible()) await page.goto('/dashboard/account');
  await accountSignOut.click(); await expect(page).toHaveURL(/\/login$/);
}

// FE-040–043/BE-032–034: current standard-page acceptance replaces retired studios.
test('passwordless signup, private account contacts and sign-out',async({page})=>{
  const email=`acceptance-${Date.now()}@example.test`;
  await loginWithEmailCode(page,email,/\/request$/);
  // DEP-033: a credential-free build must not freeze the anonymous redirect.
  await page.goto('/login'); await expect(page).toHaveURL(/\/request$/);
  await expect(page.getByLabel('Your name',{exact:true})).toBeVisible();
  await page.reload(); await expect(page).toHaveURL(/\/request$/);
  await page.getByLabel('Your name',{exact:true}).fill('Acceptance owner');
  await page.getByLabel('Name buyers will see',{exact:true}).fill('Acceptance signup shop');
  await page.getByLabel('Page handle',{exact:true}).fill('acceptance-chosen-shop');
  await expect(page.locator('#signup-handle-status')).toHaveText('Available');
  await page.getByLabel('Category',{exact:true}).selectOption('home-living');
  await page.getByLabel('Account phone (private)',{exact:true}).fill('+447700900999');
  await expect(page.getByRole('button',{name:'Finish setup',exact:true})).toBeDisabled();
  await page.getByRole('combobox',{name:'Country',exact:true}).selectOption('ET');
  await page.getByRole('combobox',{name:'Business city',exact:true}).fill('Addis Ababa');
  await page.getByRole('option').filter({hasText:'Addis Ababa'}).first().click();
  await expect(page.locator('input[name=placeId]')).not.toHaveValue('');
  await expect(page.locator('input[type=file]')).toHaveCount(0);
  await expect(page.getByText('Page color',{exact:true})).toHaveCount(0);
  await page.getByRole('checkbox').check();await page.getByRole('button',{name:'Finish setup',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard\/page-editor\?view=preview$/);await expect(page.getByLabel('Page preview',{exact:true})).toBeVisible();
  await page.getByRole('button',{name:'Page color',exact:true}).click();
  await page.getByLabel('Custom color',{exact:true}).fill('#ff00b8');
  await expect(page.locator('[data-business-profile]')).toHaveAttribute('data-store-accent','#FF00B8');
  await expect(page.locator('[data-business-profile] [class*=coverTint]')).toHaveCSS('opacity','0.08');
  await page.route('https://www.youtube-nocookie.com/embed/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Video fixture</title>'}));
  await page.getByRole('button',{name:/Play business video about/}).click();
  await expect(page.locator('[data-business-profile] iframe')).toBeVisible();
  await expect(page.locator('[data-business-profile] [class*=coverTint]')).toHaveCount(0);
  await page.getByRole('button',{name:'Choose color #B6FF00',exact:true}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard\/profile\/showroom\?saved=page$/);
  await expect(page.getByText('Changes saved.',{exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('link',{name:'Page color',exact:true}).click();
  await expect(page).toHaveURL(/task=color&returnTo=showroom$/);
  await expect(page.getByRole('button',{name:'Choose color #B6FF00',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Default',exact:true}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard\/profile\/showroom\?saved=page$/);
  await expect(page.getByText('Changes saved.',{exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('link',{name:'Page color',exact:true}).click();
  await expect(page.locator('[data-business-profile]')).not.toHaveAttribute('data-store-accent');
  await page.goto('/dashboard/business');await expect(page.locator('#owner-business-name')).toHaveCount(0);await expect(page.getByText('Acceptance signup shop',{exact:true}).last()).toBeVisible();
  await page.getByRole('link',{name:'Edit',exact:true}).click();await expect(page.getByLabel('Business name',{exact:true})).toHaveValue('Acceptance signup shop');
  await page.getByRole('button',{name:'Cancel',exact:true}).click();await expect(page).toHaveURL(/\/dashboard\/business$/);await expect(page.locator('#owner-business-name')).toHaveCount(0);
  await page.goto('/dashboard/account');await expect(page.locator('#profile-phone')).toHaveCount(0);await expect(page.getByText('+447700900999',{exact:true})).toBeVisible();
  await page.getByRole('link',{name:'Edit account details',exact:true}).click();await expect(page.getByLabel('Account phone',{exact:true})).toHaveValue('+447700900999');
  await page.getByLabel('Account phone',{exact:true}).fill('+447700900998');await page.getByRole('button',{name:'Save changes',exact:true}).click();
  await expect(page).toHaveURL(/\/dashboard\/account\?contact=saved$/);await expect(page.getByText('Changes saved.',{exact:true})).toBeVisible();await expect(page.locator('#profile-phone')).toHaveCount(0);
  await page.reload();await expect(page.getByText('+447700900998',{exact:true})).toBeVisible();await page.getByRole('link',{name:'Edit account details',exact:true}).click();await expect(page.getByLabel('Account phone',{exact:true})).toHaveValue('+447700900998');
  await page.goto('/request');await expect(page).toHaveURL(/\/dashboard\/profile$/);
  await signOut(page);await page.goto('/dashboard');await expect(page).toHaveURL(/\/login/);
});

test('self-service owner, staff product controls and inquiry lifecycle',async({},testInfo)=>{
  test.setTimeout(360_000);
  execFileSync(process.execPath,['--import','tsx',path.join(process.cwd(),'scripts/capture-launch-wiring.mjs')],{
    env:{...process.env,SUQPAGE_TEST_SCREENSHOT_DIR:testInfo.outputPath('workflows')},stdio:'pipe',timeout:330_000,maxBuffer:4*1024*1024,
  });
});

test('category product batches retain the independent map on desktop and phones',async({},testInfo)=>{
  test.setTimeout(180_000);
  execFileSync(process.execPath,[path.join(process.cwd(),'scripts/capture-category-pagination.mjs')],{
    env:{...process.env,SUQPAGE_TEST_SCREENSHOT_DIR:testInfo.outputPath('category')},stdio:'pipe',timeout:150_000,maxBuffer:2*1024*1024,
  });
});

test('linked products offer a prepared message and first-party inbox contact',async({page})=>{
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:900});await page.goto('/@selam-weave');
    await page.locator('a[href*="?product="]').first().click();await expect(page).toHaveURL(/product=\d+/);
    const url=page.url();await page.reload();await expect(page).toHaveURL(url);
    await page.getByRole('button',{name:'Inquire about this product only',exact:true}).click();
    const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    await expect(dialog.getByRole('heading',{name:'Inquire about this product',exact:true})).toBeVisible();
    await expect(dialog.getByRole('button',{name:'Copy message',exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:'Send to AfricMade Inbox',exact:true}).click();
    await expect(dialog.getByRole('textbox',{name:'Your message',exact:true})).toHaveValue(/I'm interested in:/);
    await expect(dialog.getByRole('textbox',{name:'Your name',exact:true})).toBeVisible();
    await expect(dialog.getByRole('textbox',{name:'Phone number',exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:'Copy message',exact:true}).click();
    await expect(dialog.getByRole('textbox',{name:'Your message',exact:true})).toHaveValue(/I'm interested in:/);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  }
});

test('administrator and staff remain within workspace permissions',async({page,baseURL})=>{
  // Adds two real admin saves, reloads and readback to the existing two sign-ins.
  test.setTimeout(180_000);
  const target=disposableFeaturedTarget(baseURL);
  await loginWithEmailCode(page,'admin@mirtpage.local');
  for(const route of ['/dashboard/admin/businesses','/dashboard/admin/staff','/dashboard/admin/page-reviews','/dashboard/admin/businesses?location=pending','/dashboard/support/agents','/dashboard/admin/sponsors','/dashboard/admin/featured-schedule']){
    const response=await page.goto(route);expect(response?.status()).toBe(200);await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('a[href*="/dashboard/requests"],a[href*="/dashboard/design-bank"]')).toHaveCount(0);
  }
  if(new URL(page.url()).origin!==target.origin)throw new Error('Featured form is not on the verified disposable app.');
  const dateInput=page.getByLabel('Program date',{exact:true}),currentDate=await dateInput.inputValue(),monday=new Date(`${currentDate}T12:00:00Z`);
  monday.setUTCDate(monday.getUTCDate()-(monday.getUTCDay()+6)%7);const dateIso=monday.toISOString().slice(0,10);
  await dateInput.fill(dateIso);await page.getByRole('button',{name:'Open date',exact:true}).click();
  await expect(page.locator('.featured-lineup-panel h2')).toContainText('Electronics');
  await expect(readFeaturedOverride(target,dateIso)).resolves.toEqual({day:[],lineup:[]});
  await page.locator('.featured-lineup-panel').getByRole('link',{name:'Edit',exact:true}).click();
  await page.getByRole('radio',{name:/^Manual\b/}).check();
  const eligible=page.getByRole('group',{name:'Eligible featured pages',exact:true}),checkboxes=eligible.locator('input[name="businessId"]');
  expect(await checkboxes.count()).toBeGreaterThanOrEqual(5);
  const candidates=await eligible.locator('.featured-business-row').evaluateAll(rows=>rows.slice(0,5).map(row=>({id:Number((row.querySelector('input[name="businessId"]') as HTMLInputElement).value),name:row.querySelector('strong')!.textContent!})));
  const checked=eligible.locator('input[name="businessId"]:checked');while(await checked.count())await checked.first().uncheck();
  for(const business of candidates.slice(0,4))await eligible.locator(`input[name="businessId"][value="${business.id}"]`).check();
  await expect(checked).toHaveCount(4);await expect(page.locator('.featured-lineup-capacity strong')).toHaveText('4 of 4 selected');
  const fourth=eligible.locator(`input[name="businessId"][value="${candidates[3].id}"]`),fifth=eligible.locator(`input[name="businessId"][value="${candidates[4].id}"]`);
  await expect(fifth).toBeDisabled();await fourth.uncheck();await expect(fifth).toBeEnabled();await fourth.check();await expect(fifth).toBeDisabled();
  for(const [index,business]of candidates.slice(0,4).entries())await eligible.locator(`input[name="position-${business.id}"]`).fill(String(4-index));
  await page.getByRole('button',{name:'Save lineup',exact:true}).click();await expect(page).toHaveURL(new RegExp(`date=${dateIso}&saved=lineup$`));await expect(page.getByText('The lineup was saved and the public timetable recalculated.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.locator('.featured-schedule-summary')).toContainText('Manual lineup');
  const manualOrder=candidates.slice(0,4).reverse();await expect(page.locator('.featured-lineup-panel .compact-business-row strong')).toHaveText(manualOrder.map(business=>business.name));
  await expect(readFeaturedOverride(target,dateIso)).resolves.toEqual({day:[{mode:'manual'}],lineup:manualOrder.map((business,index)=>({businessId:business.id,position:index+1}))});
  await page.locator('.featured-lineup-panel').getByRole('link',{name:'Edit',exact:true}).click();await page.getByRole('radio',{name:/^Automatic\b/}).check();await page.getByRole('button',{name:'Save lineup',exact:true}).click();await expect(page).toHaveURL(new RegExp(`date=${dateIso}&saved=lineup$`));
  await page.reload();await expect(page.locator('.featured-schedule-summary')).toContainText('Automatic');await expect(readFeaturedOverride(target,dateIso)).resolves.toEqual({day:[],lineup:[]});
  await expect(page.locator('.featured-lineup-panel .compact-business-row')).toHaveCount(4);
  await signOut(page);await loginWithEmailCode(page,'team-1@demo.mirtpage.local');
  await page.goto('/dashboard/admin');await expect(page).not.toHaveURL(/\/dashboard\/admin/);
  await page.goto('/dashboard/inquiries');await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto('/dashboard/business');await expect(page).toHaveURL(/\/dashboard$/);
});

test('API authorization, validation, health, and security headers',async({request})=>{
  const health=await request.get('/api/health');expect(health.status()).toBe(200);expect(await health.json()).toMatchObject({status:'ok'});
  for(const prefix of ['/api/malikt/companies','/api/malikt/requests','/api/requests','/api/client/requests','/api/operations/requests','/dashboard/requests','/dashboard/design-bank','/dashboard/design-sdk']){
    expect((await request.get(prefix)).status()).toBe(404);expect((await request.post(prefix,{data:{}})).status()).toBe(404);
  }
  expect((await request.get('/api/page-drafts/1')).status()).toBe(405);
  expect((await request.post('/api/page-drafts/1',{data:{action:'start'}})).status()).toBe(401);
  const invalid=await request.post('/api/inquiries',{data:{businessId:1,customerName:'X',contact:'12345',items:[]}});
  expect(invalid.status()).toBe(400);expect(await invalid.json()).toMatchObject({code:'invalid'});
  const home=await request.get('/');expect(home.headers()['x-frame-options']).toBe('DENY');
  expect(home.headers()['content-security-policy']).toContain("frame-ancestors 'none'");
  expect(home.headers()['content-security-policy']).toContain("frame-src 'self' https://www.youtube-nocookie.com");
  expect(home.headers()['content-security-policy']).not.toContain('youtube.com ');
});

test('business video loads a privacy-enhanced frame only after activation',async({page})=>{
  expect(installControlledVideoFixture()).toEqual({handle:'selam-weave',updated:true});
  let requested=0;
  await page.route('https://www.youtube-nocookie.com/embed/**',async route=>{requested++;await route.fulfill({contentType:'text/html',body:'<!doctype html><title>Video fixture</title><p>Controlled video fixture</p>'});});
  await page.goto('/@selam-weave');await expect(page.locator('iframe')).toHaveCount(0);expect(requested).toBe(0);
  await page.getByRole('button',{name:/Play business video about/}).click();
  const embed=new URL(await page.locator('iframe').getAttribute('src')||'');
  expect(embed.origin).toBe('https://www.youtube-nocookie.com');expect(embed.pathname).toBe('/embed/wJV9EDe_sFc');expect(embed.searchParams.get('autoplay')).toBe('1');
  await expect(page.frameLocator('iframe').getByText('Controlled video fixture',{exact:true})).toBeVisible();expect(requested).toBe(1);
});

// BE-036: a retained cart must survive the namespace upgrade in the real renderer.
test('legacy saved inquiry migrates and bookmarked assets remain available', async ({ page, request }) => {
  await page.goto('/@selam-weave');
  await page.locator('a[href*="?product="]').first().click();
  await page.getByRole('button', { name: 'Add to inquiry list', exact: true }).click();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('suqpage-cart:selam-weave'))).not.toBeNull();
  const saved = await page.evaluate(() => {
    const key = 'suqpage-cart:selam-weave';
    const value = localStorage.getItem(key)!;
    localStorage.setItem('mirtpage-cart:selam-weave', value);
    localStorage.removeItem(key);
    return value;
  });
  await page.reload();
  await expect.poll(() => page.evaluate(() => localStorage.getItem('suqpage-cart:selam-weave'))).toBe(saved);
  expect(await page.evaluate(() => localStorage.getItem('mirtpage-cart:selam-weave'))).toBeNull();
  for (const url of ['/brand/africmade-mark.svg', '/uploads/seed/mirtpage/icon.png']) {
    expect((await request.get(url)).status()).toBe(200);
  }
});

// BE-040/FE-042: real browser regression for late results and query-only links.
test('human searches preserve latest typing, filters and product navigation',async({},testInfo)=>{
  test.setTimeout(180_000);
  execFileSync(process.execPath,[path.join(process.cwd(),'scripts/capture-human-search.mjs')],{
    env:{...process.env,SUQPAGE_SEARCH_CAPTURE_DIR:testInfo.outputPath('human-search')},stdio:'pipe',timeout:150_000,maxBuffer:2*1024*1024,
  });
});

// FE-019/BE-018: real production-mode staff actions, not canned API successes.
for (const [name, script] of [
  ['transport replies, private notes and ended/resolved history', 'capture-live-buying-staff.ts'],
  ['video request approval and public gallery update', 'capture-video-requests.ts'],
]) test(name, async ({}, testInfo) => {
  test.setTimeout(180_000);
  execFileSync(process.execPath, ['--import', 'tsx', path.join(process.cwd(), 'scripts', script)], {
    env: {...process.env, SUQPAGE_TEST_SCREENSHOT_DIR: testInfo.outputPath('workflow')},
    stdio: 'pipe', timeout: 150_000, maxBuffer: 4 * 1024 * 1024,
  });
});
