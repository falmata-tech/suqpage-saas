import {after} from 'next/server';
import {runtimeGet} from './runtime-sql';
import {dispatchTrackingEmails} from './tracking-email-delivery';
import {trackingEmailOrigin} from './tracking-email';
import {selectedHostedEmailMode} from './support-escalation-email';
/** Queue survives a failed after hook; the scheduled worker retries independently. */
export function scheduleTrackingEmailDelivery(){
 try{after(async()=>{try{
  if(!await runtimeGet('SELECT 1 FROM schema_migrations WHERE version=71'))return;
  const mode=trackingEmailOrigin('local-mailpit')?'local-mailpit':selectedHostedEmailMode();
  await dispatchTrackingEmails({mode,limit:2});
 }catch{console.error('Tracking email delivery failed',{category:'tracking_email_failure'});}});}catch{/* Outside Next, durable jobs remain for the guarded scheduled worker. */}
}
