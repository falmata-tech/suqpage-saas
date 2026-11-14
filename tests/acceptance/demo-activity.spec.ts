import {execFileSync} from 'node:child_process';
import path from 'node:path';
import {test,expect} from './fixtures';

type ScenarioResult={handle:string;businessId:number;productId:number;stage:number;update:string;revision:string;
 product:{availability:string;capacitySummary:string;priceMinor:number|null};about:string};
const scenario=(action:'prepare'|'advance'|'pause')=>JSON.parse(execFileSync(process.execPath,
 ['--import','tsx',path.resolve('tests/acceptance/demo-scenario-fixture.ts'),action],{encoding:'utf8',timeout:30000,stdio:['ignore','pipe','pipe']})) as ScenarioResult;

test('FE-079 ordinary demo stages reach already-open desktop and phone without losing inquiry drafts',async({page,context,request},testInfo)=>{
 test.setTimeout(150000);
 const phone=await context.newPage();const pages=[{page,width:1440,expanded:false},{page:phone,width:390,expanded:false}];
 try{
  const prepared=scenario('prepare');scenario('advance');
  for(const surface of pages){
   await surface.page.setViewportSize({width:surface.width,height:900});
   await surface.page.goto('/@'+prepared.handle);
   const more=surface.page.locator('[data-business-profile] section').first().getByRole('button',{name:'Read more',exact:true});
   if(await more.count()){await more.click();surface.expanded=true;}
   await surface.page.locator(`a[href*="?product=${prepared.productId}"]`).first().click();
   await expect(surface.page).toHaveURL(new RegExp('product='+prepared.productId));
   await surface.page.getByRole('button',{name:'Inquire about this product only',exact:true}).click();
   const dialog=surface.page.getByRole('dialog');await expect(dialog).toBeVisible();
   await dialog.getByRole('button',{name:'Send to AfricMade Inbox',exact:true}).click();
   await dialog.getByRole('textbox',{name:'Your message',exact:true}).fill(`Keep this edited ${surface.width} inquiry.`);
   await surface.page.screenshot({path:testInfo.outputPath('workflow',`demo-${surface.width}-before.png`),fullPage:true});
  }
  // Two separate due transitions: the dispatch stage retains product facts,
  // then limited supply changes the related facts and published business update.
  const profileOnly=scenario('advance');expect(profileOnly.stage).toBe(1);
  const started=Date.now(),limited=scenario('advance');expect(limited.stage).toBe(2);expect(limited.product.availability).toBe('limited');
  const response=await request.get('/api/mobile/v1/shops/'+prepared.handle);expect(response.ok()).toBeTruthy();expect(response.headers()['cache-control']).toMatch(/no-store/);
  const fresh=await response.json(),product=fresh.products.find((p:{id:number})=>p.id===prepared.productId);
  expect(fresh.publicRevision).toBe(limited.revision);expect(product.availability).toBe('limited');expect(product.capacitySummary).toBe(limited.product.capacitySummary);expect(fresh.about).toBe(limited.about);
  for(const surface of pages){
   await expect(surface.page.getByText('Limited availability',{exact:true}).first()).toBeVisible({timeout:25000});
   const dialog=surface.page.getByRole('dialog');await expect(dialog.getByRole('textbox',{name:'Your message',exact:true})).toHaveValue(`Keep this edited ${surface.width} inquiry.`);
   await surface.page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
   const update=surface.page.locator('[data-business-profile]').getByText(limited.update,{exact:false}).first();await update.scrollIntoViewIfNeeded();await expect(update).toBeVisible();
   if(surface.expanded)await expect(surface.page.locator('[data-business-profile] section').first().getByRole('button',{name:'Read less',exact:true})).toBeVisible();
   await surface.page.screenshot({path:testInfo.outputPath('workflow',`demo-${surface.width}-after.png`),fullPage:true});
   expect(await surface.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
  }
  for(const locale of ['am','om'])for(const surface of pages){
   await surface.page.locator('.language-selector select').selectOption(locale);await expect(surface.page.locator('html')).toHaveAttribute('lang',locale);
   await expect(surface.page.locator('[data-business-profile]').getByText(limited.update,{exact:false}).first()).toBeVisible();
   expect(await surface.page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);
   await surface.page.screenshot({path:testInfo.outputPath('workflow',`demo-${surface.width}-${locale}.png`),fullPage:true});
  }
  await testInfo.attach('demo-stage-readback',{body:Buffer.from(JSON.stringify({stage:limited.stage,availability:product.availability,revision:fresh.publicRevision,elapsedMilliseconds:Date.now()-started,viewports:pages.map(p=>p.width),clock:'accelerated local stages; real foreground polling',externalMessagesSent:0})),contentType:'application/json'});
 }finally{try{scenario('pause');}finally{await phone.close();}}
});
