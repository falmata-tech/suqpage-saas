"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { ManagedClientRow } from "@/lib/scalable-queries";
import type { Business, ServiceRequestType } from "@/lib/types";

const archetypes = [
  ["unspecified", "Choose from the brief"],
  ["artisan", "Artisan or maker"],
  ["farm", "Farm or grower"],
  ["natural_beauty", "Natural beauty producer"],
  ["furniture", "Furniture workshop"],
  ["manufacturer", "Small manufacturer"],
  ["food_producer", "Food producer"],
  ["textile_atelier", "Textile atelier"],
  ["service_product_hybrid", "Products and services"],
];

export default function OnBehalfRequestForm({ client, business, requestType }: { client?: ManagedClientRow; business?: Business; requestType?: ServiceRequestType }) {
  const router = useRouter();
  const key = useMemo(() => crypto.randomUUID(),[]);
  const [error,setError] = useState("");
  const [pending,setPending] = useState(false);
  const effectiveRequestType = requestType || client?.request_type || "onboarding";
  const isUpdate = effectiveRequestType === "change";
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();setPending(true);setError("");
    try {
      const formData = new FormData(event.currentTarget);
      const request = String(formData.get("requestText") || "").trim();
      if (!isUpdate) {
        const context = [
          `Business type: ${formData.get("businessArchetype")}`,
          `Catalog stage: ${formData.get("catalogStage")}`,
          `Photography stage: ${formData.get("photographyStage")}`,
        ].join("\n");
        formData.set("requestText", `${context}\n\nBusiness request:\n${request}`);
      }
      const response = await fetch("/api/operations/requests",{method:"POST",body:formData});
      const body = await response.json() as {id?:number;error?:string};
      if (!response.ok || !body.id) throw new Error(body.error || "The request could not be saved.");
      router.push(`/dashboard/requests/${body.id}?created=manager`);router.refresh();
    } catch (problem) { setError(problem instanceof Error ? problem.message : "The request could not be saved.");setPending(false); }
  }
  const existingClient = Boolean(client);
  const existingBusiness = Boolean(business);
  return <form className="panel form-grid" onSubmit={submit}>
    <input type="hidden" name="idempotencyKey" value={key}/>
    {client ? <input type="hidden" name="clientUserId" value={client.id}/> : null}
    {!client && business ? <input type="hidden" name="businessId" value={business.id}/> : null}
    <div className="field full selected-client-summary">
      <span className="eyebrow">{client ? "Existing client account" : business ? "Existing business" : "New prospect"}</span>
      <strong>{client ? client.business_name : business ? business.name : "No business selected"}</strong>
      <p>{client ? `${client.name} · ${client.email}` : business ? `@${business.handle} · owner access can be added separately` : "The request will create a prospect lead without an account."}</p>
    </div>
    {!existingClient && !existingBusiness ? <><div className="field"><label htmlFor="behalf-name">Prospect name</label><input id="behalf-name" name="contactName" required maxLength={100}/></div><div className="field"><label htmlFor="behalf-contact">Email, phone, or WhatsApp</label><input id="behalf-contact" name="contactValue" required maxLength={160}/></div><div className="field full"><label htmlFor="behalf-business">Business name</label><input id="behalf-business" name="businessName" required maxLength={120}/></div></> : null}
    <div className="field full"><span className="eyebrow">{isUpdate?"Showroom update":"Showroom setup"}</span><h2>{isUpdate ? "What should change?" : "Describe the first showroom"}</h2><p>{isUpdate ? "Record the requested outcome without repeating information already in the live showroom." : "MirtPage selects setup or update from the business's publication history."}</p></div>
    {!isUpdate ? <><div className="field"><label htmlFor="behalf-archetype">Business type</label><select id="behalf-archetype" name="businessArchetype" defaultValue="unspecified">{archetypes.map(([value,label])=><option value={value} key={value}>{label}</option>)}</select></div>
    <div className="field"><label htmlFor="behalf-catalog-stage">Catalog stage</label><select id="behalf-catalog-stage" name="catalogStage" defaultValue="Let MirtPage choose"><option>Let MirtPage choose</option><option>Small catalog (1-5)</option><option>Growing catalog (6-15)</option><option>Large catalog (16+)</option></select></div>
    <div className="field full"><label htmlFor="behalf-photography-stage">Photography</label><select id="behalf-photography-stage" name="photographyStage" defaultValue="Some images are ready"><option>All images are ready</option><option>Some images are ready</option><option>Images will be added later</option></select></div></> : null}
    <div className="field full"><label htmlFor="behalf-request">{isUpdate ? "Requested changes" : "Client’s instruction"}</label><textarea id="behalf-request" name="requestText" required minLength={10} maxLength={10000} placeholder={isUpdate ? "Describe the exact copy, images, offerings, styling, or complete redesign the client wants." : "Record the client’s own words and requested outcome."}/></div>
    {error ? <p className="error field full" role="alert">{error}</p> : null}
    <div className="field full"><button className="btn brand" disabled={pending}>{pending ? "Starting project…" : existingBusiness ? isUpdate ? "Start showroom update" : "Start showroom setup" : "Record prospect request"}</button></div>
  </form>;
}
