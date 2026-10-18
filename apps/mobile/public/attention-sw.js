self.addEventListener('install',()=>self.skipWaiting());
self.addEventListener('activate',event=>event.waitUntil(self.clients.claim()));
self.addEventListener('push',event=>{
  let p;try{p=event.data.json();}catch{return;}
  if(!p||!['Suqpage','MirtPage'].includes(p.title)||typeof p.body!=='string'||p.body.length>300||!Number.isSafeInteger(p.notificationId))return;
  event.waitUntil(self.registration.showNotification(p.title,{body:p.body,tag:'suqpage-alert-'+p.notificationId,renotify:false,silent:Boolean(p.silent),data:{destination:p.destination}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const d=event.notification.data?.destination;let path;
  if(d?.screen==='transport-chat')path='/buying';
  else if(d?.screen==='inquiries'&&Number.isSafeInteger(d.id)&&d.id>0)path='/owner/inquiries?id='+d.id;
  else if(d?.screen==='owner-chat'&&Number.isSafeInteger(d.id)&&d.id>0)path='/owner/chat?id='+d.id;
  else return;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{const c=clients.find(c=>new URL(c.url).origin===self.location.origin);if(c){await c.navigate(path);return c.focus();}return self.clients.openWindow(path);}));
});
