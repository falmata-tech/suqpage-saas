import { runtimeGet, runtimeRun, runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import { parseOwnerBusinessChange, type OwnerLocation } from './owner-business-domain';
import type { SessionUser } from './types';
export type LocationProposal = { business_id:number; version:number; category_key:string; city:string; region:string; location_mode:OwnerLocation['mode']; latitude:number|null; longitude:number|null; reviewed_version:number };
export async function readLocationProposal(businessId:number):Promise<LocationProposal|null>{return await runtimeGet<LocationProposal>('SELECT * FROM owner_location_proposals WHERE business_id=?',[businessId])||null;}
async function assertOwner(actor:SessionUser,businessId:number){
 if(actor.access_role!=='client'||actor.business_id!==businessId||!Number.isSafeInteger(businessId)||businessId<1||!await runtimeGet("SELECT 1 FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE u.id=? AND u.business_id=? AND p.access_role='client'",[actor.id,businessId]))throw new OwnerPageError('Only the owner can update these business details.',403);
}
export async function readOwnerBusiness(actor:SessionUser,businessId:number){
 await assertOwner(actor,businessId);
 const business=await runtimeGet<{name:string;logo_path:string;content_version:number}>('SELECT name,logo_path,content_version FROM businesses WHERE id=?',[businessId]);
 if(!business)throw new OwnerPageError('Business not found.',404);
 const proposal=await readLocationProposal(businessId);
 const existing=await runtimeGet<{city:string;region:string;approved_at:number;is_excluded:number}>('SELECT city,region,approved_at,is_excluded FROM business_discovery_profiles WHERE business_id=?',[businessId]);
 const category=await runtimeGet<{category:string}>("SELECT declared_category_key category FROM business_onboarding_profiles WHERE business_id=? UNION ALL SELECT industry_key category FROM business_industries WHERE business_id=? LIMIT 1",[businessId,businessId]);
 return {business,proposal,existing,category:proposal?.category_key||category?.category||''};
}
export async function saveOwnerBusiness(actor:SessionUser,businessId:number,raw:Record<string,unknown>,logoRef?:string){
 const command=parseOwnerBusinessChange(raw);
 await assertOwner(actor,businessId);
 if(logoRef!==undefined&&!new RegExp(`^/media/product-private-${businessId}-[a-f0-9-]{36}\\.(png|jpg|webp)$`).test(logoRef)&&logoRef!=='')throw new OwnerPageError('Invalid business logo.');
 return runtimeTransaction(async()=>{
  await assertOwner(actor,businessId);
  const changed=await runtimeRun('UPDATE businesses SET name=?,content_version=content_version+1 WHERE id=? AND content_version=?',[command.name,businessId,command.expectedVersion]);
  if(changed.changes!==1)throw new OwnerPageError('Business details changed. Reload before saving.',409);
  const proposal=await readLocationProposal(businessId);
  if((proposal?.version||0)!==command.locationVersion)throw new OwnerPageError('Location details changed. Reload before saving.',409);
  if(logoRef!==undefined)await runtimeRun('UPDATE businesses SET logo_path=? WHERE id=?',[logoRef,businessId]);
  const loc=command.location;
  if(loc&&(!proposal||proposal.category_key!==loc.category||proposal.city!==loc.city||proposal.region!==loc.region||proposal.location_mode!==loc.mode||proposal.latitude!==loc.latitude||proposal.longitude!==loc.longitude)){
   await runtimeRun(`INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,latitude,longitude,reviewed_version,updated_at) VALUES(?,?,?,?,?,?,?,?,0,?)
    ON CONFLICT(business_id) DO UPDATE SET version=excluded.version,category_key=excluded.category_key,city=excluded.city,region=excluded.region,location_mode=excluded.location_mode,latitude=excluded.latitude,longitude=excluded.longitude,updated_at=excluded.updated_at`,[businessId,(proposal?.version||0)+1,loc.category,loc.city,loc.region,loc.mode,loc.latitude,loc.longitude,Date.now()]);
   // Disable the previous placement immediately, especially after a privacy change.
   await runtimeRun('UPDATE business_discovery_profiles SET approved_at=0 WHERE business_id=?',[businessId]);
  }
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'business.owner_details_updated',?,'')",[actor.id,businessId,JSON.stringify({locationSubmitted:Boolean(loc),contentVersion:command.expectedVersion+1})]);
  return {contentVersion:command.expectedVersion+1};
 });
}
