"use client";

import { useRef, useState } from "react";

type SubmissionState = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "success"; reference: string };

export default function RequestForm() {
  const [state, setState] = useState<SubmissionState>({ kind: "idle" });
  const idempotencyKey = useRef(crypto.randomUUID());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "sending") return;
    const form = event.currentTarget;
    const data = new FormData(form);
    data.set("idempotencyKey", idempotencyKey.current);
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/requests", { method: "POST", body: data });
      const result = await response.json() as { reference?: string; error?: string };
      if (!response.ok || !result.reference) throw new Error(result.error || "The request could not be sent.");
      setState({ kind: "success", reference: result.reference });
      form.reset();
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "The request could not be sent." });
    }
  }

  if (state.kind === "success") {
    return <div className="form-card request-success" role="status"><span className="eyebrow">Request received</span><h2>We’ll review it with you.</h2><p>Your private reference is <strong>{state.reference}</strong>.</p><p>This confirms receipt only. Nothing has been accepted, designed, or published yet. SuqPage will contact you using the details you provided.</p></div>;
  }

  return <form className="form-card" onSubmit={submit} encType="multipart/form-data"><div className="form-grid">
    <div className="field"><label htmlFor="request-contact-name">Your name</label><input id="request-contact-name" name="contactName" required minLength={2} maxLength={100}/></div>
    <div className="field"><label htmlFor="request-contact-value">Email, phone, or WhatsApp</label><input id="request-contact-value" name="contactValue" required minLength={5} maxLength={160}/></div>
    <div className="field full"><label htmlFor="request-business-name">Business name <span className="optional">(optional)</span></label><input id="request-business-name" name="businessName" maxLength={120}/></div>
    <div className="field full"><label htmlFor="request-text">Tell us everything you need</label><textarea id="request-text" name="requestText" required minLength={20} maxLength={10000} rows={9} placeholder="Describe your business, products, brand direction, preferred colors, categories, and anything else we should know."/><small>Use one free-form message. Our team will organize the details with you.</small></div>
    <div className="field full"><label htmlFor="request-images">Reference images <span className="optional">(optional, up to 10)</span></label><input id="request-images" name="images" type="file" accept="image/jpeg,image/png,image/webp" multiple/><small>JPEG, PNG, or WebP. Maximum 5 MB per image.</small></div>
    <div className="field full consent-field"><label><input name="consent" type="checkbox" required/> SuqPage may use this information and the attached images to review and fulfill my request.</label></div>
    <div aria-hidden="true" className="honeypot"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    {state.kind === "error" && <div className="field full error" role="alert">{state.message}</div>}
    <div className="field full"><button className="btn brand" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Sending…" : "Send private request"}</button></div>
  </div></form>;
}
