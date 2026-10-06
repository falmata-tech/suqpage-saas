import type { SessionUser } from '../types';
import { saveOwnerBusiness } from '../owner-business-runtime';
import { stageTenantProductImage } from '../tenant-product-media';
import { MAX_PRODUCT_UPLOAD_BYTES } from '../product-media';
import { boundedBody, MobileError } from './http';
export async function saveNativeBusiness(request:Request,actor:SessionUser & {business_id:number}){
 const type=request.headers.get('content-type')||'';
 const form=await new Response(await boundedBody(request,MAX_PRODUCT_UPLOAD_BYTES+24000),{headers:{'Content-Type':type}}).formData();
 if([...form.keys()].some(k=>!['details','logo'].includes(k))||form.getAll('details').length!==1||form.getAll('logo').length>1)throw new MobileError('Unsupported fields.');
 let details:Record<string,unknown>;try{details=JSON.parse(String(form.get('details')));if(!details||typeof details!=='object'||Array.isArray(details))throw Error();}catch{throw new MobileError('Invalid request.');}
 const remove=details.removeLogo===true;delete details.removeLogo;
 if(remove&&form.has('logo'))throw new MobileError('Choose a valid photo.');
 const logo=form.get('logo');
 if(form.has('logo')&&(!(logo instanceof File)||!logo.size))throw new MobileError('Choose a valid photo.');
 const staged=await stageTenantProductImage(actor,actor.business_id,logo);
 try{return await saveOwnerBusiness(actor,actor.business_id,details,remove?'':staged?.imageRef);}catch(e){await staged?.discard();throw e;}
}
