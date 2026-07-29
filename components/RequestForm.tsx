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
    const data = Object.fromEntries(new FormData(form));
    data.idempotencyKey = idempotencyKey.current;
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
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

  return <form className="form-card" onSubmit={submit}><div className="form-grid">
    <div className="field"><label htmlFor="request-contact-name">Your name</label><input id="request-contact-name" name="contactName" required minLength={2} maxLength={100}/></div>
    <div className="field"><label htmlFor="request-contact-value">Email, phone, or WhatsApp</label><input id="request-contact-value" name="contactValue" required minLength={5} maxLength={160}/></div>
    <div className="field full"><label htmlFor="request-business-name">Business name <span className="optional">(optional)</span></label><input id="request-business-name" name="businessName" maxLength={120}/></div>
    <div className="field full"><label htmlFor="request-text">What are you interested in?</label><textarea id="request-text" name="requestText" required minLength={10} maxLength={2000} rows={6} placeholder="Tell us what your business makes, grows, supplies, or can manufacture and the showroom you are interested in."/><small>No catalog setup or images are needed yet. If we accept the project, we’ll invite you to a private client workspace for the full request.</small></div>
    <div className="field full consent-field"><label><input name="consent" type="checkbox" required/> SuqPage may use these contact and business details to review my interest and contact me.</label></div>
    <div aria-hidden="true" className="honeypot"><label>Website<input name="website" tabIndex={-1} autoComplete="off"/></label></div>
    {state.kind === "error" && <div className="field full error" role="alert">{state.message}</div>}
    <div className="field full"><button className="btn brand" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Sending…" : "Tell SuqPage I’m interested"}</button></div>
  </div></form>;
}
