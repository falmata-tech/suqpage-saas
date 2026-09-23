'use server';
import {requireUser} from '@/lib/auth';
import {changeBusinessHandle} from '@/lib/business-handle-runtime';
import {revalidatePath,revalidateTag} from 'next/cache';
import {redirect} from 'next/navigation';
export async function saveBusinessHandleAction(form:FormData) {
  const actor=await requireUser();
  const businessId=actor.access_role==='platform_admin'?Number(form.get('businessId')):actor.business_id||0;
  const path=actor.access_role==='platform_admin'?`/dashboard/settings?business=${businessId}`:'/dashboard/business';
  let result;
  try {
    result=await changeBusinessHandle(actor,businessId,{handle:form.get('handle'),expectedVersion:form.get('expectedVersion'),reason:form.get('reason')});
  }catch(error){redirect(`${path}${path.includes('?')?'&':'?'}error=${encodeURIComponent(error instanceof Error?error.message:'Could not save handle.')}`);}
  revalidateTag('public-marketplace',{expire:0});revalidateTag('public-featured',{expire:0});
  for(const page of ['/', '/dashboard','/dashboard/business','/dashboard/settings','/dashboard/page-editor',`/@${result.oldHandle}`,`/@${result.handle}`,`/preview/@${result.oldHandle}`,`/preview/@${result.handle}`])revalidatePath(page);
  redirect(`${path}${path.includes('?')?'&':'?'}saved=handle`);
}
