"use server";
import { requireUser } from '@/lib/auth';
import { readOwnerBusiness,saveOwnerBusiness } from '@/lib/owner-business-runtime';
import { stageTenantProductImage } from '@/lib/tenant-product-media';
import { runtimeBusinessById } from '@/lib/catalog-runtime';
import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import type { StagedImage } from '@/lib/media';
export async function saveOwnerBusinessAction(form:FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult>{
 const actor=await requireUser();const businessId=actor.business_id||0;
 let staged:StagedImage|null=null;
 try{
  await readOwnerBusiness(actor,businessId);
  const allowed=new Set(['name','expectedVersion','locationVersion','category','city','region','mode','latitude','longitude','placeId','countryCode','logo','removeLogo','returnTo']);
  if([...form.keys()].some(key=>!allowed.has(key)&&!key.startsWith('$ACTION_')))throw new Error('Unsupported business details.');
  const file=form.get('logo');if(form.has('removeLogo')&&file instanceof File&&file.size)throw new Error('Choose a replacement logo or remove it.');
  staged=await stageTenantProductImage(actor,businessId,file);
  const fields=['name','expectedVersion','locationVersion','category','city','region','mode','latitude','longitude','placeId','countryCode'];
  await saveOwnerBusiness(actor,businessId,Object.fromEntries(fields.map(key=>[key,form.get(key)??''])),staged?.imageRef??(form.has('removeLogo')?'':undefined));
 }catch(error){await staged?.discard();return {error:error instanceof Error?error.message:'Business details could not be saved.'};}
 revalidateTag('public-marketplace',{expire:0}); revalidateTag('public-featured',{expire:0});
 const business=await runtimeBusinessById(businessId);
 for(const path of ['/', '/dashboard', '/dashboard/business','/dashboard/page-editor','/dashboard/profile','/dashboard/admin/discovery','/dashboard/admin/page-reviews',`/@${business?.handle}`])revalidatePath(path);
 redirect(form.get('returnTo')==='profile'?'/dashboard/profile?saved=business':'/dashboard/business?saved=1');
}
