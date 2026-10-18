import assert from 'node:assert/strict';
import {test} from 'node:test';
import {shopDto,offeringDto,marketDto} from '../lib/mobile/projections';
import {showroomCategories,showroomProductCategory} from '../lib/showroom-categories';
import type {MarketplaceDiscoveryView,DiscoveryProductResult} from '../lib/discovery';
import type {Offering,Shop,SearchItem} from '../packages/contracts/src';
import {categoryCatalog as catalog,categoryProfile as profile,categoryName,longCategoryName} from './testing/showroom-category-fixture';

test('FE-041/BE-044 S131 categories count only visible current-tenant products and ignore hydrated names',()=>{
  const categories=showroomCategories(catalog);
  assert.deepEqual(categories,[{id:10,name:categoryName,count:2},{id:20,name:longCategoryName,count:1}]);
  assert.equal(showroomProductCategory(1,categories,catalog.products[0])?.name,categoryName);
  for(const product of catalog.products.slice(3))assert.equal(showroomProductCategory(1,categories,product),undefined);
  assert.equal(showroomProductCategory(1,categories,{business_id:2,category_id:10}),undefined);
  const contaminated={...catalog,products:[...catalog.products,{...catalog.products[0],id:999,business_id:2}],categories:[...catalog.categories,catalog.categories[0]]};
  assert.deepEqual(showroomCategories(contaminated),categories,'Foreign products and duplicate category rows do not inflate choices or counts');
});

test('BE-044 S131 public and private management DTOs expose only canonical active category affiliation',()=>{
  for(const includeRetired of[false,true]){
    const dto=shopDto(catalog,profile,includeRetired);
    assert.deepEqual(dto.categories,[{id:10,name:categoryName},{id:20,name:longCategoryName}]);
    for(const id of[101,102])assert.deepEqual({id:dto.products.find(p=>p.id===id)?.categoryId,name:dto.products.find(p=>p.id===id)?.categoryName},{id:10,name:categoryName});
    assert.equal(dto.products.find(p=>p.id===103)?.categoryName,longCategoryName);
    for(const id of[104,105,106,107,108]){
      const product=dto.products.find(p=>p.id===id);if(!product)continue;
      assert.equal(Object.hasOwn(product,'categoryId'),false);assert.equal(Object.hasOwn(product,'categoryName'),false);
    }
    assert.ok(!JSON.stringify(dto).includes('FORGED'),'Inactive/foreign hydrated names never become wire authority');
    assert.equal(dto.products.length,includeRetired?8:6,'Existing private-management versus public product admission is unchanged');
  }
  assert.equal(Object.hasOwn(offeringDto({...catalog.products[0],category_name:'FORGED'}),'categoryName'),false,'Standalone product projection has no canonical category authority');
  assert.equal(shopDto({...catalog,products:[{...catalog.products[0],category_name:'FORGED active name'}]},profile).products[0].categoryName,categoryName,'Even an active affiliation uses the canonical category row, never the hydrated name');
  const flat=shopDto({...catalog,categories:[]},profile);
  assert.equal(Object.hasOwn(flat,'categories'),false,'Older flat catalogs omit additive optional fields');
  assert.ok(flat.products.every(product=>!Object.hasOwn(product,'categoryId')&&!Object.hasOwn(product,'categoryName')));
  const olderOffering:Offering=offeringDto(catalog.products[0]);
  const olderShop:Shop={...flat,products:[olderOffering]};
  assert.equal(olderShop.products[0].categoryId,undefined,'Old typed clients remain valid without taxonomy fields');
});

test('BE-044/FE-065 S130 product location comes from its own discovery row, including results outside the map cap',()=>{
  const row:DiscoveryProductResult={id:501,name:'Scoped product',description:'Merchant text',imagePath:'',
    categoryName:'',businessId:99,businessHandle:'outside-map-cap',businessName:'Far business',city:'Nairobi',region:'Nairobi County',
    primaryIndustryKey:'other',primaryIndustryLabel:'Other',offeringKind:'standard_product',availability:'available'};
  // Only fields consumed by marketDto are required at this pure adapter seam.
  const view={searchProducts:[row,{...row,id:502,city:'',region:'Legacy region'}],searchBusinesses:[],showrooms:[],
    nearbyGroups:[],places:[],countries:[],resultPage:{page:1,totalPages:1,totalItems:2}} as unknown as MarketplaceDiscoveryView;
  const result=marketDto(view);
  assert.deepEqual(result.showrooms,[],'No map lookup is needed to hydrate product location');
  assert.deepEqual(result.items.map(item=>({id:item.id,city:item.city,region:item.region})),[
    {id:501,city:'Nairobi',region:'Nairobi County'},{id:502,city:'',region:'Legacy region'},
  ]);
  const old:SearchItem={id:1,kind:'product',name:'Old item',description:'',image:'',handle:'old',businessName:'Old business'};
  assert.equal(old.city,undefined,'Location remains additive and optional for old responses');
});
