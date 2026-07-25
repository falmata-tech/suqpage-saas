"use client";

import { useActionState } from "react";
import { acceptProspectAction, type InvitationActionState } from "@/app/invitation-actions";

const initialState: InvitationActionState = {};

export default function InviteProspectForm({ requestId, businessName, clientName, email = "" }: { requestId:number; businessName:string; clientName:string; email?:string }) {
  const [state, action, pending] = useActionState(acceptProspectAction, initialState);
  return <form action={action} className="form-grid">
    <input type="hidden" name="requestId" value={requestId}/>
    <div className="field full"><label htmlFor="invite-business-name">Business name</label><input id="invite-business-name" name="businessName" defaultValue={businessName} required maxLength={100}/></div>
    <div className="field"><label htmlFor="invite-handle">Showroom handle</label><input id="invite-handle" name="handle" defaultValue={businessName.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")} required maxLength={80}/></div>
    <div className="field"><label htmlFor="invite-design">Starting composition style</label><select id="invite-design" name="designKey" defaultValue="novatech"><option value="alhaya">Quiet editorial</option><option value="usashopet">Beauty editorial</option><option value="novatech">Precision product</option><option value="homevibe">Warm material</option></select></div>
    <div className="field"><label htmlFor="invite-name">Client name</label><input id="invite-name" name="clientName" defaultValue={clientName} required maxLength={100}/></div>
    <div className="field"><label htmlFor="invite-email">Client email</label><input id="invite-email" name="email" type="email" defaultValue={email.includes("@") ? email : ""} required maxLength={160}/></div>
    {state.error && <p className="error field full" role="alert">{state.error}</p>}
    {state.invitationUrl && <div className="notice field full" role="status"><strong>Invitation created.</strong><p>This 72-hour link is shown once. Copy it now and deliver it securely to the client.</p><input aria-label="Single-use invitation link" readOnly value={state.invitationUrl} onFocus={(event) => event.currentTarget.select()}/><small>Creating another invitation revokes this one.</small></div>}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? "Creating invitation…" : state.invitationUrl ? "Replace invitation" : "Accept lead and create invitation"}</button></div>
  </form>;
}
