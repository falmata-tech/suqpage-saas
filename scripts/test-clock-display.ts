import assert from 'node:assert/strict';
import {clockTimeLabel,clockInputParts,clockInputValue} from '../lib/clock-display';
import {featuredProgramTimeLabel,featuredBoothWalkthroughs} from '../lib/featured-program';
for(const [minute,label] of [[0,'12:00 AM'],[60,'1:00 AM'],[719,'11:59 AM'],[720,'12:00 PM'],[780,'1:00 PM'],[1020,'5:00 PM'],[1439,'11:59 PM'],[1440,'12:00 AM']] as const) assert.equal(clockTimeLabel(minute),label);
for(let minute=0;minute<1440;minute++){
 const machine=`${String(Math.floor(minute/60)).padStart(2,'0')}:${String(minute%60).padStart(2,'0')}`;
 const parts=clockInputParts(machine);assert.equal(clockInputValue(parts.hour,parts.minute,parts.period),machine);
}
assert.equal(featuredProgramTimeLabel(480,780),'8:00 AM–1:00 PM');
const booths=featuredBoothWalkthroughs('2026-08-09',6,Date.parse('2026-08-09T20:30:00+03:00'));
assert.equal(booths[0].start,Date.parse('2026-08-09T20:30:00+03:00'));
assert.equal(booths[0].label,'8:30 PM–9:00 PM');
console.log('PASS 12-hour labels, noon/midnight, 1,440 input round trips and unchanged Featured timestamps.');
