import assert from 'node:assert/strict';
import {test} from 'node:test';
import {build} from 'esbuild';
import vm from 'node:vm';
import {createUiText, type Locale} from '../lib/i18n/core';
import am from '../lib/i18n/messages/am.json';
import om from '../lib/i18n/messages/om.json';
import so from '../lib/i18n/messages/so.json';
import ti from '../lib/i18n/messages/ti.json';

type Element = {type: string | ((props: Record<string, unknown>) => Element); props: Record<string, unknown> & {children?: Element | Element[]}};
test('FE_BASE route/root recovery stays localized, actionable and private without a layout provider', async () => {
  const result = await build({entryPoints:['app/error.tsx','app/global-error.tsx'],bundle:true,write:false,outdir:'/tmp/suqpage-recovery-contract',format:'cjs',platform:'node',plugins:[{name:'recovery-react-port',setup(b){
    b.onResolve({filter:/^react(?:\/jsx-runtime)?$/},args=>({path:args.path,namespace:'recovery'}));
    b.onLoad({filter:/.*/,namespace:'recovery'},args=>({loader:'js',contents:args.path==='react'?'export const useState=()=>[globalThis.locale,()=>{}],useEffect=()=>{};':'export const jsx=(type,props)=>({type,props}),jsxs=jsx;'}));
  }}]});
  for(const locale of ['en','am','om','so','ti'] as const){
    const t=createUiText({en:{},am,om,so,ti}[locale]);
    for(const output of result.outputFiles){
      const module={exports:{} as {default:(props:Record<string,unknown>)=>Element}};
      vm.runInNewContext(output.text,{module,exports:module.exports,locale});
      let retried=0;const root=module.exports.default({error:new Error('private_sql_token_contact_details'),retry:()=>{retried++;}});
      const nodes:Element[]=[];const visit=(node:unknown):void=>{if(!node||typeof node!=='object')return;const element=node as Element;if(typeof element.type==='function'){visit(element.type(element.props));return;}nodes.push(element);for(const child of [element.props.children].flat())visit(child);};visit(root);
      const text=(node:unknown):string=>{if(node===null||node===undefined)return '';if(typeof node!=='object')return String(node);const el=node as Element;return [el.props.children].flat().map(text).join('');};
      assert.ok(nodes.some(n=>n.type==='h1'&&text(n)===t('Unable to connect. Please try again.')));
      const button=nodes.find(n=>n.type==='button')!;assert.equal(text(button),t('Try again'));(button.props.onClick as ()=>void)();assert.equal(retried,1);
      assert.equal(nodes.find(n=>n.type==='a')?.props.href,'/');
      assert.ok(!JSON.stringify(nodes).includes('private_sql_token_contact_details'));
      if(output.path.endsWith('global-error.js')){assert.equal(root.type,'html');assert.equal(root.props.lang,locale as Locale);assert.ok(nodes.some(n=>n.type==='title'&&text(n)==='AfricMade'));}
    }
  }
});
