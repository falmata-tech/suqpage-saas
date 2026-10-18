import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import {build} from 'esbuild';
import {chromium} from 'playwright';
import {expect} from '@playwright/test';
import {createUiText,type UiMessages} from '../lib/i18n/core';
import type {Catalog,Product} from '../lib/types';
import type {ShopPageContent} from '../lib/owner-page-domain';

type CardFixture={catalog:Catalog;profile:ShopPageContent;opened:number[];added:number[];selectedIds:number[];messages:UiMessages};
const longDescription='Handmade table with smooth edges, several wood finishes and a sturdy frame. '
  +'ለቤትና ለሥራ ቦታ የሚሆን ጠንካራ ጠረጴዛ። '.repeat(5)+'Available finishes are confirmed with the business.';
const product=(id:number,description:string,availability:Product['availability']='available'):Product=>({
  id,business_id:1,collection_id:null,category_id:null,name:'Fixture product '+id,slug:'fixture-'+id,
  eyebrow:'',description,image_path:'',video_ref:'',price_minor:null,currency:'ETB',quantity_unit:'piece',
  highlights_json:'[]',highlights:[],availability,offering_kind:'standard_product',quantity_mode:'optional',
  capacity_summary:'',minimum_order_summary:'',lead_time_summary:'',is_published:1,sort_order:id,option_groups:[],
});
const products=[product(1,longDescription),product(2,'Short description.'),product(3,''),
  product(4,longDescription+'long-unbroken-product-information'.repeat(20),'unavailable')];
const fixture:CardFixture={catalog:{business:{id:1,handle:'fixture-card-shop',name:'Fixture business',
  design_key:'profile',design_manifest_json:'',content_blocks_json:'',tagline:'',description:'',logo_path:'',
  hero_title:'',hero_subtitle:'',hero_image_path:'',contact_email:'',whatsapp:'',telegram:'',tiktok:'',
  process_video_ref:'',is_live:0,live_platform:'',live_url:'',status:'active',site_title:'',site_description:'',
  favicon_path:'',content_version:1},collections:[],categories:[],products},
  profile:{template:'profile-v1',coverStyle:'blended',introduction:'',about:'',heroImage:'',videoUrl:'',accentColor:'#008577'},opened:[],added:[],selectedIds:[],messages:{}};

// Actual BusinessProfile React source and compiled production CSS. Translation,
// public catalog and callbacks are controlled; no app/API/storage/device proof.
const profileBundle=build({stdin:{resolveDir:process.cwd(),loader:'jsx',contents:`
    import React from 'react';import {createRoot} from 'react-dom/client';
    import Profile from './components/showroom/BusinessProfile';
    const f=window.cardFixture;
    createRoot(document.getElementById('root')).render(<Profile catalog={f.catalog} products={f.catalog.products}
      profile={f.profile} query="" setQuery={()=>{}} filter="all" setFilter={()=>{}}
      cartCount={0} openCart={()=>{}} openProduct={product=>f.opened.push(product.id)}
      addProduct={product=>f.added.push(product.id)} selectedIds={f.selectedIds}/>);
  `},bundle:true,write:false,outfile:'cards.js',loader:{'.module.css':'local-css'},plugins:[{
    name:'card-excerpt-translation-port',setup(builder){builder.onResolve({filter:/^@\/lib\/i18n\/ui$/},()=>({path:'ui-text',namespace:'port'}));
      builder.onLoad({filter:/.*/,namespace:'port'},()=>({loader:'js',resolveDir:process.cwd(),contents:`import {createUiText} from ${JSON.stringify(process.cwd()+'/lib/i18n/core.ts')};export const useUiText=()=>createUiText(window.cardFixture.messages);`}));},
  }]});
test('FE-041 S129 phone showroom excerpts stay visible, literal and clamped without changing details or Add',{timeout:30000},async()=>{
  const bundle=await profileBundle;
  const css=bundle.outputFiles.find(file=>file.path.endsWith('.css'))!.text;
  const javascript=bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text;
  const browser=await chromium.launch({headless:true});
  try{for(const[width,height]of[[320,640],[390,844],[844,390],[1440,1000]]){
    const page=await browser.newPage({viewport:{width,height}}),errors:string[]=[];
    page.on('pageerror',error=>errors.push(error.message));
    await page.setContent('<main id="root"></main>');
    await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+css+'\nbody{margin:0}'});
    await page.evaluate(value=>{(window as unknown as{cardFixture:CardFixture}).cardFixture=value;},fixture);
    await page.addScriptTag({content:javascript});
    const cards=page.locator('[data-business-profile] article');await cards.first().waitFor();
    assert.equal(await cards.count(),4);
    for(const[index,p]of products.entries()){
      const card=cards.nth(index),paragraph=card.locator('p');
      if(!p.description){assert.equal(await paragraph.count(),0,'Empty descriptions do not create filler rows');continue;}
      assert.equal(await paragraph.textContent(),p.description,'Merchant descriptions remain literal');
      const geometry=await paragraph.evaluate(element=>{const rect=element.getBoundingClientRect(),style=getComputedStyle(element);return{
        width:rect.width,height:rect.height,lineHeight:parseFloat(style.lineHeight),display:style.display,
        clamp:style.webkitLineClamp,overflow:style.overflow,scrollHeight:element.scrollHeight,
      };});
      const context=JSON.stringify({width,product:p.id,geometry});
      assert.ok(geometry.width>0&&geometry.height>0,'Excerpt is visible '+context);
      assert.equal(geometry.clamp,'2',context);assert.equal(geometry.overflow,'hidden',context);
      assert.ok(geometry.height<=geometry.lineHeight*2+1,'Excerpt stays within two rendered lines '+context);
      if(index===0||index===3)assert.ok(geometry.scrollHeight>geometry.height,'Long text really overflows behind the clamp '+context);
    }
    assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),'No horizontal overflow at'+width);
    const add=cards.first().getByRole('button'),target=await add.boundingBox();assert.ok(target&&target.width>=44&&target.height>=44,'Established web Add target stays at least44px');
    await add.click();await cards.first().getByRole('heading',{name:'Fixture product 1',exact:true}).getByRole('link').click();
    assert.deepEqual(await page.evaluate(()=>{const f=(window as unknown as{cardFixture:CardFixture}).cardFixture;return{opened:f.opened,added:f.added};}),{opened:[1],added:[1]},'Add and details retain their separate callback boundaries');
    assert.ok(await cards.nth(3).getByRole('button').isDisabled(),'Unavailable product remains readable without an Add action');
    assert.deepEqual(errors,[]);await page.close();
  }}finally{await browser.close();}
});

test('FE-041 S129 Amharic Add and Added accessible names match the visible action and literal product',{timeout:60000},async context=>{
  let stage='bundle';context.after(()=>{if(stage!=='complete')context.diagnostic('Last fixture stage: '+stage);});
  const bundle=await profileBundle,messages=JSON.parse(fs.readFileSync('lib/i18n/messages/am.json','utf8')) as UiMessages,t=createUiText(messages);
  const css=bundle.outputFiles.find(file=>file.path.endsWith('.css'))!.text,javascript=bundle.outputFiles.find(file=>file.path.endsWith('.js'))!.text;
  stage='browser launch';const browser=await chromium.launch({headless:true,timeout:15000});
  try{for(const added of[false,true]){
    stage=added?'Added page':'Add page';
    const page=await browser.newPage({viewport:{width:390,height:844}}),errors:string[]=[];
    page.setDefaultTimeout(10000);page.on('pageerror',error=>errors.push(error.message));await page.setContent('<main id="root"></main>');
    await page.addStyleTag({content:fs.readFileSync('app/globals.css','utf8')+'\n'+css+'\nbody{margin:0}'});
    await page.evaluate(value=>{(window as unknown as{cardFixture:CardFixture}).cardFixture=value;},{...fixture,messages,selectedIds:added?[1]:[]});
    await page.addScriptTag({content:javascript});
    stage=added?'Added assertions':'Add assertions';
    const button=page.locator('[data-business-profile] article').first().getByRole('button'),action=added?'Added to inquiry list':'Add to inquiry list';
    await expect(button).toHaveText(t(action));
    await expect(button).toHaveAccessibleName(t('{value1}: {value2}',{value1:t(action),value2:products[0].name}));
    assert.equal(await button.isDisabled(),added,'The accessible label fix preserves saved-item disabling');
    assert.deepEqual(errors,[]);await page.close();
  }stage='complete';}finally{await browser.close();}
});
