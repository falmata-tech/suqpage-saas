import assert from 'node:assert/strict';
import { ensureLocalServices } from './local-dev-services.mjs';

function fixture({ healthy = false, resumed = false, failure = '', platform = 'darwin' } = {}) {
  let time = 0, opened = false, started = false;
  const calls = [];
  return { calls, port: {
    platform, now: () => time, sleep: async ms => { time += ms; }, log() {},
    ready: async () => healthy || (resumed && opened) || (started && failure !== 'readiness'),
    command: async (file, args) => {
      const name = `${file} ${args.join(' ')}`; calls.push(name);
      if (file === 'open') { if (failure === 'open') return false; opened = true; return true; }
      if (file === 'docker' && args[0] === 'info') return opened && failure !== 'daemon';
      if (file === 'docker') return failure !== 'docker';
      if (args[0] === '--version') return failure !== 'cli';
      if (file === 'supabase' && args[0] === 'start') { started = true; return failure !== 'start'; }
      throw Error('Unexpected command');
    },
  }};
}
let f = fixture({healthy:true}); await ensureLocalServices(f.port); assert.deepEqual(f.calls,[]);
f = fixture(); await ensureLocalServices(f.port); assert.ok(f.calls.includes('open -a Docker')); assert.ok(f.calls.includes('supabase start'));
f = fixture({resumed:true}); await ensureLocalServices(f.port); assert.ok(!f.calls.includes('supabase start'));
for (const failure of ['docker','open','daemon','cli','start','readiness']) {
  f = fixture({failure}); await assert.rejects(() => ensureLocalServices(f.port));
  assert.ok(!f.calls.some(call => /reset|seed|migrate|stop|push/.test(call)));
}
f = fixture({platform:'linux'}); await assert.rejects(() => ensureLocalServices(f.port), /Start your Docker engine/);
assert.ok(!f.calls.includes('open -a Docker'));
console.log('PASS healthy/stopped/resumed services, bounded failure paths, no destructive or hosted commands.');
