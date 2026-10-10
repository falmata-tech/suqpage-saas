"use client";
import LoadingBar from "./LoadingBar";
import { useUiText } from "@/lib/i18n/ui";


import { useState } from "react";

type Stage = "email" | "code" | "password";
type RequestState = "idle" | "sending" | "error";

export default function PasswordlessLoginForm({ emailEnabled, initialError = "" }: { emailEnabled: boolean; initialError?: string }) {
  const t = useUiText();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [password, setPassword] = useState('');
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
      const result = await response.json() as { accepted?: boolean; mode?: string; error?: string };
      if (!response.ok || !result.accepted) throw new Error(result.error || "A sign-in code could not be sent.");
      setStage(result.mode === 'password' ? 'password' : 'code');
      setRequestState("idle");
      setMessage(result.mode === 'password' ? '' : "Check your email for a six-digit code.");
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
      const response = await fetch(stage === 'password' ? '/api/auth/review' : "/api/auth/email/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stage === 'password' ? {email, password} : { email, code }),
      });
      const result = await response.json() as { destination?: string; error?: string };
      if (!response.ok || !result.destination) throw new Error(result.error || (stage === 'password' ? 'Sign-in is temporarily unavailable.' : "The code could not be verified."));
      setPassword('');
      window.location.assign(result.destination);
    } catch (error) {
      setRequestState("error");
      setMessage(error instanceof Error ? error.message : "The code could not be verified.");
    }
  }

  if (!emailEnabled) return null;

  if (stage !== "email") return <form className="platform-login-form" onSubmit={verifyEmail}>
    {requestState==='sending'&&<LoadingBar/>}
    <div className="platform-code-heading"><span>{t(stage === 'password' ? 'Email' : "Code sent to")}</span><strong>{email}</strong><button type="button" disabled={requestState === 'sending'} onClick={() => { setStage("email"); setCode(""); setPassword(''); setMessage(""); setRequestState("idle"); }}>{t("Change email")}</button></div>
    {stage === 'password'
      ? <div className="field"><label htmlFor="login-password">{t('Password')}</label><input id="login-password" name="password" type="password" value={password} onChange={event=>setPassword(event.target.value)} autoComplete="current-password" maxLength={128} required autoFocus /></div>
      : <div className="field"><label htmlFor="login-code">{t("Six-digit code")}</label><input id="login-code" name="code" value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, "").slice(0, 6))} inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} required autoFocus /></div>}
    {message ? <p className={requestState === "error" ? "error" : "platform-form-note"} role={requestState === "error" ? "alert" : "status"}>{t(message)}</p> : null}
    <button type="submit" disabled={requestState === "sending" || (stage === 'password' ? !password : code.length !== 6)}>{requestState === "sending" ? t(stage === 'password' ? 'Signing in…' : "Checking code...") : t(stage === 'password' ? 'Sign in' : "Continue")}</button>
    {stage === 'code' && <button className="platform-text-button" type="button" disabled={requestState === "sending"} onClick={() => void requestCode()}>{t("Send another code")}</button>}
  </form>;

  return <form className="platform-login-form" onSubmit={startEmail}>
    {requestState==='sending'&&<LoadingBar/>}
    <div className="field"><label htmlFor="login-email">{t("Email")}</label><input id="login-email" name="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={160} /></div>
    {message ? <p className="error" role="alert">{t(message)}</p> : null}
    <button type="submit" disabled={requestState === "sending"}>{requestState === "sending" ? t("Sending code...") : t("Continue with email")}</button>
  </form>;
}
