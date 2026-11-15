import test from 'node:test';
import assert from 'node:assert/strict';
import {demoCatalogStage,type DemoCatalogProduct} from '../lib/demo-catalog-scenarios';
import {planEnrolledDemoCopy,planLegacyDemoCopy} from '../lib/demo-copy-correction';
import {preS200StageUpdates,preS200LeadTimes} from '../lib/demo-scenario-copy-v1-before';
import {parseDemoCopyCorrection} from '../lib/demo-copy-correction-request';
import type {ShopPageContent} from '../lib/owner-page-domain';

const page=(about:string,introduction='Original introduction'):ShopPageContent=>({
 template:'profile-v1',coverStyle:'blended',about,introduction,heroImage:'/cover.webp',
 videoUrl:'',contacts:{email:'shop@example.com',website:'https://example.com/'},
});
const parameters=(name:string)=>({productName:name,productKind:'standard_product' as const,
 businessCategories:['home-living'],unit:'piece',minimumOrder:1,normalCapacity:100,
 limitedCapacity:10,basePriceMinor:10000});
const bindings:DemoCatalogProduct[]=[0,2,4,1].map((offset,index)=>({
 productId:index+1,scenarioKey:'wholesale-replenishment',scenarioVersion:1,
 parameters:parameters('Product '+(index+1)),baselineDescription:'Original product '+(index+1),
 phaseOffset:offset,
}));
test('S200 enrolled correction replaces exact stage wording and story while preserving other page/product facts',()=>{
 const stage=0,plans=demoCatalogStage(bindings,stage),primary=plans[0];
 const oldPrimary=`${primary.binding.parameters.productName}: ${preS200StageUpdates[primary.binding.scenarioKey][stage]}`;
 const oldStory='Useful woven goods. This fictional Selam Weave showroom is designed for homes and shops.';
 const baseline=page(oldStory),copy={
  businessDescription:oldStory,
  page:page(`${oldPrimary}\n\n${oldStory}`,`${primary.plan.stage.title}. ${oldPrimary}`),
  products:plans.map(({binding,plan})=>{
   const oldUpdate=preS200StageUpdates[binding.scenarioKey][(stage+binding.phaseOffset)%6];
   return {id:binding.productId,description:`${oldUpdate}\n\n${binding.baselineDescription}`,
    leadTimeSummary:preS200LeadTimes[plan.product.leadTimeSummary]??plan.product.leadTimeSummary};
  }),
 };
 const corrected=planEnrolledDemoCopy({businessName:'Selam Weave',copy,baseline,bindings,stage});
 assert.equal(corrected.changed,true);
 assert.equal(corrected.changedProductIds.length,4);
 assert.equal(corrected.after.businessDescription,'Useful woven goods. For homes and shops.');
 assert.equal(corrected.baselineAfter.about,corrected.after.businessDescription);
 assert.equal(corrected.after.page.about,
  `${primary.plan.businessUpdate}\n\nUseful woven goods. For homes and shops.`);
 assert.equal(corrected.after.page.introduction,
  `${primary.plan.stage.title}. ${primary.plan.businessUpdate}`);
 assert.deepEqual(corrected.after.page.contacts,copy.page.contacts);
 assert.equal(corrected.after.products[0].description,
  `${primary.plan.productUpdate}\n\nOriginal product 1`);
 assert.equal(corrected.after.products[0].leadTimeSummary,primary.plan.product.leadTimeSummary);
 const replay=planEnrolledDemoCopy({businessName:'Selam Weave',copy:corrected.after,
  baseline:corrected.baselineAfter,bindings,stage});
 assert.equal(replay.changed,false);
 assert.equal(replay.beforeHash,corrected.afterHash);
 assert.deepEqual(replay.changedProductIds,[]);
});
test('S200 refuses invented stage text, changed product baselines and foreign ownerless pages',()=>{
 const plans=demoCatalogStage(bindings,0),primary=plans[0],story='Plain story.';
 const copy={businessDescription:story,
  page:page('Unexpected narrative.',`${primary.plan.stage.title}. ${primary.plan.businessUpdate}`),
  products:plans.map(({binding,plan})=>({id:binding.productId,
   description:`${plan.productUpdate}\n\n${binding.baselineDescription}`,
   leadTimeSummary:plan.product.leadTimeSummary}))};
 assert.throws(()=>planEnrolledDemoCopy({businessName:'Selam Weave',copy,baseline:page(story),bindings,stage:0}),
  /Unexpected current demo about/);
 assert.throws(()=>planLegacyDemoCopy({businessId:49,businessName:'Other',copy}),/Unreviewed/);
 const legacy={...copy,page:page('Clay objects. This fictional Dara Clay Works showroom is designed for homes.'),
  businessDescription:'Clay objects. This fictional Dara Clay Works showroom is designed for homes.'};
 const fixed=planLegacyDemoCopy({businessId:50,businessName:'Dara Clay Works',copy:legacy});
 assert.equal(fixed.after.businessDescription,'Clay objects. For homes.');
 assert.deepEqual(fixed.after.products,legacy.products);
 assert.deepEqual(fixed.after.page.contacts,legacy.page.contacts);
});
test('S200 request parser binds the reviewed 64-page cohort and rejects extra authority',()=>{
 const enrolled={kind:'copy_correction',direction:'apply',operationKey:'s200_copy_001',
  businessId:1,handle:'selam-weave',cohort:'enrolled',expectedContentVersion:4,
  expectedDraftVersion:3,expectedPageRevision:3,expectedHash:'a'.repeat(64),
  expectedStage:2,expectedCycle:1,expectedDueAt:1800000000000};
 assert.deepEqual(parseDemoCopyCorrection(enrolled),enrolled);
 for(const bad of [{...enrolled,businessId:10},{...enrolled,businessId:41},
  {...enrolled,businessId:99},{...enrolled,cohort:'legacy'},
  {...enrolled,expectedHash:'bad'},{...enrolled,ownerUserId:3},
  {...enrolled,direction:'delete'}])assert.throws(()=>parseDemoCopyCorrection(bad));
 const legacy={kind:'copy_correction',direction:'rollback',operationKey:'s200_copy_050',
  businessId:50,handle:'demo-dara-clay-works',cohort:'legacy',
  expectedContentVersion:8,expectedDraftVersion:5,expectedPageRevision:5};
 assert.deepEqual(parseDemoCopyCorrection(legacy),legacy);
 assert.throws(()=>parseDemoCopyCorrection({...legacy,handle:'other'}));
 assert.throws(()=>parseDemoCopyCorrection({...legacy,expectedHash:'b'.repeat(64)}));
});
