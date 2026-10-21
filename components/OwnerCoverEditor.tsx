'use client';
import LoadingBar from "./LoadingBar";
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {useUiText} from '@/lib/i18n/ui';
import type {OwnerPageDraft,ShopPageContent} from '@/lib/owner-page-domain';
import {browserJson} from '@/lib/browser-json';
export default function OwnerCoverEditor({businessId,draft,content,returnTo='profile'}:{businessId:number;draft:OwnerPageDraft|null;content:ShopPageContent;returnTo?:'profile'|'showroom'}) {
  const t=useUiText(),router=useRouter();
  const [file,setFile]=useState<File|null>(null),[preview,setPreview]=useState(''),[uploaded,setUploaded]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
  useEffect(()=>{if(!file){setPreview('');return;}const url=URL.createObjectURL(file);setPreview(url);return()=>URL.revokeObjectURL(url);},[file]);
  async function save(){if(!file||busy)return;setBusy(true);setError('');try{
    let ref=uploaded;
    if(!ref){const form=new FormData();form.set('file',file);const {ok,body}=await browserJson(`/api/page-drafts/${businessId}/media`,{method:'POST',body:form});if(!ok||typeof body.ref!=='string')throw Error(typeof body.error==='string'?body.error:'The image could not be uploaded. Please try again.');ref=body.ref;setUploaded(ref);}
    const {ok,body}=await browserJson(`/api/page-drafts/${businessId}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:draft?'save':'start',...(draft?{version:draft.version}:{}),content:{...content,heroImage:ref}})});if(!ok)throw Error(typeof body.error==='string'?body.error:'The draft could not be saved.');
    router.push(returnTo==='showroom'?'/dashboard/profile/showroom?saved=cover':'/dashboard/profile?saved=cover');router.refresh();
  }catch(e){setError(e instanceof Error?e.message:'Please try again.');}finally{setBusy(false);}}
  return <section className="panel form-grid">{busy&&<div className="field full"><LoadingBar/></div>}<h1 className="field full">{t('Cover photo')}</h1>{error&&<p role="alert" className="error field full">{t(error)}</p>}<div className="field full"><img src={preview||content.heroImage} alt={t('Cover photo')} style={{width:'100%',maxHeight:280,objectFit:'cover',borderRadius:10}}/></div><div className="field full"><label htmlFor="profile-cover-file">{t('Choose cover photo')}</label><input id="profile-cover-file" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={e=>{setFile(e.target.files?.[0]||null);setUploaded('');setError('');}}/></div>{file&&<p role="status" className="field full">{t('Unsaved changes')}</p>}<button type="button" className="btn brand" disabled={!file||busy} onClick={()=>void save()}>{t(busy?'Saving...':'Save')}</button></section>;
}
