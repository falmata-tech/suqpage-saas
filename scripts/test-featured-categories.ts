import assert from 'node:assert/strict';
import {after,test} from 'node:test';
import fs from 'node:fs';
import ts from 'typescript';
import {build} from 'esbuild';
import {chromium,type Browser} from '@playwright/test';

// Execute the actual navigation and production styles. Only Link and translation
// context are controlled; catalogs and interpolation are real. No API fixture is
// presented as a server-backed workflow; the local Chrome review covers that.
const source=ts.createSourceFile('FeaturedShowroomsWorkspace.tsx',fs.readFileSync('components/FeaturedShowroomsWorkspace.tsx','utf8'),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
function declaration(name:string){
  const node=source.statements.find((node):node is ts.FunctionDeclaration=>ts.isFunctionDeclaration(node)&&node.name?.text===name);
  assert.ok(node,`Actual ${name} declaration exists`);return node.getText(source);
}
const compiled=build({stdin:{loader:'tsx',resolveDir:process.cwd(),contents:`
 import React,{useEffect,useRef,useState}from'react';import{createRoot}from'react-dom/client';
 import CategoryIllustration from'./components/CategoryIllustration';
 import{BUSINESS_CATEGORY_OPTIONS}from'./lib/business-categories';
 import{createUiText}from'./lib/i18n/core';import am from'./lib/i18n/messages/am.json';import om from'./lib/i18n/messages/om.json';
 const locale=new URLSearchParams(location.search).get('locale')||'en';
 const text=createUiText(locale==='am'?am:locale==='om'?om:{});function useUiText(){return text;}
 function Link({scroll,...props}){return <a {...props} onClick={event=>{event.preventDefault();window.selectDay(Number(props['data-featured-day']));}}/>;}
 ${declaration('featuredHref')}
 ${declaration('FeaturedWeekNav')}
 const days=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
 const schedule=BUSINESS_CATEGORY_OPTIONS.slice(0,7).map((c,i)=>({weekday:i,dayLabel:days[i],dateLabel:(18+i)+' Oct',industryLabel:c.label,industryIcon:c.key,isToday:i===2}));
 function App(){const[selectedWeekday,setSelected]=useState(6);window.selectDay=setSelected;return <div className="public-featured-experience"><div className="featured-experience"><FeaturedWeekNav featured={{selectedWeekday,schedule}}/></div></div>;}
 createRoot(document.getElementById('root')!).render(<App/>);
`},bundle:true,write:false,platform:'browser',format:'iife',jsx:'automatic'});
let browser:Browser|undefined;after(async()=>{await browser?.close();});
for(const locale of['en','am','om'])test(`FE-021 B10 ${locale} categories stay readable with scoped horizontal navigation`,async t=>{
  browser??=await chromium.launch({channel:'chrome',headless:true});
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});t.after(()=>context.close());
  const page=await context.newPage();const errors:string[]=[];page.on('pageerror',error=>errors.push(error.message));
  await page.route('http://featured-categories.fixture/**',route=>route.fulfill({contentType:'text/html',body:'<div id="root"></div>'}));
  await page.goto('http://featured-categories.fixture/?locale='+locale);
  for(const file of['app/globals.css','app/landing.css','app/discovery.css','app/navigation.css'])await page.addStyleTag({content:fs.readFileSync(file,'utf8')});
  await page.addScriptTag({content:(await compiled).outputFiles[0].text});
  await page.locator('.featured-week a[aria-current="date"]').waitFor();
  for(const sample of[{width:1440,font:16},{width:1024,font:16},{width:390,font:16},{width:320,font:16},{width:320,font:32}]){
    await page.setViewportSize({width:sample.width,height:844});await page.addStyleTag({content:`html{font-size:${sample.font}px}`});
    for(const day of[6,0,4]){
      // Controlled Link updates the actual component as route data would.
      await page.evaluate(day=>(window as unknown as{selectDay:(day:number)=>void}).selectDay(day),day);
      await page.waitForFunction(day=>document.querySelector(`[data-featured-day="${day}"]`)?.getAttribute('aria-current')==='date',day);
      await page.evaluate(()=>new Promise<void>(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve()))));
      const state=await page.locator('.featured-week').evaluate(nav=>{
        const rect=nav.getBoundingClientRect();
        return{overflow:document.documentElement.scrollWidth>innerWidth+1,labels:[...nav.querySelectorAll<HTMLElement>('a')].map(link=>{
          const name=link.querySelector<HTMLElement>('.featured-category-name')!,date=link.querySelector<HTMLElement>('.featured-category-date')!,art=link.querySelector('svg')!;
          const n=name.getBoundingClientRect(),d=date.getBoundingClientRect(),a=art.getBoundingClientRect(),r=link.getBoundingClientRect(),style=getComputedStyle(name);
          return{category:name.textContent,accessible:link.getAttribute('aria-label'),current:link.getAttribute('aria-current'),href:link.getAttribute('href'),font:Number.parseFloat(style.fontSize),dateFont:Number.parseFloat(getComputedStyle(date).fontSize),visible:style.display!=='none'&&style.visibility!=='hidden'&&n.height>0,clipped:name.scrollHeight>name.clientHeight+1||name.scrollWidth>name.clientWidth+1,inside:n.left>=r.left&&n.right<=r.right&&n.top>=r.top&&d.bottom<=r.bottom,artSize:a.width,artHidden:art.getAttribute('aria-hidden'),height:r.height,width:r.width,fullyInRow:r.left>=rect.left-.5&&r.right<=rect.right+.5};
        })};
      });
      assert.equal(state.overflow,false);assert.equal(state.labels.length,7);
      for(const[index,label]of state.labels.entries()){
        assert.ok(label.visible&&!label.clipped&&label.inside,'Each complete category name stays inside its tile: '+JSON.stringify({sample,day,label}));
        assert.ok(label.font>=14&&label.font>label.dateFont,'Category is primary, date secondary');
        assert.ok(label.height>=48&&label.width>=48);assert.equal(label.artSize,32);assert.equal(label.artHidden,'true');
        assert.ok(label.accessible?.startsWith(label.category!));assert.equal(label.href,`/featured?featuredDay=${index}#daily-featured-title`);
      }
      assert.equal(state.labels.filter(label=>label.current).length,1);assert.ok(state.labels[day].fullyInRow,'Current choice is visible without scrolling the page');
    }
  }
  await page.locator('[data-featured-day="4"]').focus();await page.keyboard.press('Tab');
  assert.equal(await page.locator('[data-featured-day="5"]').evaluate(node=>node===document.activeElement),true);
  assert.deepEqual(errors,[]);
});
