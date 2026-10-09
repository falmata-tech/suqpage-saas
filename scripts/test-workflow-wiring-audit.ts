import assert from 'node:assert/strict';
import fs from 'node:fs';
import { getDb, closeDbForTests, getUserById } from './testing/postgres-fixture';
import { updateInquiryStatus } from '../lib/inquiry-status-runtime';

async function main() {
  const db = await getDb();
  try {
    const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('wiring-shop','Wiring shop','composition','active')").run()).insertedId);
    const otherId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('other-wiring-shop','Other shop','composition','active')").run()).insertedId);
    const userId=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('wiring-admin@example.test','unused','Wiring admin','admin')").run()).insertedId);
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(userId);
    const actor=(await getUserById(userId))!;
    const inquiryId=Number((await db.prepare("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,status,idempotency_key) VALUES(?,'Fixture buyer','buyer@example.test','email','new','wiring-test')").run(businessId)).insertedId);
    const change={businessId,inquiryId,status:'contacted'};
    const status=async()=>(await db.prepare('SELECT status FROM inquiries WHERE id=?').get(inquiryId)).status;
    const audits=async()=>(await db.prepare("SELECT COUNT(*) n FROM audit_logs WHERE action='inquiry.status_updated'").get()).n;
    await updateInquiryStatus(actor,change); assert.equal(await status(),'contacted'); assert.equal(await audits(),1);
    for(const invalid of [{...change,businessId:otherId},{...change,inquiryId:inquiryId+1000},{...change,status:'fake'},{...change,inquiryId:NaN}]) await assert.rejects(()=>updateInquiryStatus(actor,invalid));
    await assert.rejects(()=>updateInquiryStatus({...actor,access_role:'client',business_id:otherId},change),/access required/);
    await assert.rejects(()=>updateInquiryStatus({...actor,access_role:'team_member',business_id:businessId},change),/access required/);
    assert.equal(await status(),'contacted'); assert.equal(await audits(),1,'Denied/no-op commands never record success');
    await updateInquiryStatus({...actor,access_role:'operations_manager'},{...change,status:'closed'}); assert.equal(await status(),'closed');
    await db.exec("CREATE FUNCTION reject_wiring_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture audit failure'; END; $$; CREATE TRIGGER reject_wiring_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_wiring_audit();");
    await assert.rejects(()=>updateInquiryStatus(actor,change),/fixture audit failure/); assert.equal(await status(),'closed','Failure rolls back the status change');
    await db.exec('DROP TRIGGER reject_wiring_audit ON audit_logs; DROP FUNCTION reject_wiring_audit();');
    // Test managed provisioning without contacting any provider or sending mail.
    const previousFetch=globalThis.fetch;
    const savedEnvironment={...process.env};
    const providerBodies:Record<string,unknown>[]=[];
    const {randomUUID}=await import('node:crypto');
    Object.assign(process.env,{SUQPAGE_AUTH_DRIVER:'supabase',NEXT_PUBLIC_SUPABASE_URL:'https://identity.example.test',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-public-key-with-enough-characters',SUQPAGE_SUPABASE_SERVICE_ROLE_KEY:'fixture-service-key-with-enough-characters'});
    globalThis.fetch=async (input,init)=>{
      const url=new URL(String(input)); assert.equal(url.hostname,'identity.example.test');
      if(init?.method==='POST'){
        const body=JSON.parse(String(init.body));providerBodies.push(body);
        assert.equal(body.password,undefined);assert.equal(body.password_hash,undefined);
        return Response.json({id:randomUUID(),email:body.email,aud:'authenticated',created_at:new Date().toISOString()});
      }
      return Response.json({id:url.pathname.split('/').at(-1)});
    };
    try {
      const {createStaffAccount}=await import('../lib/staff-operations');
      const staff=await createStaffAccount({name:'Email staff',email:'email-staff@example.test',password:'ignored',accessRole:'support_agent'},actor);
      const record=await db.prepare('SELECT must_change_password,password_hash FROM users WHERE id=?').get(staff.userId);
      assert.equal((await db.prepare('SELECT queue_scope,enabled,max_open_conversations FROM support_agent_settings WHERE user_id=?').get(staff.userId)).queue_scope,'support');
      const callsBeforeDenied=providerBodies.length;
      await assert.rejects(()=>createStaffAccount({name:'Denied',email:'denied@example.test',password:'',accessRole:'transport_agent'},{...actor,access_role:'operations_manager'}),/administrator access/);
      await assert.rejects(()=>createStaffAccount({name:'Denied',email:'denied@example.test',password:'',accessRole:'operations_manager'},actor),/staff role/);
      assert.equal(providerBodies.length,callsBeforeDenied,'Denied staff changes never contact the provider');
      assert.equal(record.must_change_password,0);assert.ok(record.password_hash.startsWith('!'));
      assert.ok(await db.prepare('SELECT 1 FROM auth_identity_links WHERE user_id=?').get(staff.userId));
      const {createClientInvitation,redeemClientInvitation}=await import('../lib/invitations');
      const invitation=await createClientInvitation({requestId:null,clientName:'Invited owner',email:'email-invite@example.test',businessName:'Email invite shop',handle:'email-invite-shop',designKey:'novatech',actorUserId:userId});
      const redeemed=await redeemClientInvitation({token:invitation.token,name:'Invited owner',password:''});
      assert.equal(redeemed.businessId,invitation.businessId);
      assert.ok(await db.prepare('SELECT 1 FROM auth_identity_links WHERE user_id=?').get(redeemed.userId));
      const calls=providerBodies.length;
      await assert.rejects(()=>redeemClientInvitation({token:invitation.token,name:'Replay',password:''}),/already used/);
      assert.equal(providerBodies.length,calls,'Replay makes no provider write');
      globalThis.fetch=async()=>Response.json({msg:'unavailable'},{status:503});
      await assert.rejects(()=>createStaffAccount({name:'Failed staff',email:'failed-staff@example.test',password:'',accessRole:'transport_agent'},actor),/unavailable/);
      assert.equal(await db.prepare("SELECT id FROM users WHERE email='failed-staff@example.test'").get(),undefined);
    } finally {
      globalThis.fetch=previousFetch;
      for(const key of Object.keys(process.env))if(!(key in savedEnvironment))delete process.env[key];
      Object.assign(process.env,savedEnvironment);
    }
    const source=fs.readFileSync('app/actions.ts','utf8');
    for(const [name,firstEffect] of [['loginAction','currentRequestIdentity'],['changePasswordAction','runtimeGet'],['adminResetClientPasswordAction','runtimeGet']]) {
      const body=source.split(`export async function ${name}(`)[1].split('\nexport async function ')[0];
      const guard=body.indexOf('if(authDriver()!=="local")'); assert.ok(guard>=0&&guard<body.indexOf(firstEffect),`${name} rejects managed-password entry before side effects`);
    }
    assert.doesNotMatch(source,/signInWithSupabasePassword|updateCurrentSupabasePassword|updateLinkedSupabasePassword/);
    console.log('PASS persisted inquiry success, no-op/foreign-ID denial, role/status validation, audit rollback managed-password action guards, email-only staff/invitation links, replay and provider failure.');
  } finally { await closeDbForTests(); }
}
main().catch(error=>{ console.error(error);process.exitCode=1; });
