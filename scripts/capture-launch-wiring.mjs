import {findPlaceSuggestions} from '../lib/place-catalog.ts';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { createPostgresPool, postgresRuntimeConfig } from '../lib/postgres-runtime.ts';
import sharp from 'sharp';
import { chromium,expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
import {installMapTileFixture} from './testing/map-tile-fixture.mjs';
const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3101';if(!['localhost','127.0.0.1'].includes(new URL(base).hostname))throw new Error('Local browser origin required');const provider=new URL(process.env.NEXT_PUBLIC_SUPABASE_URL);const target=new URL(process.env.SUQPAGE_POSTGRES_URL);
assert.ok(['127.0.0.1','localhost'].includes(provider.hostname)&&['54321','56321'].includes(provider.port));assert.ok(['127.0.0.1','localhost'].includes(target.hostname)&&['54322','56322'].includes(target.port));
const pool=createPostgresPool(postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.href}));const adminAuth=createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch();const email=`page-ui-${randomUUID()}@example.test`;const out=process.env.SUQPAGE_TEST_SCREENSHOT_DIR||'/tmp/suqpage-launch-review';fs.mkdirSync(out,{recursive:true,mode:0o700});fs.chmodSync(out,0o700);let providerId;let businessId;const mediaKeys=[],tileFixtures=[];
const fixtureContext=async()=>{const context=await browser.newContext({serviceWorkers:'block',...(process.env.SUQPAGE_RECORD_REVIEW_VIDEO==='1'?{recordVideo:{dir:`${out}/videos`}}:{})});tileFixtures.push(await installMapTileFixture(context));await context.route('https://www.youtube-nocookie.com/embed/**',route=>route.fulfill({contentType:'text/html',body:'<!doctype html><title>Declared video frame fixture</title>'}));return context;};
const cookieContext=async(email)=>{const context=await fixtureContext();const link=await adminAuth.auth.admin.generateLink({type:'magiclink',email});assert.ok(!link.error&&link.data.properties?.email_otp);const cookies=[];const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});const verified=await client.auth.verifyOtp({email,token:link.data.properties.email_otp,type:'email'});assert.ok(!verified.error);await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));return context;};
async function openProductEditor(page,id){
 const current=new URL(page.url());if(current.pathname!=='/dashboard/products'||current.searchParams.get('business')!==String(businessId))await page.goto(`${base}/dashboard/products?business=${businessId}`);
 await expect(page.getByRole('heading',{name:'Products',exact:true,level:1})).toBeVisible();
 const edit=page.locator(`a[href^="/dashboard/products/${id}?"]`);await expect(edit).toHaveText('Edit');await edit.click();
 await expect(page).toHaveURL(url=>url.pathname===`/dashboard/products/${id}`);
 await expect(page.getByLabel('Name',{exact:true})).toBeEditable();
}
async function saveProductAndReopen(page,id){
 await page.getByRole('button',{name:'Save changes',exact:true}).click();
 await expect(page).toHaveURL(url=>url.pathname==='/dashboard/products'&&url.searchParams.get('saved')==='1');
 await expect(page.getByText('Item saved.',{exact:true})).toBeVisible();
 await openProductEditor(page,id);
}
const capture=async(page,name)=>{for(const width of [1440,390,320]){await page.setViewportSize({width,height:width===1440?1000:844});await page.evaluate(()=>window.scrollTo(0,0));assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`No overflow ${name} ${width}`);const heading=page.locator('.standard-page-heading');if(await heading.count()){const copy=await heading.locator(':scope > div').boundingBox();const action=heading.locator(':scope > .btn');if(copy&&await action.count()){const box=await action.boundingBox();assert.ok(box&&(width>760||box.y>=copy.y+copy.height+10),`Heading action has clear spacing ${name} ${width}`);}}if(name==='product-gallery')await page.getByRole('region',{name:'Photos and videos',exact:true}).scrollIntoViewIfNeeded();if(name==='simple-product')await page.locator('.product-media-editor').scrollIntoViewIfNeeded();if(name==='product-choices')await page.locator('.product-options-editor').scrollIntoViewIfNeeded();if(name==='owner-location'||name==='owner-storefront')await page.locator('#owner-location-mode').scrollIntoViewIfNeeded();await page.screenshot({path:`${out}/${name}-${width}.png`,caret:'initial',style:'nextjs-portal {visibility:hidden}'});}};
try{
 const beforeRequests=Number((await pool.query('SELECT COUNT(*) n FROM service_requests')).rows[0].n);
 const created=await adminAuth.auth.admin.createUser({email,email_confirm:true});assert.ok(!created.error&&created.data.user);providerId=created.data.user.id;
 const ownerContext=await cookieContext(email);const owner=await ownerContext.newPage();await owner.setViewportSize({width:1440,height:1000});
 const { createPostgresPublicClientWorkspace }=await import('../lib/signup-postgres.ts');const { PostgresTransactionRunner }=await import('../lib/postgres-runtime.ts');
 await createPostgresPublicClientWorkspace(new PostgresTransactionRunner(pool),{name:'Page Review Test',businessName:'Review Fixture Shop',businessCategory:'electronics', placeId:findPlaceSuggestions("Addis Ababa")[0].id,phone:'+447700900999',consent:true,idempotencyKey:randomUUID()},{providerUserId:providerId,email});
 await owner.goto(`${base}/dashboard`);await expect(owner).toHaveURL(/\/dashboard\/profile$/);await expect(owner.getByRole('heading',{name:'Account',exact:true})).toBeVisible();
 const record=(await pool.query('SELECT b.id,b.handle FROM businesses b JOIN users u ON u.business_id=b.id WHERE u.email=$1',[email])).rows[0];assert.ok(record);businessId=record.id;
 assert.equal(Number((await pool.query('SELECT COUNT(*) n FROM service_requests')).rows[0].n),beforeRequests);
 await expect(owner.locator('a[href*="/dashboard/requests"]')).toHaveCount(0);await capture(owner,'new-owner-dashboard');
 await owner.goto(`${base}/dashboard/catalog`);await expect(owner.locator('input[name=name]')).toHaveCount(0);await owner.getByRole('link',{name:'Add category',exact:true}).first().click();await expect(owner.getByRole('heading',{name:'Add category',exact:true})).toBeVisible();await owner.getByRole('textbox',{name:'Name',exact:true}).fill('Sensors');await owner.getByRole('button',{name:'Add category',exact:true}).click();await expect(owner).toHaveURL(/saved=category/);await expect(owner.getByRole('heading',{name:'Sensors',exact:true})).toBeVisible();await expect(owner.locator('input[name=name]')).toHaveCount(0);
 await owner.goto(`${base}/dashboard/products`);await owner.getByRole('link',{name:'Add product',exact:true}).click();await expect(owner).toHaveURL(/\/dashboard\/products\/new/);await owner.getByLabel('Name',{exact:true}).fill('Review fixture sensor');await owner.getByLabel('Description',{exact:true}).fill('A simple product for reviewing the standard page workflow.');await expect(owner.locator('#product-unit,#product-highlights')).toHaveCount(0);await expect(owner.getByLabel('Visibility',{exact:true})).toHaveValue('1');await expect(owner.getByLabel('Availability',{exact:true})).toHaveValue('available');await owner.getByLabel('How is this product supplied?',{exact:true}).selectOption('standard_product');
 const png=await sharp({create:{width:360,height:260,channels:3,background:'#78919a'}}).png().toBuffer();await owner.locator('input[type=file]').setInputFiles([{name:'fixture.png',mimeType:'image/png',buffer:png},{name:'second.png',mimeType:'image/png',buffer:await sharp({create:{width:360,height:260,channels:3,background:'#bd885a'}}).png().toBuffer()}]);
 await expect(owner.getByRole('button',{name:'Add video link',exact:true})).toHaveCount(0);
 await expect(owner.locator('.product-media-video input')).toBeEditable();
 await owner.locator('.product-media-video input').fill('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
 for(let move=0;move<2;move++)await owner.locator('.product-media-entry').filter({has:owner.locator('.product-media-video input')}).getByRole('button',{name:'Move media right',exact:true}).click();
 await owner.getByLabel('Video link',{exact:true}).fill('https://www.youtube.com/watch?v=jNQXAC9IVRw');
 await owner.getByRole('button',{name:'Add video',exact:true}).click();
 await owner.getByRole('button',{name:'Add item',exact:true}).click();await expect(owner).toHaveURL(url=>url.pathname==='/dashboard/products'&&url.searchParams.get('saved')==='1',{timeout:30000});await expect(owner.getByText('Item saved.',{exact:true})).toBeVisible();
 // Self-service video links are saved through the real owner form, without review.
 const stored=(await pool.query('SELECT id,media_json FROM products WHERE business_id=$1 AND name=$2',[businessId,'Review fixture sensor'])).rows[0];
 const starterMedia=JSON.parse(stored.media_json);
 assert.deepEqual(starterMedia.filter(item=>item.kind==='video'),[{kind:'video',ref:'youtube:dQw4w9WgXcQ'},{kind:'video',ref:'youtube:jNQXAC9IVRw'}]);
 const product=(await pool.query('SELECT id,image_path,media_json FROM products WHERE business_id=$1 AND name=$2',[businessId,'Review fixture sensor'])).rows[0];assert.ok(product?.image_path);const gallery=JSON.parse(product.media_json);assert.equal(gallery.length,4);mediaKeys.push(...gallery.filter(item=>item.kind==='image').map(item=>item.ref.split('/').at(-1)));for(const item of gallery.filter(item=>item.kind==='image'))assert.equal((await ownerContext.request.get(`${base}${item.ref}`)).status(),200);fs.writeFileSync(`${out}/fixture-cleanup.json`,JSON.stringify({businessId,providerId,mediaKeys}),{mode:0o600});const anonymous=await fixtureContext();assert.equal((await anonymous.request.get(`${base}${product.image_path}`)).status(),404);assert.equal((await ownerContext.request.get(`${base}${product.image_path}`)).status(),200);const hidden=await anonymous.request.get(`${base}/@${record.handle}`);const hiddenBody=await hidden.text();assert.ok([200,404].includes(hidden.status()) && hiddenBody.includes('404') && !hiddenBody.includes('Review fixture sensor'),'Next streaming not-found reveals no draft catalog');
 await openProductEditor(owner,product.id);
 await owner.reload();await expect(owner.locator('.product-media-entry')).toHaveCount(4);
 await owner.getByRole('button',{name:'Move media right',exact:true}).first().click();
 const reordered=owner.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname===`/dashboard/products/${product.id}`);
 await saveProductAndReopen(owner,product.id);assert.ok((await reordered).ok());
 await expect(owner.locator('.product-media-entry img').first()).toHaveAttribute('src',gallery[1].ref);
 await owner.reload();assert.equal((await pool.query('SELECT image_path FROM products WHERE id=$1',[product.id])).rows[0].image_path,gallery[1].ref);
 const extraPng=await sharp({create:{width:360,height:260,channels:3,background:'#326f80'}}).png().toBuffer();
 await expect(owner.locator('input[type=file]')).toBeEnabled();
 await owner.locator('input[type=file]').setInputFiles({name:'extra.png',mimeType:'image/png',buffer:extraPng});
 await expect(owner.locator('.product-media-entry')).toHaveCount(5);
 assert.equal(JSON.parse(await owner.locator('input[name=mediaOrder]').inputValue()).filter(item=>item.kind==='upload').length,1);
 const uploaded=owner.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname===`/dashboard/products/${product.id}`);
 await saveProductAndReopen(owner,product.id);const uploadResponse=await uploaded;assert.ok(uploadResponse.ok());
 await expect(owner.locator('.product-media-entry')).toHaveCount(5);
 await expect(owner.locator('.product-media-entry img').last()).toHaveAttribute('src',/^\/media\//);
 const savedMedia=(await pool.query('SELECT media_json FROM products WHERE id=$1',[product.id])).rows[0].media_json;
 assert.equal(JSON.parse(savedMedia).length,5,'The new distinct photo was actually saved');
 const extra=JSON.parse(savedMedia).at(-1).ref;mediaKeys.push(extra.split('/').at(-1));
 assert.ok(!gallery.some(item=>item.ref===extra),'The added photo has its own stored object');
 const savedPhoto=await ownerContext.request.get(`${base}${extra}`);assert.equal(savedPhoto.status(),200);
 const pixels=await sharp(await savedPhoto.body()).removeAlpha().raw().toBuffer();
 for(const [index,expected]of [50,111,128].entries())assert.ok(Math.abs(pixels[index]-expected)<=3,'Saved photo bytes match the distinct upload');
 const description='A simple product with multiple photos and videos.';
 await owner.getByLabel('Description',{exact:true}).fill(description);
 const again=owner.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname===`/dashboard/products/${product.id}`);
 await saveProductAndReopen(owner,product.id);assert.ok((await again).ok());
 const updated=(await pool.query('SELECT media_json,description FROM products WHERE id=$1',[product.id])).rows[0];
 assert.equal(updated.description,description);assert.equal(updated.media_json,savedMedia,'Later edits reuse saved uploads');
 await expect(owner.locator('.product-media-entry')).toHaveCount(5);
 await owner.getByRole('button',{name:'Remove media 5',exact:true}).click();
 const removed=owner.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname===`/dashboard/products/${product.id}`);
 await saveProductAndReopen(owner,product.id);assert.ok((await removed).ok());
 await expect(owner.locator('.product-media-entry')).toHaveCount(4);await capture(owner,'simple-product');

 await owner.goto(`${base}/dashboard/business`);await expect(owner.locator('#owner-business-name')).toHaveCount(0);await owner.getByRole('link',{name:'Edit',exact:true}).click();await owner.getByLabel('Business logo',{exact:true}).setInputFiles({name:'logo.png',mimeType:'image/png',buffer:png});await expect(owner.getByRole('combobox',{name:'Country',exact:true})).toHaveValue('ET');await owner.getByLabel('City or town',{exact:true}).fill('Addis');await owner.getByRole('option').filter({hasText:'Addis Ababa'}).first().click();await expect(owner.locator('input[name=region]')).toHaveValue('Addis Ababa');await owner.getByRole('button',{name:'Save business details',exact:true}).click();await expect(owner).toHaveURL(/\/dashboard\/business\?saved=1$/);await expect(owner.getByText('Business details saved.',{exact:true})).toBeVisible();await expect(owner.locator('#owner-business-name')).toHaveCount(0);
 const logo=(await pool.query('SELECT logo_path FROM businesses WHERE id=$1',[businessId])).rows[0].logo_path;mediaKeys.push(logo.split('/').at(-1));fs.writeFileSync(`${out}/fixture-cleanup.json`,JSON.stringify({businessId,providerId,mediaKeys}),{mode:0o600});assert.equal((await anonymous.request.get(`${base}${logo}`)).status(),404);assert.equal((await ownerContext.request.get(`${base}${logo}`)).status(),200);
 assert.ok((await pool.query('SELECT approved_at FROM business_discovery_profiles WHERE business_id=$1',[businessId])).rows[0].approved_at>0);await capture(owner,'owner-business');await owner.getByRole('link',{name:'Edit',exact:true}).click();await capture(owner,'owner-location');await owner.getByLabel('Public location',{exact:true}).selectOption('storefront');await expect(owner.getByLabel('Storefront latitude',{exact:true})).toBeVisible();await capture(owner,'owner-storefront');await owner.getByLabel('Public location',{exact:true}).selectOption('area');await expect(owner.getByLabel('Storefront latitude',{exact:true})).toHaveCount(0);
 const ownerAudit=await new AxeBuilder({page:owner}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(ownerAudit.violations,[]);
 // Replace every starter offering and sample contact through the owner forms.
 const samples=(await pool.query('SELECT id FROM products WHERE business_id=$1 AND id<>$2 ORDER BY id',[businessId,product.id])).rows;
 for(const [index,sample] of samples.entries()) {
  await openProductEditor(owner,sample.id);
  await owner.getByLabel('Name',{exact:true}).fill(`Review shop offering ${index+1}`);
  await owner.getByLabel('Description',{exact:true}).fill(`Details for review shop offering ${index+1}.`);
  await saveProductAndReopen(owner,sample.id);
 }
 await owner.goto(`${base}/dashboard/page-editor`);
 await expect(owner.getByLabel("Page preview",{exact:true})).toBeVisible();
 await expect(owner.locator('#shop-about,#shop-video,#public-phone')).toHaveCount(0);
 await owner.getByRole('button',{name:'Cancel',exact:true}).last().click();await expect(owner).toHaveURL(/\/dashboard\/profile\/showroom$/);
 await owner.getByRole('link',{name:'Public contact details',exact:true}).click();await expect(owner).toHaveURL(/task=contacts&returnTo=showroom$/);await expect(owner.locator('#shop-about,#shop-video')).toHaveCount(0);
 for(const key of ['phone','email','website','whatsapp','tiktok','instagram','telegram','facebook'])await owner.locator(`#public-${key}`).fill('');
 await owner.locator('#public-whatsapp').fill('+251911234568');
 await owner.getByRole('button',{name:'Save',exact:true}).click();await expect(owner).toHaveURL(/\/dashboard\/profile\/showroom\?saved=page$/);await expect(owner.getByText('Changes saved.',{exact:true})).toBeVisible();
 await owner.getByRole('link',{name:'About the business',exact:true}).click();await expect(owner).toHaveURL(/task=about&returnTo=showroom$/);await expect(owner.locator('#public-phone,#shop-video')).toHaveCount(0);
 await owner.getByLabel('About the business',{exact:true}).fill('We make product browsing and asking questions simple.');await owner.getByRole('button',{name:'Save',exact:true}).click();await expect(owner).toHaveURL(/\/dashboard\/profile\/showroom\?saved=page$/);await expect(owner.getByText('Changes saved.',{exact:true})).toBeVisible();
 const savedPage=JSON.parse((await pool.query('SELECT content_json FROM owner_page_drafts WHERE business_id=$1',[businessId])).rows[0].content_json);assert.equal(savedPage.about,'We make product browsing and asking questions simple.');assert.equal(savedPage.contacts.whatsapp,'+251911234568');for(const key of ['phone','email','website','tiktok','instagram','telegram','facebook'])assert.equal(savedPage.contacts[key],'','Unrelated focused About save preserves every deliberately cleared public contact');
 const previewLink=owner.locator('a[href="/dashboard/page-editor?view=preview&returnTo=showroom"]');
 await expect(previewLink).toHaveCount(1);
 await expect(previewLink).toHaveAccessibleName('Preview page See your showroom as customers see it.');
 await previewLink.click();
 await expect(owner).toHaveURL(/\/dashboard\/page-editor\?view=preview&returnTo=showroom$/);
 await expect(owner.getByLabel('Page preview',{exact:true})).toBeVisible();
 await expect(owner.getByRole('button',{name:'Submit for review',exact:true})).toHaveCount(0);
 await owner.getByRole('button',{name:'Publish',exact:true}).click();await owner.getByRole('dialog').getByRole('button',{name:'Publish page',exact:true}).click();await expect(owner.getByText('Your page is live',{exact:true})).toBeVisible();
 await owner.getByRole('button',{name:'Edit',exact:true}).click();await owner.getByLabel('About the business',{exact:true}).fill('Saved live by the business owner.');await owner.getByRole('button',{name:'Save',exact:true}).click();await expect(owner).toHaveURL(/\/dashboard\/profile\/showroom\?saved=page$/);await expect(owner.getByText('Changes saved.',{exact:true})).toBeVisible();
 const publicPage=await anonymous.newPage();await publicPage.goto(`${base}/@${record.handle}`);await expect(publicPage.getByText('Saved live by the business owner.',{exact:true}).filter({visible:true})).toBeVisible();await publicPage.close();
 assert.equal((await anonymous.request.get(`${base}${product.image_path}`)).status(),200);
 const adminEmail=(await pool.query("SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role='platform_admin' ORDER BY u.id LIMIT 1")).rows[0].email;
 const adminContext=await cookieContext(adminEmail);const admin=await adminContext.newPage();await admin.setViewportSize({width:1440,height:1000});await admin.goto(`${base}/dashboard/admin`);await capture(admin,'admin-overview');
 await expect(admin.getByRole('link',{name:/Page reviews|Location reviews/})).toHaveCount(0);
 for(const route of ['/dashboard/admin/page-reviews',`/dashboard/admin/page-reviews/${businessId}`]){await admin.goto(base+route);await expect(admin).toHaveURL(/\/dashboard\/admin\/businesses$/);}
 // Detailed options/visibility remain staff controls; owners retain the simple form.
 await openProductEditor(admin,product.id);await admin.getByRole('button',{name:'Add option',exact:true}).click();await admin.getByLabel('Option 1 name',{exact:true}).fill('Color');await admin.getByLabel('Option 1 choices',{exact:true}).fill('Blue\nBlack');await admin.getByLabel('Customer-service note',{exact:true}).fill('Fictional acceptance test: verify staff options and visibility.');await saveProductAndReopen(admin,product.id);await admin.reload();await expect(admin.getByLabel('Option 1 name',{exact:true})).toHaveValue('Color');await capture(admin,'staff-product-options');
 await owner.goto(`${base}/dashboard`);await expect(owner).toHaveURL(/\/dashboard\/profile$/);await expect(owner.getByText('Your page is live',{exact:true})).toBeVisible();await capture(owner,'published-owner-dashboard');
 for(const path of ['/dashboard/requests','/dashboard/requests/new','/dashboard/requests/1/revisions/1/studio','/dashboard/design-bank','/dashboard/design-sdk','/api/requests','/api/client/requests','/api/operations/requests','/api/requests/1/attachments/1']){
  assert.equal((await adminContext.request.get(`${base}${path}`)).status(),404,path);assert.equal((await anonymous.request.post(`${base}${path}`,{data:{},headers:{Origin:base}})).status(),404,path);
 }
 await admin.goto(`${base}/dashboard/admin/businesses/${businessId}/team`);await expect(admin).toHaveURL(/\/dashboard\/admin\/staff$/);await expect(admin.getByRole('heading',{name:'Staff',exact:true})).toBeVisible();await capture(admin,'staff-directory');
 for(const page of [owner,admin]){const audit=await new AxeBuilder({page}).include('main').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(audit.violations,[]);}
 assert.equal(Number((await pool.query('SELECT COUNT(*) n FROM service_requests')).rows[0].n),beforeRequests);
 const buyer=await anonymous.newPage();await buyer.goto(`${base}/@${record.handle}?product=${product.id}`);const viewer=buyer.getByRole('region',{name:'Photos and videos',exact:true});await expect(viewer).toBeVisible();await expect(viewer.getByRole('button',{name:'Photo 1',exact:true})).toHaveAttribute('aria-pressed','true');await viewer.getByRole('button',{name:'Next media',exact:true}).click();await expect(viewer.getByRole('button',{name:'Photo 2',exact:true})).toHaveAttribute('aria-pressed','true');await viewer.getByRole('button',{name:'Video 3',exact:true}).click();await viewer.getByRole('button',{name:'Play video 3',exact:true}).click();await expect(viewer.locator('iframe')).toHaveCount(1);await viewer.getByRole('button',{name:'Video 4',exact:true}).click();await expect(viewer.locator('iframe')).toHaveCount(0);await viewer.getByRole('button',{name:'Play video 4',exact:true}).click();await expect(viewer.locator('iframe')).toHaveCount(1);await viewer.getByRole('button',{name:'Photo 1',exact:true}).click();await expect(viewer.locator('iframe')).toHaveCount(0);
 await capture(buyer,'product-gallery');
 for(const width of [390,320]){
  await buyer.setViewportSize({width,height:844});
  const track=viewer.locator('[tabindex="0"]');
  await track.focus();await track.press('ArrowRight');
  assert.equal(await track.evaluate(el=>Math.round(el.scrollLeft/el.clientWidth)),1,`Keyboard selection settles on visible Photo 2 at ${width}px`);
  await expect(viewer.getByRole('button',{name:'Photo 2',exact:true})).toHaveAttribute('aria-pressed','true');
  await track.evaluate(el=>el.scrollTo({left:0,behavior:'instant'}));
  await expect(viewer.getByRole('button',{name:'Photo 1',exact:true})).toHaveAttribute('aria-pressed','true');
  assert.equal(await track.evaluate(el=>Math.round(el.scrollLeft/el.clientWidth)),0,`Returning to Photo 1 keeps the visible slide in sync at ${width}px`);
 }
 const galleryAudit=await new AxeBuilder({page:buyer}).include('[data-product-page]').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();assert.deepEqual(galleryAudit.violations,[]);
 await expect(buyer.getByRole('combobox',{name:'Color',exact:true})).toBeVisible();await buyer.getByRole('combobox',{name:'Color',exact:true}).selectOption('Black');await buyer.getByRole('button',{name:'Inquire about this product only',exact:true}).click();await expect(buyer.getByRole('dialog')).toContainText('Black');await capture(buyer,'buyer-product-choices');
 await openProductEditor(admin,product.id);await admin.getByLabel('Visibility',{exact:true}).selectOption('0');await admin.getByLabel('Customer-service note',{exact:true}).fill('Fictional acceptance test: verify staff options and visibility.');await saveProductAndReopen(admin,product.id);await admin.reload();await expect(admin.getByLabel('Visibility',{exact:true})).toHaveValue('0');
 const hiddenProduct=await anonymous.request.get(`${base}/@${record.handle}?product=${product.id}`);assert.ok(!(await hiddenProduct.text()).includes('<h2 tabindex="-1">Review fixture sensor</h2>'));
 const rejected=await anonymous.request.post(`${base}/api/inquiries`,{headers:{Origin:base},data:{businessId,customerName:'Fixture buyer',contact:'+447700900999',contactMethod:'phone',idempotencyKey:randomUUID(),items:[{productId:product.id,options:{Color:'Black'}}]}});assert.equal(rejected.status(),410);
 await admin.getByLabel('Visibility',{exact:true}).selectOption('1');{const saved=admin.waitForResponse(r=>r.request().method()==='POST'&&new URL(r.url()).pathname===`/dashboard/products/${product.id}`);await admin.getByLabel('Customer-service note',{exact:true}).fill('Fictional acceptance test: verify staff options and visibility.');await saveProductAndReopen(admin,product.id);assert.ok((await saved).ok());}await expect.poll(async()=>Number((await pool.query('SELECT is_published FROM products WHERE id=$1',[product.id])).rows[0].is_published)).toBe(1);
 await pool.query("UPDATE businesses SET contact_email='' WHERE id=$1",[businessId]);
 // Public contact prepares a social message; the retired adapter cannot save it.
 await buyer.goto(`${base}/@${record.handle}?product=${product.id}`);await buyer.getByRole('combobox',{name:'Color',exact:true}).selectOption('Black');await buyer.getByRole('button',{name:'Inquire about this product only',exact:true}).click();
 const inquiryDialog=buyer.getByRole('dialog',{name:'Business inquiry',exact:true});
 await expect(inquiryDialog.getByRole('heading',{name:'Message the business',exact:true})).toBeVisible();
 await expect(inquiryDialog.getByRole('button',{name:/Send inquiry on (?:Suqpage|MirtPage)/})).toHaveCount(0);
 await expect(inquiryDialog.locator('input[type=tel]')).toHaveCount(0);
 const draft=await inquiryDialog.locator('textarea[aria-label="Inquiry message"]').inputValue();
 assert.ok(draft.includes('Review fixture sensor')&&draft.includes('Color: Black')&&draft.includes(`${base}/@${record.handle}?product=${product.id}`));
 await anonymous.grantPermissions(['clipboard-read','clipboard-write'],{origin:base});
 const socialRequests=[];
 await anonymous.route('https://wa.me/**',async route=>{socialRequests.push(route.request().url());await route.fulfill({contentType:'text/html',body:'<!doctype html><title>Declared external contact fixture: no message sent</title>'});});
 const whatsapp=inquiryDialog.getByRole('link',{name:/^WhatsApp/});
 await expect(whatsapp).toHaveAttribute('href',/^https:\/\/wa\.me\/251911234568\?text=/);
 await buyer.evaluate(()=>navigator.clipboard.writeText('old fixture clipboard'));
 const popupWait=anonymous.waitForEvent('page');await whatsapp.click();const popup=await popupWait;
 await expect(popup).toHaveURL(url=>url.hostname==='wa.me'&&url.searchParams.get('text')===draft);
 await buyer.bringToFront();assert.equal(await buyer.evaluate(()=>navigator.clipboard.readText()),draft,'Configured account click automatically copies the complete current product draft');
 assert.equal(socialRequests.length,1,'Exactly one declared external draft navigation; no provider request or send');await popup.close();
 await buyer.evaluate(()=>navigator.clipboard.writeText('manual fixture clipboard'));
 await inquiryDialog.getByRole('button',{name:'Copied',exact:true}).click();
 assert.equal(await buyer.evaluate(()=>navigator.clipboard.readText()),draft,'Manual copy remains an extra option');
 await expect(inquiryDialog.getByRole('textbox',{name:'Inquiry message',exact:true})).toHaveValue(draft);
 const beforeInquiries=Number((await pool.query('SELECT COUNT(*) n FROM inquiries WHERE business_id=$1',[businessId])).rows[0].n);assert.equal(beforeInquiries,0);
 const inquiry={businessId,customerName:'Launch fixture buyer',contact:'+447700900999',contactMethod:'phone',idempotencyKey:randomUUID(),items:[{productId:product.id,options:{Color:'Black'}}]};
 // Installed native clients do not send a browser Origin. Keep origin rejection
 // separate from the retired adapter response, including on loopback host aliases.
 for(const {path,headers} of [{path:'/api/inquiries',headers:{Origin:base}},{path:'/api/mobile/v1/inquiries',headers:{}}]){
  const sent=await anonymous.request.post(`${base}${path}`,{headers,data:inquiry});
  assert.equal(sent.status(),410,`Valid retired adapter request ${path}`);
  assert.equal((await sent.json()).code,'inquiry_retired');
  assert.match(sent.headers()['cache-control']||'',/\bno-store\b/);
 }
 const foreignInquiry=await anonymous.request.post(`${base}/api/mobile/v1/inquiries`,{headers:{Origin:'https://untrusted.example'},data:inquiry});
 assert.equal(foreignInquiry.status(),403,'Foreign browser Origin is rejected before native retirement dispatch');
 assert.equal((await foreignInquiry.json()).error,'Origin not allowed.');
 assert.equal(Number((await pool.query('SELECT COUNT(*) n FROM inquiries WHERE business_id=$1',[businessId])).rows[0].n),beforeInquiries,'Social contact and retired adapters never create inbox records');
 await owner.goto(`${base}/dashboard/inquiries`);await expect(owner.getByRole('heading',{name:'Inquiry history',exact:true})).toBeVisible();await expect(owner.getByText('No customer inquiries match this view.',{exact:true})).toBeVisible();await expect(owner.getByRole('link',{name:'Inquiries',exact:true})).toHaveCount(0);
 for(const pathname of ['/dashboard','/dashboard/business','/dashboard/catalog','/dashboard/products','/dashboard/inquiries','/dashboard/account','/dashboard/account-health','/dashboard/support']){const response=await owner.goto(`${base}${pathname}`);assert.equal(response.status(),200,`Owner route ${pathname}`);await expect(owner.locator('main')).toBeVisible();await expect(owner.getByRole('heading',{name:'404',exact:true})).toHaveCount(0);}
 for(const pathname of ['/dashboard/admin','/dashboard/admin/businesses','/dashboard/admin/discovery','/dashboard/admin/staff','/dashboard/admin/page-reviews','/dashboard/clients/new','/dashboard/support/agents','/dashboard/admin/sponsors','/dashboard/admin/featured-schedule']){const response=await admin.goto(`${base}${pathname}`);assert.equal(response.status(),200,`Admin route ${pathname}`);await expect(admin.locator('main')).toBeVisible();await expect(admin.getByRole('heading',{name:'404',exact:true})).toHaveCount(0);}
 console.log('PASS launch owner identity/private logo/immediate location, focused product Save/list return, direct publish/live Save, retired review redirects, staff options/visibility, configured social automatic/manual copying, retired inbox rejection, owner/admin destination sweep, desktop/390/320 captures and focused accessibility. Signup fixture uses the real local adapter; Auth sessions are test-issued; video frames/social navigation/tiles are declared fixtures, no provider playback or external sends claimed.');

}catch(error){for(const context of browser.contexts())for(const page of context.pages()){const gallery=page.getByRole('region',{name:'Photos and videos',exact:true});if(await gallery.count()){console.error('Gallery dimensions:',await gallery.evaluate(el=>{const t=el.querySelector('[tabindex=\"0\"]');return {width:t.clientWidth,left:t.scrollLeft,full:t.scrollWidth,slides:[...t.children].map(c=>({width:c.getBoundingClientRect().width,inert:c.inert})),selected:[...el.querySelectorAll('[aria-pressed]')].map(c=>c.getAttribute('aria-pressed'))}}));await page.screenshot({path:`${out}/gallery-failure.png`});}const errors=await page.locator('.error,[role=alert]').allTextContents().catch(()=>[]);if(errors.length){console.error('Visible workflow errors:',errors);console.error('Workflow alert node metadata:',await page.locator('.error,[role=alert]').evaluateAll(nodes=>nodes.map(node=>{const rect=node.getBoundingClientRect(),css=getComputedStyle(node),root=node.getRootNode();return {tagName:node.tagName,role:node.getAttribute('role'),id:node.id,className:typeof node.className==='string'?node.className:'',textLength:(node.textContent||'').length,width:rect.width,height:rect.height,display:css.display,visibility:css.visibility,shadowHost:root instanceof ShadowRoot?root.host.tagName:null};})).catch(()=>[]));}const invalid=await page.locator('input:invalid,select:invalid,textarea:invalid').evaluateAll(els=>els.map(el=>({id:el.id,message:el.validationMessage}))).catch(()=>[]);if(invalid.length)console.error('Invalid fields:',invalid);}console.error('Browser workflow failure:',error instanceof Error?error.message:String(error));throw error;}finally{
 const fixture=businessId?{id:businessId}:(await pool.query('SELECT business_id AS id FROM users WHERE email=$1',[email])).rows[0];
 if(fixture){const cleanup=await pool.connect();try{await cleanup.query('BEGIN');for(const table of ['owner_page_reviews','owner_page_publications','owner_page_events','owner_page_drafts','product_upkeep_commands','published_catalog_versions','audit_logs'])await cleanup.query(`DELETE FROM ${table} WHERE business_id=$1`,[fixture.id]);await cleanup.query('DELETE FROM businesses WHERE id=$1',[fixture.id]);await cleanup.query('COMMIT');}catch(e){await cleanup.query('ROLLBACK');throw e;}finally{cleanup.release();}}
 for(const key of mediaKeys){const response=await adminAuth.storage.from(process.env.SUQPAGE_SUPABASE_STORAGE_BUCKET||'mirtpage-media').remove([`pages/${key}`]);assert.ok(!response.error,'Fixture media cleanup');}
 if(providerId){const removed=await adminAuth.auth.admin.deleteUser(providerId);assert.ok(!removed.error,'Local test identity cleanup');}
 await browser.close();await pool.end();const {closePostgresRuntimeForTests}=await import('../lib/postgres-runtime-services.ts');await closePostgresRuntimeForTests();for(const fixture of tileFixtures)fixture.assertNoExternalRequests();
}
