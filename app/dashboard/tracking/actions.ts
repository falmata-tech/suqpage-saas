"use server";

import {revalidatePath} from 'next/cache';
import {redirect} from 'next/navigation';
import {requireUser} from '@/lib/auth';
import type {OwnerEditResult} from '@/lib/owner-edit-contract';
import {parseTrackingSubmit,parseTrackingUpdate,parseTrackingRevoke,parseTrackingLegsJson,TrackingError} from '@/lib/tracking-contract';
import {submitTrackingShipment,updateTrackingShipment,revokeTrackingShipment} from '@/lib/tracking';
import {scheduleTrackingEmailDelivery} from '@/lib/tracking-after';
import {trackingStaffFormView,trackingStaffHref} from './navigation';

function fields(form:FormData,kind:'create'|'edit'|'revoke'){
 const allowed=new Set(['expectedVersion','nav_q','nav_cursor',...(kind==='create'?['recipientEmail','label','idempotencyKey','legs']:kind==='edit'?['shipmentId','reference','label','legs']:['shipmentId','reference'])]),seen=new Set<string>();
 for(const[key,value]of form){if(!allowed.has(key)||seen.has(key)||typeof value!=='string')throw new TrackingError('Check the shipment details.','invalid');seen.add(key);}
}
function integer(form:FormData,key:string){const value=form.get(key);return typeof value==='string'&&/^(?:0|[1-9]\d{0,15})$/.test(value)?Number(value):NaN;}
function legs(form:FormData):unknown{return parseTrackingLegsJson(form.get('legs'));}
function errorResult(error:unknown){return{error:error instanceof TrackingError?error.message:'Unable to connect. Please try again.'};}

export async function submitShipmentAction(form:FormData):Promise<OwnerEditResult>{
 const actor=await requireUser();let id:number;
 try{
  fields(form,'create');if(integer(form,'expectedVersion')!==0)throw new TrackingError('Check the shipment details.','invalid');
  const input=parseTrackingSubmit({recipientEmail:form.get('recipientEmail'),label:form.get('label'),idempotencyKey:form.get('idempotencyKey'),legs:legs(form)});
  id=(await submitTrackingShipment(actor,input)).id;
 }catch(error){return errorResult(error);}
 scheduleTrackingEmailDelivery();
 revalidatePath('/dashboard/tracking');redirect(trackingStaffHref(trackingStaffFormView(form),id,{created:true}));
}
export async function updateShipmentAction(form:FormData):Promise<OwnerEditResult>{
 const actor=await requireUser();let id:number;
 try{
  fields(form,'edit');const input=parseTrackingUpdate({shipmentId:integer(form,'shipmentId'),reference:form.get('reference'),expectedVersion:integer(form,'expectedVersion'),label:form.get('label'),legs:legs(form)});
  id=(await updateTrackingShipment(actor,input)).id;
 }catch(error){return errorResult(error);}
 revalidatePath('/dashboard/tracking');revalidatePath('/dashboard/tracking/'+id);redirect(trackingStaffHref(trackingStaffFormView(form),id,{saved:true}));
}
export async function revokeShipmentAction(form:FormData):Promise<OwnerEditResult>{
 const actor=await requireUser();let id:number;
 try{
  fields(form,'revoke');const input=parseTrackingRevoke({shipmentId:integer(form,'shipmentId'),reference:form.get('reference'),expectedVersion:integer(form,'expectedVersion')});
  id=(await revokeTrackingShipment(actor,input)).id;
 }catch(error){return errorResult(error);}
 revalidatePath('/dashboard/tracking');revalidatePath('/dashboard/tracking/'+id);redirect(trackingStaffHref(trackingStaffFormView(form),id,{revoked:true}));
}
