import {useEffect,useState} from 'react';
import type {Shop} from '@suqpage/contracts';
import {createInquiryBaskets,type BusinessInquiryItem} from './inquiry-baskets';
import {createInquiryBasketStorage} from './inquiry-basket-storage';
import {API,useApp} from './runtime';
export const businessInquiries=createInquiryBaskets(createInquiryBasketStorage(API));
export function useBusinessInquiry(shop:Shop|null){
 const {basket,setBasket}=useApp();
 const [,render]=useState(0);
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
