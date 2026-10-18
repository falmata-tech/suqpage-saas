import {dispatchSupportEscalationEmails} from '../../lib/support-escalation-email-delivery.ts';
import {dispatchAttention,checkExpoAttentionReceipts} from '../../lib/attention-delivery.ts';
import {sweepSupportInactivity,sweepWaitingSupportAssignments,sweepSupportReplyOverdue} from '../../lib/support.ts';
import {dispatchTrackingEmails} from '../../lib/tracking-email-delivery.ts';
import {isTrackingSchemaReady,cleanupTrackingIdentity} from '../../lib/tracking.ts';
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
  if(Date.now()-started>=20_000){console.log('Tracking email deferred',{category:'worker_time_budget'});return;}
  let trackingReady=false;
  try{trackingReady=await isTrackingSchemaReady();}catch{console.error('Tracking readiness failed',{category:'tracking_readiness_failure'});}
  if(!trackingReady)return;
  try{const{processed,accepted,ignored,failed,pending,configured}=await dispatchTrackingEmails({limit:1});console.log('Tracking email',{processed,accepted,ignored,failed,pending,configured});}
  catch{console.error('Tracking email failed',{category:'tracking_email_failure'});}
  if(Date.now()-started>=20_000){console.log('Tracking cleanup deferred',{category:'worker_time_budget'});return;}
  try{const{sessions,challenges}=await cleanupTrackingIdentity();console.log('Tracking identity cleanup',{sessions,challenges});}
  catch{console.error('Tracking identity cleanup failed',{category:'tracking_cleanup_failure'});}
};
