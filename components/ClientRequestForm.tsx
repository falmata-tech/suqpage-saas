"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const archetypes = [
  ["unspecified", "Choose from the brief"],
  ["artisan", "Artisan or maker"],
  ["farm", "Farm or grower"],
  ["natural_beauty", "Natural beauty producer"],
  ["furniture", "Furniture workshop"],
  ["manufacturer", "Manufacturer"],
  ["food_producer", "Food producer"],
  ["textile_atelier", "Textile atelier"],
  ["service_product_hybrid", "Products and services"],
];

export default function ClientRequestForm({
  requestType,
}: {
  requestType: "onboarding" | "change";
}) {
  const router = useRouter();
  const key = useMemo(() => crypto.randomUUID(), []);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const isUpdate = requestType === "change";

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const formData = new FormData(event.currentTarget);
      const request = String(formData.get("requestText") || "").trim();
      if (!isUpdate) {
        const context = [
          `Business type: ${formData.get("businessArchetype")}`,
          `Offerings stage: ${formData.get("catalogStage")}`,
          `Photography stage: ${formData.get("photographyStage")}`,
        ].join("\n");
        formData.set("requestText", `${context}\n\nBusiness request:\n${request}`);
      }
      const response = await fetch("/api/client/requests", {
        method: "POST",
        body: formData,
      });
      const body = (await response.json()) as { id?: number; error?: string };
      if (!response.ok || !body.id) {
        throw new Error(body.error || "The request could not be saved.");
      }
      router.push(`/dashboard/requests/${body.id}?created=1`);
      router.refresh();
    } catch (problem) {
      setError(problem instanceof Error ? problem.message : "The request could not be saved.");
      setPending(false);
    }
  }

  return (
    <form className="panel form-grid intake-form" onSubmit={submit}>
      <input type="hidden" name="idempotencyKey" value={key} />
      <div className="field full">
        <span className="eyebrow">
          {requestType === "onboarding" ? "Showroom setup" : "Showroom update"}
        </span>
        <h2>{isUpdate ? "What would you like changed?" : "Tell us what exists today"}</h2>
        <p>{isUpdate
          ? "Describe the result you want. You do not need to repeat information already in your showroom."
          : "MirtPage will choose a suitable page structure and the number of product, capability, and image slots. Images are added to the labeled checklist after the design is imported."}</p>
      </div>
      {!isUpdate ? <><div className="field">
        <label htmlFor="client-archetype">Business type</label>
        <select id="client-archetype" name="businessArchetype" defaultValue="unspecified">
          {archetypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="client-catalog-stage">Products &amp; capabilities</label>
        <select id="client-catalog-stage" name="catalogStage" defaultValue="Let MirtPage choose">
          <option>Let MirtPage choose</option>
          <option>Small catalog (1-5)</option>
          <option>Growing catalog (6-15)</option>
          <option>Large catalog (16+)</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="client-photography-stage">Photography</label>
        <select id="client-photography-stage" name="photographyStage" defaultValue="Some images are ready">
          <option>All images are ready</option>
          <option>Some images are ready</option>
          <option>Images will be added later</option>
        </select>
      </div></> : null}
      <div className="field full">
        <label htmlFor="client-request-text">{isUpdate ? "Requested changes" : "Products, capabilities, story, and requested outcome"}</label>
        <textarea
          id="client-request-text"
          name="requestText"
          required
          minLength={10}
          maxLength={9600}
          placeholder={isUpdate
            ? "For example: replace the hero image, rewrite the process section, add two offerings, adjust the colors, or redesign the whole showroom."
            : "List what you sell, make, grow, supply, or can manufacture. Add known capacity, minimum order, lead time, categories, and common customer questions. A simple list is fine; leave unknown facts out."}
        />
      </div>
      {error ? <p className="error field full" role="alert">{error}</p> : null}
      <div className="field full">
        <button className="btn brand" disabled={pending}>
          {pending ? "Starting project..." : requestType === "onboarding" ? "Start showroom setup" : "Start showroom update"}
        </button>
      </div>
    </form>
  );
}
