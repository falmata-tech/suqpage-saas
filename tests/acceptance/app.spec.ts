import { test, expect, type Page } from "@playwright/test";
import { execFileSync } from "node:child_process";
import path from "node:path";

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
async function signOut(page: Page) { await page.getByRole("button", { name: "Sign out" }).click(); await expect(page).toHaveURL(/\/login$/); }

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
  await expect(page.getByLabel('Page handle',{exact:true})).toHaveCount(0);
  await page.getByLabel('Category',{exact:true}).selectOption('home-living');
  await page.getByLabel('Account phone (private)',{exact:true}).fill('+447700900999');
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
  await expect(page.getByText('Private draft saved',{exact:true})).toBeVisible();
  await page.reload();
  await page.getByRole('button',{name:'Page color',exact:true}).click();
  await expect(page.getByRole('button',{name:'Choose color #B6FF00',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.getByRole('button',{name:'Default',exact:true}).click();
  await page.getByRole('button',{name:'Save',exact:true}).click();
  await expect(page.getByText('Private draft saved',{exact:true})).toBeVisible();
  await page.reload();
  await expect(page.locator('[data-business-profile]')).not.toHaveAttribute('data-store-accent');
  await page.goto('/dashboard/business');await expect(page.getByLabel('Business name',{exact:true})).toHaveValue('Acceptance signup shop');
  await page.goto('/dashboard/account');await expect(page.getByLabel('Account phone',{exact:true})).toHaveValue('+447700900999');
  await page.getByLabel('Account phone',{exact:true}).fill('+447700900998');await page.getByRole('button',{name:'Save account phone',exact:true}).click();
  await expect(page.getByText('Account phone saved.',{exact:true})).toBeVisible();
  await page.reload();await expect(page.getByLabel('Account phone',{exact:true})).toHaveValue('+447700900998');
  await page.goto('/request');await expect(page).toHaveURL(/\/dashboard$/);
  await signOut(page);await page.goto('/dashboard');await expect(page).toHaveURL(/\/login/);
});

test('self-service owner, staff product controls and inquiry lifecycle',async({},testInfo)=>{
  test.setTimeout(360_000);
  execFileSync(process.execPath,['--import','tsx',path.join(process.cwd(),'scripts/capture-launch-wiring.mjs')],{
    env:{...process.env,SUQPAGE_TEST_SCREENSHOT_DIR:testInfo.outputPath('workflows')},stdio:'pipe',timeout:330_000,maxBuffer:4*1024*1024,
  });
});

test('category pagination retains the map on desktop and phones',async({},testInfo)=>{
  test.setTimeout(180_000);
  execFileSync(process.execPath,[path.join(process.cwd(),'scripts/capture-category-pagination.mjs')],{
    env:{...process.env,SUQPAGE_TEST_SCREENSHOT_DIR:testInfo.outputPath('category')},stdio:'pipe',timeout:150_000,maxBuffer:2*1024*1024,
  });
});

test('linked products, inquiry selection and progressive reply contact',async({page})=>{
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:900});await page.goto('/@selam-weave');
    await page.locator('a[href*="?product="]').first().click();await expect(page).toHaveURL(/product=\d+/);
    const url=page.url();await page.reload();await expect(page).toHaveURL(url);
    await page.getByRole('button',{name:'Inquire about this product only',exact:true}).click();
    const dialog=page.getByRole('dialog');await expect(dialog).toBeVisible();
    await expect(page.getByLabel('Reply phone number',{exact:true})).toHaveCount(0);
    await expect(dialog.getByRole('button',{name:'Copy inquiry',exact:true})).toBeVisible();
    await dialog.getByRole('button',{name:'Send inquiry on Suqpage',exact:true}).click();
    await expect(page.getByLabel('Reply phone number',{exact:true})).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
    await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
  }
});

test('administrator and staff remain within workspace permissions',async({page})=>{
  await loginWithEmailCode(page,'admin@mirtpage.local');
  for(const route of ['/dashboard/admin/businesses','/dashboard/admin/staff','/dashboard/admin/page-reviews','/dashboard/admin/businesses?location=pending','/dashboard/support/agents','/dashboard/admin/sponsors','/dashboard/admin/featured-schedule']){
    const response=await page.goto(route);expect(response?.status()).toBe(200);await expect(page.locator('main')).toBeVisible();
    await expect(page.locator('a[href*="/dashboard/requests"],a[href*="/dashboard/design-bank"]')).toHaveCount(0);
  }
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
  expect((await request.post('/api/inquiries',{data:{businessId:1,customerName:'X',contact:'12345',items:[]}})).status()).toBe(400);
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
  await expect(page.locator('iframe')).toHaveAttribute('src',/^https:\/\/www\.youtube-nocookie\.com\/embed\/wJV9EDe_sFc\?autoplay=1$/);
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
