import Link from 'next/link';
import {notFound,redirect} from 'next/navigation';
import DashboardShell from '@/components/DashboardShell';
import {getUiText} from '@/lib/i18n/server';
import {requireUser} from '@/lib/auth';
import {isQueueAgent} from '@/lib/capabilities';
import {getSupportConversation,getSupportAssignmentHistory,SupportError} from '@/lib/support';
import {supportViewState,supportThreadHref,type SupportViewState} from '@/lib/support-navigation';

export const dynamic='force-dynamic';
const dateTime=(value:number)=>new Intl.DateTimeFormat('en-ET',{dateStyle:'medium',timeStyle:'short',timeZone:'Africa/Addis_Ababa'}).format(new Date(value));

export default async function AssignmentHistory({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<SupportViewState>}){
  const user=await requireUser();
  if(user.access_role==='client')redirect('/dashboard/support');
  const id=Number((await params).id);
  if(!Number.isSafeInteger(id)||id<1)notFound();
  const conversation=await getSupportConversation(user,id).catch(error=>{
    if(error instanceof SupportError&&['not_found','forbidden'].includes(error.code))notFound();
    throw error;
  });
  const transport=conversation.conversation.assistanceCategory==='shipment_observation'||conversation.conversation.assistanceCategory==='buying_assistance';
  const state=supportViewState(await searchParams,{forcedQueue:isQueueAgent(user)?user.staff_queue_scope==='transport'?'transport':'support':undefined,fallbackQueue:transport?'transport':'support'});
  const history=await getSupportAssignmentHistory(user,id),t=await getUiText();
  return <DashboardShell user={user} business={null} supportQueue={transport?'transport':'support'}>
    <div className="navigation-trail"><Link href={supportThreadHref(id,state)}>{t('Back')}</Link></div>
    <div className="dashboard-head standard-page-heading"><div><span className="eyebrow">{conversation.conversation.publicRef}</span><h1>{t('Assignment history')}</h1><p>{conversation.conversation.subject}</p></div></div>
    <section className="panel support-assignment-history">{history.length?<ol>{history.map(item=><li key={item.id}><strong>{item.agent_name}</strong> · <time dateTime={new Date(item.assigned_at).toISOString()}>{dateTime(item.assigned_at)}</time><small>{item.assigned_by?t('Assigned by {name}',{name:item.assigned_by}):t('Automatic assignment')}{item.released_at?` · ${t('Released')} ${dateTime(item.released_at)}`:''}</small></li>)}</ol>:<p>{t('No assignment history yet.')}</p>}</section>
  </DashboardShell>;
}
