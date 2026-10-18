import assert from 'node:assert/strict';
import fs from 'node:fs';
import crypto from 'node:crypto';
import {chromium,expect as assertions} from '@playwright/test';
import {createUiText,languageNames} from '../lib/i18n/core.ts';

// Anonymous actual local UI + real public GETs. All application mutations and
// third-party resources are blocked; clipboard/popups are observable safe ports.
const expect=assertions.configure({timeout:20000});
const web=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102',expo=process.env.SUQPAGE_MOBILE_TEST_URL||'http://localhost:8082';
for(const origin of [web,expo])assert.ok(['localhost','127.0.0.1'].includes(new URL(origin).hostname));
const out=process.env.SUQPAGE_INQUIRY_CAPTURE_DIR||'.local/business-inquiry-s118/actual';fs.mkdirSync(out,{recursive:true,mode:0o700});
const sources=['components/PublicActionDock.tsx','components/showroom/ShowroomApp.tsx','apps/mobile/src/PublicActionDock.tsx','apps/mobile/src/inquiry-baskets.ts','apps/mobile/src/inquiry-basket-storage.ts','apps/mobile/src/use-business-inquiry.ts','apps/mobile/app/product.tsx','apps/mobile/app/inquiry.tsx','apps/mobile/src/ShowroomContent.tsx','apps/mobile/app/_layout.tsx','apps/mobile/app/(tabs)/index.tsx'];
const sourceHashes=()=>Object.fromEntries(sources.map(file=>[file,crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex')]));
const beforeHashes=sourceHashes(),browser=await chromium.launch(),flows=[],screens=[],errors=[],blocked=[],reads=[],failedRequests=[];let stage='startup',passed=false;
const transparent=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aZwoAAAAASUVORK5CYII=','base64');
async function context(){
 const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});
 await context.addInitScript(()=>{
  const trace={copied:[],opened:[]};window.__suqpageInquiryCapture=trace;
  Object.defineProperty(navigator,'clipboard',{configurable:true,value:{writeText:async value=>{trace.copied.push(value);}}});
  window.open=(url)=>{const location={};Object.defineProperty(location,'href',{set(value){trace.opened.push(value);}});if(url&&url!=='about:blank')trace.opened.push(String(url));return{closed:false,opener:null,location,close(){}};};
 });
 await context.route('**/*',async route=>{
  const request=route.request(),url=new URL(request.url());
  if(!['GET','HEAD'].includes(request.method())){blocked.push({stage,method:request.method(),path:url.pathname});if(request.method()==='POST'&&url.pathname==='/api/analytics/visit')return route.fulfill({status:204,body:''});return route.abort();}
  if(['localhost','127.0.0.1'].includes(url.hostname)){if(url.pathname.startsWith('/api/'))reads.push({stage,path:url.pathname});return route.continue();}
  if(url.hostname==='unpkg.com'&&url.pathname.endsWith('/leaflet.css'))return route.fulfill({contentType:'text/css',body:fs.readFileSync('node_modules/leaflet/dist/leaflet.css','utf8')});
  if(request.resourceType()==='image')return route.fulfill({contentType:'image/png',body:transparent});
  return route.fulfill({contentType:url.pathname.endsWith('.css')?'text/css':'text/plain',body:''});
 });
 return context;
}
async function page(context){const page=await context.newPage();page.setDefaultTimeout(20000);page.on('pageerror',error=>errors.push({stage,error:error.message}));page.on('console',message=>{if(message.type()==='error'||message.type()==='warning')errors.push({stage,console:message.text()});});page.on('requestfailed',request=>failedRequests.push({stage,url:request.url(),method:request.method(),failure:request.failure()?.errorText}));page.on('response',response=>{if(new URL(response.url()).pathname.startsWith('/api/')&&response.status()>=400)errors.push({stage,api:response.url(),status:response.status()});});return page;}
const list=page=>page.getByRole('button',{name:/^View inquiry list/});
async function count(page,value){if(value===0)await expect(list(page)).toHaveCount(0);else{await expect(list(page)).toHaveCount(1);await expect(list(page)).toHaveAttribute('aria-label',new RegExp(`\\b${value}\\b`));}}
async function storage(page){return page.evaluate(()=>Object.fromEntries(Object.entries(localStorage).filter(([key])=>key.startsWith('suqpage-cart:')||key.startsWith('suqpage-business-inquiry-v1-'))));}
async function shot(page,name){await page.evaluate(()=>document.fonts?.ready);assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),name+' overflow');await page.screenshot({path:out+'/'+name+'.png',fullPage:true,caret:'initial',style:'nextjs-portal{visibility:hidden}'});screens.push(name);}
const eligible=shop=>shop.products.filter(product=>product.published&&product.kind!=='service'&&['available','limited'].includes(product.availability)&&product.options.every(group=>group.values.length>0));
const itemPath=(native,shop,product)=>native?`${expo}/product?${new URLSearchParams({handle:shop.handle,id:String(product.id)})}`:`${web}/@${shop.handle}?product=${product.id}`;
const shopPath=(native,shop)=>native?`${expo}/shop/${shop.handle}`:`${web}/@${shop.handle}`;
async function options(page,product,native){for(const group of product.options){if(native)await page.getByRole('button',{name:group.values[0],exact:true}).first().click();else await page.getByLabel(group.name,{exact:true}).selectOption(group.values[0]);}}
async function add(page,shop,product,native){await page.goto(itemPath(native,shop,product),{waitUntil:'domcontentloaded'});await options(page,product,native);const add=page.getByRole('button',{name:'Add to inquiry list',exact:true});await expect(add).toBeEnabled();await add.click();}
async function openList(page,native){await list(page).click();if(native){await expect(page).toHaveURL(/\/inquiry\?handle=/);await expect(page.getByRole('button',{name:'Copy message',exact:true})).toBeVisible();return page;}const dialog=page.getByRole('dialog',{name:'Business inquiry',exact:true});await expect(dialog).toBeVisible();return dialog;}
async function closeList(page,native){if(native)await page.getByRole('button',{name:'Back',exact:true}).click();else await page.keyboard.press('Escape');}
async function copy(page,composer){await composer.getByRole('button',{name:'Copy message',exact:true}).click();return page.evaluate(()=>window.__suqpageInquiryCapture.copied.at(-1));}
async function channels(page,composer){for(const channel of ['WhatsApp','Telegram','SMS']){const choice=composer.getByRole('link',{name:new RegExp('^'+channel)}).or(composer.getByRole('button',{name:channel,exact:true}));await expect(choice).toHaveCount(1);await expect(choice).toBeEnabled();}for(const channel of ['TikTok','Instagram','Facebook'])await expect(composer.getByRole('link',{name:new RegExp('^'+channel)}).or(composer.getByRole('button',{name:channel,exact:true}))).toHaveCount(0);
 // WhatsApp and Telegram use isolated popup ports. SMS readiness/encoded URI is
 // checked by focused components; no OS protocol handler is launched here.
 for(const channel of ['WhatsApp','Telegram']){await composer.getByRole('link',{name:new RegExp('^'+channel)}).or(composer.getByRole('button',{name:channel,exact:true})).click();await expect.poll(()=>page.evaluate(()=>window.__suqpageInquiryCapture.opened.length)).toBeGreaterThan(0);const trace=await page.evaluate(()=>window.__suqpageInquiryCapture);assert.equal(new URL(trace.opened.at(-1)).searchParams.get('text'),trace.copied.at(-1));}
}
async function run(native,width,a,b){
 const name=native?'expo-390':`web-${width}`,ctx=await context(),p=await page(ctx);await p.setViewportSize({width,height:width===1440?1000:844});
 try{
  const aa=eligible(a).sort((x,y)=>x.options.length-y.options.length).slice(0,2),bb=eligible(b).sort((x,y)=>x.options.length-y.options.length)[0];assert.equal(aa.length,2);assert.ok(bb);
  stage=name+' add A2';await add(p,a,aa[0],native);await count(p,1);await add(p,a,aa[1],native);await count(p,2);if(!native&&width===390)await shot(p,name+'-A2-product');
  stage=name+' add B1';await add(p,b,bb,native);await count(p,1);
  const saved=await storage(p);assert.equal(Object.keys(saved).length,2,'Each business owns a separate persisted list');
  stage=name+' public routes';for(const path of ['/featured','/']){await p.goto((native?expo:web)+path,{waitUntil:'domcontentloaded'});await count(p,0);await expect(p.getByRole('button',{name:/^Transport chat/})).toBeVisible();}if(!native&&width===390)await shot(p,name+'-market-no-list');
  stage=name+' return A';await p.goto(shopPath(native,a),{waitUntil:'domcontentloaded'});await count(p,2);await p.reload({waitUntil:'domcontentloaded'});await count(p,2);assert.deepEqual(await storage(p),saved);
  for(const profile of ['TikTok','Instagram','Facebook','Website']){const choice=p.getByRole('link',{name:new RegExp('^'+profile)}).or(p.getByRole('button',{name:profile,exact:true})).first();await expect(choice).toBeVisible();await expect(choice).toBeEnabled();}
  let composer=await openList(p,native);await count(p,0);let message=await copy(p,composer);for(const product of aa)assert.ok(message.includes(product.name));assert.ok(!message.includes(bb.name));await channels(p,composer);await shot(p,name+'-A2-composer');
  if(native){const quantity=p.getByRole('textbox',{name:'Add quantity (optional)',exact:true}).first();await quantity.fill('3 boxes');}else{await composer.getByText('Add quantity (optional)',{exact:true}).first().click();await composer.getByRole('textbox',{name:'Quantity',exact:true}).first().fill('3 boxes');}
  message=await copy(p,composer);assert.ok(message.includes('3 boxes'));await closeList(p,native);await count(p,2);const afterQuantity=await storage(p);
  stage=name+' direct item';await p.goto(itemPath(native,a,aa[1]),{waitUntil:'domcontentloaded'});await options(p,aa[1],native);await p.getByRole('button',{name:/^Inquire about this (?:product|item) only$/}).click();composer=native?p:p.getByRole('dialog',{name:'Business inquiry',exact:true});await expect(composer.getByRole('button',{name:'Copy message',exact:true})).toBeVisible();message=await copy(p,composer);assert.ok(message.includes(aa[1].name));assert.ok(!message.includes(aa[0].name));assert.deepEqual(await storage(p),afterQuantity,'Direct one-product inquiry does not mutate either saved group');await closeList(p,native);
  stage=name+' verify B';await p.goto(shopPath(native,b),{waitUntil:'domcontentloaded'});await count(p,1);composer=await openList(p,native);message=await copy(p,composer);assert.ok(message.includes(bb.name));for(const product of aa)assert.ok(!message.includes(product.name));await closeList(p,native);await p.reload({waitUntil:'domcontentloaded'});await count(p,1);
  if(native){stage=name+' Amharic composer';await p.goto(shopPath(native,a),{waitUntil:'domcontentloaded'});await p.getByRole('button',{name:'Language',exact:true}).click();await p.getByRole('radio',{name:languageNames.am,exact:true}).click();await p.getByRole('button',{name:createUiText(JSON.parse(fs.readFileSync('lib/i18n/messages/am.json','utf8')))('Close'),exact:true}).last().click();const t=createUiText(JSON.parse(fs.readFileSync('lib/i18n/messages/am.json','utf8')));const localized=p.getByRole('button',{name:new RegExp(t('View inquiry list').replace(/[.*+?^${}()|[\]\\]/g,'\\$&'))});await localized.click();await expect(p.getByRole('button',{name:t('Copy message'),exact:true})).toBeVisible();await shot(p,name+'-am-composer');}
  flows.push({surface:name,passed:true,businesses:[{id:a.id,handle:a.handle,count:2},{id:b.id,handle:b.handle,count:1}],publicGetCatalog:true,clipboardAndOpeners:'isolated ports',smsProtocol:'not launched'});
 }finally{await ctx.close();}
}
try{
 const ctx=await context();let a,b;try{a=await(await ctx.request.get(web+'/api/mobile/v1/shops/demo-tena-food-kitchen')).json();b=await(await ctx.request.get(web+'/api/mobile/v1/shops/demo-aloe-field-care')).json();assert.equal(a.id,34);assert.ok(a.isDemo&&b.isDemo);assert.ok(['phone','whatsapp','telegram'].every(kind=>a.approvedDemoContactMethods?.includes(kind)&&b.approvedDemoContactMethods?.includes(kind)));}finally{await ctx.close();}
 for(const width of [1440,390])await run(false,width,a,b);await run(true,390,a,b);assert.deepEqual(errors,[]);assert.ok(blocked.every(item=>item.method==='POST'&&item.path==='/api/analytics/visit'),'Only deliberately isolated visit analytics may attempt a write');assert.deepEqual(sourceHashes(),beforeHashes,'Source must remain frozen during captures');passed=true;
}catch(error){errors.push({stage,error:error instanceof Error?error.stack:String(error)});throw error;}finally{fs.writeFileSync(out+'/outcome.json',JSON.stringify({passed,stage,flows,screens,errors,blocked,reads,failedRequests,applicationMutations:0,sourceHashes:beforeHashes,androidDevice:false,limits:['External media/resources and clipboard/popups are controlled. Leaflet CSS uses the installed real asset.','SMS OS protocol delivery is not launched.','Public GET rate-limit/cache accounting may occur.','No auth, account, catalog, chat or database writes are performed.']},null,2),{mode:0o600});await browser.close();}
