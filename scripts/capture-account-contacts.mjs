import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';
import fs from 'node:fs';
import pg from 'pg';
import { chromium, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';

const base = 'http://127.0.0.1:3101';
const database = new URL(process.env.MIRTPAGE_POSTGRES_URL);
const provider = new URL(process.env.MIRTPAGE_SUPABASE_URL);
for (const [url, port] of [[database, '54322'], [provider, '54321']]) assert.ok(['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === port, 'Local only');
const pool = new pg.Pool({ connectionString: database.href });
const browser = await chromium.launch();
const output = '/tmp/suqpage-contact-review';
fs.mkdirSync(output, { recursive: true });
const errors = [];
let fixture;
try {
  fixture = (await pool.query("SELECT u.id,u.email,u.account_phone FROM users u JOIN businesses b ON b.id=u.business_id WHERE b.handle='entoto-ceramics' AND u.email='entoto-ceramics@mirtpage.local'")).rows[0];
  assert.ok(fixture, 'Reviewed demo identity required');
  const others = (await pool.query('SELECT id,email,account_phone FROM users WHERE id<>$1 ORDER BY id', [fixture.id])).rows;
  const publicBefore = (await pool.query('SELECT id,public_email,public_phone,contact_email FROM businesses ORDER BY id')).rows;
  const pages = (await pool.query("SELECT id,handle,public_email,public_phone,contact_email FROM businesses WHERE status='active' ORDER BY id")).rows;
  for (const business of pages) {
    const response = await fetch(`${base}/@${business.handle}`);
    assert.equal(response.status, 200);
    const html = await response.text();
    assert.ok(business.public_email && business.public_phone, 'Every active local demo has public email and phone');
    assert.ok(html.includes(`mailto:${encodeURIComponent(business.public_email)}`));
    assert.ok(html.includes(`tel:${business.public_phone}`));
    assert.ok(!html.includes('account_phone'), 'No account phone prop is serialized');
    if (business.contact_email && business.contact_email !== business.public_email) assert.ok(!html.includes(business.contact_email), 'No notification email in anonymous HTML/RSC');
  }
  console.log(`PASS all ${pages.length} active public pages: email/phone links and private-data exclusion`);
  const anon = await browser.newContext();
  const anonymousPage = await anon.newPage();
  await anonymousPage.goto(`${base}/dashboard/account`);
  await expect(anonymousPage).toHaveURL(/\/login/);
  await anon.close();
  const context = await browser.newContext();
  const admin = createClient(provider.origin, process.env.MIRTPAGE_SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: fixture.email });
  assert.ok(!link.error && link.data.properties?.email_otp);
  const cookieValues = [];
  const auth = createServerClient(provider.origin, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, { cookies: { getAll: () => [], setAll: (values) => cookieValues.push(...values) } });
  const verified = await auth.auth.verifyOtp({ email: fixture.email, token: link.data.properties.email_otp, type: 'email' });
  assert.ok(!verified.error && verified.data.user);
  await context.addCookies(cookieValues.map(({ name, value }) => ({ name, value, url: base, sameSite: 'Lax' })));
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1000 : 844 });
    await page.goto(`${base}/dashboard/account`);
    await expect(page.getByLabel('Account email', { exact: true })).toHaveValue(fixture.email);
    await expect(page.getByLabel('Account email', { exact: true })).toHaveAttribute('readonly', '');
    await page.getByLabel('Account phone', { exact: true }).fill('+44 (7700) 900-999');
    await page.getByLabel('Account phone', { exact: true }).evaluate(input => {
      const foreign = document.createElement('input'); foreign.type = 'hidden'; foreign.name = 'userId'; foreign.value = '1'; input.form.append(foreign);
      const email = document.createElement('input'); email.type = 'hidden'; email.name = 'email'; email.value = 'forged@example.com'; input.form.append(email);
    });
    await page.getByRole('button', { name: 'Save account phone', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Account phone saved.' })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Account phone', { exact: true })).toHaveValue('+447700900999');
    assert.ok(isDeepStrictEqual((await pool.query('SELECT id,email,account_phone FROM users WHERE id<>$1 ORDER BY id', [fixture.id])).rows, others), 'Other accounts remain unchanged');
    assert.ok(isDeepStrictEqual((await pool.query('SELECT id,public_email,public_phone,contact_email FROM businesses ORDER BY id')).rows, publicBefore), 'Business contacts remain unchanged');
    assert.equal((await pool.query('SELECT email FROM users WHERE id=$1', [fixture.id])).rows[0].email, fixture.email);
    const form = page.locator('form').filter({ has: page.getByLabel('Account phone', { exact: true }) });
    const audit = await new AxeBuilder({ page }).include('form').withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
    assert.deepEqual(audit.violations, []);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await form.screenshot({ path: `${output}/account-${width}.png`, caret: 'initial', style: 'nextjs-portal { visibility: hidden; }' });
    await page.getByLabel('Account phone', { exact: true }).fill('not-a-phone');
    await page.getByRole('button', { name: 'Save account phone', exact: true }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'country code' })).toBeVisible();
    assert.equal((await pool.query('SELECT account_phone FROM users WHERE id=$1', [fixture.id])).rows[0].account_phone, '+447700900999');
    await page.getByLabel('Account phone', { exact: true }).fill('');
    await page.getByRole('button', { name: 'Save account phone', exact: true }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Account phone saved.' })).toBeVisible();
    await page.reload();
    await expect(page.getByLabel('Account phone', { exact: true })).toHaveValue('');
    await page.goto(`${base}/@demo-nile-sensor-studio?ref=discovery`);
    const contacts = page.getByRole('region', { name: 'Connect with this business' });
    await expect(contacts.locator('a[href^="mailto:"]')).toHaveCount(1);
    await expect(contacts.locator('a[href^="tel:"]')).toHaveCount(1);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await contacts.screenshot({ path: `${output}/sensor-${width}.png`, caret: 'initial', style: 'nextjs-portal { visibility: hidden; }' });
    console.log(`PASS account save/reload/clear/invalid, forged fields, privacy, accessibility and sensor contacts ${width}px`);
  }
  assert.deepEqual(errors, []);
} finally {
  if (fixture) await pool.query('UPDATE users SET account_phone=$1 WHERE id=$2', [fixture.account_phone, fixture.id]);
  await browser.close(); await pool.end();
}
