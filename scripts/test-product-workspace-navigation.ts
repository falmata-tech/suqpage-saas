import assert from 'node:assert/strict';
import {test} from 'node:test';
import {productListView,productListHref,productEditorHref} from '../lib/product-workspace-navigation';

test('FE-026 S122 product list and editor origins preserve bounded Unicode search/page without accepting return URLs',()=>{
  const view=productListView({q:'  የቤት\u0000  እቃ %  ',page:'12'});
  assert.deepEqual(view,{q:'የቤት  እቃ %',page:'12'});
  const list=new URL(productListHref(18,view),'https://suqpage.test');
  assert.equal(list.pathname,'/dashboard/products');assert.equal(list.searchParams.get('business'),'18');assert.equal(list.searchParams.get('q'),view.q);assert.equal(list.searchParams.get('page'),'12');
  for(const id of [74,'new'] as const){
    const editor:URL=new URL(productEditorHref(id,18,view),'https://suqpage.test');
    assert.equal(editor.pathname,'/dashboard/products/'+id);assert.equal(editor.searchParams.get('business'),'18');assert.equal(editor.searchParams.get('nav_q'),view.q);assert.equal(editor.searchParams.get('nav_page'),'12');
  }
  for(const page of ['-1','0','1','2oops','1e3','9999999',[],{},Infinity,undefined])assert.deepEqual(productListView({page}),{});
  assert.equal(productListView({q:'x'.repeat(300)}).q?.length,120);
  const foreign=new URL(productListHref(18,{q:'https://foreign.invalid/?business=19',page:'2'}),'https://suqpage.test');assert.equal(foreign.origin,'https://suqpage.test');assert.equal(foreign.pathname,'/dashboard/products');assert.equal(foreign.searchParams.get('business'),'18');
  assert.equal(productListHref(18,{},true),'/dashboard/products?business=18&saved=1');
  assert.equal(productListHref(Number.NaN),'/dashboard/products');
});
