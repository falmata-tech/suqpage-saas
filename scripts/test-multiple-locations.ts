import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { getMarketplaceDiscoveryView } from '../lib/discovery';
import { normalizeDiscoveryPlaces, discoveryPlaceKey } from '../lib/discovery-contract';
import { handleMobileRequest } from '../lib/mobile/router';
import type { Market } from '../packages/contracts/src';
async function main() {
 const db=await getDb();
 try {
  const locations=[['Addis Ababa','Addis Ababa'],['Adama','Oromia'],['Jimma','Oromia'],['Hawassa','Sidama']];
  for(const [i,[city,region]] of locations.entries()) {
   const id=(await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition','active')").run(`places-${i}`,`Store ${i}`)).insertedId;
   await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at) VALUES(?,?,'Central',?,9,38,1,1)").run(id,city,region);
   await db.prepare("INSERT INTO business_industries(business_id,industry_key) VALUES(?,'electronics')").run(id);
   for(let n=0;n<4;n++) await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,?,?,'Delivery available',1)").run(id,`Grass ${n}`,`grass-${n}`);
  }
  const selected=['city:Addis Ababa:Addis Ababa','region:Oromia','city:Adama:Oromia'];
  assert.equal(discoveryPlaceKey([...selected].reverse()),discoveryPlaceKey([...selected,selected[0]]));
  assert.equal(normalizeDiscoveryPlaces(Array.from({length:40},(_,i)=>`region:${i}`)).length,16);
  for(const q of ['', 'Grass', 'grasss']) {
   const first=await getMarketplaceDiscoveryView({place:selected,q,type:'products'});
   assert.equal(first.resultCounts.products,12,q);
   assert.equal(first.showrooms.length,3,q);
   assert.ok(first.showrooms.every(shop=>shop.region!=='Sidama'));
   const seen=new Set<number>();
   for(let page=1;page<=first.resultPage.totalPages;page++) {
    const result=await getMarketplaceDiscoveryView({place:selected,q,type:'products',page});
    for(const item of result.searchProducts) {assert.ok(!seen.has(item.id));seen.add(item.id);assert.notEqual(item.region,'Sidama');}
   }
   assert.equal(seen.size,12);
  }
  const old=await getMarketplaceDiscoveryView({place:'region:Oromia',type:'products'});
  assert.equal(old.resultCounts.products,8);
  assert.equal((await getMarketplaceDiscoveryView({place:selected,industry:'beauty-wellness'})).total,0);
  assert.equal((await getMarketplaceDiscoveryView({place:selected,q:'nothinglikeanyitem'})).total,0);
  assert.equal((await getMarketplaceDiscoveryView({place:[],type:'products'})).resultCounts.products,16);
  const params=new URLSearchParams({q:'grasss'});selected.forEach(place=>params.append('place',place));
  const response=await handleMobileRequest(new Request('https://suqpage.com/api/mobile/v1/market?'+params),['market']);
  assert.equal(response.status,200);const dto:Market=await response.json();assert.equal(dto.total,12);assert.equal(dto.showrooms.length,3);
  console.log('PASS multi-location OR scope, overlapping regions/cities, deduplication, category/query AND scope, exact/fuzzy pagination, repeated API params, legacy single place, bounds and clear-all.');
 } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
