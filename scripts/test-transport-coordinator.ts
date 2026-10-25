import assert from 'node:assert/strict';
import test from 'node:test';
import { TRANSPORT_COORDINATOR, selectTransportCoordinator } from '../lib/transport-coordinator';
import { parsePartnerInterest } from '../lib/transport-partner-interest-contract';

const request = () => ({ companyName: '  Sample   Logistics ', contactName: 'Example Operator', email: 'Operator@EXAMPLE.TEST', phone: '+1 (202) 555-0123', message: ' Regional freight\r\nPlease contact us. ', locale: 'en', idempotencyKey: '06dc3b42-839f-4f85-8e1d-0a6363bbca61' });

test('only the admitted coordinator and omitted legacy selection are accepted', () => {
  for (const value of [undefined, 'shared-trucks-logistics']) {
    assert.deepEqual(selectTransportCoordinator(value), { ok: true, coordinator: TRANSPORT_COORDINATOR });
  }
  for (const value of [null, '', false, 0, [], {}, { id: 'shared-trucks-logistics' }, 'foreign-company', 'SharedTrucks Logistics', ' shared-trucks-logistics']) {
    assert.deepEqual(selectTransportCoordinator(value), { ok: false, code: 'unsupported_transport_coordinator' });
  }
  assert.equal(Object.isFrozen(TRANSPORT_COORDINATOR), true);
  assert.equal(TRANSPORT_COORDINATOR.name, 'SharedTrucks Logistics');
  assert.equal(TRANSPORT_COORDINATOR.serviceType, 'freight_brokerage');
  assert.equal(TRANSPORT_COORDINATOR.logoPath, '/brands/sharedtrucks-logistics.png');
  assert.equal(TRANSPORT_COORDINATOR.websiteUrl, 'https://sharedtrucks.com/');
});

test('interest normalizes private input without inventing a provider account', () => {
  const parsed = parsePartnerInterest(request());
  assert.equal(parsed.ok, true);
  if (!parsed.ok) throw Error('Expected valid fixture');
  assert.deepEqual(parsed.value, { companyName: 'Sample Logistics', contactName: 'Example Operator', email: 'operator@example.test', phone: '+12025550123', message: 'Regional freight\nPlease contact us.', locale: 'en', idempotencyKey: request().idempotencyKey });
  assert.equal(Object.isFrozen(parsed.value), true);
  assert.equal('approved' in parsed.value, false);
  assert.equal('userId' in parsed.value, false);
  assert.deepEqual(parsePartnerInterest({ ...request(), phone: '' }), { ok: true, value: { ...parsed.value, phone: null } });
});

test('all enabled languages and Unicode names retain their meaning', () => {
  for (const locale of ['en', 'am', 'om']) {
    const parsed = parsePartnerInterest({ ...request(), companyName: 'ምሳሌ መጓጓዣ', contactName: 'Dhaabbata Geejjibaa', locale });
    assert.equal(parsed.ok, true);
    if (parsed.ok) assert.equal(parsed.value.companyName, 'ምሳሌ መጓጓዣ');
  }
  assert.equal(parsePartnerInterest({ ...request(), companyName: 'e\u0301'.repeat(160) }).ok, true, 'Normalize before counting Unicode code points');
});

test('malformed, excessive, injected and authority-bearing fields fail closed', () => {
  for (const raw of [null, [], 'request', { ...request(), role: 'platform_admin' }, { ...request(), providerId: 'another-company' }]) assert.equal(parsePartnerInterest(raw).ok, false);
  const cases: Array<[string, unknown]> = [
    ['companyName', 'a'], ['companyName', 'x'.repeat(161)], ['contactName', 'x'.repeat(81)], ['contactName', 'One\nAnother'],
    ['email', 'a@example.test\r\nBcc:someone@example.test'], ['email', 'not-an-email'], ['email', 'a'.repeat(161)],
    ['phone', '+123'], ['phone', '+1234567890123456'], ['phone', { number: '+12025550123' }],
    ['message', ' '], ['message', 'x'.repeat(4001)], ['message', 'bad\u0000message'],
    ['locale', 'so'], ['locale', { toString: () => 'en' }], ['idempotencyKey', 'not-a-key'],
  ];
  for (const [field, value] of cases) {
    const parsed = parsePartnerInterest({ ...request(), [field]: value });
    assert.deepEqual(parsed, { ok: false, field, code: 'invalid_partner_interest' }, `Invalid ${field} must not be coerced or truncated`);
  }
});

test('guest and owner application services reject a foreign coordinator before any persistence',async()=>{
 const {createPublicSupportConversation,createOwnerTransportConversation,SupportError}=await import('../lib/support');
 const invalid=(error:unknown)=>error instanceof SupportError&&error.code==='invalid_request';
 await assert.rejects(()=>createPublicSupportConversation({category:'shipment_observation',coordinatorId:'other-company',name:'Test',phone:'+12025550188',origin:'A',destination:'B',idempotencyKey:'030f2173-f4b1-4abe-8c59-0cb3d8e115f7'},'fixture-ip'),invalid);
 const actor={access_role:'client',business_id:1} as import('../lib/types').SessionUser;
 await assert.rejects(()=>createOwnerTransportConversation(actor,{coordinatorId:'other-company',name:'Test',phone:'+12025550188',origin:'A',destination:'B',idempotencyKey:'030f2173-f4b1-4abe-8c59-0cb3d8e115f7'}),invalid);
});
