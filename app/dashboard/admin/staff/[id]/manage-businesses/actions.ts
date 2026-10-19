'use server';
import {redirect} from 'next/navigation';
import {revalidatePath} from 'next/cache';
import {requireUser} from '@/lib/auth';
import {setStaffBusinessGrant,StaffOperationError} from '@/lib/staff-operations';
import type {OwnerEditResult} from '@/lib/owner-edit-contract';

export async function updateStaffBusinessGrantAction(form:FormData):Promise<OwnerEditResult>{
  const actor=await requireUser();
  const id=Number(form.get('userId')),version=Number(form.get('version'));
  const raw=form.get('enabled');
  if(!Number.isSafeInteger(id)||id<1||!Number.isSafeInteger(version)||version<1||(raw!=='0'&&raw!=='1')||form.getAll('userId').length!==1||form.getAll('version').length!==1||form.getAll('enabled').length!==1){
    return {error:'Reload this staff permission before saving.'};
  }
  if(raw==='0'&&form.get('confirmRevoke')!=='1')return {error:'Confirm that business management should stop.'};
  try{await setStaffBusinessGrant(actor,id,raw==='1',version);}
  catch(error){return {error:error instanceof StaffOperationError?error.message:'Could not update business access.'};}
  revalidatePath('/dashboard/admin/staff');
  revalidatePath(`/dashboard/admin/staff/${id}`);
  redirect(`/dashboard/admin/staff/${id}?saved=businesses`);
}
