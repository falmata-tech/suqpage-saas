import assert from 'node:assert/strict';
import {test} from 'node:test';
import {emptyMarketSearch,normalizeMarketSearch,MarketSearchError} from '../lib/market-search';
import {
 emptyMarketWorkspace,hasExplicitMarketIntent,marketWorkspaceFromParams,
 parseMarketWorkspaceSnapshot,serializeMarketWorkspaceSnapshot,MARKET_WORKSPACE_SESSION_TTL_MS,
 type MarketWorkspaceState,
} from '../lib/market-workspace';

test('FE-065 Market memory keeps only bounded independent public criteria',()=>{
 const input:MarketWorkspaceState={mode:'products',business:normalizeMarketSearch({q:'Shop',country:['ET'],city:['ET:Addis Ababa']}),
  product:normalizeMarketSearch({q:'Cup',country:['KE'],city:['KE:Nairobi'],madeToOrder:true})};
 const raw=serializeMarketWorkspaceSnapshot({...input,catalog:{private:'must not persist'}} as MarketWorkspaceState,10_000);
 assert.doesNotMatch(raw,/catalog|private|must not persist/);
 assert.deepEqual(parseMarketWorkspaceSnapshot(raw,10_001),input);
 const long=serializeMarketWorkspaceSnapshot({mode:'businesses',business:{...emptyMarketSearch(),query:'a'.repeat(400)},product:emptyMarketSearch()},10_000);
 assert.equal(parseMarketWorkspaceSnapshot(long,10_001)?.business.query.length,80);
 assert.equal(parseMarketWorkspaceSnapshot(raw,10_000+MARKET_WORKSPACE_SESSION_TTL_MS)?.mode,'products');
});

test('FE-065 invalid, expired, future, oversized or noncanonical Market snapshots are ignored',()=>{
 const raw=serializeMarketWorkspaceSnapshot(emptyMarketWorkspace(),10_000);
 assert.equal(parseMarketWorkspaceSnapshot(raw,10_001+MARKET_WORKSPACE_SESSION_TTL_MS),null);
 for(const invalid of [null,'','not json','null','[]',JSON.stringify({version:2,updatedAt:10_000,params:'view=map'}),
  JSON.stringify({version:1,updatedAt:'10000',params:'view=map'}),JSON.stringify({version:1,updatedAt:11_000,params:'view=map'}),
  JSON.stringify({version:1,updatedAt:10_000,params:'view=search&p.offeringType=services'}),
  JSON.stringify({version:1,updatedAt:10_000,params:'view=search&p.country=INVALID'}),
  JSON.stringify({version:1,updatedAt:10_000,params:'view=search&redirect=https%3A%2F%2Fevil.test'}),'x'.repeat(70_000)]){
  assert.equal(parseMarketWorkspaceSnapshot(invalid,10_000),null,String(invalid).slice(0,100));
 }
});

test('FE-065 explicit current and legacy URL intent precedes remembered state',()=>{
 assert.deepEqual(marketWorkspaceFromParams(new URLSearchParams()),emptyMarketWorkspace());
 assert.equal(hasExplicitMarketIntent(new URLSearchParams('utm_source=campaign')),false);
 for(const query of ['view=map','view=search','b.q=','p.q=Cup','country=ET','city=ET%3AAddis+Ababa','q=','page=2'])assert.equal(hasExplicitMarketIntent(new URLSearchParams(query)),true,query);
 const state=marketWorkspaceFromParams(new URLSearchParams('view=map&b.q=Shop&p.q=Cup&p.madeToOrder=true'));
 assert.equal(state.mode,'businesses');assert.equal(state.business.query,'Shop');assert.equal(state.product.query,'Cup');assert.equal(state.product.madeToOrder,true);
 assert.equal(marketWorkspaceFromParams(new URLSearchParams('q=legacy')).mode,'products');
 assert.equal(marketWorkspaceFromParams(new URLSearchParams('view=map&q=legacy')).business.query,'legacy');
 assert.equal(marketWorkspaceFromParams(new URLSearchParams('country=ET')).product.countries[0],'ET');
 assert.throws(()=>marketWorkspaceFromParams(new URLSearchParams('view=search&offeringType=services')),MarketSearchError);
 assert.throws(()=>marketWorkspaceFromParams(new URLSearchParams('p.q=Cup&madeToOrder=invalid')),MarketSearchError);
});
