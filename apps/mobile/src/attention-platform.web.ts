export function attentionRoute(_path:string){}
export async function notificationDevice(publicKey?:string){
  if(!publicKey||!('serviceWorker' in navigator)||!('Notification' in window))throw new Error('Could not enable notifications. Try again.');
  if(await Notification.requestPermission()!=='granted')throw new Error('Could not enable notifications. Try again.');
  const registration=await navigator.serviceWorker.register('/attention-sw.js');await navigator.serviceWorker.ready;
  const raw=atob(publicKey.replace(/-/g,'+').replace(/_/g,'/')),key=Uint8Array.from(raw,c=>c.charCodeAt(0));
  const subscription=await registration.pushManager.getSubscription()||await registration.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:key});
  return {kind:'web' as const,subscription:subscription.toJSON()};
}
export function listenToAttentionTap(_open:(destination:unknown)=>void){return ()=>{};}
