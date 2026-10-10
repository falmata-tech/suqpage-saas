import crypto from 'node:crypto';
import type {PostgresTransactionRunner} from '../../lib/postgres-runtime';
import {hashPrivateValue} from '../../lib/security';

// Operator-only recipe. Never import this into an HTTP route or client bundle.
export type ErasureTarget={userId:number;providerId:string;email:string};
export type ErasurePlan={target:ErasureTarget;businessId:number;digest:string;counts:Record<string,number>};
export type ErasureApproval={approvedDigest:string;verifiedRequestReference:string;backupSha256:string};
export interface ErasureIdentityPort { isAbsent(providerId:string):Promise<boolean>; }
type Scope={sql:string;values:unknown[]};
const identifier=(s:string)=>{if(!/^[a-z_][a-z0-9_]*$/.test(s))throw Error('Unexpected schema identifier.');return '"'+s+'"';};
const digest=(v:unknown)=>crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');

async function inspect(runner:PostgresTransactionRunner,target:ErasureTarget,lock=false) {
  if(!Number.isSafeInteger(target.userId)||target.userId<1||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(target.providerId)||!/^\S+@\S+\.\S+$/.test(target.email))throw Error('Invalid exact erasure target.');
  const row=(await runner.query<{business_id:number;email:string;access_role:string;provider_user_id:string;email_at_link:string}>(
    `SELECT u.business_id,u.email,p.access_role,l.provider_user_id,l.email_at_link FROM users u JOIN user_access_profiles p ON p.user_id=u.id JOIN auth_identity_links l ON l.user_id=u.id AND l.provider='supabase' WHERE u.id=? ${lock?'FOR UPDATE OF u,p,l':''}`,[target.userId])).rows[0];
  if(!row||row.access_role!=='client'||row.email!==target.email||row.email_at_link!==target.email||row.provider_user_id!==target.providerId||!row.business_id)throw Error('Only the exact linked ordinary owner can be erased.');
  const businessId=Number(row.business_id);
  if(lock)await runner.query('SELECT id FROM businesses WHERE id=? FOR UPDATE',[businessId]);
  const owners=(await runner.query<{total:number}>('SELECT count(*) total FROM users WHERE business_id=?',[businessId])).rows[0];
  if(Number(owners.total)!==1)throw Error('Shared business requires a separate reviewed erasure plan.');
  const cross=(await runner.query<{total:number}>(`SELECT count(*) total FROM service_requests WHERE (submitted_by_user_id=? OR represented_client_user_id=?) AND business_id IS NOT NULL AND business_id<>?`,[target.userId,target.userId,businessId])).rows[0];
  if(Number(cross.total))throw Error('Cross-business request dependencies require separate review.');
  const columns=(await runner.query<{table_name:string;column_name:string}>("SELECT table_name,column_name FROM information_schema.columns WHERE table_schema=current_schema()")).rows;
  const scopes=new Map<string,Scope>();
  for(const c of columns)if(c.column_name==='business_id')scopes.set(c.table_name,{sql:'business_id=?',values:[businessId]});
  scopes.set('businesses',{sql:'id=?',values:[businessId]});scopes.set('users',{sql:'id=?',values:[target.userId]});
  for(const table of ['auth_identity_links','user_access_profiles','sessions','attention_notifications'])scopes.set(table,{sql:'user_id=?',values:[target.userId]});
  for(const table of ['attention_preferences','attention_subscriptions'])scopes.set(table,{sql:'recipient_key=?',values:['user:'+target.userId]});
  scopes.set('service_requests',{sql:'business_id=? OR submitted_by_user_id=? OR represented_client_user_id=?',values:[businessId,target.userId,target.userId]});
  scopes.set('support_conversations',{sql:'business_id=? OR opened_by_user_id=?',values:[businessId,target.userId]});
  scopes.set('client_invitations',{sql:'business_id=? OR email=? OR accepted_user_id=?',values:[businessId,target.email,target.userId]});
  scopes.set('audit_logs',{sql:'business_id=? OR user_id=?',values:[businessId,target.userId]});
  // Include cascaded child data in the read-only plan, not only the parent count.
  const fks=(await runner.query<{child:string;parent:string;child_col:string;parent_col:string}>(`SELECT ct.relname child,pt.relname parent,ca.attname child_col,pa.attname parent_col FROM pg_constraint c JOIN pg_class ct ON ct.oid=c.conrelid JOIN pg_class pt ON pt.oid=c.confrelid JOIN pg_namespace n ON n.oid=ct.relnamespace JOIN pg_attribute ca ON ca.attrelid=ct.oid AND ca.attnum=c.conkey[1] JOIN pg_attribute pa ON pa.attrelid=pt.oid AND pa.attnum=c.confkey[1] WHERE c.contype='f' AND c.confdeltype='c' AND array_length(c.conkey,1)=1 AND n.nspname=current_schema()`)).rows;
  for(let depth=0;depth<12;depth++){
    let added=false;
    for(const fk of fks){const parent=scopes.get(fk.parent);if(parent&&!scopes.has(fk.child)){scopes.set(fk.child,{sql:`${identifier(fk.child_col)} IN (SELECT ${identifier(fk.parent_col)} FROM ${identifier(fk.parent)} WHERE ${parent.sql})`,values:parent.values});added=true;}}
    if(!added)break;if(depth===11)throw Error('Unexpected dependency depth.');
  }
  const counts:Record<string,number>={},fingerprints:Record<string,string>={};
  for(const [table,scope] of [...scopes].sort(([a],[b])=>a.localeCompare(b))){
    const stats=(await runner.query<{total:number;fingerprint:string}>(`SELECT count(*) total,md5(COALESCE(string_agg(md5(to_jsonb(t)::text),'' ORDER BY md5(to_jsonb(t)::text)),'')) fingerprint FROM ${identifier(table)} t WHERE ${scope.sql}`,scope.values)).rows[0];
    counts[table]=Number(stats.total);fingerprints[table]=stats.fingerprint;
  }
  return {target,businessId,counts,digest:digest({target,businessId,counts,fingerprints})};
}
export async function planOwnerErasure(runner:PostgresTransactionRunner,target:ErasureTarget):Promise<ErasurePlan>{
  return runner.transaction(()=>inspect(runner,target));
}
export async function eraseOwnerRows(runner:PostgresTransactionRunner,plan:ErasurePlan,approval:ErasureApproval,identity:ErasureIdentityPort) {
  if(approval.approvedDigest!==plan.digest||!/^[a-f0-9]{64}$/.test(approval.backupSha256)||!/^[a-zA-Z0-9_-]{8,100}$/.test(approval.verifiedRequestReference))throw Error('Verified request, exact approval and recoverable backup evidence are required.');
  if(!await identity.isAbsent(plan.target.providerId))throw Error('Verify removal of the exact managed identity before deleting its application binding.');
  return runner.transaction(async()=>{
    const current=await inspect(runner,plan.target,true);
    if(current.digest!==plan.digest)throw Error('Erasure plan drift. Reinspect and obtain exact approval.');
    const {userId,email}=plan.target,bid=plan.businessId;
    // Remove dependent history before the owner; keep every FK enforcement intact.
    await runner.query('DELETE FROM service_requests WHERE business_id=? OR submitted_by_user_id=? OR represented_client_user_id=?',[bid,userId,userId]);
    await runner.query('DELETE FROM support_conversations WHERE business_id=? OR opened_by_user_id=?',[bid,userId]);
    await runner.query('DELETE FROM client_invitations WHERE business_id=? OR email=? OR accepted_user_id=?',[bid,email,userId]);
    await runner.query('DELETE FROM content_revisions WHERE business_id=?',[bid]);
    await runner.query('DELETE FROM owner_page_drafts WHERE business_id=?',[bid]);
    await runner.query('DELETE FROM audit_logs WHERE business_id=? OR user_id=?',[bid,userId]);
    for(const table of ['attention_preferences','attention_subscriptions'])await runner.query(`DELETE FROM ${identifier(table)} WHERE recipient_key=?`,['user:'+userId]);
    await runner.query('DELETE FROM rate_limits WHERE key LIKE ?',['%:'+hashPrivateValue(email)]);
    await runner.query('DELETE FROM businesses WHERE id=?',[bid]);
    await runner.query('DELETE FROM users WHERE id=?',[userId]);
    const remaining=(await runner.query<{total:number}>('SELECT count(*) total FROM users WHERE id=?',[userId])).rows[0];
    if(Number(remaining.total))throw Error('Erasure did not remove the selected account.');
    return {appRowsErased:true as const,userId,businessId:bid};
  });
}
