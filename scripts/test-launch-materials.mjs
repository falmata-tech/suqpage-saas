import assert from 'node:assert/strict';
import fs from 'node:fs';
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
assert.match(listing.listings['en-US'].fullDescription,/See how close the businesses selling products you’ve loved on social media are to you/);
assert.match(listing.listings['en-US'].fullDescription,/Browse their products, styles and services in organized online stores/);
assert.match(listing.listings['en-US'].fullDescription,/Add the models, colors and styles you offer to your item details/);
assert.match(listing.listings['en-US'].fullDescription,/For customers/);
assert.match(listing.listings['en-US'].fullDescription,/For businesses/);
assert.match(listing.listings['en-US'].fullDescription,/does not provide an online checkout/);
assert.equal(campaign.destination,listing.website);
assert.equal(campaign.androidState,'coming_soon');
assert.equal(campaign.accountsState,'owner_will_create');
assert.deepEqual(Object.keys(campaign.locales).sort(),['am','en','om','so','ti']);
for(const [locale,item] of Object.entries(campaign.locales)){
 assert.ok(item.tiktokBio.length<=80&&item.instagramBio.length<=150,locale+' conservative bio budgets');
 for(const key of ['hook','ownerHook','android'])assert.ok(item[key].length>=1&&item[key].length<=3&&item[key].every(s=>typeof s==='string'&&s.trim()));
 for(const key of ['visitorCaption','businessCaption','transportCaption']){
  assert.ok(item[key].includes('suqpage.com'));
  assert.doesNotMatch(item[key],unsupportedClaims);
  if(locale!=='en')assert.notEqual(item[key],campaign.locales.en[key],locale+' contextual copy');
 }
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
console.log('PASS launch copy: exact SuqPage identity, truthful collection narrative, five contextual campaign locales, store limits and unpublished release boundaries.');
