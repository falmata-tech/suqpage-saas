import { STARTER_ABOUT, starterContacts, starterOfferings } from "./business-starter";
import type { ShopPageContent } from "./owner-page-domain";
import type { Product } from "./types";

export type PublicationCheck = { key:"about"|"contacts"|"location"|"offerings"; label:string; ready:boolean; href:string };
export function publicationReadiness(content: ShopPageContent, products: Pick<Product,"name"|"description"|"is_published">[], locationConfirmed:boolean): PublicationCheck[] {
  const contacts = content.contacts || {};
  const listed = products.filter(product=>product.is_published);
  const sampleContacts = Object.entries(contacts).some(([key,value])=>value && value === starterContacts[key as keyof typeof starterContacts]);
  const sampleOffering = listed.some(product=>starterOfferings.some(sample=>product.name===sample.name || product.description===sample.description));
  return [
    {key:"about",label:"Describe your business",ready:Boolean(content.about.trim()) && content.about!==STARTER_ABOUT && !content.about.startsWith("Sample page:"),href:"#shop-about"},
    {key:"contacts",label:"Add your real contact details",ready:Object.values(contacts).some(Boolean) && !sampleContacts,href:"#public-phone"},
    {key:"location",label:"Choose your business location",ready:locationConfirmed,href:"/dashboard/business"},
    {key:"offerings",label:"Replace or remove sample offerings",ready:listed.length>0 && !sampleOffering,href:"/dashboard/products"},
  ];
}
