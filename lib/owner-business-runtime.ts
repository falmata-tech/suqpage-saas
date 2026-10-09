import { findKnownPlace, findKnownPlaceByName } from './place-catalog';
import { runtimeGet, runtimeRun, runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import { parseOwnerBusinessChange, type OwnerLocation } from './owner-business-domain';
import type { SessionUser } from './types';
import {normalizeDiscoveryCategories} from './discovery-contract';
export type LocationProposal = { business_id:number; version:number; category_key:string; city:string; region:string; location_mode:OwnerLocation['mode']; latitude:number|null; longitude:number|null; place_id:string|null; place_latitude:number|null; place_longitude:number|null; reviewed_version:number };
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
 const command=parseOwnerBusinessChange(raw, findKnownPlace);
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
  if(loc&&(!proposal||proposal.reviewed_version!==proposal.version||proposal.category_key!==loc.category||proposal.city!==loc.city||proposal.region!==loc.region||proposal.location_mode!==loc.mode||proposal.latitude!==loc.latitude||proposal.longitude!==loc.longitude||proposal.place_id!==loc.placeId)){
   await runtimeRun(`INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,latitude,longitude,place_id,place_latitude,place_longitude,reviewed_version,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,0,?)
    ON CONFLICT(business_id) DO UPDATE SET version=excluded.version,category_key=excluded.category_key,city=excluded.city,region=excluded.region,location_mode=excluded.location_mode,latitude=excluded.latitude,longitude=excluded.longitude,place_id=excluded.place_id,place_latitude=excluded.place_latitude,place_longitude=excluded.place_longitude,updated_at=excluded.updated_at`,[businessId,(proposal?.version||0)+1,loc.category,loc.city,loc.region,loc.mode,loc.latitude,loc.longitude,loc.placeId,loc.placeLatitude,loc.placeLongitude,Date.now()]);
   await applyLocation(businessId, loc);
  }
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,'business.owner_details_updated',?,'')",[actor.id,businessId,JSON.stringify({locationSubmitted:Boolean(loc),contentVersion:command.expectedVersion+1})]);
  return {contentVersion:command.expectedVersion+1};
 });
}

// Call inside a transaction holding the business row lock.
async function applyLocation(businessId:number,loc:OwnerLocation):Promise<void>{
   const place = loc.placeId ? findKnownPlace(loc.placeId) : findKnownPlaceByName(loc.city, loc.region);
   const latitude = loc.mode === 'storefront' ? loc.latitude : place ? Math.round(place.latitude * 10) / 10 : null;
   const longitude = loc.mode === 'storefront' ? loc.longitude : place ? Math.round(place.longitude * 10) / 10 : null;
   await runtimeRun('DELETE FROM business_industries WHERE business_id=?',[businessId]);
   for(const category of normalizeDiscoveryCategories(loc.category))
    await runtimeRun('INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)',[businessId,category]);
   if (latitude !== null && longitude !== null) {
    await runtimeRun(`INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at)
     VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET city=excluded.city,zone=excluded.zone,
     region=excluded.region,latitude=excluded.latitude,longitude=excluded.longitude,approved_at=excluded.approved_at,updated_at=excluded.updated_at`,
     [businessId,loc.city,loc.city,loc.region,latitude,longitude,Date.now(),Date.now()]);
   } else {
    // A text-only area has no verified coordinates; remove any former precise pin.
    await runtimeRun('UPDATE business_discovery_profiles SET approved_at=0 WHERE business_id=?',[businessId]);
   }
   await runtimeRun('UPDATE owner_location_proposals SET reviewed_version=version WHERE business_id=?',[businessId]);
}

/** Complete saved setup during publication; never replace an applied admin placement. */
export async function applyPendingOwnerLocation(businessId:number):Promise<boolean>{
 const proposal=await readLocationProposal(businessId);
 if(!proposal||proposal.reviewed_version===proposal.version)return false;
 const business=await runtimeGet<{name:string;status:string}>("SELECT name,status FROM businesses WHERE id=?",[businessId]);
 if(!business||business.status!=="active")return false;
 const {location}=parseOwnerBusinessChange({name:business.name,expectedVersion:1,locationVersion:proposal.version,category:proposal.category_key,city:proposal.city,region:proposal.region,mode:proposal.location_mode,latitude:proposal.latitude,longitude:proposal.longitude,placeId:proposal.place_id||""},findKnownPlace);
 if(!location)return false;
 await applyLocation(businessId,location);
 return true;
}
