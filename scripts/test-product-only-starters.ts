import assert from 'node:assert/strict';
import fs from 'node:fs';
import {test} from 'node:test';
import {BUSINESS_CATEGORY_OPTIONS} from '../lib/business-categories';
import {categoryStarter,isStarterOffering} from '../lib/category-starter';
import {starterOfferings} from '../lib/business-starter';
import {SCALE_DEMO_BUSINESSES} from '../lib/scale-demo-seed';
import {DENSE_DEMO_BUSINESSES} from '../lib/dense-demo-seed';
import {simplifyDemoOffering} from '../lib/simple-demo-offering';
import {publicationReadiness} from '../lib/publication-readiness';
import {demoPublicContacts} from './demo-public-contacts';

test('BE-056/DEP-046: seed normalization preserves physical custom production and rejects real service conversion',()=>{
  const description='Steel frames made to the agreed dimensions.';
  for(const kind of ['made_to_order','manufacturing_capability'] as const)
    assert.equal(simplifyDemoOffering({kind,description}).kind,'made_to_order');
  for(const kind of ['standard_product','production_supply'] as const)
    assert.equal(simplifyDemoOffering({kind,description}).kind,'standard_product');
  assert.throws(()=>simplifyDemoOffering({kind:'service',description:'Repair visit.'}),/choose a physical product/);
  const result=simplifyDemoOffering({kind:'made_to_order',description,unit:'set',highlights:['Powder-coated finish'],options:[{name:'Color',values:['Blue','Green']}]});
  assert.match(result.description,/agreed dimensions/);
  assert.match(result.description,/Powder-coated finish/);
  assert.match(result.description,/Color: Blue, Green/);
});

test('FE-067/BE-039: every new starter has physical ready-made and custom items; old sample content still blocks publishing',()=>{
  assert.deepEqual(starterOfferings.map(item=>item.kind),['standard_product','standard_product','made_to_order']);
  for(const category of BUSINESS_CATEGORY_OPTIONS){
    const pack=categoryStarter(category.key);
    assert.deepEqual(pack.offerings.map(item=>item.kind),['standard_product','standard_product','made_to_order']);
    for(const item of pack.offerings){
      assert.doesNotMatch(item.name+' '+item.description,/consultation|repair|service|session/i);
      assert.ok(fs.existsSync('public'+item.image));
      assert.ok(isStarterOffering(item.name,item.description));
    }
    assert.equal(publicationReadiness(pack.page,pack.offerings.map(item=>({...item,is_published:1})),true).find(item=>item.key==='offerings')?.ready,false);
  }
  for(const name of ['Sample consultation service','Sample device setup and repair','Sample fitting and styling service'])
    assert.equal(isStarterOffering(name,'An edited description.'),true,'Renaming the sample pack cannot make retained examples ready');
  assert.equal(isStarterOffering('An edited title','Sample service: A one-to-one session to plan a collection.'),true);
  assert.equal(isStarterOffering('Real ceramic bowl','A hand-thrown bowl in a blue glaze.'),false);
});

test('DEP-046: scale demos replace repair work with image-matched goods while retaining stable handles and safe contacts',()=>{
  assert.equal(SCALE_DEMO_BUSINESSES.length,56);
  assert.equal(SCALE_DEMO_BUSINESSES.flatMap(b=>b.offerings).length,224);
  const replacements=[
    ['demo-aster-device-workshop',2,'Appliance Control Board','standard_product','product-3.webp'],
    ['demo-shewa-tool-workshop',2,'Hoe Head & Handle Set','standard_product','product-3.webp'],
    ['demo-tana-welding-shop',3,'Hinged Steel Window Guard','made_to_order','product-4.webp'],
  ] as const;
  for(const [handle,index,name,kind,image] of replacements){
    const business=SCALE_DEMO_BUSINESSES.find(item=>item.handle===handle)!;
    const product=business.offerings[index];
    assert.equal(product.name,name);assert.equal(product.kind,kind);
    assert.equal(product.imagePath,`/uploads/seed/portfolio/${handle}/${image}`);
    assert.ok(fs.existsSync('public'+product.imagePath));
  }
  for(const item of [...SCALE_DEMO_BUSINESSES,...DENSE_DEMO_BUSINESSES].flatMap(b=>b.offerings)){
    assert.doesNotMatch(item.name+' '+item.description,/diagnostic|repair visit|rehandle service|development service|consultation session/i);
    assert.ok(['standard_product','made_to_order'].includes(simplifyDemoOffering(item).kind));
  }
  const contacts=demoPublicContacts('hello+demo-test@gmail.com','+251911111111');
  assert.equal(contacts.email,'hello+demo-test@example.invalid');
  assert.equal(contacts.phone,'+447700900123');assert.equal(contacts.whatsapp,'+447700900123');
  assert.equal(contacts.website,'https://example.invalid/');
  for(const field of ['tiktok','instagram','telegram','facebook'] as const)assert.equal(contacts[field],'');
});
