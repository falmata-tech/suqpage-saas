import {after} from 'next/server';
import {dispatchAttention} from './attention-delivery';
/** Request adapter only. Durable source events survive a failed background run. */
export function scheduleAttentionDelivery(){
  try{after(async()=>{try{await dispatchAttention({limit:12});}catch{console.error('Notification delivery worker failed',{category:'worker_failure'});}});}catch{/* Outside a framework response lifecycle, the durable scheduled worker owns dispatch. */}
}
