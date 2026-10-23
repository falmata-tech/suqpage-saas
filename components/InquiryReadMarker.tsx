"use client";
import {useEffect,useRef} from "react";
import {useRouter} from "next/navigation";
/** Opening a visible private detail, not GET/prefetch, acknowledges first read. */
export default function InquiryReadMarker({inquiryId,businessId,readAt}:{inquiryId:number;businessId:number;readAt:string|null}){
 const element=useRef<HTMLSpanElement>(null),router=useRouter();
 useEffect(()=>{
  const node=element.current;if(!node||readAt)return;let visible=false,pending=false,done=false,disposed=false;
  const open=()=>{if(disposed||done||pending||!visible||document.visibilityState!=="visible"||!document.hasFocus())return;pending=true;
   void fetch(`/api/inquiries/${inquiryId}/read`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({businessId})}).then(result=>{if(result.ok){done=true;if(!disposed)router.refresh();}}).catch(()=>{}).finally(()=>{pending=false;});};
  const observer=new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);open();});observer.observe(node);
  window.addEventListener("focus",open);document.addEventListener("visibilitychange",open);
  return()=>{disposed=true;observer.disconnect();window.removeEventListener("focus",open);document.removeEventListener("visibilitychange",open);};
 },[inquiryId,businessId,readAt,router]);
 return <span ref={element} aria-hidden="true" data-inquiry-read-marker style={{display:"block",height:1}}/>;
}
