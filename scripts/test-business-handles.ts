import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,getUserById,closeDbForTests} from './testing/postgres-fixture';
import {createPublicClientWorkspace,generatedHandle} from '../lib/signup';
import {changeBusinessHandle,readHandleSettings} from '../lib/business-handle-runtime';
import {getHandleAvailability} from '../lib/handle-availability';
import {runtimeBusinessByHandle,runtimeBusinessByHandleAny} from '../lib/catalog-runtime';
import {HANDLE_CHANGE_INTERVAL_MS,nextHandleChangeAt,parseBusinessHandle} from '../lib/business-handle';

async function main(){
 const db=await getDb();
 try{
  const identity={providerUserId:crypto.randomUUID(),email:'handle-lifecycle@example.test'};
  const raw={name:'Example Owner',phone:'+447700900999',businessName:'Example shop',businessCategory:'home-living',consent:true,idempotencyKey:crypto.randomUUID()};
  const taken=generatedHandle(raw.businessName,identity.providerUserId);
  await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,'Taken generated address','composition','draft')").run(taken);
  const created=await createPublicClientWorkspace(raw,identity);const owner=(await getUserById(created.userId))!;
  const initial=await readHandleSettings(owner,created.businessId);assert.notEqual(initial.handle,taken);assert.equal(parseBusinessHandle(initial.handle),initial.handle);assert.equal(initial.nextChangeAt,0);
  assert.equal((await db.prepare('SELECT COUNT(*) n FROM products WHERE business_id=?').get(created.businessId)).n,3);
  assert.equal((await getHandleAvailability(initial.handle)).available,false);
  const rename=await changeBusinessHandle(owner,created.businessId,{handle:'@My-New-Shop',expectedVersion:initial.contentVersion});assert.equal(rename.handle,'my-new-shop');
  const saved=await readHandleSettings(owner,created.businessId);assert.ok(saved.nextChangeAt>Date.now());
  await changeBusinessHandle(owner,created.businessId,{handle:saved.handle,expectedVersion:initial.contentVersion});assert.deepEqual(await readHandleSettings(owner,created.businessId),saved,'No-op consumes no allowance');
  await assert.rejects(()=>changeBusinessHandle(owner,created.businessId,{handle:'another-name',expectedVersion:saved.contentVersion}),/30 days/);
  assert.equal((await getHandleAvailability(initial.handle)).available,false,'Retired address remains reserved');
  assert.equal(await runtimeBusinessByHandle(initial.handle),undefined,'Old address cannot expose private business');
  assert.equal((await runtimeBusinessByHandleAny(initial.handle))?.id,created.businessId);
  await db.prepare("UPDATE businesses SET status='active' WHERE id=?").run(created.businessId);
  assert.equal((await runtimeBusinessByHandle(initial.handle))?.handle,'my-new-shop');
  await assert.rejects(()=>db.prepare("INSERT INTO businesses(handle,name,design_key) VALUES(?,'Hijack','composition')").run(initial.handle.toUpperCase()),/reserved/);
  await db.prepare('UPDATE businesses SET handle_changed_at=? WHERE id=?').run(Date.now()-HANDLE_CHANGE_INTERVAL_MS-1000,created.businessId);
  const races=await Promise.allSettled(['new-a','new-b'].map(handle=>changeBusinessHandle(owner,created.businessId,{handle,expectedVersion:saved.contentVersion})));
  assert.equal(races.filter(r=>r.status==='fulfilled').length,1);assert.equal(races.filter(r=>r.status==='rejected').length,1);
  assert.equal(nextHandleChangeAt(100),100+HANDLE_CHANGE_INTERVAL_MS);
  await assert.rejects(()=>changeBusinessHandle({...owner,business_id:999},created.businessId,{handle:'foreign-test',expectedVersion:3}),/cannot change/);
  await assert.rejects(()=>changeBusinessHandle({...owner,access_role:'platform_admin'},created.businessId,{handle:'forged-admin',expectedVersion:3,reason:'Test override'}),/cannot change/);
  const adminId=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role) VALUES('handle-admin@example.test','unused','Admin','admin')").run()).insertedId);await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(adminId);const admin=(await getUserById(adminId))!;
  const current=await readHandleSettings(owner,created.businessId);
  await assert.rejects(()=>changeBusinessHandle(admin,created.businessId,{handle:'admin-shortcut',expectedVersion:current.contentVersion}),/support reason/);
  await changeBusinessHandle(admin,created.businessId,{handle:'support-corrected',expectedVersion:current.contentVersion,reason:'Owner requested spelling correction'});
  const audit=await db.prepare("SELECT detail FROM audit_logs WHERE business_id=? AND action='business.handle_changed' ORDER BY id DESC LIMIT 1").get(created.businessId);assert.equal(JSON.parse(audit.detail).override,true);assert.equal(JSON.parse(audit.detail).reason,'Owner requested spelling correction');
  assert.equal((await runtimeBusinessByHandle(initial.handle))?.handle,'support-corrected');
  await db.prepare("UPDATE businesses SET status='suspended' WHERE id=?").run(created.businessId);assert.equal(await runtimeBusinessByHandle(initial.handle),undefined);
  assert.equal((await getHandleAvailability('support-corrected')).available,false);
  const rls=await db.prepare("SELECT relrowsecurity FROM pg_class WHERE oid='business_handles'::regclass").get();assert.equal(rls.relrowsecurity,true);
  const grants=await db.runner.query("SELECT grantee FROM information_schema.role_table_grants WHERE table_schema=current_schema() AND table_name='business_handles' AND grantee IN ('anon','authenticated','PUBLIC')");assert.equal(grants.rows.length,0);
  console.log('PASS automatic collision retry, registry/case uniqueness, retained aliases/private denial, cooldown/concurrency/no-op, owner isolation, audited admin override and server-only registry.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
