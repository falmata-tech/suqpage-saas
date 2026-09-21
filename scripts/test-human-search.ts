import assert from 'node:assert/strict';
import { normalizeSearchText, searchTermGroups } from '../lib/search-terms';
const matches=(query:string,text:string)=>searchTermGroups(query).every(group=>group.some(term=>normalizeSearchText(text).includes(term)));
const positives:[string,string][]=[
 ['lotions','Aloe Body Lotion'],['lotion','Aloe Body Lotions'],['batteries','Phone battery'],['battery','Phone batteries'],
 ['brushes','Hair brush'],['boxes','Gift box'],['dresses','Cotton dress'],['services','Repair service'],
 ['CAFÉ','Cafe supplies'],['cafe','Café supplies'],['body-lotion','Body Lotion'],['body lotion','Body-Lotion'],
 ['show me lotions in addis','Aloe body lotion Addis Ababa'],['find repair services','Phone repair service'],
 ['የቤት repair','የቤት Repair'],['50%_off','Sale 50%_off'],['[body lotion]','Body Lotion'],
 ['ＬＯＴＩＯＮ','Body lotion'],['Addis','Addis Ababa'],['glass','Glass bowl'],['citrus','Citrus soap'],
];
for(const [q,text]of positives)assert.ok(matches(q,text),`${q} should match ${text}`);
for(const q of ['.*','%','_', '[]','!!!','^','$','\\',"' OR 1=1--",'unknownbrand lotion'])assert.equal(matches(q,'Aloe body lotion in Addis Ababa'),false,q);
assert.deepEqual(searchTermGroups('  '),[]);
assert.ok(searchTermGroups('[]').length>0);
assert.equal(searchTermGroups('a '.repeat(100)).length,1,'Bounded and deduplicated terms');
assert.equal(normalizeSearchText('  Café—BODY/Lotion!  '),'cafe body lotion');
assert.ok(!matches('lotion soap','Body lotion'), 'All substantive terms must match');
console.log(`PASS ${positives.length} human-query variations, literal metacharacters, no-match, Unicode, request-word and query-boundary cases.`);
