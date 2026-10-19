import {platformEnvironment} from './platform-environment.mjs';
import {createUiText,parseLocale,type Locale} from './i18n/core';
import am from './i18n/messages/am.json';
import om from './i18n/messages/om.json';
import so from './i18n/messages/so.json';
import ti from './i18n/messages/ti.json';

export type SupportEscalationEmailMode = 'resend' | 'local-mailpit';
export type SupportEscalationEmail = {
  notificationId:number;
  recipientEmail:string;
  publicRef:string;
  queue:'support'|'transport';
  assignedStaffName:string;
  dashboardUrl:string;
  language:Locale;
};
export type SupportEscalationEmailResult =
  | {state:'accepted'}
  | {state:'deferred';category:'missing_configuration'}
  | {state:'failed';category:'invalid_message'|'provider_rejected'|'provider_failure';retryable:boolean};
/** Acceptance is provider/local-inbox acceptance, never delivery or a human read. */
export type SupportEscalationEmailPort = (email:SupportEscalationEmail)=>Promise<SupportEscalationEmailResult>;
type Environment=Record<string,string|undefined>;
const address=(value:string)=>value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value);
const positive=(value:number)=>Number.isSafeInteger(value)&&value>0;
const loopback=(raw:string|undefined,protocols:string[],port:string)=>{
  try{const url=new URL(raw||'');return protocols.includes(url.protocol)&&url.hostname==='127.0.0.1'&&url.port===port&&(url.protocol!=='http:'||!url.username&&!url.password);}catch{return false;}
};
function localEndpoint(raw:string|undefined){
  try{
    let host=new URL(raw||'').hostname.toLowerCase().replace(/\.$/,'');
    // Normalize IPv4 shorthand/integer forms even in a non-special postgres URL.
    host=new URL(`http://${host}`).hostname;
    return host==='localhost'||host.endsWith('.localhost')||host==='[::1]'||host==='[::]'||host==='0.0.0.0'||
      /^127(?:\.\d{1,3}){3}$/.test(host)||/^\[::ffff:7f[0-9a-f]{2}:[0-9a-f]{1,4}\]$/.test(host);
  }catch{return false;}
}
function endpointOverride(raw:string|undefined){
  try{
    // Installed pg-connection-string copies query host/port over the URL endpoint.
    // Reject nested connectionString defensively rather than parsing another DSN.
    return [...new URL(raw||'').searchParams.keys()].some(key=>['host','port','connectionstring'].includes(key.toLowerCase()));
  }catch{return false;}
}

export function supportEscalationEmailOrigin(mode:SupportEscalationEmailMode,env:Environment=platformEnvironment()):string|null {
  if(endpointOverride(env.SUQPAGE_POSTGRES_URL))return null;
  if(mode==='local-mailpit'){
    if(env.NODE_ENV==='production'||env.NETLIFY==='true'||env.SUQPAGE_DATABASE_DRIVER!=='postgres'||
      !loopback(env.SUQPAGE_POSTGRES_URL,['postgresql:','postgres:'],'54322')||
      !loopback(env.NEXT_PUBLIC_SUPABASE_URL,['http:'],'54321'))return null;
    return 'http://127.0.0.1:3102';
  }
  // A local preview must never fall through to an external provider.
  if(localEndpoint(env.SUQPAGE_POSTGRES_URL)||localEndpoint(env.NEXT_PUBLIC_SUPABASE_URL))return null;
  try{
    const url=new URL(env.SUQPAGE_CANONICAL_URL||env.NEXT_PUBLIC_APP_URL||'');
    return url.protocol==='https:'&&!url.username&&!url.password&&!url.search&&!url.hash&&
      !localEndpoint(url.toString())?url.origin:null;
  }catch{return null;}
}
function configuration(mode:SupportEscalationEmailMode,env:Environment){
  const origin=supportEscalationEmailOrigin(mode,env);
  if(!origin)return null;
  if(mode==='local-mailpit')return {origin,from:'alerts@suqpage.test',key:null};
  const raw=env.NOTIFICATION_FROM_EMAIL||'',from=raw.includes('<')?/^[^<>\r\n]*<([^<>\r\n]+)>$/.exec(raw)?.[1]:raw;
  return env.RESEND_API_KEY&&from&&address(from)?{origin,from,key:env.RESEND_API_KEY}:null;
}
/** Configuration/target shape only, not a provider probe; safe to log, with no values. */
export function supportEscalationEmailReadiness(mode:SupportEscalationEmailMode='resend',env:Environment=platformEnvironment()){
  return {ready:configuration(mode,env)!==null};
}
export function supportEscalationEmailKey(notificationId:number){
  if(!positive(notificationId))throw Error('Invalid escalation notification identity.');
  return `suqpage-support-overdue-${notificationId}`;
}
export function supportEscalationEmailContent(email:SupportEscalationEmail){
  const t=createUiText({en:{},am,om,so,ti}[parseLocale(email.language)]),queue=t(email.queue==='transport'?'Transport':'Business support');
  return {
    subject:`MirtPage · ${t('A chat is overdue for a reply.')} · ${email.publicRef}`,
    text:[t('A chat is overdue for a reply.'),`${t('Queue')}: ${queue}`,`${t('Reference')}: ${email.publicRef}`,t('Assigned to {value1}',{value1:email.assignedStaffName}),'',`${t('Open conversation')}: ${email.dashboardUrl}`].join('\n'),
  };
}

/** Existing Resend configuration or fixed development Mailpit; no configuration writes. */
export async function sendSupportEscalationEmail(email:SupportEscalationEmail,options:{mode?:SupportEscalationEmailMode;send?:typeof fetch;env?:Environment}={}):Promise<SupportEscalationEmailResult>{
  const mode=options.mode??'resend',config=configuration(mode,options.env??platformEnvironment());
  if(!config)return {state:'deferred',category:'missing_configuration'};
  let url:URL;
  try{url=new URL(email.dashboardUrl);}catch{return {state:'failed',category:'invalid_message',retryable:false};}
  if(!positive(email.notificationId)||!address(email.recipientEmail)||!/^SUP-[A-Z0-9-]{1,76}$/.test(email.publicRef)||
    !['support','transport'].includes(email.queue)||!['en','am','om','so','ti'].includes(email.language)||!email.assignedStaffName.trim()||email.assignedStaffName.length>160||
    /[\r\n\u0000-\u001f\u007f]/.test(email.assignedStaffName)||url.origin!==config.origin||
    !/^\/dashboard\/support\/[1-9]\d*$/.test(url.pathname)||url.username||url.password||url.hash)
    return {state:'failed',category:'invalid_message',retryable:false};
  const key=supportEscalationEmailKey(email.notificationId),content=supportEscalationEmailContent(email);
  const endpoint=mode==='local-mailpit'?'http://127.0.0.1:54324/api/v1/send':'https://api.resend.com/emails';
  const headers:Record<string,string>={'Content-Type':'application/json'};
  if(config.key){headers.Authorization=`Bearer ${config.key}`;headers['Idempotency-Key']=key;}
  const body=mode==='local-mailpit'
    ?{From:{Email:config.from,Name:'MirtPage'},To:[{Email:email.recipientEmail}],Subject:content.subject,Text:content.text,Headers:{'Message-ID':`<${key}@suqpage.test>`}}
    :{from:`MirtPage <${config.from}>`,to:[email.recipientEmail],subject:content.subject,text:content.text};
  try{
    const response=await (options.send??fetch)(endpoint,{method:'POST',headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(4000)});
    await response.body?.cancel().catch(()=>{});
    return response.ok?{state:'accepted'}:{state:'failed',category:'provider_rejected',retryable:response.status===408||response.status===429||response.status>=500};
  }catch{return {state:'failed',category:'provider_failure',retryable:true};}
}
