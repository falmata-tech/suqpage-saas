import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium,expect as baseExpect} from '@playwright/test';
const before=process.argv.includes('--before'),actualTiles=process.argv.includes('--actual-tiles'),phase=before?'before':actualTiles?'actual':'after',out=process.env.SUQPAGE_CAPTURE_DIR||'.local/map-marker-white-edge-review';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch(),expect=baseExpect.configure({timeout:30000}),records=[];
const cream='#f5f2e8',tile='<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256"><rect width="256" height="256" fill="'+cream+'"/><path d="M0 40L256 180M40 0L180 256" stroke="#fff" stroke-width="10"/><path d="M0 40L256 180M40 0L180 256" stroke="#d5d3cc" stroke-width="2"/></svg>';
function rgb(value){if(value.startsWith('#'))return [1,3,5].map(i=>parseInt(value.slice(i,i+2),16));const channels=value.match(/[\d.]+/g);assert.ok(channels&&channels.length>=3,`Expected resolved RGB color, got ${value}`);return channels.slice(0,3).map(Number);}
function luminance(value){const channels=rgb(value).map(n=>{n/=255;return n<=.04045?n/12.92:((n+.055)/1.055)**2.4;});return channels[0]*.2126+channels[1]*.7152+channels[2]*.0722;}
function contrast(a,b){const values=[luminance(a),luminance(b)].sort((a,b)=>b-a);return (values[0]+.05)/(values[1]+.05);}
try{
 for(const [native,base] of [[false,'http://127.0.0.1:3102'],[true,'http://localhost:8082']])for(const width of actualTiles?[1440,390]:[1440,390,320]){
  const context=await browser.newContext({viewport:{width,height:900}}),page=await context.newPage();const errors=[];page.on('pageerror',error=>errors.push(error.message));page.setDefaultNavigationTimeout(90000);
  if(!actualTiles)await context.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:tile}));
  await page.goto(base+'/?q=demo-aloe-field-care&view=map');const map=page.locator('.leaflet-container');await expect(map).toHaveAttribute('data-map-marker-count','1');
  const shop=native?page.getByRole('button',{name:'Aloe Field Care. Open page preview',exact:true}):page.locator('.mp-map-showroom');await expect(shop).toBeVisible();
  if(actualTiles)await expect.poll(()=>map.locator('img.leaflet-tile-loaded').count()).toBeGreaterThan(3);
  const label=native?shop.getByText('Aloe Field Care',{exact:true}):shop.locator('b');
  if(!before){await expect(label).toHaveCSS('background-color','rgb(255, 244, 233)');await expect(label).toHaveCSS('color','rgb(201, 54, 0)');}
  const styles=await label.evaluate(el=>{const s=getComputedStyle(el);return {color:s.color,background:s.backgroundColor,fontSize:parseFloat(s.fontSize),fontWeight:s.fontWeight};});
  const glyph=await shop.locator('rect').first().evaluate(el=>({edge:getComputedStyle(el).stroke,fill:getComputedStyle(el).fill,width:getComputedStyle(el).strokeWidth}));
  const roof=await shop.locator('path').first().evaluate(el=>getComputedStyle(el).stroke);
  const measurements={textContrast:contrast(styles.color,styles.background),fillContrast:contrast(glyph.fill,cream),edgeContrast:contrast(glyph.edge,cream),...glyph,...styles};
  if(!before){assert.ok(measurements.textContrast>=4.5);assert.ok(measurements.fillContrast>=3);assert.ok(styles.fontSize>=11);assert.ok(!/rgba\(.+,\s*0\./.test(styles.background),'Nameplate is solid');assert.equal(styles.background,'rgb(255, 244, 233)','Warm cream nameplate');assert.equal(styles.color,'rgb(201, 54, 0)','Orange name text');assert.equal(glyph.edge,'rgb(255, 255, 255)','White outline around shop');assert.equal(roof,'rgb(255, 255, 255)','White outline around roof');assert.equal(parseFloat(glyph.width),1.5,'Thin rim');}
  assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));await page.screenshot({path:`${out}/${phase}-${native?'mobile':'web'}-${width}.png`,style:'nextjs-portal{visibility:hidden}'});
  const initialZoom=Number(await map.getAttribute('data-map-zoom'));if(native)await shop.click();else await shop.locator('xpath=..').click();
  const preview=native?page.getByRole('button',{name:'Explore this business',exact:true}):page.locator('dialog[open]');await expect(preview).toBeVisible();assert.ok(Number(await map.getAttribute('data-map-zoom'))>=initialZoom);assert.ok(new URL(page.url()).searchParams.get('q')==='demo-aloe-field-care');
  const selected=native?map.getByRole('button',{name:'Aloe Field Care. Open page preview',exact:true}).getByText('Aloe Field Care',{exact:true}):map.locator('.mp-map-showroom.is-selected > b');await expect(selected).toBeAttached();
  const selectedColors=await selected.evaluate(el=>({color:getComputedStyle(el).color,background:getComputedStyle(el).backgroundColor}));if(!before)assert.ok(contrast(selectedColors.color,selectedColors.background)>=4.5);
  await page.screenshot({path:`${out}/${phase}-${native?'mobile':'web'}-selected-${width}.png`,style:'nextjs-portal{visibility:hidden}'});assert.deepEqual(errors,[]);records.push({client:native?'Expo browser':'web',width,measurements,selectedContrast:contrast(selectedColors.color,selectedColors.background),previewAndNoZoomOut:true});await context.close();
 }
 if(!before){
  const context=await browser.newContext({viewport:{width:390,height:900}}),page=await context.newPage();
  if(!actualTiles)await context.route('https://tile.openstreetmap.org/**',route=>route.fulfill({contentType:'image/svg+xml',body:tile}));
  await page.goto('http://127.0.0.1:3102/?view=map');const cluster=page.locator('.mp-map-cluster').first();await expect(cluster).toBeVisible();
  const styles=await cluster.evaluate(el=>({edge:getComputedStyle(el).borderTopColor,count:Number(el.querySelector('b').textContent)}));
  assert.ok(styles.count>=2);assert.equal(styles.edge,'rgb(255, 255, 255)','Original cluster rim restored');
  // Style fixtures exercise status/terminal-group CSS when current public presence is absent.
  const groupedStyles=await page.locator('.leaflet-container').evaluate(el=>{
   const fixture=document.createElement('div');fixture.innerHTML='<span class="mp-map-nearby"><b>2</b><small>Nearby</small><span class="mp-map-status mp-map-status-featured">Featured</span></span>';el.append(fixture);
   const result=[...fixture.querySelectorAll('.mp-map-nearby,.mp-map-status')].map(node=>getComputedStyle(node).borderTopColor);fixture.remove();return result;
  });assert.deepEqual(groupedStyles,['rgb(255, 255, 255)','rgb(255, 255, 255)'],'Original nearby/badge rims restored');
  const zoom=Number(await page.locator('.leaflet-container').getAttribute('data-map-zoom'));await cluster.locator('xpath=..').press('Enter');
  await expect.poll(async()=>Number(await page.locator('.leaflet-container').getAttribute('data-map-zoom'))).toBeGreaterThan(zoom);
  records.push({client:'web groups',width:390,count:styles.count,originalClusterEdge:styles.edge,keyboardExpansion:true,nearbyAndBadge:'original white rims; computed CSS fixture'});await context.close();
 }
 fs.writeFileSync(`${out}/${phase}-verified.json`,JSON.stringify({records,tile:actualTiles?'actual OpenStreetMap tiles, normal browser visits':'controlled representative cream backdrop',publicCatalog:'actual local Aloe Field Care; actual web clusters',businessWrites:0},null,2));console.log('PASS '+phase+' marker/name/selection/preview states across desktop/phone web and Expo');
}finally{await browser.close();}
