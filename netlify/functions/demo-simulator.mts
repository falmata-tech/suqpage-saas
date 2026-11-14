import {runDemoSimulatorTick} from '../../lib/demo-simulator-runtime.ts';
// Published Netlify deploy only. It shares the existing server database adapter,
// not the chat worker's execution budget, credentials or delivery queue.
export const config={schedule:'* * * * *'};
export default async()=>{
 try{console.log('Demo simulator',await runDemoSimulatorTick());}
 catch{console.error('Demo simulator unavailable',{category:'demo_tick_failed'});}
};
