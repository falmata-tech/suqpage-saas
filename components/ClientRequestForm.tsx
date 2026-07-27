"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

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

export default function ClientRequestForm({
  requestType,
}: {
  requestType: "onboarding" | "change";
}) {
  const router = useRouter();
  const key = useMemo(() => crypto.randomUUID(), []);
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    try {
      const formData = new FormData(event.currentTarget);
      const request = String(formData.get("requestText") || "").trim();
      const context = [
        `Business type: ${formData.get("businessArchetype")}`,
        `Catalog stage: ${formData.get("catalogStage")}`,
        `Photography stage: ${formData.get("photographyStage")}`,
      ].join("\n");
      formData.set("requestText", `${context}\n\nClient instruction:\n${request}`);
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
    <form className="panel form-grid intake-form" onSubmit={submit} encType="multipart/form-data">
      <input type="hidden" name="idempotencyKey" value={key} />
      <div className="field full">
        <span className="eyebrow">
          {requestType === "onboarding" ? "New showroom request" : "Showroom change request"}
        </span>
        <h2>Tell us what exists today</h2>
        <p>
          SuqPage will choose a suitable page structure and the number of
          product and image slots. You do not need to prepare a website layout.
        </p>
      </div>
      <div className="field">
        <label htmlFor="client-archetype">Business type</label>
        <select id="client-archetype" name="businessArchetype" defaultValue="artisan">
          {archetypes.map(([value, label]) => <option value={value} key={value}>{label}</option>)}
        </select>
      </div>
      <div className="field">
        <label htmlFor="client-catalog-stage">Catalog stage</label>
        <select id="client-catalog-stage" name="catalogStage" defaultValue="AI should choose from supplied products">
          <option>AI should choose from supplied products</option>
          <option>Small focused catalog, roughly 1-5 products</option>
          <option>Growing catalog, roughly 6-15 products</option>
          <option>Larger catalog, more than 15 products</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="client-photography-stage">Photography</label>
        <select id="client-photography-stage" name="photographyStage" defaultValue="Some images exist; create labeled slots for the rest">
          <option>Images are ready to attach</option>
          <option>Some images exist; create labeled slots for the rest</option>
          <option>Photography will be added after the blueprint</option>
        </select>
      </div>
      <div className="field full">
        <label htmlFor="client-request-text">Products, story, and requested outcome</label>
        <textarea
          id="client-request-text"
          name="requestText"
          required
          minLength={10}
          maxLength={9600}
          placeholder="List what you make or sell, important categories, customer questions, and any change you want. A simple list is fine."
        />
      </div>
      <div className="field full">
        <label htmlFor="client-request-images">Available reference images <span className="optional">optional</span></label>
        <input id="client-request-images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple />
        <small>Up to 10 private JPEG, PNG, or WebP references. Missing photography becomes a labeled recipe slot later.</small>
      </div>
      {error ? <p className="error field full" role="alert">{error}</p> : null}
      <div className="field full">
        <button className="btn brand" disabled={pending}>
          {pending ? "Sending request..." : "Send request to SuqPage"}
        </button>
      </div>
    </form>
  );
}
