"use client";

import { useActionState } from "react";
import { createClientWorkspaceAction, type InvitationActionState } from "@/app/invitation-actions";

const initialState: InvitationActionState = {};

export default function CreateClientWorkspaceForm() {
  const [state, action, pending] = useActionState(createClientWorkspaceAction, initialState);
  return <form action={action} className="panel form-grid">
    <div className="field full"><label htmlFor="workspace-business-name">Business name</label><input id="workspace-business-name" name="businessName" required maxLength={120}/></div>
    <div className="field"><label htmlFor="workspace-handle">Suqpage page handle</label><input id="workspace-handle" name="handle" required maxLength={80} placeholder="business-name"/></div>
    <div className="field"><label htmlFor="workspace-client-name">Client name</label><input id="workspace-client-name" name="clientName" required maxLength={100}/></div>
    <div className="field"><label htmlFor="workspace-client-email">Client email</label><input id="workspace-client-email" name="email" type="email" required maxLength={160}/></div>
    <div className="field full"><small>The owner can add products and edit their standard page after accepting the invitation.</small></div>
    {state.error ? <p className="error field full" role="alert">{state.error}</p> : null}
    {state.invitationUrl ? <div className="notice field full" role="status"><strong>Business workspace created.</strong><p>This 72-hour link is shown once. Copy it now and deliver it securely.</p><input aria-label="Single-use business access invitation" readOnly value={state.invitationUrl} onFocus={(event)=>event.currentTarget.select()}/><small>The page stays private until the owner submits it and an administrator approves its first publication.</small></div> : null}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? "Creating workspace…" : "Create business and invitation"}</button></div>
  </form>;
}
