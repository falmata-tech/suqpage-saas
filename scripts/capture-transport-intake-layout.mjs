import assert from 'node:assert/strict';
import {TRANSPORT_COPY} from '../lib/i18n/transport-copy.ts';
import fs from 'node:fs';
import {chromium,expect} from '@playwright/test';
import {createUiText,languageNames} from '../lib/i18n/core.ts';
const dir=process.env.SUQPAGE_CAPTURE_DIR||'.local/transport-intake-layout';fs.mkdirSync(dir,{recursive:true});
const browser=await chromium.launch(),shots=[];
const short=process.argv.includes('--short');
async function pair(a,b){const [x,y]=await Promise.all([a.boundingBox(),b.boundingBox()]);assert.ok(x&&y);assert.ok(Math.abs(x.y-y.y)<3,'Fields share a row');assert.ok(y.x>=x.x+x.width+5,'Paired fields do not overlap');assert.ok(x.height>=44&&y.height>=44,'Touch-sized fields');}
const clients=process.argv.includes('--native')?[true]:process.argv.includes('--web')?[false]:[false,true];
try{for(const native of clients)for(const [width,locale,height] of (short?[[390,'en',480]]:[...(native?[[390,'en'],[320,'en']]:[[1440,'en'],[390,'en'],[320,'en']]),...[ 'am','om','so','ti'].map(l=>[320,l])])){
 console.log(`Checking ${native?'mobile':'web'} ${width} ${locale}`);
 const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
 const context=await browser.newContext({viewport:{width,height:height||(width===1440?1000:844)}});const p=await context.newPage();p.setDefaultTimeout(20000);
 if(native){await p.goto('http://localhost:8082/buying',{waitUntil:'domcontentloaded'});if(locale!=='en'){await p.getByRole('button',{name:'Language',exact:true}).click();await p.getByRole('radio',{name:languageNames[locale],exact:true}).click();if(await p.getByRole('button',{name:t('Close'),exact:true}).last().isVisible()) await p.getByRole('button',{name:t('Close'),exact:true}).last().click();await expect(p.getByRole('button',{name:t('Close'),exact:true})).toHaveCount(0);}}
 else {await context.addCookies([{name:'suqpage-language',value:locale,url:'http://127.0.0.1:3102'}]);await p.goto('http://127.0.0.1:3102/about',{waitUntil:'domcontentloaded'});await p.locator('button[data-channel=buying]').click();}
 const field=label=>p.getByRole('textbox',{name:t(label),exact:true});const submit=p.getByRole('button',{name:t('Start chat'),exact:true});
 const intakeScope=native?p:p.getByRole('dialog');
 await expect(intakeScope.getByText(t('Live Chat'),{exact:true})).toBeVisible();
 await expect(p.getByText(t(TRANSPORT_COPY.description),{exact:true})).toBeVisible();
 await expect(p.getByText(t(TRANSPORT_COPY.invitation),{exact:true})).toBeVisible();await expect(field('From')).toHaveAttribute('placeholder',t('City or area'));
 await expect(field('From')).toBeVisible();await pair(field('From'),field('To'));await pair(field('Name'),field('Phone'));await expect(submit).toBeDisabled();
 await field('From').fill('Addis Ababa');await field('To').fill('Adama');await field('Name').fill('Review visitor');await field('Phone').fill('+251911223344');await expect(submit).toBeEnabled();
 await field('From').click();await field('From').press('ControlOrMeta+A');await field('From').press('Backspace');await expect(field('From')).toHaveValue('');await expect(submit).toBeDisabled();await field('From').fill('Addis Ababa');
 await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:`${dir}/${native?'mobile':'web'}-${width}-${locale}${short?'-short':''}.png`,style:'nextjs-portal {visibility:hidden}'});shots.push(`${native?'mobile':'web'}-${width}-${locale}${short?'-short':''}`);
 await submit.scrollIntoViewIfNeeded();assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));const box=await submit.boundingBox();assert.ok(box&&box.y+box.height<=p.viewportSize().height+1,'Start chat reachable');
 await context.close();
}fs.writeFileSync(dir+(short?'/verification-short.json':process.argv.includes('--native')?'/native-verification.json':process.argv.includes('--web')?'/web-verification.json':'/verification.json'),JSON.stringify({shots,checks:['route/contact pairs','no overlapping fields','44px targets','required fields enable chat without optional text',short?'English short viewport':'five locales','submit reachable, no page overflow'],native:'Expo browser; not physical device'},null,2));console.log('PASS paired transport intake: '+shots.length+' web/native-browser states');}finally{await browser.close();}
