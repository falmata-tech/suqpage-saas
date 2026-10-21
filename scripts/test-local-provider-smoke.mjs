import { spawnSync } from 'node:child_process';
process.loadEnvFile('.local/supabase-runtime.env');
// The current standard-page workflow supersedes the retired request/revision smoke.
// The child validates local app/Auth/DB targets and removes its synthetic fixtures.
const result=spawnSync(process.execPath,['--import','tsx','scripts/capture-launch-wiring.mjs'],{env:process.env,stdio:'inherit'});
process.exitCode=result.status??1;
