import {createHmac,timingSafeEqual} from 'node:crypto';
import {platformEnvironment} from './platform-environment.mjs';

// S200 is a finite operator window, not a standing public copy service.
export const COPY_MAINTENANCE_START=Date.UTC(2026,10,15,22,30);
export const COPY_MAINTENANCE_END=Date.UTC(2026,10,16,1,30);
const MAX_SLOT_AGE_MINUTES=10;
const SIGNATURE_CONTEXT='africmade:s200:copy-background:v1\0';

export function isCopyMaintenanceWindow(now:number){
 return Number.isSafeInteger(now)&&now>=COPY_MAINTENANCE_START&&now<COPY_MAINTENANCE_END;
}

export function copyMaintenanceSecret(){
 const secret=platformEnvironment().SUQPAGE_POSTGRES_URL;
 if(!secret)throw new Error('Copy maintenance signing source unavailable.');
 return secret;
}

export function copyMaintenanceBody(slot:number){
 if(!Number.isSafeInteger(slot)||slot<0)throw new Error('Invalid copy maintenance slot.');
 return JSON.stringify({version:1,slot});
}

export function signCopyMaintenanceBody(body:string,secret:string){
 if(!secret)throw new Error('Copy maintenance signing source unavailable.');
 return createHmac('sha256',secret).update(SIGNATURE_CONTEXT).update(body).digest('hex');
}

export function verifyCopyMaintenanceRequest(body:string,signature:string|null,secret:string,now:number){
 if(!isCopyMaintenanceWindow(now)||body.length>80||!signature||!/^[a-f0-9]{64}$/.test(signature))return null;
 const expected=Buffer.from(signCopyMaintenanceBody(body,secret),'hex');
 if(!timingSafeEqual(expected,Buffer.from(signature,'hex')))return null;
 let raw:unknown;
 try{raw=JSON.parse(body);}catch{return null;}
 if(!raw||typeof raw!=='object'||Array.isArray(raw))return null;
 const value=raw as Record<string,unknown>;
 const slot=value.slot;
 if(value.version!==1||!Number.isSafeInteger(slot)||typeof slot!=='number'||
  body!==copyMaintenanceBody(slot)||
  slot>Math.floor(now/60000)||Math.floor(now/60000)-slot>MAX_SLOT_AGE_MINUTES)return null;
 return slot;
}
