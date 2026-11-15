import {runDemoSimulatorTick} from '../../lib/demo-simulator-runtime.ts';
// Published Netlify deploy only. It shares the existing server database adapter,
// not the chat worker's execution budget, credentials or delivery queue.
// S200 finite copy maintenance: 22:30 UTC 15 Nov to 00:30 UTC 16 Nov
// (01:30–03:30 EAT). Restore the 09:00/13:00/17:00 EAT cron afterward.
export const config={schedule:'* * * * *'};
const maintenanceStart=Date.UTC(2026,10,15,22,30);
const maintenanceEnd=Date.UTC(2026,10,16,0,30);
export function isDemoSimulatorWindow(now:number){
 return Number.isSafeInteger(now)&&now>=maintenanceStart&&now<maintenanceEnd;
}
export default async()=>{
 const now=Date.now();
 // Outside the exact window, including after cutoff, open no database session.
 if(!isDemoSimulatorWindow(now)){console.log('Demo simulator',{status:'outside_window',elapsedMs:Date.now()-now});return;}
 try{
  const result=await runDemoSimulatorTick(now,1,'maintenance');
  console.log('Demo simulator',{...result,elapsedMs:Date.now()-now});
 }catch{console.error('Demo simulator unavailable',{category:'demo_tick_failed',elapsedMs:Date.now()-now});}
};
