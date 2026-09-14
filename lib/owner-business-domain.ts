import { isBusinessCategoryKey, type BusinessCategoryKey } from './business-categories';
import { OwnerPageError } from './owner-page-domain';

export type OwnerLocation = { category: BusinessCategoryKey; city: string; region: string; mode: 'area'|'storefront'; latitude: number|null; longitude: number|null };
export type OwnerBusinessChange = { name: string; expectedVersion: number; locationVersion: number; location: OwnerLocation|null };
const bounded = (raw: unknown, label: string) => {
  if (typeof raw !== 'string' || raw.length > 100 || /[\u0000-\u001f\u007f]/.test(raw)) throw new OwnerPageError(`${label} is invalid.`);
  return raw.trim();
};
export function parseOwnerBusinessChange(raw: Record<string,unknown>): OwnerBusinessChange {
  if(Object.keys(raw).some(key=>!['name','expectedVersion','locationVersion','category','city','region','mode','latitude','longitude'].includes(key))) throw new OwnerPageError('Unsupported business details.');
  const name=bounded(raw.name,'Business name');
  const expectedVersion=Number(raw.expectedVersion),locationVersion=Number(raw.locationVersion);
  if(!name||!Number.isSafeInteger(expectedVersion)||expectedVersion<1||!Number.isSafeInteger(locationVersion)||locationVersion<0) throw new OwnerPageError('Reload the latest business details.');
  const city=bounded(raw.city??'','City'),region=bounded(raw.region??'','Region');
  if(!city&&!region)return {name,expectedVersion,locationVersion,location:null};
  if(!city||!region||typeof raw.category!=='string'||!isBusinessCategoryKey(raw.category)||!['area','storefront'].includes(String(raw.mode))) throw new OwnerPageError('Choose a category, city, region and location privacy.');
  const mode=raw.mode as OwnerLocation['mode'];
  const latitude=mode==='area'?null:Number(raw.latitude),longitude=mode==='area'?null:Number(raw.longitude);
  if(mode==='storefront'&&(!Number.isFinite(latitude)||latitude!<3||latitude!>15||!Number.isFinite(longitude)||longitude!<32||longitude!>49)) throw new OwnerPageError('Enter your public storefront coordinates within Ethiopia.');
  return {name,expectedVersion,locationVersion,location:{category:raw.category,city,region,mode,latitude,longitude}};
}
