import assert from 'node:assert/strict';
import {EventEmitter} from 'node:events';
import {test} from 'node:test';
import {createPostgresPool,PostgresTransactionRunner} from '../lib/postgres-runtime';

// Actual factory and installed pg-pool lifecycle; only its Client constructor
// is substituted before any connection. No server, socket or credential access.
function controlledPool(){
 const clients:ControlledClient[]=[],commands:string[]=[];
 let queryError:Error|null=null;
 class ControlledClient extends EventEmitter{
  _queryable=true;_ending=false;closed=false;
  constructor(){super();clients.push(this);}
  connect(done:(error?:Error)=>void){queueMicrotask(()=>done());}
  end(done?:()=>void){this.closed=true;queueMicrotask(()=>done?.());}
  query(text:unknown,_values?:unknown,done?:(error:Error|null,result?:{rows:Array<{value:number}>;rowCount:number})=>void){
   commands.push(String(text));const error=queryError;queryError=null;
   const value={rows:[{value:1}],rowCount:1};
   if(done){queueMicrotask(()=>done(error,error?undefined:value));return;}
   return error?Promise.reject(error):Promise.resolve(value);
  }
 }
 const pool=createPostgresPool({connectionString:'postgresql://synthetic:synthetic@127.0.0.1:1/synthetic',poolMax:1,connectionTimeoutMs:1000,statementTimeoutMs:1000});
 // Installed pg-pool selects this constructor when creating each lazy client.
 assert.equal(Reflect.set(pool,'Client',ControlledClient),true);
 assert.equal(Reflect.get(pool,'Client'),ControlledClient);
 return{pool,clients,commands,failNextQuery:(error:Error)=>{queryError=error;}};
}
async function captureDiagnostics(run:(events:unknown[][])=>Promise<void>){
 const original=console.error,events:unknown[][]=[];
 console.error=(...values:unknown[])=>{events.push(values);};
 try{await run(events);}finally{console.error=original;}
}

test('BE-027 actual idle client errors are contained, sanitized and replaced by a fresh client',async()=>{
 const beforeUncaught=process.listenerCount('uncaughtException'),beforeRejection=process.listenerCount('unhandledRejection');
 const{pool,clients}=controlledPool();
 try{await captureDiagnostics(async events=>{
  const client=await pool.connect();assert.equal(clients.length,1);client.release();assert.equal(pool.idleCount,1);
  const failure=Object.assign(new Error('SYNTHETIC_PRIVATE_CONNECTION_AND_SQL'),{detail:'SYNTHETIC_PRIVATE_ROW',client:{password:'SYNTHETIC_PRIVATE_PASSWORD'}});
  assert.doesNotThrow(()=>clients[0].emit('error',failure));
  assert.equal(clients[0].closed,true);assert.equal(pool.totalCount,0);assert.equal(pool.idleCount,0);
  assert.deepEqual(events,[['PostgreSQL idle connection failed.',{category:'postgres_idle_connection_failure'}]]);
  assert.doesNotMatch(JSON.stringify(events),/SYNTHETIC_PRIVATE|password|SELECT|postgresql:/);
  assert.equal((await pool.query('SELECT controlled value')).rows[0].value,1);assert.equal(clients.length,2);
  assert.equal(pool.listenerCount('error'),1);assert.equal(events.length,1,'A later successful query adds no duplicate diagnostic');
 });}finally{await pool.end();}
 assert.equal(process.listenerCount('uncaughtException'),beforeUncaught);assert.equal(process.listenerCount('unhandledRejection'),beforeRejection);
});

test('BE-027 active query failures still reject once and are never converted into idle-event success',async()=>{
 const{pool,clients,commands,failNextQuery}=controlledPool(),failure=new Error('controlled active query failure');
 try{await captureDiagnostics(async events=>{
  failNextQuery(failure);await assert.rejects(pool.query('SELECT controlled failure'),error=>error===failure);
  assert.deepEqual(commands,['SELECT controlled failure'],'No automatic replay of the failed command');assert.equal(clients[0].closed,true);assert.equal(pool.totalCount,0);assert.deepEqual(events,[]);
  assert.equal((await pool.query('SELECT controlled recovery')).rows[0].value,1);assert.equal(clients.length,2);
 });}finally{await pool.end();}
});

test('BE-027 transaction rejection keeps rollback, release and the original failure',async()=>{
 const{pool,commands}=controlledPool(),runner=new PostgresTransactionRunner(pool),failure=new Error('controlled transaction failure');
 try{await captureDiagnostics(async events=>{
  await assert.rejects(runner.transaction(async()=>{await runner.query('SELECT controlled transaction');throw failure;}),error=>error===failure);
  assert.deepEqual(commands,['BEGIN','SELECT controlled transaction','ROLLBACK']);assert.equal(pool.idleCount,1);assert.deepEqual(events,[]);
 });}finally{await pool.end();}
});
