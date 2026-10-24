const assert=require('node:assert/strict');
const fs=require('node:fs');
const crypto=require('node:crypto');
const {test}=require('node:test');
const sharp=require('sharp');

const files={
 listing:'docs/play-store/mirtpage/listing.json',
 requirements:'docs/play-store/mirtpage/requirements.json',
 presentation:'docs/play-store/mirtpage/presentation.json',
 campaign:'docs/marketing/mirtpage/campaign.json',
};
const material=Object.fromEntries(Object.entries(files).map(([key,file])=>[key,JSON.parse(fs.readFileSync(file,'utf8'))]));
const length=value=>[...value].length;
function keys(value,expected,label){assert.ok(value&&typeof value==='object'&&!Array.isArray(value),label);assert.deepEqual(Object.keys(value).sort(),[...expected].sort(),label+' schema');}
function copy(value,label){
 keys(value,['title','shortDescription','fullDescription','reviewStatus',...(value.interfaceLocale?['interfaceLocale']:[]),...(value.consoleLanguageStatus?['consoleLanguageStatus']:[]),...(Object.hasOwn(value,'consoleLocale')?['consoleLocale']:[]),...(value.note?['note']:[])],label);
 assert.ok(typeof value.title==='string'&&length(value.title)>0&&length(value.title)<=30,label+' title');assert.equal(value.title,'MirtPage');
 assert.ok(length(value.shortDescription)>0&&length(value.shortDescription)<=80,label+' short description');
 assert.ok(length(value.fullDescription)>0&&length(value.fullDescription)<=4000,label+' full description');
 assert.equal(value.reviewStatus,'draft_native_speaker_and_product_review_pending');
 assert.doesNotMatch(value.shortDescription+'\n'+value.fullDescription,/SuqPage|Suqpage|AfricMade|\b(?:#1|best app|verified stock|guaranteed delivery|instant reply|live GPS|real-time GPS|in-app business inbox|download now)\b/i,label+' claims/brand');
}
function validate(set){
 const {listing:l,requirements:r,presentation:p,campaign:c}=set;
 keys(l,['schemaVersion','status','brand','packageName','defaultLanguage','supportEmail','categorySuggestion','narrativeAuthority','website','privacyPolicyUrl','accountDeletionUrl','domainStatus','activeInterfaceLocales','listings','promotionalOnlyLocales','featureClaims','releaseGates','sourceState','sources'],'listing');
 keys(r,['schemaVersion','status','checkedAt','sources','textLimits','localePolicy','assets','contentRules','publicationPerformed'],'requirements');
 keys(p,['schemaVersion','status','brand','packageName','assetFilesCreated','artworkStatus','icon','featureGraphic','screens','capturePolicy','sources'],'presentation');
 keys(c,['schemaVersion','status','uploadReadiness','brand','packageName','narrativeAuthority','plannedDomain','domainStatus','publicSupportEmail','activeLocales','officialSocialAccounts','officialAccountStatus','publicDownloadUrl','googlePlayBadges','captions','publicationGates','publicationPerformed','mediaGenerated','translationStatus','sourceState'],'campaign');
 for(const draft of [l,r,p]){assert.equal(draft.schemaVersion,1);assert.equal(draft.status,'NOT_UPLOAD_READY');}
 for(const draft of [l,p,c]){assert.equal(draft.brand,'MirtPage');assert.equal(draft.packageName,'com.mirtpage.app');}
 assert.equal(l.defaultLanguage,'en-US');assert.equal(l.supportEmail,'marketvision.tech@gmail.com');assert.equal(c.publicSupportEmail,l.supportEmail);
 assert.equal(l.website,'https://mirtpage.com');assert.equal(l.privacyPolicyUrl,l.website+'/privacy');assert.equal(l.accountDeletionUrl,l.website+'/account-deletion');
 assert.equal(l.domainStatus,'dns_https_aliases_verified_old_primary_and_deployment_retained');assert.equal(c.domainStatus,l.domainStatus);
 assert.deepEqual(l.activeInterfaceLocales,['en','am','om']);assert.deepEqual(c.activeLocales,l.activeInterfaceLocales);
 assert.deepEqual(Object.keys(l.listings),['en-US','am']);assert.deepEqual(Object.keys(l.promotionalOnlyLocales),['om']);
 for(const [locale,entry]of Object.entries(l.listings)){copy(entry,locale);assert.equal(entry.consoleLanguageStatus,'documented_supported');assert.equal(entry.interfaceLocale,locale==='en-US'?'en':'am');}
 copy(l.promotionalOnlyLocales.om,'om promotional-only');assert.equal(l.promotionalOnlyLocales.om.consoleLocale,null);assert.equal(l.promotionalOnlyLocales.om.consoleLanguageStatus,'not_listed_in_official_store_translation_languages');
 assert.deepEqual(r.localePolicy.documentedListingCodes,{en:'en-US',am:'am'});assert.deepEqual(r.localePolicy.notDocumentedAsListingCode,['om']);
 assert.ok(Object.values(l.releaseGates).length>=8);assert.ok(Object.values(l.releaseGates).every(value=>value==='pending'));
 const sourceIds=['listing-fields','preview-assets','icon-design','listing-languages','listing-practice'];assert.deepEqual(r.sources.map(source=>source.id),sourceIds);
 for(const source of r.sources){const url=new URL(source.url);assert.ok(source.checkedAt<=r.checkedAt);if(source.id==='icon-design'){assert.equal(url.origin,'https://developer.android.com');assert.equal(url.pathname,'/distribute/google-play/resources/icon-design-specifications');}else{assert.equal(url.origin,'https://support.google.com');assert.match(url.pathname,/^\/googleplay\/android-developer\/answer\/\d+$/);}}
 assert.equal(r.sources.find(source=>source.id==='listing-languages').url,'https://support.google.com/googleplay/android-developer/answer/9844778?hl=en','Use listing translation support, not the Console UI language table.');
 assert.deepEqual(r.textLimits,{title:30,shortDescription:80,fullDescription:4000,assetAltText:140});
 assert.deepEqual([r.assets.icon.width,r.assets.icon.height,r.assets.icon.bitDepth,r.assets.icon.maxBytes],[512,512,32,1048576]);
 assert.deepEqual([r.assets.featureGraphic.width,r.assets.featureGraphic.height,r.assets.featureGraphic.pngBitDepth,r.assets.featureGraphic.alphaAllowed],[1024,500,24,false]);
 const image=r.assets.phoneScreenshots;assert.deepEqual([image.plannedCount,image.minimumCount,image.maximumPerDeviceType],[6,2,8]);assert.deepEqual([image.minimumDimension,image.maximumDimension,image.maximumAspectRatio],[320,3840,2]);
 assert.deepEqual([image.chosenWidth,image.chosenHeight,image.chosenOrientation,image.chosenAspect],[1080,1920,'portrait','9:16']);assert.ok(image.chosenHeight/image.chosenWidth<=image.maximumAspectRatio);assert.equal(image.alphaAllowed,false);
 assert.equal(p.artworkStatus,'owner_approved_logo_and_feature_graphics_exported_actual_android_screenshots_pending');
 assert.deepEqual(p.assetFilesCreated,['docs/play-store/mirtpage/assets/icon.png','docs/play-store/mirtpage/assets/feature-graphic-en.png','docs/play-store/mirtpage/assets/feature-graphic-am.png','docs/play-store/mirtpage/assets/feature-graphic-om-promo.png']);
 assert.equal(p.icon.file,p.assetFilesCreated[0]);assert.equal(p.icon.approved,true);assert.equal(p.featureGraphic.file,p.assetFilesCreated[1]);assert.equal(p.featureGraphic.approved,true);assert.equal(p.featureGraphic.ownerApprovedDirection,'charcoal');assert.ok(fs.existsSync(p.icon.sourceCandidate));
 assert.equal(r.assets.icon.status,'owner_approved_logo_export_ready');assert.equal(r.assets.featureGraphic.status,'owner_approved_charcoal_rgb24_exports_ready');
 for(const file of p.assetFilesCreated)assert.ok(fs.existsSync(file),'Missing review artwork '+file);
 assert.equal(p.screens.length,6);assert.equal(new Set(p.screens.map(screen=>screen.id)).size,6);
 for(const locale of ['en','am','om']){
  assert.equal(new Set(p.screens.map(screen=>screen.alt[locale])).size,6,'Unique '+locale+' alt text');
  assert.equal(new Set(p.screens.map(screen=>screen.headlines[locale])).size,6,'Distinct '+locale+' headlines');
  assert.equal(typeof p.featureGraphic.headlines[locale],'string');assert.ok(length(p.featureGraphic.headlines[locale])<=48);
  for(const screen of p.screens){assert.equal(typeof screen.headlines[locale],'string');assert.ok(length(screen.headlines[locale])>0&&length(screen.headlines[locale])<=48,screen.id+' headline');assert.equal(typeof screen.alt[locale],'string');assert.ok(length(screen.alt[locale])>0&&length(screen.alt[locale])<=140,screen.id+' alt');}
 }
 for(const screen of p.screens){assert.equal(screen.captureFile,null);assert.equal(screen.frameFile,null);assert.equal(screen.captureStatus,'required_actual_app');assert.deepEqual(screen.localeFiles,{en:null,am:null,om:null});assert.ok(screen.route.startsWith('/'));}
 assert.equal(p.capturePolicy.syntheticOrGeneratedScreensAllowed,false);assert.equal(p.capturePolicy.privateDataAllowed,false);assert.equal(p.capturePolicy.approvedDemoContentOnly,true);assert.equal(p.capturePolicy.newAppCapture,'pending');assert.ok(p.capturePolicy.omUse.startsWith('promotional_only'));
 assert.equal(c.schemaVersion,1);assert.equal(c.status,'NOT_PUBLISHED');assert.equal(c.uploadReadiness,'NOT_UPLOAD_READY');assert.equal(c.publicationPerformed,false);assert.equal(c.mediaGenerated,false);assert.equal(r.publicationPerformed,false);
 assert.equal(c.publicDownloadUrl,null);assert.deepEqual(c.googlePlayBadges,[]);assert.ok(Object.values(c.officialSocialAccounts).every(value=>value===null));assert.equal(c.officialAccountStatus,'handles_unverified_no_posts_published_by_this_draft');
 assert.equal(c.translationStatus,'draft_native_speaker_review_pending');assert.deepEqual(Object.keys(c.captions),['en','am','om']);
 for(const [locale,entries]of Object.entries(c.captions)){
  keys(entries,['visitor','business','transport','comingSoon','cta'],'caption '+locale);
  for(const text of Object.values(entries)){assert.equal(typeof text,'string');assert.ok(length(text)>0&&length(text)<=1100);assert.doesNotMatch(text,/SuqPage|Suqpage|https?:\/\/|\b(?:available now|download now|guaranteed delivery|verified stock|#1|best app)\b/i);}
 }
 assert.equal(p.screens.find(screen=>screen.id==='04-discovery').headlines.en,'Find businesses near and far.');
 assert.match(c.captions.en.visitor,/without digging through social posts/);
 assert.match(c.captions.am.visitor,/ልጥፎችን ሳይፈትሹ/);
 assert.match(c.captions.om.visitor,/Maxxansa miidiyaa hawaasaa.*osoo hin barbaadin/);
 const english=l.listings['en-US'].fullDescription;for(const idea of ['digital showroom','brand','story','collections','retailers','workshops','factories','farms','suppliers','social','ready to ship','made to order','Availability','email','MirtPage Inbox','Shipment records'])assert.ok(english.includes(idea),'Narrative: '+idea);
 for(const [locale,entry] of [['en',l.listings['en-US']],['am',l.listings.am],['om',l.promotionalOnlyLocales.om]]){
  const texts=[entry.fullDescription,c.captions[locale].transport,p.screens.find(screen=>screen.id==='06-transport').alt[locale]];
  const activeName={en:'Shipment records',am:'ጭነት መዝገቦች',om:'Galmeewwan feʼumsaa'}[locale];
  for(const text of texts)assert.ok(text.includes(activeName),locale+' uses active tracking name');
  assert.ok(entry.fullDescription.includes('MirtPage Inbox'),locale+' names the direct business inquiry');
  assert.doesNotMatch(texts.join('\n'),/Shipment tracking|የጭነት ክትትል|Hordoffii feʼumsaa|Ask our transport team|ከቡድናችን ጋር|garee keenya|አስተባባሪ|qindeessaan/i,locale+' retired transport or tracking copy');
  assert.doesNotMatch(texts.join('\n'),/shipment plans?|የጭነት ዕቅድ|karoora fe['’ʼ]umsaa/i,locale+' retired plan wording');
 }
 assert.deepEqual(l.featureClaims.map(claim=>claim.id),['digital-showrooms','map-and-product-search','listed-availability','external-social-handoff','transport-chat','independent-email-tracking']);
 for(const claim of l.featureClaims){assert.ok(claim.evidence.length);for(const file of claim.evidence)assert.ok(fs.existsSync(file),'Evidence file '+file);}
 // These unpublished MirtPage drafts are retained as a historical review.
 // AfricMade now has a different product narrative and launcher icon.
 const authorityHash='ec83db1eb7b0095d3e74eac51f2a68003e56f251ba13449ab81f23c600bfe38e';
 for(const authority of [l.narrativeAuthority,c.narrativeAuthority]){assert.equal(authority.file,'lib/storefront-copy.ts');assert.equal(authority.sha256,authorityHash,'Narrative source changed; review these drafts.');assert.equal(authority.headline,'Find local makers and suppliers for your next order.');}
}

test('FE-070/DEP-049 archived MirtPage listing, artwork and campaign remain honest unuploaded drafts',()=>validate(material));
test('Play artwork exports have required dimensions, color modes and canonical icon bytes',async()=>{
 const {presentation:p,requirements:r}=material;
 const icon=fs.readFileSync(p.icon.file);assert.equal(crypto.createHash('sha256').update(icon).digest('hex'),'9d5bb745293959dba28b42d62967489fbb1d7c9a1b83bec8afb2aa5fd909aedd','Archived MirtPage icon must stay frozen');
 const iconMeta=await sharp(icon).metadata();assert.deepEqual([iconMeta.width,iconMeta.height,iconMeta.channels],[r.assets.icon.width,r.assets.icon.height,4]);assert.ok(icon.length<=r.assets.icon.maxBytes);assert.equal(r.assets.icon.shape,'full_square');
 const {data,info}=await sharp(icon).raw().toBuffer({resolveWithObject:true});for(const [x,y] of [[0,0],[info.width-1,0],[0,info.height-1],[info.width-1,info.height-1]])assert.equal(data[(y*info.width+x)*info.channels+3],255,'Play icon corners must be full-bleed for Google masking');
 for(const file of p.assetFilesCreated.slice(1)){const meta=await sharp(file).metadata();assert.deepEqual([meta.width,meta.height,meta.channels],[1024,500,3],file);}
 assert.equal(crypto.createHash('sha256').update(fs.readFileSync(p.featureGraphic.file)).digest('hex'),p.featureGraphic.defaultSha256);
});
test('Character limits reject overlong localized title, short description, full description and alt text',()=>{
 for(const [field,max,message]of [['title',30,/am title/],['shortDescription',80,/am short description/],['fullDescription',4000,/am full description/]]){const changed=structuredClone(material);changed.listing.listings.am[field]='የ'.repeat(max+1);assert.throws(()=>validate(changed),message);}
 const changed=structuredClone(material);changed.presentation.screens[0].alt.om='x'.repeat(141);assert.throws(()=>validate(changed),/01-showroom alt/);
});
test('App Oromo support cannot silently become an undocumented Play Console listing locale',()=>{
 for(const change of [set=>{set.listing.listings.om=set.listing.promotionalOnlyLocales.om;},set=>{set.listing.promotionalOnlyLocales.om.consoleLocale='om';},set=>{set.requirements.localePolicy.documentedListingCodes.om='om';}]){const changed=structuredClone(material);change(changed);assert.throws(()=>validate(changed));}
});
test('Fabricated screenshots, generated media, live badges/links, handles and false readiness are rejected',()=>{
 for(const change of [set=>{set.presentation.screens[0].captureFile='generated-screen.png';},set=>{set.presentation.capturePolicy.syntheticOrGeneratedScreensAllowed=true;},set=>{set.campaign.mediaGenerated=true;},set=>{set.campaign.googlePlayBadges=['play-badge.png'];},set=>{set.campaign.publicDownloadUrl='https://play.google.com/store/apps/details?id=com.mirtpage.app';},set=>{set.campaign.officialSocialAccounts.instagram='@invented';},set=>{set.listing.status='UPLOAD_READY';},set=>{set.listing.releaseGates.nativeSpeakerReview='approved';}]){const changed=structuredClone(material);change(changed);assert.throws(()=>validate(changed));}
});
test('Old app identity and invented stock/delivery capabilities cannot enter current visible drafts',()=>{
 for(const change of [set=>{set.listing.packageName='com.suqpage.app';},set=>{set.campaign.brand='Suqpage';},set=>{set.listing.listings['en-US'].fullDescription+=' Verified stock and guaranteed delivery.';},set=>{set.campaign.captions.en.comingSoon='Available now. Download now.';},set=>{set.listing.featureClaims.push({id:'gps-live-map',evidence:['lib/tracking.ts']});}]){const changed=structuredClone(material);change(changed);assert.throws(()=>validate(changed));}
});
test('Narrative drift, duplicate alt text, a changed public support email or unknown schema fields require review',()=>{
 for(const change of [set=>{set.listing.narrativeAuthority.sha256='0'.repeat(64);},set=>{set.presentation.screens[1].alt.en=set.presentation.screens[0].alt.en;},set=>{set.listing.supportEmail='invented@mirtpage.com';},set=>{set.campaign.publishImmediately=true;}]){const changed=structuredClone(material);change(changed);assert.throws(()=>validate(changed));}
});
test('Visitor captions retain the social-post clutter benefit in all three active languages',()=>{
 for(const locale of ['en','am','om']){const changed=structuredClone(material);changed.campaign.captions[locale].visitor='MirtPage';assert.throws(()=>validate(changed));}
});
