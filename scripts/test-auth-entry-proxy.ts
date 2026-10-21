import assert from 'node:assert/strict';
import { NextRequest } from 'next/server';
import { proxy } from '../proxy';

async function main() {
  const prior = { ...process.env };
  const originalFetch = globalThis.fetch;
  let networkCalls = 0;
  globalThis.fetch = async () => { networkCalls++; throw new Error('No external Auth request is expected for invalid fixture cookies.'); };
  try {
    delete process.env.SUQPAGE_AUTH_DRIVER;
    process.env.MIRTPAGE_AUTH_DRIVER = 'supabase';
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://127.0.0.1:9';
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY = 'fixture-public-key-for-proxy-regression';
    const request = () => new NextRequest('https://suqpage.example.test/request', {
      headers: { cookie: 'sb-fixture-auth-token=invalid-fixture-cookie' },
    });
    const legacy = await proxy(request());
    assert.match(legacy.headers.get('cache-control') || '', /private.*no-store/, 'Legacy runtime settings must enter the refresh adapter');
    process.env.SUQPAGE_AUTH_DRIVER = 'supabase';
    assert.equal((await proxy(request())).headers.get('cache-control'), legacy.headers.get('cache-control'));
    process.env.SUQPAGE_AUTH_DRIVER = 'local';
    assert.equal((await proxy(request())).headers.get('cache-control'), null, 'Explicit canonical local setting wins');
    process.env.SUQPAGE_AUTH_DRIVER = '';
    assert.equal((await proxy(request())).headers.get('cache-control'), null, 'Explicit empty setting wins');
    process.env.SUQPAGE_AUTH_DRIVER = 'supabase';
    assert.equal((await proxy(new NextRequest('https://suqpage.example.test/login'))).headers.get('cache-control'), null);
    assert.equal((await proxy(new NextRequest('https://suqpage.example.test/dashboard/requests'))).status, 404);
    assert.equal(networkCalls, 0);
    console.log('PASS Auth proxy legacy/canonical precedence, invalid-cookie fail-closed handling, anonymous requests and retired-route denial.');
  } finally {
    globalThis.fetch = originalFetch;
    for (const key of Object.keys(process.env)) if (!(key in prior)) delete process.env[key];
    Object.assign(process.env, prior);
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
