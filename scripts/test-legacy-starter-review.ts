import assert from 'node:assert/strict';
import {test} from 'node:test';
import {LEGACY_STARTER_LABEL_CORRECTION_ACTION,legacyStarterReviewHold,legacyStarterReviewReceipt} from '../lib/legacy-starter-review';
import {publicationReadiness} from '../lib/publication-readiness';
import {firstPublicationIssues} from '../lib/publication-readiness-runtime';
import {getDb,closeDbForTests,getUserById} from './testing/postgres-fixture';
import {saveOwnerPageAndPublication} from '../lib/owner-page-save-runtime';
import {changePagePublication} from '../lib/owner-page-publication';
import {ownerPagePort} from '../lib/owner-page-runtime';
import {pagePublicationPort} from '../lib/owner-page-publication-runtime';

const about='We make ceramic planters for local homes.';
const products=[{id:7,name:'Ceramic planter',description:'A planter made in our workshop.'}];
const page={template:'profile-v1' as const,coverStyle:'blended' as const,introduction:'',about,heroImage:'',videoUrl:'',contacts:{phone:'+251911234567'}};

test('FE-052: corrected private starter fields stay held until each field changes',()=>{
  const detail=legacyStarterReviewReceipt(about,products);
  assert.doesNotMatch(detail,/ceramic|planter|workshop|local homes/i,'audit receipt contains hashes, not private text');
  assert.deepEqual(legacyStarterReviewHold(detail,about,products),{about:true,productIds:[7]});
  assert.deepEqual(legacyStarterReviewHold(detail,'Our workshop makes useful planters.',products),{about:false,productIds:[7]});
  assert.deepEqual(legacyStarterReviewHold(detail,about,[{...products[0],name:'Handmade planter'}]),{about:true,productIds:[7]},'changing only the title does not clear an unchanged description');
  const edited=[{...products[0],name:'Handmade planter',description:'Handmade in blue and brown glaze.'}];
  assert.deepEqual(legacyStarterReviewHold(detail,about,edited),{about:true,productIds:[]});
  const held=legacyStarterReviewHold(detail,about,products);
  const listed=[{...products[0],is_published:1,offering_kind:'standard_product' as const}];
  assert.deepEqual(publicationReadiness(page,listed,true,held).filter(c=>!c.ready).map(c=>c.key),['about','offerings']);
  assert.equal(publicationReadiness(page,[{...listed[0],is_published:0}],true,held).find(c=>c.key==='offerings')?.ready,false,'a hidden product cannot satisfy the required listed-product check');
  assert.equal(publicationReadiness(page,[...listed,{id:8,name:'Real bowl',description:'A real bowl.',is_published:1,offering_kind:'standard_product'}],true,held).find(c=>c.key==='offerings')?.ready,false,'relisting the retained starter remains held alongside a real product');
  assert.equal(publicationReadiness(page,[{id:8,name:'Real bowl',description:'A real bowl.',is_published:1,offering_kind:'standard_product'}],true,held).find(c=>c.key==='offerings')?.ready,true,'a hidden starter does not block a real listed product');
  assert.deepEqual(legacyStarterReviewHold('{bad json',about,products),held,'malformed receipts fail closed');
  assert.throws(()=>legacyStarterReviewReceipt(about,[products[0],products[0]]),/Invalid/);
});

test('FE-052: tenant-scoped receipt blocks actual first publication until owner edits retained fields',async()=>{
  const db=await getDb();
  try{
    const firstId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('starter-hold-a','Starter hold A','composition','draft')").run()).insertedId);
    const secondId=Number((await db.prepare("INSERT INTO businesses(handle,name,design_key,status) VALUES('starter-hold-b','Starter hold B','composition','draft')").run()).insertedId);
    const userId=Number((await db.prepare("INSERT INTO users(email,password_hash,name,role,business_id) VALUES('starter-hold-a@example.test','unused','Owner','owner',?)").run(firstId)).insertedId);
    await db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,'client')").run(userId);
    const owner=(await getUserById(userId))!;
    const firstProductId=Number((await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published,offering_kind) VALUES(?,'Ceramic planter','sample-planter','A planter made in our workshop.',1,'standard_product')").run(firstId)).insertedId);
    await db.prepare("INSERT INTO products(business_id,name,slug,description,is_published,offering_kind) VALUES(?,'Ceramic planter','sample-planter','A planter made in our workshop.',1,'standard_product')").run(secondId);
    const saved=await saveOwnerPageAndPublication(owner,firstId,{action:'start',content:page});
    await db.prepare("INSERT INTO owner_location_proposals(business_id,version,category_key,city,region,location_mode,reviewed_version,updated_at) VALUES(?,1,'other-manufacturing','Addis Ababa','Addis Ababa','area',1,1)").run(firstId);
    const detail=legacyStarterReviewReceipt(about,[{...products[0],id:firstProductId}]);
    await db.prepare('INSERT INTO audit_logs(user_id,business_id,action,detail,ip_hash) VALUES(?,?,?,?,\'\')').run(userId,firstId,LEGACY_STARTER_LABEL_CORRECTION_ACTION,detail);
    assert.deepEqual((await firstPublicationIssues(firstId,page)).map(c=>c.key),['about','offerings']);
    assert.equal((await firstPublicationIssues(secondId,page)).some(c=>c.key==='about'||c.key==='offerings'),false,'another tenant never inherits the receipt');
    await assert.rejects(()=>changePagePublication(ownerPagePort,pagePublicationPort,owner,firstId,{action:'publish',version:saved.version,revision:0}),/Describe your business/);
    assert.equal((await db.prepare('SELECT COUNT(*) n FROM owner_page_publications WHERE business_id=?').get(firstId)).n,0);
    const changed=await saveOwnerPageAndPublication(owner,firstId,{action:'save',version:saved.version,content:{...page,about:'Our workshop makes practical ceramic planters.'}});
    assert.deepEqual((await firstPublicationIssues(firstId,changed.content)).map(c=>c.key),['offerings']);
    await db.prepare('UPDATE products SET name=?,description=? WHERE id=? AND business_id=?').run('Handmade blue planter','Made in blue glaze for a sunny window.',firstProductId,firstId);
    assert.deepEqual((await firstPublicationIssues(firstId,changed.content)).map(c=>c.key),[]);
    const published=await changePagePublication(ownerPagePort,pagePublicationPort,owner,firstId,{action:'publish',version:changed.version,revision:0});
    assert.equal(published.revision,1);
    assert.equal((await db.prepare('SELECT status FROM businesses WHERE id=?').get(secondId)).status,'draft');
  }finally{await closeDbForTests();}
});
