// Finite maker-video playback fixture. Only a disposable local demo schema is writable.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertNativeDemoTarget,nativeQaSchema} from './native-qa-target';
import {runtimeGet,runtimeTransaction} from '../lib/runtime-sql';
import {runtimeCatalogByHandle,runtimeUserById} from '../lib/catalog-runtime';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {saveOwnerPageAndPublication} from '../lib/owner-page-save-runtime';
import {executeBasicProductUpkeep} from '../lib/product-upkeep';
import {postgresProductUpkeepPort} from '../lib/product-upkeep-postgres';
import {parseOfferingHighlightsJson} from '../lib/offering-presentation';
import {productMedia} from '../lib/product-media';
import {productVideoWatchUrl} from '../lib/video/product-video';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';

const cases=[
  {businessId:36, handle:'demo-rift-metal-studio', productIds:[141,142,143,144], videoRef:'tiktok:7381882221063425286'},
  {businessId:64, handle:'demo-omo-packaging-factory', productIds:[253,254,255,256], videoRef:'tiktok:7696838608598076688'},
] as const;

async function main(){
  const target=assertNativeDemoTarget();
  if(process.argv[2]==='--preflight')return;
  assert.equal(process.argv.length,2);
  const original=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
  const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(original.source,source);
  target.searchParams.set('options',`-csearch_path=${nativeQaSchema(original.schema)}`);
  Object.assign(process.env,{SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:target.href,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem'});
  const records=[];
  for(const entry of cases){
    const record=await runtimeTransaction(async()=>{
      const initial=await runtimeCatalogByHandle(entry.handle);
      assert.ok(initial&&initial.business.id===entry.businessId&&initial.business.is_demo===1&&initial.business.status==='active');
      assert.equal(initial.products.filter(product=>product.is_published).length,4);
      const owner=await runtimeGet<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
        WHERE u.business_id=? AND p.access_role='client' ORDER BY u.id LIMIT 1`,[entry.businessId]);
      const actor=owner&&await runtimeUserById(owner.id);
      assert.ok(actor&&actor.access_role==='client'&&actor.business_id===entry.businessId);
      const draft=await ownerPagePort.read(entry.businessId);
      assert.ok(draft);
      const productRecords=[];
      for(const productId of entry.productIds){
        const catalog=await runtimeCatalogByHandle(entry.handle);
        assert.ok(catalog&&catalog.business.id===entry.businessId);
        const product=catalog.products.find(item=>item.id===productId&&item.is_published);
        assert.ok(product);
        const before=productMedia(product);
        assert.equal(before.filter(item=>item.kind==='video').length,1);
        assert.ok(before.some(item=>item.kind==='image'));
        assert.ok(!before.some(item=>item.ref===entry.videoRef));
        const media=before.map(item=>item.kind==='video'?{kind:'video' as const,ref:entry.videoRef}:item);
        await executeBasicProductUpkeep(postgresProductUpkeepPort,actor,{
          kind:'update',businessId:entry.businessId,productId,
          expectedContentVersion:catalog.business.content_version,idempotencyKey:`s197_fabrication_qa_${productId}`,
          name:product.name,description:product.description,availability:product.availability,
          offeringKind:product.offering_kind,quantityMode:product.quantity_mode,
          orderScope:product.order_scope??'unspecified',priceMinor:product.price_minor,
          quantityUnit:product.quantity_unit,highlights:parseOfferingHighlightsJson(product.highlights_json),
          capacitySummary:product.capacity_summary,minimumOrderSummary:product.minimum_order_summary,
          leadTimeSummary:product.lead_time_summary,media,videoRef:entry.videoRef,categoryId:product.category_id,
          imageAction:'keep',preserveMetadata:true,
        },null);
        productRecords.push({productId,productName:product.name,mediaIndex:media.findIndex(item=>item.kind==='video'),mediaLength:media.length});
      }
      await saveOwnerPageAndPublication(actor,entry.businessId,{action:'save',version:draft.version,
        content:{...draft.content,videoUrl:productVideoWatchUrl(entry.videoRef)}});
      return {...entry,products:productRecords};
    });
    const after=await runtimeCatalogByHandle(entry.handle),page=await ownerPagePort.read(entry.businessId);
    assert.ok(after&&page);
    for(const productId of entry.productIds){
      assert.ok(productMedia(after.products.find(product=>product.id===productId)!).some(item=>item.ref===entry.videoRef));
    }
    assert.equal(page.content.videoUrl,productVideoWatchUrl(entry.videoRef));
    records.push(record);
  }
  fs.mkdirSync('.local/s197-fabrication-app',{recursive:true,mode:0o700});
  fs.writeFileSync('.local/s197-fabrication-app/fixture.json',JSON.stringify({source,records})+'\n',{mode:0o600});
  console.log('PASS two disposable fabrication showrooms and eight product videos prepared.');
}
void main().catch(error=>{console.error('Disposable fabrication fixture failed:',String(error));process.exitCode=1;}).finally(closePostgresRuntimeForTests);
