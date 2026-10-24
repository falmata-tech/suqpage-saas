import assert from "node:assert/strict";
import fs from "node:fs";
import crypto from "node:crypto";
import * as support from "../lib/support";
import type { SessionUser } from "../lib/types";
import { chromium, expect } from "@playwright/test";
import { NextRequest } from "next/server";
import { getDb, closeDbForTests } from "./testing/postgres-fixture";
import { GET, POST, DELETE } from "../app/api/public-support/route";

async function main() {
  const base = process.env.SUQPAGE_TEST_BASE_URL || "http://127.0.0.1:3102";
  assert.ok(["localhost","127.0.0.1"].includes(new URL(base).hostname));
  const db = await getDb();
  process.env.NEXT_PUBLIC_APP_URL = base;
  process.env.SUQPAGE_TELEGRAM_BOT_TOKEN = "";
  process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID = "";
  const staffRow = await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('live-capture@example.test','unused','MirtPage transport team','admin',0)").run();
  await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'operations_manager')").run(staffRow.insertedId);
  const staff: SessionUser = {id:staffRow.insertedId,email:'live-capture@example.test',name:'MirtPage transport team',role:'admin',access_role:'operations_manager',business_id:null,must_change_password:0};
  await support.updateSupportAgentSetting(staff,{userId:staff.id,enabled:true,maxOpenConversations:10,queueScope:'transport'});
  const dir = ".local/live-buying-review";
  fs.mkdirSync(dir,{recursive:true});
  const browser = await chromium.launch();
  try {
    for(const width of process.argv.includes("--phone-only") ? [390] : [1440,390,320]) {
      const page = await browser.newPage({viewport:{width,height:width===320?640:900}});
      let failure:unknown; let requests=0; let loseResponse=width===1440; let failLoad=width===390;
      await page.route("**/api/public-support?**",async route=>{
        try {
          requests++;
          const req=route.request();
          if(req.method()==="GET" && failLoad){failLoad=false;await route.fulfill({status:503,json:{error:"Fixture unavailable"}});return;}
          const headers=await req.allHeaders();
          headers["x-forwarded-for"]=`198.51.100.${width===1440?10:width===390?11:12}`;
          const raw=req.postDataBuffer();
          const incoming=new NextRequest(req.url(),{method:req.method(),headers,...(raw?{body:new Uint8Array(raw)}:{})});
          const response=await(req.method()==="GET"?GET(incoming):req.method()==="DELETE"?DELETE(incoming):POST(incoming));
          if(req.method()==="POST" && loseResponse){loseResponse=false;await route.abort();return;}
          await route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:await response.text()});
        } catch(error) { failure=error; await route.fulfill({status:500,json:{error:"Fixture failed"}}); }
      });
      await page.goto(base+"/about");
      await page.locator('.public-support-launcher button[data-channel="buying"]').click();
      const dialog=page.getByRole("dialog");
      assert.equal(await dialog.locator('[aria-pressed]').count(),0,"No channel switch inside chat");
      await expect(dialog.getByText("Live chat",{exact:true})).toBeVisible();
      await expect(dialog.getByRole("heading",{name:"What can we help you with?"})).toBeVisible();
      await expect(dialog.getByLabel("Name",{exact:true})).toBeVisible();
      assert.equal(await dialog.locator("input[type=radio], select").count(),0);
      await expect(dialog.getByLabel("Email",{exact:true})).toHaveCount(0);
      await expect(dialog.getByLabel("Your message",{exact:true})).toBeVisible();
      await dialog.getByLabel("Name",{exact:true}).fill("Demo customer");
      await dialog.getByLabel("Phone",{exact:true}).fill("+447700900999");
      await dialog.getByLabel("Your message",{exact:true}).fill("Please buy the listed table in Addis Ababa.");
      const submit=dialog.getByRole("button",{name:"Start chat",exact:true});
      if(width===390){await expect(submit).toBeDisabled();await dialog.getByRole("button",{name:"Retry",exact:true}).click();}
      await expect(submit).toBeEnabled();
      assert.ok(await submit.locator("span").evaluate(el=>el.getBoundingClientRect().width>50),"Buying request label must be visually readable");
      assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      const box=await submit.boundingBox();
      await submit.scrollIntoViewIfNeeded();
      assert.ok(box, "Submit is reachable");
      await page.screenshot({path:`${dir}/intake-${width}.png`});
      await submit.click();
      if(width===1440) {
        await expect(dialog.getByRole('alert')).toBeVisible();
        await dialog.locator('header button').click();
        await page.locator('button[data-channel=buying]').click();
      }
      await expect(dialog.getByRole('log')).toContainText('Please buy the listed table in Addis Ababa.');
      await expect(dialog.getByRole('status')).toContainText('Waiting for a live agent at SharedTrucks Logistics');
      await expect(dialog.getByText('Replies appear here automatically. You can return to this chat in this browser.')).toBeVisible();
      await page.screenshot({path:`${dir}/waiting-${width}.png`,style:'nextjs-portal {visibility:hidden}'});
      await expect(dialog.getByRole('status')).toContainText('Chat connected');
      await expect(dialog.getByRole('log').getByText('Sent',{exact:true})).toBeVisible();
      const id=Number((await db.prepare('SELECT MAX(id) id FROM support_conversations').get()).id);
      await support.postSupportMessage(staff,id,{message:'Internal supplier margin — never public',idempotencyKey:crypto.randomUUID()});
      await support.postSupportMessage(staff,id,{message:'We can help. Which size do you need?',audience:'reply',idempotencyKey:crypto.randomUUID()});
      await expect(dialog.getByRole('log')).toContainText('Which size do you need?',{timeout:15000});
      await expect(dialog).not.toContainText('Internal supplier margin');
      await expect(dialog.getByRole('status')).toContainText('Assigned to MirtPage transport team');
      await expect(dialog).not.toContainText('Replies appear here automatically.');
      if(width===390){failLoad=true;await expect(dialog.getByRole('status')).toContainText('Connection interrupted. Retrying…',{timeout:15000});await expect(dialog.getByRole('status')).not.toContainText('Connection interrupted. Retrying…',{timeout:20000});}
      if(width===390)loseResponse=true;
      await dialog.getByLabel('Reply',{exact:true}).fill('The large one, please.');
      await dialog.getByRole('button',{name:'Send',exact:true}).click();
      if(width===390){await expect(dialog.getByRole('alert')).toBeVisible();await expect(dialog.getByLabel('Reply',{exact:true})).toHaveValue('The large one, please.');await dialog.getByRole('button',{name:'Send',exact:true}).click();}
      await expect(dialog.getByRole('log')).toContainText('The large one, please.');
      await expect(dialog.getByLabel('Reply',{exact:true})).toHaveValue('');
      assert.equal((await support.getSupportConversation(staff,id)).messages.length,4);
      await page.screenshot({path:`${dir}/conversation-${width}.png`,style:"nextjs-portal {visibility:hidden}"});
      if(width===390) {
        for(const locale of ['am','om','so','ti']) {
          await page.context().addCookies([{name:'suqpage-language',value:locale,url:base}]);
          await page.reload();await page.locator('button[data-channel=buying]').click();
          await expect(dialog.getByRole('log')).toContainText('The large one, please.');
          assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1),`Chat overflow: ${locale}`);
          await page.screenshot({path:`${dir}/conversation-${width}-${locale}.png`,style:'nextjs-portal {visibility:hidden}'});
        }
        await page.context().addCookies([{name:'suqpage-language',value:'en',url:base}]);
        await page.reload();await page.locator('button[data-channel=buying]').click();
      }
      assert.ok(await dialog.evaluate(el=>el.scrollWidth<=el.clientWidth+1));
      const replyBox=await dialog.getByRole('button',{name:'Send',exact:true}).boundingBox();
      assert.ok(replyBox && replyBox.y+replyBox.height<=page.viewportSize()!.height,'Composer remains reachable');
      await dialog.locator('header button').click();
      await page.waitForTimeout(400);const before=requests;await page.waitForTimeout(5300);assert.equal(requests,before,'Hidden dialog does not poll');
      assert.equal((await support.getSupportConversation(staff,id)).conversation.status,'open','Dismiss does not end chat');
      await page.locator('button[data-channel=buying]').click();
      await expect(dialog.getByRole('log')).toContainText('The large one, please.');
      if(width===1440)loseResponse=true;
      await dialog.getByRole('button',{name:'End chat',exact:true}).click();
      await expect(dialog.getByRole('status')).toContainText('Closed',{timeout:15000});
      assert.equal((await support.getSupportConversation(staff,id)).conversation.status,'closed');
      assert.equal(Number((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE conversation_id=? AND detail='visitor ended conversation'").get(id)).n),1);
      await expect(dialog.locator('textarea')).toHaveCount(0);
      await support.reopenSupportConversation(staff,id);
      await expect(dialog.getByLabel('Reply',{exact:true})).toBeVisible({timeout:15000});
      await dialog.getByRole('button',{name:'End chat',exact:true}).click();
      await expect(dialog.getByRole('button',{name:'Send another request',exact:true})).toBeVisible({timeout:15000});
      await dialog.getByRole('button',{name:'Send another request',exact:true}).click();
      await expect(dialog.getByLabel('Your message',{exact:true})).toHaveValue('');
      // Locale reloads recover the conversation, not unsaved contact form state.
      await dialog.getByLabel('Name',{exact:true}).fill('Demo customer');
      await dialog.getByLabel('Phone',{exact:true}).fill('+447700900999');
      await dialog.getByLabel('Your message',{exact:true}).fill('Check the table finish before collection.');
      await dialog.getByRole('button',{name:'Start chat',exact:true}).click();
      await expect(dialog.getByRole('log')).toContainText('Check the table finish before collection.');
      await page.reload();await page.locator('button[data-channel=buying]').click();await expect(page.getByRole('dialog').getByRole('log')).toContainText('Check the table finish before collection.');
      assert.equal(failure,undefined);
      await page.close();
    }
    assert.equal(Number((await db.prepare("SELECT COUNT(*) n FROM support_conversations WHERE assistance_category='buying_assistance' AND visitor_email IS NULL").get()).n),process.argv.includes('--phone-only')?2:6);
    console.log("PASS selected buying form viewports: name/phone/details without service choices, no email/route fields, persisted details, live private replies, bounded refresh, hidden-dialog suspension, closed/reopen updates, lost-response recovery and another-request persistence. Isolated database; no messages sent externally.");
  } finally { await browser.close(); await closeDbForTests(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
