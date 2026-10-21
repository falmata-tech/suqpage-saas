import assert from 'node:assert/strict';
import { SCALE_DEMO_BUSINESSES } from '../lib/scale-demo-seed';
import { simplifyDemoOffering } from '../lib/simple-demo-offering';

const business = (handle: string) => {
  const found = SCALE_DEMO_BUSINESSES.find(row => row.handle === handle);
  assert.ok(found, `Missing maintained demo ${handle}`);
  return found;
};

const kaffa = business('demo-kaffa-mill-workshop');
const shaft = kaffa.offerings[0];
assert.equal(shaft.name, 'Replacement Mill Shaft');
assert.equal(shaft.category, 'Mill parts');
assert.equal(shaft.kind, 'made_to_order');
assert.equal(shaft.description, 'A replacement shaft machined to the mill’s approved dimensions.');
assert.equal(shaft.imagePath, '/uploads/seed/portfolio/demo-kaffa-mill-workshop/product-1.webp');
assert.equal(simplifyDemoOffering(shaft).kind, 'made_to_order');
assert.doesNotMatch(
  [kaffa.tagline, kaffa.description, kaffa.heroSubtitle, ...kaffa.brief.process.items].join(' '),
  /\b(?:repairs?|rebuild|diagnostics?)\b/i,
  'The workshop must advertise physical parts rather than a repair visit.',
);
assert.equal(kaffa.offerings[1].category, shaft.category, 'The shaft and hopper share one category spelling.');
const categoryNames = [...new Set(kaffa.offerings.map(offering => offering.category))];
assert.equal(new Set(categoryNames.map(name => name.toLowerCase())).size, categoryNames.length);

// Resolve the actual maintained small-scale output, rather than the superseded
// raw factory tuples that use the same stable business handle and media slots.
const netsa = business('demo-netsa-hygiene-products');
for (const [index, name, category] of [
  [0, 'Washable Baby Cloth Set', 'Baby care'],
  [1, 'Reusable Menstrual Pad Set', 'Personal care'],
] as const) {
  const offering = netsa.offerings[index];
  assert.equal(offering.name, name);
  assert.equal(offering.category, category);
  assert.equal(simplifyDemoOffering(offering).kind, 'standard_product');
  assert.equal(offering.imagePath, `/uploads/seed/portfolio/${netsa.handle}/product-${index + 1}.webp`);
}

const physicalSlots = [
  ['demo-lume-solar-repair', 0, 'Courtyard Solar Lamp'],
  ['demo-lume-solar-repair', 1, 'Market Stall Light Kit'],
  ['demo-tana-radio-works', 0, 'Compact PA Speaker'],
  ['demo-tana-radio-works', 1, 'Floor Monitor Cabinet'],
  ['demo-desta-appliance-repair', 0, 'Household Injera Stove'],
  ['demo-desta-appliance-repair', 1, 'Cafe Injera Stove'],
  ['demo-desta-appliance-repair', 2, 'Countertop Hotplate'],
  ['demo-orbit-meter-workshop', 0, 'Analog Panel Ammeter'],
  ['demo-orbit-meter-workshop', 1, 'Water Level Display'],
  ['demo-bale-equipment-repair', 0, 'Field Hoe Head'],
  ['demo-bale-equipment-repair', 1, 'Compact Grain Hopper'],
  ['demo-bale-equipment-repair', 2, 'Pulley Guard Set'],
] as const;
for (const [handle, index, name] of physicalSlots) {
  const offering = business(handle).offerings[index];
  assert.equal(offering.name, name);
  assert.ok(['standard_product', 'made_to_order'].includes(simplifyDemoOffering(offering).kind));
  assert.doesNotMatch(offering.name, /\b(?:repair|diagnostic|rebuild|service)\b/i);
}

const ammeter = business('demo-orbit-meter-workshop').offerings[0];
assert.equal(ammeter.category, 'Instruments');
assert.equal(ammeter.kind, 'standard_product');
assert.equal(ammeter.description, 'An analog panel meter for compatible electrical equipment. Ask the workshop about the required range and connections.');
assert.equal(ammeter.imagePath, '/uploads/seed/portfolio/demo-orbit-meter-workshop/product-1.webp');
for (const fixture of SCALE_DEMO_BUSINESSES) {
  const names = fixture.offerings.map(offering => offering.name.trim().toLowerCase());
  assert.equal(new Set(names).size, names.length, `Duplicate product name in ${fixture.handle}`);
}

console.log('PASS DEP-046: authored physical replacements, stable fixture slots, category identity and actual Netsa kinds.');
