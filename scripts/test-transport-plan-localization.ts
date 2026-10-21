import assert from 'node:assert/strict';
import fs from 'node:fs';
import test from 'node:test';
import {createUiText} from '../lib/i18n/core';

test('FE-068 transport actions, methods and stages have authored active-language labels',()=>{
 const keys=['Shipment tracking','View shipment tracking','Back to conversation','Edit shipment','Add leg','Provider name','Transport method','Choose a transport method','Air','Truck','Van','Car','Motorcycle','Save plan','Copy plan link','Replace plan link','Providers in travel order','This transport plan is unavailable.','Provider tracking link (optional)','Provider tracking code (optional)','Add the provider’s own tracking link or code, if available.','Tracking code','Copy code','Open provider tracking','Opens the provider’s website.','Could not copy. Select the code above and copy it.','Enter a valid HTTPS tracking link.','Use a provider tracking code of 120 characters or fewer.'];
 for(const locale of ['am','om']){
  const t=createUiText(JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
  // Historical catalog compatibility only; active Tracking still requires email verification.
  const retained='Transport plan links show the route and transport providers to anyone who receives the link. They do not include chat messages or account contact details.';
  assert.notEqual(t(retained),retained);
  for(const key of keys){assert.notEqual(t(key),key,`${locale}: ${key}`);assert.ok(t(key).trim());}
  for(const count of [1,3,12]){const label=t('{count} transport stages',{count});assert.ok(label.includes(String(count)));assert.ok(!label.includes('{count}'));}
  assert.ok(t('Stage {number}',{number:2}).includes('2'));
 }
});
