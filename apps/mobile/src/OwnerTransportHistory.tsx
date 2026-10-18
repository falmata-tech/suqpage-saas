import React,{useState} from 'react';
import {View} from 'react-native';
import {router} from 'expo-router';
import type {OwnerTransportHistory as History} from '../../../lib/owner-transport-contract';
import {ApiFailure,useApp,useLoad} from './runtime';
import {Button,Card,Copy,Screen,Status,s} from './ui';
import {clientChatPresentation} from '../../../lib/support-client-state';

export default function OwnerTransportHistory(){
  const{t,session,ownerRequest}=useApp(),[page,setPage]=useState(1);
  const load=useLoad(async()=>{
    if(!session)return null;
    try{return await ownerRequest<History>('owner/transport?history=1&page='+page);}
    catch(error){if(error instanceof ApiFailure&&error.code==='setup_required')router.replace('/account');throw error;}
  },[page,session?.user.id]);
  return <Screen><Button secondary label={t('Back to account')} onPress={()=>router.replace('/account')}/><Copy big heading>{t('Transport chat')}</Copy><Copy>{t('Chat history')}</Copy><Button label={t('Start another chat')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'transport',view:'new',returnTo:'profile'}})}/><Status {...load} retry={load.reload}/>
    {!load.loading&&!load.error&&load.data?.items.length===0&&<Copy muted>{t('No conversations yet.')}</Copy>}
    {load.data?.items.map(item=><Card key={item.id}><Copy>{item.subject}</Copy><Copy muted>{item.publicRef}</Copy>{item.unread&&<Copy>{t('New')}</Copy>}<Copy muted>{t(clientChatPresentation(item).statusKey)}</Copy><Button secondary label={t('Open')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'transport',id:String(item.id),returnTo:'profile'}})}/></Card>)}
    <View style={s.row}><Button secondary label={t('Previous')} disabled={page<=1} onPress={()=>setPage(value=>value-1)}/><Button secondary label={t('Next')} disabled={!load.data||page>=load.data.pages} onPress={()=>setPage(value=>value+1)}/></View>
  </Screen>;
}
