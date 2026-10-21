import {scheduleTrackingEmailDelivery} from './tracking-after';
import {createTrackingHttpHandler} from './tracking-http';
import {requestTrackingCode,verifyTrackingCode,readTrackingSession,listRecipientShipments,readRecipientShipment,revokeTrackingSession} from './tracking';
import {assertSameOrigin,hashPrivateValue,requestIpFromHeaders} from './security';
import {consumeRuntimeRateLimit} from './rate-limit-runtime';

export const trackingHttpHandler=(kind:'web'|'native')=>createTrackingHttpHandler({
 requestCode:async input=>{const result=await requestTrackingCode(input);scheduleTrackingEmailDelivery();return result;},verifyCode:verifyTrackingCode,session:readTrackingSession,
 list:listRecipientShipments,read:readRecipientShipment,logout:revokeTrackingSession,
 secureCookie:process.env.NODE_ENV==='production',
 ipKey:request=>hashPrivateValue(requestIpFromHeaders(request.headers)),
 sameOrigin:request=>{
  // A browser mutation requires Origin. Bearer-native calls use their own adapter.
  if(!request.headers.get('origin'))throw new Error('Invalid request origin.');
  assertSameOrigin(request);
 },
 allow:async request=>(await consumeRuntimeRateLimit('tracking-http:'+hashPrivateValue(requestIpFromHeaders(request.headers)),request.method==='GET'?240:40,60000)).allowed,
},kind);
