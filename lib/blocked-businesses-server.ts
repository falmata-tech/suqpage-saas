import {cookies} from 'next/headers';
import {excludedBusinessIds} from './catalog-safety';
export const BLOCKED_BUSINESS_COOKIE='suqpage-blocked-businesses';
export async function readExcludedBusinesses(){
  try{return excludedBusinessIds((await cookies()).get(BLOCKED_BUSINESS_COOKIE)?.value??'');}catch{return [];}
}
