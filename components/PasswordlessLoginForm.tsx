"use client";

import { useState } from "react";

type Stage = "email" | "code";
type RequestState = "idle" | "sending" | "error";

export default function PasswordlessLoginForm({ emailEnabled, initialError = "" }: { emailEnabled: boolean; initialError?: string }) {
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [requestState, setRequestState] = useState<RequestState>(initialError ? "error" : "idle");
  const [message, setMessage] = useState(initialError);

  async function requestCode() {
    if (requestState === "sending") return;
    setRequestState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/auth/email/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json() as { accepted?: boolean; error?: string };
      if (!response.ok || !result.accepted) throw new Error(result.error || "A sign-in code could not be sent.");
      setStage("code");
      setRequestState("idle");
      setMessage("Check your email for a six-digit code.");
    } catch (error) {
      setRequestState("error");
      setMessage(error instanceof Error ? error.message : "A sign-in code could not be sent.");
    }
  }

  async function startEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await requestCode();
  }

  async function verifyEmail(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requestState === "sending") return;
    setRequestState("sending");
    setMessage("");
    try {
      const response = await fetch("/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });
      const result = await response.json() as { destination?: string; error?: string };
      if (!response.ok || !result.destination) throw new Error(result.error || "The code could not be verified.");
      window.location.assign(result.destination);
    } catch (error) {
      setRequestState("error");
      setMessage(error instanceof Error ? error.message : "The code could not be verified.");
    }
  }

  if (!emailEnabled) return null;

  if (stage === "code") return <form className="platform-login-form" onSubmit={verifyEmail}>
    <div className="platform-code-heading"><span>Code sent to</span><strong>{email}</strong><button type="button" onClick={() => { setStage("email"); setCode(""); setMessage(""); setRequestState("idle"); }}>Change email</button></div>
    <div className="field"><label htmlFor="login-code">Six-digit code</label><input id="login-code" name="code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus /></div>
    {message ? <p className={requestState === "error" ? "error" : "platform-form-note"} role={requestState === "error" ? "alert" : "status"}>{message}</p> : null}
    <button type="submit" disabled={requestState === "sending" || code.length !== 6}>{requestState === "sending" ? "Checking code..." : "Continue"}</button>
    <button className="platform-text-button" type="button" disabled={requestState === "sending"} onClick={() => void requestCode()}>Send another code</button>
  </form>;

  return <form className="platform-login-form" onSubmit={startEmail}>
    <div className="field"><label htmlFor="login-email">Email</label><input id="login-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} /></div>
    {message ? <p className="error" role="alert">{message}</p> : null}
    <button type="submit" disabled={requestState === "sending"}>{requestState === "sending" ? "Sending code..." : "Continue with email"}</button>
  </form>;
}
