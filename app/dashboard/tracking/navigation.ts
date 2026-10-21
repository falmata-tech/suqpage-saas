import type {SessionUser} from '@/lib/types';
import {normalizeSearch} from '@/lib/pagination';
import type {TrackingDeliveryState} from '@/lib/tracking-contract';

export type TrackingStaffView={q?:string;cursor?:string};
export const trackingDeliveryKey:Record<TrackingDeliveryState,string>={queued:'Initial email queued.',sending:'Email is being sent.',accepted:'Email accepted for sending.',deferred:'Email delivery deferred.',failed:'Email could not be sent.',cancelled:'Email cancelled.'};
/** Navigation hint only; application ports always check current database authority. */
export function canUseStaffTracking(actor:SessionUser){return actor.access_role==='platform_admin'||actor.access_role==='operations_manager'||actor.access_role==='team_member'&&(actor.staff_queue_scope==='transport'||actor.staff_queue_scope==='all');}
export function trackingStaffView(raw:Record<string,unknown>):TrackingStaffView{
 const q=typeof raw.q==='string'?normalizeSearch(raw.q):'',cursor=typeof raw.cursor==='string'&&/^[1-9]\d{0,19}$/.test(raw.cursor)?raw.cursor:undefined;
 return{...(q?{q}:{}),...(cursor?{cursor}:{})};
}
export function trackingStaffHref(view:TrackingStaffView={},id?:number,options:{edit?:boolean;saved?:boolean;created?:boolean;revoked?:boolean}={}){
 if(id!==undefined&&(!Number.isSafeInteger(id)||id<1))throw Error('Invalid shipment link.');
 const params=new URLSearchParams(trackingStaffView(view));
 for(const[key,value]of Object.entries(options))if(value)params.set(key,'1');
 return'/dashboard/tracking'+(id===undefined?'':'/'+id)+(params.size?'?'+params:'');
}
export function trackingStaffFormView(form:Pick<FormData,'get'>){return trackingStaffView({q:form.get('nav_q'),cursor:form.get('nav_cursor')});}
