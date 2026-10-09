import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {router} from 'expo-router';
import type {OwnerHome, Profile} from '@suqpage/contracts';
import {useApp} from './runtime';
import {Button, Card, Copy, Photo, colors} from './ui';
import {ActionStatus, addAsset, pickImages, useAction} from './owner-forms';
import {OwnerAlerts} from './AttentionAlerts';

export function OwnerProfile({home}: {home: OwnerHome}) {
  const {t}=useApp();
  function edit(section: string, view?: string) {router.push({pathname:'/owner/[section]',params:{section,returnTo:'profile',...(view?{view}:{})}});}
  function row(label: string, value: string, section: string) {return <Pressable key={label} accessibilityRole="button" accessibilityLabel={t(label)} onPress={()=>edit(section,section==='page'?'edit':undefined)} style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',minHeight:64,padding:14,borderBottomWidth:1,borderColor:colors.line,gap:12}}><View style={{flex:1}}><Text style={{fontSize:14,fontWeight:'700',color:colors.ink}}>{t(label)}</Text><Text style={{fontSize:13,color:colors.muted}}>{value}</Text></View><Text style={{color:colors.brand,fontWeight:'700'}}>{t('Edit')}</Text></Pressable>;}
  return <>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}><Copy big heading>{t('Profile')}</Copy><OwnerAlerts/></View>
    <Card>
      <Photo refPath={home.shop.cover} height={150} privateImage />
      <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
        <View style={{width:60}}><Photo refPath={home.shop.logo || ""} height={60} privateImage /></View>
        <View style={{flex:1}}><Copy big>{home.shop.name}</Copy><Copy muted>@{home.shop.handle}</Copy></View>
      </View>
      <Copy muted>{t(home.shop.status==='active'?'Your page is live':home.shop.status==='suspended'?'Suspended':'Private until you publish')}</Copy>
      <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button secondary label={t('Preview page')} onPress={()=>edit('page','preview')}/></View><View style={{flex:1}}><Button label={t('Edit page')} onPress={()=>edit('page','edit')}/></View></View>
    </Card>
    {home.activity && <View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{[['Page visits',home.activity.visitsTotal],['Last 30 days',home.activity.visits30Days],['New inquiries',home.activity.newInquiries],['Products & services',home.activity.products]].map(([label,count])=><View key={label} style={{width:'47%',backgroundColor:'white',borderWidth:1,borderColor:colors.line,borderRadius:10,padding:12}}><Copy muted>{t(String(label))}</Copy><Copy big>{String(count)}</Copy></View>)}</View>}
    <Card>
      <Copy big>{t('Your business')}</Copy>
      {row('Edit cover',t('Cover photo'),'cover')}
      {row('Business details',home.shop.name,'business')}
      {row('Page address','@'+home.shop.handle,'handle')}
      {row('Public contact details',home.shop.contacts.phone || home.shop.contacts.email || t('Your page'),'page')}
    </Card>
    <Card>
      <Copy big>{t('Your account')}</Copy>
      <Copy>{home.user.name}</Copy><Copy muted>{home.user.email}</Copy><Copy muted>{home.user.phone}</Copy>
      <Button secondary label={t('Edit account details')} onPress={()=>edit('settings')}/>
    </Card>
    <View style={{flexDirection:'row',gap:10}}><View style={{flex:1}}><Button secondary label={t('Products & services')} onPress={()=>edit('products')}/></View><View style={{flex:1}}><Button secondary label={t('Customer inquiries')} onPress={()=>edit('inquiries')}/></View></View>
    <Button secondary label={t('Support')} onPress={()=>edit('support')}/>
  </>;
}

export function CoverEditor({home,onSaved}: {home: OwnerHome;onSaved:()=>void}) {
  const {t,ownerRequest}=useApp(), action=useAction();
  const [asset,setAsset]=useState<Awaited<ReturnType<typeof pickImages>>[number]|null>(null);
  const [uploaded,setUploaded]=useState('');
  const current: Profile=home.draft?.content || {template:'profile-v1',coverStyle:'blended',introduction:'',about:home.shop.about,heroImage:home.shop.cover,videoUrl:home.shop.videoUrl,contacts:home.shop.contacts,accentColor:home.shop.accentColor};
  return <>
    <Copy big heading>{t('Cover photo')}</Copy>
    <ActionStatus state={action}/>
    <Photo refPath={asset?.uri || current.heroImage} height={230} privateImage={!asset}/>
    {asset && <Copy muted>{t('Unsaved changes')}</Copy>}
    <Button secondary disabled={action.busy} label={t('Choose cover photo')} onPress={()=>void action.run(async()=>{const picked=await pickImages();if(!picked.length)return false;setAsset(picked[0]);setUploaded('');return false;})}/>
    <Button disabled={action.busy || !asset} label={t(action.busy?'Saving...':'Save')} onPress={()=>void action.run(async()=>{
      if(!asset)return false;
      let ref=uploaded;
      if(!ref){const form=new FormData();await addAsset(form,'file',asset);const result=await ownerRequest<{ref:string}>('owner/cover',undefined,form);ref=result.ref;setUploaded(ref);}
      await ownerRequest('owner/page',{action:home.draft?'save':'start',version:home.draft?.version,content:{...current,heroImage:ref}});
      onSaved();
    })}/>
  </>;
}
