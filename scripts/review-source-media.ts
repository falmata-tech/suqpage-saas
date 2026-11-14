// Finite local source-player fixture. Never an admission of a clip to a merchant.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertNativeDemoTarget,nativeQaSchema} from './native-qa-target';
import {runtimeGet,runtimeRun} from '../lib/runtime-sql';
import {runtimeCatalogByBusinessId} from '../lib/catalog-runtime';
import {correctDemoMedia} from '../lib/demo-simulator-runtime';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {productMedia} from '../lib/product-media';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';

async function main(){
 const target=assertNativeDemoTarget();
 const allowed=['22iNfILuO4U','gos07cabE6w','_5kQaug4IwI','kuwfg34ZMyM','URAfSJzqVww','rm2fV4BrQ7k','5EUOdQE0LmU','G0rZDzPbjw0','4eni7vRYWn8','NJMPGgcDylY','gkqKw1n6VQg','2H4PO4yVIsI','a2c1vNB-Bpg','ftMC5TSJSBg'];
 const id=process.argv[2];assert.ok(allowed.includes(id));
 const fixture=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
 assert.equal(fixture.source,execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim());
 assert.equal(fixture.handle,'demo-liya-soap-kitchen');
 target.searchParams.set('options',`-csearch_path=${nativeQaSchema(fixture.schema)}`);
 Object.assign(process.env,{SUQPAGE_DATABASE_DRIVER:'postgres',SUQPAGE_POSTGRES_URL:target.href,SUQPAGE_AUTH_DRIVER:'local',SUQPAGE_MEDIA_DRIVER:'filesystem'});
 const enrollment=await runtimeGet<{owner_user_id:number;provider_user_id:string;expected_hash:string}>('SELECT * FROM demo_simulator_enrollments WHERE business_id=?',[fixture.businessId]);
 const catalog=await runtimeCatalogByBusinessId(fixture.businessId,true),draft=await ownerPagePort.read(fixture.businessId);
 assert.ok(enrollment&&catalog&&draft);assert.equal(catalog.business.is_demo,1);assert.equal(catalog.business.status,'active');assert.equal(catalog.products.length,4);
 await runtimeRun("UPDATE demo_simulator_control SET enabled=0,pause_reason='operator' WHERE id=1");
 const ref=`youtube:${id}`;
 await correctDemoMedia({kind:'media_correction',operationKey:'source_player_'+id.replaceAll('-','_'),businessId:fixture.businessId,handle:fixture.handle,
  ownerUserId:enrollment.owner_user_id,providerUserId:enrollment.provider_user_id,expectedHash:enrollment.expected_hash,
  expectedContentVersion:catalog.business.content_version,expectedDraftVersion:draft.version,
  expectedPageRevision:Number((await runtimeGet<{revision:number}>('SELECT max(revision) revision FROM owner_page_publications WHERE business_id=?',[fixture.businessId]))!.revision),
  coverBefore:draft.content.videoUrl,coverVideoRef:ref,
  products:[...catalog.products].sort((a,b)=>a.id-b.id).map(p=>({productId:p.id,beforeMedia:productMedia(p),afterMedia:productMedia(p).map(m=>m.kind==='video'?{kind:'video',ref}:m)})),
 });
}
void main().catch(error=>{console.error(error instanceof Error?error.message:'Source fixture failed');process.exitCode=1;}).finally(()=>closePostgresRuntimeForTests());
