"use client";

import { useRef, useState } from "react";
import { BUSINESS_CATEGORY_OPTIONS } from "@/lib/business-categories";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

export default function SignupForm({ email, initialName }: { email: string; initialName?: string }) {
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
    <div className="field"><label htmlFor="signup-name">Your name</label><input id="signup-name" name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={initialName} /></div>
    <div className="field"><label>Verified email</label><div className="verified-identity">{email}</div></div>
    <div className="field"><label htmlFor="signup-business">Name buyers will see</label><input id="signup-business" name="businessName" autoComplete="organization" required minLength={2} maxLength={120} /></div>
    <div className="field"><label htmlFor="signup-category">Category</label><select id="signup-category" name="businessCategory" required defaultValue=""><option value="" disabled>Choose a category</option>{BUSINESS_CATEGORY_OPTIONS.map((option) => <option key={option.key} value={option.key}>{option.label}</option>)}</select></div>
    <div className="field"><label htmlFor="signup-phone">Phone or WhatsApp</label><input id="signup-phone" name="phone" type="tel" autoComplete="tel" required minLength={5} maxLength={40} /></div>
    <div className="field full consent-field"><label><input name="consent" type="checkbox" required /> I agree to the AfricMade Terms and Privacy Policy.</label></div>
    {state.kind === "error" ? <div className="field full error" role="alert">{state.message}</div> : null}
    <div className="field full"><button className="btn brand" type="submit" disabled={state.kind === "sending"}>{state.kind === "sending" ? "Finishing setup..." : "Finish setup"}</button></div>
  </div></form>;
}
