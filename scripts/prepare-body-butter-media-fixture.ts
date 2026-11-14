// One disposable product-94 source-fit fixture for the finite Chrome/Expo check.
// It never reads a hosted target or changes a real merchant or story cover.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertNativeDemoTarget,nativeQaSchema} from './native-qa-target';
import {runtimeGet,runtimeTransaction} from '../lib/runtime-sql';
import {runtimeCatalogByHandle,runtimeUserById} from '../lib/catalog-runtime';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {executeBasicProductUpkeep} from '../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../lib/product-upkeep-postgres';
import {parseOfferingHighlightsJson} from '../lib/offering-presentation';
import {productMedia} from '../lib/product-media';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';

const videoRef='tiktok:7638698619176340749';
const handle='demo-sena-body-care';
const productName='Whipped Body Butter';

async function main(){
  const target=assertNativeDemoTarget();
  if(process.argv[2]==='--preflight')return;
  assert.equal(process.argv.length,2,'Use only the finite fixture action or --preflight.');
  const original=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
  const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(original.source,source);
  target.searchParams.set('options',`-csearch_path=${nativeQaSchema(original.schema)}`);
  Object.assign(process.env,{SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:target.href,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem'});
  const record=await runtimeTransaction(async()=>{
    const catalog=await runtimeCatalogByHandle(handle);
    assert.ok(catalog&&catalog.business.is_demo===1&&catalog.business.status==='active');
    assert.equal(catalog.business.id,24);
    const products=catalog.products.filter(product=>product.is_published);
    assert.equal(products.length,4);
    const product=products.find(item=>item.name===productName);
    assert.ok(product&&product.offering_kind==='standard_product');
    assert.equal(product.id,94);
    const owner=await runtimeGet<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
      WHERE u.business_id=? AND p.access_role='client' ORDER BY u.id LIMIT 1`,[catalog.business.id]);
    const actor=owner&&await runtimeUserById(owner.id);
    assert.ok(actor&&actor.access_role==='client'&&actor.business_id===catalog.business.id);
    const draft=await ownerPagePort.read(catalog.business.id);
    assert.ok(draft);
    const storyBefore=draft.content.videoUrl;
    const otherMediaBefore=products.filter(item=>item.id!==product.id)
      .map(item=>({id:item.id,media:productMedia(item)}));
    const before=productMedia(product);
    assert.equal(before.filter(item=>item.kind==='video').length,1);
    assert.ok(before.some(item=>item.kind==='image'));
    assert.ok(!before.some(item=>item.ref===videoRef));
    const media=before.map(item=>item.kind==='video'?{kind:'video' as const,ref:videoRef}:item);
    await executeBasicProductUpkeep(postgresProductUpkeepPort,actor,{
      kind:'update',businessId:catalog.business.id,productId:product.id,
      expectedContentVersion:catalog.business.content_version,idempotencyKey:`s197_body_butter_fixture_${product.id}`,
      name:product.name,description:product.description,availability:product.availability,
      offeringKind:product.offering_kind,quantityMode:product.quantity_mode,
      orderScope:product.order_scope??'unspecified',priceMinor:product.price_minor,
      quantityUnit:product.quantity_unit,highlights:parseOfferingHighlightsJson(product.highlights_json),
      capacitySummary:product.capacity_summary,minimumOrderSummary:product.minimum_order_summary,
      leadTimeSummary:product.lead_time_summary,media,videoRef,categoryId:product.category_id,
      imageAction:'keep',preserveMetadata:true,
    },null);
    return {businessId:catalog.business.id,productId:product.id,storyBefore,otherMediaBefore};
  });
  const after=await runtimeCatalogByHandle(handle),page=await ownerPagePort.read(record.businessId);
  assert.ok(after&&page);
  assert.ok(productMedia(after.products.find(product=>product.id===record.productId)!).some(item=>item.ref===videoRef));
  assert.equal(page.content.videoUrl,record.storyBefore,'Keep the business story unchanged.');
  for(const item of record.otherMediaBefore){
    const unchanged: (typeof after.products)[number] | undefined=after.products.find(product=>product.id===item.id);
    assert.ok(unchanged);
    assert.deepEqual(productMedia(unchanged),item.media,`Keep product ${item.id} media unchanged.`);
  }
  fs.mkdirSync('.local/body-butter-review',{recursive:true,mode:0o700});
  fs.writeFileSync('.local/body-butter-review/fixture.json',JSON.stringify({source,handle,videoRef,
    businessId:record.businessId,productId:record.productId,storyUnchanged:true,
    otherProductsUnchanged:record.otherMediaBefore.map(item=>item.id).sort((a,b)=>a-b)})+'\n',{mode:0o600});
  console.log('PASS disposable body-butter fixture; story and other products unchanged.');
}
void main().catch(()=>{console.error('Disposable body-butter fixture failed.');process.exitCode=1;}).finally(closePostgresRuntimeForTests);
