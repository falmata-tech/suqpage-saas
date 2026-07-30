import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import sharp from "sharp";

async function main() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "suqpage-requests-"));
  process.env.SUQPAGE_DB_PATH = path.join(root, "requests.db");
  process.env.SUQPAGE_MEDIA_ROOT = path.join(root, "media");
  process.env.PRIVACY_SALT = "request-test-privacy-salt-long-enough";

  const { getDb, getUserById, closeDbForTests } = await import("../lib/db");
  const { FileRequestAttachmentStore, resolveRequestAttachment } = await import("../lib/request-media");
  const { addRequestClarification, SqliteRequestRepository, getRequestDetail, updateRequestStatus } = await import("../lib/request-sqlite");
  const { createPublicInterest } = await import("../lib/request-service");
  const { RequestError } = await import("../lib/request-domain");
  const { canManageBusiness, canViewBusiness } = await import("../lib/capabilities");
  const { createAuthenticatedClientRequest } = await import("../lib/client-request-service");
  const { createClientInvitation, getActiveInvitation, hashInvitationToken, InvitationError, redeemClientInvitation } = await import("../lib/invitations");
  const { canAccessRequest, listAssignedRequests, listClientRequests } = await import("../lib/request-sqlite");
  const { createOnBehalfRequest } = await import("../lib/on-behalf-request-service");
  const { assignRequestToTeamMember, createStaffAccount, listAssignedBusinesses, listManagedClients } = await import("../lib/staff-operations");
  const { presentRequestEvent } = await import("../lib/request-presentation");
  const repository = new SqliteRequestRepository();
  const attachments = new FileRequestAttachmentStore();
  const allowedRate = { consume: () => ({ allowed: true, retryAfterSeconds: 0 }) };
  const input = {
    contactName: "Amina Client",
    contactValue: "+251 911 000 000",
    businessName: "Amina Market",
    requestText: "Please build a warm showroom for my handmade products.",
    idempotencyKey: "request_test_key_123456",
    consent: true,
  };
  const png = await sharp({ create: { width: 3, height: 2, channels: 4, background: { r: 42, g: 90, b: 120, alpha: 1 } } }).png().toBuffer();
  const image = { originalName: "../private\u0000-reference.png", claimedType: "image/png", bytes: png };

  try {
    const adminId = Number(getDb().prepare("INSERT INTO users(email,password_hash,name,role) VALUES('request-admin@test.local','unused','Request Admin','admin')").run().lastInsertRowid);
    const first = await createPublicInterest(input, "ip-a", { repository, rateLimiter: allowedRate });
    assert.equal(first.duplicate, false);
    assert.match(first.publicRef, /^REQ-[A-F0-9]{12}$/);
    const detail = getRequestDetail(first.id);
    assert.ok(detail);
    assert.equal(detail.request_text, input.requestText);
    assert.equal(detail.attachments.length, 0);
    assert.equal(detail.events.length, 1);
    assert.equal(detail.events[0].event_type, "submitted");
    assert.equal(resolveRequestAttachment("../requests.db"), null);

    const duplicate = await createPublicInterest(input, "ip-a", { repository, rateLimiter: { consume: () => { throw new Error("duplicate must bypass rate limiting"); } } });
    assert.equal(duplicate.duplicate, true);
    assert.equal(duplicate.id, first.id);
    assert.equal((getDb().prepare("SELECT COUNT(*) count FROM service_requests").get() as { count: number }).count, 1);
    assert.equal((getDb().prepare("SELECT COUNT(*) count FROM request_attachments").get() as { count: number }).count, 0);
    assert.equal(fs.readdirSync(path.join(root, "media", "requests")).length, 0);
    assert.throws(() => getDb().prepare("INSERT INTO request_attachments(request_id,storage_key,original_name,mime_type,byte_size,width,height) VALUES(?,?,?,?,?,?,?)").run(first.id,"11111111-1111-4111-8111-111111111111.png","blocked.png","image/png",1,1,1), /public interest requests cannot have attachments/);

    const stored = await attachments.save(image);
    assert.equal(stored.originalName, "private-reference.png");
    const attachmentPath = resolveRequestAttachment(stored.storageKey);
    assert.ok(attachmentPath && fs.existsSync(attachmentPath));
    attachments.remove([stored.storageKey]);

    updateRequestStatus(first.id, "under_review", adminId);
    assert.equal(getRequestDetail(first.id)?.status, "under_review");
    assert.throws(() => updateRequestStatus(first.id, "published", adminId), RequestError);
    assert.equal(getRequestDetail(first.id)?.events.length, 2);

    const firstToken = "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
    const secondToken = "BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB";
    const invitation = createClientInvitation({ requestId:first.id, clientName:"Amina Client", email:"amina@example.test", businessName:"Amina Market", handle:"amina-market", designKey:"homevibe", actorUserId:adminId }, { now:1_000_000, token:firstToken });
    assert.equal(getActiveInvitation(firstToken,1_000_001)?.business_name,"Amina Market");
    const storedInvitation = getDb().prepare("SELECT token_hash FROM client_invitations WHERE id=?").get(invitation.invitationId) as {token_hash:string};
    assert.equal(storedInvitation.token_hash,hashInvitationToken(firstToken));
    assert.notEqual(storedInvitation.token_hash,firstToken);
    createClientInvitation({ requestId:first.id, clientName:"Amina Client", email:"amina@example.test", businessName:"Amina Market", handle:"amina-market", designKey:"homevibe", actorUserId:adminId }, { now:1_000_100, token:secondToken });
    assert.equal(getActiveInvitation(firstToken,1_000_101),undefined);
    assert.ok(getActiveInvitation(secondToken,1_000_101));
    const redeemed = redeemClientInvitation({token:secondToken,name:"Amina Client",password:"ClientPassword123!"},1_000_200);
    const client = getDb().prepare(`SELECT u.id,u.email,u.name,u.role,u.business_id,u.must_change_password,p.access_role FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=?`).get(redeemed.userId) as any;
    assert.equal(client.access_role,"client");
    assert.equal(client.must_change_password,0);
    assert.equal(canViewBusiness(client,redeemed.businessId),true);
    assert.equal(canManageBusiness(client,redeemed.businessId),false);
    assert.throws(()=>redeemClientInvitation({token:secondToken,name:"Amina Client",password:"ClientPassword123!"},1_000_201),InvitationError);
    assert.equal((getDb().prepare("SELECT COUNT(*) count FROM users WHERE lower(email)='amina@example.test'").get() as {count:number}).count,1);

    const clientForm = new FormData();
    clientForm.set("requestType","change");
    clientForm.set("requestText","Please replace the hero image and add the new summer collection.");
    clientForm.set("idempotencyKey","client_request_key_123456");
    clientForm.append("images",new File([new Uint8Array(png)],"summer-reference.png",{type:"image/png"}));
    const clientRequest = await createAuthenticatedClientRequest(client,clientForm);
    const clientDetail = getRequestDetail(clientRequest.id)!;
    assert.equal(clientDetail.request_type,"onboarding");
    assert.equal(clientDetail.attachments.length,1);
    assert.equal(canAccessRequest(client,clientDetail),true);
    assert.equal(listClientRequests(client).some((request)=>request.id===clientRequest.id),true);
    const otherClient = {...client,id:client.id+100,business_id:redeemed.businessId+100};
    assert.equal(canAccessRequest(otherClient,clientDetail),false);
    const sameBusinessOtherClient = {...client,id:client.id+101};
    assert.equal(canAccessRequest(sameBusinessOtherClient,clientDetail),false);
    assert.equal(listClientRequests(sameBusinessOtherClient).some((request)=>request.id===clientRequest.id),false);
    const repeatedClientRequest = await createAuthenticatedClientRequest(client,clientForm);
    assert.equal(repeatedClientRequest.id,clientRequest.id);
    assert.equal(repeatedClientRequest.duplicate,true);

    const managerAccount = createStaffAccount({name:"Operations Manager",email:"manager@example.test",password:"ManagerPassword123!",accessRole:"operations_manager"});
    const teamOneAccount = createStaffAccount({name:"Team One",email:"team-one@example.test",password:"TeamPassword123!",accessRole:"team_member"});
    const teamTwoAccount = createStaffAccount({name:"Team Two",email:"team-two@example.test",password:"TeamPassword123!",accessRole:"team_member"});
    const manager = getUserById(managerAccount.userId)!;
    const teamOne = getUserById(teamOneAccount.userId)!;
    const teamTwo = getUserById(teamTwoAccount.userId)!;
    assert.equal(manager.access_role,"operations_manager");
    assert.equal(teamOne.access_role,"team_member");
    assert.equal(canManageBusiness(manager,redeemed.businessId),false);

    const directToken = "D".repeat(43);
    const directInvitation = createClientInvitation({requestId:null,clientName:"Direct Client",email:"direct@example.test",businessName:"Direct Market",handle:"direct-market",designKey:"alhaya",actorUserId:manager.id},{now:2_000_000,token:directToken});
    assert.equal(getActiveInvitation(directToken,2_000_001)?.request_id,null);
    const directRedemption = redeemClientInvitation({token:directToken,name:"Direct Client",password:"DirectClient123!"},2_000_100);
    assert.equal(directRedemption.requestId,null);
    const directClient = getUserById(directRedemption.userId)!;
    const directForm = new FormData();
    directForm.set("requestType","change");
    directForm.set("requestText","Please prepare our first showroom from this complete business brief.");
    directForm.set("idempotencyKey","direct_client_key_123456");
    const directRequest = await createAuthenticatedClientRequest(directClient,directForm);
    assert.equal(getRequestDetail(directRequest.id)?.request_type,"onboarding");
    const managedClients = listManagedClients();
    assert.equal(Object.getPrototypeOf(managedClients[0]),Object.prototype);
    assert.equal(managedClients.some((managedClient)=>managedClient.id===client.id),true);

    const managerForm = new FormData();
    managerForm.set("clientUserId",String(client.id));
    managerForm.set("requestType","change");
    managerForm.set("requestText","The client asked SuqPage to prepare a new private hero and catalog arrangement.");
    managerForm.set("idempotencyKey","manager_request_key_123456");
    managerForm.append("images",new File([new Uint8Array(png)],"manager-reference.png",{type:"image/png"}));
    const managerRequest = await createOnBehalfRequest(manager,managerForm);
    const managerDetail = getRequestDetail(managerRequest.id)!;
    assert.equal(managerDetail.submitter_kind,"manager");
    assert.equal(managerDetail.represented_client_user_id,client.id);
    assert.equal(managerDetail.business_id,client.business_id);
    assert.equal(managerDetail.attachments.length,1);
    assert.equal(canAccessRequest(client,managerDetail),true);
    await assert.rejects(()=>createOnBehalfRequest(teamOne,managerForm),(error:unknown)=>error instanceof RequestError&&error.status===403);
    const managerRepeated = await createOnBehalfRequest(manager,managerForm);
    assert.equal(managerRepeated.id,managerRequest.id);
    assert.equal(managerRepeated.duplicate,true);

    const staffClarification = addRequestClarification(manager,managerRequest.id,"Which hero message should the team prioritize?");
    assert.equal(staffClarification.status,"needs_information");
    assert.equal(getRequestDetail(managerRequest.id)?.status,"needs_information");
    assert.throws(()=>addRequestClarification(otherClient,managerRequest.id,"I should not see this."),RequestError);
    const clientClarification = addRequestClarification(client,managerRequest.id,"Please prioritize our handmade origin story.");
    assert.equal(clientClarification.status,"under_review");
    const clarificationEvents = getRequestDetail(managerRequest.id)!.events.filter((event)=>event.event_type.endsWith("_clarification"));
    assert.deepEqual(clarificationEvents.map((event)=>event.actor_access_role),["operations_manager","client"]);
    assert.deepEqual(clarificationEvents.map((event)=>event.detail),["Which hero message should the team prioritize?","Please prioritize our handmade origin story."]);

    assignRequestToTeamMember(managerRequest.id,teamOne.id,manager.id);
    const assignedToOne = getRequestDetail(managerRequest.id)!;
    assert.equal(canAccessRequest(teamOne,assignedToOne),true);
    assert.equal(canAccessRequest(teamTwo,assignedToOne),false);
    assert.equal(canViewBusiness(teamOne,redeemed.businessId,true),true);
    assert.equal(canManageBusiness(teamOne,redeemed.businessId,true),false);
    assert.equal(listAssignedRequests(teamOne.id).some((request)=>request.id===managerRequest.id),true);
    assert.equal(listAssignedBusinesses(teamOne.id).some((business)=>business.id===redeemed.businessId),true);
    const assignmentEvent = assignedToOne.events.find((event)=>event.event_type==="assigned")!;
    assert.match(assignmentEvent.detail,/^team_member:\d+$/);
    assert.deepEqual(presentRequestEvent(assignmentEvent,true),{
      label:"Team assigned",
      detail:"A SuqPage team member was assigned to this request.",
    });
    assert.deepEqual(presentRequestEvent(assignmentEvent,false),{
      label:"Assigned",
      detail:assignmentEvent.detail,
    });
    assert.deepEqual(presentRequestEvent({event_type:"status_changed",detail:"submitted->under_review"},true),{
      label:"Status updated",
      detail:"Request status changed to Under review.",
    });
    assert.deepEqual(presentRequestEvent({event_type:"revision_submitted",detail:"revision:3"},true),{
      label:"Preview ready",
      detail:"Revision 3 was sent for your review.",
    });
    const unknownClientEvent = presentRequestEvent({event_type:"internal_test",detail:"staff:42;storage:secret"},true);
    assert.deepEqual(unknownClientEvent,{label:"Request updated",detail:"SuqPage recorded progress on this request."});
    assert.doesNotMatch(`${unknownClientEvent.label} ${unknownClientEvent.detail}`,/42|secret|staff:/);
    assignRequestToTeamMember(managerRequest.id,teamTwo.id,manager.id);
    const assignedToTwo = getRequestDetail(managerRequest.id)!;
    assert.equal(canAccessRequest(teamOne,assignedToTwo),false);
    assert.equal(canAccessRequest(teamTwo,assignedToTwo),true);
    assert.equal(listAssignedBusinesses(teamOne.id).length,0);
    assert.equal(listAssignedBusinesses(teamTwo.id).some((business)=>business.id===redeemed.businessId),true);

    const prospectForm = new FormData();
    prospectForm.set("requestType","change");
    prospectForm.set("contactName","Prospect Served");
    prospectForm.set("contactValue","prospect-served@example.test");
    prospectForm.set("businessName","Prospect Served Market");
    prospectForm.set("requestText","Please record this first showroom request for the prospect on their behalf.");
    prospectForm.set("idempotencyKey","manager_prospect_key_123456");
    const prospectRequest = await createOnBehalfRequest(manager,prospectForm);
    const prospectDetail = getRequestDetail(prospectRequest.id)!;
    assert.equal(prospectDetail.request_type,"onboarding");
    assert.equal(prospectDetail.business_id,null);
    assert.equal(prospectDetail.represented_client_user_id,null);
    const prospectInvitation = createClientInvitation({requestId:prospectRequest.id,clientName:"Prospect Served",email:"prospect-served@example.test",businessName:"Prospect Served Market",handle:"prospect-served-market",designKey:"novatech",actorUserId:manager.id},{now:3_000_000,token:"C".repeat(43)});
    assert.equal(getActiveInvitation("C".repeat(43),3_000_001)?.business_id,prospectInvitation.businessId);
    const prospectBusiness=getDb().prepare("SELECT design_key,design_manifest_json FROM businesses WHERE id=?").get(prospectInvitation.businessId) as {design_key:string;design_manifest_json:string};
    assert.equal(prospectBusiness.design_key,"composition");
    assert.equal(JSON.parse(prospectBusiness.design_manifest_json).tokenPack,"technology-mono");

    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "short" }, "ip-b", { repository, rateLimiter: allowedRate }), RequestError);
    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "request_test_key_223456", requestText: "x".repeat(2_001) }, "ip-b2", { repository, rateLimiter: allowedRate }), RequestError);
    const deniedRate = { consume: () => ({ allowed: false, retryAfterSeconds: 300 }) };
    await assert.rejects(() => createPublicInterest({ ...input, idempotencyKey: "request_test_key_456789" }, "ip-e", { repository, rateLimiter: deniedRate }), (error: unknown) => error instanceof RequestError && error.status === 429 && error.retryAfter === 300);

    const migrations = getDb().prepare("SELECT version FROM schema_migrations ORDER BY version").all() as Array<{ version: number }>;
    assert.deepEqual(migrations.map((migration) => migration.version), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    console.log("Managed request integration tests passed.");
  } finally {
    closeDbForTests();
    fs.rmSync(root, { recursive: true, force: true });
  }
}

main().catch((error) => { console.error(error); process.exit(1); });
