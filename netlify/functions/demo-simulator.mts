import {runDemoSimulatorTick} from '../../lib/demo-simulator-runtime.ts';
// Published Netlify deploy only. It shares the existing server database adapter,
// not the chat worker's execution budget, credentials or delivery queue.
// Netlify cron uses UTC: 09:00, 13:00 and 17:00 in Ethiopia (UTC+3).
export const config={schedule:'0 6,10,14 * * *'};
export function isDemoSimulatorWindow(now:number){
 const date=new Date(now),hour=date.getUTCHours();
 // A short delivery window tolerates Netlify jitter without admitting a
 // second stage in the same scheduled hour.
 const slotStart=Date.UTC(date.getUTCFullYear(),date.getUTCMonth(),date.getUTCDate(),hour);
 return (hour===6||hour===10||hour===14)&&now-slotStart<=15*60000;
}
export default async()=>{
 const now=Date.now();
 // Manual "Run now" and delayed invocations must obey the same daytime window.
 if(!isDemoSimulatorWindow(now)){console.log('Demo simulator',{status:'outside_window',elapsedMs:Date.now()-now});return;}
 try{
  const result=await runDemoSimulatorTick(now,60);
  console.log('Demo simulator',{...result,elapsedMs:Date.now()-now});
 }catch{console.error('Demo simulator unavailable',{category:'demo_tick_failed',elapsedMs:Date.now()-now});}
};
