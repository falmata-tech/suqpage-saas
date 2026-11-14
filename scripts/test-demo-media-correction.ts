import assert from 'node:assert/strict';
import {parseDemoMediaCorrection} from '../lib/demo-media-correction';

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
console.log('PASS BE-049 finite demo media admission: exact fields, canonical providers, bounded distinct products, preserved image positions, no extra videos or empty correction.');
