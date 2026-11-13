export type ForegroundPollOptions={read:(signal:AbortSignal)=>Promise<void>;active:()=>boolean;
 subscribe:(changed:()=>void)=>()=>void;onError?:(error:unknown)=>void;intervalMs?:number};
/** One foreground request, cancellable on hide/scope departure, bounded backoff.
 * Shared by browser and native adapters; it owns no application data or timers
 * after stop. A slow request is never overlapped by another poll. */
export function startForegroundPoll({read,active,subscribe,onError,intervalMs=15000}:ForegroundPollOptions){
 let stopped=false,timer:ReturnType<typeof setTimeout>|undefined,inflight:AbortController|undefined,failures=0;
 const clear=()=>{if(timer!==undefined)clearTimeout(timer);timer=undefined;};
 const schedule=()=>{clear();if(!stopped&&active())timer=setTimeout(tick,Math.min(60000,intervalMs*2**Math.min(failures,2)));};
 const tick=()=>{
  clear();if(stopped||!active()||inflight)return;
  const controller=new AbortController();inflight=controller;
  void Promise.resolve().then(()=>read(controller.signal)).then(()=>{if(!controller.signal.aborted)failures=0;}).catch(error=>{
   if(!controller.signal.aborted&&!stopped){failures++;onError?.(error);}
  }).finally(()=>{if(inflight===controller)inflight=undefined;schedule();});
 };
 const unsubscribe=subscribe(()=>{clear();if(!active())inflight?.abort();else if(!inflight)tick();});
 schedule();
 return()=>{stopped=true;clear();inflight?.abort();unsubscribe();};
}
