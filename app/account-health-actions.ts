"use server";

import crypto from "node:crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { AccountHealthError, recordManualPayment } from "@/lib/account-health";
import { audit } from "@/lib/security";

export async function recordManualPaymentAction(formData: FormData) {
  const user = await requireUser();
  const businessId = Number.parseInt(String(formData.get("businessId") || ""), 10);
  try {
    const result = recordManualPayment(user, {
      businessId,
      amount: formData.get("amount"),
      paidAt: formData.get("paidAt"),
      idempotencyKey: formData.get("idempotencyKey") || crypto.randomBytes(16).toString("hex"),
    });
    audit("subscription.payment_recorded", {
      userId: user.id,
      businessId,
      detail: { paymentId: result.id },
    });
  } catch (error) {
    const message = error instanceof AccountHealthError ? error.message : "Payment could not be recorded.";
    redirect(`/dashboard/account-health?business=${businessId}&error=${encodeURIComponent(message)}`);
  }
  revalidatePath("/dashboard/account-health");
  revalidatePath("/");
  redirect(`/dashboard/account-health?business=${businessId}&saved=payment`);
}
