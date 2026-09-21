import assert from 'node:assert/strict';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { getMarketplaceDiscoveryView } from '../lib/discovery';
import { findSpellingMatches, spellingTerms } from '../lib/spelling-search';
import { migratePostgresDatabase } from '../lib/postgres-migrations';

async function main() {
 const db=await getDb();
 try {
  const add=async (handle:string,name:string,description:string,city='Addis Ababa',status='active',excluded=0,published=1,industry='beauty-wellness')=>{
   const id=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES(?,?,'composition',?)").run(handle,handle,status)).insertedId);
   await db.prepare("INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,is_excluded,updated_at) VALUES(?,?,'Central',?,9,38,1,?,1)").run(id,city,city,excluded);
   await db.prepare('INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)').run(id,industry);
   const productId=Number((await db.prepare('INSERT INTO products(business_id,name,slug,description,is_published) VALUES(?,?,?,?,?)').run(id,name,handle,description,published)).insertedId);
   return {id,productId};
  };
  const normal=await add('z-normal','Lotion','Skin moisturizer ሳሙና ጥገና');
  const near=await add('a-near','Lotiom','Body cream');
  const farther=await add('b-farther','Lotoin','Hand cream');
  for(const [handle,status,excluded,published] of [['hidden','draft',0,1],['excluded','active',1,1],['unpublished','active',0,0]] as const) await add(handle,'Lotion','Skin moisturizer','Addis Ababa',status,excluded,published);
  const otherCategory=await add('wrong-category','Lotion','Skin moisturizer','Addis Ababa','active',0,1,'electronics');
  const otherCity=await add('other-city','Lotion','Skin moisturizer','Hawassa');
  const port={all:async<T extends Record<string,unknown>>(sql:string,values?:Array<string|number>)=>(await db.runner.query<T>(sql,values)).rows};
  const scope={query:'lotion',industry:'beauty-wellness',city:'Addis Ababa',region:'Addis Ababa',scale:'',exactBusinessIds:[normal.id]};
  const ranked=await findSpellingMatches(scope,port);
  assert.ok(ranked.some(row=>row.id===near.productId&&row.kind==='product'));
  assert.ok(ranked.some(row=>row.id===farther.productId&&row.kind==='product'));
  assert.ok(ranked.every((row,i)=>i===0||row.score<=ranked[i-1].score));
  assert.ok(ranked.every(row=>[near.id,farther.id].includes(row.businessId)),'Visibility/category/place filters precede candidate cap');
  const seen:string[]=[];
  for(let page=1;page<=2;page++) {
   const view=await getMarketplaceDiscoveryView({q:'lotion',industry:'beauty-wellness',place:'city:Addis Ababa:Addis Ababa',page});
   // Use actual place keys, whose encoding is an independent geography contract.
   const place=view.places.find(item=>item.kind==='city'&&item.city==='Addis Ababa')!.key;
   const filtered=await getMarketplaceDiscoveryView({q:'lotion',industry:'beauty-wellness',place,page});
   assert.deepEqual(filtered.resultCounts,{products:3,businesses:3});
   assert.ok(filtered.searchOrder!.length<=5);
   assert.ok(filtered.showrooms.every(row=>![otherCity.id,otherCategory.id].includes(row.id)));
   assert.equal(filtered.searchOrder!.length,filtered.searchProducts.length+filtered.searchBusinesses.length);
   seen.push(...filtered.searchOrder!.map(row=>`${row.kind}:${row.id}`));
  }
  assert.equal(new Set(seen).size,6);
  assert.deepEqual(seen.slice(0,2),[`product:${normal.productId}`,`business:${normal.id}`],'All normal matches precede approximate matches across entity types and pages');
  assert.deepEqual(seen.slice(2),ranked.map(row=>`${row.kind}:${row.id}`));
  for(const q of ['lotoin','loton','lotiom','LOTIOM','find lotoin in addis','ሳሙነ','ጥገነ Addis']) {
   const view=await getMarketplaceDiscoveryView({q,industry:'beauty-wellness',type:'products'});
   assert.ok(view.searchProducts.some(row=>row.id===normal.productId),q);
  }
  for(const q of ['zzzzzz','hidden secret lotion','ሸሸሸሸ','%_', 'x', "' OR 1=1--"]) assert.equal((await getMarketplaceDiscoveryView({q,industry:'beauty-wellness'})).resultPage.totalItems,0,q);
  assert.equal(spellingTerms('ab %_').some(term=>term.fuzzy),false);
  await db.prepare("UPDATE products SET name='Nebulacream',description='Fresh care' WHERE id=?").run(normal.productId);
  assert.ok((await getMarketplaceDiscoveryView({q:'nebulacrem'})).searchProducts.some(row=>row.id===normal.productId),'Updates immediately affect expression indexes');
  await db.prepare('UPDATE products SET is_published=0 WHERE id=?').run(normal.productId);
  assert.equal((await getMarketplaceDiscoveryView({q:'nebulacrem'})).resultPage.totalItems,0,'Unpublishing removes approximate matches immediately');
  const schema=(await db.prepare('SELECT current_schema() name').get()).name;
  assert.deepEqual((await migratePostgresDatabase(db.runner,schema)).applied,[],'Migration is idempotent');
  console.log('Spelling search: English/Amharic typos, ranked single-list pagination, privacy, filters, edits and migration idempotency passed.');
 } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
