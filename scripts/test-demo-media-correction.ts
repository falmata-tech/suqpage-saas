import assert from 'node:assert/strict';
import test from 'node:test';
import {parseDemoMediaCorrection,parseUnenrolledDemoMediaCorrection,parseQueuedDemoMediaCorrection} from '../lib/demo-media-correction';
import {DEMO_VIDEO_ASSETS} from '../lib/video/demo-video-catalog';
import {parseDemoProcessMediaCorrection,PROCESS_MEDIA_TARGETS} from '../lib/demo-process-media-correction';

test('BE-049 process repair binds the reviewed enrolled cohort and same-business asset',()=>{
 assert.equal(PROCESS_MEDIA_TARGETS.length,53);
 assert.ok(PROCESS_MEDIA_TARGETS.every(([id,handle],index)=>index===0||id>PROCESS_MEDIA_TARGETS[index-1][0]&&Boolean(handle)));
 assert.ok([5,6,7,27,28,29,31,32,33,46,61].every(id=>!PROCESS_MEDIA_TARGETS.some(([target])=>target===id)));
 const input={kind:'process_media_correction',direction:'apply',operationKey:'reviewed_process_0001',
  businessId:1,handle:'selam-weave',ownerUserId:7,providerUserId:'01234567-1234-1234-1234-012345678901',
  expectedHash:'a'.repeat(64),expectedContentVersion:4,expectedDraftVersion:3,expectedPageRevision:3,
  expectedStage:2,expectedCycle:0,expectedDueAt:1800000000000,
  processVideoBefore:'youtube:wJV9EDe_sFc',processVideoAfter:'demo:business-1'};
 assert.deepEqual(parseDemoProcessMediaCorrection(input),input);
 for(const bad of [{...input,businessId:46,handle:'demo-kora-ceramic-house'},
  {...input,handle:'different-showroom'},{...input,processVideoAfter:'demo:business-2'},
  {...input,processVideoBefore:'tiktok:7703762862484851981'},{...input,expectedStage:6},
  {...input,direction:'rollback'},{...input,extra:'unreviewed'}])assert.throws(()=>parseDemoProcessMediaCorrection(bad));
 const inverse={...input,direction:'rollback',operationKey:'reviewed_process_inverse_0001',
  processVideoBefore:input.processVideoAfter,processVideoAfter:input.processVideoBefore};
 assert.deepEqual(parseDemoProcessMediaCorrection(inverse),inverse);
});

test('BE-049 finite media plans preserve image positions and reject changed authority, duplicate targets and extra videos',()=>{
const beforeMedia=[{kind:'image',ref:'/uploads/seed/example.jpg'},{kind:'video',ref:'youtube:wJV9EDe_sFc'}];
const input={kind:'media_correction',operationKey:'reviewed_media_0001',businessId:1,handle:'example-demo',ownerUserId:2,
 providerUserId:'01234567-1234-1234-1234-012345678901',expectedHash:'a'.repeat(64),
 expectedContentVersion:4,expectedDraftVersion:3,expectedPageRevision:3,
 coverBefore:'https://www.youtube.com/watch?v=wJV9EDe_sFc',coverVideoRef:'youtube:EBrvynBWYzY',
 products:[{productId:1,beforeMedia,afterMedia:[beforeMedia[0],{kind:'video',ref:'youtube:EBrvynBWYzY'}]}]};
assert.equal(parseDemoMediaCorrection(input).products.length,1);
const bad=[{...input,enabled:1},{...input,expectedHash:'x'},{...input,expectedContentVersion:0},
 {...input,coverVideoRef:'javascript:alert(1)'},{...input,products:[input.products[0],input.products[0]]},
 {...input,products:[{...input.products[0],afterMedia:[{kind:'image',ref:'/uploads/seed/foreign.jpg'},input.products[0].afterMedia[1]]}]},
 {...input,products:[{...input.products[0],afterMedia:[input.products[0].afterMedia[1],beforeMedia[0]]}]},
 {...input,products:[{...input.products[0],afterMedia:[...input.products[0].afterMedia,{kind:'video',ref:'youtube:NJMPGgcDylY'}]}]},
 {...input,coverVideoRef:'youtube:wJV9EDe_sFc',products:[{productId:1,beforeMedia,afterMedia:beforeMedia}]}];
for(const value of bad)assert.throws(()=>parseDemoMediaCorrection(value));
const noVideo=[beforeMedia[0]];
assert.equal(parseDemoMediaCorrection({...input,products:[{productId:1,beforeMedia:noVideo,afterMedia:input.products[0].afterMedia}]}).products[0].afterMedia.length,2);
assert.throws(()=>parseDemoMediaCorrection({...input,products:[{productId:1,beforeMedia:noVideo,afterMedia:[input.products[0].afterMedia[1],beforeMedia[0]]}]}));
});

test('BE-049 legacy demo media queue admits only exact synthetic target, gallery and inverse',()=>{
 const media=[{kind:'image',ref:'/uploads/seed/example.jpg'},{kind:'video',ref:'youtube:wJV9EDe_sFc'}];
 const slugs=['synthetic-50-cover',...[197,198,199,200].map(id=>`synthetic-50-product-${id}`)];
 for(const slug of slugs)DEMO_VIDEO_ASSETS[slug]={businessId:50,status:'approved',sha256:'a'.repeat(64)};
 try{
  const input={kind:'unenrolled_media_correction',direction:'apply',operationKey:'synthetic_legacy_50_01',
   businessId:50,handle:'demo-dara-clay-works',actorUserId:11,actorRole:'platform_admin',
   expectedContentVersion:4,expectedDraftVersion:3,expectedPageRevision:3,
   coverBefore:'https://www.youtube.com/watch?v=wJV9EDe_sFc',coverVideoRef:'demo:synthetic-50-cover',
   processVideoBefore:'tiktok:1234567890123456789',processVideoAfter:'demo:synthetic-50-cover',
   products:[197,198,199,200].map(productId=>({productId,beforeMedia:media,
    afterMedia:[media[0],{kind:'video',ref:`demo:synthetic-50-product-${productId}`}]}))};
  assert.equal(parseQueuedDemoMediaCorrection(input,50).businessId,50);
  assert.throws(()=>parseQueuedDemoMediaCorrection(input,62));
  for(const bad of [{...input,businessId:62},{...input,handle:'different'},
   {...input,actorRole:'client'},{...input,ownerUserId:11},
   {...input,processVideoBefore:'youtube:wJV9EDe_sFc'},
   {...input,processVideoAfter:'demo:business-62'},
   {...input,processVideoBefore:input.processVideoAfter},
   {...input,products:input.products.slice(1)},
   {...input,products:input.products.map((p,i)=>i? p:{...p,afterMedia:[{kind:'image',ref:'/uploads/seed/other.jpg'},p.afterMedia[1]]})},
   {...input,products:input.products.map((p,i)=>i? p:{...p,afterMedia:[...p.afterMedia,{kind:'video',ref:'youtube:EBrvynBWYzY'}]})},
   {...input,expectedStateHash:'b'.repeat(64)},
   {...input,extra:'unreviewed'}])assert.throws(()=>parseUnenrolledDemoMediaCorrection(bad));
  const rollback={...input,direction:'rollback',operationKey:'synthetic_legacy_50_02',
   coverBefore:'/videos/demo/synthetic-50-cover.mp4',coverVideoRef:'youtube:wJV9EDe_sFc',
   processVideoBefore:'demo:synthetic-50-cover',processVideoAfter:'tiktok:1234567890123456789',
   products:input.products.map(p=>({productId:p.productId,beforeMedia:p.afterMedia,afterMedia:p.beforeMedia}))};
  assert.equal(parseQueuedDemoMediaCorrection(rollback,50).kind,'unenrolled_media_correction');
 }finally{for(const slug of slugs)delete DEMO_VIDEO_ASSETS[slug];}
});
