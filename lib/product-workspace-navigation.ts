import {normalizeSearch} from './pagination';

/** Bounded UI origins. These hints never authorize a business or product. */
export type ProductListView = {q?:string;page?:string};

export function productListView(input:{q?:unknown;page?:unknown}={}):ProductListView {
  const q=normalizeSearch(input.q),rawPage=typeof input.page==='number'?String(input.page):typeof input.page==='string'?input.page:'';
  return {...(q?{q}:{}),...(/^[1-9]\d{0,5}$/.test(rawPage)&&rawPage!=='1'?{page:rawPage}:{})};
}

function businessQuery(businessId:number):URLSearchParams {
  const query=new URLSearchParams();
  if(Number.isSafeInteger(businessId)&&businessId>0)query.set('business',String(businessId));
  return query;
}

export function productListHref(businessId:number,input:ProductListView={},saved=false):string {
  const query=businessQuery(businessId),view=productListView(input);
  if(view.q)query.set('q',view.q);
  if(view.page)query.set('page',view.page);
  if(saved)query.set('saved','1');
  return '/dashboard/products'+(query.size?'?'+query:'');
}

export function productEditorHref(productId:number|'new',businessId:number,input:ProductListView={}):string {
  const query=businessQuery(businessId),view=productListView(input);
  if(view.q)query.set('nav_q',view.q);
  if(view.page)query.set('nav_page',view.page);
  const path=productId==='new'?'new':Number.isSafeInteger(productId)&&productId>0?String(productId):'new';
  return '/dashboard/products/'+path+(query.size?'?'+query:'');
}
