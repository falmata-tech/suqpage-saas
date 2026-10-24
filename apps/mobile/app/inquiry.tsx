import {copyBrowserText,openCopiedBrowserLink} from "../../../lib/browser-clipboard";
import React,{useState,useMemo,useEffect,useRef} from "react";
import {View,Platform,Pressable,Text} from "react-native";
import {useLocalSearchParams} from "expo-router";
import * as Clipboard from "expo-clipboard";
import * as Crypto from "expo-crypto";
import {buildSocialInquiryMessage,inquiryHandoffs,selectionKey} from "../../../lib/product-inquiry";
import {canOpenPublicContact} from "../../../lib/demo-inquiry-policy";
import {publicContactIsPhone,publicContactDisplay} from "../../../lib/public-contact-device";
import type {Shop,InquiryReceipt} from "@suqpage/contracts";
import {inquiryOptions} from "../src/inquiry-options";
import {useApp,useLoad,request,API,type BasketItem} from "../src/runtime";
import {useBlockedBusinesses} from "../src/blocked-businesses";
import {CatalogSafety} from "../src/CatalogSafety";
import {inquiryCatalogProduct,restoreCatalogSelections} from "../src/catalog-products";
import {useBusinessInquiry} from "../src/use-business-inquiry";
import ResourceLoading from "../src/ResourceLoading";
import {Screen,Copy,Field,Card,Button,Status,Icon,s,colors,openLink} from "../src/ui";

export default function Inquiry(){
 const blocked=useBlockedBusinesses(),{t}=useApp();
 const {handle,id,options}=useLocalSearchParams<{handle?:string;id?:string;options?:string}>();
 const load=useLoad(()=>handle?request<Shop>("shops/"+encodeURIComponent(handle)):Promise.resolve(null),[handle]);
 const shop=load.data,catalogReady=Boolean(shop&&!load.loading&&!load.error),inquiry=useBusinessInquiry(shop);
 const items=useMemo<BasketItem[]>(()=>{if(id){const p=shop?.products.find(p=>p.id===Number(id)&&inquiryCatalogProduct(p));return shop&&p?restoreCatalogSelections(shop,[{product:p,quantity:"",options:inquiryOptions(options)}]):[];}return inquiry.items;},[id,shop,options,inquiry.items]);
 const [name,setName]=useState(""),[phone,setPhone]=useState(""),[inboxMessage,setInboxMessage]=useState(""),[error,setError]=useState(""),[feedback,setFeedback]=useState(""),[busy,setBusy]=useState(false),[receipt,setReceipt]=useState<number|null>(null),[showPlatform,setShowPlatform]=useState(false);
 const submission=useRef<{payload:string;key:string}|null>(null);
 useEffect(()=>{setName("");setPhone("");setInboxMessage("");setError("");setFeedback("");setReceipt(null);setShowPlatform(false);submission.current=null;},[handle,id,options]);
 const message=shop?buildSocialInquiryMessage(shop,items.map(item=>({id:item.product.id,name:item.product.name,quantity:item.quantity,options:item.options,service:false})),API,t):"";
 useEffect(()=>{setInboxMessage(message);},[message]);
 const handoffs=shop?inquiryHandoffs(shop.contacts,message):[];
 const phoneDevice=publicContactIsPhone(Platform.OS,Platform.OS==="web"&&typeof navigator!=="undefined"?navigator.userAgent:"");
 const inquiryChannels=shop?handoffs.filter(link=>link.kind!=="phone"&&canOpenPublicContact(shop.isDemo,shop.approvedDemoContactMethods,link.kind)):[];
 async function copy(value:string){try{return Platform.OS==="web"?await copyBrowserText(value):await Clipboard.setStringAsync(value);}catch{return false;}}
 async function send(){
  if(!shop||!catalogReady||busy)return;setBusy(true);setError("");
  const body={businessId:shop.id,customerName:name,contact:phone,contactMethod:"phone",note:inboxMessage,items:items.map(item=>({productId:item.product.id,quantity:item.quantity,options:item.options}))};
  const payload=JSON.stringify(body);if(submission.current?.payload!==payload)submission.current={payload,key:Crypto.randomUUID()};
  try{
   const result=await request<InquiryReceipt>("inquiries",{body:{...body,idempotencyKey:submission.current.key}});
   if(!Number.isSafeInteger(result.inquiryId)||result.inquiryId<1||result.status!=="received")throw new Error("Your inquiry could not be sent. Please try again.");
   setReceipt(result.inquiryId);setName("");setPhone("");setInboxMessage("");
   if(!id){const sent=new Set(items.map(item=>selectionKey(item.product.id,item.options)));inquiry.setItems(current=>current.filter(item=>!sent.has(selectionKey(item.product.id,item.options))));}
  }catch(e){setError(e instanceof Error?e.message:"Your inquiry could not be sent. Please try again.");}finally{setBusy(false);}
 }
 async function handoff(link:ReturnType<typeof inquiryHandoffs>[number]){
  if(!shop||!catalogReady||!phoneDevice||!canOpenPublicContact(shop.isDemo,shop.approvedDemoContactMethods,link.kind))return;
  let copied=false,opened=false;if(Platform.OS==="web")({copied,opened}=await openCopiedBrowserLink(message,link.href,link.external));else{copied=await copy(message);try{await openLink(link.href);opened=true;}catch{}}
  setFeedback(t(copied?"Message copied. Paste it in the conversation if needed.":"Select and copy your message"));if(!opened)setError(t("Could not open the social app. Use the contact details below."));
 }
 if(shop&&blocked.list.some(b=>b.id===shop.id))return <Screen><CatalogSafety business={shop}><View/></CatalogSafety></Screen>;
 return <Screen><ResourceLoading load={load} variant="editor"/><Status error={inquiry.error} retry={inquiry.retry}/>
  {shop&&<><Copy big heading>{shop.name}</Copy>{receipt?<Card><Copy big>{t("Inquiry sent to the business.")}</Copy><Copy>{t("The business can contact you using the phone number you provided.")}</Copy></Card>:id&&catalogReady&&!items.length?<Copy>{t("This product is not available for inquiry.")}</Copy>:<>
   {items.map((item,index)=><Card key={selectionKey(item.product.id,item.options)}><Copy big>{item.product.name}</Copy>{Object.keys(item.options).length>0&&<Copy>{Object.entries(item.options).map(([k,v])=>`${k}: ${v}`).join(" · ")}</Copy>}
    {!id&&<><Field label={t("Add quantity (optional)")} value={item.quantity} maxLength={80} editable={!busy} onChangeText={quantity=>inquiry.setItems(current=>current.map((line,i)=>i===index?{...line,quantity}:line))}/><Button secondary disabled={busy} label={t("Remove")} onPress={()=>inquiry.setItems(current=>current.filter(line=>selectionKey(line.product.id,line.options)!==selectionKey(item.product.id,item.options)))}/></>}
   </Card>)}
   <Card><Copy big heading>{t("Choose how to contact")}</Copy><View style={[s.wrap,{gap:10,marginTop:12}]}>{inquiryChannels.map(link=>{
      const value=publicContactDisplay(link.kind,shop.contacts),label=link.kind==="whatsapp"?t("Send on WhatsApp"):t("Send on Telegram"),color=link.kind==="whatsapp"?"#168454":"#168ac4",surface=link.kind==="whatsapp"?"#f0faf4":"#f1f7fd",icon=link.kind==="whatsapp"?"chat":"send";
      const identity=<Text selectable numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.78} style={{color:colors.muted,fontSize:12,lineHeight:16,fontWeight:"500"}}>{value}</Text>;
      return phoneDevice?<Pressable key={link.kind} accessibilityRole="button" accessibilityLabel={`${label}: ${value}`} disabled={!catalogReady||busy} onPress={()=>void handoff(link)} style={({pressed})=>({flexGrow:1,flexBasis:"100%",minWidth:220,maxWidth:"100%",minHeight:78,borderRadius:14,borderWidth:1,borderColor:link.kind==="whatsapp"?"#b7dec5":"#b7d5f0",backgroundColor:surface,padding:12,flexDirection:"row",alignItems:"center",gap:10,opacity:pressed?0.78:1})}><Icon name={icon} color={color}/><View style={{flex:1,minWidth:0,gap:3}}><Text style={{color:colors.ink,fontSize:13,fontWeight:"700"}}>{label}</Text>{identity}</View><Icon name="arrow" size={16} color={color}/></Pressable>:<View key={link.kind} style={{flexGrow:1,flexBasis:150,minWidth:145,maxWidth:"100%",gap:8,borderRadius:14,borderWidth:1,borderColor:link.kind==="whatsapp"?"#b7dec5":"#b7d5f0",backgroundColor:surface,padding:12}}><View style={{flexDirection:"row",alignItems:"center",gap:10}}><Icon name={icon} color={color}/><View style={{flex:1,minWidth:0}}><Copy>{link.label}</Copy>{identity}</View></View><Button secondary label={t("Copy contact")} onPress={()=>void copy(value).then(ok=>setFeedback(t(ok?"Copied":"Select and copy the contact details.")))}/></View>;
    })}</View><View style={{marginTop:10}}><Button icon="chat" wrapLabel disabled={!catalogReady||busy} label={t("Send to AfricMade Inbox")} onPress={()=>{if(!showPlatform)setInboxMessage(message);setShowPlatform(value=>!value);}}/></View>
    {showPlatform&&<><Copy muted>{t("Ask about products, quantities or a general question. The business will receive your message and phone number.")}</Copy>
      <Field label={t("Your name")} autoComplete="name" value={name} maxLength={80} editable={!busy} onChangeText={setName}/>
      <Field label={t("Phone number")} autoComplete="tel" keyboardType="phone-pad" value={phone} maxLength={60} editable={!busy} onChangeText={setPhone}/>
      <Field label={t("Your message")} value={inboxMessage} maxLength={10000} multiline editable={!busy} onChangeText={setInboxMessage}/>
      <Button label={t(busy?"Sending…":"Send inquiry")} disabled={busy||!catalogReady||!inquiry.ready||!name.trim()||!phone.trim()||!inboxMessage.trim()} onPress={()=>void send()}/></>}
    <Status error={error}/>
   </Card>
   <Card>{phoneDevice&&handoffs.filter(link=>link.kind==="phone"&&canOpenPublicContact(shop.isDemo,shop.approvedDemoContactMethods,link.kind)).map(link=>{const value=publicContactDisplay(link.kind,shop.contacts);return <View key={link.kind} style={{gap:8}}><Copy>{link.label}</Copy><Copy selectable>{value}</Copy><View style={s.wrap}><Button disabled={!catalogReady||busy} label={link.label} onPress={()=>void handoff(link)}/><Button secondary label={t("Copy contact")} onPress={()=>void copy(value).then(ok=>setFeedback(t(ok?"Copied":"Select and copy the contact details.")))}/></View></View>;})}
    <Button secondary label={t("Copy message")} disabled={!catalogReady||!inquiry.ready||busy} onPress={()=>void copy(message).then(ok=>setFeedback(t(ok?"Copied":"Select and copy your message")))}/>{Boolean(feedback)&&<Copy>{feedback}</Copy>}
   </Card>
  </>}</>}
 </Screen>;
}
