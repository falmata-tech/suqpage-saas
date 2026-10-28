import nodemailer from 'nodemailer';

type Environment=Record<string,string|undefined>;
export type TransactionalEmailResult=
  | {state:'accepted'}
  | {state:'deferred';category:'missing_configuration'}
  | {state:'failed';category:'invalid_message'|'provider_rejected'|'provider_failure';retryable:boolean};

export type GmailSmtpMessage={recipientEmail:string;subject:string;text:string;deliveryKey:string};
type SmtpOptions={
  host:'smtp.gmail.com';port:465;secure:true;pool:false;logger:false;debug:false;
  connectionTimeout:4000;greetingTimeout:4000;socketTimeout:4000;
  tls:{servername:'smtp.gmail.com';rejectUnauthorized:true;minVersion:'TLSv1.2'};
  auth:{user:string;pass:string};disableFileAccess:true;disableUrlAccess:true;
};
type SmtpMessage={
  from:{name:'AfricMade';address:string};to:{address:string};subject:string;text:string;
  messageId:string;disableFileAccess:true;disableUrlAccess:true;
};
type SmtpTransport={
  sendMail:(message:SmtpMessage)=>Promise<{accepted:readonly string[];rejected:readonly string[]}>;
  close:()=>void;
};
export type GmailSmtpFactory=(options:SmtpOptions)=>SmtpTransport;
const address=(value:string)=>value.length<=254&&/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(value)&&!/[\u0000-\u001f\u007f]/.test(value);
const appPassword=(value:string)=>{
  // Google's display may group the 16 characters with spaces; never log either form.
  if(!/^[a-zA-Z0-9 ]{16,32}$/.test(value))return null;
  const compact=value.replace(/ /g,'');
  return /^[a-zA-Z0-9]{16}$/.test(compact)?compact:null;
};

/** The SMTP credential is independent of Supabase Auth's masked SMTP setting. */
export function gmailSmtpConfiguration(env:Environment):{user:string;password:string}|null{
  const user=env.MIRTPAGE_SMTP_USER||'',password=appPassword(env.MIRTPAGE_SMTP_APP_PASSWORD||'');
  return address(user)&&password?{user,password}:null;
}

const defaultFactory:GmailSmtpFactory=options=>{
  const transport=nodemailer.createTransport(options);
  return{
    sendMail:async message=>{
      const info=await transport.sendMail(message);
      return{
        accepted:Array.isArray(info.accepted)?info.accepted.filter((item:unknown):item is string=>typeof item==='string'):[],
        rejected:Array.isArray(info.rejected)?info.rejected.filter((item:unknown):item is string=>typeof item==='string'):[],
      };
    },
    close:()=>transport.close(),
  };
};

/** A bounded, non-pooled server-only SMTP adapter; no provider response is logged. */
export async function sendGmailSmtpEmail(
  message:GmailSmtpMessage,
  options:{env?:Environment;createTransport?:GmailSmtpFactory}={},
):Promise<TransactionalEmailResult>{
  const config=gmailSmtpConfiguration(options.env??process.env);
  if(!config)return{state:'deferred',category:'missing_configuration'};
  if(!address(message.recipientEmail)||!/^(?:suqpage-(?:tracking|support-overdue)|mirtpage-partner-interest)-[1-9]\d*$/.test(message.deliveryKey)||
    !message.subject||message.subject.length>300||/[\u0000-\u001f\u007f]/.test(message.subject)||
    !message.text||message.text.length>60_000||/[\u0000\u007f]/.test(message.text))
    return{state:'failed',category:'invalid_message',retryable:false};
  const settings:SmtpOptions={
    host:'smtp.gmail.com',port:465,secure:true,pool:false,logger:false,debug:false,
    connectionTimeout:4000,greetingTimeout:4000,socketTimeout:4000,
    tls:{servername:'smtp.gmail.com',rejectUnauthorized:true,minVersion:'TLSv1.2'},
    auth:{user:config.user,pass:config.password},disableFileAccess:true,disableUrlAccess:true,
  };
  let transport:SmtpTransport|undefined;
  try{
    transport=(options.createTransport??defaultFactory)(settings);
    const sent=await transport.sendMail({
      from:{name:'AfricMade',address:config.user},to:{address:message.recipientEmail},
      subject:message.subject,text:message.text,
      messageId:`<${message.deliveryKey}@africmade.com>`,disableFileAccess:true,disableUrlAccess:true,
    });
    return sent.accepted.length===1&&sent.accepted[0]?.toLowerCase()===message.recipientEmail.toLowerCase()&&sent.rejected.length===0
      ?{state:'accepted'}:{state:'failed',category:'provider_rejected',retryable:false};
  }catch(error){
    const detail=typeof error==='object'&&error!==null?error as {code?:unknown;responseCode?:unknown}:{};
    const code=detail.code,responseCode=detail.responseCode;
    // Nodemailer reports temporary RCPT/DATA replies as EENVELOPE and temporary
    // auth replies as EAUTH. The SMTP status must take precedence over that code.
    const smtpStatus=typeof responseCode==='number'&&Number.isInteger(responseCode)&&responseCode>=400&&responseCode<600
      ?responseCode:null;
    const retryable=smtpStatus!==null?smtpStatus<500:
      code!=='EAUTH'&&code!=='EENVELOPE'&&code!=='EMESSAGE';
    return{state:'failed',category:'provider_failure',retryable};
  }finally{try{transport?.close();}catch{/* No provider details in logs. */}}
}
