"use client";
import type {OwnerEditResult} from '@/lib/owner-edit-contract';
import { useUiText } from "@/lib/i18n/ui";

import CountrySelect from './CountrySelect';
import PlaceSearch from './PlaceSearch';
import type { KnownPlace } from '@/lib/place-search';
import { useRef, useState } from 'react';
import {unstable_rethrow} from 'next/navigation';
import LoadingBar from './LoadingBar';
import CategorySelect from './CategorySelect';
import type { readOwnerBusiness } from '@/lib/owner-business-runtime';
import useFormExitGuard from './useFormExitGuard';
type Setup = Awaited<ReturnType<typeof readOwnerBusiness>>;
export default function OwnerBusinessForm({setup,action,returnTo,cancelHref=returnTo==='profile'?'/dashboard/profile':'/dashboard/business'}:{returnTo?:"profile";cancelHref?:string;setup:Setup;action:(form:FormData)=>Promise<OwnerEditResult>}){
  const t = useUiText();
 const location=setup.location||setup.proposal;
 const [error,setError]=useState('');
 const [saving,setSaving]=useState(false);
 const inFlight=useRef(false);
 const formRef=useRef<HTMLFormElement>(null);
 const exit=useFormExitGuard(formRef,inFlight);
 const [gpsMessage,setGpsMessage]=useState('');
 const [latitude,setLatitude]=useState(String(location?.latitude??''));
 const [longitude,setLongitude]=useState(String(location?.longitude??''));
 const [mode,setMode]=useState(location?.location_mode||'area');
 const [countryCode,setCountryCode]=useState(location?.country_code||setup.existing?.country_code||'');
 const [city,setCity]=useState(location?.city||setup.existing?.city||'');
 const [region,setRegion]=useState(location?.region||setup.existing?.region||'');
 const [place,setPlace]=useState<KnownPlace|null>(setup.place);
 return <form ref={formRef} aria-busy={saving} onSubmit={async event=>{
  event.preventDefault();if(inFlight.current)return;
  const form=new FormData(event.currentTarget);inFlight.current=true;setSaving(true);setError('');
  try{const result=await action(form);if(result)setError(result.error);else exit.markSaved();}
  catch(error){try{unstable_rethrow(error);}catch(navigation){exit.allowExit();throw navigation;}setError('Unable to connect. Please try again.');}
  finally{inFlight.current=false;setSaving(false);}
 }} className="panel form-grid">
  {saving&&<div className="field full"><LoadingBar/></div>}
  {error&&<p className="error field full" role="alert">{t(error)}</p>}
  <fieldset disabled={saving} style={{display:'contents'}}>
  {returnTo && <input type="hidden" name="returnTo" value={returnTo}/>}
  <input type="hidden" name="expectedVersion" value={setup.business.content_version}/><input type="hidden" name="locationVersion" value={setup.proposal?.version||0}/>
  <div className="field full"><label htmlFor="owner-business-name">{t("Business name")}</label><input id="owner-business-name" name="name" required maxLength={100} defaultValue={setup.business.name}/></div>
  <div className="field full"><label htmlFor="owner-business-logo">{t("Business logo")}</label>{setup.business.logo_path?<img src={setup.business.logo_path} alt={t("Current logo")} width={80} height={80} style={{objectFit:'contain',marginBottom:12}}/>:null}<input id="owner-business-logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp"/><small>{t("JPEG, PNG or WebP, up to 5 MB. Leave empty to keep your logo.")}</small></div>
  {setup.business.logo_path?<label className="field full check-field"><input type="checkbox" name="removeLogo"/>{t("Remove logo")}</label>:null}
  <div className="field full"><h2>{t("Where buyers can find you")}</h2><p>{t("Choose a general area or a public storefront.")}</p></div>
  {!setup.existing && setup.proposal ? <p className="field full hint">{t("Example location: choose your city before publishing.")}</p> : null}
  <div className="field full"><label htmlFor="owner-category">{t("Business category")}</label><CategorySelect id="owner-category" name="category" defaultValue={setup.category}/></div>
  <div className="field"><label htmlFor="business-country">{t("Country")}</label><CountrySelect value={countryCode} onChange={value=>{setCountryCode(value);setCity('');setRegion('');setPlace(null);}}/></div>
  <div className="field"><label htmlFor="owner-city">{t("City or town")}</label><PlaceSearch countryCode={countryCode} selectionRequired value={city} selected={place} onChange={value=>{setCity(value);setPlace(null);}} onSelect={value=>{setPlace(value);setCity(value.name);setRegion(value.region);}}/></div>
  <input type="hidden" name="city" value={place?.name||city}/><input type="hidden" name="region" value={region}/>
  <div className="field full"><label htmlFor="owner-location-mode">{t("Public location")}</label><select id="owner-location-mode" name="mode" value={mode} onChange={e=>setMode(e.target.value as 'area'|'storefront')}><option value="area">{t("General area")}</option><option value="storefront">{t("Public storefront")}</option></select></div>
  {mode==='storefront'?<><div className="field full"><button type="button" className="btn secondary" onClick={()=>{
    if(!navigator.geolocation){setGpsMessage('Location is not available. Enter your storefront coordinates.');return;}
    setGpsMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(({coords})=>{
      if(coords.latitude< -90||coords.latitude>90||coords.longitude< -180||coords.longitude>180){setGpsMessage('Enter valid public storefront coordinates.');return;}
      setLatitude(String(coords.latitude));setLongitude(String(coords.longitude));setGpsMessage('Coordinates filled. Save to share this storefront location.');
    },()=>setGpsMessage('Location was not shared. Enter coordinates manually.'),{timeout:10000,maximumAge:60000,enableHighAccuracy:true});
   }}>{t("Use my current location")}</button><p role="status">{t(gpsMessage)}</p></div><div className="field"><label htmlFor="owner-latitude">{t("Storefront latitude")}</label><input id="owner-latitude" name="latitude" type="number" min="-90" max="90" step="any" required value={latitude} onChange={e=>setLatitude(e.target.value)}/></div><div className="field"><label htmlFor="owner-longitude">{t("Storefront longitude")}</label><input id="owner-longitude" name="longitude" type="number" min="-180" max="180" step="any" required value={longitude} onChange={e=>setLongitude(e.target.value)}/></div><p className="field full hint">{t("Use coordinates only for a storefront you want to make public.")}</p></>:<p className="field full hint">{t("Choose a city or town from search to place an approximate map marker. Your home address stays private.")}</p>}
  <div className="field full inline-actions"><button className="btn brand" disabled={saving||!countryCode||!place}>{t(saving?'Saving...':"Save business details")}</button><button type="button" className="btn secondary" disabled={saving} onClick={()=>exit.requestExit(cancelHref)}>{t('Cancel')}</button></div>
  </fieldset>
  {exit.confirmation}
 </form>;
}
