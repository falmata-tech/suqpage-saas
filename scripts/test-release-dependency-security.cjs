const assert=require('node:assert/strict');
const sharp=require('sharp');
const {quote,parse}=require('shell-quote');
(async()=>{
 assert.equal(sharp.versions.sharp,'0.35.5');
 const rsvg=sharp.versions.rsvg.split('.').map(Number);
 assert.ok(rsvg[0]>2||rsvg[0]===2&&(rsvg[1]>63||rsvg[1]===63&&rsvg[2]>=2),'Use the patched librsvg binary');
 const png=await sharp({create:{width:24,height:16,channels:4,background:'#bf3e00'}}).resize(12,8).png().toBuffer();
 const jpeg=await sharp(png).jpeg().toBuffer();const meta=await sharp(jpeg).metadata();assert.equal(meta.width,12);assert.equal(meta.height,8);assert.equal(meta.format,'jpeg');
 for(const newline of ['\n','\r','\u2028','\u2029'])assert.throws(()=>quote(['echo','ok',{comment:'note'},`literal${newline}echo SHOULD_NOT_RUN`]),TypeError);
 const tokens=['ጤና','hello world','single\'quote','$literal',';literal'];assert.deepEqual(parse(quote(tokens)),tokens);
 console.log('Patched image codec and PNG/JPEG transforms pass; comment/newline command injection is rejected and normal Unicode quoting preserved.');
})().catch(e=>{console.error(e);process.exit(1);});
