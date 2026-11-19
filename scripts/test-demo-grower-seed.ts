import assert from 'node:assert/strict';
import {AGRICULTURE_CORRECTION_TARGETS} from '../lib/demo-category-correction';
import {SEEDED_MARKETPLACE_PROFILES} from '../lib/marketplace-seed';

const reviewed = AGRICULTURE_CORRECTION_TARGETS.map(target => target.handle).sort();
const dualListed = Object.entries(SEEDED_MARKETPLACE_PROFILES)
  .filter(([, profile]) => profile.industryKeys.includes('agriculture-growers') && profile.industryKeys.includes('food-farming'))
  .map(([handle]) => handle).sort();
assert.deepEqual(dualListed, reviewed, 'only the six reviewed growers receive both category memberships');
for (const handle of reviewed) {
  assert.deepEqual(SEEDED_MARKETPLACE_PROFILES[handle]?.industryKeys, ['agriculture-growers', 'food-farming']);
}
for (const handle of ['demo-laga-grain-mill', 'demo-wabi-flour-mill']) {
  assert.deepEqual(SEEDED_MARKETPLACE_PROFILES[handle]?.industryKeys, ['food-farming'], `${handle} stays Food-primary`);
}
console.log('PASS exact six dual-listed grower seed profiles and two Food-only mills.');
