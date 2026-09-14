"use client";
import { useState } from 'react';
import { BUSINESS_CATEGORY_OPTIONS } from '@/lib/business-categories';
import type { readOwnerBusiness } from '@/lib/owner-business-runtime';
type Setup = Awaited<ReturnType<typeof readOwnerBusiness>>;
export default function OwnerBusinessForm({setup,action}:{setup:Setup;action:(form:FormData)=>Promise<void>}){
 const [mode,setMode]=useState(setup.proposal?.location_mode||'area');
 return <form action={action} className="panel form-grid">
  <input type="hidden" name="expectedVersion" value={setup.business.content_version}/><input type="hidden" name="locationVersion" value={setup.proposal?.version||0}/>
  <div className="field full"><label htmlFor="owner-business-name">Business name</label><input id="owner-business-name" name="name" required maxLength={100} defaultValue={setup.business.name}/></div>
  <div className="field full"><label htmlFor="owner-business-logo">Business logo</label>{setup.business.logo_path?<img src={setup.business.logo_path} alt="Current logo" width={80} height={80} style={{objectFit:'contain',marginBottom:12}}/>:null}<input id="owner-business-logo" name="logo" type="file" accept="image/jpeg,image/png,image/webp"/><small>JPEG, PNG or WebP, up to 5 MB. Leave empty to keep your logo.</small></div>
  {setup.business.logo_path?<label className="field full check-field"><input type="checkbox" name="removeLogo"/>Remove logo</label>:null}
  <div className="field full"><h2>Where buyers can find you</h2><p>Share a general area for a home business, or a storefront location you want customers to visit. Suqpage reviews changes before showing them on the map.</p></div>
  <div className="field full"><label htmlFor="owner-category">Business category</label><select id="owner-category" name="category" defaultValue={setup.category}><option value="">Choose a category</option>{BUSINESS_CATEGORY_OPTIONS.map(item=><option key={item.key} value={item.key}>{item.label}</option>)}</select></div>
  <div className="field"><label htmlFor="owner-city">City or town</label><input id="owner-city" name="city" maxLength={100} defaultValue={setup.proposal?.city||setup.existing?.city||''}/></div>
  <div className="field"><label htmlFor="owner-region">Region</label><input id="owner-region" name="region" maxLength={100} defaultValue={setup.proposal?.region||setup.existing?.region||''}/></div>
  <div className="field full"><label htmlFor="owner-location-mode">Public location</label><select id="owner-location-mode" name="mode" value={mode} onChange={e=>setMode(e.target.value as 'area'|'storefront')}><option value="area">General area</option><option value="storefront">Public storefront</option></select></div>
  {mode==='storefront'?<><div className="field"><label htmlFor="owner-latitude">Storefront latitude</label><input id="owner-latitude" name="latitude" type="number" min="3" max="15" step="any" required defaultValue={setup.proposal?.latitude??''}/></div><div className="field"><label htmlFor="owner-longitude">Storefront longitude</label><input id="owner-longitude" name="longitude" type="number" min="32" max="49" step="any" required defaultValue={setup.proposal?.longitude??''}/></div><p className="field full hint">Use coordinates only for a storefront you want to make public.</p></>:<p className="field full hint">Your map marker will show an approximate area. No home address or exact coordinates are requested.</p>}
  <div className="field full"><button className="btn brand">Save business details</button></div>
 </form>;
}
