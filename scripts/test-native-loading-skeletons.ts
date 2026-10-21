import assert from 'node:assert/strict';
import {test} from 'node:test';
import vm from 'node:vm';
import {build} from 'esbuild';
type Element={type:string|((props:Record<string,unknown>)=>unknown);props:Record<string,unknown>&{children?:unknown}};
const compiled=build({entryPoints:['apps/mobile/src/ResourceLoading.tsx'],bundle:true,write:false,platform:'node',format:'cjs',plugins:[{name:'skeleton-native-ports',setup(b){
 b.onResolve({filter:/^(?:react(?:\/jsx-runtime)?|react-native|\.\/(?:ui|runtime))$/},a=>({path:a.path,namespace:'port'}));
 b.onLoad({filter:/.*/,namespace:'port'},a=>({loader:'js',contents:a.path==='react'?`export const useState=initial=>{const i=fixture.cursor++;if(!(i in fixture.states))fixture.states[i]=initial;return[fixture.states[i],value=>fixture.states[i]=value];};export default {};`
 :a.path==='react/jsx-runtime'?`export const jsx=(type,props)=>({type,props}),jsxs=jsx,Fragment='Fragment';`
 :a.path==='react-native'?`export const View='View',Text='Text',StyleSheet={create:value=>value},useWindowDimensions=()=>fixture.dimensions;`
 :a.path==='./runtime'?`export const useApp=()=>({t:key=>key});`
 :`export const Status='Status',colors={line:'#dbe2e3',muted:'#63737a',background:'#f7f9f8'};`}));
}}]});
function nodes(value:unknown):Element[]{if(Array.isArray(value))return value.flatMap(nodes);if(!value||typeof value!=='object')return[];const node=value as Element;if(typeof node.type==='function')return nodes(node.type(node.props));return[node,...nodes(node.props.children)];}
const style=(node:Element)=>Object.assign({},...[node.props.style].flat(Infinity).filter(value=>value&&typeof value==='object')) as Record<string,unknown>;
async function fixture(){const fixture={cursor:0,states:[] as unknown[],dimensions:{width:390,height:844,fontScale:1}},module={exports:{} as Record<string,(props:Record<string,unknown>)=>unknown>};vm.runInNewContext((await compiled).outputFiles[0].text,{module,exports:module.exports,fixture});return{fixture,render:(props:Record<string,unknown>)=>{fixture.cursor=0;return nodes(module.exports.default(props));}};}
test('FE-074 native initial silhouettes match media and responsive catalog rows, with one announcement and no fake controls',async()=>{
 for(const variant of['featured','showroom','product','profile','editor','list','rows','thread','search']){
  const f=await fixture(),load={data:null,loading:true,initialLoading:true,error:'',reload(){}};let tree=f.render({load,variant});
  assert.ok(tree.some(node=>node.props.testID==='resource-skeleton-'+variant));assert.equal(tree.filter(node=>node.props.accessibilityLiveRegion==='polite').length,1);
  assert.ok(tree.some(node=>node.props.accessibilityElementsHidden===true&&node.props.importantForAccessibility==='no-hide-descendants'&&node.props['aria-hidden']===true));
  assert.ok(!tree.some(node=>['Pressable','Button','TextInput','LoadingBar','Animated.View'].includes(String(node.type))));
  for(const height of variant==='featured'?[145]:variant==='showroom'?[210,160]:variant==='product'?[270]:variant==='profile'?[48,64]:variant==='list'?[150]:variant==='search'?[98]:[])assert.ok(tree.some(node=>style(node).height===height),variant+': media/row height '+height);
  if(variant==='featured'||variant==='showroom'){
   const grid=tree.find(node=>node.props.testID==='resource-skeleton-grid')!;assert.equal(style(grid).gap,12);
   const measure=grid.props.onLayout as(event:{nativeEvent:{layout:{width:number}}})=>void;
   for(const{width,fontScale,two}of[{width:284,fontScale:1,two:false},{width:375.619049,fontScale:1,two:true},{width:724,fontScale:1.31,two:false}]){
    f.fixture.dimensions.fontScale=fontScale;measure({nativeEvent:{layout:{width}}});tree=f.render({load,variant});const cards=tree.filter(node=>node.props.testID==='resource-skeleton-card');assert.equal(cards.length,4);
    assert.ok(cards.every(node=>two?style(node).flexBasis==='47%'&&style(node).flexGrow===1:style(node).width==='100%'));
   }
  }
 }
});
test('FE-074 native refresh and error feedback leaves readable content to its caller and never emits an initial skeleton',async()=>{
 const f=await fixture(),reload=()=>{};
 for(const load of[{data:{name:'Current resource'},loading:true,initialLoading:false,error:'',reload},{data:{name:'Current resource'},loading:false,error:'offline',reload},{data:null,loading:false,error:'revoked',reload}]){
  const tree=f.render({load,variant:'product'});assert.ok(!tree.some(node=>String(node.props.testID||'').startsWith('resource-skeleton-')));const status=tree.find(node=>node.type==='Status');assert.ok(status);assert.equal(status.props.loading,false);assert.equal(status.props.refreshing,load.loading);assert.equal(status.props.error,load.error);assert.equal(status.props.retry,reload);
 }
});

test('FE-021 B10 Featured category silhouettes match readable tile, illustration, wrapping-name and secondary schedule anatomy',async()=>{
 const f=await fixture(),load={data:null,loading:true,initialLoading:true,error:'',reload(){}};
 for(const fontScale of [1,1.3,2]){f.fixture.dimensions.fontScale=fontScale;const tree=f.render({load,variant:'featured'}),row=tree.find(node=>node.props.testID==='resource-skeleton-featured-categories');assert.ok(row);assert.equal(row.type,'View');assert.equal(style(row).flexDirection,'row');assert.equal(style(row).overflow,'hidden');assert.equal(style(row).maxWidth,'100%');assert.equal(style(row).gap,8);assert.equal(style(row).pointerEvents,'none');const tiles=nodes(row.props.children).filter(node=>node.props.testID==='resource-skeleton-featured-category');assert.equal(tiles.length,4);for(const tile of tiles){assert.equal(style(tile).width,176);assert.equal(style(tile).minHeight,96);assert.equal(style(tile).height,undefined);assert.equal(style(tile).flexShrink,0);assert.equal(style(tile).padding,10);assert.equal(style(tile).gap,8);const parts=nodes(tile.props.children),heading=parts.find(node=>node.props.testID==='resource-skeleton-featured-category-heading')!,art=parts.find(node=>node.props.testID==='resource-skeleton-featured-category-art')!,name=parts.find(node=>node.props.testID==='resource-skeleton-featured-category-name')!,schedule=parts.find(node=>node.props.testID==='resource-skeleton-featured-category-schedule')!;assert.equal(style(heading).flexDirection,'row');assert.equal(style(heading).gap,8);const artBlocks=nodes(art.props.children);assert.equal(artBlocks.length,1);assert.equal(style(artBlocks[0]).height,32);assert.equal(style(artBlocks[0]).width,32);assert.equal(style(name).flex,1);assert.equal(style(name).minWidth,0);const lines=nodes(name.props.children);assert.equal(lines.length,2);assert.ok(lines.every(line=>style(line).height===14));assert.equal(style(lines[0]).width,'100%');assert.equal(style(lines[1]).width,'82%');const secondary=nodes(schedule.props.children);assert.equal(secondary.length,1);assert.equal(style(secondary[0]).height,12);assert.equal(style(secondary[0]).width,'86%');assert.ok(!parts.some(node=>['Pressable','Button','TextInput','ScrollView'].includes(String(node.type))));}assert.equal(tree.filter(node=>node.props.accessibilityLiveRegion==='polite').length,1);assert.equal(tree.filter(node=>node.props.testID==='resource-skeleton-card').length,4);}
});
