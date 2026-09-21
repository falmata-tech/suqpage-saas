import assert from 'node:assert/strict';
import { performance } from 'node:perf_hooks';
import { getDb, closeDbForTests } from './testing/postgres-fixture';
import { getMarketplaceDiscoveryView } from '../lib/discovery';

async function main() {
  const db=await getDb();
  try {
    await db.exec(`INSERT INTO businesses(handle,name,design_key,status)
      SELECT 'perf-'||n,'Repair business '||n,'composition','active' FROM generate_series(1,500) n;
      INSERT INTO business_discovery_profiles(business_id,city,zone,region,latitude,longitude,approved_at,updated_at)
      SELECT id,'Addis Ababa','Addis Ababa','Addis Ababa',9,38,1,1 FROM businesses;
      INSERT INTO business_industries(business_id,industry_key) SELECT id,'electronics' FROM businesses;
      INSERT INTO products(business_id,name,slug,description,is_published)
      SELECT b.id,'Repair service '||n,'service-'||n,'Home visits for repair and maintenance. ጥገና',CASE WHEN n=20 THEN 0 ELSE 1 END
      FROM businesses b CROSS JOIN generate_series(1,20) n;
      ANALYZE businesses; ANALYZE products; ANALYZE business_discovery_profiles;`);
    const timings:number[]=[];
    for(const q of ['repair Addis','Addis repair','ጥገና Addis']){
      const start=performance.now();const view=await getMarketplaceDiscoveryView({q,industry:'electronics',type:'products'});
      timings.push(Math.round(performance.now()-start));
      assert.equal(view.resultCounts.products,9500);assert.equal(view.resultCounts.businesses,500);
      assert.equal(view.searchProducts.length,5);assert.equal(view.showrooms.length,500);
    }
    console.log(JSON.stringify({passed:true,businesses:500,products:10000,returnedProducts:5,queryMilliseconds:timings}));
  } finally {await closeDbForTests();}
}
main().catch(error=>{console.error(error);process.exitCode=1;});
