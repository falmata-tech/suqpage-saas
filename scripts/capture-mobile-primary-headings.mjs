import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {chromium, expect} from '@playwright/test';
import {createUiText,languageNames as languages} from '../lib/i18n/core.ts';

// Real rendered React Native Web semantics; no API, auth or role mocks.
const base='http://localhost:8082';
const output=process.env.SUQPAGE_MOBILE_HEADINGS_REVIEW_DIR||'.local/mobile-primary-headings';
assert.ok(path.resolve(output).startsWith(path.resolve('.local')+path.sep));
fs.mkdirSync(output,{recursive:true,mode:0o700});
const catalogs=Object.fromEntries(Object.keys(languages).map(locale=>[locale,locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8'))]));
const text=Object.fromEntries(Object.entries(catalogs).map(([locale,messages])=>[locale,createUiText(messages)]));
const screens=[['market','/','Suqpage Market'],['featured','/featured','Daily Featured'],['login','/account','Your business. Your digital showroom.']];
const browser=await chromium.launch(),records=[],errors=[];
try{
 const context=await browser.newContext({viewport:{width:390,height:844}});
 await context.route('https://tile.openstreetmap.org/**',route=>route.abort());
 const page=await context.newPage();
 page.on('pageerror',error=>errors.push(error.message));
 for(const [screen,route,title] of screens){
  await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:60000});
  let current='en';
  for(const locale of Object.keys(languages)){
   if(locale!==current){
    await page.getByRole('button',{name:text[current]('Language'),exact:true}).click();
    await page.getByRole('radio',{name:languages[locale],exact:true}).click();
    await page.getByRole('button',{name:text[locale]('Close'),exact:true}).last().click();
    current=locale;
   }
   const expected=text[locale](title);
   await expect(page.getByRole('heading',{name:expected,exact:true})).toBeVisible({timeout:30000});
   const geometry=await page.evaluate(()=>({viewport:innerWidth,document:document.documentElement.scrollWidth}));
   assert.ok(geometry.document<=geometry.viewport+1,`${screen}/${locale} must not overflow`);
   await page.screenshot({path:path.join(output,`${screen}-${locale}-390.png`)});
   records.push({screen,route,locale,title:expected,headingVisible:true,geometry});
  }
 }
 assert.deepEqual(errors,[],'Primary heading navigation and language changes must not crash');
 await context.close();
 fs.writeFileSync(path.join(output,'verified.json'),JSON.stringify({passed:true,platform:'React Native Web',records,limits:'Verifies primary-title accessibility roles and phone overflow only. No native Android/TalkBack, API workflow or OS notification claim. OSM tiles aborted.'},null,2),{mode:0o600});
 console.log(`PASS FE_BASE: ${records.length} actual React Native Web primary headings across all five languages.`);
}finally{await browser.close();}
