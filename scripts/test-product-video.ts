import assert from 'node:assert/strict';
import {test} from 'node:test';
import {normalizeProductVideoUrl,productVideo,productVideoEmbedUrl,productVideoWatchUrl,tikTokPlayerEvent} from '../lib/video/product-video';
import {resolveProductVideoUrl} from '../lib/tiktok-short-link';
import {socialPlayerHtml,socialPlayerNavigation,socialPlayerEvent} from '../apps/mobile/src/social-player';
import {parseProductMedia} from '../lib/product-media';
import {parseShopPageContent} from '../lib/owner-page-domain';
import {starterPage} from '../lib/business-starter';
const id='6718335390845095173',ref=`tiktok:${id}`,url=`https://www.tiktok.com/@scout2015/video/${id}`;

test('FE-057/BE-046: canonical product providers, gallery bounds and multi-provider cover',()=>{
  for(const value of [url,url+'?lang=en&_r=1',url+'/',`https://tiktok.com/@scout2015/video/${id}`,productVideoWatchUrl(ref)])assert.equal(normalizeProductVideoUrl(value).managedRef,ref);
  assert.equal(normalizeProductVideoUrl('https://youtu.be/dQw4w9WgXcQ').managedRef,'youtube:dQw4w9WgXcQ');
  assert.match(productVideoEmbedUrl(ref),/^https:\/\/www.tiktok.com\/player\/v1\/\d+\?autoplay=0/);
  assert.equal(productVideoWatchUrl(ref),`https://www.tiktok.com/player/v1/${id}`);
  assert.equal(parseProductMedia([{kind:'video',ref}])[0].ref,ref);
  for(const value of ['tiktok:0','tiktok:abc','tiktok:</script>',`tiktok:${id}x`])assert.throws(()=>productVideo(value));
  for(const value of ['http://www.tiktok.com/@x/video/'+id,'https://www.tiktok.com.evil.test/@x/video/'+id,'https://u:p@www.tiktok.com/@x/video/'+id,'https://www.tiktok.com:1234/@x/video/'+id,'https://www.tiktok.com/@x','https://www.tiktok.com/@x/photo/'+id,'https://www.tiktok.com/@x/video/123','javascript:alert(1)','https://example.com/'+id,'https://instagram.com.evil.test/reel/Dbaz44lEjdH/','https://www.instagram.com/p/Dbaz44lEjdH/','https://www.instagram.com/accounts/login/','https://www.facebook.com/share/v/abc/'])assert.throws(()=>normalizeProductVideoUrl(value));
  assert.equal(parseShopPageContent({...starterPage,videoUrl:url}).videoUrl,productVideoWatchUrl(ref));
  assert.equal(normalizeProductVideoUrl('https://www.facebook.com/FacebookDevelopers/videos/10152454700553553/').managedRef,'facebook:10152454700553553');
  assert.equal(parseShopPageContent({...starterPage,videoUrl:'https://www.facebook.com/watch/?v=10152454700553553'}).videoUrl,'https://www.facebook.com/watch/?v=10152454700553553');
  assert.ok(socialPlayerNavigation(productVideoEmbedUrl('facebook:10152454700553553'),'https://suqpage.com'));
  assert.match(socialPlayerHtml('facebook:10152454700553553','https://suqpage.com'),/plugins\/video/);
  assert.equal(normalizeProductVideoUrl('https://www.instagram.com/reel/Dbaz44lEjdH/?igsh=tracking').managedRef,'instagram:Dbaz44lEjdH');
  assert.ok(socialPlayerNavigation(productVideoEmbedUrl('instagram:Dbaz44lEjdH'),'https://suqpage.com'));
  assert.match(socialPlayerHtml('instagram:Dbaz44lEjdH','https://suqpage.com'),/instagram/);
  assert.throws(()=>parseProductMedia([{kind:'video',ref},{kind:'video',ref}]),/duplicate/);
  assert.throws(()=>parseProductMedia(Array.from({length:5},(_,n)=>({kind:'video',ref:`tiktok:${BigInt(id)+BigInt(n)}`}))),/up to/);
});

test('BE-046: bounded TikTok share redirects reject unsafe fetches and loops',async()=>{
  let calls=0;
  assert.equal(await resolveProductVideoUrl(url,async()=>{calls++;throw new Error('unexpected');}),ref);assert.equal(calls,0);
  assert.equal(await resolveProductVideoUrl('https://vm.tiktok.com/abc/',async(link)=>{calls++;assert.equal(new URL(link).hostname,'vm.tiktok.com');return {status:302,location:url};}),ref);
  assert.equal(await resolveProductVideoUrl('https://www.tiktok.com/t/abc/',async()=>({status:301,location:url})),ref);
  for(const location of ['http://www.tiktok.com/@x/video/'+id,'https://127.0.0.1/private','https://www.tiktok.com.evil.test/private','https://evil.test/path','https://u:p@www.tiktok.com/@x/video/'+id,'https://www.tiktok.com/login']){
    let fetches=0;await assert.rejects(()=>resolveProductVideoUrl('https://vt.tiktok.com/abc/',async()=>{fetches++;return {status:302,location};}));assert.equal(fetches,1,'Unsafe destination is never fetched');
  }
  let loops=0;await assert.rejects(()=>resolveProductVideoUrl('https://vm.tiktok.com/abc/',async()=>{loops++;return {status:302,location:'https://vm.tiktok.com/abc/'};}));assert.equal(loops,4);
  await assert.rejects(()=>resolveProductVideoUrl('https://vm.tiktok.com/abc/',async()=>({status:200,location:null})));
  await assert.rejects(()=>resolveProductVideoUrl('https://vt.tiktok.com/abc/',async()=>{throw new Error('network unavailable');}));
  await assert.rejects(()=>resolveProductVideoUrl('https://example.com/share',async()=>{throw new Error('Must not fetch');}));
});

test('BE-046: share adapter times out even if a port ignores abort',async()=>{
  let aborted=false;
  await assert.rejects(()=>resolveProductVideoUrl('https://vm.tiktok.com/abc/',async(_,signal)=>{signal.addEventListener('abort',()=>{aborted=true;});return new Promise(()=>{});}),/supported/);
  assert.equal(aborted,true);
});

test('FE-057: message contracts and native HTML block arbitrary navigation/injection',()=>{
  assert.equal(tikTokPlayerEvent({'x-tiktok-player':true,type:'onPlayerReady'}),'ready');
  assert.equal(tikTokPlayerEvent({'x-tiktok-player':true,type:'onPlayerError',value:{errorCode:1001}}),'error');
  assert.equal(tikTokPlayerEvent({'x-tiktok-player':true,type:'onPlayerError',value:{errorCode:3002}}),'ready');
  assert.equal(tikTokPlayerEvent({'x-tiktok-player':true,type:'onStateChange',value:1}),'ready');
  for(const input of [null,'ready',{type:'onPlayerReady'},{'x-tiktok-player':false,type:'onPlayerError'},{'x-tiktok-player':true,type:'navigateTo'}])assert.equal(tikTokPlayerEvent(input),null);
  assert.equal(socialPlayerEvent(JSON.stringify({source:'suqpage-social-video',event:'ready'})),'ready');
  for(const value of ['bad','x'.repeat(161),JSON.stringify({source:'attacker',event:'ready'}),JSON.stringify({source:'suqpage-social-video',event:'navigate'})])assert.equal(socialPlayerEvent(value),null);
  const origin='https://suqpage.com';
  assert.ok(socialPlayerNavigation(productVideoEmbedUrl(ref),origin));assert.ok(socialPlayerNavigation('about:blank',origin));
  for(const value of [url,'tiktok://video/'+id,'intent://tiktok','https://www.tiktok.com.evil.test/player/v1/'+id,'https://x:y@www.tiktok.com/player/v1/'+id,'https://example.com/','https://suqpage.com/account'])assert.equal(socialPlayerNavigation(value,origin),false);
  const html=socialPlayerHtml(ref,origin);assert.match(html,/e.source!==frame.contentWindow/);assert.match(html,/x-tiktok-player/);assert.doesNotMatch(html,/x-social-player/);assert.match(html,/https:\/\/www.tiktok.com/);assert.doesNotMatch(html,/allow-popups|embed\.js|access_token|localStorage/);
  for(const base of ['https://mirtpage.com','https://preview.mirtpage.com','http://127.0.0.1:3102']){
    assert.equal(socialPlayerNavigation(base+'/',base),true,'The configured native WebView base may load');
    assert.equal(socialPlayerNavigation(productVideoEmbedUrl(ref),base),true,'The controlled provider embed may load');
    for(const blocked of [base+'/account',base+'/?code=secret',base.replace('://','://user:pass@')+'/', 'https://evil.test/'])assert.equal(socialPlayerNavigation(blocked,base),false,blocked);
  }
  assert.throws(()=>socialPlayerHtml('tiktok:</script>',origin));assert.throws(()=>socialPlayerHtml(ref,'javascript:alert(1)'));assert.throws(()=>socialPlayerHtml(ref,'https://suqpage.com/path'));
});
