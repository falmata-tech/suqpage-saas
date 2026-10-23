import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {submitPartnerInterest,PartnerInterestError,cleanupPartnerInterests} from '../lib/transport-partner-interest';

async function main(){
 const db=await getDb(),now=Date.now();
 const admin=(await db.prepare("INSERT INTO users(email,password_hash,name,role,must_change_password) VALUES('partner-admin@example.test','unused','Partner admin','admin',0)").run()).insertedId;
 await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'platform_admin')").run(admin);
 const raw={companyName:'Example Logistics',contactName:'Test Contact',email:'contact@example.test',phone:'+12025550188',message:'We would like to learn more.',locale:'en',idempotencyKey:crypto.randomUUID()};
 const concurrent=await Promise.all([submitPartnerInterest(raw,'test-ip',now),submitPartnerInterest(raw,'test-ip',now)]);
 const sent=concurrent[0];assert.deepEqual(concurrent[1],sent);assert.equal((await db.prepare('SELECT count(*) n FROM transport_partner_interests').get()).n,1);
 assert.match(sent.reference,/^PI-[A-F0-9]{12}$/);
 assert.deepEqual(await submitPartnerInterest({...raw,email:' CONTACT@EXAMPLE.TEST '},'other-ip',now+1),sent);
 await assert.rejects(()=>submitPartnerInterest({...raw,message:'Changed'},'test-ip',now+2),error=>error instanceof PartnerInterestError&&error.code==='conflict');
 const row=await db.prepare('SELECT * FROM transport_partner_interests WHERE reference=?').get(sent.reference);
 assert.equal(row.email,raw.email);assert.equal(row.phone,raw.phone);assert.notEqual(row.ip_hash,'test-ip');
 assert.equal((await db.prepare('SELECT count(*) n FROM transport_partner_interest_deliveries WHERE interest_id=?').get(row.id)).n,1);
 assert.equal((await db.prepare('SELECT count(*) n FROM users').get()).n,1,'An application never creates an operating account');
 await assert.rejects(()=>submitPartnerInterest({...raw,approved:true,idempotencyKey:crypto.randomUUID()},'invalid',now),error=>error instanceof PartnerInterestError&&error.code==='invalid');
 for(let i=0;i<2;i++)await submitPartnerInterest({...raw,idempotencyKey:crypto.randomUUID()},'ip'+i,now);
 await assert.rejects(()=>submitPartnerInterest({...raw,idempotencyKey:crypto.randomUUID()},'new-ip',now),error=>error instanceof PartnerInterestError&&error.code==='rate_limited');
 await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(admin);
 await assert.rejects(()=>submitPartnerInterest({...raw,email:'second@example.test',idempotencyKey:crypto.randomUUID()},'new',now),error=>error instanceof PartnerInterestError&&error.code==='unavailable');
 assert.equal((await db.prepare('SELECT count(*) n FROM transport_partner_interests').get()).n,3,'No recipient means no saved application or delivery');
 const cleaned=await cleanupPartnerInterests(now+91*86400000,2);assert.equal(cleaned.deleted,2);assert.equal((await db.prepare('SELECT count(*) n FROM transport_partner_interest_deliveries').get()).n,1);
 console.log('PASS BE-063 canonical intake, idempotency/conflict, bounded rates, no accounts, admin requirement and bounded retention.');
}
main().finally(closeDbForTests).catch(error=>{console.error(error);process.exitCode=1;});
