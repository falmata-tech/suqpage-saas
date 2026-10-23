import {dispatchPartnerInterestEmails,partnerInterestSchemaReady} from '../lib/transport-partner-email-delivery';
import {cleanupPartnerInterests} from '../lib/transport-partner-interest';
import {platformEnvironment} from '../lib/platform-environment.mjs';
import {postgresRuntimeServices} from '../lib/postgres-runtime-services';
import {sweepSupportInactivity,sweepWaitingSupportAssignments,sweepSupportReplyOverdue} from '../lib/support';
import {dispatchSupportEscalationEmails} from '../lib/support-escalation-email-delivery';
import {dispatchTrackingEmails} from '../lib/tracking-email-delivery';
import {isTrackingSchemaReady,cleanupTrackingIdentity} from '../lib/tracking';
import {pathToFileURL} from 'node:url';

/** Development command only. Port checks are guardrails, not a network sandbox. */
export function verifyLocalChatWorkerTarget(env:Record<string,string|undefined>){
  const local=(value:string|undefined,protocol:string,port:string)=>{
    try{
      const url=new URL(value||'');
      const endpointOverride=[...url.searchParams.keys()].some(key=>['host','port','connectionstring'].includes(key.toLowerCase()));
      return !endpointOverride&&url.protocol===protocol&&url.hostname==='127.0.0.1'&&url.port===port;
    }catch{return false;}
  };
  if(env.NODE_ENV==='production'||env.NETLIFY==='true'||env.SUQPAGE_DATABASE_DRIVER!=='postgres'
    ||!local(env.SUQPAGE_POSTGRES_URL,'postgresql:','54322')&&!local(env.SUQPAGE_POSTGRES_URL,'postgres:','54322')
    ||!local(env.NEXT_PUBLIC_SUPABASE_URL,'http:','54321')){
    throw Error('Local chat worker requires the Suqpage loopback development services.');
  }
}

export async function runLocalChatWorker(once=false){
  verifyLocalChatWorkerTarget(platformEnvironment());
  const {runner,pool}=postgresRuntimeServices();
  let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,wake:(()=>void)|undefined;
  const stop=()=>{stopped=true;if(timer)clearTimeout(timer);wake?.();};
  process.on('SIGINT',stop);process.on('SIGTERM',stop);
  try{
    const target=(await runner.query<{schema:string;ready:boolean}>("SELECT current_schema() schema,EXISTS(SELECT 1 FROM schema_migrations WHERE version=69) ready")).rows[0];
    if(target?.schema!=='public'||!target.ready)throw Error('Local chat worker requires the verified public schema at migration69.');
    console.log('Local chat maintenance started',{intervalSeconds:60});
    do{
      try{
        const {routed,skippedBusy}=await sweepWaitingSupportAssignments();
        console.log('Local chat routing',{routed,skippedBusy});
      }catch{console.error('Local chat routing failed',{category:'routing_failure'});}
      if(stopped)break;
      try{console.log('Local chat maintenance',await sweepSupportInactivity());}
      catch{console.error('Local chat maintenance failed',{category:'maintenance_failure'});}
      if(stopped)break;
      try{const {notified,skippedBusy}=await sweepSupportReplyOverdue();console.log('Local chat response escalation',{notified,skippedBusy});}
      catch{console.error('Local chat response escalation failed',{category:'reply_escalation_failure'});}
      if(stopped)break;
      try{
        const {processed,accepted,ignored,failed,pending,configured}=await dispatchSupportEscalationEmails({mode:'local-mailpit',limit:2});
        console.log('Local admin email escalation',{processed,accepted,ignored,failed,pending,configured});
      }catch{console.error('Local admin email escalation failed',{category:'email_escalation_failure'});}
      if(stopped)break;
      try{
        if(await isTrackingSchemaReady()){
          try{const{processed,accepted,ignored,failed,pending,configured}=await dispatchTrackingEmails({mode:'local-mailpit',limit:2});console.log('Local tracking email',{processed,accepted,ignored,failed,pending,configured});}
          catch{console.error('Local tracking email failed',{category:'tracking_email_failure'});}
          if(stopped)break;
          try{const{sessions,challenges}=await cleanupTrackingIdentity();console.log('Local tracking identity cleanup',{sessions,challenges});}
          catch{console.error('Local tracking identity cleanup failed',{category:'tracking_cleanup_failure'});}
        }
      }catch{console.error('Local tracking readiness failed',{category:'tracking_readiness_failure'});}
      if(stopped)break;
      try{
        if(await partnerInterestSchemaReady()){
          const{processed,accepted,ignored,failed,pending,configured}=await dispatchPartnerInterestEmails({mode:'local-mailpit',limit:2});
          console.log('Local logistics partner email',{processed,accepted,ignored,failed,pending,configured});
          if(!stopped)await cleanupPartnerInterests();
        }
      }catch{console.error('Local logistics partner email failed',{category:'partner_email_failure'});}
      if(once||stopped)break;
      await new Promise<void>(resolve=>{wake=resolve;timer=setTimeout(resolve,60_000);});
      wake=undefined;timer=undefined;
    }while(!stopped);
  }finally{
    process.off('SIGINT',stop);process.off('SIGTERM',stop);
    if(timer)clearTimeout(timer);
    await pool.end();
  }
}

if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href
  &&(process.argv.includes('--run')||process.argv.includes('--once'))){
  runLocalChatWorker(process.argv.includes('--once')).catch(()=>{
    console.error('Local chat worker stopped',{category:'local_target_or_runtime_failure'});
    process.exitCode=1;
  });
}
