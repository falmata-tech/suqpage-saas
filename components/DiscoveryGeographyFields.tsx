'use client';

import {useState} from 'react';
import {useUiText} from '@/lib/i18n/ui';
import type {KnownPlace} from '@/lib/place-search';
import CountrySelect from './CountrySelect';
import PlaceSearch from './PlaceSearch';

/** City identity is selected here; the separate public pin is never changed. */
export default function DiscoveryGeographyFields({countryCode:initialCountry,city:initialCity,place:initialPlace}:{countryCode:string;city:string;place:KnownPlace|null}) {
  const t=useUiText();
  const [editing,setEditing]=useState(Boolean(initialPlace));
  const [countryCode,setCountryCode]=useState(initialCountry);
  const [city,setCity]=useState(initialPlace?.name||initialCity);
  const [place,setPlace]=useState<KnownPlace|null>(initialPlace);
  if(!editing)return <div className="field full">
    <span>{t('City or town')}</span><p>{initialCity||t('Not set')}</p>
    <button className="btn secondary" type="button" onClick={()=>setEditing(true)}>{t('Edit')}</button>
  </div>;
  return <>
    <div className="field"><label htmlFor="profile-country">{t('Country')}</label><CountrySelect id="profile-country" value={countryCode} onChange={value=>{setCountryCode(value);setCity('');setPlace(null);}}/></div>
    <div className="field"><label htmlFor="profile-city">{t('City or town')}</label><PlaceSearch inputId="profile-city" selectionRequired countryCode={countryCode} value={city} selected={place} onChange={value=>{setCity(value);setPlace(null);}} onSelect={value=>{setPlace(value);setCity(value.name);}}/></div>
  </>;
}
