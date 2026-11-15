import {createHash} from 'node:crypto';
import {demoCatalogStage, type DemoCatalogProduct} from './demo-catalog-scenarios';
import type {ShopPageContent} from './owner-page-domain';
import {preS200LeadTimes,preS200StageUpdates} from './demo-scenario-copy-v1-before';

export type PublicDemoProductCopy={id:number;description:string;leadTimeSummary:string};
export type PublicDemoCopy={businessDescription:string;page:ShopPageContent;products:PublicDemoProductCopy[]};
export type DemoCopyPlan={after:PublicDemoCopy;changed:boolean;changedProductIds:number[];beforeHash:string;afterHash:string};
const hash=(value:unknown)=>createHash('sha256').update(JSON.stringify(value)).digest('hex');
function requireOneOf(value:string,allowed:readonly string[],field:string){
 if(!allowed.includes(value))throw Error(`Unexpected current demo ${field}.`);
}
function cleanStory(value:string,businessName:string){
 const marker=`This fictional ${businessName} showroom is designed for `;
 const occurrences=value.split(marker).length-1;
 if(occurrences>1)throw Error('Repeated demo story marker.');
 const cleaned=occurrences===1?value.replace(marker,'For '):value;
 if(/\b(?:fictional|illustrative)\b/i.test(cleaned))throw Error('Unexpected demo story disclaimer.');
 return cleaned;
}
function finish(before:PublicDemoCopy,after:PublicDemoCopy):DemoCopyPlan{
 const changedProductIds=after.products.filter((product,index)=>
  product.description!==before.products[index]?.description||
  product.leadTimeSummary!==before.products[index]?.leadTimeSummary).map(product=>product.id);
 return {after,changed:hash(before)!==hash(after),changedProductIds,
  beforeHash:hash(before),afterHash:hash(after)};
}

/** Pure, strict copy mapping. A changed template is never guessed from a loose
 * regex: the current published text must equal the exact stage-one predecessor
 * or its reviewed successor, including the retained original description. */
export function planEnrolledDemoCopy(input:{businessName:string;copy:PublicDemoCopy;
 baseline:ShopPageContent;bindings:readonly DemoCatalogProduct[];stage:number}):
 DemoCopyPlan & {baselineAfter:ShopPageContent}{
 const {businessName,copy,baseline,bindings,stage}=input;
 if(bindings.length!==copy.products.length||bindings.length<2||stage<0||stage>5)
  throw Error('Invalid enrolled demo copy cohort.');
 const plans=demoCatalogStage(bindings,stage);
 const primary=plans[0],primaryPhase=(stage+primary.binding.phaseOffset)%6;
 const oldStatus=`${primary.binding.parameters.productName}: ${preS200StageUpdates[primary.binding.scenarioKey][primaryPhase]}`;
 const newStatus=primary.plan.businessUpdate;
 const baselineAfter={...baseline,
  about:cleanStory(baseline.about,businessName),
  introduction:cleanStory(baseline.introduction,businessName)};
 const oldStory=baseline.about||baseline.introduction;
 const newStory=baselineAfter.about||baselineAfter.introduction;
 requireOneOf(copy.page.introduction,
  [`${primary.plan.stage.title}. ${oldStatus}`,`${primary.plan.stage.title}. ${newStatus}`],'introduction');
 requireOneOf(copy.page.about,
  [oldStatus,newStatus].flatMap(status=>[oldStory,newStory].map(story=>[status,story].filter(Boolean).join('\n\n'))),
  'about');
 const byId=new Map(copy.products.map(product=>[product.id,product]));
 if(byId.size!==copy.products.length)throw Error('Duplicate demo product copy.');
 const products=plans.map(({binding,plan})=>{
  const product=byId.get(binding.productId);
  if(!product)throw Error('Demo catalog product changed.');
  const phase=(stage+binding.phaseOffset)%6;
  const oldUpdate=preS200StageUpdates[binding.scenarioKey][phase];
  const expectedOld=[oldUpdate,binding.baselineDescription].filter(Boolean).join('\n\n');
  const expectedNew=[plan.productUpdate,binding.baselineDescription].filter(Boolean).join('\n\n');
  requireOneOf(product.description,[expectedOld,expectedNew],`product ${product.id} description`);
  const oldLeadTime=preS200LeadTimes[plan.product.leadTimeSummary]??plan.product.leadTimeSummary;
  requireOneOf(product.leadTimeSummary,[oldLeadTime,plan.product.leadTimeSummary],
   `product ${product.id} lead time`);
  return {id:product.id,description:expectedNew,leadTimeSummary:plan.product.leadTimeSummary};
 });
 const after={businessDescription:cleanStory(copy.businessDescription,businessName),
  page:{...copy.page,introduction:`${primary.plan.stage.title}. ${newStatus}`,
   about:[newStatus,newStory].filter(Boolean).join('\n\n')},products};
 return {...finish(copy,after),baselineAfter};
}

/** The two ownerless portfolio pages have story disclaimers but no simulator
 * stage or enrollment baseline. Their product copy must stay byte-identical. */
export function planLegacyDemoCopy(input:{businessId:number;businessName:string;copy:PublicDemoCopy}):DemoCopyPlan{
 if(input.businessId!==50&&input.businessId!==62)throw Error('Unreviewed ownerless demo.');
 const {businessName,copy}=input;
 return finish(copy,{businessDescription:cleanStory(copy.businessDescription,businessName),
  page:{...copy.page,about:cleanStory(copy.page.about,businessName),
   introduction:cleanStory(copy.page.introduction,businessName)},products:copy.products});
}
