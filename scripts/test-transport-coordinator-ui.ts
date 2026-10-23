import assert from 'node:assert/strict';
import {test} from 'node:test';
import React from 'react';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import fs from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {createUiText} from '../lib/i18n/core';

const bundle=build({entryPoints:['components/TransportCoordinator.tsx'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',plugins:[{name:'display-only-boundaries',setup(b){
 b.onResolve({filter:/^@\/lib\/i18n\/ui$/},()=>({path:'ui',namespace:'fixture'}));
 b.onResolve({filter:/\.module\.css$/},()=>({path:'css',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},a=>({loader:'js',contents:a.path==='ui'?'export const useUiText=()=>fixture.t;':'export default {coordinator:"company",coordinatorIcon:"symbol"};'}));
}}]});
for(const locale of ['en','am','om'])test(`sole logistics company ${locale}: intake requires a choice and shipment receipt identifies the brokerage`,async()=>{
 const t=createUiText(locale==='en'?{}:JSON.parse(fs.readFileSync(`lib/i18n/messages/${locale}.json`,'utf8')));
 const module={exports:{} as{default:(props:{selection?:boolean;selectedId?:'shared-trucks-logistics'|null;compact?:boolean})=>React.ReactNode}};
 vm.runInNewContext((await bundle).outputFiles[0].text,{module,exports:module.exports,require:createRequire(import.meta.url),fixture:{t}});
 const fresh=renderToStaticMarkup(React.createElement(module.exports.default,{selection:true}));
 assert.ok(fresh.includes('aria-expanded="false"'));
 assert.ok(fresh.includes(t('Choose a logistics service provider')));
 assert.ok(!fresh.includes('SharedTrucks Logistics')&&!fresh.includes('sharedtrucks-logistics.png')&&!fresh.includes('STF')&&!fresh.includes('data-transport-coordinator='),'A new intake cannot look preselected');
 assert.match(fresh,/<button\b/);
 const selected=renderToStaticMarkup(React.createElement(module.exports.default,{selection:true,selectedId:'shared-trucks-logistics'}));
 for(const text of ['SharedTrucks Logistics','shared-trucks-logistics','/brands/sharedtrucks-logistics.png',t('Logistics service provider'),t('Freight brokerage'),t('Matches compatible freight with shared truck space and coordinates the shipment.'),t('Selected')])assert.ok(selected.includes(text),`${locale}: ${text}`);
 const receipt=renderToStaticMarkup(React.createElement(module.exports.default,{compact:true}));
 for(const text of ['SharedTrucks Logistics','sharedtrucks-logistics.png',t('Freight brokerage')])assert.ok(receipt.includes(text));
 assert.ok(!/<button\b/.test(receipt),'Tracking summary stays informational and compact');
});
