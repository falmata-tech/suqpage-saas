import { spawn } from 'node:child_process';
const child=spawn(process.execPath,['scripts/acceptance-runner.mjs','--grep','API authorization, validation, health, and security headers'],{stdio:'inherit',env:process.env});
child.on('error',()=>{process.exitCode=1;});
child.on('close',code=>{process.exitCode=code||0;});
