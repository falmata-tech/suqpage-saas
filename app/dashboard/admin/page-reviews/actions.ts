'use server';
import { revalidatePath,revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { decidePageReview } from '@/lib/page-review';
import { pageReviewPort } from '@/lib/page-review-runtime';
import { OwnerPageError } from '@/lib/owner-page-domain';
export async function reviewPageAction(form:FormData){
 const actor=await requireUser();const businessId=Number(form.get('businessId'));
 try{await decidePageReview(pageReviewPort,actor,businessId,Number(form.get('submission')),form.get('decision'),String(form.get('feedback')||''));}
 catch(error){redirect(`/dashboard/admin/page-reviews/${Number.isSafeInteger(businessId)?businessId:0}?error=${encodeURIComponent(error instanceof OwnerPageError?error.message:'The decision could not be saved.')}`);}
 revalidateTag('public-marketplace',{expire:0});revalidateTag('public-featured',{expire:0});revalidatePath('/');revalidatePath('/dashboard/admin/page-reviews');revalidatePath('/dashboard');
 redirect(`/dashboard/admin/page-reviews/${businessId}?saved=1`);
}
