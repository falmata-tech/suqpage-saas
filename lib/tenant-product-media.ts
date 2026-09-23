import crypto from 'node:crypto';
import { canMaintainBasicProducts } from './capabilities';
import { prepareUploadedImage, mediaMime, type StagedImage } from './media';
import { getMediaObjectStore } from './media-storage';
import { runtimeGet } from './runtime-sql';
import { ProductUpkeepError } from './product-upkeep-domain';
import type { SessionUser } from './types';
const tenantKey=/^product-private-([1-9]\d*)-[a-f0-9-]{36}\.(?:png|jpg|webp)$/;
export function tenantProductMediaBusiness(filename:string){const id=Number(tenantKey.exec(filename)?.[1]||0);return Number.isSafeInteger(id)&&id<=2147483647?id:0;}
async function authorized(actor:SessionUser,businessId:number){
 const assigned=actor.access_role==='team_member'&&Boolean(await runtimeGet('SELECT 1 FROM staff_business_assignments WHERE user_id=? AND business_id=? AND active=1',[actor.id,businessId]));
 return canMaintainBasicProducts(actor,businessId,assigned);
}
export async function stageTenantProductImage(actor:SessionUser,businessId:number,file:FormDataEntryValue|null):Promise<StagedImage|null>{
 if(!Number.isSafeInteger(businessId)||businessId<1||!await authorized(actor,businessId)||!await runtimeGet('SELECT 1 FROM businesses WHERE id=?',[businessId]))throw new ProductUpkeepError('Product access is not available.',403,'forbidden');
 if(!(file instanceof File)||!file.size)return null;
 const image=await prepareUploadedImage(Buffer.from(await file.arrayBuffer()),file.type);
 if(!await authorized(actor,businessId))throw new ProductUpkeepError('Product access changed.',403,'forbidden');
 const key=`product-private-${businessId}-${crypto.randomUUID()}.${image.ext}`;
 const store=getMediaObjectStore();await store.put('pages',key,image.buffer,image.mime);
 if(!await authorized(actor,businessId)){await store.remove('pages',[key]);throw new ProductUpkeepError('Product access changed.',403,'forbidden');}
 return {imageRef:`/media/${key}`,digest:crypto.createHash('sha256').update(image.buffer).digest('hex'),discard:()=>store.remove('pages',[key])};
}
async function mediaAccess(filename:string,actor:SessionUser|null){
 const businessId=tenantProductMediaBusiness(filename);if(!businessId)return null;
 const business=await runtimeGet<{status:string;content_json:string|null;logo_path:string;favicon_path:string}>(`SELECT b.status,b.logo_path,b.favicon_path,p.content_json FROM businesses b LEFT JOIN owner_page_publications p ON p.business_id=b.id AND p.revision=(SELECT MAX(revision) FROM owner_page_publications WHERE business_id=b.id) WHERE b.id=?`,[businessId]);if(!business)return null;
 const ref=`/media/${filename}`;
 const product=await runtimeGet<{is_published:number}>("SELECT is_published FROM products WHERE business_id=? AND (image_path=? OR media_json::jsonb @> ?::jsonb) ORDER BY is_published DESC LIMIT 1",[businessId,ref,JSON.stringify([{kind:'image',ref}])]);
 let cover=false;try{cover=Boolean(business.content_json&&JSON.parse(business.content_json).heroImage===ref);}catch{}
 const identity=business.logo_path===ref||business.favicon_path===ref;
 const isPublic=business.status==='active'&&Boolean(product?.is_published||cover||identity);
 if(!isPublic&&(!actor||(!product&&!identity)||!await authorized(actor,businessId)))return null;
 return {isPublic};
}
export async function readTenantProductImage(filename:string,actor:SessionUser|null){
 if(!await mediaAccess(filename,actor))return null;
 const image=await getMediaObjectStore().read('pages',filename,mediaMime(filename));
 const access=await mediaAccess(filename,actor);
 return image&&access?{...image,isPublic:access.isPublic}:null;
}
