"use client";

import type { FormEvent } from "react";
import { Truck, MapPin, UserRound, Phone, MessageCircle } from "lucide-react";
import { useUiText } from "@/lib/i18n/ui";
import { OWNER_TRANSPORT_COPY, TRANSPORT_COPY } from "@/lib/i18n/transport-copy";
import type {TransportCoordinator as Coordinator} from '@/lib/transport-coordinator';
import TransportCoordinator from "./TransportCoordinator";
import styles from "./TransportSupport.module.css";

export type TransportDraft = { name: string; phone: string; origin: string; destination: string; message: string; coordinatorId:Coordinator['id']|null };
export type TransportTextField = Exclude<keyof TransportDraft,'coordinatorId'>;

/** One presentation for visitor and account-owned requests; adapters own authority. */
export default function TransportIntake({ draft, onChange, onSelectCoordinator, onSubmit, busy, ready, error, owner = false }: {
  draft: TransportDraft;
  onChange: (field: TransportTextField, value: string) => void;
  onSelectCoordinator:(id:Coordinator['id'])=>void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  busy: boolean;
  ready: boolean;
  error: string;
  owner?: boolean;
}) {
  const t = useUiText();
  return <>
    <div className={styles.welcome}>
      <div className={styles.welcomeIcon}><Truck aria-hidden="true" /></div>
      <h3>{owner ? t(OWNER_TRANSPORT_COPY.invitation) : t(TRANSPORT_COPY.invitation)}</h3>
      <p>{owner ? t(OWNER_TRANSPORT_COPY.description) : t(TRANSPORT_COPY.description)}</p>
    </div>
    <TransportCoordinator selection selectedId={draft.coordinatorId} onSelect={onSelectCoordinator}/>
    <form className={styles.intake} onSubmit={onSubmit}>
      <div className={`public-support-contact-fields ${styles.routePair}`}>
        <label htmlFor="transport-origin"><span className={styles.fieldLabel}><MapPin size={16} aria-hidden="true" />{t("From")}</span><input id="transport-origin" value={draft.origin} onChange={event => onChange("origin", event.target.value)} maxLength={120} disabled={busy} required placeholder={t("City or area")} /></label>
        <label htmlFor="transport-destination"><span className={styles.fieldLabel}><MapPin size={16} aria-hidden="true" />{t("To")}</span><input id="transport-destination" value={draft.destination} onChange={event => onChange("destination", event.target.value)} maxLength={120} disabled={busy} required placeholder={t("City or area")} /></label>
      </div>
      <div className="public-support-contact-fields">
        <label htmlFor="public-buying-name"><span className={styles.fieldLabel}><UserRound size={16} aria-hidden="true" />{t("Name")}</span><input id="public-buying-name" autoComplete="name" value={draft.name} onChange={event => onChange("name", event.target.value)} maxLength={80} disabled={busy} required placeholder={t("Your name")} /></label>
        <label htmlFor="public-buying-phone"><span className={styles.fieldLabel}><Phone size={16} aria-hidden="true" />{t("Phone")}</span><input id="public-buying-phone" type="tel" inputMode="tel" autoComplete="tel" value={draft.phone} onChange={event => onChange("phone", event.target.value)} maxLength={40} disabled={busy} required placeholder="+251…" /></label>
      </div>
      <label htmlFor="public-buying-message">{t("Goods or transport details (optional)")}</label>
      <textarea id="public-buying-message" value={draft.message} onChange={event => onChange("message", event.target.value)} maxLength={3700} rows={2} disabled={busy} placeholder={t("What are you sending? You can add a product link.")} />
      {error ? <p className="public-support-error" role="alert">{t(error)}</p> : null}
      <button type="submit" className={styles.submit} disabled={!ready || busy || !draft.coordinatorId || !draft.name.trim() || !draft.phone.trim() || !draft.origin.trim() || !draft.destination.trim()} aria-busy={busy}><MessageCircle aria-hidden="true" /><span>{t(busy ? "Sending…" : "Start chat")}</span></button>
    </form>
  </>;
}
