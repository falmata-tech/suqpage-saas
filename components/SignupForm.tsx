"use client";
import { useUiText } from "@/lib/i18n/ui";


import { useRef, useState } from "react";

import CategorySelect from "./CategorySelect";
import CountrySelect from './CountrySelect';
import PlaceSearch from './PlaceSearch';
import type {KnownPlace} from '@/lib/place-search';
import OwnerLocationPicker, { type MapPoint } from './OwnerLocationPicker';
import LoadingBar from './LoadingBar';
import HandleField from "./HandleField";
import LocationVisibilityChoices from "./LocationVisibilityChoices";

type State = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string };

export default function SignupForm({ email, initialName }: { email: string; initialName?: string }) {
  const t = useUiText();
  const [state, setState] = useState<State>({ kind: "idle" });
  const idempotencyKey = useRef(crypto.randomUUID());
  const [countryCode,setCountryCode]=useState("");
  const [city,setCity]=useState(""),[place,setPlace]=useState<KnownPlace|null>(null);
  const [locationMode,setLocationMode]=useState<'area'|'storefront'>('area');
  const [point,setPoint]=useState<MapPoint|null>(null);
  const [handleReady, setHandleReady] = useState(false);
  const [handleRevision, setHandleRevision] = useState(0);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (state.kind === "sending" || !handleReady || !place) return;
    const form = event.currentTarget;
    const body = Object.fromEntries(new FormData(form));
    body.idempotencyKey = idempotencyKey.current;
    setState({ kind: "sending" });
    try {
      const response = await fetch("/api/signup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json() as { destination?: string; error?: string; code?: string };
      if (!response.ok || !result.destination) throw new Error(result.error || "Your workspace could not be created.");
      window.location.assign(result.destination);
    } catch (error) {
      setHandleReady(false);
      setHandleRevision(value => value + 1);
      setState({ kind: "error", message: error instanceof Error ? error.message : "Your workspace could not be created." });
    }
  }

  return <form className="form-card platform-interest-form" onSubmit={submit}><div className="form-grid">
    <div className="field"><label htmlFor="signup-name">{t("Your name")}</label><input id="signup-name" name="name" autoComplete="name" required minLength={2} maxLength={100} defaultValue={initialName} /></div>
    <div className="field"><label>{t("Verified email")}</label><div className="verified-identity">{email}</div></div>
    <div className="field"><label htmlFor="signup-business">{t("Name buyers will see")}</label><input id="signup-business" name="businessName" autoComplete="organization" required minLength={2} maxLength={120} /></div>
    <HandleField onReady={setHandleReady} refreshKey={handleRevision} />
    <div className="field"><label htmlFor="signup-category">{t("Category")}</label><CategorySelect id="signup-category" name="businessCategory" required/></div>
    <div className="field"><label htmlFor="signup-phone">{t("Account phone (private)")}</label><input id="signup-phone" name="phone" type="tel" autoComplete="tel" required minLength={9} maxLength={40} placeholder="+251…" /></div>
    <div className="field"><label htmlFor="signup-country">{t("Country")}</label><CountrySelect id="signup-country" value={countryCode} onChange={value=>{setCountryCode(value);setCity("");setPlace(null);setPoint(null);}}/></div>
    <div className="field"><label htmlFor="signup-city">{t("Business city")}</label><PlaceSearch countryCode={countryCode} inputId="signup-city" selectionRequired value={city} selected={place} onChange={value=>{setCity(value);setPlace(null);setPoint(null);}} onSelect={value=>{setPlace(value);setCity(value.name);setPoint(null);}}/></div>
    {place ? <>
      <div className="field full"><LocationVisibilityChoices name="signup-location-visibility" value={locationMode} t={t} onChange={next=>{setLocationMode(next);if(next==='area')setPoint(null);}} /></div>
      {locationMode==='storefront'?<div className="field full"><OwnerLocationPicker city={place} point={point} disabled={state.kind==='sending'} t={t} onChange={setPoint}/>{point?<><input type="hidden" name="latitude" value={point.latitude}/><input type="hidden" name="longitude" value={point.longitude}/></>:null}</div>:null}
    </> : null}
    {state.kind === "sending" && <div className="full"><LoadingBar/></div>}
    <div className="field full consent-field"><label><input name="consent" type="checkbox" required /> {" "}{t("I agree to the AfricMade Terms and Privacy Policy.")}</label></div>
    {state.kind === "error" ? <div className="field full error" role="alert">{t(state.message)}</div> : null}
    <div className="field full"><button className="btn brand" type="submit" disabled={state.kind === "sending" || !handleReady || !place || (locationMode==='storefront'&&!point)}>{state.kind === "sending" ? t("Finishing setup...") : t("Finish setup")}</button></div>
  </div></form>;
}
