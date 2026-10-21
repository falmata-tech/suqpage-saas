import assert from 'node:assert/strict';
import {getDb,closeDbForTests,getUserById} from './testing/postgres-fixture';
import {getMarketplaceDiscoveryView} from '../lib/discovery';
import {findKnownPlace,findPlaceSuggestions} from '../lib/place-catalog';
import {parseSignupInput} from '../lib/signup';
import {normalizeMarketSearch,hasMarketCriteria,marketWorkspaceParams,readMarketSearch,MARKET_MAP_LIMIT,MARKET_PRODUCT_BATCH_SIZE} from '../lib/market-search';
import {migratePostgresDatabase} from '../lib/postgres-migrations';
import {createPublicClientWorkspace} from '../lib/signup';
import {saveOwnerBusiness,readOwnerBusiness} from '../lib/owner-business-runtime';
import {demoPublicContacts} from './demo-public-contacts';
import {publicContactLinks} from '../lib/business-profile-contacts';
import {handleMobileRequest} from '../lib/mobile/router';
import {publicationReadiness} from '../lib/publication-readiness';
import {starterPage} from '../lib/business-starter';
import {getDiscoveryProfileAdminView,updateDiscoveryProfile} from '../lib/discovery-admin';

async function main() {
 const nairobi=findPlaceSuggestions('Nairobi','KE')[0],addis=findPlaceSuggestions('Addis Ababa','ET')[0];
 assert.equal(nairobi.countryCode,'KE');assert.equal(addis.id,'place-553e667e63bb8da0');assert.equal(findKnownPlace(nairobi.id)?.latitude,nairobi.latitude);
 assert.deepEqual(findPlaceSuggestions('Nairobi','ET'),[]);assert.deepEqual(findPlaceSuggestions('x'.repeat(81),'KE'),[]);
 assert.equal(findPlaceSuggestions('Muqdisho','SO')[0]?.name,'Mogadishu');assert.equal(findPlaceSuggestions('ኣስመራ','ER')[0]?.name,'Asmara');assert.equal(findPlaceSuggestions('Finfinnee','ET')[0]?.id,addis.id);
 const signup={name:'Test Owner',phone:'+12025550100',businessName:'Test Store',businessCategory:'fashion-textiles',idempotencyKey:'test-country-location-123',placeId:nairobi.id,consent:true};
 const identity={providerUserId:'12345678-1234-1234-1234-123456789abc',email:'test@example.invalid'};
 assert.equal(parseSignupInput({...signup,countryCode:'KE'},identity).place.countryCode,'KE');
 assert.throws(()=>parseSignupInput({...signup,countryCode:'ET'},identity),/selected country/);
 assert.equal(parseSignupInput({...signup,placeId:addis.id},identity).place.countryCode,'ET');
 const demo=demoPublicContacts('someone@real-domain.com','+251911234567');
 assert.match(demo.email!,/@example\.invalid$/);assert.match(demo.phone!,/^\+447700900\d{3}$/);assert.equal(demo.whatsapp,demo.phone);
 assert.equal(demo.website,'https://example.invalid/');assert.ok(publicContactLinks(demo).every(c=>!/(tiktok|instagram|facebook|t\.me)/.test(c.href)));
 for(const contacts of [{email:'hello@example.test'},{email:'demo@example.invalid'},{website:'https://example.com'},{phone:'+447700900999'},{whatsapp:'447700900123'},{tiktok:'your_business_example'}])assert.equal(publicationReadiness({...starterPage,contacts},[],true).find(c=>c.key==='contacts')?.ready,false,'Historic and new examples remain publication blockers');
 assert.equal(publicationReadiness({...starterPage,contacts:{email:'contact@business-domain.com'}},[],true).find(c=>c.key==='contacts')?.ready,true);
 assert.equal(hasMarketCriteria(normalizeMarketSearch({})),false);
 assert.equal(hasMarketCriteria(normalizeMarketSearch({q:'g'})),true);
 const b=normalizeMarketSearch({q:'Business',country:['ET','KE'],city:['ET:Addis Ababa']}),p=normalizeMarketSearch({q:'grass',madeToOrder:true});
 const url=marketWorkspaceParams('products',b,p);assert.deepEqual(readMarketSearch(url,'b.'),b);assert.deepEqual(readMarketSearch(url,'p.'),p);
 const db=await getDb();
 try {
  async function add(handle:string,country:string,city:string,state='active',excluded=0) {
   const id=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition',?)").run(handle,handle,state)).insertedId);
   await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,country_code,city_id,latitude,longitude,approved_at,is_excluded,updated_at) VALUES(?,?,'',?,?,?,1,36,1,?,1)").run(id,city,city,country,'gn-test-'+id,excluded);
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'fashion-textiles')").run(id);
   for(const [name,kind] of [['Grass','standard_product'],['Woven basket','made_to_order'],['Grass cutting','service']] as const)await db.prepare('INSERT INTO products(business_id,name,slug,description,offering_kind,is_published) VALUES(?,?,?,?,?,1)').run(id,name,name.toLowerCase().replaceAll(' ','-'),'Detailed offering from '+handle,kind);
   return id;
  }
  const et=await add('s102-business-a','ET','Shared City'),ke=await add('s102-business-b','KE','Shared City');
  const blocked=await add('s102-business-blocked','SO','Secret City');await add('s102-draft','UG','Private City','draft');await add('s102-excluded','TZ','Hidden City','active',1);
  const get=(scope:'products'|'businesses',extra:Parameters<typeof getMarketplaceDiscoveryView>[0]={})=>getMarketplaceDiscoveryView({scope,excludedBusinessIds:[blocked],...extra});
  for(const scope of ['products','businesses'] as const) {
   const empty=await get(scope);assert.equal(empty.resultPage.totalItems,scope==='businesses'?2:4);assert.equal(empty.showrooms.length,scope==='businesses'?2:0);assert.equal(empty.searchProducts.length,scope==='products'?4:0);
   assert.deepEqual(empty.countries?.map(c=>c.code),['ET','KE']);assert.equal(empty.places.length,2);
  }
  assert.equal((await get('businesses',{q:'Grass'})).showrooms.length,0,'Offering-only query must not match businesses');
  assert.equal((await get('businesses',{q:'business-a'})).showrooms[0]?.id,et);
  assert.equal((await get('businesses',{q:'busines-a'})).showrooms[0]?.id,et,'Business spelling fallback');
  const product=await get('products',{q:'gras'});assert.equal(product.searchProducts[0].name,'Grass');assert.deepEqual(product.showrooms,[]);assert.match(product.searchProducts[0].description,/Detailed/);assert.equal(product.featuredNowBusinessId,null,'Product batches omit unrelated Featured map presence');
  for(const q of ['Grass','Grasss']) {
   const one=await get('products',{q,country:['KE'],city:['KE:Shared City'],offeringType:'products'});
   assert.equal(one.resultPage.totalItems,1);assert.equal(one.searchProducts[0].businessId,ke);assert.equal(one.searchProducts[0].name,'Grass');
  }
  const union=await get('products',{country:['ET','KE'],madeToOrder:true});assert.equal(union.resultPage.totalItems,2);assert.ok(union.searchProducts.every(x=>x.name==='Woven basket'));
  await assert.rejects(()=>get('products',{offeringType:'services'}),/Check your search filters/);
  const api=async(path:string)=>handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/'+path),path.split('?')[0].split('/'));
  assert.equal((await api('market?scope=products&offeringType=services')).status,400);
  const wire=await api('market?scope=products&q=Woven&country=KE&madeToOrder=true');assert.equal(wire.status,200);
  const body=await wire.json();assert.equal(body.total,1);assert.equal(body.items[0].name,'Woven basket');assert.equal(body.items[0].businessName,'s102-business-b');assert.match(body.items[0].description,/Detailed offering/);assert.deepEqual(body.showrooms,[]);
  assert.equal((await api('market?scope=products&country=NOT-A-COUNTRY')).status,400);
  assert.equal((await api('market?scope=unknown')).status,400);
  const emptyWire=await (await api('market?scope=businesses&exclude='+blocked)).json();assert.equal(emptyWire.showrooms.length,2);assert.equal(emptyWire.total,2);assert.deepEqual(emptyWire.items,[]);
  const placesWire=await (await api('places?country=KE&q=Nairobi')).json();assert.equal(placesWire.places[0].countryCode,'KE');
  assert.equal((await get('products',{country:'ET',city:'KE:Shared City'})).resultPage.totalItems,0,'Do not broaden incompatible filters');
  assert.equal((await get('products',{city:'ET:Missing City'})).resultPage.totalItems,0);
  // Initial browsing stays bounded at the SQL boundary; counts retain all matches.
  const cap=await db.prepare("INSERT INTO businesses(handle,name,design_key,status) SELECT 's103-cap-'||n,'s103-cap-'||n,'composition','active' FROM generate_series(1,210) n RETURNING id").all();
  const capIds=JSON.stringify(cap.map(row=>row.id));
  await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,country_code,city_id,latitude,longitude,approved_at,updated_at) SELECT id,'Cap City','','Cap City','KE','cap-city',1,36,1,1 FROM businesses WHERE id IN(SELECT jsonb_array_elements_text(?::jsonb)::bigint)").run(capIds);
  await db.prepare("INSERT INTO business_industries(business_id,industry_key) SELECT id,'fashion-textiles' FROM businesses WHERE id IN(SELECT jsonb_array_elements_text(?::jsonb)::bigint)").run(capIds);
  await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) SELECT id,'Cap item','cap-item','Public item',1 FROM businesses WHERE id IN(SELECT jsonb_array_elements_text(?::jsonb)::bigint)").run(capIds);
  const capped=await get('businesses',{q:'s103-cap'});assert.equal(capped.showrooms.length,MARKET_MAP_LIMIT);assert.equal(capped.resultCounts.businesses,210);assert.equal(capped.resultPage.totalItems,210);
  const cappedWire=await (await api('market?scope=businesses&q=s103-cap')).json();assert.equal(cappedWire.showrooms.length,200);assert.equal(cappedWire.total,210);
  const seen=new Set<number>();let pages=0;
  for(let page=1;;page++) {
   const batch=await get('products',{q:'Cap item',page});assert.ok(batch.searchProducts.length<=MARKET_PRODUCT_BATCH_SIZE);assert.equal(batch.resultPage.totalItems,210);pages=batch.resultPage.totalPages;
   for(const item of batch.searchProducts){assert.ok(!seen.has(item.id),'Stable server pages do not duplicate IDs');seen.add(item.id);}
   if(page===pages)break;
  }
  assert.equal(seen.size,210);assert.equal(pages,18);
  const boundedInitial=await get('products');assert.equal(boundedInitial.searchProducts.length,12);assert.equal(boundedInitial.resultPage.totalItems,214);
  await db.prepare("DELETE FROM businesses WHERE id IN(SELECT jsonb_array_elements_text(?::jsonb)::bigint)").run(capIds);
  const count=Number((await db.prepare('SELECT count(*) n FROM users').get()).n);
  await assert.rejects(()=>createPublicClientWorkspace({...signup,countryCode:'ET'},identity),/selected country/);
  assert.equal(Number((await db.prepare('SELECT count(*) n FROM users').get()).n),count,'Forged country signup creates nothing');
  const created=await createPublicClientWorkspace({...signup,countryCode:'KE'},identity);
  const location=await db.prepare('SELECT * FROM business_discovery_profiles WHERE business_id=?').get(created.businessId);
  assert.equal(location.country_code,'KE');assert.equal(location.city_id,nairobi.id);assert.equal(location.city,'Nairobi');
  const owner=(await getUserById(created.userId))!,before=await readOwnerBusiness(owner,created.businessId);
  const cape=findPlaceSuggestions('Cape Town','ZA')[0];assert.equal(cape.countryCode,'ZA');
  const change={name:'Owner world shop',expectedVersion:before.business.content_version,locationVersion:before.proposal!.version,category:'fashion-textiles',countryCode:'ZA',placeId:cape.id,mode:'storefront',latitude:-33.9249,longitude:18.4241};
  await assert.rejects(()=>saveOwnerBusiness({...owner,business_id:et},created.businessId,change),/Business details are not available/);
  await assert.rejects(()=>saveOwnerBusiness(owner,created.businessId,{...change,countryCode:'KE'}),/selected country/);
  for(const countryCode of ['',0,null])await assert.rejects(()=>saveOwnerBusiness(owner,created.businessId,{...change,countryCode}),/selected country/);
  for(const latitude of ['',null,undefined,Number.NaN,Infinity])await assert.rejects(()=>saveOwnerBusiness(owner,created.businessId,{...change,latitude}),/valid public storefront coordinates/);
  await assert.rejects(()=>saveOwnerBusiness(owner,created.businessId,{...change,longitude:''}),/valid public storefront coordinates/);
  await saveOwnerBusiness(owner,created.businessId,change);const saved=await readOwnerBusiness(owner,created.businessId);
  assert.equal(saved.proposal?.country_code,'ZA');assert.equal(saved.existing?.country_code,'ZA');assert.equal(saved.existing?.city_id,cape.id);assert.equal(saved.proposal?.latitude,-33.9249);
  await assert.rejects(()=>saveOwnerBusiness(owner,created.businessId,change),/changed/);
  assert.deepEqual((await readOwnerBusiness(owner,created.businessId)).proposal,saved.proposal);
  // S107: administrator discovery editing follows the same worldwide GPS contract.
  const adminProfile=(await getDiscoveryProfileAdminView(created.businessId))!;
  const adminChange={...adminProfile,proposalVersion:saved.proposal!.version};
  const otherProfile=await getDiscoveryProfileAdminView(et);
  for(const [latitude,longitude] of [[-33.9249,18.4241],[' -1.2921 ','36.8219'],[-90,-180],[90,180],[0,0]] as const){
   await updateDiscoveryProfile({...adminChange,latitude,longitude});
   const actual=await db.prepare('SELECT latitude,longitude,country_code,city_id FROM business_discovery_profiles WHERE business_id=?').get(created.businessId);
   assert.equal(actual.latitude,Number(latitude));assert.equal(actual.longitude,Number(longitude));
   assert.equal(actual.country_code,'ZA');assert.equal(actual.city_id,cape.id,'Coordinate editing must not rewrite canonical place identity');
  }
  const adminBefore=await getDiscoveryProfileAdminView(created.businessId);
  for(const value of ['', '   ',null,undefined,true,[],[9],Number.NaN,Infinity,'not-a-coordinate']){
   await assert.rejects(()=>updateDiscoveryProfile({...adminChange,latitude:value,longitude:18.4241}),/valid public storefront coordinates/);
   await assert.rejects(()=>updateDiscoveryProfile({...adminChange,latitude:-33.9249,longitude:value}),/valid public storefront coordinates/);
  }
  for(const [latitude,longitude] of [[-90.001,0],[90.001,0],[0,-180.001],[0,180.001]])await assert.rejects(()=>updateDiscoveryProfile({...adminChange,latitude,longitude}),/valid public storefront coordinates/);
  await assert.rejects(()=>updateDiscoveryProfile({...adminChange,proposalVersion:saved.proposal!.version-1,latitude:-33.9249,longitude:18.4241}),/owner changed the location/);
  assert.deepEqual(await getDiscoveryProfileAdminView(created.businessId),adminBefore,'Rejected coordinates and stale proposals leave the saved profile unchanged');
  assert.deepEqual(await getDiscoveryProfileAdminView(et),otherProfile,'Admin coordinate saves do not alter another business');
  const schema=(await db.prepare('SELECT current_schema() name').get()).name;
  const migration=await migratePostgresDatabase(db.runner,schema);assert.deepEqual(migration.applied,[]);
  await assert.rejects(()=>db.prepare("UPDATE business_discovery_profiles SET latitude=91 WHERE business_id=?").run(et),/constraint/);
  // Rehearse a schema-63 upgrade, including unrelated operator constraints.
  await db.prepare('UPDATE business_discovery_profiles SET latitude=9,longitude=38').run();
  await db.prepare("UPDATE owner_location_proposals SET location_mode='area',latitude=NULL,longitude=NULL").run();
  await db.prepare("UPDATE owner_location_proposals SET place_id=NULL,place_latitude=NULL,place_longitude=NULL WHERE country_code<>'ET'").run();
  await db.prepare('UPDATE business_discovery_profiles SET city=?,region=? WHERE business_id=?').run(addis.name,addis.region,et);
  await db.prepare("INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,place_id,place_latitude,place_longitude,updated_at) VALUES(?,1,'fashion-textiles',?,?,'area',?,?,?,1)").run(et,addis.name,addis.region,addis.id,addis.latitude,addis.longitude);
  const coordinates=await db.prepare('SELECT business_id,latitude,longitude FROM business_discovery_profiles ORDER BY business_id').all();
  const privateRows=await db.prepare('SELECT id,email,password_hash,account_phone FROM users ORDER BY id').all();
  await db.exec(`ALTER TABLE business_discovery_profiles DROP CONSTRAINT discovery_world_coordinates_check,DROP COLUMN country_code,DROP COLUMN city_id;
   ALTER TABLE business_discovery_profiles ADD CONSTRAINT ck_business_discovery_profiles_1 CHECK(latitude BETWEEN 3 AND 15),ADD CONSTRAINT ck_business_discovery_profiles_2 CHECK(longitude BETWEEN 32 AND 49),ADD CONSTRAINT discovery_operator_guard CHECK(city<>'forbidden');
   ALTER TABLE owner_location_proposals DROP CONSTRAINT owner_location_privacy_coordinates_check,DROP CONSTRAINT owner_location_place_anchor_check,DROP COLUMN country_code;
   ALTER TABLE owner_location_proposals ADD CONSTRAINT owner_location_proposals_check CHECK((location_mode='area' AND latitude IS NULL AND longitude IS NULL) OR (location_mode='storefront' AND latitude BETWEEN 3 AND 15 AND longitude BETWEEN 32 AND 49)),
    ADD CONSTRAINT owner_location_place_anchor_check CHECK((place_id IS NULL AND place_latitude IS NULL AND place_longitude IS NULL) OR (place_id IS NOT NULL AND place_latitude BETWEEN 3 AND 15 AND place_longitude BETWEEN 32 AND 49)),
    ADD CONSTRAINT owner_operator_guard CHECK(location_mode='area' OR latitude<89);
   DELETE FROM schema_migrations WHERE version=64;
   ALTER TABLE owner_location_proposals RENAME CONSTRAINT owner_location_proposals_check TO unexpected_owner_constraint;`);
  await assert.rejects(()=>migratePostgresDatabase(db.runner,schema),/Unexpected owner coordinate constraint/);
  assert.equal(Number((await db.prepare("SELECT count(*) n FROM information_schema.columns WHERE table_schema=current_schema() AND table_name='business_discovery_profiles' AND column_name='country_code'").get()).n),0,'Unexpected target rolls the migration back');
  await db.exec('ALTER TABLE owner_location_proposals RENAME CONSTRAINT unexpected_owner_constraint TO owner_location_proposals_check');
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[64]);
  assert.deepEqual(await db.prepare('SELECT business_id,latitude,longitude FROM business_discovery_profiles ORDER BY business_id').all(),coordinates);
  assert.deepEqual(await db.prepare('SELECT id,email,password_hash,account_phone FROM users ORDER BY id').all(),privateRows);
  assert.equal((await db.prepare('SELECT country_code,city_id FROM business_discovery_profiles WHERE business_id=?').get(et)).country_code,'ET');
  assert.equal((await db.prepare('SELECT country_code FROM business_discovery_profiles WHERE business_id=?').get(ke)).country_code,'','Unknown legacy country is never guessed');
  assert.equal(Number((await db.prepare("SELECT count(*) n FROM pg_constraint WHERE connamespace=current_schema()::regnamespace AND conname IN ('discovery_operator_guard','owner_operator_guard')").get()).n),2);
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[]);
  console.log('PASS S102: independent exact/fuzzy scopes, bounded initial results and incremental pages, private metadata, country/city/type intersections, literal descriptions, canonical signup and migration replay.');
 }finally{await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
