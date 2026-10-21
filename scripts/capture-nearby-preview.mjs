import assert from 'node:assert/strict';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium,expect} from '@playwright/test';
// Component fixture: real nearby viewer and modal, controlled public catalog.
// Real picker with a controlled public catalog; no provider, persistence or device claim.
const dir='.local/map-preview-review';fs.mkdirSync(dir,{recursive:true});
const bundle=await build({stdin:{contents:`import React,{useState} from 'react';import {createRoot} from 'react-dom/client';import {NearbyShowroomsViewer} from './components/DiscoveryWorkspace';
const shops=[1,2,3].map(id=>({id,name:'Example business '+id,tagline:'Physical products for your home. '.repeat(12),city:'Addis Ababa',region:'Addis Ababa',primaryIndustryKey:'home-care',primaryIndustryLabel:'Home care',primaryIndustryShortLabel:'Home care',heroImagePath:'',handle:'example-'+id}));
function Fixture(){const [open,setOpen]=useState(false),[selected,setSelected]=useState(null);return <><div style={{position:'fixed',inset:'0 auto 0 0',width:'70%',background:'#fff',zIndex:800}}>View products<button id="group-trigger" onClick={()=>{setSelected(null);setOpen(true)}}>Nearby businesses</button></div>{open&&<NearbyShowroomsViewer group={{key:'fixture',city:'Addis Ababa',count:3,showroomIds:[1,2,3]}} showrooms={shops} featuredNowBusinessId={null} selectedShowroomId={selected} onSelect={setSelected} onBack={()=>setSelected(null)} onClose={()=>setOpen(false)} onOpen={()=>{}}/>}</>};createRoot(document.getElementById('root')).render(<Fixture/>);`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,outfile:'fixture.js',platform:'browser',jsx:'automatic',loader:{'.module.css':'local-css'},plugins:[{name:'local-fixture',setup(build){
 build.onResolve({filter:/^(next\/link|next\/image|next\/navigation|@\/lib\/i18n\/ui|@\/components\/MarketplaceMap)$/},args=>({path:args.path,namespace:'fixture'}));
 build.onLoad({filter:/.*/,namespace:'fixture'},args=>({resolveDir:process.cwd(),loader:'jsx',contents:args.path.endsWith('/ui')?'export const useUiText=()=>((text,values={})=>text.replace(/\\{([^}]+)\\}/g,(_,key)=>String(values[key]??key)))':args.path==='next/navigation'?'export const useRouter=()=>({}),useSearchParams=()=>new URLSearchParams()':args.path.endsWith('MarketplaceMap')?'export default function Map(){return null}':`import React from 'react';export default function Element({children,...props}){return React.createElement('${args.path==='next/link'?'a':'img'}',props,children)}`}));
}}]});
const js=bundle.outputFiles.find(file=>file.path.endsWith('.js')).text,css=bundle.outputFiles.find(file=>file.path.endsWith('.css')).text;
const browser=await chromium.launch();const records=[];
try{for(const [width,height] of [[1440,900],[390,844],[320,568],[844,390]]){
 const page=await browser.newPage({viewport:{width,height}});const errors=[];page.on('pageerror',error=>errors.push(error.message));
 await page.setContent('<html><body><div id="root"></div></body></html>');
 await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+fs.readFileSync('app/discovery.css','utf8')+'\n'+css});await page.addScriptTag({content:js});
 const trigger=page.locator('#group-trigger');await trigger.click();const dialog=page.locator('dialog[open]');await expect(dialog).toBeVisible();
 assert.ok(await dialog.evaluate(el=>el.matches(':modal')));const bounds=await dialog.boundingBox();assert.ok(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=width+1&&bounds.y+bounds.height<=height+1);
 const cards=dialog.locator('.nearby-showroom-grid > button'),capacity=Number(await dialog.locator('[data-capacity]').getAttribute('data-capacity'));
 const seen=await cards.evaluateAll(nodes=>nodes.map(node=>Number(node.dataset.showroomId)));assert.ok(seen.length<=capacity);const grid=dialog.locator('.nearby-showroom-grid');assert.ok(await grid.evaluate(node=>node.scrollHeight<=node.clientHeight+1),'Picker list must not scroll internally');assert.equal(await dialog.getByRole('button',{name:/^(Next|Previous)$/,exact:true}).count(),0,'All members must fit without pagination');
 assert.deepEqual(seen,[1,2,3]);const selectedId=await cards.last().getAttribute('data-showroom-id');await cards.last().click();
 await expect(dialog.locator('.nearby-showroom-detail')).toBeVisible();const close=dialog.locator('.nearby-showroom-viewer > header > button:last-child');
 assert.ok(await close.evaluate(el=>{const r=el.getBoundingClientRect();return el.contains(document.elementFromPoint(r.x+r.width/2,r.y+r.height/2));}));
 await dialog.locator('a').scrollIntoViewIfNeeded();await expect(dialog.locator('a')).toBeInViewport();
 for(let i=0;i<7;i++){await page.keyboard.press('Tab');assert.ok(await dialog.evaluate(el=>el.contains(document.activeElement)));}
 await page.screenshot({path:`${dir}/nearby-${width}-${height}.png`});
 await dialog.locator('.nearby-showroom-back').click();await expect(dialog.locator('.nearby-showroom-grid > button[data-showroom-id="'+selectedId+'"]')).toBeFocused();
 await close.click();await expect(dialog).toHaveCount(0);await expect(trigger).toBeFocused();
 await trigger.click();await page.keyboard.press('Escape');await expect(dialog).toHaveCount(0);
 assert.deepEqual(errors,[]);records.push({width,height,capacity,seen,fixture:'component-only, fixed three-business group'});await page.close();
}fs.writeFileSync(`${dir}/nearby-verified.json`,JSON.stringify(records,null,2));console.log('PASS four all-fit group/list/detail/back states, long content, modal layering, focus and dismissal.');}finally{await browser.close();}
