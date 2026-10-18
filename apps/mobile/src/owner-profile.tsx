import {OWNER_ACTIVITY_METRICS} from "../../../lib/i18n/owner-activity-copy";
import React, {useState} from 'react';
import {View, Text, Pressable} from 'react-native';
import {router} from 'expo-router';
import type {OwnerHome, Profile} from '@suqpage/contracts';
import {useApp} from './runtime';
import {Button, Card, Copy, Photo, Icon, colors} from './ui';
import {ActionStatus, addAsset, pickImages, useAction} from './owner-forms';
import {OwnerAlerts} from './AttentionAlerts';
import {useOwnerEditGuard} from './owner-edit-navigation';
import OwnerEditConfirmation from './OwnerEditConfirmation';

export function OwnerProfile({home}: {home: OwnerHome}) {
  const {t}=useApp(), activity=home.activity;
  function edit(section: string, view?: string) {router.push({pathname:'/owner/[section]',params:{section,returnTo:'profile',...(view?{view}:{})}});}
  return <>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:8}}><Copy big heading>{t('Account')}</Copy><OwnerAlerts/></View>
    <Card>
      <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
        <View style={{width:48}}><Photo refPath={home.shop.logo || ""} height={48} privateImage /></View>
        <View style={{flex:1,minWidth:0}}><Text style={{fontSize:20,lineHeight:26,fontWeight:'700',color:colors.ink}}>{home.shop.name}</Text><Copy muted>@{home.shop.handle}</Copy></View>
      </View>
      <Copy muted>{t(home.shop.status==='active'?'Your page is live':home.shop.status==='suspended'?'Suspended':'Private until you publish')}</Copy>
    </Card>
    {activity && <View style={{flexDirection:'row',gap:8}}>{OWNER_ACTIVITY_METRICS.map(({field,label})=><View key={field} style={{flex:1,minWidth:0,backgroundColor:'white',borderWidth:1,borderColor:colors.line,borderRadius:10,padding:10,gap:4}}><Text style={{fontSize:20,fontWeight:'700',color:colors.ink}}>{String(activity[field])}</Text><Text style={{fontSize:11,lineHeight:16,color:colors.muted}}>{t(label)}</Text></View>)}</View>}
    <View style={{borderWidth:1,borderColor:colors.line,borderRadius:12,overflow:'hidden',backgroundColor:'white'}}>{[
      {label:'Your page',section:'showroom',icon:'shop',description:'Preview and edit your showroom.'},
      {label:'Products',section:'products',icon:'package',description:'Add and update your products.'},
      {label:'Transport chat',section:'transport',icon:'chat',description:'Arrange transport with our team.'},
      {label:'Business details',section:'business',icon:'shop',description:'Name, category and business location.'},
      {label:'Account settings',section:'settings',icon:'user',description:'Private details and sign-in.'},
      {label:'Support',section:'support',icon:'headphones',description:'Chat with the MirtPage support team.'},
    ].map((item,index)=><Pressable key={item.section} accessibilityRole="button" accessibilityLabel={t(item.label)} onPress={()=>edit(item.section)} style={{minHeight:64,padding:12,flexDirection:'row',alignItems:'center',gap:12,borderTopWidth:index?1:0,borderColor:colors.line}}><Icon name={item.icon} color={colors.brand}/><View style={{flex:1,minWidth:0,gap:3}}><Text style={{fontSize:15,lineHeight:21,fontWeight:'700',color:colors.ink}}>{t(item.label)}</Text><Text style={{fontSize:12,lineHeight:17,color:colors.muted}}>{t(item.description)}</Text></View><Text accessibilityElementsHidden style={{color:colors.muted,fontSize:20}}>›</Text></Pressable>)}</View>
  </>;
}

export function ShowroomMenu() {
  const {t}=useApp();
  function open(section:string,view?:string){router.push({pathname:'/owner/[section]',params:{section,returnTo:'showroom',...(view?{view}:{})}});}
  return <><Copy big heading>{t('Your page')}</Copy><Button secondary label={t('Preview page')} icon="eye" onPress={()=>open('page','preview')}/>{[
    {label:'Page content',items:[{label:'About the business',section:'page',view:'about'},{label:'Cover photo',section:'cover'},{label:'Business video',section:'page',view:'video'}]},
    {label:'Appearance',items:[{label:'Page color',section:'page',view:'color'}]},
    {label:'Sharing and access',items:[{label:'Public contact details',section:'page',view:'contacts'},{label:'Page address',section:'handle'},{label:'Allow team editing',section:'page',view:'team'}]},
  ].map(group=><View key={group.label} style={{gap:8}}><Text style={{fontSize:13,lineHeight:20,fontWeight:'600',color:colors.muted}}>{t(group.label)}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{group.items.map(item=><Pressable key={item.label} accessibilityRole="button" accessibilityLabel={t(item.label)} onPress={()=>open(item.section,item.view)} style={{minHeight:76,flexBasis:'47%',flexGrow:1,padding:12,justifyContent:'center',borderWidth:1,borderColor:colors.line,borderRadius:12,backgroundColor:'white'}}><Text style={{fontSize:14,lineHeight:21,fontWeight:'600',color:colors.ink}}>{t(item.label)}</Text></Pressable>)}</View></View>)}</>;
}

export function CoverEditor({home,onSaved,onCancel}: {home: OwnerHome;onSaved:()=>void;onCancel?:()=>void}) {
  const {t,ownerRequest}=useApp(), action=useAction();
  const [asset,setAsset]=useState<Awaited<ReturnType<typeof pickImages>>[number]|null>(null);
  const [uploaded,setUploaded]=useState('');
  const signature=asset?.uri||'';
  const guard=useOwnerEditGuard({dirty:Boolean(asset),signature,busy:action.busy,isBusy:action.isBusy,discard:()=>{setAsset(null);setUploaded('');}});
  const current: Profile=home.draft?.content || {template:'profile-v1',coverStyle:'blended',introduction:'',about:home.shop.about,heroImage:home.shop.cover,videoUrl:home.shop.videoUrl,contacts:home.shop.contacts,accentColor:home.shop.accentColor};
  return <>
    <Copy big heading>{t('Cover photo')}</Copy>
    <ActionStatus state={action}/>
    <Photo refPath={asset?.uri || current.heroImage} height={230} privateImage={!asset}/>
    {asset && <Copy muted>{t('Unsaved changes')}</Copy>}
    <Button secondary disabled={action.busy} label={t('Choose cover photo')} onPress={()=>void action.run(async()=>{const picked=await pickImages();if(!picked.length)return false;guard.changed();setAsset(picked[0]);setUploaded('');return false;})}/>
    <Button disabled={action.busy || !asset} label={t(action.busy?'Saving...':'Save')} onPress={()=>void action.run(async()=>{
      if(!asset)return false;
      const checkpoint=guard.checkpoint();
      let ref=uploaded;
      if(!ref){const form=new FormData();await addAsset(form,'file',asset);const result=await ownerRequest<{ref:string}>('owner/cover',undefined,form);ref=result.ref;setUploaded(ref);}
      await ownerRequest('owner/page',{action:home.draft?'save':'start',version:home.draft?.version,content:{...current,heroImage:ref}});
      guard.complete(onSaved,signature,checkpoint);
    })}/>
    {onCancel&&<Button secondary disabled={action.busy} label={t('Cancel')} onPress={()=>guard.requestLeave(onCancel)}/>}
    <OwnerEditConfirmation guard={guard}/>
  </>;
}
