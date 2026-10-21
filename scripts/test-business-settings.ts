import assert from 'node:assert/strict';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {runtimeUserById} from '../lib/catalog-runtime';
import {saveBusinessSettings,BusinessSettingsError,type BusinessSettingsWrite} from '../lib/business-settings-runtime';
import type {SessionUser} from '../lib/types';
import {createStaffAccount} from '../lib/staff-operations';
import crypto from 'node:crypto';

async function main(){
  const db=await getDb();
  try{
    const businessId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('settings-fixture','Original settings','composition','active')").run()).insertedId);
    const foreignId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('settings-foreign','Foreign settings','composition','active')").run()).insertedId);
    async function user(role:SessionUser['access_role']){const id=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES(?,'unused',?,'admin',?)").run(role+'@example.test',role,role==='client'?foreignId:null)).insertedId);await db.prepare('INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)').run(id,role);return (await runtimeUserById(id))!;}
    const admin=await user('platform_admin'),owner=await user('client'),staff=await user('team_member');
    const input:BusinessSettingsWrite={expectedVersion:1,name:'Updated settings',contactEmail:'notice@example.test',isLive:false,livePlatform:'',liveUrl:'',siteTitle:'Saved title',siteDescription:'Saved description',logoPath:'/seed/settings-logo.svg',faviconPath:'/seed/settings-icon.svg'};
    const snapshot=()=>db.prepare('SELECT name,contact_email,logo_path,favicon_path,is_live,live_platform,live_url,site_title,site_description,content_version FROM businesses WHERE id=?').get(businessId);
    const before=await snapshot();
    for(const expectedVersion of [undefined,null,'',0,-1,NaN,'bad'])await assert.rejects(()=>saveBusinessSettings(admin,businessId,{...input,expectedVersion}),BusinessSettingsError);
    for(const actor of [owner,staff,{...owner,access_role:'platform_admin' as const}])await assert.rejects(()=>saveBusinessSettings(actor,businessId,input),BusinessSettingsError);
    assert.deepEqual(await snapshot(),before,'Invalid/foreign/stale actor input leaves every canonical field untouched');
    const first=await saveBusinessSettings(admin,businessId,input);assert.equal(first.content_version,2);assert.equal((await snapshot()).name,input.name);
    await assert.rejects(()=>saveBusinessSettings(admin,businessId,{...input,name:'Stale overwrite'}),/changed. Reload/);
    const race=await Promise.allSettled([saveBusinessSettings(admin,businessId,{...input,expectedVersion:2,name:'Writer one'}),saveBusinessSettings(admin,businessId,{...input,expectedVersion:2,name:'Writer two'})]);
    assert.equal(race.filter(result=>result.status==='fulfilled').length,1);assert.equal((await snapshot()).content_version,3);assert.ok(['Writer one','Writer two'].includes((await snapshot()).name));
    assert.equal(Number((await db.prepare("SELECT COUNT(*) count FROM audit_logs WHERE business_id=? AND action='business.updated'").get(businessId)).count),2);
    async function preserved(input:BusinessSettingsWrite,changed:string[]){const before=await snapshot();await saveBusinessSettings(admin,businessId,input);const after=await snapshot();for(const [field,value]of Object.entries(before))if(!changed.includes(field)&&field!=='content_version')assert.deepEqual(after[field],value,`Focused settings must preserve ${field}`);assert.equal(after.content_version,before.content_version+1);return after;}
    await preserved({section:'identity',expectedVersion:3,name:'Focused identity',contactEmail:'identity@example.test'},['name','contact_email']);
    await preserved({section:'live',expectedVersion:4,isLive:true,livePlatform:'youtube',liveUrl:'https://www.youtube.com/@settings/live'},['is_live','live_platform','live_url']);
    const final=await preserved({section:'sharing',expectedVersion:5,siteTitle:'Focused title',siteDescription:'Focused description'},['site_title','site_description']);
    assert.equal(final.name,'Focused identity');assert.equal(final.is_live,1);assert.equal(final.logo_path,input.logoPath);assert.equal(final.favicon_path,input.faviconPath);
    for(const forged of [
      {section:'unknown',expectedVersion:6},
      {section:'identity',expectedVersion:6,name:'Forged',contactEmail:'forged@example.test',isLive:false},
      {section:'live',expectedVersion:6,isLive:false,livePlatform:'',liveUrl:'',name:'Cross section'},
      {section:'sharing',expectedVersion:6,siteTitle:'Forged',siteDescription:'Forged',faviconPath:'/forged.svg'},
      {section:'sharing',expectedVersion:6,siteTitle:'Missing description'},
      {section:'identity',expectedVersion:6,name:'Forged',contactEmail:'valid@example.test',logoPath:undefined},
    ])await assert.rejects(()=>saveBusinessSettings(admin,businessId,forged as unknown as BusinessSettingsWrite),BusinessSettingsError);
    assert.deepEqual(await snapshot(),final,'Unknown/missing/cross-section fields cannot change canonical values');
    await assert.rejects(()=>saveBusinessSettings(admin,businessId,{section:'sharing',expectedVersion:5,siteTitle:'Stale focused',siteDescription:'Stale focused'}),/changed. Reload/);
    const focusedRace=await Promise.allSettled([
      saveBusinessSettings(admin,businessId,{section:'identity',expectedVersion:6,name:'Identity race',contactEmail:'race@example.test'}),
      saveBusinessSettings(admin,businessId,{section:'sharing',expectedVersion:6,siteTitle:'Sharing race',siteDescription:'Sharing race'}),
    ]);
    assert.equal(focusedRace.filter(result=>result.status==='fulfilled').length,1);assert.equal((await snapshot()).content_version,7);
    assert.equal((await snapshot()).is_live,1,'Concurrent focused sections preserve the unrelated live configuration');
    const saved=await snapshot();
    await db.exec(`CREATE FUNCTION reject_settings_audit() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'fixture audit unavailable'; END $$; CREATE TRIGGER reject_settings_audit BEFORE INSERT ON audit_logs FOR EACH ROW EXECUTE FUNCTION reject_settings_audit()`);
    await assert.rejects(()=>saveBusinessSettings(admin,businessId,{...input,expectedVersion:7,name:'Audit failure must roll back'}),/fixture audit unavailable/);
    await assert.rejects(()=>saveBusinessSettings(admin,businessId,{section:'sharing',expectedVersion:7,siteTitle:'Focused audit failure',siteDescription:'Must roll back'}),/fixture audit unavailable/);
    assert.deepEqual(await snapshot(),saved,'Audit failure rolls back data and version, allowing safe explicit retry');
    await assert.rejects(()=>createStaffAccount({name:'Rollback staff',email:'rollback-staff@example.test',password:'RollbackStaff123',accessRole:'support_agent'},admin),/Could not create staff account/);
    assert.equal(Number((await db.prepare("SELECT COUNT(*) count FROM users WHERE email='rollback-staff@example.test'").get()).count),0,'Failed staff audit cannot leave a silently created account behind');
    await db.exec('DROP TRIGGER reject_settings_audit ON audit_logs; DROP FUNCTION reject_settings_audit()');
    const environment={...process.env},fetch=globalThis.fetch,providerId=crypto.randomUUID();let removed=0;
    Object.assign(process.env,{SUQPAGE_AUTH_DRIVER:'supabase',NEXT_PUBLIC_SUPABASE_URL:'https://identity.example.test',NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY:'fixture-public-key-with-enough-characters',SUQPAGE_SUPABASE_SERVICE_ROLE_KEY:'fixture-service-key-with-enough-characters'});
    globalThis.fetch=async(input,init)=>{assert.equal(new URL(String(input)).hostname,'identity.example.test');if(init?.method==='POST')await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin.id);if(init?.method==='DELETE')removed++;return Response.json({id:providerId,email:'race-staff@example.test',aud:'authenticated',created_at:new Date().toISOString()});};
    try{await assert.rejects(()=>createStaffAccount({name:'Race staff',email:'race-staff@example.test',password:'',accessRole:'support_agent'},admin),/administrator access/);assert.equal(removed,1,'A provider identity prepared before authority revocation is cleaned up');assert.equal(Number((await db.prepare("SELECT COUNT(*) count FROM users WHERE email='race-staff@example.test'").get()).count),0,'Authority is rechecked after provisioning and before staff records/queue recovery');}
    finally{globalThis.fetch=fetch;for(const key of Object.keys(process.env))if(!(key in environment))delete process.env[key];Object.assign(process.env,environment);}
    await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin.id);
    await assert.rejects(()=>saveBusinessSettings(admin,businessId,{...input,expectedVersion:7}),/Not authorized/);
    await assert.rejects(()=>saveBusinessSettings(admin,businessId,{section:'sharing',expectedVersion:7,siteTitle:'Revoked',siteDescription:'Revoked'}),/Not authorized/);
    assert.deepEqual(await snapshot(),saved,'A stale administrator principal cannot bypass the current saved role');
    await db.prepare('INSERT INTO staff_business_grants(user_id,enabled,version,updated_at) VALUES(?,1,1,1)').run(staff.id);
    const staffSaved=await saveBusinessSettings(staff,businessId,{section:'sharing',expectedVersion:7,siteTitle:'Staff-managed title',siteDescription:'Managed showroom settings'});
    assert.equal(staffSaved.content_version,8);
    await db.prepare('UPDATE staff_business_grants SET enabled=0,version=version+1 WHERE user_id=?').run(staff.id);
    await assert.rejects(()=>saveBusinessSettings(staff,businessId,{section:'sharing',expectedVersion:8,siteTitle:'Revoked staff',siteDescription:'Denied'}),/Not authorized/);
    assert.equal((await db.prepare('SELECT name,content_version FROM businesses WHERE id=?').get(foreignId)).name,'Foreign settings');
    console.log('PASS isolated PostgreSQL settings mandatory version, simultaneous/stale writes, tenant/role isolation, fresh-role and staff-grant revocation, exact authorized fields and audit rollback.');
  }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
