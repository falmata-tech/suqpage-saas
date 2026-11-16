import {isStarterAbout,isStarterOffering} from "./category-starter";
import {starterContacts} from "./business-starter";
import type { ShopPageContent } from "./owner-page-domain";
import type { Product } from "./types";
import {isPublicProduct} from './offerings';
import type {LegacyStarterReviewHold} from './legacy-starter-review';

export type PublicationCheck = { key:"about"|"contacts"|"location"|"offerings"; label:string; ready:boolean; href:string };
function exampleContact(key:string,value:string):boolean {
  if(value===starterContacts[key as keyof typeof starterContacts])return true;
  if(key==='phone'||key==='whatsapp')return /^\+?447700900\d{3}$/.test(value.replace(/[ ()-]/g,''));
  if(key==='email'||key==='website') {
    let host='';
    try {host=key==='email'?value.split('@').pop()||'':new URL(value).hostname;}catch{return true;}
    return /(?:^|\.)(?:example\.(?:com|net|org)|test|invalid|example|local|localhost)$/i.test(host);
  }
  return value.toLowerCase()==='your_business_example';
}
export function publicationReadiness(content: ShopPageContent, products: (Pick<Product,"name"|"description"|"is_published">&Partial<Pick<Product,'id'|'offering_kind'>>)[], locationConfirmed:boolean,legacyHold?:LegacyStarterReviewHold): PublicationCheck[] {
  const contacts = content.contacts || {};
  const listed = products.filter(product=>product.is_published&&(product.offering_kind===undefined||isPublicProduct(product)));
  const sampleContacts = Object.entries(contacts).some(([key,value])=>value && exampleContact(key,value));
  const heldProductIds=new Set(legacyHold?.productIds||[]);
  const sampleOffering = listed.some(product=>isStarterOffering(product.name,product.description)||(product.id!==undefined&&heldProductIds.has(product.id)));
  return [
    {key:"about",label:"Describe your business",ready:Boolean(content.about.trim()) && !isStarterAbout(content.about) && !legacyHold?.about,href:"#shop-about"},
    {key:"contacts",label:"Add your real contact details",ready:Object.values(contacts).some(Boolean) && !sampleContacts,href:"#public-phone"},
    {key:"location",label:"Choose your business location",ready:locationConfirmed,href:"/dashboard/business"},
    {key:"offerings",label:"Review your products",ready:listed.length>0 && !sampleOffering,href:"/dashboard/products"},
  ];
}
