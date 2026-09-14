import fs from 'node:fs';
import pg from 'pg';
import { createClient } from '@supabase/supabase-js';
import { createServerClient } from '@supabase/ssr';
if (!process.env.SUQPAGE_POSTGRES_URL && fs.existsSync('.local/supabase-runtime.env')) process.loadEnvFile('.local/supabase-runtime.env');
const target = new URL(process.env.SUQPAGE_POSTGRES_URL || '');
const provider = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
if (!['127.0.0.1','localhost'].includes(target.hostname) || !['54322','56322'].includes(target.port) || !['127.0.0.1','localhost'].includes(provider.hostname) || !['54321','56321'].includes(provider.port)) throw new Error('Browser review requires local PostgreSQL and Auth providers.');
const pool = new pg.Pool({ connectionString: target.href, max: 2, options: '-cdefault_transaction_read_only=on' });
export async function localBrowserQuery(sql, values=[]) { return (await pool.query(sql,values)).rows; }
export async function localBrowserCookies(role, baseURL) {
  if (!['127.0.0.1','localhost'].includes(new URL(baseURL).hostname)) throw new Error('Local application origin required.');
  const rows = await localBrowserQuery("SELECT u.email FROM users u JOIN user_access_profiles p ON p.user_id=u.id WHERE p.access_role=$1 ORDER BY u.id LIMIT 1",[role]);
  if (!rows[0]) throw new Error(`No local ${role} profile is available.`);
  const admin = createClient(provider.origin,process.env.SUQPAGE_SUPABASE_SERVICE_ROLE_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
  const generated = await admin.auth.admin.generateLink({type:'magiclink',email:rows[0].email});
  if (generated.error || !generated.data.properties?.email_otp) throw new Error('Local test-issued session failed.');
  const cookies=[];
  const client=createServerClient(provider.origin,process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,{cookies:{getAll:()=>[],setAll:values=>cookies.push(...values)}});
  const verified=await client.auth.verifyOtp({email:rows[0].email,token:generated.data.properties.email_otp,type:'email'});
  if(verified.error)throw new Error('Local session verification failed.');
  return cookies.map(({name,value})=>({name,value,url:baseURL,sameSite:'Lax'}));
}
export async function closeLocalBrowserRuntime(){await pool.end();}
