"use client";

import { useRef, useState } from "react";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

export default function SignupForm() {
  const [state, setState] = useState<State>({ kind: "idle" });
  const idempotencyKey = useRef(crypto.randomUUID());

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "sending") return;
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    body.idempotencyKey = idempotencyKey.current;
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { destination?: string; error?: string };
      if (!response.ok || !result.destination) throw new Error(result.error || "Your workspace could not be created.");
      window.location.assign(result.destination);
    } catch (error) {
      setState({ kind: "error", message: error instanceof Error ? error.message : "Your workspace could not be created." });
    }
  }

  return <form className="form-card platform-interest-form" onSubmit={submit}><div className="form-grid">
    <div className="field"><label htmlFor="signup-name">Your name</label><input id="signup-name" name="name" autoComplete="name" required minLength={2} maxLength={100} /></div>
    <div className="field"><label htmlFor="signup-email">Email</label><input id="signup-email" name="email" type="email" autoComplete="email" required maxLength={160} /></div>
    <div className="field"><label htmlFor="signup-phone">Phone or WhatsApp</label><input id="signup-phone" name="phone" type="tel" autoComplete="tel" required minLength={5} maxLength={40} /></div>
    <div className="field"><label htmlFor="signup-business">Business name</label><input id="signup-business" name="businessName" autoComplete="organization" required minLength={2} maxLength={120} /></div>
    <div className="field full"><label htmlFor="signup-handle">Preferred Suq address</label><div className="signup-handle"><span>suqpage.com/@</span><input id="signup-handle" name="handle" required minLength={3} maxLength={80} /></div><small>Use letters, numbers, spaces, or hyphens. We will turn it into a clean address.</small></div>
    <div className="field"><label htmlFor="signup-password">Password</label><input id="signup-password" name="password" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></div>
    <div className="field"><label htmlFor="signup-confirm-password">Confirm password</label><input id="signup-confirm-password" name="confirmPassword" type="password" autoComplete="new-password" required minLength={12} maxLength={128} /></div>
    <div className="field full"><label htmlFor="signup-request">What do you make, grow, or produce?</label><textarea id="signup-request" name="requestText" required minLength={20} maxLength={4000} rows={5} placeholder="Tell us what your business offers, who your customers are, and what you want the showroom to communicate." /><small>You can add product details and private reference images from your workspace after signup.</small></div>
    <div className="field full consent-field"><label><input name="consent" type="checkbox" required /> Create my private SuqPage workspace and use these details to prepare my showroom request.</label></div>
    {state.kind === "error" ? <div className="field full error" role="alert">{state.message}</div> : null}
    <div className="field full"><button className="btn brand" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Creating workspace…" : "Create my workspace"}</button></div>
  </div></form>;
}
