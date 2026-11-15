import {copyMaintenanceBody,copyMaintenanceSecret,isCopyMaintenanceWindow,signCopyMaintenanceBody} from '../../lib/demo-copy-background.ts';
// Published Netlify deploy only. Submit a signed request to the separate
// background function; this short scheduled adapter opens no database session.
// S200 finite copy maintenance: 22:30 UTC 15 Nov to 01:30 UTC 16 Nov.
// Restore the 09:00/13:00/17:00 EAT cron after guarded readback.
export const config={schedule:'* * * * *'};
export const isDemoSimulatorWindow=isCopyMaintenanceWindow;
export default async()=>{
 const now=Date.now();
 // Outside the exact window, including after cutoff, open no database session.
 if(!isDemoSimulatorWindow(now)){console.log('Demo simulator',{status:'outside_window',elapsedMs:Date.now()-now});return;}
 try{
  const body=copyMaintenanceBody(Math.floor(now/60000));
  const response=await fetch('https://mirtpage.com/.netlify/functions/demo-copy-background',{
   method:'POST',headers:{'content-type':'application/json',
    'x-s200-copy-signature':signCopyMaintenanceBody(body,copyMaintenanceSecret())},
   body,redirect:'error',signal:AbortSignal.timeout(5000)});
  if(response.status!==202)throw new Error('Copy background admission failed.');
  console.log('Demo simulator',{status:'submitted',elapsedMs:Date.now()-now});
 }catch{console.error('Demo simulator unavailable',{category:'demo_tick_failed',elapsedMs:Date.now()-now});}
};
