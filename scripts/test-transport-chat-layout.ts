import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {createUiText} from '../lib/i18n/core';
import {TRANSPORT_COPY,OWNER_TRANSPORT_COPY} from '../lib/i18n/transport-copy';

test('FE-076/S162: transport copy is professional and distinguishes general help from the selected provider',()=>{
  assert.equal(TRANSPORT_COPY.launcherTitle,'Need Transport?');
  assert.match(TRANSPORT_COPY.launcherSubtitle,/live transport agent/i);
  assert.match(TRANSPORT_COPY.description,/pickup and destination/i);
  assert.match(TRANSPORT_COPY.description,/live transport agent/i);
  assert.doesNotMatch([TRANSPORT_COPY.launcherTitle,TRANSPORT_COPY.launcherSubtitle,TRANSPORT_COPY.description].join(' '),/SharedTrucks Logistics|MirtPage.?s transport team/i);
  assert.match(TRANSPORT_COPY.waiting,/live agent/i);
  assert.match(TRANSPORT_COPY.waiting,/SharedTrucks live agent/i);
  assert.doesNotMatch(Object.values(TRANSPORT_COPY).join(' '),/coordinator/i);
  assert.match(TRANSPORT_COPY.callbackHeading,/helping other customers/i);
  assert.match(TRANSPORT_COPY.callbackSubmit,/contact details/i);
  assert.doesNotMatch(OWNER_TRANSPORT_COPY.description,/SharedTrucks Logistics|MirtPage.?s transport team/i);
  assert.match(OWNER_TRANSPORT_COPY.description,/live transport agent/i);
  for(const locale of ['am','om']){
    const t=createUiText(JSON.parse(readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
    assert.notEqual(t(TRANSPORT_COPY.launcherSubtitle),TRANSPORT_COPY.launcherSubtitle,`${locale}: launcher is localized`);
    assert.notEqual(t(TRANSPORT_COPY.description),TRANSPORT_COPY.description,`${locale}: intake is localized`);
    assert.notEqual(t(TRANSPORT_COPY.waiting),TRANSPORT_COPY.waiting,'waiting state is localized');
    assert.notEqual(t(TRANSPORT_COPY.callbackDescription),TRANSPORT_COPY.callbackDescription,'callback is localized');
  }
});

test('FE-076: provider-listing promotion stays outside the transport chat and is linked from About',async()=>{
  const [webIntake,mobileChat,webAbout,mobileAbout,login]=await Promise.all([
    readFile('components/TransportIntake.tsx','utf8'),
    readFile('apps/mobile/app/buying.tsx','utf8'),
    readFile('components/AboutAudience.tsx','utf8'),
    readFile('apps/mobile/app/(tabs)/about.tsx','utf8'),
    readFile('app/(public)/login/page.tsx','utf8'),
  ]);
  assert.doesNotMatch(webIntake,/transport-partners|Ask to be listed/i);
  assert.doesNotMatch(mobileChat,/transport-partners|Ask to be listed/i);
  assert.match(webAbout,/href="\/transport-partners"/);
  assert.match(mobileAbout,/router\.navigate\('\/transport-partners'\)/);
  assert.match(login,/href="\/transport-partners"/);
});

test('FE-076: phone layouts reserve the viewport for the chat and keep scrolling inside the relevant region',async()=>{
  const [globalCss,moduleCss,conversationCss,conversation,mobileNav]=await Promise.all([
    readFile('app/landing.css','utf8'),
    readFile('components/TransportSupport.module.css','utf8'),
    readFile('components/BuyingConversation.module.css','utf8'),
    readFile('apps/mobile/app/buying.tsx','utf8'),
    readFile('apps/mobile/src/main-navigation.tsx','utf8'),
  ]);
  assert.match(globalCss,/visualViewport|support-visible-height/);
  assert.match(globalCss,/height:\s*var\(--support-visible-height,100dvh\)/);
  assert.match(moduleCss,/\.intakeArea\s*\{[^}]*overflow-y:auto/);
  assert.match(moduleCss,/\.conversationBody\s*\{[^}]*overflow:hidden/);
  assert.match(conversationCss,/\.fitViewport\s*\{[^}]*flex:1 1 0%[^}]*min-height:0/);
  assert.match(conversationCss,/\.history\s*\{[^}]*overflow-y:auto/);
  assert.match(conversation,/Screen scroll=\{!showingConversation\|\|shortViewport\}/);
  assert.match(conversation,/scrollEnabled=\{!shortViewport\}/);
  assert.match(conversation,/transcriptRef=.*ScrollView/);
  assert.match(mobileNav,/if\(path==='\/buying'\)return null/);
});
