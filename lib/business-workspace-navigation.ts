import {normalizeSearch} from './pagination';

/** A bounded list origin is a navigation hint, never business authority. */
export function businessListOrigin(params:Pick<URLSearchParams,'get'>):string {
  const query=new URLSearchParams(),q=normalizeSearch(params.get('nav_q')||'');
  const page=params.get('nav_page')||'',status=params.get('nav_status')||'';
  if(q)query.set('q',q);
  if(/^[1-9]\d{0,5}$/.test(page)&&page!=='1')query.set('page',page);
  if(['active','draft','suspended'].includes(status))query.set('status',status);
  return '/dashboard/admin/businesses'+(query.size?'?'+query:'');
}

export function businessListOriginParams(input:{q?:string;page?:string;status?:string}):string {
  const query=new URLSearchParams();
  for(const [key,value] of Object.entries(input))if(value)query.set('nav_'+key,value);
  const canonical=new URLSearchParams(businessListOrigin(query).split('?')[1]||'');
  return new URLSearchParams([...canonical.entries()].map(([key,value])=>['nav_'+key,value])).toString();
}
