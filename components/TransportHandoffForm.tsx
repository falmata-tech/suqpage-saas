"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Copy, Save } from "lucide-react";
import { saveTransportHandoffAction } from "@/app/support-actions";
import { useUiText } from "@/lib/i18n/ui";
import type { TransportHandoff } from "@/lib/support";
import styles from "./TransportSupport.module.css";

function SaveButton() {
  const { pending } = useFormStatus();
  const t = useUiText();
  return <button className="btn brand" disabled={pending}><Save size={18} aria-hidden="true" />{pending ? t("Saving…") : t("Save company")}</button>;
}

export default function TransportHandoffForm({ conversationId, handoff, closed, summary, saved }: {
  conversationId:number; handoff:TransportHandoff|null; closed:boolean; summary:string; saved:boolean;
}) {
  const t = useUiText();
  const [copyStatus, setCopyStatus] = useState("");
  return <section className={`panel ${styles.handoff}`} aria-label={t("Transport company")}>
    <h2>{t("Transport company")}</h2>
    {handoff ? <p>{t("Company saved")}: <strong>{handoff.company}</strong> · {handoff.contact}</p> : <p>{t("No company selected")}</p>}
    {!closed ? <form action={saveTransportHandoffAction} className={styles.handoff}>
      <input type="hidden" name="conversationId" value={conversationId} />
      <input type="hidden" name="previousId" value={handoff?.id || 0} />
      <label>{t("Company name")}<input name="company" required maxLength={120} defaultValue={handoff?.company || ""} /></label>
      <label>{t("Company contact")}<input name="contact" required maxLength={254} defaultValue={handoff?.contact || ""} /></label>
      <div className={styles.actions}><SaveButton /></div>
    </form> : null}
    {saved ? <p role="status">{t("Company saved")}</p> : null}
    <label>{t("Request summary")}<textarea readOnly value={summary} /></label>
    <div className={styles.actions}><button type="button" className="btn secondary" onClick={async () => {
      try { await navigator.clipboard.writeText(summary); setCopyStatus("Copied"); }
      catch { setCopyStatus("Select and copy the request above."); }
    }}><Copy size={18} aria-hidden="true" />{t("Copy request")}</button></div>
    {copyStatus ? <p role="status">{t(copyStatus)}</p> : null}
  </section>;
}
