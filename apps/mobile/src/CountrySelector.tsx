import React,{useMemo,useState} from 'react';
import {View} from 'react-native';
import {COUNTRIES,countryName} from '../../../lib/countries';
import {useApp} from './runtime';
import {Button,Field,Copy} from './ui';
import {Sheet} from './chrome';
export default function CountrySelector({value,onChange}:{value:string;onChange:(value:string)=>void}) {
 const {t,locale}=useApp();const [open,setOpen]=useState(false),[query,setQuery]=useState('');
 const choices=useMemo(()=>COUNTRIES.map(c=>({...c,label:countryName(c.code,locale)})).filter(c=>`${c.label} ${c.name}`.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase())),[query,locale]);
 return <View style={{gap:8}}><Copy>{t('Country')}</Copy><Button secondary label={value?countryName(value,locale):t('Choose a country')} onPress={()=>{setQuery('');setOpen(true);}}/>
  <Sheet visible={open} title={t('Country')} onClose={()=>setOpen(false)}><Field label={t('Search countries')} value={query} onChangeText={setQuery} autoCorrect={false}/>
   {choices.map(c=><Button key={c.code} secondary label={c.label} onPress={()=>{if(c.code!==value)onChange(c.code);setOpen(false);}}/>)}
  </Sheet>
 </View>;
}
