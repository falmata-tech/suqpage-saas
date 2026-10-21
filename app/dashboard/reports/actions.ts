'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireUser} from '@/lib/auth';
import {listingReportPort} from '@/lib/listing-reports-postgres';
import {CatalogSafetyError} from '@/lib/catalog-safety';
export async function reviewReportAction(form:FormData){
  const actor=await requireUser();let error='';
  try{await listingReportPort.update(actor,{id:form.get('id'),version:form.get('version'),action:form.get('action'),assignedUserId:form.get('assignedUserId')});}
  catch(e){error=e instanceof CatalogSafetyError?e.message:'Report could not be updated.';}
  revalidatePath('/dashboard/reports');redirect('/dashboard/reports'+(error?'?error='+encodeURIComponent(error):'?saved=1'));
}
