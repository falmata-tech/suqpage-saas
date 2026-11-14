import {runtimeCatalogByHandle} from './catalog-runtime';
import {runtimePublishedPageState} from './owner-page-publication-runtime';
import {initialBusinessProfile} from './business-profile';
import {publicShopRevision} from './public-shop-revision';
import {runtimeRun,runtimeTransaction} from './runtime-sql';

/** Top-level public read adapter. Product and profile queries must see the same
 * committed stage, including when a writer commits between those queries. */
export async function runtimePublicShowroom(handle:string){
 return runtimeTransaction(async()=>{
  await runtimeRun('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
  const catalog=await runtimeCatalogByHandle(handle);
  if(!catalog||catalog.business.status!=='active')return null;
  const published=await runtimePublishedPageState(catalog.business.id);
  return {catalog,profile:published.content||initialBusinessProfile(catalog),pageRevision:published.revision,
   revision:publicShopRevision(catalog.business.id,catalog.business.handle,catalog.business.content_version,published.revision)};
 });
}
