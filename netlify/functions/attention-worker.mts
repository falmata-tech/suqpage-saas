import {dispatchAttention,checkExpoAttentionReceipts} from '../../lib/attention-delivery.ts';
export const config={schedule:'* * * * *'};
export default async()=>{
  try{
    const dispatched=await dispatchAttention({limit:12});
    const receipts=await checkExpoAttentionReceipts();
    console.log('Notification worker',{...dispatched,...receipts});
  }catch{console.error('Notification worker failed',{category:'worker_failure'});}
};
