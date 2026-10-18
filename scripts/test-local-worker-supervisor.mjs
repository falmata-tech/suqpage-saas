import assert from 'node:assert/strict';
import { test } from 'node:test';
import { EventEmitter } from 'node:events';
import { spawnSync } from 'node:child_process';
import { superviseLocalDevelopment } from './start-local-with-worker.mjs';

const nextTurn = () => new Promise(resolve => setImmediate(resolve));

class ControlledChild extends EventEmitter {
  signals = [];
  kill(signal) { this.signals.push(signal); return true; }
  close(code = 0, signal = null) { this.emit('close', code, signal); }
}

function fixture(prepare = async () => {}) {
  const signals = new EventEmitter();
  const unrelated = new ControlledChild();
  const calls = [];
  const logs = [];
  const children = [];
  const environment = { FIXTURE_ONLY: 'not-for-logging' };
  const port = {
    prepare,
    spawnChild: (executable, args, options) => {
      const child = new ControlledChild();
      calls.push({ executable, args, options });
      children.push(child);
      return child;
    },
    signals,
    reportError: (message, detail) => logs.push({ message, detail }),
    executable: '/fixture/node',
    cwd: '/fixture/suqpage',
    environment,
  };
  const assertClean = () => {
    assert.equal(signals.listenerCount('SIGINT'), 0);
    assert.equal(signals.listenerCount('SIGTERM'), 0);
    for (const child of children) {
      assert.equal(child.listenerCount('close'), 0);
      assert.equal(child.listenerCount('error'), 0);
    }
    assert.deepEqual(unrelated.signals, [], 'No unrelated process is discovered or signalled');
    assert.doesNotMatch(JSON.stringify(logs), /not-for-logging|private credential/);
  };
  return { port, signals, unrelated, calls, logs, children, assertClean };
}

test('DEP-043 S119 importing the supervisor never launches development or maintenance', () => {
  for (const flags of [[], ['--run'], ['--once']]) {
    const result = spawnSync(process.execPath, ['--import', 'tsx', '--input-type=module', '-e',
      "await import('./scripts/start-local-with-worker.mjs'); console.log('import-only');", '--', ...flags], {
      cwd: process.cwd(), encoding: 'utf8', timeout: 15000,
      env: { PATH: process.env.PATH, NODE_ENV: 'production' },
    });
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stdout.trim(), 'import-only');
    assert.equal(result.stderr, '', 'Neither --run nor --once on an importing command starts the worker');
  }
});

test('DEP-043 S119 preparation completes before both guarded children start and web args remain separate', async () => {
  let ready;
  const f = fixture(() => new Promise(resolve => { ready = resolve; }));
  const result = superviseLocalDevelopment(['--port', '3102', '--hostname', '127.0.0.1'], f.port);
  assert.equal(f.calls.length, 0);
  ready();
  await nextTurn();
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.calls[0].args, ['scripts/start-local-dev.mjs', '--port', '3102', '--hostname', '127.0.0.1']);
  assert.deepEqual(f.calls[1].args, ['--env-file=.local/supabase-runtime.env', '--import', 'tsx', 'scripts/local-chat-worker.ts', '--run']);
  for (const call of f.calls) {
    assert.equal(call.executable, '/fixture/node');
    assert.equal(call.options.cwd, '/fixture/suqpage');
    assert.equal(call.options.env, f.port.environment);
    assert.equal(call.options.stdio, 'inherit');
  }
  f.signals.emit('SIGTERM');
  for (const child of f.children) child.close(0, 'SIGTERM');
  assert.equal(await result, 0);
  assert.deepEqual(f.logs, []);
  f.assertClean();
});

test('DEP-043 S119 an unexpected worker failure stops only its web sibling and preserves the failure status', async () => {
  const f = fixture();
  const result = superviseLocalDevelopment([], f.port);
  await nextTurn();
  const [web, worker] = f.children;
  worker.close(7);
  assert.deepEqual(worker.signals, []);
  assert.deepEqual(web.signals, ['SIGTERM']);
  assert.deepEqual(f.logs.map(row => row.detail), [{ child: 'chat worker', category: 'child_exit', exitCode: 7, signal: null }]);
  f.signals.emit('SIGINT');
  assert.deepEqual(web.signals, ['SIGTERM'], 'Repeated shutdown never resends a signal');
  web.close(0, 'SIGTERM');
  assert.equal(await result, 7);
  f.assertClean();
});

test('DEP-043 S119 an unexpected successful web exit still fails supervision and stops its worker', async () => {
  const f = fixture();
  const result = superviseLocalDevelopment([], f.port);
  await nextTurn();
  const [web, worker] = f.children;
  web.close(0);
  assert.deepEqual(worker.signals, ['SIGTERM']);
  worker.close(0, 'SIGTERM');
  assert.equal(await result, 1, 'A long-running supervised child disappearing is not healthy completion');
  assert.equal(f.logs[0].detail.child, 'web');
  assert.equal(f.logs[0].detail.exitCode, 0);
  f.assertClean();
});

test('DEP-043 S119 asynchronous spawn failure is sanitized and never signals the nonexistent child', async () => {
  const f = fixture();
  const result = superviseLocalDevelopment([], f.port);
  await nextTurn();
  const [web, worker] = f.children;
  worker.emit('error', Error('private credential must not be logged'));
  assert.deepEqual(worker.signals, []);
  assert.deepEqual(web.signals, ['SIGTERM']);
  worker.close(null);
  web.close(0, 'SIGTERM');
  assert.equal(await result, 1);
  assert.equal(f.logs[0].detail.category, 'spawn_failure');
  f.assertClean();
});

test('DEP-043 S119 synchronous spawn failure closes any already-owned sibling without retrying', async () => {
  for (const failAt of [0, 1]) {
    const f = fixture();
    const originalSpawn = f.port.spawnChild;
    let attempts = 0;
    f.port.spawnChild = (...args) => {
      if (attempts++ === failAt) throw Error('private credential must not be logged');
      return originalSpawn(...args);
    };
    const result = superviseLocalDevelopment([], f.port);
    await nextTurn();
    assert.equal(attempts, failAt + 1);
    for (const child of f.children) {
      assert.deepEqual(child.signals, ['SIGTERM']);
      child.close(0, 'SIGTERM');
    }
    assert.equal(await result, 1);
    assert.equal(f.logs[0].detail.category, 'spawn_failure');
    f.assertClean();
  }
});

test('DEP-043 S119 both shutdown signals are forwarded once and completion waits for both owned children', async () => {
  for (const signal of ['SIGINT', 'SIGTERM']) {
    const f = fixture();
    let settled = false;
    const result = superviseLocalDevelopment([], f.port).then(code => { settled = true; return code; });
    await nextTurn();
    f.signals.emit(signal);
    f.signals.emit(signal);
    f.signals.emit(signal === 'SIGINT' ? 'SIGTERM' : 'SIGINT');
    for (const child of f.children) assert.deepEqual(child.signals, [signal]);
    f.children[0].close(0, signal);
    await nextTurn();
    assert.equal(settled, false);
    f.children[1].close(0, signal);
    assert.equal(await result, 0);
    assert.deepEqual(f.logs, []);
    f.assertClean();
  }
});

test('DEP-043 S119 invalid local preparation fails before children or signal listeners exist', async () => {
  const failure = Error('Local target unavailable');
  const f = fixture(async () => { throw failure; });
  await assert.rejects(superviseLocalDevelopment([], f.port), error => error === failure);
  assert.deepEqual(f.calls, []);
  assert.deepEqual(f.logs, []);
  f.assertClean();
});

test('DEP-043 S119 an owned shutdown-signal failure is visible, does not expose details and still stops the sibling', async () => {
  for (const mode of ['rejected', 'thrown']) {
    const f = fixture();
    const result = superviseLocalDevelopment([], f.port);
    await nextTurn();
    f.children[0].kill = signal => {
      f.children[0].signals.push(signal);
      if (mode === 'thrown') throw Error('private credential must not be logged');
      return false;
    };
    f.signals.emit('SIGTERM');
    assert.deepEqual(f.children[0].signals, ['SIGTERM']);
    assert.deepEqual(f.children[1].signals, ['SIGTERM']);
    assert.deepEqual(f.logs.map(row => row.detail), [{ child: 'web', category: 'shutdown_signal_failed' }]);
    for (const child of f.children) child.close(0, 'SIGTERM');
    assert.equal(await result, 1);
    f.assertClean();
  }
});
