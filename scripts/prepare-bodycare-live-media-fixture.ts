// Two disposable public-demo product fixtures. Never reads a hosted target.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertNativeDemoTarget,nativeQaSchema} from './native-qa-target';
import {runtimeGet} from '../lib/runtime-sql';
import {runtimeCatalogByHandle,runtimeUserById} from '../lib/catalog-runtime';
import {executeBasicProductUpkeep} from '../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../lib/product-upkeep-postgres';
import {parseOfferingHighlightsJson} from '../lib/offering-presentation';
import {productMedia} from '../lib/product-media';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';

const cases = [
  {handle:'afia-botanics', productName:'Mineral Clay Mask', videoRef:'tiktok:7407311566867025170'},
  {handle:'demo-liya-soap-kitchen', productName:'Citrus Kitchen Bar', videoRef:'tiktok:7157563218557160705'},
];

async function main(){
  const target=assertNativeDemoTarget();
  if(process.argv[2]==='--preflight')return;
  assert.equal(process.argv.length,2);
  const original=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
  const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(original.source,source);
  target.searchParams.set('options',`-csearch_path=${nativeQaSchema(original.schema)}`);
  Object.assign(process.env,{SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:target.href,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem'});
  const products=[];
  for(const item of cases){
    const catalog=await runtimeCatalogByHandle(item.handle);
    assert.ok(catalog&&catalog.business.is_demo===1&&catalog.business.status==='active');
    assert.equal(catalog.products.filter(product=>product.is_published).length,4);
    const product=catalog.products.find(product=>product.name===item.productName);
    assert.ok(product&&product.offering_kind==='standard_product');
    const owner=await runtimeGet<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
      WHERE u.business_id=? AND p.access_role='client' ORDER BY u.id LIMIT 1`,[catalog.business.id]);
    const actor=owner&&await runtimeUserById(owner.id);
    assert.ok(actor&&actor.access_role==='client'&&actor.business_id===catalog.business.id);
    const before=productMedia(product);
    assert.equal(before.filter(media=>media.kind==='video').length,1);
    assert.ok(before.some(media=>media.kind==='image'));
    assert.ok(!before.some(media=>media.ref===item.videoRef));
    const media=before.map(media=>media.kind==='video'?{kind:'video' as const,ref:item.videoRef}:media);
    await executeBasicProductUpkeep(postgresProductUpkeepPort,actor,{
      kind:'update',businessId:catalog.business.id,productId:product.id,
      expectedContentVersion:catalog.business.content_version,idempotencyKey:`bodycare_media_fixture_${product.id}`,
      name:product.name,description:product.description,availability:product.availability,
      offeringKind:product.offering_kind,quantityMode:product.quantity_mode,
      orderScope:product.order_scope??'unspecified',priceMinor:product.price_minor,
      quantityUnit:product.quantity_unit,highlights:parseOfferingHighlightsJson(product.highlights_json),
      capacitySummary:product.capacity_summary,minimumOrderSummary:product.minimum_order_summary,
      leadTimeSummary:product.lead_time_summary,media,videoRef:item.videoRef,categoryId:product.category_id,
      imageAction:'keep',preserveMetadata:true,
    },null);
    const after=await runtimeCatalogByHandle(item.handle);
    assert.ok(after&&productMedia(after.products.find(value=>value.id===product.id)!).some(value=>value.ref===item.videoRef));
    products.push({...item,businessId:catalog.business.id,productId:product.id});
  }
  fs.mkdirSync('.local/bodycare-live-media-review',{recursive:true,mode:0o700});
  fs.writeFileSync('.local/bodycare-live-media-review/fixture.json',JSON.stringify({source,products})+'\n',{mode:0o600});
  console.log('PASS two isolated body-care product fixtures prepared through ordinary commands.');
}
void main().catch(()=>{console.error('Disposable body-care fixture failed.');process.exitCode=1;}).finally(closePostgresRuntimeForTests);
