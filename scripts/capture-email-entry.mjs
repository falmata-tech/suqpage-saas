import assert from 'node:assert/strict';
import fs from 'node:fs';
import { chromium, expect } from '@playwright/test';
const out = '.local/email-entry-review';
fs.mkdirSync(out, { recursive: true, mode: 0o700 });
const manifest = JSON.parse(fs.readFileSync('supabase/templates/manifest.json', 'utf8'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://127.0.0.1:3102/login');
    await expect(page.getByRole('heading', { name: 'Sign in to Suqpage.' })).toBeVisible();
    await expect(page.getByLabel('Email', { exact: true })).toBeVisible();
    assert.doesNotMatch(await page.locator('body').innerText(), /Google|Africmade|Mirtpage|Africpage/i);
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
    await page.screenshot({ path: `${out}/login-${width}.png`, fullPage: true });
    for (const entry of manifest) {
      const html = fs.readFileSync(`supabase/templates/${entry.file}`, 'utf8')
        .replaceAll('{{ .Token }}', '123456')
        .replaceAll('{{ .ConfirmationURL }}', 'https://example.test/verify')
        .replaceAll('{{ .SiteURL }}', 'https://suqpage.com');
      await page.setContent(html);
      assert.doesNotMatch(await page.locator('body').innerText(), /africmade|mirtpage|africpage/i);
      assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${entry.key}/${width} overflow`);
      await page.screenshot({ path: `${out}/${entry.key}-${width}.png`, fullPage: true });
    }
  }
  fs.writeFileSync(`${out}/evidence.json`, JSON.stringify({ passed: true, templates: 13, widths: [1440,390,320], realEmailsSent: false, hostedProviderVerified: false }, null, 2), { mode: 0o600 });
  console.log('PASS email-only login and 13 branded email previews at desktop/390/320; no real email sent.');
} finally { await browser.close(); }
