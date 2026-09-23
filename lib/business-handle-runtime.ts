import type {SessionUser} from './types';
import {parseBusinessHandle, nextHandleChangeAt} from './business-handle';
import {runtimeGet, runtimeRun, runtimeTransaction} from './runtime-sql';

export type HandleSettings = {handle:string; contentVersion:number; nextChangeAt:number};
async function authorize(actor:SessionUser,businessId:number) {
  const user=await runtimeGet<{business_id:number|null;access_role:string}>(
    'SELECT u.business_id,p.access_role FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=?',[actor.id]);
  const admin=actor.access_role==='platform_admin' && user?.access_role==='platform_admin';
  const owner=actor.access_role==='client' && actor.business_id===businessId && user?.access_role==='client' && user.business_id===businessId;
  if(!Number.isSafeInteger(businessId)||businessId<1||(!admin&&!owner))throw new Error('You cannot change this page handle.');
  return {admin};
}
export async function readHandleSettings(actor:SessionUser,businessId:number):Promise<HandleSettings> {
  await authorize(actor,businessId);
  const row=await runtimeGet<{handle:string;content_version:number;handle_changed_at:number}>('SELECT handle,content_version,handle_changed_at FROM businesses WHERE id=?',[businessId]);
  if(!row)throw new Error('Business not found.');
  return {handle:row.handle,contentVersion:row.content_version,nextChangeAt:nextHandleChangeAt(Number(row.handle_changed_at))};
}
export async function changeBusinessHandle(actor:SessionUser,businessId:number,raw:{handle:unknown;expectedVersion:unknown;reason?:unknown}) {
  const handle=parseBusinessHandle(raw.handle);
  const version=Number(raw.expectedVersion);
  if(!Number.isSafeInteger(version)||version<1)throw new Error('Reload before saving your handle.');
  const reason=String(raw.reason??'').trim();
  const {admin}=await authorize(actor,businessId);
  if(admin&&(reason.length<5||reason.length>300))throw new Error('Add a support reason using 5–300 characters.');
  try {
    return await runtimeTransaction(async()=>{
      await authorize(actor,businessId);
      const row=await runtimeGet<{handle:string;content_version:number;handle_changed_at:number}>('SELECT handle,content_version,handle_changed_at FROM businesses WHERE id=? FOR UPDATE',[businessId]);
      if(!row)throw new Error('Business not found.');
      if(row.handle===handle)return {oldHandle:handle,handle};
      if(row.content_version!==version)throw new Error('Business details changed. Reload before saving.');
      const now=Date.now();
      if(!admin&&nextHandleChangeAt(Number(row.handle_changed_at))>now)throw new Error('You can change your handle once every 30 days. Contact support for help.');
      const reserved=await runtimeGet<{business_id:number}>('SELECT business_id FROM business_handles WHERE handle=?',[handle]);
      if(reserved)throw new Error('This handle is already taken. Choose another.');
      await runtimeRun('UPDATE businesses SET handle=?,handle_changed_at=?,content_version=content_version+1 WHERE id=?',[handle,now,businessId]);
      await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'business.handle_changed',?,'')",[actor.id,businessId,JSON.stringify({oldHandle:row.handle,handle,override:admin,...(admin?{reason}:{})})]);
      return {oldHandle:row.handle,handle};
    });
  }catch(error){
    if(error instanceof Error&&'code' in error&&error.code==='23505')throw new Error('This handle is already taken. Choose another.');
    throw error;
  }
}
