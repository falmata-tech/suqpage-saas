// Metro selects the web/native implementation. TypeScript shares this contract.
export function attentionRoute(_path:string){}
export async function notificationDevice(_publicKey?:string):Promise<{kind:'expo';token:string}|{kind:'web';subscription:PushSubscriptionJSON}>{throw new Error('Use a platform implementation.');}
export function listenToAttentionTap(_open:(destination:unknown)=>void){return ()=>{};}
