import type {SessionUser} from './types';
import {parseBusinessHandle, nextHandleChangeAt} from './business-handle';
import {runtimeGet, runtimeRun, runtimeTransaction} from './runtime-sql';
import { currentBusinessAuthority } from './staff-business-authority';

export type HandleSettings = {handle:string; contentVersion:number; nextChangeAt:number};
async function authorize(actor:SessionUser,businessId:number,lock=false) {
  const authority=await currentBusinessAuthority(actor,businessId,lock);
  if(!authority)throw new Error('You cannot change this page handle.');
  return {admin:authority==='administrator'};
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
      await authorize(actor,businessId,true);
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
