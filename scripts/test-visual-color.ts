import assert from 'node:assert/strict';
import { hexToHsv, hsvToHex } from '../lib/visual-color';
import fs from 'node:fs';
for (let r=0;r<=255;r+=17) for(let g=0;g<=255;g+=17) for(let b=0;b<=255;b+=17){
 const color='#'+[r,g,b].map(n=>n.toString(16).padStart(2,'0')).join('').toUpperCase();
 assert.equal(hsvToHex(hexToHsv(color)),color);
}
assert.equal(hsvToHex({hue:360,saturation:1,brightness:1}),'#FF0000');
assert.equal(hsvToHex({hue:-60,saturation:1,brightness:1}),'#FF00FF');
for(const file of ['components/SignupForm.tsx']) assert.ok(!fs.readFileSync(file,'utf8').includes('AccentPicker'));
const native=fs.readFileSync('apps/mobile/src/owner-forms.tsx','utf8').split('export function Setup()')[1].split('export function PageEditor')[0];assert.ok(!native.includes('AccentPicker'));
for(const file of ['components/StorefrontAccentPicker.tsx','apps/mobile/src/StorefrontAccentPicker.tsx'])assert.ok(!fs.readFileSync(file,'utf8').includes('Apply color'));
console.log('PASS: 4096 HSV round trips, hue wrap, signup absence and no code-Apply UI.');
