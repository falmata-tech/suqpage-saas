"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { parseAccountPhone, saveAccountPhone, saveAccountProfile } from "@/lib/account-contacts";
import { accountContactPort } from "@/lib/account-contact-runtime";
import type {OwnerEditResult} from '@/lib/owner-edit-contract';

export async function saveProfileAccountAction(form:FormData):Promise<OwnerEditResult>{
  const actor=await requireUser({allowTemporaryPassword:true});
  if([...form.keys()].some(k=>!['name','accountPhone'].includes(k)&&!k.startsWith('$ACTION_')))return {error:'Unsupported fields.'};
  try{await saveAccountProfile(accountContactPort,actor,{name:form.get('name'),phone:form.get('accountPhone')});}
  catch(error){return {error:error instanceof Error?error.message:'Please try again.'};}
  revalidatePath('/dashboard/account');revalidatePath('/dashboard/profile');
  redirect('/dashboard/profile?saved=account');
}

export async function saveAccountPhoneAction(form: FormData) {
  const user = await requireUser({ allowTemporaryPassword: true });
  const fromProfile=form.get("returnTo")==="profile";
  const path="/dashboard/account"+(fromProfile?"?returnTo=profile&":"?");
  if(form.has("name")){
    try{await saveAccountProfile(accountContactPort,user,{name:form.get("name"),phone:form.get("accountPhone")});}
    catch{redirect(path+"contact=invalid");}
    revalidatePath("/dashboard/profile");revalidatePath("/dashboard/account");
    redirect(fromProfile?"/dashboard/profile?saved=account":path+"contact=saved");
  }
  let phone: string;
  try { phone = parseAccountPhone(form.get("accountPhone")); }
  catch { redirect("/dashboard/account?contact=invalid"); }
  await saveAccountPhone(accountContactPort, user, phone);
  revalidatePath("/dashboard/account");
  redirect("/dashboard/account?contact=saved");
}
