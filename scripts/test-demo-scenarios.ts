import test from 'node:test';
import assert from 'node:assert/strict';
import {demoScenario,demoScenarioStage,parseDemoScenarioParameters,nextDemoScenarioStage,demoScenarioCommandKey} from '../lib/demo-scenarios';
const base={productName:'Example harvest',productKind:'standard_product',businessCategories:['agriculture-growers'],unit:'kg',minimumOrder:10,normalCapacity:1000,limitedCapacity:200,basePriceMinor:10000};

test('BE-067 complete predefined harvest timeline keeps related facts and units coherent',()=>{
 const states=Array.from({length:6},(_,i)=>demoScenarioStage('seasonal-harvest',1,i,base));
 assert.deepEqual(states.map(s=>s.product.availability),['coming_soon','coming_soon','available','available','limited','available']);
 assert.deepEqual(states.map(s=>s.product.priceMinor),[10000,10000,10000,10000,10500,10000]);
 assert.match(states[0].product.capacitySummary,/Planned 1000 kg/);assert.match(states[4].product.capacitySummary,/Up to 200 kg/);
 assert.deepEqual(states[0].product,states[1].product,'Related progress stages retain the same selling facts until the planned supply transition.');
 assert.equal(new Set(states.map(s=>s.productUpdate)).size,6,'Every stage has a distinct predefined listing summary.');
 const perUnit=demoScenarioStage('seasonal-harvest',1,0,{...base,unit:'per kg'});
 assert.equal(perUnit.product.quantityUnit,'per kg');assert.equal(perUnit.product.minimumOrderSummary,'10 kg');
 for(const state of states){assert.equal(state.product.minimumOrderSummary,'10 kg');assert.ok(state.businessUpdate.startsWith('Example harvest:'));assert.ok(state.durationMs>=60000);}
 assert.match(states[0].product.leadTimeSummary,/Next example harvest/);assert.match(states[2].product.leadTimeSummary,/Dispatch/);
});
test('BE-067 workshop and replenishment timelines retain compatible product identity and dispatch promises',()=>{
 const workshop=Array.from({length:6},(_,i)=>demoScenarioStage('workshop-production',1,i,{...base,productName:'Workshop table',productKind:'made_to_order',businessCategories:['home-living'],unit:'tables',minimumOrder:1,normalCapacity:12,limitedCapacity:4,basePriceMinor:null}));
 assert.deepEqual(workshop.map(s=>s.product.availability),['available','limited','limited','limited','limited','available']);
 assert.ok(workshop.every(s=>s.product.priceMinor===null));assert.match(workshop[1].product.leadTimeSummary,/21–28/);assert.match(workshop[5].product.leadTimeSummary,/10–14/);
 const batch=Array.from({length:6},(_,i)=>demoScenarioStage('wholesale-replenishment',1,i,base));
 assert.deepEqual(batch.map(s=>s.product.availability),['available','available','limited','coming_soon','coming_soon','available']);
 assert.ok(batch.every(s=>s.product.priceMinor===10000));assert.deepEqual(batch[0].product,batch[5].product);
});
test('BE-067 progress is restartable, deterministic and gives each cycle/stage a distinct command identity',()=>{
 let progress={stage:-1,cycle:0};const keys=new Set<string>();
 for(let i=0;i<18;i++){
  progress=nextDemoScenarioStage('seasonal-harvest',1,progress.stage,progress.cycle);
  const plan=demoScenarioStage('seasonal-harvest',1,progress.stage,base);
  assert.deepEqual(plan,demoScenarioStage('seasonal-harvest',1,progress.stage,JSON.parse(JSON.stringify(base))));
  const key=demoScenarioCommandKey(12,'seasonal-harvest',1,progress.stage,progress.cycle);assert.match(key,/^[A-Za-z0-9_-]{16,100}$/);keys.add(key);
 }
 assert.equal(keys.size,18);assert.deepEqual(progress,{stage:5,cycle:2});
 assert.notEqual(demoScenarioCommandKey(12,'seasonal-harvest',1,0,0),demoScenarioCommandKey(13,'seasonal-harvest',1,0,0));
});
test('BE-067 malformed definitions, mismatched kinds, inconsistent quantities, overflow and forged fields refuse plans',()=>{
 for(const key of ['unknown','__proto__','constructor'])assert.throws(()=>demoScenario(key));
 assert.throws(()=>demoScenario('seasonal-harvest',2));
 for(const index of [-1,6,0.5,NaN])assert.throws(()=>demoScenarioStage('seasonal-harvest',1,index,base));
 for(const change of [{productKind:'service'},{productKind:'made_to_order'},{businessCategories:['home-living']},{businessCategories:['unknown']},{minimumOrder:201},{limitedCapacity:1000},{normalCapacity:0},{unit:''},{unit:'kg\nunsafe'},{basePriceMinor:'100'},{basePriceMinor:Infinity},{extra:'field'}])assert.throws(()=>demoScenarioStage('seasonal-harvest',1,0,{...base,...change}));
 assert.throws(()=>demoScenarioStage('seasonal-harvest',1,4,{...base,basePriceMinor:999999999}));
 for(const v of [null,[],{},'bad'])assert.throws(()=>parseDemoScenarioParameters(v));
 assert.throws(()=>nextDemoScenarioStage('seasonal-harvest',1,6,0));assert.throws(()=>nextDemoScenarioStage('seasonal-harvest',1,0,-1));
});
