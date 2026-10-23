import {test,expect} from './fixtures';

test('FE-065 business and product searches type live, retain independent filters and clear to default browsing',async({page,request})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/');
 const business=page.getByRole('searchbox',{name:'Search businesses',exact:true});
 const map=page.getByRole('region',{name:'Interactive OpenStreetMap map with clustered MirtPage page locations',exact:true});
 await expect(business).toBeVisible();await expect.poll(async()=>Number(await map.getAttribute('data-map-marker-count'))).toBeGreaterThan(0);
 await business.fill('selam');await expect.poll(async()=>Number(await map.getAttribute('data-map-marker-count'))).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Product listings',exact:true}).click();
 const product=page.getByRole('searchbox',{name:'Search products',exact:true});await expect(product).toHaveValue('');
 await expect(page.locator('.discovery-product-card').first()).toBeVisible();
 const response=await request.get('/api/discovery?scope=products&q=selam');expect(response.ok()).toBeTruthy();const result=await response.json();expect(result.searchProducts.length).toBeGreaterThan(0);
 await product.fill('selam');const card=page.locator('.discovery-product-card').first();await expect(card.locator('strong')).toHaveText(result.searchProducts[0].name);
 await expect(card.locator('p')).toHaveText(result.searchProducts[0].description);await expect(card.locator('p')).toBeVisible();
 await expect(card.getByRole('link',{name:'From '+result.searchProducts[0].businessName,exact:true})).toHaveAttribute('href',`/@${result.searchProducts[0].businessHandle}?ref=discovery`);
 await page.getByRole('button',{name:'Country',exact:true}).click();await page.getByRole('checkbox',{name:'Ethiopia',exact:true}).check();await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Made to order',exact:true}).click();await expect(page.getByRole('button',{name:'Made to order',exact:true})).toHaveAttribute('aria-pressed','true');await page.getByRole('button',{name:'Made to order',exact:true}).click();await expect(product).toBeVisible();
 await page.getByRole('button',{name:'City',exact:true}).click();const cities=page.getByRole('dialog').getByRole('checkbox');await expect(cities).not.toHaveCount(0);await cities.nth(0).check();await cities.nth(1).check();await page.getByRole('button',{name:'Done',exact:true}).click();
 await expect(page.getByRole('button',{name:'City 2',exact:true})).toBeVisible();
 await page.getByRole('button',{name:'Country 1',exact:true}).click();await page.getByRole('checkbox',{name:'Ethiopia',exact:true}).uncheck();await page.getByRole('button',{name:'Done',exact:true}).click();await expect(page.getByRole('button',{name:'City',exact:true})).toBeDisabled();
 await page.getByRole('button',{name:'Business locations',exact:true}).click();await expect(business).toHaveValue('selam');
 await page.getByRole('button',{name:'Country',exact:true}).click();await expect(page.getByRole('checkbox',{name:'Ethiopia',exact:true})).not.toBeChecked();await page.getByRole('button',{name:'Done',exact:true}).click();
 await page.getByRole('button',{name:'Clear all',exact:true}).click();await expect(business).toHaveValue('');await expect.poll(async()=>Number(await map.getAttribute('data-map-marker-count'))).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Product listings',exact:true}).click();await expect(product).toHaveValue('selam');
 await page.reload();await expect(product).toHaveValue('selam');await page.getByRole('button',{name:'Clear all',exact:true}).click();await expect(page.locator('.discovery-product-card').first()).toBeVisible();
});

test('FE-065 a slower prior reply never replaces newer typing',async({page,request})=>{
 const response=await request.get('/api/discovery?scope=products&q=warka');expect(response.ok()).toBeTruthy();const current=await response.json();expect(current.searchProducts.length).toBeGreaterThan(0);
 await page.goto('/?view=search');const product=page.getByRole('searchbox',{name:'Search products',exact:true});
 await page.route('**/api/discovery?**',async route=>{
  const response=await route.fetch();if(new URL(route.request().url()).searchParams.get('q')==='selam')await new Promise(resolve=>setTimeout(resolve,900));
  await route.fulfill({response}).catch(()=>{});
 });
 const old=page.waitForRequest(r=>new URL(r.url()).pathname==='/api/discovery'&&new URL(r.url()).searchParams.get('q')==='selam');
 await product.fill('selam');await old;await product.fill('warka');
 await expect(page.locator('.discovery-product-card strong').first()).toHaveText(current.searchProducts[0].name);
 await page.waitForTimeout(1200);await expect(product).toHaveValue('warka');await expect(page.locator('.discovery-product-card strong').first()).toHaveText(current.searchProducts[0].name);
});

test('FE-065 failed searches retry and clearing cancels pending results',async({page})=>{
 await page.goto('/?view=search');const product=page.getByRole('searchbox',{name:'Search products',exact:true});
 await page.route('**/api/discovery?**',route=>route.fulfill({status:503,contentType:'application/json',body:JSON.stringify({error:'Search is unavailable. Try again.'})}));
 await product.fill('selam');await expect(page.getByRole('alert').filter({hasText:'Search is unavailable.'})).toBeVisible();
 await page.unroute('**/api/discovery?**');await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(page.locator('.discovery-product-card').first()).toBeVisible();
 await page.route('**/api/discovery?**',async route=>{await new Promise(resolve=>setTimeout(resolve,700));await route.continue().catch(()=>{});});
 await product.fill('other pending query');await page.waitForTimeout(300);await page.getByRole('button',{name:'Clear all',exact:true}).click();
 await page.waitForTimeout(900);await expect(page.locator('.discovery-product-card').first()).toBeVisible();await expect(page.locator('.discovery-product-card').first()).toBeVisible();
});


test('FE-065 product scrolling appends bounded pages and retains position across panel switches',async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto('/?view=search');
 const cards=page.locator('.discovery-product-card'),list=page.locator('.discovery-search-results');
 await expect(cards).toHaveCount(12);await expect(page.getByRole('button',{name:'Product listings',exact:true})).toBeEnabled();
 const first=await cards.first().locator('strong').innerText();
 const pages:string[]=[];page.on('request',r=>{const url=new URL(r.url());if(url.pathname==='/api/discovery')pages.push(url.searchParams.get('page')||'1');});
 await list.evaluate(el=>{el.scrollTop=el.scrollHeight;});await expect(cards).toHaveCount(24);
 expect(await cards.first().locator('strong').innerText()).toBe(first);
 const position=await list.evaluate(el=>el.scrollTop);expect(position).toBeGreaterThan(0);
 await page.getByRole('button',{name:'Business locations',exact:true}).click();await page.waitForTimeout(400);expect(pages.filter(p=>p==='2')).toHaveLength(1);
 await page.getByRole('button',{name:'Product listings',exact:true}).click();await expect(cards).toHaveCount(24);expect(await list.evaluate(el=>el.scrollTop)).toBe(position);
 await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('selam');await expect.poll(()=>cards.count()).toBeLessThan(12);await expect.poll(()=>list.evaluate(el=>el.scrollTop)).toBe(0);
});

test('FE-065 failed append preserves cards and retries one page without automatic retry loop',async({page})=>{
 await page.goto('/?view=search');const cards=page.locator('.discovery-product-card');await expect(cards).toHaveCount(12);await expect(page.getByRole('button',{name:'Product listings',exact:true})).toBeEnabled();
 let calls=0;await page.route('**/api/discovery?**',async route=>{if(new URL(route.request().url()).searchParams.get('page')==='2'){calls++;await route.fulfill({status:503,contentType:'application/json',body:'{}'});}else await route.continue();});
 await page.locator('.discovery-search-results').evaluate(el=>{el.scrollTop=el.scrollHeight;});await expect(page.getByRole('button',{name:'Try again',exact:true})).toBeVisible();await expect(cards).toHaveCount(12);await expect(page.getByRole('button',{name:'Product listings',exact:true})).toBeEnabled();await page.waitForTimeout(500);expect(calls).toBe(1);
 await page.unroute('**/api/discovery?**');await page.getByRole('button',{name:'Try again',exact:true}).click();await expect(cards).toHaveCount(24);
});

test('FE-065 centered switch and opposing handles support clicks, drag and reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width:390,height:844});await page.goto('/');
 const market=page.getByRole('main').getByRole('region',{name:'MirtPage Market',exact:true});
 const stage=market.locator('.discovery-workbench'),switcher=market.getByRole('navigation',{name:'Search for',exact:true});
 const stageBox=(await stage.boundingBox())!,switchBox=(await switcher.boundingBox())!;
 expect(Math.abs(switchBox.x+switchBox.width/2-(stageBox.x+stageBox.width/2))).toBeLessThan(2);
 const handle=market.getByRole('button',{name:'View products',exact:true});const box=(await handle.boundingBox())!;
 await page.mouse.move(box.x+box.width/2,box.y+box.height/2);await page.mouse.down();await page.mouse.move(box.x+box.width/2-65,box.y+box.height/2,{steps:5});await page.mouse.up();
 await expect(market.getByRole('searchbox',{name:'Search products',exact:true})).toBeVisible();
 await expect(market.getByRole('searchbox',{name:'Search businesses',exact:true})).toHaveCount(0);
 const mapHandle=market.locator('button[data-side="map"]');await expect(mapHandle).toBeVisible();await mapHandle.click();await expect(market.getByRole('searchbox',{name:'Search businesses',exact:true})).toBeVisible();
});


test('FE-065 obsolete append never enters a replacement search and hidden panels do not load more',async({page,request})=>{
 const expected=await (await request.get('/api/discovery?scope=products&q=warka')).json();
 await page.goto('/?view=search');await expect(page.getByRole('button',{name:'Product listings',exact:true})).toBeEnabled();await expect(page.locator('.discovery-product-card')).toHaveCount(12);
 let appendCalls=0;await page.route('**/api/discovery?**',async route=>{if(new URL(route.request().url()).searchParams.get('page')==='2'){appendCalls++;const response=await route.fetch();await new Promise(resolve=>setTimeout(resolve,900));await route.fulfill({response}).catch(()=>{});}else await route.continue();});
 const append=page.waitForRequest(r=>new URL(r.url()).pathname==='/api/discovery'&&new URL(r.url()).searchParams.get('page')==='2');await page.locator('.discovery-search-results').evaluate(el=>el.scrollTop=el.scrollHeight);await append;
 await page.getByRole('searchbox',{name:'Search products',exact:true}).fill('warka');await expect(page.locator('.discovery-product-card strong').first()).toHaveText(expected.searchProducts[0].name);await page.waitForTimeout(1200);await expect(page.locator('.discovery-product-card')).toHaveCount(expected.searchProducts.length);expect(appendCalls).toBe(1);
 await page.getByRole('button',{name:'Business locations',exact:true}).click();await page.locator('.discovery-search-results').evaluate(el=>el.scrollTop=el.scrollHeight);await page.waitForTimeout(500);expect(appendCalls).toBe(1);
});
