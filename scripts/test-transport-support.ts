import assert from "node:assert/strict";
import crypto from "node:crypto";
import { getDb, closeDbForTests } from "./testing/postgres-fixture";
import { createPublicSupportConversation, getPublicSupportConversation, getSupportConversation, listSupportConversations, saveTransportHandoff, getTransportHandoff, closeSupportConversation, postSupportMessage, postPublicSupportMessage, closePublicSupportConversation, getPublicSupportAttachment, updateSupportAgentSetting, SupportError } from "../lib/support";
import { joinAssignedSupportConversation } from "./testing/support-join";
import type { SessionUser } from "../lib/types";

async function main() {
  const db = await getDb();
  delete process.env.SUQPAGE_TELEGRAM_BOT_TOKEN;
  delete process.env.SUQPAGE_TELEGRAM_SUPPORT_CHAT_ID;
  try {
    const inserted = await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('transport@example.test','x','Transport admin','admin',0)").run();
    const admin: SessionUser = {id:inserted.insertedId,email:"transport@example.test",name:"Transport admin",role:"admin",access_role:"platform_admin",business_id:null,must_change_password:0};
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(admin.id);
    const dispatcherId = (await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('transport-dispatcher@example.test','x','Transport dispatcher','admin',0)").run()).insertedId;
    const dispatcher: SessionUser = {id:dispatcherId,email:"transport-dispatcher@example.test",name:"Transport dispatcher",role:"admin",access_role:"team_member",business_id:null,must_change_password:0};
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'team_member')").run(dispatcher.id);
    await updateSupportAgentSetting(admin,{userId:dispatcher.id,enabled:true,queueScope:"transport"});
    const client = {...admin,role:"owner",access_role:"client",business_id:999} as SessionUser;
    const agent = {...admin,access_role:"team_member"} as SessionUser;
    const draft = {category:"shipment_observation",name:"Test name",phone:"+251 (911) 223-344",origin:"Addis Ababa",destination:"Adama",idempotencyKey:crypto.randomUUID()};
    for (const invalid of [{name:" "},{origin:" "},{destination:" "},{phone:"12"},{name:"x".repeat(81)},{origin:"x".repeat(121)},{destination:"x".repeat(121)}]) {
      await assert.rejects(()=>createPublicSupportConversation({...draft,...invalid},"invalid-ip"));
    }
    assert.equal(Number((await db.prepare("SELECT COUNT(*) n FROM support_conversations").get()).n),0);
    const token = crypto.randomBytes(32).toString("base64url");
    const [first, replay] = await Promise.all([createPublicSupportConversation(draft,"fixture",Date.now(),token),createPublicSupportConversation(draft,"fixture",Date.now(),token)]);
    assert.equal(first.id,replay.id);
    assert.notEqual(first.duplicate,replay.duplicate);
    for (const changed of [{name:"Other name"},{origin:"Bahir Dar"},{destination:"Dire Dawa"},{phone:"+251911223345"}]) {
      await assert.rejects(()=>createPublicSupportConversation({...draft,...changed},"fixture",Date.now(),token),/already open/);
    }
    const view = await getSupportConversation(admin,first.id);
    assert.equal(view.conversation.assignedUserId,dispatcher.id,"A persisted receiving transport agent gets the automatic assignment");
    assert.equal(view.conversation.agentJoined,false,"Reading an automatically assigned request never joins its agent");
    assert.equal(view.conversation.visitorEmail,null);
    assert.equal(view.conversation.visitorPhone,"+251911223344");
    assert.equal(view.conversation.requesterLabel,"Test name");
    assert.equal(view.conversation.transportOrigin,"Addis Ababa");
    assert.equal(view.conversation.transportDestination,"Adama");
    assert.equal(view.messages[0].body,"From: Addis Ababa\nTo: Adama");
    const help = await createPublicSupportConversation({category:"general",email:"Mixed@Example.Test",phone:draft.phone,message:"Help test",idempotencyKey:crypto.randomUUID()},"help-ip");
    assert.equal((await getSupportConversation(admin,help.id)).conversation.visitorEmail,"mixed@example.test");
    await assert.rejects(()=>createPublicSupportConversation({category:"general",phone:draft.phone,message:"Help",idempotencyKey:crypto.randomUUID()},"help-ip"),/email/);
    const handoff = {company:"Example Parcel",contact:"+251911000000",previousId:0};
    for(const denied of [client,agent]) {
      if (denied.access_role === "client") await assert.rejects(()=>listSupportConversations(denied,{queue:"transport"}));
      else assert.equal((await listSupportConversations(denied,{queue:"transport"})).totalItems,0);
      await assert.rejects(()=>saveTransportHandoff(denied,first.id,handoff));
      await assert.rejects(()=>getTransportHandoff(denied,first.id));
    }
    await assert.rejects(()=>getSupportConversation(client,first.id));
    await assert.rejects(()=>saveTransportHandoff(admin,help.id,handoff));
    await assert.rejects(()=>saveTransportHandoff(admin,first.id,{...handoff,company:" "}));
    const outcomes = await Promise.allSettled([
      saveTransportHandoff(admin,first.id,handoff),
      saveTransportHandoff(admin,first.id,{...handoff,company:"Another company"}),
    ]);
    assert.equal(outcomes.filter(r=>r.status==="fulfilled").length,1,"Only one concurrent assignment wins");
    const saved = (await getTransportHandoff(admin,first.id))!;
    assert.equal((await saveTransportHandoff(admin,first.id,{...saved,previousId:0})).id,saved.id,"identical replay creates no duplicate event");
    assert.equal(Number((await db.prepare("SELECT COUNT(*) n FROM support_events WHERE event_type='transport_handoff'").get()).n),1);
    assert.equal((await db.prepare("SELECT actor_user_id FROM support_events WHERE id=?").get(saved.id)).actor_user_id,admin.id);
    await postSupportMessage(admin,first.id,{message:'Private callback note',idempotencyKey:crypto.randomUUID()});
    const receipt = await getPublicSupportConversation(token);
    assert.deepEqual(receipt.messages.map(m=>m.body),["From: Addis Ababa\nTo: Adama"]);assert.equal(receipt.assignedUserName,null);
    assert.equal(receipt.agentJoined,false,"Private notes do not announce a staff Join");
    const replyState = () => db.prepare(`SELECT staff_joined_assignment_id,awaiting_participant_since,last_message_at,
      (SELECT COUNT(*) FROM support_messages WHERE conversation_id=?) messages,
      (SELECT COUNT(*) FROM support_events WHERE conversation_id=?) events,
      (SELECT COUNT(*) FROM attention_notifications WHERE conversation_id=?) notifications
      FROM support_conversations WHERE id=?`).get(first.id,first.id,first.id,first.id);
    const beforeDeniedReply = await replyState();
    for (const sender of [dispatcher,admin]) await assert.rejects(
      () => postSupportMessage(sender,first.id,{message:'Must Join before a public reply',audience:'reply',idempotencyKey:crypto.randomUUID()}),
      error => error instanceof SupportError && error.code === 'join_required',
    );
    assert.deepEqual(await replyState(),beforeDeniedReply,"Denied unjoined/inspecting-manager replies change no message, event, alert or customer-idle clock");
    const joinedAgent = await joinAssignedSupportConversation(admin,first.id);
    assert.equal(joinedAgent.id,dispatcher.id,"Explicit Join is performed by the actual current assignee");
    assert.equal((await getPublicSupportConversation(token)).agentJoined,true);
    assert.equal((await getPublicSupportConversation(token)).assignedUserName,dispatcher.name);
    await postSupportMessage(joinedAgent,first.id,{message:'Which day?',audience:'reply',idempotencyKey:crypto.randomUUID()});
    await postPublicSupportMessage(token,{message:'Tomorrow',idempotencyKey:crypto.randomUUID()},'live-transport');
    assert.deepEqual((await getPublicSupportConversation(token)).messages.map(m=>m.body),['From: Addis Ababa\nTo: Adama','Which day?','Tomorrow']);
    await closePublicSupportConversation(token);
    assert.equal((await getSupportConversation(admin,first.id)).conversation.resolvedAt,null);
    await postSupportMessage(admin,first.id,{message:'Call tomorrow',audience:'note',idempotencyKey:crypto.randomUUID()});
    const note=(await getSupportConversation(admin,first.id)).messages.at(-1)!;
    const attachment=await db.prepare("INSERT INTO support_attachments(message_id,storage_key,original_name,mime_type,byte_size,created_at) VALUES(?,?,'private.png','image/png',42,?)").run(note.id,`support-${crypto.randomUUID()}.png`,Date.now());
    await assert.rejects(()=>getPublicSupportAttachment(token,attachment.insertedId));
    assert.equal((await getSupportConversation(admin,first.id)).messages.at(-1)!.attachment!.id,attachment.insertedId);
    const publicView = JSON.stringify(await getPublicSupportConversation(token));
    assert.ok(!publicView.includes("Private callback note"));
    assert.ok(!publicView.includes(saved.company));
    assert.ok(!publicView.includes(saved.contact));
    await assert.rejects(()=>getPublicSupportConversation(crypto.randomBytes(32).toString("base64url")));
    await closeSupportConversation(admin,first.id);
    await assert.rejects(()=>saveTransportHandoff(admin,first.id,{...handoff,previousId:saved.id}),/Reopen/);
    for(let i=0;i<22;i++) await createPublicSupportConversation({...draft,idempotencyKey:crypto.randomUUID()},`pagination-${i}`);
    const page1 = await listSupportConversations(admin,{queue:"transport"});
    const page2 = await listSupportConversations(admin,{queue:"transport",page:2});
    assert.equal(page1.totalItems,23);
    assert.equal((await listSupportConversations(admin,{queue:"transport",status:"closed"})).items[0].transportCompany,saved.company);
    assert.ok(page1.items.length<=20);
    assert.ok(page2.items.length>0);
    assert.ok(page2.items.every(row=>!page1.items.some(other=>other.id===row.id)));
    assert.ok(page1.items.every(row=>row.assistanceCategory==="shipment_observation"));
    assert.equal((await listSupportConversations(admin,{queue:"transport",status:"closed",q:"Adama"})).totalItems,1);
    await assert.rejects(()=>db.prepare("UPDATE support_conversations SET visitor_email=NULL WHERE id=?").run(help.id));
    await assert.rejects(()=>db.prepare("UPDATE support_conversations SET transport_destination='' WHERE id=?").run(first.id));
    console.log("PASS transport intake, migration constraints, contacts, replay, pagination, search/status, persisted staff authority, current-assignee explicit Join, unchanged denied replies, role/tenant isolation, concurrent audited handoff and private projection.");
  } finally { await closeDbForTests(); }
}
main().catch(error=>{console.error(error);process.exitCode=1;});
