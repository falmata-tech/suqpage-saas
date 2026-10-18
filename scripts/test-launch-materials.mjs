import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
// FE-070/DEP-049: com.mirtpage.app is a separate app. These retained SuqPage
// sources include stale, unuploaded old-app drafts; they do not follow current
// MirtPage UI copy or locale catalogs. Check the new app independently with
// scripts/test-mirtpage-draft-materials.cjs. Do not rewrite historical materials.
const legacyNarrative={
 title:'Discover businesses through their digital showrooms.',
 description:'See what businesses sell, make or grow—without digging through social posts. Browse products, choices and listed availability, then message the business directly.',
};
const frozenOldAppSources={
 'docs/play-store/listing.json':'8cdd9d5e8a762a2982a708d7c9ee0a2d9516f16e5f4c261532ccc9f52ead43c9',
 'docs/play-store/presentation.json':'675e31f050c2efa2f9f1e88bb826fc18a37be5bd6d81ee90930232ad4c36806d',
 'docs/marketing/coming-soon-copy.json':'a83ba3268598811abfd70d5f5923a8ed7ac7d758c313bdbdec82f73074f636b3',
 'docs/marketing/campaign-plan.json':'79883f624a876ca56263869517643ef97566b189151ac49809eaa191efdcacd9',
};
for(const [file,hash]of Object.entries(frozenOldAppSources))assert.equal(createHash('sha256').update(fs.readFileSync(file)).digest('hex'),hash,file+' retained old-app source changed');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const listing=read('docs/play-store/listing.json');
const presentation=read('docs/play-store/presentation.json');
const campaign=read('docs/marketing/coming-soon-copy.json');
const plan=read('docs/marketing/campaign-plan.json');
assert.equal(listing.packageName,'com.suqpage.app');
assert.equal(listing.supportEmail,'marketvision.tech@gmail.com');
assert.equal(listing.website,'https://suqpage.com');
assert.deepEqual(Object.keys(listing.listings).sort(),['am','en-US']);
const unsupportedClaims=/million downloads|#1|guaranteed (?:sales|stock|transport)|download now|install now|TikTok Shop|pre-register now|coming \d|free plan|subscription plan/i;
for(const [locale,item] of Object.entries(listing.listings)){
 assert.equal(item.title,'SuqPage');
 assert.ok(item.title.length<=30&&item.shortDescription.length<=80&&item.fullDescription.length<=4000,locale+' copy limits');
 assert.doesNotMatch(item.shortDescription,/\n|[★☆]/);
 assert.doesNotMatch(item.fullDescription,unsupportedClaims);
 assert.ok(item.fullDescription.includes('SuqPage'));
}
assert.ok(listing.listings['en-US'].fullDescription.startsWith(legacyNarrative.title+' '+legacyNarrative.description));
assert.match(listing.listings['en-US'].fullDescription,/Browse products, choices and listed availability/);
assert.match(listing.listings['en-US'].fullDescription,/business’s social account/);
assert.match(listing.listings['en-US'].fullDescription,/describe your production capacity and lead times in your product details/);
assert.doesNotMatch(JSON.stringify([listing,presentation,campaign]),/See how close the businesses selling products|Products you loved|Businesses nearby\./);
assert.equal(presentation.narrative,campaign.narrative);
assert.equal(presentation.narrative,legacyNarrative.title);
assert.ok(listing.listings['en-US'].fullDescription.startsWith(campaign.narrative));
assert.match(listing.listings['en-US'].fullDescription,/Add the models, colors and styles you offer to your product details/);
assert.match(listing.listings['en-US'].fullDescription,/For customers/);
assert.match(listing.listings['en-US'].fullDescription,/For businesses/);
assert.match(listing.listings['en-US'].fullDescription,/does not provide an online checkout/);
assert.equal(campaign.destination,listing.website);
assert.doesNotMatch(JSON.stringify([listing,presentation,campaign]), /products (?:and|&) services|products, collections and services|provide a service|product and service search/i);
assert.match(listing.listings['en-US'].fullDescription,/ready to ship or made after the customer orders/);
assert.equal(campaign.androidState,'coming_soon');
assert.equal(campaign.accountsState,'owner_will_create');
assert.deepEqual(Object.keys(campaign.locales).sort(),['am','en','om','so','ti'],'Inactive drafts are retained, not promoted');
assert.deepEqual(campaign.activeLanguages,['en','am','om']);
assert.deepEqual(plan.languages.order,['am','om','en']);
assert.match(listing.listings['en-US'].fullDescription,/English, Amharic or Afaan Oromo\./);
assert.doesNotMatch(listing.listings['en-US'].fullDescription,/Somali or Tigrinya/);
for(const document of[listing,presentation,campaign])assert.match(document.reviewNotes,/STALE/);
for(const [locale,item] of Object.entries(campaign.locales)){
 assert.ok(item.tiktokBio.length<=80&&item.instagramBio.length<=150,locale+' conservative bio budgets');
 for(const key of ['hook','ownerHook','android'])assert.ok(item[key].length>=1&&item[key].length<=3&&item[key].every(s=>typeof s==='string'&&s.trim()));
 for(const key of ['visitorCaption','businessCaption','transportCaption']){
  assert.ok(item[key].includes('suqpage.com'));
  assert.doesNotMatch(item[key],unsupportedClaims);
  if(locale!=='en')assert.notEqual(item[key],campaign.locales.en[key],locale+' contextual copy');
 }
 // Frozen source hashes preserve these exact old-language drafts; current
 // MirtPage translations must not become their retrospective authority.
}
for(const [locale,item] of Object.entries(presentation.locales)){
 assert.ok(item.feature.length<=3&&item.screens.length>=4&&item.screens.length<=8);
 assert.equal(new Set(item.screens.map(s=>s.id)).size,item.screens.length);
 for(const screen of item.screens){assert.ok(screen.alt.trim()&&screen.alt.length<=140);assert.ok(screen.headline.length>=1&&screen.headline.length<=2);}
 assert.doesNotMatch(JSON.stringify(item),unsupportedClaims);
}
assert.equal(plan.status,'assets_prepared_not_published');
assert.ok(plan.releaseBoundaries.some(s=>s.includes('14 continuous days')));
assert.ok(plan.publishSteps.some(s=>s.includes('disclosure')));
assert.ok(plan.publishSteps.some(s=>s.includes('unlicensed')));
assert.ok(!JSON.stringify(plan).includes('apps/internaltest/'));
console.log('PASS retained SuqPage old-app materials: frozen source hashes, exact identity/narrative, feature and copy-limit checks, retained language drafts and unpublished boundaries. New MirtPage drafts have a separate gate.');
