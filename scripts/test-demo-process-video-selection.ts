import assert from 'node:assert/strict';
import {test} from 'node:test';
import {demoProcessVideoFor} from '../lib/demo-process-videos';
import {categoryExampleVideo} from '../lib/category-starter';
import {SCALE_DEMO_BUSINESSES} from '../lib/scale-demo-seed';

test('each of the 66 showroom identities has an explicit video choice', () => {
  const handles = ['selam-weave', 'afia-botanics', 'warka-furniture', 'addis-metalworks',
    'green-terrace-farm', 'blue-nile-apiary', 'rift-valley-mill', 'entoto-ceramics',
    'koba-leather', 'nova-assembly', ...SCALE_DEMO_BUSINESSES.map(business => business.handle)];
  const choices = handles.map(handle => demoProcessVideoFor(handle));
  assert.equal(new Set(handles).size, 66);
  assert.ok(choices.every(choice => choice.ref && choice.family !== 'unknown'));
  assert.ok(choices.some(choice => choice.ref.startsWith('tiktok:')));
  assert.ok(choices.some(choice => choice.ref.startsWith('youtube:')));
});

test('unknown demo names and broad industry keys cannot pick a video', () => {
  for (const handle of ['north-supply', 'food-farming', 'new-grain-mill', 'constructor']) {
    assert.equal(demoProcessVideoFor(handle).ref, '');
  }
  assert.equal(categoryExampleVideo('not-a-category'), '');
  assert.equal(categoryExampleVideo(undefined), '');
});

test('known showroom identities select the actual craft even when an old handle suggests another', () => {
  const expected = {
    'demo-desta-appliance-repair': 'youtube:lDsyioF3Qfs',
    'demo-kaffa-mill-workshop': 'youtube:cdwhD-0Uwps',
    'demo-bale-equipment-repair': 'youtube:i9InlyDELr4',
    'demo-sheger-rebar-works': 'youtube:-7uibSJPZdU',
    'demo-netsa-hygiene-products': 'youtube:LVMQPqy_Ly8',
    'demo-omo-packaging-factory': 'youtube:oo4eoOh_Ex0',
    'green-terrace-farm': 'youtube:a2c1vNB-Bpg',
    'blue-nile-apiary': 'youtube:gkqKw1n6VQg',
    'demo-sena-body-care': 'tiktok:7638698619176340749',
  };
  for (const [handle, ref] of Object.entries(expected)) {
    assert.equal(demoProcessVideoFor(handle).ref, ref);
  }
});
