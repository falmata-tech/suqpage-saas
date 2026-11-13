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
export function verifyNativeQaArtifact(value:unknown,key:string,digest:string):{source:string;key:string;sha256:string}{
 if(!value||typeof value!=='object')throw Error('Missing native QA artifact identity.');
 const v=value as Record<string,unknown>;
 if(typeof v.source!=='string'||! /^[a-f0-9]{40}$/.test(v.source)||
    !/^native-qa-apk-v2-[A-Za-z0-9_-]+-[a-f0-9]{64}$/.test(key)||v.key!==key||
    !/^[a-f0-9]{64}$/.test(digest)||v.sha256!==digest)throw Error('Native QA cached artifact identity does not match its inputs.');
 return {source:v.source,key,sha256:digest};
}
