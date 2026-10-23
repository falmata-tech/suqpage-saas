import assert from 'node:assert/strict';
import {test} from 'node:test';
import {DEMO_PROCESS_VIDEOS,demoProcessVideoFor,demoOfferingVideoFor} from '../lib/demo-process-videos';
import {categoryExampleVideo} from '../lib/category-starter';

// Semantic examples from the existing seed catalog; no DB, HTTP, player or
// content-safety qualification. Expected families are independent of selector order.
const cases=[
 {name:'ceramic coffee vessel',business:DEMO_PROCESS_VIDEOS.ceramics,product:'Studio Coffee Set',category:'Drinkware',description:'A small set of cups and saucers with natural glaze variation.',family:'ceramics'},
 {name:'coffee is a soap ingredient',business:DEMO_PROCESS_VIDEOS.soap,product:'Coffee Scrub Bar',category:'Body Soap',description:'A soap bar with coffee grounds for a scrub texture.',family:'soap'},
 {name:'fruit packaging is not garment production',business:DEMO_PROCESS_VIDEOS.farming,product:'Seasonal Citrus Bag',category:'Fresh Fruit',description:'A household bag selected from the current citrus harvest.',family:'farming'},
 {name:'device pocket does not turn a bag into electronics',business:DEMO_PROCESS_VIDEOS.apparel,product:'Compact Commuter Backpack',category:'Backpacks',description:'A clean backpack with padded device space.',family:'apparel'},
 {name:'stove is equipment, not prepared injera',business:DEMO_PROCESS_VIDEOS.metal,product:'Household Injera Stove',category:'Cooking equipment',description:'A compact electric stove prepared for household injera making.',family:'metal'},
 {name:'feed bag is not a garment or crop-tour claim',business:DEMO_PROCESS_VIDEOS.grain,product:'Layer Feed Blend',category:'Poultry feed',description:'A milled layer blend supplied in currently available local bag sizes.',family:'grain'},
];
for(const value of cases)test(`FE-061/BE-049 S154: ${value.name}`,()=>{
 const selected=demoOfferingVideoFor(value.business,value.product,value.category,value.description);
 assert.equal(selected.family,value.family);
 assert.equal(selected.ref,DEMO_PROCESS_VIDEOS[value.family as keyof typeof DEMO_PROCESS_VIDEOS].ref);
});
test('FE-061 S154: a stove-making business is equipment rather than a prepared-food kitchen',()=>{
 assert.equal(demoProcessVideoFor('demo-desta-injera-stove-works','Desta Injera Stove Works','Metal cooking equipment for household and cafe kitchens.').family,'metal');
});
test('FE-061/BE-049 S154: unknown business/product/category never fabricate metal or ceramics examples',()=>{
 const unknown=demoProcessVideoFor('north-supply','North Supply','A selection for local buyers.');
 assert.equal(unknown.family,'unknown');assert.equal(unknown.ref,'');
 assert.equal(demoOfferingVideoFor(unknown,'Unclassified item','Unclassified','Ask for current choices.').ref,'');
 assert.equal(categoryExampleVideo('not-a-category'),'');assert.equal(categoryExampleVideo(undefined),'');
});
test('FE-061 S154: known grower context retains the owner-liked crop tour for unclassified seasonal choices',()=>{
 assert.equal(DEMO_PROCESS_VIDEOS.farming.ref,'youtube:a2c1vNB-Bpg');
 const selected=demoOfferingVideoFor(DEMO_PROCESS_VIDEOS.farming,'Seasonal choice','Current harvest','Ask what is available.');
 assert.equal(selected.family,'farming');assert.equal(selected.ref,'youtube:a2c1vNB-Bpg');
});
