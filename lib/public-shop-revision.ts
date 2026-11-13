import {runtimeGet} from './runtime-sql';
import {ownerPageEditorEnabled} from './owner-page-runtime';
export const publicShopRevision=(id:number,handle:string,contentVersion:number,pageRevision:number)=>`${id}:${handle}:${contentVersion}:${pageRevision}`;
/** Public active data only; a private draft or message cannot alter this value. */
export async function readPublicShopRevision(handle:string){
 if(!/^@?[a-z0-9-]{3,80}$/.test(handle))return null;
 const row=await runtimeGet<{id:number;handle:string;content_version:number;revision:number}>(`SELECT b.id,b.handle,b.content_version,
  COALESCE((SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id),0) revision
  FROM businesses b JOIN business_handles h ON h.business_id=b.id WHERE h.handle=lower(?) AND b.status='active'`,[handle.replace(/^@/,'')]);
 return row?publicShopRevision(row.id,row.handle,row.content_version,ownerPageEditorEnabled()?row.revision:0):null;
}
