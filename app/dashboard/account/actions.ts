"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { parseAccountPhone, saveAccountPhone } from "@/lib/account-contacts";
import { accountContactPort } from "@/lib/account-contact-runtime";

export async function saveAccountPhoneAction(form: FormData) {
  const user = await requireUser({ allowTemporaryPassword: true });
  let phone: string;
  try { phone = parseAccountPhone(form.get("accountPhone")); }
  catch { redirect("/dashboard/account?contact=invalid"); }
  await saveAccountPhone(accountContactPort, user, phone);
  revalidatePath("/dashboard/account");
  redirect("/dashboard/account?contact=saved");
}
