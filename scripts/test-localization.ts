import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import {TRANSPORT_COPY} from '../lib/i18n/transport-copy';
import {REPORT_REASONS} from '../lib/catalog-safety';
import { createUiText, languageNames, locales, messageKey, parseLocale, type UiMessages } from '../lib/i18n/core';

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
test('FE-049: only supported cookie values select a catalog', () => {
  for (const locale of locales) assert.equal(parseLocale(locale), locale);
  for (const input of [null, undefined, {}, 'AM', 'ar', '../secrets', 'am; Path=/', '', '<script>']) assert.equal(parseLocale(input), 'en');
  assert.deepEqual(locales, ['en', 'am', 'om', 'so', 'ti']);
  assert.equal(languageNames.om, 'Afaan Oromo');
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
  const brand=fs.readFileSync('components/SuqpageBrand.tsx','utf8');
  assert.ok(brand.includes('<span>suq</span><span>page</span>'));
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
  const privacy='Suqpage stores account details, page content, product inquiries, and support conversations to operate the service and help customers contact the relevant seller.';
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
  const { MARKET_STOREFRONT_COPY, ABOUT_STOREFRONT_SECTIONS, CUSTOMER_MAP_COPY } = await import('../lib/storefront-copy');
  const { clientMessages } = await import('../lib/i18n/client-messages');
  const values: string[] = [...Object.values(MARKET_STOREFRONT_COPY), ...Object.values(CUSTOMER_MAP_COPY)];
  for (const section of ABOUT_STOREFRONT_SECTIONS) {
    values.push(section.label, section.title, section.description, section.action);
    for (const benefit of section.benefits) values.push(benefit.title, benefit.description);
  }
  for (const locale of locales.filter(value => value !== 'en')) {
    const client = clientMessages(catalogs[locale]);
    for (const value of values) assert.ok(client[messageKey(value)], `${locale}: ${value}`);
  }
});


test('FE-019/FE-049 S71: transport invitation keeps a recognizable Live Chat label', () => {
  for (const locale of locales) {
    const t = createUiText(catalogs[locale]);
    const label = t('Live Chat');
    if (locale === 'en') assert.equal(label, 'Live Chat');
    else {
      assert.ok(label.endsWith(' (Live Chat)'), locale);
      assert.ok(label.length > ' (Live Chat)'.length, 'Native chat wording stays visible');
    }
    assert.ok(t(TRANSPORT_COPY.launcherSubtitle).includes(locale === 'en' ? 'live' : '(Live Chat)'));
    for (const source of [...Object.values(TRANSPORT_COPY), 'Goods or transport details (optional)', 'View products', 'Hide products']) {
      assert.ok(t(source).trim());
      if (locale !== 'en') assert.notEqual(t(source), source, locale + ': contextual wording');
    }
  }
});
