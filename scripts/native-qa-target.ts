// These operations may only use a disposable local CI database, never a hosted URI.
export function nativeQaDatabaseUrl(env:NodeJS.ProcessEnv=process.env):URL {
  const target=new URL(env.SUQPAGE_TEST_POSTGRES_URL||'');
  if(env.CI!=='true'||!['postgres:','postgresql:'].includes(target.protocol)||!['127.0.0.1','localhost'].includes(target.hostname)||
     target.pathname!=='/suqpage_native_qa'||target.search||target.hash)
    throw Error('Native QA requires the dedicated local CI PostgreSQL database.');
  return target;
}
export function nativeQaSchema(value:unknown):string {
  if(typeof value!=='string'||!/^suqpage_test_[a-f0-9]{32}$/.test(value))throw Error('Invalid native QA fixture schema.');
  return value;
}
