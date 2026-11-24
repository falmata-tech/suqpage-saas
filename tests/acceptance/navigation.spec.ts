import {test,expect} from './fixtures';

test('FE-036 platform pages keep one shell, header, main and session-aware navigation',async({page})=>{
 await page.setViewportSize({width:1440,height:960});
 for(const path of ['/','/about','/privacy','/terms','/account-deletion','/login','/contact-success']){
  await page.goto(path);await expect(page.locator('.public-app-shell')).toHaveCount(1);await expect(page.getByRole('main')).toHaveCount(1);await expect(page.locator('.public-app-header')).toHaveCount(1);
  const rail=page.locator('.public-app-rail');await expect(rail).toBeVisible();await expect(rail.getByRole('link',{name:'Login',exact:true})).toHaveAttribute('href','/login');await expect(rail.getByRole('link',{name:'Dashboard',exact:true})).toHaveCount(0);await expect(rail.getByRole('link',{name:'About',exact:true})).toHaveAttribute('href','/about');await expect(rail.getByRole('link',{name:'Inquiries',exact:true})).toHaveCount(0);
  if(['/about','/privacy','/terms','/login'].includes(path))await expect(rail.locator('[aria-current=page]')).toHaveCount(1);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
 }
});

test('FE-036 phone has one bottom navigation with About and reachable legal pages',async({page})=>{
 await page.setViewportSize({width:320,height:740});await page.goto('/about');
 const tabs=page.getByRole('navigation',{name:'AfricMade application navigation',exact:true});await expect(tabs).toHaveCount(1);await expect(tabs.getByRole('link')).toHaveCount(4);await expect(tabs.getByRole('link',{name:'About',exact:true})).toHaveAttribute('aria-current','page');
 await page.getByRole('link',{name:'Privacy',exact:true}).filter({visible:true}).click();await expect(page).toHaveURL(/\/privacy$/);await expect(tabs).toHaveCount(1);await expect(page.getByRole('heading',{name:'Privacy notice',exact:true})).toBeVisible();await expect(page.getByRole('main')).toHaveCount(1);
 await tabs.getByRole('link',{name:'Login',exact:true}).click();await expect(page.getByRole('textbox',{name:'Email',exact:true})).toBeVisible();await expect(tabs).toHaveCount(1);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
});

test('FE-049 Somali selection survives public navigation and reopening the page', async ({page, request}) => {
  await page.setViewportSize({width: 320, height: 740});
  await page.goto('/about');
  const menu = page.locator('.language-selector select:visible');
  await menu.selectOption({label: 'Soomaali'});
  await expect(page.locator('html')).toHaveAttribute('lang', 'so');
  await expect(page).toHaveTitle('Ku saabsan AfricMade');
  await page.getByRole('tab', {name: 'Iibsadayaasha'}).click();
  await page.getByRole('link', {name: 'Eeg alaabta', exact: true}).click();
  await expect(page).toHaveURL(/view=search/);
  await page.reload();
  await expect(menu).toHaveValue('so');

  const filters = page.getByRole('button', {name: /^Kala xulo,/});
  const dialog = page.getByRole('dialog');
  await filters.click();
  await dialog.getByRole('button', {name: 'Qayb', exact: true}).click();
  await dialog.getByRole('checkbox', {name: 'Cunto, cabbitaan, khudrad iyo miro'}).check();
  await dialog.getByRole('button', {name: 'Dhammaystay'}).click();
  await filters.click();
  await dialog.getByRole('button', {name: 'Qaybta sii gaarka ah'}).click();
  await dialog.getByRole('checkbox', {name: 'Malab', exact: true}).check();
  await dialog.getByRole('button', {name: 'Dhammaystay'}).click();

  const response = await request.get('/api/discovery?scope=products&category=food-farming&subcategory=Honey');
  expect(response.ok()).toBeTruthy();
  const {searchProducts} = await response.json();
  const originalNames = searchProducts.map((item: {name: string}) => item.name);
  expect(originalNames).toContain('Seasonal Raw Honey');
  await expect(page.locator('.discovery-product-card strong')).toHaveText(originalNames);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)).toBe(true);
});

test('FE-049 phone header fits every selected language beside the installation button', async ({page}) => {
  await page.goto('/about');
  const menu = page.locator('.public-app-header select');
  for (const language of ['en', 'am', 'om', 'so']) {
    await menu.selectOption(language);
    await expect(page.locator('html')).toHaveAttribute('lang', language);
    await page.evaluate(() => document.fonts.ready);
    for (const width of [320, 360, 361, 375, 380, 381, 390, 414, 420, 421, 430]) {
      await page.setViewportSize({width, height: 740});
      const fit = await menu.evaluate((element: HTMLSelectElement) => {
        // Let this browser size its own native arrow and the selected label together.
        const reference = element.cloneNode(false) as HTMLSelectElement;
        reference.add(element.selectedOptions[0].cloneNode(true) as HTMLOptionElement);
        Object.assign(reference.style, {
          position: 'fixed', visibility: 'hidden', width: 'max-content',
          minWidth: '0', maxWidth: 'none', flex: 'none',
        });
        element.after(reference);
        const needed = reference.getBoundingClientRect().width;
        reference.remove();
        const actual = element.getBoundingClientRect();
        return {width: actual.width, height: actual.height, needed, pageWidth: document.documentElement.scrollWidth};
      });
      expect(fit.width + 0.5, language + ' at ' + width + 'px').toBeGreaterThanOrEqual(fit.needed);
      expect(fit.height).toBeGreaterThanOrEqual(44);
      expect(fit.pageWidth).toBeLessThanOrEqual(width + 1);
    }
  }
});
