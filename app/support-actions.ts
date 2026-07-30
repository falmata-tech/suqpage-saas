"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import {
  claimSupportConversation,
  closeSupportConversation,
  createSupportConversation,
  postSupportMessage,
  reopenSupportConversation,
  reassignSupportConversation,
  SupportError,
  updateSupportAgentSetting,
} from "@/lib/support";
import { audit } from "@/lib/security";

function conversationId(formData: FormData) {
  const value = Number.parseInt(String(formData.get("conversationId") || ""), 10);
  if (!Number.isInteger(value) || value < 1) redirect("/dashboard/support?error=invalid");
  return value;
}

function failure(path: string, error: unknown): never {
  const message = error instanceof SupportError ? error.message : "Support could not be updated.";
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

export async function createSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  let created: { id: number } | null = null;
  try {
    created = await createSupportConversation(user, {
      subject: formData.get("subject"),
      message: formData.get("message"),
      idempotencyKey: formData.get("idempotencyKey"),
    });
    audit("support.conversation_created", { userId: user.id, businessId: user.business_id, detail: { conversationId: created.id } });
  } catch (error) {
    failure("/dashboard/support", error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${created!.id}`);
}

export async function postSupportMessageAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    postSupportMessage(user, id, {
      message: formData.get("message"),
      idempotencyKey: formData.get("idempotencyKey"),
    });
    audit("support.message_posted", { userId: user.id, businessId: user.business_id, detail: { conversationId: id } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath(`/dashboard/support/${id}`);
  redirect(`/dashboard/support/${id}?sent=1`);
}

export async function claimSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    claimSupportConversation(user, id);
    audit("support.conversation_claimed", { userId: user.id, detail: { conversationId: id } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${id}?claimed=1`);
}

export async function closeSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    closeSupportConversation(user, id);
    audit("support.conversation_closed", { userId: user.id, businessId: user.business_id, detail: { conversationId: id } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${id}?closed=1`);
}

export async function reopenSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    reopenSupportConversation(user, id);
    audit("support.conversation_reopened", { userId: user.id, businessId: user.business_id, detail: { conversationId: id } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${id}?reopened=1`);
}

export async function updateSupportAgentSettingAction(formData: FormData) {
  const user = await requireUser();
  try {
    updateSupportAgentSetting(user, {
      userId: formData.get("userId"),
      enabled: formData.get("enabled"),
      maxOpenConversations: formData.get("maxOpenConversations"),
    });
    audit("support.agent_setting_updated", { userId: user.id, detail: { targetUserId: formData.get("userId") } });
  } catch (error) {
    failure("/dashboard/support", error);
  }
  revalidatePath("/dashboard/support");
  redirect("/dashboard/support?saved=agent");
}

export async function reassignSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  const raw = String(formData.get("assignedUserId") || "");
  const assignedUserId = raw ? Number.parseInt(raw, 10) : null;
  try {
    reassignSupportConversation(user, id, assignedUserId);
    audit("support.conversation_reassigned", { userId: user.id, detail: { conversationId: id, assignedUserId } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${id}?assigned=1`);
}
