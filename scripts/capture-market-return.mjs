import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {chromium,expect as playwrightExpect} from '@playwright/test';

// Focused anonymous local navigation only. Root confirms source freeze and the
// exclusive browser slot; this never signs in, sends chat or submits a form.
assert.equal(process.env.SUQPAGE_S117_CAPTURE_READY,'1','Confirm final sources and the local browser slot before running.');
const web=process.env.SUQPAGE_WEB_PREVIEW_URL||'http://127.0.0.1:3102';
const expo=process.env.SUQPAGE_MOBILE_PREVIEW_URL||'http://localhost:8082';
for(const [base,port]of [[web,'3102'],[expo,'8082']]){const target=new URL(base);assert.ok(['127.0.0.1','localhost'].includes(target.hostname));assert.equal(target.port,port);assert.equal(target.protocol,'http:');}
const out=process.env.SUQPAGE_S117_CAPTURE_DIR||'.local/market-return-s117';
fs.mkdirSync(out,{recursive:true,mode:0o700});
const expect=playwrightExpect.configure({timeout:45000}),allowed=new Set([new URL(web).origin,new URL(expo).origin]);
const evidence={passed:false,scope:'S117 current anonymous local navigation',flows:[],screens:[],runtimeErrors:[],consoleErrors:[],apiReads:[],apiFailures:[],requestFailures:[],blockedWrites:[],externalRequests:[],resourceFixtures:[],applicationWrites:0,applicationWriteScope:'No business/catalog/chat/auth writes; normal GET rate-limit/cache accounting is permitted.',androidDevice:false,limits:['External map/media resources are controlled; playback and provider tiles are not tested.','The exact Leaflet1.9.4 stylesheet URL is served from the installed SDK CSS without external network access.','Expo browser is not installed Android/MapLibre/OS evidence.','This harness does not test persistence APIs or send messages.']};
let stage='launch',browser;
function setStage(value){stage=value;console.log(stage);}
const transparent=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRbQAAAAASUVORK5CYII=','base64');
const safeUrl=raw=>{const u=new URL(raw);return u.origin+u.pathname;};
function record(name,surface,details={}){evidence.flows.push({name,surface,...details});}
async function context(surface,width){
 const ctx=await browser.newContext({viewport:{width,height:width>760?900:844},reducedMotion:'reduce',serviceWorkers:'block'});
 await ctx.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(!['http:','https:'].includes(url.protocol))return route.continue();
  if(!allowed.has(url.origin)){
   evidence.externalRequests.push({stage,surface,method:request.method(),url:safeUrl(url.href),type:request.resourceType()});
   if(url.href==='https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'&&request.resourceType()==='stylesheet'){
    evidence.resourceFixtures.push({url:url.href,source:'node_modules/leaflet/dist/leaflet.css'});
    return route.fulfill({status:200,contentType:'text/css',body:fs.readFileSync('node_modules/leaflet/dist/leaflet.css')});
   }
   if(request.resourceType()==='image')return route.fulfill({status:200,contentType:'image/png',body:transparent});
   if(request.resourceType()==='document')return route.fulfill({status:200,contentType:'text/html',body:'<!doctype html><title>Controlled external media</title>'});
   return route.fulfill({status:200,contentType:'text/plain',body:''});
  }
  if(!['GET','HEAD','OPTIONS'].includes(request.method())){
   const expected=url.pathname==='/api/analytics/visit'||/^\/api\/mobile\/v1\/.*(?:visit|analytics)/.test(url.pathname);
   evidence.blockedWrites.push({stage,surface,method:request.method(),url:safeUrl(url.href),expectedAnalytics:expected});
   if(expected)return route.fulfill({status:200,contentType:'application/json',body:'{}'});
   return route.abort('blockedbyclient');
  }
  return route.continue();
 });
 const page=await ctx.newPage();
 page.on('pageerror',error=>evidence.runtimeErrors.push({stage,surface,message:error.message,stack:error.stack}));
 page.on('console',message=>{if(message.type()==='error')evidence.consoleErrors.push({stage,surface,message:message.text(),url:message.location().url});});
 page.on('response',response=>{const url=new URL(response.url());if(url.pathname.startsWith('/api/')){if(['GET','HEAD'].includes(response.request().method()))evidence.apiReads.push({stage,surface,status:response.status(),url:url.origin+url.pathname,query:url.search});if(response.status()>=400)evidence.apiFailures.push({stage,surface,status:response.status(),url:safeUrl(response.url())});}});
 page.on('requestfailed',request=>evidence.requestFailures.push({stage,surface,url:safeUrl(request.url()),failure:request.failure()?.errorText||'unknown'}));
 return{ctx,page};
}
async function screenshot(page,name){
 if(name.endsWith('products-restored'))await expect((name.startsWith('expo-')?page.getByTestId('search-drawer').getByRole('button'):page.locator('.discovery-product-link')).first()).toBeVisible();
 if(name.endsWith('map-restored'))await expect((name.startsWith('expo-')?page.getByRole('button',{name:/\. Open page preview$/}):page.locator('.mp-map-showroom')).first()).toBeVisible();
 const file=name+'.png',target=path.join(out,file);await page.screenshot({path:target,fullPage:false,caret:'initial'});fs.chmodSync(target,0o600);evidence.screens.push({name,file,url:page.url()});
}
const search=(page,surface,mode)=>surface==='expo'?page.getByRole('textbox',{name:mode==='products'?'Search products':'Search businesses',exact:true}):page.getByRole('searchbox',{name:mode==='products'?'Search products':'Search businesses',exact:true});
async function fillSearch(page,surface,mode,value){
 const reply=page.waitForResponse(response=>{const u=new URL(response.url());return u.pathname===(surface==='expo'?'/api/mobile/v1/market':'/api/discovery')&&u.searchParams.get('scope')===mode&&u.searchParams.get('q')===value;},{timeout:45000});
 await search(page,surface,mode).fill(value);const response=await reply;assert.ok(response.ok(),'Settled public search must succeed');
 await expect(search(page,surface,mode)).toHaveValue(value);
}
async function closeMapPreview(page,surface){
 if(surface==='web'){const close=page.locator('dialog[open] .discovery-preview-close');if(await close.count())await close.click();}
}
async function assertMode(page,surface,mode,query='aloe'){
 await expect.poll(()=>new URL(page.url()).pathname).toBe('/');
 if(surface==='web'){await expect(page.getByRole('button',{name:'Businesses',exact:true})).toBeEnabled();await expect(page.getByRole('button',{name:'Products',exact:true})).toBeEnabled();await expect(page.locator('.discovery-workbench')).toHaveAttribute('data-panel-open',String(mode==='products'));}
 else await expect(page.getByRole('tab',{name:mode==='products'?'Products':'Businesses',exact:true})).toHaveAttribute('aria-selected','true');
 await closeMapPreview(page,surface);
 await expect(search(page,surface,mode)).toBeVisible();
 if(query!==null)await expect(search(page,surface,mode)).toHaveValue(query);
}
async function chooseMode(page,surface,mode){await page.getByRole(surface==='expo'?'tab':'button',{name:mode==='products'?'Products':'Businesses',exact:true}).click();await assertMode(page,surface,mode,null);}
async function globalLink(page,surface,label){
 if(surface==='expo')return page.getByRole('tab',{name:label,exact:true}).click();
 const nav=page.viewportSize().width>760?page.locator('.public-app-rail'):page.locator('.public-mobile-tabs');
 const link=nav.getByRole('link',{name:label,exact:true});
 // The Next development indicator overlaps the phone's first tab. Exercise the
 // same accessible control by keyboard rather than forcing a covered click.
 if(page.viewportSize().width<=760&&label==='Market'){await link.focus();await link.press('Enter');}
 else await link.click();
}
async function assertDetails(page,surface,kind){
 await expect.poll(()=>new URL(page.url()).pathname).toMatch(surface==='expo'?(kind==='product'?/^\/product$/:/^\/shop\//):/^\/@/);
 await expect(page.getByRole('button',{name:surface==='expo'?'Back':'Back to Market',exact:true})).toBeVisible();
 if(kind==='product')await expect(page.getByRole('button',{name:/^Inquire about this (?:item|product) only$/})).toBeVisible();
}
async function productDetail(page,surface){
 if(surface==='web'){const card=page.locator('.discovery-product-card .discovery-product-link').first();await expect(card).toBeVisible();await card.click();}
 else {const product=page.getByTestId('search-drawer').getByRole('button').first();await expect(product).toBeVisible();await product.click();}
 await assertDetails(page,surface,'product');
}
async function businessDetail(page,surface){
 if(surface==='web'){
  const marker=page.locator('.mp-map-showroom').first().locator('xpath=..');await expect(marker).toBeVisible();await marker.focus();await marker.press('Enter');
  const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();await dialog.getByRole('link',{name:'Open page',exact:false}).click();
 }else{
  const marker=page.getByRole('button',{name:/\. Open page preview$/}).first();await expect(marker).toBeVisible();await marker.focus();await marker.press('Enter');
  await page.getByRole('button',{name:'Explore this business',exact:true}).click();
 }
 await assertDetails(page,surface,'business');
}
async function detailReturns(page,surface,mode,name){
 const open=mode==='products'?productDetail:businessDetail;
 for(const back of ['browser','header']){
  setStage(`${name} ${mode} detail ${back}`);await open(page,surface);
  if(back==='browser')await page.goBack({waitUntil:'domcontentloaded'});else await page.getByRole('button',{name:surface==='expo'?'Back':'Back to Market',exact:true}).click();
  await assertMode(page,surface,mode);if(mode==='businesses')await page.waitForTimeout(400);record(`${mode} detail ${back} return`,name,{mode,query:'aloe'});
 }
}
async function otherReturns(page,surface,mode,name){
 for(const other of ['About','Featured']){
  setStage(`${name} ${mode} ${other} Market`);await globalLink(page,surface,other);await expect.poll(()=>new URL(page.url()).pathname).toBe('/'+other.toLowerCase());
  await globalLink(page,surface,'Market');await assertMode(page,surface,mode);record(`${mode} ${other} Market`,name,{mode,query:'aloe'});
 }
}
async function featuredOrigin(page,surface,name){
 setStage(`${name} Featured source`);await globalLink(page,surface,'Featured');await expect.poll(()=>new URL(page.url()).pathname).toBe('/featured');
 if(surface==='web'){const card=page.locator('button.featured-card[data-business-id]').first();await expect(card).toBeEnabled();await card.click();await page.getByRole('dialog').getByRole('link',{name:'Open page',exact:false}).click();}
 else {const card=page.getByRole('button').filter({hasText:'Explore this business'}).first();await expect(card).toBeVisible();await card.click();}
 await assertDetails(page,surface,'business');await page.getByRole('button',{name:surface==='expo'?'Back':'Back to Market',exact:true}).click();
 await expect.poll(()=>new URL(page.url()).pathname).toBe('/featured');record('Featured detail returns to Featured',name);
 if(surface==='web'&&page.viewportSize().width===390)await screenshot(page,'web-390-featured-source-return');
 await globalLink(page,surface,'Market');await assertMode(page,surface,'businesses');record('Global Market remains Market after Featured detail',name);
}
async function explicitPrecedence(page,surface,base,name){
 setStage(`${name} explicit view precedence`);
 await page.goto(base+'/?view=search&p.q=aloe&b.q=nile',{waitUntil:'domcontentloaded'});await assertMode(page,surface,'products');
 await page.goto(base+'/?view=map&p.q=aloe&b.q=nile',{waitUntil:'domcontentloaded'});await assertMode(page,surface,'businesses','nile');
 await globalLink(page,surface,'About');await globalLink(page,surface,'Market');await assertMode(page,surface,'businesses','nile');
 await chooseMode(page,surface,'products');await expect(search(page,surface,'products')).toHaveValue('aloe');
 record('Explicit views override remembered mode and preserve independent searches',name);
}
async function explicitMapActions(page,surface,base,name){
 setStage(`${name} intentional map actions`);
 await globalLink(page,surface,'About');
 if(surface==='web')await page.getByRole('link').filter({has:page.locator('strong')}).and(page.locator('[href="/?view=map"]')).click();
 else await page.getByRole('button',{name:'Explore the map',exact:true}).click();
 await assertMode(page,surface,'businesses','');record('About map action explicitly resets to map',name);
 if(surface==='web'){
  await chooseMode(page,surface,'products');
  await page.goto(base+'/?p.madeToOrder=invalid',{waitUntil:'domcontentloaded'});
  await expect(page.getByRole('alert')).toContainText('Check your search filters.');
  await page.getByRole('link',{name:'Clear filters',exact:true}).click();
  await assertMode(page,surface,'businesses','');record('Invalid filters recovery explicitly resets to map',name);
 }
}
async function run(surface,width){
 const name=`${surface}-${width}`,base=surface==='expo'?expo:web,{ctx,page}=await context(surface,width);
 try{
  setStage(`${name} initial map`);await page.goto(base+'/',{waitUntil:'domcontentloaded'});await assertMode(page,surface,'businesses','');
  await fillSearch(page,surface,'businesses','aloe');
  await chooseMode(page,surface,'products');await fillSearch(page,surface,'products','aloe');
  await detailReturns(page,surface,'products',name);await otherReturns(page,surface,'products',name);
  await screenshot(page,name+'-products-restored');
  await chooseMode(page,surface,'businesses');await expect(search(page,surface,'businesses')).toHaveValue('aloe');
  await detailReturns(page,surface,'businesses',name);await otherReturns(page,surface,'businesses',name);
  if(width===390)await screenshot(page,name+'-map-restored');
  await featuredOrigin(page,surface,name);await explicitPrecedence(page,surface,base,name);await explicitMapActions(page,surface,base,name);
 }catch(error){evidence.failurePage={url:page.url(),stage};await screenshot(page,name+'-failure').catch(()=>{});throw error;}finally{await ctx.close();}
}
async function runRepeatedExpoIntent(captureScreens=true){
 const surface='expo',name='expo-390-intent',{ctx,page}=await context(surface,390);
 try{
  setStage(`${name} initial explicit map`);await page.goto(expo+'/?view=map&p.q=aloe&b.q=nile',{waitUntil:'domcontentloaded'});await assertMode(page,surface,'businesses','nile');
  for(let repeat=1;repeat<=2;repeat++){
   setStage(`${name} repeat ${repeat}`);await chooseMode(page,surface,'products');
   if(await search(page,surface,'products').inputValue()!=='aloe')await fillSearch(page,surface,'products','aloe');
   await globalLink(page,surface,'About');await page.getByRole('button',{name:'Explore the map',exact:true}).click();
   await assertMode(page,surface,'businesses','');record('Repeated intentional map action resets selected mode and filters',name,{repeat});
  }
  setStage(`${name} manual Products after explicit map`);await chooseMode(page,surface,'products');await fillSearch(page,surface,'products','aloe');
  await productDetail(page,surface);await page.getByRole('button',{name:'Back',exact:true}).click();await assertMode(page,surface,'products');record('Old explicit map does not replay on detail Back',name);
  await globalLink(page,surface,'About');await globalLink(page,surface,'Market');await assertMode(page,surface,'products');record('Bare Market retains manually selected Products after explicit reset',name);
  if(captureScreens){await screenshot(page,name+'-products-restored');await chooseMode(page,surface,'businesses');await fillSearch(page,surface,'businesses','aloe');await screenshot(page,name+'-map-restored');}
 }catch(error){evidence.failurePage={url:page.url(),stage};await screenshot(page,name+'-failure').catch(()=>{});throw error;}finally{await ctx.close();}
}
async function runWebMapDeparture(){
 for(const width of [1440,390]){
  const surface='web',name=`web-${width}-map-lifecycle`,{ctx,page}=await context(surface,width);
  try{
   for(let repeat=1;repeat<=(width===1440?1:2);repeat++)for(const back of width===1440?['browser']:['browser','header']){
    setStage(`${name} repeat ${repeat} ${back}`);
    // A fresh document resets the initial camera before every departure, so
    // each marker selection can exercise an active owned zoom transition.
    await page.goto(web+'/?view=map&b.q=aloe&p.q=aloe',{waitUntil:'domcontentloaded'});await assertMode(page,surface,'businesses');
    await businessDetail(page,surface);
    if(back==='browser')await page.goBack({waitUntil:'domcontentloaded'});else await page.getByRole('button',{name:'Back to Market',exact:true}).click();
    await assertMode(page,surface,'businesses');
    // Observe Leaflet's250ms transition fallback after the departed instance
    // was removed; a late SDK exception must fail this focused receipt.
    await page.waitForTimeout(400);record('Map detail departure retains map without late exceptions',name,{repeat,back});
   }
   await screenshot(page,name+'-map-restored');
  }catch(error){evidence.failurePage={url:page.url(),stage};await screenshot(page,name+'-failure').catch(()=>{});throw error;}finally{await ctx.close();}
 }
}
async function runSettledExpoScreens(){
 const surface='expo',name='expo-390-css',{ctx,page}=await context(surface,390);
 try{
  setStage(`${name} Products`);await page.goto(expo+'/?view=search&b.q=aloe&p.q=aloe',{waitUntil:'domcontentloaded'});await assertMode(page,surface,'products');
  await globalLink(page,surface,'About');await globalLink(page,surface,'Market');await assertMode(page,surface,'products');await screenshot(page,name+'-products-restored');record('Settled Products restored with installed map stylesheet',name);
  setStage(`${name} Businesses`);await chooseMode(page,surface,'businesses');await expect(search(page,surface,'businesses')).toHaveValue('aloe');
  await expect(page.getByRole('button',{name:/\. Open page preview$/}).first()).toBeInViewport();
  await screenshot(page,name+'-map-restored');record('Settled map and marker visible with installed map stylesheet',name);
 }catch(error){evidence.failurePage={url:page.url(),stage};await screenshot(page,name+'-failure').catch(()=>{});throw error;}finally{await ctx.close();}
}
try{
 browser=await chromium.launch({headless:true,timeout:30000});
 if(process.argv.includes('--intent-only'))await runRepeatedExpoIntent();
 else if(process.argv.includes('--map-lifecycle-only'))await runWebMapDeparture();
 else if(process.argv.includes('--expo-final')){await run('expo',390);await runRepeatedExpoIntent(false);}
 else if(process.argv.includes('--expo-screens-only'))await runSettledExpoScreens();
 else{
  if(!process.argv.includes('--expo-only'))for(const width of [1440,390])await run('web',width);
  if(!process.argv.includes('--web-only'))await run('expo',390);
 }
 assert.deepEqual(evidence.runtimeErrors,[],'Unexpected application exceptions');assert.deepEqual(evidence.consoleErrors,[],'Unexpected console errors');assert.deepEqual(evidence.apiFailures,[],'Failed local API reads');
 assert.deepEqual(evidence.blockedWrites.filter(item=>!item.expectedAnalytics),[],'Only automatic visit beacons may be attempted; all writes stay blocked');
 assert.deepEqual(evidence.requestFailures.filter(item=>!/ERR_ABORTED|NS_BINDING_ABORTED/.test(item.failure)),[],'Unexpected failed requests');
 evidence.passed=true;
}catch(error){evidence.failure={stage,error:String(error)};throw error;}
finally{if(browser)await browser.close();evidence.browserClosed=true;fs.writeFileSync(path.join(out,'outcome.json'),JSON.stringify(evidence,null,2)+'\n',{mode:0o600});}
console.log(JSON.stringify({passed:evidence.passed,flows:evidence.flows.length,screens:evidence.screens.length,applicationWrites:0,browserClosed:true}));
