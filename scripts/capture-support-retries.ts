import assert from 'node:assert/strict';
import {chromium,expect} from '@playwright/test';
import {NextRequest} from 'next/server';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {GET,POST,DELETE} from '../app/api/public-support/route';

// The real UI and route handlers run against isolated PostgreSQL. Only transport
// is intercepted, so a response can be lost after its transaction commits.
async function main(){
 const base=process.env.SUQPAGE_TEST_BASE_URL||'http://127.0.0.1:3102';
 assert.ok(['127.0.0.1','localhost'].includes(new URL(base).hostname));
 const db=await getDb();
 process.env.NEXT_PUBLIC_APP_URL=base; // Match the local launcher's trusted origin.
 process.env.SUQPAGE_TELEGRAM_BOT_TOKEN='';process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID='';
 const browser=await chromium.launch();
 try{
  const page=await browser.newPage({viewport:{width:390,height:844}});
  let failLoad=true,loseResponse=false;const keys:string[]=[];let routeFailure:unknown;
  await page.route('**/api/public-support',async route=>{
   try {
   const request=route.request();const method=request.method();
   if(method==='GET'&&failLoad){failLoad=false;await route.fulfill({status:503,json:{error:'Fixture unavailable'}});return;}
   const headers=await request.allHeaders();const raw=request.postDataBuffer();
   const incoming=new NextRequest(request.url(),{method,headers,...(raw?{body:new Uint8Array(raw)}:{})});
   if(method==='POST'&&headers['content-type']?.startsWith('multipart/')){const form=await incoming.clone().formData();keys.push(String(form.get('idempotencyKey')));}
   const response=await(method==='GET'?GET(incoming):method==='DELETE'?DELETE(incoming):POST(incoming));
   if(method==='POST'&&loseResponse){loseResponse=false;assert.ok(response.ok,`Commit must succeed before response loss: ${response.status} ${await response.clone().text()}`);await route.abort('failed');return;}
   await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
   }catch(error){routeFailure=error;await route.fulfill({status:500,json:{error:'Test transport failed'}});}
  });
  await page.goto(base+'/about');await page.getByRole('button',{name:'Get help',exact:true}).click();
  await expect(page.getByRole('button',{name:'Retry',exact:true})).toBeVisible();
  await page.getByLabel('Email',{exact:true}).fill('retry@example.test');await page.getByLabel('Phone',{exact:true}).fill('+447700900999');await page.getByLabel('Your message',{exact:true}).fill('Fixture first message');
  await expect(page.getByRole('button',{name:'Send',exact:true})).toBeDisabled();
  await page.getByRole('button',{name:'Retry',exact:true}).click();await expect(page.getByRole('button',{name:'Send',exact:true})).toBeEnabled();
  const cookies=await page.context().cookies();assert.ok(cookies.some(cookie=>cookie.name==='suqpage_public_support'&&cookie.httpOnly),'Prepared HttpOnly cookie');
  loseResponse=true;await page.getByRole('button',{name:'Send',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();
  // Reopening can recover a committed start even when its response never arrived.
  await page.getByRole('button',{name:'Close support',exact:true}).click();await page.getByRole('button',{name:'Get help',exact:true}).click();
  await expect(page.locator('.public-support-thread')).toContainText('Fixture first message');await page.getByRole('button',{name:'Send',exact:true}).click();await expect(page.getByLabel('Reply',{exact:true})).toHaveValue('');
  assert.equal(keys[0],keys[1]);assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM support_messages').get()).n),1);
  await page.getByLabel('Reply',{exact:true}).fill('Fixture second message');loseResponse=true;await page.getByRole('button',{name:'Send',exact:true}).click();await expect(page.getByRole('alert')).toBeVisible();await page.getByRole('button',{name:'Send',exact:true}).click();await expect(page.getByLabel('Reply',{exact:true})).toHaveValue('');
  assert.equal(keys[2],keys[3]);assert.notEqual(keys[0],keys[2]);assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM support_messages').get()).n),2);
  assert.equal(Number((await db.prepare('SELECT COUNT(*) n FROM support_conversations').get()).n),1);
  page.on('dialog',dialog=>dialog.accept());await page.getByRole('button',{name:'End chat',exact:true}).click();await expect(page.getByText('Conversation closed',{exact:true})).toBeVisible();await page.getByRole('button',{name:'Start another chat',exact:true}).click();await expect(page.getByLabel('Your message',{exact:true})).toBeVisible();
  assert.equal(routeFailure,undefined);
  console.log('PASS real UI + API handlers + isolated PostgreSQL: failed load/Retry, HttpOnly preparation, lost start/reopen/replay, lost reply/replay, unchanged counts, close/new chat. External notifications disabled; transport intercepted.');
 }finally{await browser.close();await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
