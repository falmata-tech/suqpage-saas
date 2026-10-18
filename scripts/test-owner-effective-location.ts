import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {readOwnerBusiness,saveOwnerBusiness} from '../lib/owner-business-runtime';
import {runtimeUserById} from '../lib/catalog-runtime';
import {findPlaceSuggestions} from '../lib/place-catalog';
import {updateDiscoveryProfile} from '../lib/discovery-admin';
import {OwnerPageError} from '../lib/owner-page-domain';

async function main(){
 const db=await getDb();
 try{
  const schema=String((await db.prepare('SELECT current_schema() name').get()).name);assert.match(schema,/^suqpage_test_[a-f0-9]{32}$/);
  const addis=findPlaceSuggestions('Addis Ababa','ET')[0],nairobi=findPlaceSuggestions('Nairobi','KE')[0],cape=findPlaceSuggestions('Cape Town','ZA')[0];assert.ok(addis&&nairobi&&cape);
  let ordinal=0;
  async function make({proposal=true,profile=true,mode='area'}:{proposal?:boolean;profile?:boolean;mode?:'area'|'storefront'}={}){
   const handle='effective-location-'+(++ordinal);
   const id=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition','draft')").run(handle,'Saved owner business')).insertedId);
   const userId=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,'unused','Fixture owner','owner',?,0)").run(handle+'@example.test',id)).insertedId);
   await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
   await db.prepare("INSERT INTO business_onboarding_profiles(business_id,declared_category_key,idempotency_key,created_at,updated_at) VALUES(?,'home-living',?,1,1)").run(id,crypto.randomUUID());
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'home-living'),(?,'fashion-textiles')").run(id,id);
   await db.prepare('INSERT INTO discovery_sponsorships(business_id,position,active,updated_at) VALUES(?,4,1,100)').run(id);
   if(proposal)await db.prepare(`INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,country_code,location_mode,latitude,longitude,place_id,place_latitude,place_longitude,reviewed_version,updated_at)
    VALUES(?,1,'home-living',?,?,'ET',?,?,?,?,?,?,1,100)`).run(id,addis.name,addis.region,mode,mode==='storefront'?9.012345:null,mode==='storefront'?38.712345:null,addis.id,addis.latitude,addis.longitude);
   if(profile)await db.prepare(`INSERT INTO business_discovery_profiles(business_id,city,zone,region,country_code,city_id,latitude,longitude,booth_image_path,fallback_style,production_scale,is_featured,is_excluded,approved_at,updated_at)
    VALUES(?,?,'Retained neighbourhood',?,'ET',?,?,?,'/seed/retained.png','technical','growing_factory',1,1,100,101)`).run(id,addis.name,addis.region,addis.id,mode==='storefront'?9.012345:9.0,mode==='storefront'?38.712345:38.7);
   return {id,owner:(await runtimeUserById(userId))!};
  }
  async function state(id:number){return {
   business:await db.prepare('SELECT * FROM businesses WHERE id=?').get(id),
   profile:await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(id),
   proposal:await db.prepare('SELECT * FROM owner_location_proposals WHERE business_id=?').get(id),
   industries:await db.prepare('SELECT * FROM business_industries WHERE business_id=? ORDER BY industry_key').all(id),
   sponsor:await db.prepare('SELECT * FROM discovery_sponsorships WHERE business_id=?').get(id),
   onboarding:await db.prepare('SELECT * FROM business_onboarding_profiles WHERE business_id=?').get(id),
   audit:await db.prepare('SELECT * FROM audit_logs WHERE business_id=? ORDER BY id').all(id),
  };}
  type Setup=Awaited<ReturnType<typeof readOwnerBusiness>>;
  const command=(setup:Setup,name='Renamed fixture')=>{const loc=setup.location;return {name,expectedVersion:setup.business.content_version,locationVersion:setup.proposal?.version||0,...(loc?{category:setup.category,city:loc.city,region:loc.region,countryCode:loc.country_code,placeId:loc.place_id||'',mode:loc.location_mode,latitude:loc.latitude,longitude:loc.longitude}:{})};};
  const unchangedGeography=(after:Awaited<ReturnType<typeof state>>,before:Awaited<ReturnType<typeof state>>)=>{
   for(const key of ['profile','proposal','industries','sponsor','onboarding'] as const)assert.deepEqual(after[key],before[key],key+' remains byte-for-byte authoritative on an unrelated owner save');
  };
  const conflict=(error:unknown)=>error instanceof OwnerPageError&&error.status===409;
  const forbidden=(error:unknown)=>error instanceof OwnerPageError&&error.status===403;

  // Reproduce the real defect through the existing admin adapter, not direct
  // fabricated owner projections: reviewed Addis history plus applied Nairobi.
  const current=await make(),foreign=await make();const foreignBefore=await state(foreign.id);
  const preAdmin=await readOwnerBusiness(current.owner,current.id);
  const adminBefore=await state(current.id);
  await updateDiscoveryProfile({businessId:current.id,proposalVersion:1,placeId:nairobi.id,countryCode:'KE',latitude:-1.3,longitude:36.9});
  const applied=await state(current.id);
  assert.equal(applied.business.content_version,adminBefore.business.content_version+1,'A location correction fences owner editors opened before the admin save');
  assert.deepEqual(applied.proposal,adminBefore.proposal,'Admin placement does not rewrite reviewed proposal history');
  assert.deepEqual(applied.industries,adminBefore.industries);assert.deepEqual(applied.sponsor,adminBefore.sponsor);
  await assert.rejects(()=>saveOwnerBusiness(current.owner,current.id,command(preAdmin,'Stale pre-admin owner name')),conflict);assert.deepEqual(await state(current.id),applied,'A pre-admin owner form cannot restore the old country, pin or name');
  await assert.rejects(()=>updateDiscoveryProfile({businessId:current.id,proposalVersion:1,placeId:nairobi.id,countryCode:'ET'}),/selected country/);assert.deepEqual(await state(current.id),applied,'Rejected admin geography does not increment the version or partially write');
  const version=applied.business.content_version;
  await updateDiscoveryProfile({businessId:current.id,proposalVersion:1,boothImagePath:'/seed/new-booth.png'});assert.equal((await state(current.id)).business.content_version,version,'Unrelated admin metadata does not pretend geography changed');
  const beforeName=await state(current.id),fresh=await readOwnerBusiness(current.owner,current.id);
  assert.deepEqual(fresh.location,{city:nairobi.name,region:nairobi.region,country_code:'KE',place_id:nairobi.id,location_mode:'area',latitude:null,longitude:null});
  assert.equal(fresh.place?.id,nairobi.id);assert.equal(fresh.proposal?.city,addis.name);assert.equal(fresh.proposal?.version,1);
  assert.equal(fresh.category,'home-living','The owner declared category stays distinct from multiple admin marketplace classifications');
  await saveOwnerBusiness(current.owner,current.id,command(fresh));const named=await state(current.id);assert.equal(named.business.name,'Renamed fixture');unchangedGeography(named,beforeName);assert.deepEqual([named.profile.latitude,named.profile.longitude],[-1.3,36.9]);
  const logoSetup=await readOwnerBusiness(current.owner,current.id),logo='/media/product-private-'+current.id+'-'+crypto.randomUUID()+'.png';
  await saveOwnerBusiness(current.owner,current.id,command(logoSetup,named.business.name),logo);const logoSaved=await state(current.id);assert.equal(logoSaved.business.logo_path,logo);unchangedGeography(logoSaved,named);
  const rejected=await state(current.id),latest=await readOwnerBusiness(current.owner,current.id);
  await assert.rejects(()=>saveOwnerBusiness(current.owner,current.id,{...command(latest),locationVersion:0}),conflict);assert.deepEqual(await state(current.id),rejected);
  await assert.rejects(()=>saveOwnerBusiness(current.owner,current.id,{...command(latest),expectedVersion:latest.business.content_version-1}),conflict);assert.deepEqual(await state(current.id),rejected);
  await assert.rejects(()=>readOwnerBusiness(current.owner,foreign.id),forbidden);
  await assert.rejects(()=>saveOwnerBusiness(current.owner,foreign.id,command(latest)),forbidden);
  await assert.rejects(()=>readOwnerBusiness({...current.owner,business_id:foreign.id},foreign.id),forbidden,'Canonical DB ownership rejects a forged actor business');
  await db.prepare("UPDATE user_access_profiles SET access_role='team_member' WHERE user_id=?").run(current.owner.id);
  await assert.rejects(()=>saveOwnerBusiness(current.owner,current.id,command(latest)),forbidden,'The runtime rechecks current role rather than trusting a stale session');
  await db.prepare("UPDATE user_access_profiles SET access_role='client' WHERE user_id=?").run(current.owner.id);assert.deepEqual(await state(current.id),rejected);assert.deepEqual(await state(foreign.id),foreignBefore);

  // Deliberate owner changes still apply immediately, advance proposal history
  // once, preserve unrelated profile metadata and enforce declared area privacy.
  const deliberate=await readOwnerBusiness(current.owner,current.id);
  await saveOwnerBusiness(current.owner,current.id,{...command(deliberate,'Chosen owner location'),category:'agriculture-growers',placeId:cape.id,countryCode:'ZA',city:cape.name,region:cape.region});
  const moved=await state(current.id);assert.equal(moved.profile.city_id,cape.id);assert.equal(moved.profile.country_code,'ZA');assert.deepEqual([moved.profile.latitude,moved.profile.longitude],[Math.round(cape.latitude*10)/10,Math.round(cape.longitude*10)/10]);assert.equal(moved.proposal.version,2);assert.equal(moved.proposal.reviewed_version,2);assert.equal(moved.proposal.place_id,cape.id);assert.equal(moved.proposal.category_key,'agriculture-growers');assert.equal(moved.proposal.latitude,null);assert.deepEqual(moved.industries.map(row=>row.industry_key),['agriculture-growers']);
  for(const key of ['booth_image_path','fallback_style','production_scale','is_featured','is_excluded'])assert.equal(moved.profile[key],rejected.profile[key],key);
  assert.deepEqual(moved.sponsor,rejected.sponsor);assert.deepEqual(moved.onboarding,rejected.onboarding);
  const storefront=await readOwnerBusiness(current.owner,current.id);
  await saveOwnerBusiness(current.owner,current.id,{...command(storefront),mode:'storefront',latitude:-33.925551,longitude:18.422221});const precise=await state(current.id);assert.deepEqual([precise.profile.latitude,precise.profile.longitude],[-33.925551,18.422221]);assert.equal(precise.proposal.version,3);
  await updateDiscoveryProfile({businessId:current.id,proposalVersion:3,placeId:nairobi.id,countryCode:'KE',latitude:-1.312345,longitude:36.912345});
  const preciseBefore=await state(current.id),preciseRead=await readOwnerBusiness(current.owner,current.id);assert.deepEqual([preciseRead.location?.latitude,preciseRead.location?.longitude],[-1.312345,36.912345]);assert.equal(preciseRead.location?.location_mode,'storefront');
  await saveOwnerBusiness(current.owner,current.id,command(preciseRead,'Storefront rename'));unchangedGeography(await state(current.id),preciseBefore);

  // Pending proposals remain the owner's displayed draft; unrelated names do
  // not implicitly apply or rewrite it over an existing administrator profile.
  await db.prepare(`UPDATE owner_location_proposals SET version=4,reviewed_version=3,city=?,region=?,country_code='ET',place_id=?,place_latitude=?,place_longitude=?,location_mode='area',latitude=NULL,longitude=NULL WHERE business_id=?`).run(addis.name,addis.region,addis.id,addis.latitude,addis.longitude,current.id);
  const pendingBefore=await state(current.id),pending=await readOwnerBusiness(current.owner,current.id);assert.equal(pending.location?.city,addis.name);assert.equal(pending.place?.id,addis.id);assert.equal(pending.existing?.city,nairobi.name);assert.equal(pending.location?.latitude,null);
  await saveOwnerBusiness(current.owner,current.id,command(pending,'Pending draft rename'));unchangedGeography(await state(current.id),pendingBefore);

  // Compatible old records need no synthetic proposal or invented location.
  const noProposal=await make({proposal:false});await updateDiscoveryProfile({businessId:noProposal.id,placeId:nairobi.id,countryCode:'KE',latitude:-1.22,longitude:36.88});
  const noProposalBefore=await state(noProposal.id),appliedOnly=await readOwnerBusiness(noProposal.owner,noProposal.id);assert.equal(appliedOnly.proposal,null);assert.equal(appliedOnly.place?.id,nairobi.id);assert.equal(appliedOnly.location?.location_mode,'area');assert.equal(appliedOnly.location?.latitude,null);await saveOwnerBusiness(noProposal.owner,noProposal.id,command(appliedOnly));unchangedGeography(await state(noProposal.id),noProposalBefore);
  const noProfile=await make({profile:false}),proposalOnly=await readOwnerBusiness(noProfile.owner,noProfile.id),noProfileBefore=await state(noProfile.id);assert.equal(proposalOnly.location?.place_id,addis.id);await saveOwnerBusiness(noProfile.owner,noProfile.id,command(proposalOnly));unchangedGeography(await state(noProfile.id),noProfileBefore);assert.equal((await state(noProfile.id)).profile,undefined);
  const missing=await make({profile:false,proposal:false}),empty=await readOwnerBusiness(missing.owner,missing.id);assert.equal(empty.location,null);assert.equal(empty.place,null);await saveOwnerBusiness(missing.owner,missing.id,command(empty));assert.equal((await state(missing.id)).profile,undefined);assert.equal((await state(missing.id)).proposal,undefined);
  const legacy=await make({proposal:false});await db.prepare("UPDATE business_discovery_profiles SET city='Unknown legacy town',region='Unknown legacy region',country_code='',city_id='' WHERE business_id=?").run(legacy.id);const legacyRead=await readOwnerBusiness(legacy.owner,legacy.id),legacyBefore=await state(legacy.id);assert.equal(legacyRead.location?.city,'Unknown legacy town');assert.equal(legacyRead.place,null);await saveOwnerBusiness(legacy.owner,legacy.id,{name:'Legacy rename',expectedVersion:legacyRead.business.content_version,locationVersion:0});unchangedGeography(await state(legacy.id),legacyBefore);
  console.log('PASS BE-054 S122 isolated PostgreSQL: applied versus reviewed/pending projection, exact name/logo-only geography/history/industry preservation, admin version fencing and rejected metadata semantics, deliberate owner location/category/privacy changes, missing/legacy compatibility and fresh role/tenant/version denial.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
