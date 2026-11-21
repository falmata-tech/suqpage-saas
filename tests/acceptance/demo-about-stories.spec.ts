import { demoShowroomAbout } from '../../lib/demo-showroom-stories';
import { test, expect } from './fixtures';

test('FE-040 a two-paragraph demo story expands fully at phone width', async ({ page }) => {
  const handle = 'demo-tana-welding-shop';
  await page.setViewportSize({ width: 320, height: 650 });
  await page.goto('/@' + handle);
  const introduction = page.getByRole('region', { name: 'Business introduction' });
  const description = introduction.locator('p');
  const more = introduction.getByRole('button', { name: 'Read more' });
  const less = introduction.getByRole('button', { name: 'Read less' });
  await expect(page.getByText('Example business', { exact: true })).toHaveCount(1);
  await expect(description).not.toHaveText(demoShowroomAbout(handle));
  await expect(async () => {
    if (await more.isVisible()) await more.click();
    await expect(less).toBeVisible({ timeout: 1500 });
  }).toPass({ timeout: 10000 });
  expect(await description.textContent()).toBe(demoShowroomAbout(handle));
  expect(await description.evaluate(node => node.scrollHeight <= node.clientHeight + 1)).toBe(true);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await less.click();
  await expect(more).toBeVisible();
  await page.getByRole('link', { name: /^Products\s+4$/ }).click();
  await expect(page.getByRole('searchbox', { name: 'Search products' })).toBeVisible();
});
