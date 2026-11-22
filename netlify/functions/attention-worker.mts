import {partnerInterestSchemaReady} from '../../lib/transport-partner-email-delivery.ts';
import {cleanupPartnerInterests} from '../../lib/transport-partner-interest.ts';
import {isTrackingSchemaReady,cleanupTrackingIdentity} from '../../lib/tracking.ts';
import {dispatchSupportEscalationEmails} from '../../lib/support-escalation-email-delivery.ts';
import {dispatchAttention,checkExpoAttentionReceipts} from '../../lib/attention-delivery.ts';
import {sweepSupportInactivity,sweepWaitingSupportAssignments,sweepSupportReplyOverdue} from '../../lib/support.ts';
export const config={schedule:'* * * * *'};
export default async()=>{
  const started=Date.now();
  try{
    const dispatched=await dispatchAttention({limit:12});
    console.log('Notification dispatch',dispatched);
  }catch{console.error('Notification worker failed',{category:'dispatch_failure'});}
  try{
    const receipts=await checkExpoAttentionReceipts();
    console.log('Notification receipts',receipts);
  }catch{console.error('Notification worker failed',{category:'receipt_failure'});}
  // A late invocation leaves durable due clocks for the next minute. Never race
  // an uncancelled mutation against a timer or consume notification delivery time.
  if(Date.now()-started>=20_000){
    console.log('Chat maintenance deferred',{category:'worker_time_budget'});
    return;
  }
  try{
    const {routed,skippedBusy}=await sweepWaitingSupportAssignments();
    console.log('Chat routing',{routed,skippedBusy});
  }catch{console.error('Chat routing failed',{category:'routing_failure'});}
  // Routing and inactivity have separate failure boundaries and start budgets.
  if(Date.now()-started>=20_000){
    console.log('Chat maintenance deferred',{category:'worker_time_budget'});
    return;
  }
  try{
    const maintenance=await sweepSupportInactivity();
    console.log('Chat maintenance',maintenance);
  }catch{console.error('Chat maintenance failed',{category:'maintenance_failure'});}
  // Escalation is durable and independent; leave late work for the next tick.
  if(Date.now()-started>=20_000){
    console.log('Chat response escalation deferred',{category:'worker_time_budget'});
    return;
  }
  try{
    const {notified,skippedBusy}=await sweepSupportReplyOverdue();
    console.log('Chat response escalation',{notified,skippedBusy});
  }catch{console.error('Chat response escalation failed',{category:'reply_escalation_failure'});}
  if(Date.now()-started>=20_000){
    console.log('Admin email escalation deferred',{category:'worker_time_budget'});
    return;
  }
  try{
    const {processed,accepted,ignored,failed,pending,configured}=await dispatchSupportEscalationEmails({limit:2});
    console.log('Admin email escalation',{processed,accepted,ignored,failed,pending,configured});
  }catch{console.error('Admin email escalation failed',{category:'email_escalation_failure'});}

  // Expire retained private tokens and old intake data on the existing
  // schedule. Neither cleanup sends email or activates a transport workflow.
  if(Date.now()-started>=20_000)return;
  try{if(await partnerInterestSchemaReady())await cleanupPartnerInterests();}
  catch{console.error('Historical intake cleanup failed',{category:'partner_cleanup_failure'});}
  if(Date.now()-started>=20_000)return;
  try{if(await isTrackingSchemaReady())await cleanupTrackingIdentity();}
  catch{console.error('Historical tracking cleanup failed',{category:'tracking_cleanup_failure'});}
};
