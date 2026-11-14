import assert from 'node:assert/strict';
import test from 'node:test';
import path from 'node:path';
import os from 'node:os';
import {assertScenarioAcceptanceTarget} from '../tests/acceptance/demo-scenario-fixture';
test('FE-079 scenario fixture refuses missing and hosted targets before any database work',()=>{
 assert.throws(()=>assertScenarioAcceptanceTarget({}),/disposable runner/);
 const credentials=path.join(os.tmpdir(),'suqpage-acceptance-controlled','credentials.txt');
 const base={SUQPAGE_RUNTIME_PROFILE:'browser-test',SUQPAGE_LOCAL_SUPABASE_PROFILE:'browser-test',SUQPAGE_DATABASE_DRIVER:'postgres',
  SUQPAGE_TEST_CREDENTIALS:credentials,SUQPAGE_CREDENTIAL_PATH:credentials,
  SUQPAGE_TEST_BASE_URL:'https://africmade.com',SUQPAGE_SUPABASE_URL:'https://example.supabase.co',NEXT_PUBLIC_SUPABASE_URL:'https://example.supabase.co',
  SUQPAGE_POSTGRES_URL:'postgresql://not-a-secret:fixture@hosted.invalid:5432/postgres',SUQPAGE_POSTGRES_DIRECT_URL:'postgresql://not-a-secret:fixture@hosted.invalid:5432/postgres',SUQPAGE_LOCAL_POSTGRES_URL:'postgresql://not-a-secret:fixture@hosted.invalid:5432/postgres'};
 assert.throws(()=>assertScenarioAcceptanceTarget(base),/does not match/);
 for(const change of [{SUQPAGE_RUNTIME_PROFILE:'production'},{SUQPAGE_LOCAL_SUPABASE_PROFILE:'development'},{SUQPAGE_CREDENTIAL_PATH:'/tmp/other/credentials.txt'}])assert.throws(()=>assertScenarioAcceptanceTarget({...base,...change}),/disposable runner/);
});
