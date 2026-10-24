import React,{useState} from 'react';
import {Platform,View} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import * as Sharing from 'expo-sharing';
import {File,Paths} from 'expo-file-system';
import type {SupportAttachment} from '@suqpage/contracts';
import {auth,API,useApp} from './runtime';
import {Button,Copy,Status} from './ui';
export type PickedSupportFile=DocumentPicker.DocumentPickerAsset;
export async function pickSupportFile():Promise<PickedSupportFile|null>{
 const result=await DocumentPicker.getDocumentAsync({type:['image/jpeg','image/png','image/webp','application/pdf'],copyToCacheDirectory:true,multiple:false});
 if(result.canceled)return null;
 const file=result.assets[0];if(file.size&&file.size>5*1024*1024)throw Error('Attachments must be 5 MB or smaller.');return file;
}
export async function supportReplyForm(file:PickedSupportFile,message:string,key:string){
 const form=new FormData();form.set('message',message);form.set('idempotencyKey',key);
 if(Platform.OS==='web')form.set('attachment',await(await fetch(file.uri)).blob(),file.name);
 else form.append('attachment',new File(file.uri),file.name);
 return form;
}
export function Attachment({conversationId,file}:{conversationId:string;file:SupportAttachment}){
 const{t}=useApp();const[busy,setBusy]=useState(false),[error,setError]=useState('');
 async function download(){setBusy(true);setError('');let local:File|undefined;try{
  const session=await auth?.auth.getSession();if(!session?.data.session)throw Error('Sign in to AfricMade.');
  const response=await fetch(`${API}/api/mobile/v1/owner/support/${conversationId}/attachments/${file.id}`,{headers:{Authorization:`Bearer ${session.data.session.access_token}`},signal:AbortSignal.timeout(20000)});
  if(!response.ok)throw Error('Attachment was not found.');
  if(Platform.OS==='web'){const url=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=url;a.download=file.originalName;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
  else{if(!await Sharing.isAvailableAsync())throw Error('File sharing is unavailable.');const ext=file.mimeType==='application/pdf'?'pdf':file.mimeType==='image/png'?'png':file.mimeType==='image/webp'?'webp':'jpg';local=new File(Paths.cache,`suqpage-attachment-${file.id}-${Date.now()}.${ext}`);local.write(new Uint8Array(await response.arrayBuffer()));await Sharing.shareAsync(local.uri,{mimeType:file.mimeType,dialogTitle:file.originalName});}
 }catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{try{local?.delete();}catch{/* Cache cleanup must not leave the action stuck. */}setBusy(false);}}
 return <View style={{gap:8}}><Copy>{file.originalName}</Copy><Button secondary disabled={busy} label={t('Save or share file')} onPress={()=>void download()}/><Status error={error}/></View>;
}
