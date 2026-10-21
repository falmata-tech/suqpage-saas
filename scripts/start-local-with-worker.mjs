import { spawn } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { platformEnvironment } from '../lib/platform-environment.mjs';
import { ensureLocalServices } from './local-dev-services.mjs';
import { verifyLocalChatWorkerTarget } from './local-chat-worker.ts';

/** @typedef {Pick<import('node:child_process').ChildProcess, 'once'|'off'|'kill'>} ChildPort */
/** @typedef {Pick<NodeJS.Process, 'on'|'off'>} SignalPort */
/** @typedef {{name:'web'|'chat worker', child:ChildPort, closed:boolean, signalled:boolean, close:(code:number|null, signal:NodeJS.Signals|null)=>void, error:(error:Error)=>void}} OwnedChild */

/**
 * @typedef {object} SupervisorPort
 * @property {() => Promise<void>} prepare
 * @property {(file:string, args:string[], options:import('node:child_process').SpawnOptions) => ChildPort} spawnChild
 * @property {SignalPort} signals
 * @property {(message:string, detail:Record<string, string|number|null>) => void} reportError
 * @property {string} executable
 * @property {string} cwd
 * @property {NodeJS.ProcessEnv} environment
 */

async function prepareLocalServices() {
  try { process.loadEnvFile('.local/supabase-runtime.env'); }
  catch { throw Error('Local settings are missing or unreadable. Run npm run local:supabase:configure.'); }
  Object.assign(process.env, platformEnvironment());
  verifyLocalChatWorkerTarget(process.env);
  // The worker must not race the Next launcher's local database/Auth startup.
  await ensureLocalServices();
}

/**
 * Supervise only the two child objects created here; never discover other PIDs.
 * Imported controller tests substitute process ports and perform no DB work.
 * @param {string[]} args Web launcher arguments only.
 * @param {SupervisorPort} port
 * @returns {Promise<number>} Exit status after all owned children have closed.
 */
export async function superviseLocalDevelopment(args, port) {
  await port.prepare();
  return new Promise(resolve => {
    /** @type {OwnedChild[]} */
    const children = [];
    let launching = true;
    let stopping = false;
    let exitCode = 0;

    const finish = () => {
      if (launching || !stopping || children.some(entry => !entry.closed)) return;
      port.signals.off('SIGINT', interrupt);
      port.signals.off('SIGTERM', terminate);
      for (const entry of children) {
        entry.child.off('close', entry.close);
        entry.child.off('error', entry.error);
      }
      resolve(exitCode);
    };
    const stopOwned = signal => {
      for (const entry of children) {
        if (entry.closed || entry.signalled) continue;
        entry.signalled = true;
        try {
          if (!entry.child.kill(signal)) {
            port.reportError('Could not signal an owned local development child.', { child: entry.name, category: 'shutdown_signal_failed' });
            exitCode = 1;
          }
        } catch {
          port.reportError('Could not signal an owned local development child.', { child: entry.name, category: 'shutdown_signal_failed' });
          exitCode = 1;
        }
      }
    };
    const fail = (name, category, code = null, signal = null) => {
      if (stopping) return;
      stopping = true;
      exitCode = Number.isInteger(code) && code > 0 ? code : 1;
      port.reportError('Local development stopped unexpectedly.', { child: name, category, exitCode: code, signal });
      stopOwned('SIGTERM');
      finish();
    };
    const shutdown = signal => {
      if (!stopping) {
        stopping = true;
        stopOwned(signal);
      }
      finish();
    };
    const interrupt = () => shutdown('SIGINT');
    const terminate = () => shutdown('SIGTERM');
    port.signals.on('SIGINT', interrupt);
    port.signals.on('SIGTERM', terminate);

    const commands = [
      { name: /** @type {const} */ ('web'), args: ['scripts/start-local-dev.mjs', ...args] },
      { name: /** @type {const} */ ('chat worker'), args: ['--env-file=.local/supabase-runtime.env', '--import', 'tsx', 'scripts/local-chat-worker.ts', '--run'] },
    ];
    for (const command of commands) {
      if (stopping) break;
      try {
        const child = port.spawnChild(port.executable, command.args, {
          cwd: port.cwd, env: port.environment, stdio: 'inherit',
        });
        /** @type {OwnedChild} */
        const entry = { name: command.name, child, closed: false, signalled: false, close: () => {}, error: () => {} };
        entry.close = (code, signal) => {
          entry.closed = true;
          if (!stopping) fail(entry.name, 'child_exit', code, signal);
          finish();
        };
        entry.error = () => {
          entry.signalled = true; // A failed spawn has no running process to stop.
          fail(entry.name, 'spawn_failure');
        };
        children.push(entry);
        child.once('close', entry.close);
        child.once('error', entry.error);
      } catch {
        fail(command.name, 'spawn_failure');
      }
    }
    launching = false;
    finish();
  });
}

/** @param {string[]} [args] */
export function launchLocalWithWorker(args = process.argv.slice(2)) {
  return superviseLocalDevelopment(args, {
    prepare: prepareLocalServices,
    spawnChild: spawn,
    signals: process,
    reportError: (message, detail) => console.error(message, detail),
    executable: process.execPath,
    cwd: process.cwd(),
    environment: process.env,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  launchLocalWithWorker().then(code => { process.exitCode = code; }).catch(() => {
    console.error('Could not prepare local web and chat maintenance.', { category: 'local_target_or_startup_failure' });
    process.exitCode = 1;
  });
}
