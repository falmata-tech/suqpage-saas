"use client";

import { useActionState } from "react";
import { createClientWorkspaceAction, type InvitationActionState } from "@/app/invitation-actions";

const initialState: InvitationActionState = {};

export default function CreateClientWorkspaceForm() {
  const [state, action, pending] = useActionState(createClientWorkspaceAction, initialState);
  return <form action={action} className="panel form-grid">
    <div className="field full"><label htmlFor="workspace-business-name">Business name</label><input id="workspace-business-name" name="businessName" required maxLength={120}/></div>
    <div className="field"><label htmlFor="workspace-handle">Showroom handle</label><input id="workspace-handle" name="handle" required maxLength={80} placeholder="business-name"/></div>
    <div className="field"><label htmlFor="workspace-design">Temporary starting direction</label><select id="workspace-design" name="designKey" defaultValue="homevibe"><option value="alhaya">Textile or artisan</option><option value="usashopet">Natural beauty</option><option value="novatech">Manufacturer or technical</option><option value="homevibe">Furniture or general maker</option></select><small>The AI blueprint replaces this starting layout after intake.</small></div>
    <div className="field"><label htmlFor="workspace-client-name">Client name</label><input id="workspace-client-name" name="clientName" required maxLength={100}/></div>
    <div className="field"><label htmlFor="workspace-client-email">Client email</label><input id="workspace-client-email" name="email" type="email" required maxLength={160}/></div>
    <div className="field full"><small>This creates a private draft workspace, not a request or public showroom. The client submits detailed instructions after accepting the invitation.</small></div>
    {state.error ? <p className="error field full" role="alert">{state.error}</p> : null}
    {state.invitationUrl ? <div className="notice field full" role="status"><strong>Client workspace created.</strong><p>This 72-hour link is shown once. Copy it now and deliver it securely.</p><input aria-label="Single-use client workspace invitation" readOnly value={state.invitationUrl} onFocus={(event)=>event.currentTarget.select()}/><small>The draft remains private until a client-approved showroom revision is published.</small></div> : null}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? "Creating workspace…" : "Create client workspace and invitation"}</button></div>
  </form>;
}
