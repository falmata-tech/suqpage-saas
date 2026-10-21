import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { trustedOriginPolicy } from '../lib/trusted-origins.ts';

const require = createRequire(import.meta.url);
const { blockCrossSiteDEV } = require('next/dist/server/lib/router-utils/block-cross-site-dev');

process.env.NODE_ENV = 'development';
process.env.NEXT_PUBLIC_APP_URL = 'http://127.0.0.1:3102';
process.env.SUQPAGE_SERVER_ACTION_ORIGINS = 'https://trusted.example.test,*.unsafe.test';

const policy = trustedOriginPolicy(process.env);
const configModule = await import('../next.config.ts');
const config = configModule.default.default ?? configModule.default;
const allowed = config.allowedDevOrigins;

assert.ok(Array.isArray(allowed));
assert.deepEqual(allowed, policy.devResourceHostnames);
assert.ok(allowed.includes('127.0.0.1'));
assert.ok(allowed.includes('localhost'));
assert.ok(allowed.includes('trusted.example.test'));
assert.equal(allowed.includes('unsafe.test'), false);
assert.equal(allowed.some(host => /[:/*]/.test(host)), false);
assert.ok(policy.serverActionHosts.includes('127.0.0.1:3102'));
assert.ok(policy.mutationOrigins.includes('http://127.0.0.1:3102'));
assert.equal(policy.mutationOrigins.includes('http://localhost:3102'), false);
assert.deepEqual(config.experimental.serverActions.allowedOrigins, policy.serverActionHosts);

const request = origin => ({url: '/_next/hmr?id=local-test', headers: {origin}});
const response = () => ({statusCode: 200, end() { this.ended = true; }});
const loopback = response();
assert.equal(blockCrossSiteDEV(request('http://127.0.0.1:3102'), loopback, allowed, '0.0.0.0'), false);
assert.equal(loopback.ended, undefined);
const unknown = response();
const warning = [];
const previousWarn = console.warn;
try {
  console.warn = message => warning.push(String(message));
  assert.equal(blockCrossSiteDEV(request('http://untrusted.example.test:3102'), unknown, allowed, '0.0.0.0'), true);
} finally {
  console.warn = previousWarn;
}
assert.equal(unknown.statusCode, 403);
assert.equal(unknown.ended, true);
assert.ok(warning.some(message => message.includes('Blocked cross-origin request')));

const production = trustedOriginPolicy({NODE_ENV: 'production', NEXT_PUBLIC_APP_URL: 'https://mirtpage.com'});
assert.deepEqual(production.devResourceHostnames, []);
assert.deepEqual(production.serverActionHosts, ['mirtpage.com']);

console.log('PASS exact hostname-only Next.js dev resources; port-scoped Server Actions and mutations unchanged.');
