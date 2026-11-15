import {copyMaintenanceSecret,isCopyMaintenanceWindow,verifyCopyMaintenanceRequest} from '../../lib/demo-copy-background.ts';
import {runDemoSimulatorTick} from '../../lib/demo-simulator-runtime.ts';

// Netlify scheduled and background modes cannot be combined in one function.
// The scheduled adapter submits only a signed, finite copy request here.
export const config={background:true,method:'POST'};

export default async(request:Request)=>{
 const now=Date.now();
 if(!isCopyMaintenanceWindow(now))return new Response(null,{status:403});
 if(request.method!=='POST'||request.headers.get('content-type')!=='application/json')
  return new Response(null,{status:405});
 if(!request.body||Number(request.headers.get('content-length')??0)>80)
  return new Response(null,{status:413});
 let body:string;
 try{
  const reader=request.body.getReader(),chunks:Uint8Array[]=[];
  let size=0;
  while(true){const {done,value}=await reader.read();if(done)break;
   size+=value.byteLength;if(size>80){await reader.cancel();return new Response(null,{status:413});}
   chunks.push(value);
  }
  body=new TextDecoder('utf-8',{fatal:true}).decode(Buffer.concat(chunks));
 }catch{return new Response(null,{status:400});}
 let slot:number|null;
 try{slot=verifyCopyMaintenanceRequest(body,request.headers.get('x-s200-copy-signature'),
   copyMaintenanceSecret(),now);}catch{return new Response(null,{status:503});}
 if(slot===null)return new Response(null,{status:403});
 try{
  const result=await runDemoSimulatorTick(now,1,'copy_background',slot);
  console.log('Demo copy background',{...result,elapsedMs:Date.now()-now});
  return new Response(null,{status:204});
 }catch{
  console.error('Demo copy background unavailable',{category:'demo_copy_tick_failed',elapsedMs:Date.now()-now});
  // Netlify retries a failed background invocation. The database transaction
  // rolls back its slot receipt, allowing that signed minute to be retried.
  throw new Error('demo_copy_tick_failed');
 }
};
