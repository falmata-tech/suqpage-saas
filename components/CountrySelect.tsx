'use client';
import {useLocale} from 'next-intl';
import {useEffect,useState} from 'react';
import {COUNTRIES,countryName} from '@/lib/countries';
import {useUiText} from '@/lib/i18n/ui';
export default function CountrySelect({value,onChange,id='business-country'}:{value:string;onChange:(value:string)=>void;id?:string}) {
 const t=useUiText(),locale=useLocale();
 const [ready,setReady]=useState(false);
 useEffect(()=>setReady(true),[]);
 // Node and the browser may ship different CLDR versions. Keep the initial
 // options identical until hydration, then display the visitor's language.
 return <select id={id} name="countryCode" required disabled={!ready} value={value} onChange={event=>{if(event.target.value!==value)onChange(event.target.value);}}>
  <option value="">{t('Choose a country')}</option>
  {COUNTRIES.map(country=><option key={country.code} value={country.code}>{ready?countryName(country.code,locale):country.name}</option>)}
 </select>;
}
