import fs from 'node:fs';
import ts from 'typescript';
import { messageKey } from '../lib/i18n/core.ts';
const locales = ['am','om','so','ti'];
const catalogs = Object.fromEntries(locales.map(locale => [locale, {}]));
const seen = new Map();
for (const line of fs.readFileSync('locales/interface.tsv','utf8').trim().split('\n')) {
  const [source,...values] = line.split('\t');
  if(values.length !== 4 || values.some(value => !value)) throw Error(`Incomplete translations: ${source}`);
  const key=messageKey(source);
  if(seen.has(key)) throw Error(`Duplicate key: ${source} / ${seen.get(key)}`);
  seen.set(key,source);
  const tokens = value => [...value.matchAll(/\{([A-Za-z][A-Za-z0-9_]*)\}/g)].map(match=>match[1]).sort().join(',');
  values.forEach((value,i)=>{
    if(tokens(source)!==tokens(value))throw Error(`Interpolation mismatch: ${locales[i]} ${source}`);
    catalogs[locales[i]][key]=value;
  });
}
// Explicit aliases for platform-owned status/labels; never applied to user content.
const aliases=JSON.parse(fs.readFileSync('locales/aliases.json','utf8'));
for(const [source,target] of Object.entries(aliases)){
  if(!seen.has(messageKey(target)))throw Error(`Unknown alias ${target}`);
  if(seen.has(messageKey(source)))throw Error(`Duplicate alias ${source}`);
  seen.set(messageKey(source),source);
  for(const locale of locales)catalogs[locale][messageKey(source)]=catalogs[locale][messageKey(target)];
}
for(const locale of locales){
  const content=JSON.stringify(catalogs[locale],null,2)+'\n';
  const file=`lib/i18n/messages/${locale}.json`;
  if(process.argv.includes('--check')){if(fs.readFileSync(file,'utf8')!==content)throw Error(`Rebuild ${file}`);}
  else fs.writeFileSync(file,content);
}
// Omit copy used exclusively by server renderers from the browser context.
// Keep all dynamic/shared constants and all unknown keys conservatively.
const serverOnly = new Set(), shared = new Set();
for (const root of ['app','components','lib','apps/mobile/app','apps/mobile/src']) for (const name of fs.readdirSync(root,{recursive:true})) {
  if (!/\.(ts|tsx)$/.test(name)) continue;
  const file=`${root}/${name}`, source=fs.readFileSync(file,'utf8');
  const ast=ts.createSourceFile(file,source,ts.ScriptTarget.Latest,true,name.endsWith('.tsx')?ts.ScriptKind.TSX:ts.ScriptKind.TS);
  function visit(node) {
    if(ts.isStringLiteralLike(node)) {
      const key=messageKey(node.text);
      if(seen.has(key)) {
        const serverCall=source.includes('getUiText') && ts.isCallExpression(node.parent) && node.parent.expression.getText(ast)==='t' && node.parent.arguments[0]===node;
        (serverCall?serverOnly:shared).add(key);
      }
    }
    ts.forEachChild(node,visit);
  }
  visit(ast);
}
const excluded=[...serverOnly].filter(key=>!shared.has(key)).sort();
const manifest=JSON.stringify(excluded,null,2)+'\n', path='lib/i18n/server-message-keys.json';
if(process.argv.includes('--check')){if(fs.readFileSync(path,'utf8')!==manifest)throw Error(`Rebuild ${path}`);}
else fs.writeFileSync(path,manifest);
console.log(`${seen.size} interface messages in each of ${locales.length} local catalogs.`);
