import {useEffect,useState,useSyncExternalStore} from 'react';
import type {Shop} from '@africmade/contracts';
import {createInquiryBaskets,type BusinessInquiryItem} from './inquiry-baskets';
import {createInquiryBasketStorage} from './inquiry-basket-storage';
import {API,useApp} from './runtime';
export const businessInquiries=createInquiryBaskets(createInquiryBasketStorage(API));
// The public detail already loaded this branding. Reuse it without a second catalog request.
let currentPalette: Pick<Shop,'handle'|'accentColor'> | null = null;
const paletteListeners = new Set<() => void>();
const subscribePalette = (listener: () => void) => {
 paletteListeners.add(listener);
 return () => { paletteListeners.delete(listener); };
};
export function useInquiryAccent(handle: string | undefined) {
 return useSyncExternalStore(subscribePalette, () => currentPalette?.handle === handle ? currentPalette?.accentColor : undefined, () => undefined);
}
export function useBusinessInquiry(shop:Shop|null){
 const {basket,setBasket}=useApp();
 const [,render]=useState(0);
 useEffect(()=>{
  if(!shop || (currentPalette?.handle===shop.handle && currentPalette.accentColor===shop.accentColor))return;
  currentPalette={handle:shop.handle,accentColor:shop.accentColor};
  paletteListeners.forEach(listener=>listener());
 },[shop?.handle,shop?.accentColor]);
 useEffect(()=>{
  if(!shop)return;
  const unsubscribe=businessInquiries.subscribe(shop.id,()=>render(value=>value+1));
  // One-release bridge for an already-open app's former single-business basket.
  if(basket?.shop.id===shop.id){businessInquiries.seed(shop,basket.items);setBasket(null);}
  void businessInquiries.load(shop.id);
  return unsubscribe;
 },[shop?.id,basket]);
 const current=shop?businessInquiries.read(shop):{items:[],ready:true,error:''};
 return {...current,setItems:(change:(items:BusinessInquiryItem[])=>BusinessInquiryItem[])=>{if(shop)businessInquiries.update(shop,change);},retry:()=>{if(shop)void businessInquiries.retry(shop.id);}};
}

export function useQuoteInventory(){
 const [,render]=useState(0),[error,setError]=useState('');
 useEffect(()=>{
  const off=businessInquiries.subscribeAll(()=>render(v=>v+1));
  void businessInquiries.scan().catch(()=>setError('Your inquiry list could not be loaded.'));
  return off;
 },[]);
 return {groups:businessInquiries.groups(),error};
}
