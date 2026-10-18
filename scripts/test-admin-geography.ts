import assert from 'node:assert/strict';
import {getDb,closeDbForTests} from './testing/postgres-fixture';
import {getDiscoveryProfileAdminView,updateDiscoveryProfile} from '../lib/discovery-admin';
import {findPlaceSuggestions} from '../lib/place-catalog';

async function main(){
  const db=await getDb();
  try{
    const nairobi=findPlaceSuggestions('Nairobi','KE')[0],cape=findPlaceSuggestions('Cape Town','ZA')[0];
    assert.ok(nairobi&&cape);
    const make=async(handle:string)=>Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition','active')").run(handle,handle)).insertedId);
    const id=await make('s122-canonical-location'),other=await make('s122-other-location'),missing=await make('s122-missing-location');
    await db.prepare(`INSERT INTO business_discovery_profiles(business_id,city,zone,region,country_code,city_id,latitude,longitude,booth_image_path,fallback_style,production_scale,is_featured,is_excluded,approved_at,updated_at)
      VALUES(?,?,?,?,?,?,-1.29991,36.82221,'/seed/retained.png','textile','growing_factory',1,1,1,1)`).run(id,nairobi.name,'Legacy neighbourhood',nairobi.region,'KE',nairobi.id);
    await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at) VALUES(?,'Unknown legacy town','','',0,0,0,1)").run(other);
    await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'fashion-textiles'),(?,'home-living')").run(id,id);
    await db.prepare('INSERT INTO discovery_sponsorships(business_id,position,active,updated_at) VALUES(?,4,1,123)').run(id);
    const snapshot=async()=>({profile:await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(id),industries:await db.prepare('SELECT * FROM business_industries WHERE business_id=? ORDER BY industry_key').all(id),sponsor:await db.prepare('SELECT * FROM discovery_sponsorships WHERE business_id=?').get(id),other:await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(other)});
    const before=await snapshot();
    await updateDiscoveryProfile({businessId:id,placeId:cape.id,countryCode:'ZA',city:'Forged city',region:'Forged region',zone:'Forged zone'});
    const saved=await snapshot(),view=(await getDiscoveryProfileAdminView(id))!;
    assert.deepEqual([view.countryCode,view.cityId,view.city,view.region],['ZA',cape.id,cape.name,cape.region]);
    assert.deepEqual([view.latitude,view.longitude],[-1.29991,36.82221],'Selecting a city never snaps a custom pin to its centre');
    assert.equal(view.zone,before.profile.zone,'Legacy zone is retained as metadata, not invented city authority');
    for(const key of ['booth_image_path','fallback_style','production_scale','is_featured','is_excluded'])assert.equal(saved.profile[key],before.profile[key],key);
    assert.deepEqual(saved.industries,before.industries);assert.deepEqual(saved.sponsor,before.sponsor);assert.deepEqual(saved.other,before.other);
    await updateDiscoveryProfile({businessId:id,boothImagePath:'/seed/updated.png'});
    const metadata=await snapshot();assert.equal(metadata.profile.is_excluded,1,'An omitted exclusion is preserved');assert.equal(metadata.profile.approved_at,saved.profile.approved_at,'A metadata-only save does not replace the saved approval stamp');
    await updateDiscoveryProfile({businessId:id,boothImagePath:before.profile.booth_image_path});
    const restored=await snapshot();saved.profile=restored.profile;
    for(const bad of [{placeId:'forged',countryCode:'ZA'},{placeId:cape.id,countryCode:'KE'},{placeId:cape.id,countryCode:''},{placeId:'',countryCode:'ZA'},{placeId:null,countryCode:'ZA'},{countryCode:'KE'},{city:'Another city'},{region:'Another region'}]){
      await assert.rejects(()=>updateDiscoveryProfile({businessId:id,...bad}),/Choose/);
      assert.deepEqual(await snapshot(),saved,'Invalid geography has no profile/industry/sponsor partial write');
    }
    for(const value of ['',null,true,[],[9],Number.NaN,Infinity,'bad']){
      await assert.rejects(()=>updateDiscoveryProfile({businessId:id,latitude:value,longitude:0}),/valid public storefront coordinates/);
      assert.deepEqual(await snapshot(),saved);
    }
    await assert.rejects(()=>updateDiscoveryProfile({businessId:id,placeId:nairobi.id,countryCode:'KE',sponsorPosition:1000}),/Sponsored position/);
    assert.deepEqual(await snapshot(),saved,'Late sponsorship failure rolls back an otherwise valid geography change');
    for(const [latitude,longitude]of [[-90,-180],[90,180],[0,0],[-33.92499,18.42419]]){
      await updateDiscoveryProfile({businessId:id,latitude,longitude});
      const actual=(await getDiscoveryProfileAdminView(id))!;assert.equal(actual.latitude,latitude);assert.equal(actual.longitude,longitude);assert.equal(actual.cityId,cape.id);
    }
    const legacyBefore=await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(other);
    await updateDiscoveryProfile({businessId:other,excluded:true});
    const legacyAfter=await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(other);
    for(const key of ['city','zone','region','country_code','city_id','latitude','longitude'])assert.equal(legacyAfter[key],legacyBefore[key],key+' legacy value is not guessed');
    assert.equal(legacyAfter.approved_at,0,'An unrelated visibility save cannot approve unknown legacy geography');
    await assert.rejects(()=>updateDiscoveryProfile({businessId:missing,excluded:true}),/Choose your business city/);assert.equal(await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(missing),undefined,'An unrelated save never creates an invented approved profile');
    // Legacy callers without new selection fields remain compatible for unknown geography.
    await updateDiscoveryProfile({businessId:other,city:'Legacy corrected town',region:'Legacy region',zone:'',latitude:' 0 ',longitude:' -1.5 '});
    const legacy=(await getDiscoveryProfileAdminView(other))!;assert.equal(legacy.city,'Legacy corrected town');assert.equal(legacy.countryCode,'');assert.equal(legacy.cityId,'');assert.equal(legacy.longitude,-1.5);
    await db.prepare(`INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,country_code,location_mode,place_id,place_latitude,place_longitude,reviewed_version,updated_at)
      VALUES(?,3,'fashion-textiles',?,?,?,'area',?,?,?,2,1)`).run(id,cape.name,cape.region,'ZA',cape.id,cape.latitude,cape.longitude);
    const fenced=await snapshot();
    await updateDiscoveryProfile({businessId:id,proposalVersion:3,excluded:true});
    assert.equal((await db.prepare('SELECT reviewed_version FROM owner_location_proposals WHERE business_id=?').get(id)).reviewed_version,2,'Metadata-only editing does not consume a pending owner location');
    const pendingMetadata=await snapshot();assert.equal(pendingMetadata.profile.approved_at,fenced.profile.approved_at);fenced.profile=pendingMetadata.profile;
    await assert.rejects(()=>updateDiscoveryProfile({businessId:id,proposalVersion:2,placeId:nairobi.id,countryCode:'KE'}),/owner changed the location/);
    assert.deepEqual(await snapshot(),fenced);
    await updateDiscoveryProfile({businessId:id,proposalVersion:3,placeId:nairobi.id,countryCode:'KE',latitude:9.12345,longitude:38.78901});
    const rounded=(await getDiscoveryProfileAdminView(id))!;assert.equal(rounded.latitude,9.1);assert.equal(rounded.longitude,38.8);assert.equal(rounded.cityId,nairobi.id);
    const proposal=await db.prepare('SELECT * FROM owner_location_proposals WHERE business_id=?').get(id);assert.equal(proposal.reviewed_version,3);assert.equal(proposal.version,3);assert.equal(proposal.place_id,cape.id,'Admin placement does not rewrite the owner proposal or its version');
    assert.deepEqual((await snapshot()).sponsor,before.sponsor);assert.deepEqual((await snapshot()).industries,before.industries);
    console.log('PASS BE-054 S122: canonical admin country/city, independent worldwide pin, atomic rejection, legacy omission, proposal fencing/area privacy and unrelated-row preservation.');
  }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
