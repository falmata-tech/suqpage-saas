/* Generic attention payloads only. Never cache a private API or transcript. */
self.addEventListener('push',event=>{
  let p;try{p=event.data.json();}catch{return;}
  if(!p||!['Suqpage','MirtPage','AfricMade'].includes(p.title)||typeof p.body!=='string'||p.body.length>300||!Number.isSafeInteger(p.notificationId))return;
  event.waitUntil(self.registration.showNotification('AfricMade',{body:p.body,icon:'/pwa/africmade-icon-v4-192.png',badge:'/pwa/africmade-badge-96.png',tag:'suqpage-alert-'+p.notificationId,renotify:false,silent:Boolean(p.silent),data:{destination:p.destination,notificationId:p.notificationId}}));
});
self.addEventListener('notificationclick',event=>{
  event.notification.close();const d=event.notification.data?.destination;
  if(!d||typeof d!=='object')return;
  let path;
  if(d.screen==='transport-chat')path='/?chat=transport';
  else if(d.screen==='support-queue')path='/dashboard/support';
  else if(['support-chat','owner-chat'].includes(d.screen)&&Number.isSafeInteger(d.id)&&d.id>0)path='/dashboard/support/'+d.id;
  else if(d.screen==='inquiries'&&Number.isSafeInteger(d.id)&&d.id>0&&Number.isSafeInteger(d.businessId)&&d.businessId>0)path='/dashboard/inquiries?inquiry='+d.id+'&business='+d.businessId;
  else return;
  event.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(async clients=>{const existing=clients.find(c=>new URL(c.url).origin===self.location.origin);if(existing){await existing.navigate(path);return existing.focus();}return self.clients.openWindow(path);}));
});
