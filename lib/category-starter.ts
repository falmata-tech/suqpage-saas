import {isBusinessCategoryKey,type BusinessCategoryKey} from './business-categories';
import {parseShopPageContent} from './owner-page-domain';
import {DEMO_PROCESS_VIDEOS} from './demo-process-videos';
import {productVideoWatchUrl} from './video/product-video';
import {starterContacts,starterOfferings,type StarterOffering} from './business-starter';

// Explicit editable examples, persisted only when a NEW workspace/item is created.
const examples={
 electronics:{image:'nova-assembly',video:DEMO_PROCESS_VIDEOS.electronics.ref,item:'charge controller',description:'Compare compact power devices and ask about model compatibility.',second:'backup power box',custom:'custom audio amplifier'},
 'beauty-wellness':{image:'afia-botanics',video:DEMO_PROCESS_VIDEOS.soap.ref,item:'cleansing bar',description:'Explore textures, ingredients and choices for your daily care routine.',second:'body oil',custom:'custom clay mask set'},
 'agriculture-growers':{image:'green-terrace-farm',video:DEMO_PROCESS_VIDEOS.farming.ref,item:'fresh greens',description:'Browse seasonal produce and ask about what is ready to collect.',second:'herb bunch',custom:'selected tomato crate'},
 'food-farming':{image:'blue-nile-apiary',video:DEMO_PROCESS_VIDEOS.honey.ref,item:'honey jar',description:'Compare honey products and ask about available sizes and batches.',second:'comb honey',custom:'beeswax candle set'},
 'machinery-tools':{image:'addis-metalworks',video:DEMO_PROCESS_VIDEOS.metal.ref,item:'equipment frame',description:'Explore metal products by finish and size, then discuss the dimensions you need.',second:'stainless preparation table',custom:'custom storage rack'},
 'home-living':{image:'warka-furniture',video:DEMO_PROCESS_VIDEOS.furniture.ref,item:'lounge chair',description:'Compare materials and styles for your home or workspace.',second:'wooden table',custom:'made-to-order entry bench'},
 'fashion-textiles':{image:'selam-weave',video:DEMO_PROCESS_VIDEOS.apparel.ref,item:'woven shawl',description:'Explore fabrics, colors and sizing for everyday wear.',second:'cotton wrap',custom:'custom table linen'},
 'other-manufacturing':{image:'entoto-ceramics',video:DEMO_PROCESS_VIDEOS.ceramics.ref,item:'ceramic coffee set',description:'Browse useful handmade products and share the size or finish you want.',second:'serving bowl',custom:'made-to-order vase'},
} as const satisfies Record<BusinessCategoryKey,{image:string;video:string;item:string;description:string;second:string;custom:string}>;

export function categoryStarter(category:BusinessCategoryKey,city='Addis Ababa'){
 const example=examples[category],root=`/uploads/seed/benchmarks/${example.image}`;
 const offerings:StarterOffering[]=starterOfferings.map((offering,index)=>({...offering,name:`Sample ${index===0?example.item:index===1?example.second:example.custom}`,slug:offering.slug,description:`Sample ${index===2?'made-to-order product':'product'}: ${example.description} ${index===2?'Tell us the product, size or finish you would like made.':'Ask about available choices.'}`,image:`${root}/product-${index+1}.jpg`,galleryImage:`${root}/product-${index===2?1:index+2}.jpg`}));
 const page=parseShopPageContent({template:'profile-v1',coverStyle:'blended',introduction:'',about:`Sample page: ${example.description} Based in ${city}, we welcome questions about our collection and made-to-order products. Replace this example with your own story.`,heroImage:`${root}/hero.jpg`,videoUrl:productVideoWatchUrl(example.video),contacts:starterContacts});
 return {videoRef:example.video,page,offerings};
}
export function categoryExampleVideo(category:unknown):string{return typeof category==='string'&&isBusinessCategoryKey(category)?examples[category].video:'';}
const allSamples=[...starterOfferings,...Object.keys(examples).flatMap(category=>categoryStarter(category as BusinessCategoryKey).offerings)];
const sampleNames=new Set(allSamples.map(sample=>sample.name)),sampleDescriptions=new Set(allSamples.map(sample=>sample.description));
// Retained private starter records must still fail publication readiness after
// the starter vocabulary changes. This recognizes examples, never converts them.
const legacySampleNames=new Set(['everyday product','consultation service','custom order','electronic device','device setup and repair','custom device assembly','personal care product','personal care consultation','custom care set','fresh produce','growing consultation','produce supply order','honey jar','food supply consultation','custom food gift set','metalwork piece','fabrication service','custom metalwork order','furniture piece','furniture design consultation','made-to-order furniture','woven garment','fitting and styling service','custom garment order','handmade piece','custom work consultation','made-to-order set'].map(name=>`Sample ${name}`));
export function isStarterOffering(name:string,description:string):boolean{return sampleNames.has(name)||sampleDescriptions.has(description)||legacySampleNames.has(name)||/^Sample (?:product|service|custom work): /.test(description);}
