// Three read-only-to-production examples published through ordinary commands
// into the native QA disposable PostgreSQL schema only.
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
  {handle:'entoto-ceramics',videoRef:'tiktok:7685918227163057438',productName:null},
  {handle:'demo-wabi-joinery-studio',videoRef:'tiktok:7217517593786141995',productName:'Compact Entry Cabinet'},
  {handle:'demo-meda-furniture-studio',videoRef:'tiktok:7067689673266744623',productName:'Round Side Table'},
] as const;

async function main(){
  const target=assertNativeDemoTarget();
  if(process.argv[2]==='--preflight')return;
  assert.equal(process.argv.length,2,'Use only the finite fixture action or --preflight.');
  const original=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
  const source=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
  assert.equal(original.source,source);
  target.searchParams.set('options',`-csearch_path=${nativeQaSchema(original.schema)}`);
  Object.assign(process.env,{SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:target.href,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem'});
  const records=[];
  for(const item of cases){
    const record=await runtimeTransaction(async()=>{
      const catalog=await runtimeCatalogByHandle(item.handle);
      assert.ok(catalog&&catalog.business.is_demo===1&&catalog.business.status==='active');
      const products=catalog.products.filter(product=>product.is_published);
      assert.equal(products.length,4);
      const owner=await runtimeGet<{id:number}>(`SELECT u.id FROM users u JOIN user_access_profiles p ON p.user_id=u.id
        WHERE u.business_id=? AND p.access_role='client' ORDER BY u.id LIMIT 1`,[catalog.business.id]);
      const actor=owner&&await runtimeUserById(owner.id);
      assert.ok(actor&&actor.access_role==='client'&&actor.business_id===catalog.business.id);
      const draft=await ownerPagePort.read(catalog.business.id);
      assert.ok(draft);
      let productId:null|number=null;
      if(item.productName){
        const product=products.find(value=>value.name===item.productName);
        assert.ok(product&&product.offering_kind==='standard_product');
        const before=productMedia(product);
        assert.equal(before.filter(value=>value.kind==='video').length,1);
        assert.ok(before.some(value=>value.kind==='image'));
        const media=before.map(value=>value.kind==='video'?{kind:'video' as const,ref:item.videoRef}:value);
        await executeBasicProductUpkeep(postgresProductUpkeepPort,actor,{
          kind:'update',businessId:catalog.business.id,productId:product.id,
          expectedContentVersion:catalog.business.content_version,idempotencyKey:`maker_clip_fixture_${product.id}`,
          name:product.name,description:product.description,availability:product.availability,
          offeringKind:product.offering_kind,quantityMode:product.quantity_mode,
          orderScope:product.order_scope??'unspecified',priceMinor:product.price_minor,
          quantityUnit:product.quantity_unit,highlights:parseOfferingHighlightsJson(product.highlights_json),
          capacitySummary:product.capacity_summary,minimumOrderSummary:product.minimum_order_summary,
          leadTimeSummary:product.lead_time_summary,media,videoRef:item.videoRef,categoryId:product.category_id,
          imageAction:'keep',preserveMetadata:true,
        },null);
        productId=product.id;
      }
      await saveOwnerPageAndPublication(actor,catalog.business.id,{action:'save',version:draft.version,
        content:{...draft.content,videoUrl:productVideoWatchUrl(item.videoRef)}});
      return {businessId:catalog.business.id,productId};
    });
    const after=await runtimeCatalogByHandle(item.handle),page=await ownerPagePort.read(record.businessId);
    assert.ok(after&&page);
    assert.equal(page.content.videoUrl,productVideoWatchUrl(item.videoRef));
    if(record.productId)assert.ok(productMedia(after.products.find(product=>product.id===record.productId)!).some(value=>value.ref===item.videoRef));
    records.push({...item,...record});
  }
  fs.mkdirSync('.local/maker-clip-app-qa',{recursive:true,mode:0o700});
  fs.writeFileSync('.local/maker-clip-app-qa/fixture.json',JSON.stringify({source,cases:records})+'\n',{mode:0o600});
  console.log('PASS three disposable maker-clip fixtures prepared through ordinary commands.');
}
void main().catch(()=>{console.error('Disposable maker-clip fixture failed.');process.exitCode=1;}).finally(closePostgresRuntimeForTests);
