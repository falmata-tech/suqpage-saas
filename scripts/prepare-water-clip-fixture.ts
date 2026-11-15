// A disposable copy of legacy Wabi Bottled Water tests the exact public
// fallback, owner publication, and four product-gallery media shapes.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {assertNativeDemoTarget,nativeQaSchema} from './native-qa-target';
import {runtimeGet,runtimeTransaction} from '../lib/runtime-sql';
import {runtimeCatalogByHandle} from '../lib/catalog-runtime';
import {runtimePublishedPage} from '../lib/owner-page-publication-runtime';
import {productMedia} from '../lib/product-media';
import {productVideoWatchUrl} from '../lib/video/product-video';
import {closePostgresRuntimeForTests} from '../lib/postgres-runtime-services';

const handle='demo-wabi-bottled-water';
const coverRef='tiktok:7567766530918862135';
const bottleRef=coverRef;
const jugRef='tiktok:7680266097295101198';
const names=[
  {sourceProductId:245,name:'Retail Water Cases',category:'Bottled Water',ref:bottleRef,image:1},
  {sourceProductId:246,name:'Dispenser Jar Supply',category:'Bulk Water',ref:jugRef,image:2},
  {sourceProductId:247,name:'Hospitality Bottle Packs',category:'Hospitality Supply',ref:bottleRef,image:3},
  {sourceProductId:248,name:'Event Label Water Run',category:'Custom Packaging',ref:bottleRef,image:4},
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
  const result=await runtimeTransaction(async()=>{
    assert.ok(!await runtimeCatalogByHandle(handle),'Legacy handle must be absent from the disposable setup seed.');
    const actor=await runtimeGet<{id:number}>('SELECT id FROM users ORDER BY id LIMIT 1');
    assert.ok(actor);
    const business=await runtimeGet<{id:number}>(`INSERT INTO businesses
      (handle,name,design_key,design_manifest_json,tagline,description,logo_path,hero_title,hero_subtitle,hero_image_path,process_video_ref,status,is_demo)
      VALUES(?,?,'composition','{}',?,?,?,?,?,?,'youtube:_ZybbjLgOuQ','active',1) RETURNING id`,[
      handle,'Wabi Bottled Water','Reliable drinking water for local teams and events.',
      'Reliable drinking water for shops, teams, and events. This fictional Wabi Bottled Water showroom is designed for retailers, offices, hospitality buyers, schools, and event organizers.',
      '/uploads/seed/portfolio/demo-wabi-bottled-water/logo.svg','Bottled water for the working day.',
      'Review bottle, case, dispenser, and event-label options for recurring local supply.',
      '/uploads/seed/portfolio/demo-wabi-bottled-water/hero.webp']);
    assert.ok(business);
    const categories=new Map<string,number>();
    for(const [index,name] of ['Bottled Water','Bulk Water','Hospitality Supply','Custom Packaging'].entries()){
      const category=await runtimeGet<{id:number}>(`INSERT INTO categories(business_id,name,slug,sort_order)
        VALUES(?,?,?,?) RETURNING id`,[business.id,name,name.toLowerCase().replaceAll(' ','-'),index]);
      assert.ok(category);categories.set(name,category.id);
    }
    const products=[];
    for(const [index,item] of names.entries()){
      const product=await runtimeGet<{id:number}>(`INSERT INTO products
        (business_id,category_id,name,slug,description,image_path,video_ref,availability,offering_kind,quantity_mode,is_published,sort_order,price_minor)
        VALUES(?,?,?,?,?,?,?,'available','standard_product','optional',1,?,?) RETURNING id`,[
        business.id,categories.get(item.category)!,item.name,item.name.toLowerCase().replaceAll(' ','-'),
        'Fictional bottled-water showroom example; inquire about pack or labeling details.',
        `/uploads/seed/portfolio/${handle}/product-${item.image}.webp`,item.ref,index,45000+index*5000]);
      assert.ok(product);products.push({sourceProductId:item.sourceProductId,productId:product.id,name:item.name,ref:item.ref});
    }
    const content={template:'profile-v1',coverStyle:'blended',introduction:'Review bottle, case, dispenser, and event-label options for recurring local supply.',
      about:'Reliable drinking water for shops, teams, and events. This fictional Wabi Bottled Water showroom is designed for retailers, offices, hospitality buyers, schools, and event organizers.',
      heroImage:`/uploads/seed/portfolio/${handle}/hero.webp`,videoUrl:productVideoWatchUrl(coverRef)};
    const now=Date.now();
    await runtimeGet(`INSERT INTO owner_page_drafts(business_id,version,content_json,assistance_enabled,updated_by,updated_at)
      VALUES(?,1,?,0,?,?) RETURNING business_id`,[business.id,JSON.stringify(content),actor.id,now]);
    await runtimeGet(`INSERT INTO owner_page_publications(business_id,revision,draft_version,content_json,action,published_by,published_at)
      VALUES(?,1,1,?,'publish',?,?) RETURNING business_id`,[business.id,JSON.stringify(content),actor.id,now]);
    return {businessId:business.id,sourceBusinessId:62,handle,coverRef,products};
  });
  const after=await runtimeCatalogByHandle(handle),published=await runtimePublishedPage(result.businessId);
  assert.ok(after&&published&&after.business.is_demo===1&&after.products.length===4);
  assert.equal(published.videoUrl,productVideoWatchUrl(coverRef));
  for(const item of result.products){const product=after.products.find(value=>value.id===item.productId);assert.ok(product);
    assert.ok(productMedia(product).some(value=>value.kind==='image'));
    assert.ok(productMedia(product).some(value=>value.kind==='video'&&value.ref===item.ref));}
  fs.mkdirSync('.local/water-clip-app-qa',{recursive:true,mode:0o700});
  fs.writeFileSync('.local/water-clip-app-qa/fixture.json',JSON.stringify({source,...result})+'\n',{mode:0o600});
  console.log('PASS disposable legacy water showroom and product fixture prepared.');
}
void main().catch(error=>{console.error('Disposable water fixture failed.',error);process.exitCode=1;}).finally(closePostgresRuntimeForTests);
