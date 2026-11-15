import {runDemoSimulatorTick} from '../../lib/demo-simulator-runtime.ts';
// Published Netlify deploy only. It shares the existing server database adapter,
// not the chat worker's execution budget, credentials or delivery queue.
// Finite maintenance window: 22:00–00:00 Ethiopia time from
// 2026-11-15 to 2026-11-16 only. Restore the ordinary schedule separately.
export const config={schedule:'* * * * *'};
const maintenanceStart=Date.UTC(2026,10,15,19);
const maintenanceEnd=Date.UTC(2026,10,15,21);
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
