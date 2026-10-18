import {normalizeDiscoveryCategories,normalizeDiscoveryPlaces} from './discovery-contract';
import {isCountryCode} from './countries';
export const MARKET_MAP_LIMIT = 200;
export const MARKET_PRODUCT_BATCH_SIZE = 12;
export type MarketScope = 'businesses'|'products';
export type MarketSearch = {query:string;categories:string[];countries:string[];cities:string[];madeToOrder:boolean;page:number;legacyPlaces?:string[]};
export const emptyMarketSearch=():MarketSearch=>({query:'',categories:[],countries:[],cities:[],madeToOrder:false,page:1});
export class MarketSearchError extends Error {
 constructor(){super('Check your search filters.');}
}
function productOrderFilter(value:boolean|string|undefined):boolean {
 if(value===undefined||value===false||value==='false'||value==='0')return false;
 if(value===true||value==='true'||value==='1')return true;
 throw new MarketSearchError();
}
const values=(input:string|readonly string[]|undefined)=> (typeof input==='string'?[input]:input||[]).slice(0,32).flatMap(v=>v.slice(0,3000).split('|'));
export function cityLocation(key:string):{country:string;city:string}|null {
 const colon=key.indexOf(':'),country=key.slice(0,colon),city=key.slice(colon+1).trim();
 return colon>0&&isCountryCode(country)&&city.length>0&&city.length<=100&&!/[\u0000-\u001f\u007f]/.test(city)?{country,city}:null;
}
export function normalizeMarketSearch(input:{q?:string;category?:string|readonly string[];country?:string|readonly string[];city?:string|readonly string[];place?:string|readonly string[];madeToOrder?:boolean|string;offeringType?:string;page?:string|number}):MarketSearch {
 if(input.offeringType!==undefined&&input.offeringType!==''&&input.offeringType!=='products')throw new MarketSearchError();
 return {query:(input.q||'').normalize('NFKC').replace(/[\u0000-\u001f\u007f]/g,'').trim().slice(0,80),
 categories:normalizeDiscoveryCategories(input.category),
 countries:[...new Set(values(input.country).filter(isCountryCode))].sort().slice(0,16),
 cities:[...new Set(values(input.city).filter(key=>Boolean(cityLocation(key))))].sort().slice(0,16),
 madeToOrder:productOrderFilter(input.madeToOrder),
 page:Math.max(1,Math.min(100000,Number.parseInt(String(input.page||1),10)||1)),...(normalizeDiscoveryPlaces(input.place).length?{legacyPlaces:normalizeDiscoveryPlaces(input.place)}:{})};
}
export function hasMarketCriteria(search:MarketSearch):boolean {return Boolean(search.query.trim()||search.categories.length||search.countries.length||search.cities.length||search.madeToOrder||search.legacyPlaces?.length);}
export function marketSearchParams(scope:MarketScope,search:MarketSearch):URLSearchParams {
 const p=new URLSearchParams({scope});if(search.query)p.set('q',search.query);
 for(const c of search.categories)p.append('category',c);
 for(const c of search.countries)p.append('country',c);
 for(const c of search.cities)p.append('city',c);
 for(const c of search.legacyPlaces||[])p.append('place',c);
 if(scope==='products'&&search.madeToOrder)p.set('madeToOrder','true');
 if(search.page>1)p.set('page',String(search.page));return p;
}
export function readMarketSearch(p:URLSearchParams,prefix=''):MarketSearch {
 if(!validMarketFilterParams(p,prefix))throw new MarketSearchError();
 return normalizeMarketSearch({q:p.get(prefix+'q')||'',category:p.getAll(prefix+'category'),country:p.getAll(prefix+'country'),city:p.getAll(prefix+'city'),place:p.getAll(prefix+'place'),madeToOrder:p.get(prefix+'madeToOrder')??undefined,offeringType:p.get(prefix+'offeringType')||'',page:p.get(prefix+'page')||'1'});
}
/** Retired or malformed explicit type criteria must never broaden a query. */
export function validMarketFilterParams(p:URLSearchParams,prefix=''):boolean {
 const mode=p.getAll(prefix+'madeToOrder'),legacy=p.getAll(prefix+'offeringType');
 return mode.length<=1&&mode.every(value=>['true','false','1','0'].includes(value))
  &&legacy.length<=1&&legacy.every(value=>value===''||value==='products');
}
/** Reject malformed explicit geographic criteria instead of broadening a query. */
export function validMarketLocationParams(p:URLSearchParams):boolean {
 const countries=p.getAll('country').flatMap(value=>value.split('|')),cities=p.getAll('city').flatMap(value=>value.split('|'));
 return countries.length<=16&&cities.length<=16&&countries.every(isCountryCode)&&cities.every(value=>Boolean(cityLocation(value)));
}
export function marketWorkspaceParams(mode:MarketScope,business:MarketSearch,product:MarketSearch):URLSearchParams {
 const p=new URLSearchParams({view:mode==='products'?'search':'map'});
 for(const [prefix,scope,search] of [['b.','businesses',business],['p.','products',product]] as const)
  marketSearchParams(scope,search).forEach((value,key)=>{if(key!=='scope')p.append(prefix+key,value);});
 return p;
}
