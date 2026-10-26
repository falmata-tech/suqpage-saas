import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import {TRANSPORT_COPY,OWNER_TRANSPORT_COPY,LOGISTICS_PROVIDER_COPY} from '../lib/i18n/transport-copy';
import {REPORT_REASONS} from '../lib/catalog-safety';
import {credentialStorageKeys} from '../apps/mobile/src/credential-storage-keys';
import { createUiText, languageNames, locales, enabledLocales, messageKey, parseLocale, type UiMessages } from '../lib/i18n/core';

const catalogs = Object.fromEntries(locales.map(locale => [locale, locale === 'en' ? {} : JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`, 'utf8')) as UiMessages]));
test('FE-063: dynamic report reasons have native labels in every non-English catalog', () => {
  for (const locale of locales.filter(value => value !== 'en')) {
    const t = createUiText(catalogs[locale]);
    for (const reason of REPORT_REASONS) {
      assert.ok(catalogs[locale][messageKey(reason)], `${locale}: ${reason}`);
      assert.notEqual(t(reason), reason, `${locale}: reason must not silently fall back to English`);
    }
  }
});
test('FE-049 S132: enabled preferences are distinct from retained compatibility catalogs', () => {
  for (const locale of enabledLocales) assert.equal(parseLocale(locale), locale);
  for (const input of ['so','ti','aa','afar',null, undefined, {}, 'AM', 'ar', '../secrets', 'am; Path=/', '', '<script>']) assert.equal(parseLocale(input), 'en');
  assert.deepEqual(locales, ['en', 'am', 'om', 'so', 'ti']);
  assert.deepEqual(enabledLocales, ['en','am','om']);
  assert.equal(languageNames.om, 'Afaan Oromo');
});
test('FE-070: active AfricMade labels preserve the literal brand and compatibility identifiers', () => {
  for(const locale of enabledLocales){
    const t=createUiText(catalogs[locale]);
    for(const label of ['AfricMade home','About AfricMade','Sign in to AfricMade.','AfricMade support','Delete your AfricMade account']){
      assert.ok(t(label).includes('AfricMade'),`${locale}: ${label}`);
      assert.doesNotMatch(t(label),/Suqpage|SuqPage/);
      if(locale!=='en')assert.notEqual(t(label),label,`${locale}: authored interface label`);
    }
  }
  const runtime=fs.readFileSync('apps/mobile/src/runtime.tsx','utf8');
  assert.ok(runtime.includes('X-Suqpage-Buying-Session'));
  assert.deepEqual(credentialStorageKeys(false,'https://mirtpage.com'),{
    owner:'suqpage-owner-session',transport:'suqpage-transport',
  });
  const channels=fs.readFileSync('apps/mobile/src/attention-platform.native.ts','utf8');
  for(const id of ['suqpage-alerts','suqpage-alerts-quiet'])assert.ok(channels.includes(id));
  assert.ok(channels.includes("name:'AfricMade'"));
  assert.ok(fs.readFileSync('lib/i18n/core.ts','utf8').includes('suqpage-language'));
});
test('FE-070/BE-044: brand compatibility follows the scoped credential port and rejects legacy runtime wiring', () => {
  const runtime=fs.readFileSync('apps/mobile/src/runtime.tsx','utf8');
  const assertScopedConsumer=(source:string)=>{
    assert.match(source,/import\s*\{\s*credentialStorageKeys\s*\}\s*from\s*["']\.\/credential-storage-keys["']/);
    assert.match(source,/const credentialKeys\s*=\s*credentialStorageKeys\(typeof __DEV__ !== ["']undefined["'] && __DEV__, API, authUrl\)/);
    assert.match(source,/export const ownerStorageKey\s*=\s*credentialKeys\.owner/);
    assert.match(source,/export const transportStorageKey\s*=\s*credentialKeys\.transport/);
    assert.match(source,/storageKey:\s*ownerStorageKey/);
  };
  assertScopedConsumer(runtime);
  // A producer export alone is insufficient: reject an SDK or storage consumer
  // that quietly returns to the old shared production key.
  for(const [from,to] of [
    ['storageKey: ownerStorageKey','storageKey: "suqpage-owner-session"'],
    ['ownerStorageKey = credentialKeys.owner','ownerStorageKey = "suqpage-owner-session"'],
    ['transportStorageKey = credentialKeys.transport','transportStorageKey = "suqpage-transport"'],
  ]){
    assert.ok(runtime.includes(from),'The negative fixture must alter the actual runtime consumer');
    assert.throws(()=>assertScopedConsumer(runtime.replace(from,to)),assert.AssertionError);
  }
  const local=credentialStorageKeys(true,'http://127.0.0.1:3102','http://127.0.0.1:54321');
  const production=credentialStorageKeys(false,'https://mirtpage.com');
  assert.notEqual(local.owner,production.owner);assert.notEqual(local.transport,production.transport);
  assert.notEqual(local.owner,credentialStorageKeys(true,'http://127.0.0.1:3102','https://other-auth.example.test').owner);
  assert.notEqual(local.transport,credentialStorageKeys(true,'http://127.0.0.1:3112','http://127.0.0.1:54321').transport);
});
test('FE-049/FE-070 S154: sign-in entry is role-neutral on web and native',async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  for(const path of ['app/(public)/login/page.tsx','apps/mobile/app/(tabs)/account.tsx']){
    const source=fs.readFileSync(path,'utf8');
    assert.match(source,/Sign in to AfricMade\./);
    assert.match(source,/Use your email to sign in or create an account\./);
    assert.doesNotMatch(source,/Your business\. Your digital showroom\.|Create a showroom for your business story|New business\? Enter your email/);
  }
  assert.match(fs.readFileSync('app/(public)/login/page.tsx','utf8'),/Enter your email to get started\./);
  for(const locale of ['am','om'] as const){
    const t=createUiText(clientMessages(catalogs[locale]));
    for(const label of ['Sign in to AfricMade.','Use your email to sign in or create an account.']){
      assert.notEqual(t(label),label,`${locale}: role-neutral native entry is authored`);
      assert.doesNotMatch(t(label),/ንግድ|daldal|showroom/i,'Entry copy does not restrict account access to business owners');
    }
    assert.notEqual(createUiText(catalogs[locale])('Enter your email to get started.'),'Enter your email to get started.');
  }
});
test('FE-070 S146: active account-deletion and staff notices keep AfricMade in Amharic and Afaan Oromo', async () => {
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const labels=[
    'Send your request from the email you use to sign in. Include your page handle, if you have one.',
    'Staff accounts sign in on the website.',
  ];
  for(const locale of ['am','om'] as const){
    const selected=clientMessages(catalogs[locale]);
    for(const label of labels){
      assert.ok(selected[messageKey(label)],`${locale}: notice reaches the web/Expo client`);
      const text=createUiText(selected)(label);
      assert.match(text,/AfricMade/,`${locale}: active brand`);
      assert.doesNotMatch(text,/Suqpage|SuqPage/,`${locale}: no previous brand`);
      assert.notEqual(text,label,`${locale}: authored native notice`);
    }
  }
});
test('FE-049: fallback and literal interpolation preserve customer text', () => {
  for (const locale of locales) {
    const t = createUiText(catalogs[locale]);
    const name = 'Save {value2} <script> አበበ & Market';
    assert.ok(t('View {value1}', {value1: name}).includes(name));
    assert.equal(t('Unknown technical term'), 'Unknown technical term');
    assert.equal(t('Untranslated {value1}', {value1: name}), `Untranslated ${name}`);
    assert.equal(createUiText(catalogs[locale]), t, 'Stable references avoid unnecessary imperative map refreshes');
  }
  assert.equal(createUiText(catalogs.en)('Save'), 'Save');
  assert.notEqual(createUiText(catalogs.am)('Save'), 'Save');
});
test('FE-073: fresh sign-in action is authored in active mobile locales', async () => {
  const { clientMessages } = await import('../lib/i18n/client-messages');
  for (const locale of ['am', 'om'] as const) {
    const client = clientMessages(catalogs[locale]);
    const label = createUiText(client)('Sign in again');
    assert.ok(client[messageKey('Sign in again')], `${locale}: action reaches Expo`);
    assert.notEqual(label, 'Sign in again', `${locale}: no English fallback after changing email`);
  }
});
test('FE-049: catalogs have identical keys, no empty translations and bounded selected payloads', () => {
  const reference = Object.keys(catalogs.am).sort();
  assert.ok(reference.length >= 500);
  for (const locale of locales.filter(value => value !== 'en')) {
    assert.deepEqual(Object.keys(catalogs[locale]).sort(), reference);
    assert.ok(Object.values(catalogs[locale]).every(value => typeof value === 'string' && value.trim()));
    assert.ok(Buffer.byteLength(JSON.stringify(catalogs[locale])) < 300_000, `${locale} catalog payload budget`);
  }
  const sources = fs.readFileSync('locales/interface.tsv','utf8').trim().split('\n').map(line=>line.split('\t')[0]);
  assert.equal(new Set(sources.map(messageKey)).size, sources.length, 'No message-key collisions');
});
test('FE-049: platform branding, machine values and content boundaries stay separate', () => {
  const brand=fs.readFileSync('components/AfricMadeBrand.tsx','utf8');
  assert.ok(brand.includes('PLATFORM_BRAND'));
  assert.ok(brand.includes('AfricMade home'));
  const inquiry=fs.readFileSync('app/dashboard/inquiries/page.tsx','utf8');
  for(const value of ['new','contacted','confirmed','closed','cancelled']) assert.ok(inquiry.includes(`<option value="${value}">{t("${value}")}</option>`));
  for(const file of ['components/showroom/BusinessProfile.tsx','components/showroom/ProductPage.tsx']){
    const code=fs.readFileSync(file,'utf8');
    assert.doesNotMatch(code,/t\((?:product|business)\.(?:name|description|tagline|handle)\)/);
    assert.doesNotMatch(code,/t\((?:group\.name|value\.value|feature)\)/);
  }
  const control=fs.readFileSync('components/LanguageSelector.tsx','utf8');
  assert.ok(control.includes('parseLocale(event.target.value)'));
  assert.ok(control.includes('router.refresh()'));
  assert.doesNotMatch(control,/location\.(assign|replace)|router\.(push|replace)/);
});

test('FE-049: every explicit UI message is translated or has a reviewed fallback', async () => {
  const ts=await import('typescript');
  const fallbacks=JSON.parse(fs.readFileSync('locales/english-fallbacks.json','utf8')) as Record<string,string>;
  const missing:string[]=[];
  for(const root of ['app','components','apps/mobile/app','apps/mobile/src'])for(const name of fs.readdirSync(root,{recursive:true}) as string[]){
    if(!name.endsWith('.tsx'))continue;
    const file=`${root}/${name}`,source=fs.readFileSync(file,'utf8');
    const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
    function visit(node: import('typescript').Node){
      if(ts.isCallExpression(node)&&node.expression.getText(ast)==='t'&&node.arguments[0]&&ts.isStringLiteral(node.arguments[0])){
        const value=node.arguments[0].text;
        if(!catalogs.am[messageKey(value)]&&!fallbacks[value])missing.push(`${file}: ${value}`);
      }
      ts.forEachChild(node,visit);
    }
    visit(ast);
  }
  assert.deepEqual(missing,[],'Add an intentional translation or explain a retained English term');
});
test('FE-049: server-only copy is excluded from client messages', async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const selected=clientMessages(catalogs.am);
  assert.equal(selected[messageKey('Save')],catalogs.am[messageKey('Save')]);
  const privacy='AfricMade stores account details, business page content, support and transport conversations, and shipment-record information to operate the service.';
  assert.ok(catalogs.am[messageKey(privacy)]);
  assert.equal(selected[messageKey(privacy)],undefined);
  assert.ok(Object.keys(selected).length<Object.keys(catalogs.am).length);
});

test('FE-052: shared starter and publication-checklist messages reach every client catalog', async () => {
  const { STARTER_NOTICE, starterPage } = await import('../lib/business-starter');
  const { publicationReadiness } = await import('../lib/publication-readiness');
  const { clientMessages } = await import('../lib/i18n/client-messages');
  // These keys come from shared values rather than literal t() calls in JSX.
  // The starter reminder previously escaped the explicit-call coverage check.
  const messages = [STARTER_NOTICE, ...publicationReadiness(starterPage, [], false).map(check => check.label)];
  for (const locale of locales.filter(value => value !== 'en')) {
    const selected = clientMessages(catalogs[locale]);
    for (const message of messages) assert.ok(selected[messageKey(message)], `${locale}: ${message}`);
  }
});

test('FE-052: both storefront audiences and Market use complete client-safe catalogs', async () => {
  const { MARKET_STOREFRONT_COPY, MARKET_COMPACT_COPY, ABOUT_STOREFRONT_SECTIONS, CUSTOMER_MAP_COPY } = await import('../lib/storefront-copy');
  const { clientMessages } = await import('../lib/i18n/client-messages');
  const values: string[] = [...Object.values(MARKET_STOREFRONT_COPY), ...Object.values(MARKET_COMPACT_COPY), ...Object.values(CUSTOMER_MAP_COPY)];
  for (const section of ABOUT_STOREFRONT_SECTIONS) {
    values.push(section.label, section.title, section.description, section.action);
    for (const benefit of section.benefits) values.push(benefit.title, benefit.description);
  }
  for (const locale of locales.filter(value => value !== 'en')) {
    const client = clientMessages(catalogs[locale]);
    for (const value of values) assert.ok(client[messageKey(value)], `${locale}: ${value}`);
  }
  // FE-070 presents African suppliers to both individual and business buyers.
  // Coverage checks authored meaning and client delivery, not independent fluency.
  assert.match(MARKET_STOREFRONT_COPY.title,/African farmers, manufacturers, and artisans in one place/i);
  assert.match(MARKET_STOREFRONT_COPY.description,/production capacity for bulk purchase or small orders/i);
  assert.match(MARKET_STOREFRONT_COPY.description,/without getting lost searching through their social media posts/i);
  assert.match(ABOUT_STOREFRONT_SECTIONS[0].description,/without piecing everything together from social posts/i);
  for (const locale of ['am','om'] as const) {
    const t=createUiText(catalogs[locale]), title=t(MARKET_STOREFRONT_COPY.title);
    assert.doesNotMatch(title,/ኢንተርኔት|intarneet|interneet/i);
    assert.match(title,locale==='am'?/አፍሪካ.*ያግኙ/:/Afrikaa.*argadhaa/);
    assert.match(t(MARKET_STOREFRONT_COPY.description),locale==='am'?/ጅምላ.*ማኅበራዊ ሚዲያ/:/gurguddaa.*miidiyaa hawaasaa/);
    assert.match(t(ABOUT_STOREFRONT_SECTIONS[0].description),locale==='am'?/ማኅበራዊ ሚዲያ/:/miidiyaa hawaasaa/);
    assert.notEqual(t(MARKET_STOREFRONT_COPY.description),MARKET_STOREFRONT_COPY.description);
    for(const section of ABOUT_STOREFRONT_SECTIONS){
      assert.notEqual(t(section.description),section.description);
      assert.doesNotMatch(t(section.description),/Suqpage|SuqPage|ኢንተርኔት|intarneet|interneet/i);
    }
    for(const benefit of ABOUT_STOREFRONT_SECTIONS[1].benefits){
      assert.notEqual(t(benefit.description),benefit.description,`${locale}: inclusive supporting copy is authored`);
    }
  }
});

test('FE-065 S181: compact discovery and filter navigation have authored active-language client messages', async () => {
  const {MARKET_COMPACT_COPY} = await import('../lib/storefront-copy');
  const {clientMessages} = await import('../lib/i18n/client-messages');
  assert.equal(MARKET_COMPACT_COPY.title, 'Find African suppliers.');
  for (const locale of enabledLocales) {
    const t = createUiText(catalogs[locale]);
    const title = t(MARKET_COMPACT_COPY.title);
    const count = t('Filters, {count} selected', {count: 2});
    assert.match(count, /2/);
    assert.doesNotMatch(count, /\{count\}/);
    if (locale !== 'en') {
      const client = clientMessages(catalogs[locale]);
      for (const message of [MARKET_COMPACT_COPY.title, 'Back to filters', 'Filters, {count} selected']) {
        assert.ok(client[messageKey(message)], `${locale}: ${message} reaches the interactive client`);
        assert.notEqual(t(message), message, `${locale}: authored active-language discovery copy`);
      }
      assert.match(title, locale === 'am' ? /አፍሪካ.*አቅራቢ/ : /Dhiyeessitoota.*Afrikaa/);
    }
  }
});

test('FE-049 S101: inquiries select items, publication describes visibility, and handles name the page', () => {
  // These checks protect the distinctions that the wording audit found unclear;
  // they do not claim to measure fluency or replace first-language user review.
  const concepts = {
    am: { select: 'ለመጠየቅ', selected: 'የመረጡትን', customers: 'ደንበኞች', page: 'ገጽ' },
    om: { select: 'Gaafachuuf', selected: 'filattan', customers: 'maamiltootaaf', page: 'fuulaa' },
    so: { select: 'weydiiso', selected: 'dooratay', customers: 'macaamiisha', page: 'bogga' },
    ti: { select: 'ንምሕታት', selected: 'ዝመረጽኩምዎ', customers: 'ዓማዊል', page: 'ገጽ' },
  };
  for (const [locale, words] of Object.entries(concepts)) {
    const t = createUiText(catalogs[locale]);
    assert.ok(t('Add to inquiry list').includes(words.select), `${locale}: choose to ask, not purchase`);
    assert.equal(t('Add to bag'), t('Add to inquiry list'), `${locale}: legacy alias has the same meaning`);
    assert.ok(t('View inquiry list').includes(words.selected), `${locale}: view the selected items`);
    assert.ok(t('Publish page').includes(words.customers), `${locale}: make visible to customers`);
    assert.ok(t('Page handle').includes(words.page) && t('Page handle').includes('@handle'), `${locale}: public page name`);
    assert.notEqual(t('Resolved'), t('Closed'), `${locale}: solved and ended are distinct`);
    assert.notEqual(t('Account'), t('Page'), `${locale}: private account and public page are distinct`);
    assert.equal(t('Assigned to {value1}', { value1: 'Market <test> አበበ' }).includes('Market <test> አበበ'), true);
  }
});

test('FE-049 S101: owner activity labels and interpolated platform nouns reach localized clients', async () => {
  const {OWNER_ACTIVITY_METRICS} = await import('../lib/i18n/owner-activity-copy');
  const {clientMessages} = await import('../lib/i18n/client-messages');
  for (const locale of locales.filter(value => value !== 'en')) {
    const client = clientMessages(catalogs[locale]), t = createUiText(client);
    for (const label of [...OWNER_ACTIVITY_METRICS.map(metric => metric.label), 'product', 'service', 'item', 'items']) {
      assert.ok(client[messageKey(label)], `${locale}: dynamic platform label ${label}`);
      assert.notEqual(t(label), label, `${locale}: no English leak for ${label}`);
    }
    const inquiry = t('Inquire about this {value1}', {value1: t('product')});
    assert.ok(inquiry.includes(t('Product')));
    assert.doesNotMatch(inquiry, /\bproduct\b/);
    for (const label of ['Contacted', 'Confirmed', 'Cancelled']) {
      assert.ok(client[messageKey(label)], `${locale}: capitalized native inquiry status`);
      assert.equal(t(label), t(label.toLowerCase()), `${locale}: status casing does not lose localization`);
    }
  }
  for (const file of ['app/dashboard/profile/page.tsx', 'apps/mobile/src/owner-profile.tsx']) {
    assert.ok(fs.readFileSync(file, 'utf8').includes('OWNER_ACTIVITY_METRICS.map'));
  }
  const composer = fs.readFileSync('components/showroom/ShowroomApp.tsx', 'utf8');
  assert.ok(composer.includes('value1: t(cart[0] ? offeringNoun'));
  assert.ok(composer.includes('t(productSupplyLabel(selected.offering_kind, selected.availability))'));
  // S112 no longer presents historical machine kinds as active supply choices.
  assert.doesNotMatch(composer, /value1: t\(line\.product\.offering_kind/);
});

test('FE-067/FE-049 S112: supply choices and honest availability reach every client catalog', async()=>{
  const {productSupplyLabel}=await import('../lib/offerings');
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const supplyLabels=new Set(['standard_product','made_to_order','manufacturing_capability'].flatMap(kind=>
    ['available','limited','unavailable','coming_soon'].map(availability=>productSupplyLabel(kind,availability))));
  for(const locale of locales.filter(value=>value!=='en')){
    const client=clientMessages(catalogs[locale]),t=createUiText(client);
    for(const label of [...supplyLabels,'How is this product supplied?','Retired listing','Add product','Edit product']){
      assert.ok(client[messageKey(label)],`${locale}: active product meaning ${label}`);
      assert.notEqual(t(label),label,`${locale}: no untranslated supply or retirement label`);
    }
    assert.notEqual(t('Ready to ship'),t('Made to order'));
    assert.notEqual(t('Products'),t('Services'),'Historical service labels keep their meaning');
  }
  assert.equal(productSupplyLabel('standard_product','unavailable'),'Unavailable');
  assert.equal(productSupplyLabel('made_to_order','unavailable'),'Not accepting orders');
  assert.equal(productSupplyLabel('manufacturing_capability','available'),'Available','Legacy kinds do not infer ready stock');
});

test('FE-041/FE-036 S113: floating selections and transport chat have distinct localized client labels',async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  for(const locale of locales.filter(value=>value!=='en')){
    const client=clientMessages(catalogs[locale]),t=createUiText(client);
    for(const label of ['Inquiry list','Transport chat']){
      assert.ok(client[messageKey(label)],`${locale}: floating label must reach the client`);
      assert.notEqual(t(label),label);
    }
    assert.notEqual(t('Inquiry list'),t('Inquiry'),'The selected-goods list is distinct from a question');
    assert.notEqual(t('Inquiry list'),t('Transport chat'));
    const count=t('View inquiry list, {value1} {value2}',{value1:2,value2:t('items')});
    assert.ok(count.includes('2')&&count.includes(t('items')));
  }
});

test('FE-019/FE-053/FE-056 S114: owner transport introduction and Account task reach localized clients',async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const ownerLabels=[OWNER_TRANSPORT_COPY.invitation,OWNER_TRANSPORT_COPY.description,...Object.values(LOGISTICS_PROVIDER_COPY)];
  for(const locale of enabledLocales.filter(value=>value!=='en')){
    const client=clientMessages(catalogs[locale]),t=createUiText(client);
    for(const label of [...ownerLabels,'Transport chat','Chat history','Back to account','Transport request was not found.','A client account is required.','No conversations yet.']){
      assert.ok(client[messageKey(label)],`${locale}: owner transport wording must reach the client`);
      assert.notEqual(t(label),label,`${locale}: owner transport stays native-readable`);
    }
    assert.notEqual(t(ownerLabels[0]),t(TRANSPORT_COPY.invitation),'Business transport is distinct from the visitor purchase introduction');
    assert.notEqual(t(ownerLabels[1]),t(TRANSPORT_COPY.description));
  }
});


test('FE-076 S162: transport chat copy offers route help and names the selected provider only in the active chat', () => {
  for (const locale of locales) {
    const t = createUiText(catalogs[locale]);
    assert.equal(TRANSPORT_COPY.launcherTitle, 'Need Transport?');
    assert.ok(t(TRANSPORT_COPY.launcherTitle).trim());
    if (locale !== 'en' && enabledLocales.some(enabled=>enabled===locale)) assert.notEqual(t(TRANSPORT_COPY.launcherTitle), TRANSPORT_COPY.launcherTitle);
    assert.match(TRANSPORT_COPY.launcherSubtitle,/live transport agent/i);
    assert.match(TRANSPORT_COPY.description,/pickup and destination/i);
    assert.match(TRANSPORT_COPY.description,/live transport agent/i);
    assert.doesNotMatch([TRANSPORT_COPY.launcherTitle,TRANSPORT_COPY.launcherSubtitle,TRANSPORT_COPY.description].join(' '),/Shared Trucks Freight|SharedTrucks Logistics|AfricMade.?s transport team/i);
    assert.match(TRANSPORT_COPY.waiting,/live agent/i);
    assert.match(TRANSPORT_COPY.waiting,/live agent at \{value1\}/i);
    assert.match(TRANSPORT_COPY.countdown,/\{value1\} left/i);
    assert.match(TRANSPORT_COPY.callbackHeading,/\{value1\}.*helping other customers/i);
    assert.match(TRANSPORT_COPY.callbackDescription,/phone number and optional email/i);
    assert.match(TRANSPORT_COPY.callbackSubmit,/contact details/i);
    for (const source of [...Object.values(TRANSPORT_COPY), 'Goods or transport details (optional)', 'View products', 'Hide products']) {
      assert.ok(t(source).trim());
      if (locale !== 'en' && enabledLocales.some(enabled=>enabled===locale)) assert.notEqual(t(source), source, locale + ': contextual wording');
    }
  }
});

test('FE-049/FE-052 S132/S133: active copy explains products, social inquiry and moving goods',async()=>{
  const {MARKET_STOREFRONT_COPY,ABOUT_STOREFRONT_SECTIONS}=await import('../lib/storefront-copy');
  const {clientMessages}=await import('../lib/i18n/client-messages');
  for(const locale of enabledLocales){
    const t=createUiText(clientMessages(catalogs[locale]));
    const publicWords=[MARKET_STOREFRONT_COPY.title,MARKET_STOREFRONT_COPY.description,...Object.values(TRANSPORT_COPY),...ABOUT_STOREFRONT_SECTIONS.flatMap(section=>[section.title,section.description])];
    for(const text of publicWords){assert.ok(t(text).trim());if(locale!=='en')assert.notEqual(t(text),text,`${locale}: active conceptual copy is translated`);}
    assert.notEqual(t('Ready to ship'),t('Made to order'));
    assert.notEqual(t('Inquiry list'),t('Support'));
    assert.notEqual(t('Account'),t('Your page'));
  }
  const am=createUiText(catalogs.am),om=createUiText(catalogs.om);
  // Check the authored concepts independently of sentence order; these are
  // meaning/coverage regressions, not a claim of native-language human review.
  assert.match(am(MARKET_STOREFRONT_COPY.title),/አፍሪካ.*ያግኙ/);
  assert.match(om(MARKET_STOREFRONT_COPY.title),/Afrikaa.*argadhaa/);
  for(const term of ['ጅምላ','አነስተኛ','ማቅረብ','ማኅበራዊ ሚዲያ'])assert.ok(am(MARKET_STOREFRONT_COPY.description).includes(term),`am: ${term}`);
  for(const term of ['xixiqqaa','gurguddaa','dhiheessuu','miidiyaa hawaasaa'])assert.ok(om(MARKET_STOREFRONT_COPY.description).includes(term),`om: ${term}`);
  assert.match(am(ABOUT_STOREFRONT_SECTIONS[0].description),/ማኅበራዊ ሚዲያ/);
  assert.match(om(ABOUT_STOREFRONT_SECTIONS[0].description),/miidiyaa hawaasaa/);
  // About adds supplier context beyond the compact owner-approved Market sentence.
  const amAbout=ABOUT_STOREFRONT_SECTIONS.map(section=>[section.description,...section.benefits.map(benefit=>benefit.description)].map(text=>am(text)).join(' ')).join(' ');
  const omAbout=ABOUT_STOREFRONT_SECTIONS.map(section=>[section.description,...section.benefits.map(benefit=>benefit.description)].map(text=>om(text)).join(' ')).join(' ');
  for(const term of ['እርሻ','ወርክሾፕ','ፋብሪካ','ቤት','ሱቅ','ገዢዎች'])assert.ok(amAbout.includes(term),`am About: ${term}`);
  for(const term of ['qonna','mana hojii','warsha','mana keessaa','suuqii','bitattoota'])assert.match(omAbout,new RegExp(term,'i'),`om About: ${term}`);
  assert.match(am(TRANSPORT_COPY.launcherTitle),/ማጓጓዣ/);
  assert.match(om(TRANSPORT_COPY.launcherTitle),/geejjiba/i);
  for(const locale of ['am','om'] as const){
    const localized=createUiText(catalogs[locale]);
    assert.ok(localized(TRANSPORT_COPY.description).length>40);
    assert.doesNotMatch(localized(TRANSPORT_COPY.description),/Shared Trucks Freight|AfricMade.?s transport team/i);
    const waiting=localized(TRANSPORT_COPY.waiting);
    assert.ok(waiting.length>30);
    assert.match(waiting,/\{value1\}/);
    assert.doesNotMatch(waiting,/AfricMade.?s transport team/i);
  }
});

test('FE-075/FE-076/FE-049 S154: received inquiries and partner interest have distinct active client copy',async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const labels=['Send an inquiry','Choose how to contact','Send on WhatsApp','Send on Telegram','Copy contact','Select and copy the contact details.','Send to AfricMade Inbox','Your name','Phone number','Your message','Inbox','Open inquiry','Inquiry sent to the business.','The business can contact you using the phone number you provided.','Other ways to contact','For independent logistics service providers','Get listed on AfricMade','Freight brokerages, parcel express companies, and hub-and-spoke logistics operators can ask to be listed on AfricMade. Tell us about your company and we’ll contact you.','Logistics service providers: Ask to be listed','Company name','Contact name','About your company','Phone (optional)','Request received. We’ll contact you about the next steps.',"Check your name.","Check a message.","Check desired quantity.","Enter your name.","Enter a message.","A selected product is not available.","A selected product option is not available.","Choose all available product options.","Too many inquiries. Please try again later.","Too many inquiry attempts. Please try again later.","This inquiry key was already used for a different request."];
  for(const locale of ['am','om'] as const){
    const t=createUiText(clientMessages(catalogs[locale]));
    for(const label of labels)assert.notEqual(t(label),label,`${locale}: ${label}`);
    assert.notEqual(t('Open inquiry'),t('View inquiry list'),'Opening one received inquiry is distinct from the visitor selection list');
    assert.notEqual(t('Send inquiry'),t('Start chat'),'Async business inquiry does not borrow live support chat wording');
    assert.notEqual(t('Inbox'),t('Support'),'Business inquiries remain separate from platform Support');
    assert.notEqual(t('Company name'),t('Contact name'),'Applicant company and human contact remain distinct');
    const channels=['Send on WhatsApp','Send on Telegram','Send to AfricMade Inbox'];
    assert.equal(new Set(channels.map(label=>t(label))).size,3,'Equal choices name distinct destinations');
    channels.forEach((label,index)=>assert.ok(t(label).includes(['WhatsApp','Telegram','AfricMade'][index]),'Destination brands stay recognizable'));
    const complete=createUiText(catalogs[locale]);
    assert.notEqual(complete('Inquiry details'),'Inquiry details','Server-rendered web inquiry detail remains localized');
  }
});

test('FE-026/FE-056/FE-053 S115: focused management sections and unsaved actions reach every client catalog',async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const sections=['Page content','Appearance','Sharing and access'];
  const labels=[...sections,'Social accounts','Business contacts','Back to your page','Your changes have not been saved.','Keep editing','Discard changes','Remove this category?','Edit category'];
  for(const locale of locales.filter(value=>value!=='en')){
    const client=clientMessages(catalogs[locale]),t=createUiText(client);
    for(const label of labels){
      assert.ok(client[messageKey(label)],`${locale}: focused management wording must reach web and native clients`);
      assert.notEqual(t(label),label,`${locale}: no English fallback for ${label}`);
    }
    assert.equal(new Set(sections.map(label=>t(label))).size,sections.length,'Different management sections remain distinguishable');
    assert.notEqual(t('Social accounts'),t('Business contacts'),'Social handles and other public contact details are distinct');
    assert.notEqual(t('Keep editing'),t('Discard changes'),'Unsaved confirmation choices must not share an ambiguous label');
    const complete=createUiText(catalogs[locale]);
    for(const label of ['Owner sign-in','Products stay in your catalog without a category.','No assignment history yet.']){
      assert.ok(catalogs[locale][messageKey(label)],`${locale}: server-rendered administration copy`);
      assert.notEqual(complete(label),label);
    }
    assert.notEqual(complete('Owner sign-in'),complete('Sign in'),'Owner account management is distinct from a sign-in action');
    assert.notEqual(complete('Business identity'),complete('Business details'),'The name/logo task stays distinct from its parent settings section');
  }
});

test('FE-066/FE-041 S118: inbox handoffs and device-storage failures have native client wording',async()=>{
  const {clientMessages}=await import('../lib/i18n/client-messages');
  const labels=['Message the business','Your message and selected products are copied before the conversation opens. Paste them if needed.','Message copied. Paste it in the conversation if needed.','Telegram username or phone number','Enter a Telegram username or phone number with its country code.','Your inquiry list is available for this visit, but could not be saved on this device. Try again.'];
  for(const locale of locales.filter(value=>value!=='en')){
    const client=clientMessages(catalogs[locale]),t=createUiText(client);
    for(const label of labels){assert.ok(client[messageKey(label)],`${locale}: ${label}`);assert.notEqual(t(label),label);}
    assert.notEqual(t('Message the business'),t('Your message'),'The destination action remains distinct from the draft label');
  }
});


// Child metadata replaces the entire parent Open Graph object in installed Next.
// Exercise actual route exports so a root-only brand declaration cannot mask a
// missing siteName on a child route. Catalog/local API components are inert ports.
test('FE-070: localized Market and About metadata retain the explicit AfricMade Open Graph identity', async()=>{
  const [{build},{createRequire},{default:vm}]=await Promise.all([import('esbuild'),import('node:module'),import('node:vm')]);
  const require=createRequire(import.meta.url);
  const {MARKET_STOREFRONT_COPY}=await import('../lib/storefront-copy');
  for(const file of ['app/(public)/page.tsx','app/(public)/about/page.tsx']){
    const result=await build({entryPoints:[file],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',plugins:[{name:'metadata-localization-ports',setup(b){
      b.onResolve({filter:/^@\//},args=>['@/lib/storefront-copy','@/lib/public-seo'].includes(args.path)?{path:process.cwd()+args.path.slice(1)+'.ts'}:{path:args.path,namespace:'metadata-port'});
      // The real SEO helpers are pure for metadata; their unused profile fallback
      // imports public-contact fixtures with module-level validation side effects.
      b.onResolve({filter:/^\.\/business-profile$/},args=>args.importer.endsWith('/lib/public-seo.ts')?{path:'seo-profile-port',namespace:'metadata-port'}:undefined);
      b.onLoad({filter:/.*/,namespace:'metadata-port'},args=>({loader:'js',contents:args.path==='@/lib/i18n/server'?'export const getUiText=async()=>globalThis.__text;':args.path==='@/lib/blocked-businesses-server'?'export function readExcludedBusinesses(){throw Error("Unexpected preferences read during metadata");}':args.path==='seo-profile-port'?'export const businessProfileDescription=()=>"";':'export default function Unused(){return null};export const MarketWorkspaceLoading=Unused;export function getIndependentPublicMarketplace(){throw Error("Unexpected catalog read");}export function readMarketSearch(){throw Error("Unexpected search read");}export class MarketSearchError extends Error{};'}));
    }}]});
    for(const locale of enabledLocales){
      const t=createUiText(catalogs[locale]),module={exports:{} as {generateMetadata:()=>Promise<{title:string|{absolute:string};description:string;alternates:{canonical:string};openGraph:{title:string;description:string;siteName:string;url:string;images:string[]};twitter:{title:string;description:string;card:string}}>}};
      vm.runInNewContext(result.outputFiles[0].text,{module,exports:module.exports,require,URL,__text:t,process:{env:{NEXT_PUBLIC_APP_URL:'https://mirtpage.test'}}});
      const metadata=await module.exports.generateMetadata(),title=t(file.includes('/about/')?'About AfricMade':MARKET_STOREFRONT_COPY.title),description=t(MARKET_STOREFRONT_COPY.description);
      if(file.includes('/about/')){
        assert.equal(typeof metadata.title,'object');assert.equal((metadata.title as {absolute:string}).absolute,title);
      }else assert.equal(metadata.title,title);
      assert.equal(metadata.description,description);
      assert.equal(metadata.openGraph.siteName,'AfricMade');assert.equal(metadata.openGraph.title,title);assert.equal(metadata.openGraph.description,description);
      const path=file.includes('/about/')?'/about':'/';
      assert.equal(metadata.alternates.canonical,`https://mirtpage.test${path}`);
      assert.equal(metadata.openGraph.url,metadata.alternates.canonical);
      assert.equal(metadata.openGraph.images[0],'https://mirtpage.test/pwa/africmade-icon-v4-512.png');
      assert.equal(metadata.twitter.title,title);assert.equal(metadata.twitter.description,description);
      assert.equal(metadata.twitter.card,'summary_large_image');
      assert.doesNotMatch(JSON.stringify(metadata),/Suqpage|SuqPage/);
    }
  }
});
