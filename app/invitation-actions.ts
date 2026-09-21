"use server";

import { redirect } from "next/navigation";
import { requireUser, setSession } from "@/lib/auth";
import { authDriver } from "@/lib/config";
import { appUrl } from "@/lib/app-url";
import { hasCapability } from "@/lib/capabilities";
import { createClientInvitation, InvitationError, redeemClientInvitation } from "@/lib/invitations";
import { audit, cleanText } from "@/lib/security";

export type InvitationActionState = { error?:string; invitationUrl?:string };

export async function createClientWorkspaceAction(_state: InvitationActionState, formData: FormData): Promise<InvitationActionState> {
  const user = await requireUser();
  if (!hasCapability(user, "operations:manage")) return { error: "Operations manager access is required." };
  try {
    const created = await createClientInvitation({
      requestId: null,
      clientName: cleanText(formData.get("clientName"), 100),
      email: cleanText(formData.get("email"), 160),
      businessName: cleanText(formData.get("businessName"), 120),
      handle: cleanText(formData.get("handle"), 80),
      designKey: "novatech",
      actorUserId: user.id,
    });
    await audit("client_workspace.invitation_created", { userId:user.id, businessId:created.businessId, detail:{ invitationId:created.invitationId } });
    return { invitationUrl: `${appUrl()}/invite/${encodeURIComponent(created.token)}` };
  } catch (error) {
    return { error: error instanceof InvitationError ? error.message : "The client workspace could not be created." };
  }
}

export async function redeemInvitationAction(formData: FormData) {
  const token = String(formData.get("token") || "");
  const password = String(formData.get("password") || "");
  const confirm = String(formData.get("confirmPassword") || "");
  const path = `/invite/${encodeURIComponent(token)}`;
  if (authDriver() === "local" && password !== confirm) redirect(`${path}?error=mismatch`);
  try {
    const redeemed = await redeemClientInvitation({ token, name:cleanText(formData.get("name"), 100), password });
    if(authDriver()==="local") await setSession(redeemed.userId);
    await audit("client_invitation.accepted", { userId:redeemed.userId, businessId:redeemed.businessId, detail:redeemed.requestId === null ? {} : { requestId:redeemed.requestId } });
  } catch (error) {
    redirect(`${path}?error=${error instanceof InvitationError ? error.code : "invalid"}`);
  }
  redirect(authDriver() === "supabase" ? "/login" : "/dashboard");
}
