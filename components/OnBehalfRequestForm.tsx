"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ManagedClientRow } from "@/lib/scalable-queries";

const archetypes = [
  ["artisan", "Artisan or maker"],
  ["farm", "Farm or grower"],
  ["natural_beauty", "Natural beauty producer"],
  ["furniture", "Furniture workshop"],
  ["manufacturer", "Small manufacturer"],
  ["food_producer", "Food producer"],
  ["textile_atelier", "Textile atelier"],
  ["service_product_hybrid", "Products and services"],
];

export default function OnBehalfRequestForm({ client }: { client?: ManagedClientRow }) {
  const router = useRouter();
  const key = useMemo(() => crypto.randomUUID(),[]);
  const [error,setError] = useState("");
  const [pending,setPending] = useState(false);
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setPending(true);setError("");
    try {
      const formData = new FormData(event.currentTarget);
      const request = String(formData.get("requestText") || "").trim();
      const context = [
        `Business type: ${formData.get("businessArchetype")}`,
        `Catalog stage: ${formData.get("catalogStage")}`,
        `Photography stage: ${formData.get("photographyStage")}`,
      ].join("\n");
      formData.set("requestText", `${context}\n\nClient instruction:\n${request}`);
      const response = await fetch("/api/operations/requests",{method:"POST",body:formData});
      const body = await response.json() as {id?:number;error?:string};
      if (!response.ok || !body.id) throw new Error(body.error || "The request could not be saved.");
      router.push(`/dashboard/requests/${body.id}?created=manager`);router.refresh();
    } catch (problem) { setError(problem instanceof Error ? problem.message : "The request could not be saved.");setPending(false); }
  }
  const existingClient = Boolean(client);
  return <form className="panel form-grid" onSubmit={submit} encType="multipart/form-data">
    <input type="hidden" name="idempotencyKey" value={key}/>
    {client ? <input type="hidden" name="clientUserId" value={client.id}/> : null}
    <div className="field full selected-client-summary">
      <span className="eyebrow">{client ? "Existing managed client" : "New prospect"}</span>
      <strong>{client ? client.business_name : "No client account selected"}</strong>
      <p>{client ? `${client.name} · ${client.email}` : "The request will create a prospect lead without an account."}</p>
    </div>
    {!existingClient ? <><div className="field"><label htmlFor="behalf-name">Prospect name</label><input id="behalf-name" name="contactName" required maxLength={100}/></div><div className="field"><label htmlFor="behalf-contact">Email, phone, or WhatsApp</label><input id="behalf-contact" name="contactValue" required maxLength={160}/></div><div className="field full"><label htmlFor="behalf-business">Business name</label><input id="behalf-business" name="businessName" required maxLength={120}/></div></> : null}
    <div className="field full"><span className="eyebrow">{client?.request_type==="change"?"Showroom change request":"New showroom request"}</span><p>The request type is determined from the selected business’s publication state.</p></div>
    <div className="field"><label htmlFor="behalf-archetype">Business type</label><select id="behalf-archetype" name="businessArchetype" defaultValue="artisan">{archetypes.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div>
    <div className="field"><label htmlFor="behalf-catalog-stage">Catalog stage</label><select id="behalf-catalog-stage" name="catalogStage" defaultValue="AI should choose from supplied products"><option>AI should choose from supplied products</option><option>Small focused catalog, roughly 1-5 products</option><option>Growing catalog, roughly 6-15 products</option><option>Larger catalog, more than 15 products</option></select></div>
    <div className="field full"><label htmlFor="behalf-photography-stage">Photography</label><select id="behalf-photography-stage" name="photographyStage" defaultValue="Some images exist; create labeled slots for the rest"><option>Images are ready to attach</option><option>Some images exist; create labeled slots for the rest</option><option>Photography will be added after the blueprint</option></select></div>
    <div className="field full"><label htmlFor="behalf-request">Client’s instruction</label><textarea id="behalf-request" name="requestText" required minLength={10} maxLength={10000} placeholder="Record the client’s own words and requested outcome."/></div>
    <div className="field full"><label htmlFor="behalf-images">Available reference images <span className="optional">optional</span></label><input id="behalf-images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple/><small>Up to 10 private JPEG, PNG, or WebP references. Missing photography becomes a labeled recipe slot later.</small></div>
    {error ? <p className="error field full" role="alert">{error}</p> : null}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? "Recording request…" : "Record request for client"}</button></div>
  </form>;
}
