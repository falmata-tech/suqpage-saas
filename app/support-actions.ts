"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { createVideoRequest, reviewVideoRequest } from "@/lib/support-video-requests";
import { runtimeBusinessById } from "@/lib/catalog-runtime";
import {
  claimSupportConversation,
  closeSupportConversation,
  createSupportConversation,
  postSupportMessage,
  reopenSupportConversation,
  reassignSupportConversation,
  SupportError,
  saveTransportHandoff,
  updateSupportAgentSetting,
} from "@/lib/support";
import { audit } from "@/lib/security";
import { stageSupportAttachment, SupportAttachmentError, type StagedSupportAttachment } from "@/lib/support-media";

function conversationId(formData: FormData) {
  const value = Number.parseInt(String(formData.get("conversationId") || ""), 10);
  if (!Number.isInteger(value) || value < 1) redirect("/dashboard/support?error=invalid");
  return value;
}

export async function createVideoRequestAction(formData: FormData) {
  const user = await requireUser();
  const target = formData.get("target");
  const productId = Number(formData.get("productId"));
  const returnPath = target === "header" ? "/dashboard/support?video=header"
    : target === "product" && Number.isSafeInteger(productId) && productId > 0
      ? `/dashboard/support?video=product&product=${productId}` : "/dashboard/support";
  let result: Awaited<ReturnType<typeof createVideoRequest>>;
  try {
    result = await createVideoRequest(user, {target:formData.get("target"),productId:formData.get("productId"),sourceUrl:formData.get("sourceUrl"),note:formData.get("note"),idempotencyKey:formData.get("idempotencyKey")});
  } catch(error) { failure(returnPath,error); }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${result!.id}`);
}

export async function reviewVideoRequestAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    const result = await reviewVideoRequest(user,id,{decision:formData.get("decision"),youtubeUrl:formData.get("youtubeUrl"),reply:formData.get("reply")});
    const business = await runtimeBusinessById(result.businessId);
    if(business) { revalidatePath(`/@${business.handle}`,"layout"); revalidatePath(`/preview/@${business.handle}`,"layout"); }
    revalidatePath("/dashboard/page-editor"); revalidatePath("/dashboard/products","layout"); revalidatePath("/");
  } catch(error) { failure(`/dashboard/support/${id}`,error); }
  revalidatePath(`/dashboard/support/${id}`);
  redirect(`/dashboard/support/${id}`);
}

function failure(path: string, error: unknown): never {
  const message = error instanceof SupportError || error instanceof SupportAttachmentError
    ? error.message
    : "Support could not be updated.";
  redirect(`${path}${path.includes("?") ? "&" : "?"}error=${encodeURIComponent(message)}`);
}

export async function createSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  let created: Awaited<ReturnType<typeof createSupportConversation>> | null = null;
  let staged: StagedSupportAttachment | null = null;
  try {
    staged = await stageSupportAttachment(formData.get("attachment"));
    created = await createSupportConversation(user, {
      subject: formData.get("subject"),
      message: formData.get("message"),
      idempotencyKey: formData.get("idempotencyKey"),
      attachment: staged,
    });
    if (created.duplicate) await staged?.discard();
    staged = null;
    await audit("support.conversation_created", { userId: user.id, businessId: user.business_id, detail: { conversationId: created.id } });
  } catch (error) {
    await staged?.discard().catch(() => undefined);
    failure("/dashboard/support", error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${created!.id}`);
}

export async function postSupportMessageAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  let staged: StagedSupportAttachment | null = null;
  try {
    staged = await stageSupportAttachment(formData.get("attachment"));
    const posted = await postSupportMessage(user, id, {
      audience: formData.get("audience"),
      message: formData.get("message"),
      idempotencyKey: formData.get("idempotencyKey"),
      attachment: staged,
    });
    if (posted.duplicate) await staged?.discard();
    staged = null;
    await audit("support.message_posted", { userId: user.id, businessId: user.business_id, detail: { conversationId: id } });
  } catch (error) {
    await staged?.discard().catch(() => undefined);
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath(`/dashboard/support/${id}`);
  redirect(`/dashboard/support/${id}?sent=${formData.get("audience") === "note" ? "note" : "1"}`);
}

export async function claimSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    await claimSupportConversation(user, id);
    await audit("support.conversation_claimed", { userId: user.id, detail: { conversationId: id } });
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
    await closeSupportConversation(user, id);
    await audit("support.conversation_closed", { userId: user.id, businessId: user.business_id, detail: { conversationId: id } });
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
    await reopenSupportConversation(user, id);
    await audit("support.conversation_reopened", { userId: user.id, businessId: user.business_id, detail: { conversationId: id } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${id}?reopened=1`);
}

export async function updateSupportAgentSettingAction(formData: FormData) {
  const user = await requireUser();
  try {
    await updateSupportAgentSetting(user, {
      userId: formData.get("userId"),
      enabled: formData.get("enabled"),
      maxOpenConversations: formData.get("maxOpenConversations"),
      queueScope: formData.get("queueScope") ?? undefined,
    });
    await audit("support.agent_setting_updated", { userId: user.id, detail: { targetUserId: formData.get("userId") } });
  } catch (error) {
    failure("/dashboard/support/agents", error);
  }
  revalidatePath("/dashboard/support/agents");
  revalidatePath("/dashboard/support");
  redirect("/dashboard/support/agents?saved=agent");
}

export async function reassignSupportConversationAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  const raw = String(formData.get("assignedUserId") || "");
  const assignedUserId = raw ? Number.parseInt(raw, 10) : null;
  try {
    await reassignSupportConversation(user, id, assignedUserId);
    await audit("support.conversation_reassigned", { userId: user.id, detail: { conversationId: id, assignedUserId } });
  } catch (error) {
    failure(`/dashboard/support/${id}`, error);
  }
  revalidatePath("/dashboard/support");
  redirect(`/dashboard/support/${id}?assigned=1`);
}

export async function saveTransportHandoffAction(formData: FormData) {
  const user = await requireUser();
  const id = conversationId(formData);
  try {
    await saveTransportHandoff(user, id, {
      company: formData.get("company"), contact: formData.get("contact"), previousId: formData.get("previousId"),
    });
  } catch (error) { failure(`/dashboard/support/${id}`, error); }
  revalidatePath("/dashboard/support");
  revalidatePath(`/dashboard/support/${id}`);
  redirect(`/dashboard/support/${id}?routed=1`);
}
