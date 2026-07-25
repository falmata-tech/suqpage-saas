"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ManagedClient } from "@/lib/staff-operations";

export default function OnBehalfRequestForm({ clients }: { clients:ManagedClient[] }) {
  const router = useRouter();
  const key = useMemo(() => crypto.randomUUID(),[]);
  const [clientUserId,setClientUserId] = useState("");
  const [error,setError] = useState("");
  const [pending,setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setPending(true);setError("");
    try {
      const response = await fetch("/api/operations/requests",{method:"POST",body:new FormData(event.currentTarget)});
      const body = await response.json() as {id?:number;error?:string};
      if (!response.ok || !body.id) throw new Error(body.error || "The request could not be saved.");
      router.push(`/dashboard/requests/${body.id}?created=manager`);router.refresh();
    } catch (problem) { setError(problem instanceof Error ? problem.message : "The request could not be saved.");setPending(false); }
  }
  const existingClient = Boolean(clientUserId);
  const selectedClient = clients.find((client)=>String(client.id)===clientUserId);
  return <form className="panel form-grid" onSubmit={submit} encType="multipart/form-data">
    <input type="hidden" name="idempotencyKey" value={key}/>
    <div className="field full"><label htmlFor="behalf-client">Existing managed client <span className="optional">optional</span></label><select id="behalf-client" name="clientUserId" value={clientUserId} onChange={(event)=>setClientUserId(event.target.value)}><option value="">New prospect without an account</option>{clients.map((client)=><option key={client.id} value={client.id}>{client.business_name} · {client.name} · {client.email}</option>)}</select></div>
    {!existingClient ? <><div className="field"><label htmlFor="behalf-name">Prospect name</label><input id="behalf-name" name="contactName" required maxLength={100}/></div><div className="field"><label htmlFor="behalf-contact">Email, phone, or WhatsApp</label><input id="behalf-contact" name="contactValue" required maxLength={160}/></div><div className="field full"><label htmlFor="behalf-business">Business name</label><input id="behalf-business" name="businessName" required maxLength={120}/></div></> : null}
    <div className="field full"><span className="eyebrow">{selectedClient?.request_type==="change"?"Showroom change request":"New showroom request"}</span><p>The request type is determined from the selected business’s publication state.</p></div>
    <div className="field full"><label htmlFor="behalf-request">Client’s instruction</label><textarea id="behalf-request" name="requestText" required minLength={10} maxLength={10000} placeholder="Record the client’s own words and requested outcome."/></div>
    <div className="field full"><label htmlFor="behalf-images">Private reference images <span className="optional">optional</span></label><input id="behalf-images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple/><small>Up to 10 JPEG, PNG, or WebP images, 5 MB each.</small></div>
    {error ? <p className="error field full" role="alert">{error}</p> : null}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? "Recording request…" : "Record request for client"}</button></div>
  </form>;
}
