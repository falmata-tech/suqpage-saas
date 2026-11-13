import assert from 'node:assert/strict';
import fs from 'node:fs';
import {nativeQaDatabaseUrl,nativeQaSchema} from './native-qa-target';
import {createPostgresPool,PostgresTransactionRunner,postgresRuntimeConfig} from '../lib/postgres-runtime';
async function main(){
const target=nativeQaDatabaseUrl();
const fixture=JSON.parse(fs.readFileSync('.local/native-qa/fixture.json','utf8'));
const schema=nativeQaSchema(fixture.schema);
target.searchParams.set('options',`-csearch_path=${schema}`);
const config=postgresRuntimeConfig({SUQPAGE_POSTGRES_URL:target.toString()});
if(!config)throw Error('Missing local QA database.');
const pool=createPostgresPool(config),runner=new PostgresTransactionRunner(pool);
try{
 const result=await runner.query<{business_id:number;customer_name:string;product_id:number}>(`SELECT i.business_id,i.customer_name,ii.product_id
 FROM inquiries i JOIN inquiry_items ii ON ii.inquiry_id=i.id WHERE i.customer_name=?`,['NativeQA']);
 assert.equal(result.rows.length,1,'One actual native inquiry is saved, with one selected product.');
 assert.equal(Number(result.rows[0].business_id),fixture.businessId);
 assert.equal(Number(result.rows[0].product_id),fixture.productId);
 const count=await runner.query<{total:string}>('SELECT count(*) total FROM inquiries');
 assert.equal(Number(count.rows[0].total),fixture.initialInquiries+1,'No inquiry is saved for another business.');
 fs.writeFileSync('.local/native-qa/evidence/persistence.json',JSON.stringify({source:fixture.source,
   result:'passed',inquiriesAdded:1,businessMatches:true,productMatches:true,otherBusinessesUnchanged:true},null,2)+'\n');
 console.log('PASS native Inbox submission persisted exactly once for the selected tenant/product.');
}finally{await pool.end();}
}
void main().catch(error=>{console.error(error instanceof Error?error.message:'Native QA persistence verification failed.');process.exitCode=1;});
