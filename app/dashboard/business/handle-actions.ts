'use server';
import {requireUser} from '@/lib/auth';
import {changeBusinessHandle} from '@/lib/business-handle-runtime';
import {revalidatePath,revalidateTag} from 'next/cache';
import {redirect} from 'next/navigation';
export async function saveBusinessHandleAction(form:FormData):Promise<import('@/lib/owner-edit-contract').OwnerEditResult> {
  const actor=await requireUser();
  const businessId=actor.access_role==='client'?actor.business_id||0:Number(form.get('businessId'));
  const path=actor.access_role!=='client'?`/dashboard/settings?business=${businessId}`:['profile','showroom'].includes(String(form.get('returnTo')))?'/dashboard/profile/handle':form.get('returnTo')==='page'?'/dashboard/page-editor?view=edit':'/dashboard/business';
  let result;
  try {
    result=await changeBusinessHandle(actor,businessId,{handle:form.get('handle'),expectedVersion:form.get('expectedVersion'),reason:form.get('reason')});
  }catch(error){return {error:error instanceof Error?error.message:'Could not save handle.'};}
  revalidateTag('public-marketplace',{expire:0});revalidateTag('public-featured',{expire:0});
  for(const page of ['/', '/dashboard','/dashboard/business','/dashboard/settings','/dashboard/page-editor','/dashboard/profile',`/@${result.oldHandle}`,`/@${result.handle}`,`/preview/@${result.oldHandle}`,`/preview/@${result.handle}`])revalidatePath(page);
  if(actor.access_role==='client' && form.get('returnTo')==='profile')redirect('/dashboard/profile?saved=handle');
  if(actor.access_role==='client' && form.get('returnTo')==='showroom')redirect('/dashboard/profile/showroom?saved=handle');
  redirect(`${path}${path.includes('?')?'&':'?'}saved=handle`);
}
