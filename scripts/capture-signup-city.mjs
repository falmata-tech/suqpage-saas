import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import pg from 'pg';
import {chromium,expect as baseExpect} from '@playwright/test';
import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {installMapTileFixture,MAP_TILE_FIXTURE_ID} from './testing/map-tile-fixture.mjs';

process.loadEnvFile('.local/supabase-runtime.env');
for(const value of [process.env.SUQPAGE_POSTGRES_URL,process.env.NEXT_PUBLIC_SUPABASE_URL]) assert.equal(new URL(value).hostname,'127.0.0.1');
const output='.local/s158-map-pin-review',base='http://127.0.0.1:3102',expo='http://localhost:8082';
const provider=process.env.NEXT_PUBLIC_SUPABASE_URL;
const place=(await (await fetch(`${base}/api/places?q=Hawassa&country=ET`)).json()).places[0];
const otherPlace=(await (await fetch(`${base}/api/places?q=Addis%20Ababa&country=ET`)).json()).places[0];
assert.ok(place&&otherPlace&&place.id!==otherPlace.id);
fs.mkdirSync(output,{recursive:true});
const pool=new pg.Pool({connectionString:process.env.SUQPAGE_POSTGRES_URL});
const admin=createClient(provider,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
const browser=await chromium.launch({channel:'chrome',headless:true}),expect=baseExpect.configure({timeout:30000});
const identities=[],businesses=[],checks=[],renderErrors=[],tileFixtures=[];

async function newReviewContext(viewport){
  const context=await browser.newContext({viewport,serviceWorkers:'block'});
  tileFixtures.push(await installMapTileFixture(context));
  return context;
}
async function identity(){
  const email=`pin-review-${crypto.randomUUID()}@example.test`,created=await admin.auth.admin.createUser({email,email_confirm:true});
  assert.equal(created.error,null);identities.push(created.data.user.id);return {email,id:created.data.user.id};
}
async function verifyLocation(id,expectedPlace,expectedPoint,expectedReviewedVersion=1){
  const owner=(await pool.query('SELECT business_id FROM users u JOIN auth_identity_links i ON i.user_id=u.id WHERE i.provider_user_id=$1',[id])).rows[0];
  assert.ok(owner);if(!businesses.includes(owner.business_id))businesses.push(owner.business_id);
  const location=(await pool.query('SELECT * FROM owner_location_proposals WHERE business_id=$1',[owner.business_id])).rows[0];
  const profile=(await pool.query('SELECT * FROM business_discovery_profiles WHERE business_id=$1',[owner.business_id])).rows[0];
  assert.equal(location.place_id,expectedPlace.id);assert.equal(location.city,expectedPlace.name);assert.equal(location.reviewed_version,expectedReviewedVersion);
  assert.equal(profile.city,expectedPlace.name);
  if(expectedPoint){
    assert.equal(location.location_mode,'storefront');
    const savedLatitude=Number(location.latitude),savedLongitude=Number(location.longitude);
    assert.equal(Number(profile.latitude),savedLatitude);assert.equal(Number(profile.longitude),savedLongitude);
    // The accessible status rounds to five decimals; the DB retains the full map point.
    assert.equal(Number(savedLatitude.toFixed(5)),expectedPoint.latitude);assert.equal(Number(savedLongitude.toFixed(5)),expectedPoint.longitude);
  }else{
    assert.equal(location.location_mode,'area');assert.equal(location.latitude,null);assert.equal(location.longitude,null);
    assert.equal(Number(profile.latitude),Math.round(expectedPlace.latitude*10)/10);
    assert.equal(Number(profile.longitude),Math.round(expectedPlace.longitude*10)/10);
  }
  assert.equal((await pool.query('SELECT status FROM businesses WHERE id=$1',[owner.business_id])).rows[0].status,'draft');
  return owner.business_id;
}
function captureErrors(page){
  page.on('console',message=>{if(message.type()==='error'&&message.text().includes('Unexpected text node'))renderErrors.push(message.text());});
  page.on('pageerror',error=>renderErrors.push(error.message));
}
async function chooseMapPoint(page,name){
  const map=page.getByTestId('owner-location-map');
  await map.scrollIntoViewIfNeeded();await map.waitFor({state:'visible'});
  await expect(page.getByText('Customers will see this exact public location.',{exact:true})).toBeVisible();
  await expect(page.getByRole('status').filter({hasText:'Tap the map to place the storefront pin.'})).toBeVisible();
  await page.screenshot({path:`${output}/${name}-map-before-pin.png`,fullPage:true,style:'nextjs-portal {visibility:hidden}'});
  const box=await map.boundingBox();assert.ok(box);
  await map.click({position:{x:Math.round(box.width*.52),y:Math.round(box.height*.48)}});
  const status=page.getByRole('status').filter({hasText:'Exact location selected:'});
  await expect(status).toBeVisible();
  const match=/Exact location selected:\s*(-?\d+\.\d+),\s*(-?\d+\.\d+)/.exec((await status.textContent())||'');assert.ok(match,'Map tap exposes selected coordinates for review.');
  const selected={latitude:Number(match[1]),longitude:Number(match[2])};
  assert.ok(Number.isFinite(selected.latitude)&&Math.abs(selected.latitude)<=90&&Number.isFinite(selected.longitude)&&Math.abs(selected.longitude)<=180);
  await page.screenshot({path:`${output}/${name}-map-pin-selected.png`,fullPage:true,style:'nextjs-portal {visibility:hidden}'});
  return selected;
}

try{
  const web=await identity(),cookies=[],magic=await admin.auth.admin.generateLink({type:'magiclink',email:web.email});
  const auth=createServerClient(provider,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:value=>cookies.push(...value)}});
  assert.equal((await auth.auth.verifyOtp({email:web.email,token:magic.data.properties.email_otp,type:'email'})).error,null);
  const context=await newReviewContext({width:390,height:900});
  await context.addCookies(cookies.map(({name,value})=>({name,value,url:base,sameSite:'Lax'})));
  const page=await context.newPage();captureErrors(page);page.setDefaultNavigationTimeout(60000);await page.goto(base+'/request');
  await page.locator('#signup-name').fill('Map Review Owner');await page.locator('#signup-business').fill('Map Review Workshop');
  await page.locator('#signup-handle').fill('map-review-'+crypto.randomUUID().slice(0,8));await page.locator('#signup-category').selectOption('home-living');
  await page.locator('#signup-phone').fill('+251911002244');await page.locator('#signup-country').selectOption('ET');await page.locator('[name=consent]').check();
  await expect(page.getByRole('button',{name:'Finish setup',exact:true})).toBeDisabled();
  await page.locator('#signup-city').fill('Hawassa');await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible();
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await page.screenshot({path:`${output}/web-city-results-${width}.png`,fullPage:true,style:'nextjs-portal {visibility:hidden}'});
  }
  await page.getByRole('listbox').getByRole('option').first().click();
  await expect(page.getByRole('button',{name:'Finish setup',exact:true})).toBeEnabled();
  await page.getByRole('radio',{name:'Show on map',exact:true}).check();
  await expect(page.getByRole('button',{name:'Finish setup',exact:true})).toBeDisabled();
  let pin=await chooseMapPoint(page,'web-signup');
  await page.locator('#signup-city').fill('Hawas');
  await expect(page.getByRole('button',{name:'Finish setup',exact:true})).toBeDisabled();
  await expect(page.getByTestId('owner-location-map')).toHaveCount(0);
  await page.locator('#signup-city').fill('Hawassa');await page.getByRole('listbox').getByRole('option').first().click();
  await expect(page.getByRole('status').filter({hasText:'Tap the map to place the storefront pin.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Finish setup',exact:true})).toBeDisabled();
  pin=await chooseMapPoint(page,'web-signup-city-reset');
  await page.setViewportSize({width:1440,height:900});
  const signupResponse=page.waitForResponse(r=>new URL(r.url()).pathname==='/api/signup'&&r.request().method()==='POST');
  await page.getByRole('button',{name:'Finish setup',exact:true}).click();assert.equal((await signupResponse).status(),201);
  await expect(page).toHaveURL(/dashboard\/page-editor\?view=preview/);const webBusinessId=await verifyLocation(web.id,place,pin);
  await page.screenshot({path:`${output}/web-private-preview.png`,style:'nextjs-portal {visibility:hidden}'});
  checks.push({platform:'web',signupCity:place.name,exactPinPersisted:true,cityChangeClearsPin:true,privatePreview:true});

  await page.goto(`${base}/dashboard/business?edit=details`);await expect(page.locator('#owner-city')).toBeVisible();
  await page.locator('#owner-city').fill('Addis Ababa');await expect(page.getByRole('listbox').getByRole('option').first()).toBeVisible();
  await page.getByRole('listbox').getByRole('option').first().click();
  await expect(page.getByRole('status').filter({hasText:'Tap the map to place the storefront pin.'})).toBeVisible();
  await expect(page.getByRole('button',{name:'Save business details',exact:true})).toBeDisabled();
  await page.screenshot({path:`${output}/web-owner-city-change-clears-pin.png`,fullPage:true,style:'nextjs-portal {visibility:hidden}'});
  for(const width of [1440,390,320]){
    await page.setViewportSize({width,height:900});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    if(width!==320)await page.screenshot({path:`${output}/web-owner-map-${width}.png`,fullPage:true,style:'nextjs-portal {visibility:hidden}'});
  }
  await page.setViewportSize({width:390,height:900});
  const ownerPin=await chooseMapPoint(page,'web-owner-edit');
  await page.getByRole('button',{name:'Save business details',exact:true}).click();
  await expect(page).toHaveURL(/dashboard\/business\?saved=1/);await verifyLocation(web.id,otherPlace,ownerPin,2);
  checks.push({platform:'web owner edit',cityChanged:otherPlace.name,oldPinCleared:true,newExactPinPersisted:true});
  assert.ok(webBusinessId>0);await context.close();

  const native=await identity(),nativeContext=await newReviewContext({width:390,height:844}),mobile=await nativeContext.newPage();
  captureErrors(mobile);mobile.setDefaultNavigationTimeout(90000);await mobile.goto(`${expo}/account`);
  await mobile.getByRole('textbox',{name:'Email',exact:true}).fill(native.email);await mobile.getByRole('button',{name:'Continue with email',exact:true}).click();
  await expect(mobile.getByRole('textbox',{name:'Verification code',exact:true})).toBeVisible();
  const otp=await admin.auth.admin.generateLink({type:'magiclink',email:native.email});
  await mobile.getByRole('textbox',{name:'Verification code',exact:true}).fill(otp.data.properties.email_otp);await mobile.getByRole('button',{name:'Verify code',exact:true}).click();
  await expect(mobile.getByRole('textbox',{name:'Your name',exact:true})).toBeVisible();
  await expect(mobile.getByRole('textbox',{name:'Business city',exact:true})).toHaveAttribute('placeholder','Search a city or town');
  await mobile.evaluate(()=>{history.pushState(null,'','/owner/setup');window.dispatchEvent(new PopStateEvent('popstate'));});
  await expect(mobile).toHaveURL(/owner\/setup$/);await expect(mobile.getByRole('textbox',{name:'Business city',exact:true})).toBeVisible();
  const cityPosition=await mobile.getByRole('textbox',{name:'Business city',exact:true}).boundingBox();
  const businessPosition=await mobile.getByRole('textbox',{name:'Business name',exact:true}).boundingBox();
  const handlePosition=await mobile.getByRole('textbox',{name:'Page handle',exact:true}).boundingBox();
  assert.ok(cityPosition&&businessPosition&&handlePosition&&businessPosition.y<cityPosition.y&&cityPosition.y<handlePosition.y);
  await mobile.getByRole('textbox',{name:'Your name',exact:true}).fill('Native Map Owner');await mobile.getByRole('textbox',{name:'Account phone',exact:true}).fill('+251911002255');
  await mobile.getByRole('textbox',{name:'Business name',exact:true}).fill('Native Map Workshop');await mobile.getByRole('textbox',{name:'Page handle',exact:true}).fill('native-map-'+crypto.randomUUID().slice(0,8));
  await mobile.getByRole('button',{name:'Furniture, art & building',exact:true}).click();await mobile.getByRole('button',{name:'I agree to the Terms and Privacy Policy',exact:true}).click();
  await mobile.getByRole('button',{name:'Choose a country',exact:true}).click();await mobile.getByRole('button',{name:'Ethiopia',exact:true}).click();
  await expect(mobile.getByRole('button',{name:'Create your business page',exact:true})).toBeDisabled();
  let failCity=true;await mobile.route('**/api/mobile/v1/places**',route=>failCity?(failCity=false,route.fulfill({status:503,json:{error:'Please try again.'}})):route.continue());
  await mobile.getByRole('textbox',{name:'Business city',exact:true}).fill('Hawassa');
  await expect(mobile.getByText('City search is unavailable. Try again.',{exact:true})).toBeVisible();await mobile.getByRole('button',{name:'Try again',exact:true}).click();
  await mobile.getByRole('button',{name:`${place.name}, ${place.region}`,exact:true}).waitFor();await mobile.getByRole('textbox',{name:'Business city',exact:true}).scrollIntoViewIfNeeded();
  await mobile.screenshot({path:`${output}/expo-city-results.png`});await mobile.getByRole('button',{name:`${place.name}, ${place.region}`,exact:true}).click();
  await mobile.getByRole('radio',{name:'Show on map',exact:true}).click();
  await expect(mobile.getByRole('button',{name:'Create your business page',exact:true})).toBeDisabled();
  let nativePin=await chooseMapPoint(mobile,'expo-signup');
  await mobile.getByRole('textbox',{name:'Business city',exact:true}).fill('Hawas');
  await expect(mobile.getByRole('button',{name:'Create your business page',exact:true})).toBeDisabled();
  await mobile.getByRole('textbox',{name:'Business city',exact:true}).fill('Hawassa');await mobile.getByRole('button',{name:`${place.name}, ${place.region}`,exact:true}).click();
  await expect(mobile.getByRole('status').filter({hasText:'Tap the map to place the storefront pin.'})).toBeVisible();
  await expect(mobile.getByRole('button',{name:'Create your business page',exact:true})).toBeDisabled();
  nativePin=await chooseMapPoint(mobile,'expo-signup-city-reset');
  for(const width of [390,320]){
    await mobile.setViewportSize({width,height:844});assert.ok(await mobile.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
    await mobile.screenshot({path:`${output}/expo-pin-phone-${width}.png`,fullPage:true});
  }
  await mobile.getByRole('button',{name:'Create your business page',exact:true}).click();await expect(mobile).toHaveURL(/owner\/page/);
  await verifyLocation(native.id,place,nativePin);await expect(mobile.getByRole('button',{name:'Edit',exact:true})).toBeVisible();
  await mobile.screenshot({path:`${output}/expo-private-preview.png`});
  checks.push({platform:'Expo mobile preview',signupCity:place.name,exactPinPersisted:true,cityChangeClearsPin:true,privatePreview:true});
  await nativeContext.close();

  for(const fixture of tileFixtures){fixture.assertNoExternalRequests();assert.ok(fixture.servedCount()>0);}
  assert.deepEqual(renderErrors,[],'Signup and exact-pin workflows must not emit React render errors.');
  fs.writeFileSync(`${output}/verified.json`,JSON.stringify({checks,mapFixture:MAP_TILE_FIXTURE_ID,fulfilledTileRequests:tileFixtures.map(fixture=>fixture.servedCount()),uncontrolledTileRequests:0,existingBusinessesChanged:0,renderErrors},null,2));
  console.log('PASS web and Expo city selection, exact public map pin, city-change invalidation, server persistence and owner map edit.');
}finally{
  for(const providerId of identities){const row=(await pool.query('SELECT u.business_id FROM users u JOIN auth_identity_links i ON i.user_id=u.id WHERE i.provider_user_id=$1',[providerId])).rows[0];if(row&&!businesses.includes(row.business_id))businesses.push(row.business_id);}
  for(const id of businesses){await pool.query('DELETE FROM audit_logs WHERE business_id=$1',[id]);await pool.query('DELETE FROM owner_page_publications WHERE business_id=$1',[id]);await pool.query('DELETE FROM owner_page_events WHERE business_id=$1',[id]);await pool.query('DELETE FROM businesses WHERE id=$1',[id]);}
  for(const id of identities)await admin.auth.admin.deleteUser(id);
  await browser.close();await pool.end();
}
