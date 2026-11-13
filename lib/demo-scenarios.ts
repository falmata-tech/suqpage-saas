import {normalizeOfferingPriceMinor} from './offering-presentation';
import type {ActiveProductKind} from './offerings';
import {DISCOVERY_INDUSTRIES} from './discovery-contract';

export type DemoScenarioKey='seasonal-harvest'|'workshop-production'|'wholesale-replenishment';
type FactsKey='planned'|'available'|'limited';
type FactsProfile={availability:'available'|'limited'|'coming_soon';capacity:'normal'|'limited'|'planned';leadTime:string;pricePercent:number};
export type DemoScenarioStage={key:string;title:string;update:string;facts:FactsKey;minutes:number};
export type DemoScenarioDefinition={key:DemoScenarioKey;version:number;productKind:ActiveProductKind;categories:readonly string[];
 facts:Record<FactsKey,FactsProfile>;stages:readonly DemoScenarioStage[]};

const definitions:Record<DemoScenarioKey,DemoScenarioDefinition>={
 'seasonal-harvest':{key:'seasonal-harvest',version:1,productKind:'standard_product',categories:['agriculture-growers'],facts:{
  planned:{availability:'coming_soon',capacity:'planned',leadTime:'Next example harvest in 5–7 days',pricePercent:100},
  available:{availability:'available',capacity:'normal',leadTime:'Dispatch in 1–2 working days',pricePercent:100},
  limited:{availability:'limited',capacity:'limited',leadTime:'Dispatch in 1–2 working days',pricePercent:105},
 },stages:[
  {key:'preparing',title:'Preparing the harvest',facts:'planned',minutes:1,update:'The next example harvest is being prepared; quantities are not yet ready for dispatch.'},
  {key:'checking',title:'Checking the next supply',facts:'planned',minutes:1,update:'The upcoming example harvest is being checked before the supply window opens.'},
  {key:'available',title:'Harvest available',facts:'available',minutes:2,update:'The example harvest is now available for wholesale inquiries within the stated supply capacity.'},
  {key:'dispatch',title:'Regular dispatch window',facts:'available',minutes:1,update:'The current example harvest remains available for dispatch within the stated lead time.'},
  {key:'limited',title:'Seasonal supply is limited',facts:'limited',minutes:2,update:'The example supply window is narrowing; capacity is lower and the predefined seasonal price applies.'},
  {key:'replenished',title:'Supply window renewed',facts:'available',minutes:1,update:'The next example supply window has opened; normal capacity and pricing are restored.'},
 ]},
 'workshop-production':{key:'workshop-production',version:1,productKind:'made_to_order',categories:['machinery-tools','home-living','fashion-textiles','electronics'],facts:{
  planned:{availability:'limited',capacity:'limited',leadTime:'New orders: 21–28 working days',pricePercent:100},
  available:{availability:'available',capacity:'normal',leadTime:'New orders: 10–14 working days',pricePercent:100},
  limited:{availability:'limited',capacity:'limited',leadTime:'New orders: 21–28 working days',pricePercent:100},
 },stages:[
  {key:'slots-open',title:'Production slots open',facts:'available',minutes:1,update:'The example workshop has open production slots at its normal capacity.'},
  {key:'scheduled',title:'Next run scheduled',facts:'planned',minutes:1,update:'The next example production run is scheduled; fewer new-order slots and the longer lead time apply.'},
  {key:'production',title:'Production run in progress',facts:'limited',minutes:2,update:'The example workshop run is in progress; new orders remain subject to limited capacity.'},
  {key:'finishing',title:'Finishing the current run',facts:'limited',minutes:1,update:'The current example run is being finished; the published new-order lead time still applies.'},
  {key:'planning',title:'Planning the next allocation',facts:'limited',minutes:2,update:'The next example capacity allocation is being planned; new-order slots remain limited.'},
  {key:'capacity-restored',title:'Normal capacity restored',facts:'available',minutes:1,update:'The next example allocation is open; normal capacity and the shorter new-order lead time are restored.'},
 ]},
 'wholesale-replenishment':{key:'wholesale-replenishment',version:1,productKind:'standard_product',categories:DISCOVERY_INDUSTRIES.map(v=>v.key),facts:{
  planned:{availability:'coming_soon',capacity:'planned',leadTime:'Next example batch in 7–10 days',pricePercent:100},
  available:{availability:'available',capacity:'normal',leadTime:'Dispatch in 2–3 working days',pricePercent:100},
  limited:{availability:'limited',capacity:'limited',leadTime:'Dispatch in 2–3 working days',pricePercent:100},
 },stages:[
  {key:'batch-open',title:'Wholesale batch available',facts:'available',minutes:1,update:'The current example wholesale batch is available at the stated minimum order and dispatch time.'},
  {key:'dispatch',title:'Batch dispatch window',facts:'available',minutes:1,update:'The example batch remains available through its regular dispatch window.'},
  {key:'limited',title:'Current batch is limited',facts:'limited',minutes:2,update:'The current example batch has limited supply; the reduced capacity applies.'},
  {key:'preparing',title:'Replenishment being prepared',facts:'planned',minutes:1,update:'The next example batch is being prepared and is not yet ready for dispatch.'},
  {key:'checking',title:'Checking replenishment',facts:'planned',minutes:2,update:'The replacement example batch is being checked before the next availability window.'},
  {key:'replenished',title:'Wholesale batch replenished',facts:'available',minutes:1,update:'The next example batch is available; normal capacity and dispatch time are restored.'},
 ]},
};
for(const definition of Object.values(definitions)){
 Object.values(definition.facts).forEach(Object.freeze);Object.freeze(definition.facts);
 definition.stages.forEach(Object.freeze);Object.freeze(definition.stages);
 Object.freeze(definition.categories);Object.freeze(definition);
}
Object.freeze(definitions);

export class DemoScenarioError extends Error{}
export type DemoScenarioParameters={productName:string;productKind:ActiveProductKind;businessCategories:string[];unit:string;
 minimumOrder:number;normalCapacity:number;limitedCapacity:number;basePriceMinor:number|null};
export function demoScenario(key:string,version=1):DemoScenarioDefinition{
 if(!Object.hasOwn(definitions,key))throw new DemoScenarioError('Unknown demo scenario.');
 const definition=definitions[key as DemoScenarioKey];
 if(definition.version!==version)throw new DemoScenarioError('Demo scenario version changed.');
 return definition;
}
export function parseDemoScenarioParameters(value:unknown):DemoScenarioParameters{
 if(!value||typeof value!=='object'||Array.isArray(value))throw new DemoScenarioError('Invalid demo scenario parameters.');
 const v=value as Record<string,unknown>,keys=['productName','productKind','businessCategories','unit','minimumOrder','normalCapacity','limitedCapacity','basePriceMinor'];
 if(Object.keys(v).some(key=>!keys.includes(key))||keys.some(key=>!Object.hasOwn(v,key)))throw new DemoScenarioError('Invalid demo scenario parameters.');
 if(typeof v.productName!=='string'||!v.productName.trim()||v.productName.length>140||
    typeof v.unit!=='string'||!v.unit.trim()||v.unit.length>40||/[\r\n\u0000-\u001f]/.test(v.unit)||
    !['standard_product','made_to_order'].includes(String(v.productKind)))throw new DemoScenarioError('Invalid demo product or selling unit.');
 const number=(key:string)=>{const n=v[key];if(typeof n!=='number'||!Number.isSafeInteger(n)||n<1||n>1000000)throw new DemoScenarioError('Invalid demo quantity.');return n;};
 const minimumOrder=number('minimumOrder'),normalCapacity=number('normalCapacity'),limitedCapacity=number('limitedCapacity');
 if(minimumOrder>limitedCapacity||limitedCapacity>=normalCapacity)throw new DemoScenarioError('Demo quantities are inconsistent.');
 if(v.basePriceMinor!==null&&typeof v.basePriceMinor!=='number')throw new DemoScenarioError('Invalid demo price.');
 if(!Array.isArray(v.businessCategories)||!v.businessCategories.length||v.businessCategories.length>7||
    v.businessCategories.some(key=>typeof key!=='string'||!DISCOVERY_INDUSTRIES.some(v=>v.key===key)))throw new DemoScenarioError('Invalid demo business category.');
 const basePriceMinor=normalizeOfferingPriceMinor(v.basePriceMinor);
 return {productName:v.productName.trim(),productKind:v.productKind as ActiveProductKind,businessCategories:[...v.businessCategories] as string[],unit:v.unit.trim(),minimumOrder,normalCapacity,limitedCapacity,basePriceMinor};
}
export function demoScenarioStage(key:string,version:number,index:number,raw:unknown){
 const definition=demoScenario(key,version),parameters=parseDemoScenarioParameters(raw);
 if(!Number.isInteger(index)||index<0||index>=definition.stages.length)throw new DemoScenarioError('Invalid demo stage.');
 if(parameters.productKind!==definition.productKind||!parameters.businessCategories.some(key=>definition.categories.includes(key)))throw new DemoScenarioError('Demo scenario does not match this business/product.');
 const stage=definition.stages[index],profile=definition.facts[stage.facts];
 const capacity=profile.capacity==='limited'?parameters.limitedCapacity:parameters.normalCapacity;
 const sellingUnit=parameters.unit.replace(/^per\s+/i,'');
 const priceMinor=parameters.basePriceMinor===null?null:normalizeOfferingPriceMinor(Math.round(parameters.basePriceMinor*profile.pricePercent/100));
 return {definition,stage,durationMs:stage.minutes*60000,
  businessUpdate:`${parameters.productName}: ${stage.update}`,
  product:{availability:profile.availability,priceMinor,quantityUnit:parameters.unit,
   minimumOrderSummary:`${parameters.minimumOrder} ${sellingUnit}`,
   capacitySummary:`${profile.capacity==='planned'?'Planned':'Up to'} ${capacity} ${sellingUnit} per week`,leadTimeSummary:profile.leadTime}};
}
export function nextDemoScenarioStage(key:string,version:number,stage:number,cycle:number){
 const definition=demoScenario(key,version);
 if(!Number.isSafeInteger(stage)||stage< -1||stage>=definition.stages.length||!Number.isSafeInteger(cycle)||cycle<0||cycle>=1000000000)throw new DemoScenarioError('Invalid demo progress.');
 return stage===definition.stages.length-1?{stage:0,cycle:cycle+1}:{stage:stage+1,cycle};
}
export function demoScenarioCommandKey(businessId:number,key:string,version:number,stage:number,cycle:number){
 if(!Number.isSafeInteger(businessId)||businessId<1)throw new DemoScenarioError('Invalid demo business.');
 nextDemoScenarioStage(key,version,stage,cycle);
 if(stage<0)throw new DemoScenarioError('Invalid demo stage.');
 return `demo-${businessId}-${key}-v${version}-${cycle}-${stage}`;
}
