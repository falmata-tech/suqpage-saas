"use client";
import PlaceSearch from './PlaceSearch';
import type { KnownPlace } from '@/lib/place-search';
import { useState } from 'react';
import { BUSINESS_CATEGORY_OPTIONS } from '@/lib/business-categories';
import type { readOwnerBusiness } from '@/lib/owner-business-runtime';
type Setup = Awaited<ReturnType<typeof readOwnerBusiness>>;
export default function OwnerBusinessForm({setup,action}:{setup:Setup;action:(form:FormData)=>Promise<void>}){
 const [gpsMessage,setGpsMessage]=useState('');
 const [latitude,setLatitude]=useState(String(setup.proposal?.latitude??''));
 const [longitude,setLongitude]=useState(String(setup.proposal?.longitude??''));
 const [mode,setMode]=useState(setup.proposal?.location_mode||'area');
 const [city,setCity]=useState(setup.proposal?.city||setup.existing?.city||'');
 const [region,setRegion]=useState(setup.proposal?.region||setup.existing?.region||'');
 const [place,setPlace]=useState<KnownPlace|null>(setup.proposal?.place_id && setup.proposal.place_latitude !== null && setup.proposal.place_longitude !== null ? {id:setup.proposal.place_id,name:setup.proposal.city,localName:'',region:setup.proposal.region,kind:'place',latitude:setup.proposal.place_latitude,longitude:setup.proposal.place_longitude}:null);
 return <form action={action} className="panel form-grid">
  <input type="hidden" name="expectedVersion" value={setup.business.content_version}/><input type="hidden" name="locationVersion" value={setup.proposal?.version||0}/>
  <div className="field full"><label htmlFor="owner-business-name">Business name</label><input id="owner-business-name" name="name" required maxLength={100} defaultValue={setup.business.name}/></div>
  <div className="field full"><label htmlFor="owner-business-logo">Business logo</label>{setup.business.logo_path?<img src={setup.business.logo_path} alt="Current logo" width={80} height={80} style={{objectFit:'contain',marginBottom:12}}/>:null}<input id="owner-business-logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp"/><small>JPEG, PNG or WebP, up to 5 MB. Leave empty to keep your logo.</small></div>
  {setup.business.logo_path?<label className="field full check-field"><input type="checkbox" name="removeLogo"/>Remove logo</label>:null}
  <div className="field full"><h2>Where buyers can find you</h2><p>Choose a general area or a public storefront.</p></div>
  {!setup.existing && setup.proposal ? <p className="field full hint">Example location: choose your city before publishing.</p> : null}
  <div className="field full"><label htmlFor="owner-category">Business category</label><select id="owner-category" name="category" defaultValue={setup.category}><option value="">Choose a category</option>{BUSINESS_CATEGORY_OPTIONS.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select></div>
  <div className="field"><label htmlFor="owner-city">City or town</label><PlaceSearch value={city} selected={place} onChange={value=>{setCity(value);setPlace(null);}} onSelect={value=>{setPlace(value);setCity(value.name);setRegion(value.region);}}/></div>
  <div className="field"><label htmlFor="owner-region">Region</label><input id="owner-region" name="region" maxLength={100} value={region} readOnly={Boolean(place)} onChange={event=>setRegion(event.target.value)}/></div>
  <div className="field full"><label htmlFor="owner-location-mode">Public location</label><select id="owner-location-mode" name="mode" value={mode} onChange={e=>setMode(e.target.value as 'area'|'storefront')}><option value="area">General area</option><option value="storefront">Public storefront</option></select></div>
  {mode==='storefront'?<><div className="field full"><button type="button" className="btn secondary" onClick={()=>{
    if(!navigator.geolocation){setGpsMessage('Location is not available. Enter your storefront coordinates.');return;}
    setGpsMessage('Finding your location…');
    navigator.geolocation.getCurrentPosition(({coords})=>{
      if(coords.latitude<3||coords.latitude>15||coords.longitude<32||coords.longitude>49){setGpsMessage('Choose a storefront within Ethiopia.');return;}
      setLatitude(String(coords.latitude));setLongitude(String(coords.longitude));setGpsMessage('Coordinates filled. Save to share this storefront location.');
    },()=>setGpsMessage('Location was not shared. Enter coordinates manually.'),{timeout:10000,maximumAge:60000,enableHighAccuracy:true});
   }}>Use my current location</button><p role="status">{gpsMessage}</p></div><div className="field"><label htmlFor="owner-latitude">Storefront latitude</label><input id="owner-latitude" name="latitude" type="number" min="3" max="15" step="any" required value={latitude} onChange={e=>setLatitude(e.target.value)}/></div><div className="field"><label htmlFor="owner-longitude">Storefront longitude</label><input id="owner-longitude" name="longitude" type="number" min="32" max="49" step="any" required value={longitude} onChange={e=>setLongitude(e.target.value)}/></div><p className="field full hint">Use coordinates only for a storefront you want to make public.</p></>:<p className="field full hint">Choose a city or town from search to place an approximate map marker. Your home address stays private.</p>}
  <div className="field full"><button className="btn brand">Save business details</button></div>
 </form>;
}
