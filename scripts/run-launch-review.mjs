import { spawn } from 'node:child_process';
import fs from 'node:fs';
export async function runLaunchReview(extraEnv={}) {
 const args=[...(fs.existsSync('.local/supabase-runtime.env')?['--env-file=.local/supabase-runtime.env']:[]),'--import','tsx','scripts/capture-launch-wiring.mjs'];
 const child=spawn(process.execPath,args,{stdio:'inherit',env:{...process.env,...extraEnv}});
 await new Promise((resolve,reject)=>{child.on('error',reject);child.on('close',code=>code===0?resolve():reject(new Error('Current launch review failed.')));});
}
