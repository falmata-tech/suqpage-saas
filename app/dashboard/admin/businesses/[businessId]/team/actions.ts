'use server';
import { requireUser } from '@/lib/auth';
import { setBusinessAssignment } from '@/lib/business-assistance';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { OwnerPageError } from '@/lib/owner-page-domain';
export async function businessAssignmentAction(form:FormData){
 const actor=await requireUser();const businessId=Number(form.get('businessId'));
 try{await setBusinessAssignment(actor,businessId,Number(form.get('userId')),form.get('active')==='1');}
 catch(error){redirect(`/dashboard/admin/businesses/${Number.isSafeInteger(businessId)?businessId:0}/team?error=${encodeURIComponent(error instanceof OwnerPageError?error.message:'Assignment could not be saved.')}`);}
 revalidatePath('/dashboard');redirect(`/dashboard/admin/businesses/${businessId}/team?saved=1`);
}
