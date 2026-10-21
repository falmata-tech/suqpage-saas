"use client";
import { useUiText } from "@/lib/i18n/ui";


import { useActionState } from "react";
import { createClientWorkspaceAction, type InvitationActionState } from "@/app/invitation-actions";

const initialState: InvitationActionState = {};

export default function CreateClientWorkspaceForm() {
  const t = useUiText();
  const [state, action, pending] = useActionState(createClientWorkspaceAction, initialState);
  return <form action={action} className="panel form-grid">
    <div className="field full"><label htmlFor="workspace-business-name">{t("Business name")}</label><input id="workspace-business-name" name="businessName" required maxLength={120}/></div>
    <div className="field"><label htmlFor="workspace-handle">{t("MirtPage page handle")}</label><input id="workspace-handle" name="handle" required maxLength={80} placeholder={t("business-name")}/></div>
    <div className="field"><label htmlFor="workspace-client-name">{t("Client name")}</label><input id="workspace-client-name" name="clientName" required maxLength={100}/></div>
    <div className="field"><label htmlFor="workspace-client-email">{t("Client email")}</label><input id="workspace-client-email" name="email" type="email" required maxLength={160}/></div>
    <div className="field full"><small>{t("The owner can add products and edit their standard page after accepting the invitation.")}</small></div>
    {state.error ? <p className="error field full" role="alert">{state.error}</p> : null}
    {state.invitationUrl ? <div className="notice field full" role="status"><strong>{t("Business workspace created.")}</strong><p>{t("This 72-hour link is shown once. Copy it now and deliver it securely.")}</p><input aria-label={t("Single-use business access invitation")} readOnly value={state.invitationUrl} onFocus={(event)=>event.currentTarget.select()}/><small>{t("The page stays private until the owner publishes it.")}</small></div> : null}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? t("Creating workspace…") : t("Create business and invitation")}</button></div>
  </form>;
}
