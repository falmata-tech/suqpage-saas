import {platformEnvironment} from './platform-environment.mjs';
import {gmailSmtpConfiguration,sendGmailSmtpEmail,type GmailSmtpFactory,type TransactionalEmailResult} from './gmail-smtp-email';
import {selectedHostedEmailMode,supportEscalationEmailOrigin,type SupportEscalationEmailMode} from './support-escalation-email';
import {parsePartnerInterest,type PartnerInterest} from './transport-partner-interest-contract';

export type PartnerInterestEmail={deliveryId:number;reference:string;recipientEmail:string;interest:PartnerInterest};
export type PartnerInterestEmailPort=(email:PartnerInterestEmail)=>Promise<TransactionalEmailResult>;
type Environment=Record<string,string|undefined>;
const address=(value:string)=>value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value);
function configuration(mode:SupportEscalationEmailMode,env:Environment){
 if(!supportEscalationEmailOrigin(mode,env))return null;
 if(mode==='local-mailpit')return{from:'partners@mirtpage.test',key:null};
 if(mode==='gmail-smtp'){const smtp=gmailSmtpConfiguration(env);return smtp?{from:smtp.user,key:null}:null;}
 if(mode==='disabled')return null;
 const raw=env.NOTIFICATION_FROM_EMAIL||'',from=raw.includes('<')?/^[^<>\r\n]*<([^<>\r\n]+)>$/.exec(raw)?.[1]:raw;
 return env.RESEND_API_KEY&&from&&address(from)?{from,key:env.RESEND_API_KEY}:null;
}
export function partnerInterestEmailReadiness(mode:SupportEscalationEmailMode=selectedHostedEmailMode(),env:Environment=platformEnvironment()){return{ready:configuration(mode,env)!==null};}
export function partnerInterestEmailContent(email:PartnerInterestEmail){
 const value=email.interest;
 return{subject:`AfricMade · Logistics partner request · ${email.reference}`,text:[
  'A logistics company would like to work with AfricMade.',`Reference: ${email.reference}`,
  `Company: ${value.companyName}`,`Contact: ${value.contactName}`,`Email: ${value.email}`,
  ...(value.phone?[`Phone: ${value.phone}`]:[]),'',value.message,
  '', 'This is an interest request, not an approved transport-provider account.',
 ].join('\n')};
}
/** Existing mail adapters only. Applicant addresses are never delivery recipients. */
export async function sendPartnerInterestEmail(email:PartnerInterestEmail,options:{mode?:SupportEscalationEmailMode;env?:Environment;send?:typeof fetch;smtpCreateTransport?:GmailSmtpFactory}={}):Promise<TransactionalEmailResult>{
 const env=options.env??platformEnvironment(),mode=options.mode??selectedHostedEmailMode(env),config=configuration(mode,env);
 if(!config)return{state:'deferred',category:'missing_configuration'};
 if(!Number.isSafeInteger(email.deliveryId)||email.deliveryId<1||!/^PI-[A-F0-9]{12}$/.test(email.reference)||!address(email.recipientEmail)||!parsePartnerInterest(email.interest).ok)return{state:'failed',category:'invalid_message',retryable:false};
 const content=partnerInterestEmailContent(email),key=`mirtpage-partner-interest-${email.deliveryId}`;
 if(mode==='gmail-smtp')return sendGmailSmtpEmail({recipientEmail:email.recipientEmail,subject:content.subject,text:content.text,deliveryKey:key},{env,createTransport:options.smtpCreateTransport});
 const headers:Record<string,string>={'Content-Type':'application/json'};
 if(config.key){headers.Authorization=`Bearer ${config.key}`;headers['Idempotency-Key']=key;}
 const body=mode==='local-mailpit'?{From:{Email:config.from,Name:'AfricMade'},To:[{Email:email.recipientEmail}],Subject:content.subject,Text:content.text,Headers:{'Message-ID':`<${key}@mirtpage.test>`}}:{from:`AfricMade <${config.from}>`,to:[email.recipientEmail],subject:content.subject,text:content.text};
 try{
  const response=await(options.send??fetch)(mode==='local-mailpit'?'http://127.0.0.1:54324/api/v1/send':'https://api.resend.com/emails',{method:'POST',headers,body:JSON.stringify(body),redirect:'error',signal:AbortSignal.timeout(4000)});
  await response.body?.cancel().catch(()=>{});
  return response.ok?{state:'accepted'}:{state:'failed',category:'provider_rejected',retryable:response.status===408||response.status===429||response.status>=500};
 }catch{return{state:'failed',category:'provider_failure',retryable:true};}
}
