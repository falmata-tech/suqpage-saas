import assert from 'node:assert/strict';
import {test} from 'node:test';
import {estimateServerNow,formatTransportElapsed,formatTransportRemaining,transportLiveWait,TRANSPORT_BUSY_AFTER_MS,TRANSPORT_INBOX_AFTER_MS} from '../lib/transport-live-wait';

test('S162: assigned customer wait shows busy at 2:00 and inbox handoff at 3:30 exactly',()=>{
  const start=1_800_000_000_000,snapshot={status:'open',waitStartedAt:start};
  assert.equal(TRANSPORT_BUSY_AFTER_MS,120_000);assert.equal(TRANSPORT_INBOX_AFTER_MS,210_000);
  assert.deepEqual(transportLiveWait(snapshot,start+119_999),{phase:'waiting',elapsedMs:119_999});
  assert.deepEqual(transportLiveWait(snapshot,start+120_000),{phase:'busy',elapsedMs:120_000});
  assert.deepEqual(transportLiveWait(snapshot,start+209_999),{phase:'busy',elapsedMs:209_999});
  assert.deepEqual(transportLiveWait(snapshot,start+210_000),{phase:'inbox',elapsedMs:210_000});
});

test('S162: Join or a public reply before 3:30 ends the live wait; a later Join does not reopen it',()=>{
  const start=1_800_000_000_000,now=start+240_000;
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,agentJoined:true,agentJoinedAt:start+120_000},now).phase,'joined');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,agentJoinedAt:start+209_999},now).phase,'joined');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,agentJoinedAt:start+210_001},now).phase,'inbox');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,agentJoinedAt:now+1},now).phase,'inbox','A future join timestamp cannot end the live wait');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,firstStaffReplyAt:start+180_000},now).phase,'joined');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,firstStaffReplyAt:start+180_000,agentJoinedAt:start+220_000},now).phase,'joined','A timely first reply survives a later reassignment');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,firstStaffReplyAt:start+210_000},now).phase,'inbox','A first reply at/after handoff belongs to the inbox phase');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,firstStaffReplyAt:start+220_000},now).phase,'inbox','A late first reply cannot reopen the live wait');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:start,firstStaffReplyAt:now+1},now).phase,'inbox','A future staff reply timestamp cannot end the live wait');
});

test('S162: reconnecting preserves the server clock and the same open inbox state',()=>{
  const serverNow=1_800_000_000_000,sampledAt=42_000;
  assert.equal(estimateServerNow(serverNow,sampledAt,45_000),serverNow+3_000);
  assert.equal(estimateServerNow(serverNow,sampledAt,41_000),serverNow,'A monotonic sample never moves backward');
  assert.equal(formatTransportElapsed(120_000,'en'),'02:00');
  assert.equal(formatTransportElapsed(210_000,'en'),'03:30');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:serverNow},serverNow+210_000).phase,'inbox');
  assert.equal(transportLiveWait({status:'closed',waitStartedAt:serverNow},serverNow+500_000).phase,'closed');
  assert.equal(transportLiveWait({status:'open',waitStartedAt:null},serverNow+500_000).phase,'waiting','Missing timestamps fail safe; they never auto-submit or prematurely hand off');
});

test('FE-019 S174: the live wait counts down from the server clock and never displays zero early',()=>{
  const start=1_800_000_000_000;
  for(const [elapsed,expected] of [[0,'03:30'],[120_000,'01:30'],[209_999,'00:01'],[210_000,'00:00']] as const){
    assert.equal(formatTransportRemaining(elapsed,'en'),expected);
    assert.equal(formatTransportRemaining(transportLiveWait({status:'open',waitStartedAt:start},start+elapsed).elapsedMs,'en'),expected);
  }
  assert.equal(formatTransportRemaining(-1000,'en'),'03:30');
  assert.equal(formatTransportRemaining(300_000,'en'),'00:00');
});
