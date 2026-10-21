import { findKnownPlace, findKnownPlaceByName } from './place-catalog';
import { runtimeGet, runtimeRun, runtimeTransaction } from './runtime-sql';
import { OwnerPageError } from './owner-page-domain';
import { parseOwnerBusinessChange, type OwnerLocation } from './owner-business-domain';
import type { SessionUser } from './types';
import {normalizeDiscoveryCategories} from './discovery-contract';
import type {KnownPlace} from './place-search';
import { currentBusinessAuthority } from './staff-business-authority';
export type LocationProposal = { business_id:number; version:number; category_key:string; city:string; region:string; country_code:string; location_mode:OwnerLocation['mode']; latitude:number|null; longitude:number|null; place_id:string|null; place_latitude:number|null; place_longitude:number|null; reviewed_version:number };
export type OwnerBusinessLocation = {city:string;region:string;country_code:string;place_id:string|null;location_mode:OwnerLocation['mode'];latitude:number|null;longitude:number|null};
type AppliedLocation = {city:string;region:string;country_code:string;city_id:string;latitude:number|null;longitude:number|null;approved_at:number;is_excluded:number};
type OwnerBusinessSetup = {
 business:{name:string;logo_path:string;content_version:number};proposal:LocationProposal|null;
 existing:AppliedLocation|undefined;place:KnownPlace|null;category:string;location?:OwnerBusinessLocation|null;
};
export async function readLocationProposal(businessId:number):Promise<LocationProposal|null>{return await runtimeGet<LocationProposal>('SELECT * FROM owner_location_proposals WHERE business_id=?',[businessId])||null;}

function effectiveLocation(proposal:LocationProposal|null,existing:AppliedLocation|undefined):OwnerBusinessLocation|null{
 const mode=proposal?.location_mode||'area';
 // A pending owner draft remains editable; a reviewed proposal is history, not
 // authority over a more recent applied administrator placement.
 if(proposal&&(proposal.reviewed_version!==proposal.version||!existing))return {
  city:proposal.city,region:proposal.region,country_code:proposal.country_code,place_id:proposal.place_id,
  location_mode:mode,latitude:mode==='storefront'?proposal.latitude:null,longitude:mode==='storefront'?proposal.longitude:null,
 };
 if(existing)return {city:existing.city,region:existing.region,country_code:existing.country_code,place_id:existing.city_id||null,
  location_mode:mode,latitude:mode==='storefront'?existing.latitude:null,longitude:mode==='storefront'?existing.longitude:null};
 return null;
}

async function ownerLocationState(businessId:number){
 const proposal=await readLocationProposal(businessId);
 const existing=await runtimeGet<AppliedLocation>('SELECT city,region,country_code,city_id,latitude,longitude,approved_at,is_excluded FROM business_discovery_profiles WHERE business_id=?',[businessId]);
 // This is the owner's single declared category, not the administrator's
 // potentially multiple marketplace classifications.
 const category=await runtimeGet<{category:string}>("SELECT declared_category_key category FROM business_onboarding_profiles WHERE business_id=? UNION ALL SELECT industry_key category FROM business_industries WHERE business_id=? LIMIT 1",[businessId,businessId]);
 return {proposal,existing,category:proposal?.category_key||category?.category||'',location:effectiveLocation(proposal,existing)};
}

function sameLocation(location:OwnerBusinessLocation|null,category:string,command:OwnerLocation):boolean{
 return Boolean(location&&category===command.category&&location.city===command.city&&location.region===command.region&&
  location.country_code===command.countryCode&&location.place_id===command.placeId&&location.location_mode===command.mode&&
  location.latitude===command.latitude&&location.longitude===command.longitude);
}
async function assertBusinessEditor(actor:SessionUser,businessId:number,lock=false){
 if(!await currentBusinessAuthority(actor,businessId,lock))throw new OwnerPageError('Business details are not available for this account.',403);
}
export async function readOwnerBusiness(actor:SessionUser,businessId:number):Promise<OwnerBusinessSetup>{
 await assertBusinessEditor(actor,businessId);
 const business=await runtimeGet<{name:string;logo_path:string;content_version:number}>('SELECT name,logo_path,content_version FROM businesses WHERE id=?',[businessId]);
 if(!business)throw new OwnerPageError('Business not found.',404);
 const state=await ownerLocationState(businessId);
 const place=findKnownPlace(state.location?.place_id||'');
 return {business,...state,place};
}
export async function saveOwnerBusiness(actor:SessionUser,businessId:number,raw:Record<string,unknown>,logoRef?:string){
 const command=parseOwnerBusinessChange(raw, findKnownPlace);
 await assertBusinessEditor(actor,businessId);
 if(logoRef!==undefined&&!new RegExp(`^/media/product-private-${businessId}-[a-f0-9-]{36}\\.(png|jpg|webp)$`).test(logoRef)&&logoRef!=='')throw new OwnerPageError('Invalid business logo.');
 return runtimeTransaction(async()=>{
  await assertBusinessEditor(actor,businessId,true);
  const changed=await runtimeRun('UPDATE businesses SET name=?,content_version=content_version+1 WHERE id=? AND content_version=?',[command.name,businessId,command.expectedVersion]);
  if(changed.changes!==1)throw new OwnerPageError('Business details changed. Reload before saving.',409);
  const {proposal,location,category}=await ownerLocationState(businessId);
  if((proposal?.version||0)!==command.locationVersion)throw new OwnerPageError('Location details changed. Reload before saving.',409);
  if(logoRef!==undefined)await runtimeRun('UPDATE businesses SET logo_path=? WHERE id=?',[logoRef,businessId]);
  const loc=command.location;
  if(loc&&!sameLocation(location,category,loc)){
   await runtimeRun(`INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,latitude,longitude,place_id,place_latitude,place_longitude,country_code,reviewed_version,updated_at) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,0,?)
    ON CONFLICT(business_id) DO UPDATE SET version=excluded.version,category_key=excluded.category_key,city=excluded.city,region=excluded.region,location_mode=excluded.location_mode,latitude=excluded.latitude,longitude=excluded.longitude,place_id=excluded.place_id,place_latitude=excluded.place_latitude,place_longitude=excluded.place_longitude,country_code=excluded.country_code,updated_at=excluded.updated_at`,[businessId,(proposal?.version||0)+1,loc.category,loc.city,loc.region,loc.mode,loc.latitude,loc.longitude,loc.placeId,loc.placeLatitude,loc.placeLongitude,loc.countryCode,Date.now()]);
   await applyLocation(businessId, loc);
  }
  const action=actor.access_role==='client'?'business.owner_details_updated':actor.access_role==='platform_admin'?'business.admin_details_updated':'business.staff_details_updated';
  await runtimeRun("INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,'')",[actor.id,businessId,action,JSON.stringify({locationSubmitted:Boolean(loc),contentVersion:command.expectedVersion+1})]);
  return {contentVersion:command.expectedVersion+1};
 });
}

// Call inside a transaction holding the business row lock.
async function applyLocation(businessId:number,loc:OwnerLocation):Promise<void>{
   const place = loc.placeId ? findKnownPlace(loc.placeId) : findKnownPlaceByName(loc.city, loc.region, loc.countryCode);
   const latitude = loc.mode === 'storefront' ? loc.latitude : place ? Math.round(place.latitude * 10) / 10 : null;
   const longitude = loc.mode === 'storefront' ? loc.longitude : place ? Math.round(place.longitude * 10) / 10 : null;
   await runtimeRun('DELETE FROM business_industries WHERE business_id=?',[businessId]);
   for(const category of normalizeDiscoveryCategories(loc.category))
    await runtimeRun('INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)',[businessId,category]);
   if (latitude !== null && longitude !== null) {
    await runtimeRun(`INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at,country_code,city_id)
     VALUES(?,?,?,?,?,?,?,?,?,?) ON CONFLICT(business_id) DO UPDATE SET city=excluded.city,zone=excluded.zone,
     country_code=excluded.country_code,city_id=excluded.city_id,region=excluded.region,latitude=excluded.latitude,longitude=excluded.longitude,approved_at=excluded.approved_at,updated_at=excluded.updated_at`,
     [businessId,loc.city,loc.city,loc.region,latitude,longitude,Date.now(),Date.now(),place?.countryCode||'',place?.id||'']);
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
 const {location}=parseOwnerBusinessChange({name:business.name,expectedVersion:1,locationVersion:proposal.version,category:proposal.category_key,city:proposal.city,region:proposal.region,...(proposal.country_code?{countryCode:proposal.country_code}:{}),mode:proposal.location_mode,latitude:proposal.latitude,longitude:proposal.longitude,placeId:proposal.place_id||""},findKnownPlace);
 if(!location)return false;
 await applyLocation(businessId,location);
 return true;
}
