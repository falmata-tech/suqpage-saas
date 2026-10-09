import {isBusinessCategoryKey,type BusinessCategoryKey} from './business-categories';
import {parseShopPageContent} from './owner-page-domain';
import {DEMO_PROCESS_VIDEOS} from './demo-process-videos';
import {productVideoWatchUrl} from './video/product-video';
import {starterContacts,starterOfferings,type StarterOffering} from './business-starter';

// Explicit editable examples, persisted only when a NEW workspace/item is created.
const examples={
 electronics:{image:'nova-assembly',video:DEMO_PROCESS_VIDEOS.electronics.ref,item:'electronic device',description:'Compare a compact device and the support available for it.',service:'device setup and repair',custom:'custom device assembly'},
 'beauty-wellness':{image:'afia-botanics',video:DEMO_PROCESS_VIDEOS.soap.ref,item:'personal care product',description:'Explore textures, ingredients and a simple daily care routine.',service:'personal care consultation',custom:'custom care set'},
 'agriculture-growers':{image:'green-terrace-farm',video:DEMO_PROCESS_VIDEOS.farming.ref,item:'fresh produce',description:'Browse seasonal produce and ask about what is ready to collect.',service:'growing consultation',custom:'produce supply order'},
 'food-farming':{image:'blue-nile-apiary',video:DEMO_PROCESS_VIDEOS.honey.ref,item:'honey jar',description:'Browse a honey jar and ask about available sizes and supply.',service:'food supply consultation',custom:'custom food gift set'},
 'machinery-tools':{image:'addis-metalworks',video:DEMO_PROCESS_VIDEOS.metal.ref,item:'metalwork piece',description:'Explore finishes and sizes, then discuss the work you need.',service:'fabrication service',custom:'custom metalwork order'},
 'home-living':{image:'warka-furniture',video:DEMO_PROCESS_VIDEOS.furniture.ref,item:'furniture piece',description:'Compare materials and styles for your home or workspace.',service:'furniture design consultation',custom:'made-to-order furniture'},
 'fashion-textiles':{image:'selam-weave',video:DEMO_PROCESS_VIDEOS.apparel.ref,item:'woven garment',description:'Explore fabrics, colors and sizing for everyday wear.',service:'fitting and styling service',custom:'custom garment order'},
 'other-manufacturing':{image:'entoto-ceramics',video:DEMO_PROCESS_VIDEOS.ceramics.ref,item:'handmade piece',description:'Browse practical handmade pieces and discuss your ideas.',service:'custom work consultation',custom:'made-to-order set'},
} as const satisfies Record<BusinessCategoryKey,{image:string;video:string;item:string;description:string;service:string;custom:string}>;

export function categoryStarter(category:BusinessCategoryKey,city='Addis Ababa'){
 const example=examples[category],root=`/uploads/seed/benchmarks/${example.image}`;
 const offerings:StarterOffering[]=starterOfferings.map((offering,index)=>({...offering,name:`Sample ${index===0?example.item:index===1?example.service:example.custom}`,slug:offering.slug,description:`Sample ${index===0?'product':index===1?'service':'custom work'}: ${example.description} ${index===1?'Contact us to plan a session.':index===2?'Tell us what you would like made.':'Ask about available choices.'}`,image:`${root}/product-${index+1}.jpg`,galleryImage:`${root}/product-${index===2?1:index+2}.jpg`}));
 const page=parseShopPageContent({template:'profile-v1',coverStyle:'blended',introduction:'',about:`Sample page: ${example.description} Based in ${city}, we welcome questions about our products, services and custom work. Replace this example with your own story.`,heroImage:`${root}/hero.jpg`,videoUrl:productVideoWatchUrl(example.video),contacts:starterContacts});
 return {videoRef:example.video,page,offerings};
}
export function categoryExampleVideo(category:unknown):string{return examples[typeof category==='string'&&isBusinessCategoryKey(category)?category:'other-manufacturing'].video;}
const allSamples=[...starterOfferings,...Object.keys(examples).flatMap(category=>categoryStarter(category as BusinessCategoryKey).offerings)];
const sampleNames=new Set(allSamples.map(sample=>sample.name)),sampleDescriptions=new Set(allSamples.map(sample=>sample.description));
export function isStarterOffering(name:string,description:string):boolean{return sampleNames.has(name)||sampleDescriptions.has(description);}
