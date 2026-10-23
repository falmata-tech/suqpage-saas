import * as Clipboard from "expo-clipboard";
import {openCopiedBrowserLink} from "../../../lib/browser-clipboard";
import {buildSocialInquiryMessage,inquiryHandoffs,MAX_INQUIRY_SELECTIONS,selectionKey} from "../../../lib/product-inquiry";
import { storefrontAccent } from "../../../lib/storefront-accent";
import React, { useEffect, useState } from "react";
import {
  View,
  Platform,
  Pressable,
  Text,
  TextInput,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { router } from "expo-router";
import type { Shop, Offering } from "@suqpage/contracts";
import { useApp, API } from "./runtime";
import {
  Photo,
  LinkedText,
  Button,
  Chip,
  Status,
  useOpenLink,
  colors,
  Icon,
} from "./ui";
import YouTubeVideo from "./YouTubeVideo";
import { publicContactLinks, type PublicContactLink } from "../../../lib/business-profile-contacts";
import Gallery from "./Gallery";
import {Sheet} from './chrome';
import ProductSupply from './ProductSupply';
import {inquiryCatalogProduct,visibleCatalogProduct} from './catalog-products';
import {useBusinessInquiry} from './use-business-inquiry';
import {canOpenPublicContact} from '../../../lib/demo-inquiry-policy';
import {emptyShowroomBrowseState,showroomReturnMemory} from './showroom-return-state';
import {CATALOG_CARD_GAP,catalogCardStyle} from './catalog-card-layout';
export function ShowroomContent({ shop, preview = false, catalogReady = true }: { shop: Shop; preview?: boolean; catalogReady?:boolean }) {
  const { t } = useApp(), { fontScale } = useWindowDimensions();
  const inquiry=useBusinessInquiry(preview?null:shop);
  const accent = storefrontAccent(shop.accentColor);
  const openLink = useOpenLink();
  const [browse,setBrowse]=useState(()=>({...(preview?emptyShowroomBrowseState(shop.id):showroomReturnMemory.read(API,shop.id)),preview}));
  const [gridWidth,setGridWidth]=useState(0);
  const currentBrowse=browse.businessId===shop.id&&browse.preview===preview?browse:{...(preview?emptyShowroomBrowseState(shop.id):showroomReturnMemory.read(API,shop.id)),preview};
  const {query,categoryId}=currentBrowse;
  const setQuery=(value:string)=>setBrowse({...currentBrowse,query:value.slice(0,80)});
  const setCategoryId=(value:number|null)=>setBrowse({...currentBrowse,categoryId:value});
  const visibleProducts=shop.products.filter(visibleCatalogProduct);
  const categories=(shop.categories||[]).filter((category,index,all)=>Number.isSafeInteger(category.id)&&category.id>0&&category.name.trim()!==''&&all.findIndex(value=>value.id===category.id)===index).map(category=>({...category,count:visibleProducts.filter(product=>product.categoryId===category.id).length})).filter(category=>category.count>0);
  const activeCategory=categories.some(category=>category.id===categoryId)?categoryId:null;
  useEffect(()=>{
    const next={businessId:shop.id,query,categoryId:activeCategory,preview};
    if(browse.businessId!==shop.id||browse.preview!==preview||browse.categoryId!==activeCategory)setBrowse(next);
    if(!preview)showroomReturnMemory.remember(API,next);
  },[shop.id,query,activeCategory,preview]);
  const [selected, setSelected] = useState<Offering | null>(null);
  const [contactStatus,setContactStatus]=useState("");
  const [fallbackMessage,setFallbackMessage]=useState("");
  const [addingId,setAddingId]=useState<number|null>(null),[options,setOptions]=useState<Record<string,string>>({}),[notice,setNotice]=useState('');
  const choiceProduct=shop.products.find(product=>product.id===addingId&&visibleCatalogProduct(product));
  const validGroups=(product:Offering)=>product.options.every(group=>group.name.trim()!==''&&group.values.length>0&&group.values.every(value=>value.trim()!==''))&&new Set(product.options.map(group=>group.name)).size===product.options.length;
  const validOptions=(product:Offering,choices:Record<string,string>)=>validGroups(product)&&Object.keys(choices).length===product.options.length&&product.options.every(group=>Object.hasOwn(choices,group.name)&&group.values.includes(choices[group.name]));
  function closeChoices(){setAddingId(null);setOptions({});}
  function addProduct(id:number,choices:Record<string,string>){
    const product=shop.products.find(value=>value.id===id&&inquiryCatalogProduct(value));
    if(preview||!catalogReady||!inquiry.ready||!product||!validOptions(product,choices))return;
    let full=false;
    inquiry.setItems(current=>{
      if(current.some(item=>selectionKey(item.product.id,item.options)===selectionKey(id,choices)))return current;
      if(current.length>=MAX_INQUIRY_SELECTIONS){full=true;return current;}
      return [...current,{product,quantity:'',options:{...choices}}];
    });
    setNotice(full?t('Use up to 20 items per inquiry.'):'');
    if(!full)closeChoices();
  }
  function beginAdd(id:number){
    const product=shop.products.find(value=>value.id===id&&inquiryCatalogProduct(value));
    if(preview||!catalogReady||!inquiry.ready||!product||!validGroups(product))return;
    const defaults=Object.fromEntries(product.options.filter(group=>group.values.length===1).map(group=>[group.name,group.values[0]]));
    setNotice('');
    if(validOptions(product,defaults))addProduct(id,defaults);
    else{setOptions(defaults);setAddingId(id);}
  }
  async function contactWithSelections(contact: PublicContactLink) {
    if (preview || !catalogReady || !canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, contact.kind)) return;
    const items=inquiry.items;
    const message=buildSocialInquiryMessage(shop,items.map(item=>({id:item.product.id,name:item.product.name,quantity:item.quantity,options:item.options,service:item.product.kind==='service'})),API,t);
    const link=inquiryHandoffs(shop.contacts,message).find(item=>item.kind===contact.kind && item.external);
    if(!items.length||!link){await openLink(contact.href);return;}
    let copied=false,opened=false;setFallbackMessage("");
    if(Platform.OS==='web')({copied,opened}=await openCopiedBrowserLink(message,link.href,link.external));
    else{try{copied=await Clipboard.setStringAsync(message);}catch{}opened=await openLink(link.href);}
    setContactStatus(t(copied?'Message copied. Paste it in the conversation if needed.':'Select and copy your message'));
    if(!copied||!opened)setFallbackMessage(message);
  }

  const previewProduct=shop.products.find(product=>product.id===selected?.id&&visibleCatalogProduct(product));
  if (preview && previewProduct) return <View style={{ gap: 14 }}>
    <Button secondary label={t("Back")} onPress={() => setSelected(null)} />
    <Gallery media={previewProduct.media} privateImage />
    {shop.isDemo&&<Text style={v.demo}>{t("Example product")}</Text>}
    <Text style={v.title}>{previewProduct.name}</Text>
    <ProductSupply kind={previewProduct.kind} availability={previewProduct.availability}/>
    {previewProduct.priceMinor !== null && <Text style={v.price}>{(previewProduct.priceMinor / 100).toLocaleString()} ETB</Text>}
    <LinkedText style={v.body}>{previewProduct.description}</LinkedText>
  </View>;
  const words = query.trim().toLocaleLowerCase().split(/\s+/).filter(Boolean);
  const products =
    shop?.products.filter((p) =>
      visibleCatalogProduct(p)&&(activeCategory===null||p.categoryId===activeCategory)&&words.every((w) =>
        (p.name + " " + p.description).toLocaleLowerCase().includes(w),
      ),
    ) || [];
  return (
    <View style={{
          paddingBottom: 24,
          maxWidth: 760,
          width: "100%",
          alignSelf: "center",
          backgroundColor: "white",
        }}
      >
        {shop && (
          <>
            {shop.isDemo && (
              <Text style={v.demo}>
                {t("Example showroom. This business and its products are fictional.")}
              </Text>
            )}
            <View style={accent ? { borderBottomWidth: 4, borderColor: accent.accent } : undefined}>
            {shop.videoUrl ? (
              <YouTubeVideo
                video={shop.videoUrl}
                allowSocial
                height={/tiktok.com|instagram.com/.test(shop.videoUrl)?420:210}
                poster={shop.cover}
                posterTint={accent?.accent}
                privateImage={preview}
              />
            ) : (
              <View><Photo refPath={shop.cover} height={210} privateImage={preview} />{accent && <View style={[StyleSheet.absoluteFill, { pointerEvents:'none',backgroundColor: accent.accent, opacity: .08 }]} />}</View>
            )}
            </View>
            <View style={v.section}>
              {shop.logo ? <View style={{ width: 60, padding: 5, borderRadius: 12, borderWidth: 2, borderColor: accent?.edge || colors.line, backgroundColor: accent?.soft || "white" }}><Photo refPath={shop.logo} height={46} privateImage={preview} /></View> : null}
              <Text style={v.handle}>@{shop.handle}</Text>
              <Text style={v.title}>{shop.name}</Text>
              <LinkedText style={v.body}>{shop.about}</LinkedText>
            </View>
            <View style={v.section}>
              <Text style={[v.heading, accent && { color: accent.ink, borderBottomWidth: 3, borderColor: accent.edge, paddingBottom: 12 }]}>
                {t("Products")}{" "}
                <Text style={v.handle}>({shop.products.filter(visibleCatalogProduct).length})</Text>
              </Text>
              <View style={v.search}>
                <Icon name="search" size={19} />
                <TextInput
                  accessibilityLabel={t("Search this business")}
                  placeholder={t("Search this business")}
                  value={query}
                  maxLength={80}
                  onChangeText={setQuery}
                  style={{
                    flex: 1,
                    minHeight: 44,
                    color: colors.ink,
                    fontSize: 14,
                  }}
                />
                {query !== "" && (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={t("Clear")}
                    onPress={() => setQuery("")}
                    style={{ padding: 10 }}
                  >
                    <Icon name="close" size={18} />
                  </Pressable>
                )}
              </View>
              {categories.length>0&&<View testID="showroom-categories" accessibilityLabel={t('Product category')} style={{gap:8}}><Text style={v.productName}>{t('Product category')}</Text><View style={v.categories}>{[{id:null,name:t('All'),count:visibleProducts.length},...categories].map(category=><Pressable key={category.id??'all'} testID={`showroom-category-${category.id??'all'}`} accessibilityRole="button" accessibilityState={{selected:activeCategory===category.id}} aria-pressed={activeCategory===category.id} onPress={()=>setCategoryId(category.id)} style={[v.category,{borderColor:accent?.edge||colors.line,backgroundColor:activeCategory===category.id?(accent?.soft||colors.soft):'white'},activeCategory===category.id&&{borderWidth:2}]}><Text style={[v.categoryText,{color:activeCategory===category.id?(accent?.ink||colors.brand):colors.ink}]}>{category.name} ({category.count})</Text></Pressable>)}</View></View>}
              <Status error={inquiry.error} retry={inquiry.retry}/>
              {addingId===null&&Boolean(notice)&&<Text testID="showroom-inquiry-notice" accessibilityLiveRegion="polite" style={v.body}>{notice}</Text>}
              <View testID="showroom-product-grid" style={v.grid} onLayout={event=>{const width=event.nativeEvent.layout.width;if(Number.isFinite(width)&&width>0)setGridWidth(current=>current===width?current:width);}}>
                {products.map((p) => (
                  <View key={p.id} testID={`showroom-product-${p.id}`} style={[v.product,catalogCardStyle(gridWidth,fontScale)]}>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={p.name}
                    onPress={() =>
                      preview ? setSelected(p) : router.push({
                        pathname: "/product",
                        params: { handle: shop.handle, id: p.id },
                      })
                    }
                    style={{minHeight:48}}
                  >
                    <Photo
                      refPath={
                        p.media.find((m) => m.kind === "image")?.ref || ""
                      }
                      privateImage={preview}
                      height={160}
                    />
                    <View style={{ padding: 10, gap: 6 }}>
                      {categories.some(category=>category.id===p.categoryId)&&<Text testID={`showroom-product-category-${p.id}`} style={v.description}>{categories.find(category=>category.id===p.categoryId)!.name}</Text>}
                      {shop.isDemo&&<Text style={v.demo}>{t("Example product")}</Text>}
                      <Text style={v.productName}>{p.name}</Text>
                      {Boolean(p.description)&&<Text testID={`showroom-product-description-${p.id}`} numberOfLines={2} style={v.description}>{p.description}</Text>}
                      <ProductSupply kind={p.kind} availability={p.availability}/>
                      {p.priceMinor !== null && (
                        <Text style={v.price}>
                          {(p.priceMinor / 100).toLocaleString()} ETB
                        </Text>
                      )}
                      <Text style={[v.link, accent && { color: accent.ink }]}>{t("View details")} →</Text>
                    </View>
                  </Pressable>
                  <View style={{padding:8,paddingTop:0}}><Pressable testID={`showroom-product-add-${p.id}`} accessibilityRole="button"
                    accessibilityLabel={t('{value1}: {value2}',{value1:t(inquiry.items.some(item=>item.product.id===p.id)?'Added to inquiry list':'Add to inquiry list'),value2:p.name})}
                    disabled={preview||!catalogReady||!inquiry.ready||!inquiryCatalogProduct(p)||!validGroups(p)||inquiry.items.some(item=>item.product.id===p.id)}
                    accessibilityState={{disabled:preview||!catalogReady||!inquiry.ready||!inquiryCatalogProduct(p)||!validGroups(p)||inquiry.items.some(item=>item.product.id===p.id)}}
                    onPress={()=>beginAdd(p.id)} style={[v.add,{backgroundColor:accent?.soft||colors.soft,borderColor:accent?.edge||colors.line},(preview||!catalogReady||!inquiry.ready||!inquiryCatalogProduct(p)||!validGroups(p))&&{opacity:.5}]}>
                    <Icon name={inquiry.items.some(item=>item.product.id===p.id)?'check':'plus'} size={15} color={accent?.ink||colors.brand}/><Text style={[v.addText,{color:accent?.ink||colors.brand}]}>{t(inquiry.items.some(item=>item.product.id===p.id)?'Added to inquiry list':'Add to inquiry list')}</Text>
                  </Pressable></View>
                  </View>
                ))}
              </View>
              {products.length === 0 && (
                <Text style={v.body}>{t("No matches found")}</Text>
              )}
            </View>
            <Sheet visible={addingId!==null} title={choiceProduct?.name||t('Products')} onClose={closeChoices}><View testID="showroom-product-options" style={{gap:14}}>
              {Boolean(notice)&&<Text accessibilityLiveRegion="polite" style={v.body}>{notice}</Text>}
              {choiceProduct&&<>{choiceProduct.options.map(group=><View key={group.name} style={{gap:8}}><Text style={v.productName}>{group.name}</Text><View style={{flexDirection:'row',flexWrap:'wrap',gap:8}}>{group.values.map(value=><Chip key={value} minHeight={48} label={value} selected={options[group.name]===value} onPress={()=>setOptions(current=>({...current,[group.name]:value}))}/>)}</View></View>)}
              <Button secondary label={t('Cancel')} onPress={closeChoices}/><View testID="showroom-product-options-add"><Button accentColor={shop.accentColor} wrapLabel label={t('Add to inquiry list')} disabled={preview||!catalogReady||!inquiry.ready||!inquiryCatalogProduct(choiceProduct)||!validOptions(choiceProduct,options)} onPress={()=>addProduct(choiceProduct.id,options)}/></View></>}
            </View></Sheet>
            <View style={[v.contact, accent && { backgroundColor: accent.soft, borderTopWidth: 2, borderColor: accent.edge }]}>
              <Text style={[v.title, { color: accent ? colors.ink : "white" }]}>
                {t("Stay in touch")}
              </Text>
              {!preview&&<Button accentColor={shop.accentColor} wrapLabel disabled={!catalogReady||!inquiry.ready} label={t("Contact this business")} onPress={()=>router.push({pathname:"/inquiry",params:{handle:shop.handle}})}/>}
              {publicContactLinks(shop.contacts).filter(c=>["website","tiktok","instagram","facebook"].includes(c.kind)).map((c) => (
                <Pressable
                  key={c.kind}
                  accessibilityRole="link"
                  disabled={preview || !catalogReady || !canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, c.kind)}
                  accessibilityState={{disabled:preview || !catalogReady || !canOpenPublicContact(shop.isDemo, shop.approvedDemoContactMethods, c.kind)}}
                  accessibilityLabel={t(c.label)}
                  onPress={() => void contactWithSelections(c)}
                  style={[v.contactLink, accent && { borderColor: accent.edge }]}
                >
                  <Text
                    style={{ color: accent?.ink || "white", fontSize: 15, fontWeight: "600" }}
                  >
                    {t(c.label)}
                  </Text>
                  <Icon name="arrow" color={accent?.ink || "white"} size={18} />
                </Pressable>
              ))}
              {Boolean(contactStatus)&&<Text style={[v.body,{color:accent?.ink || "white"}]} accessibilityLiveRegion="polite">{contactStatus}</Text>}
              {Boolean(fallbackMessage)&&<Text selectable style={[v.body,{color:accent?.ink || "white"}]}>{fallbackMessage}</Text>}
              {!preview && <Button secondary label={t("Open website")} onPress={()=>void openLink(`${API}/@${shop.handle}`)}/> }
            </View>
          </>
        )}
    </View>
  );
}
const v = StyleSheet.create({
  demo: {
    backgroundColor: colors.soft,
    color: colors.brand,
    fontSize: 11,
    padding: 9,
    textAlign: "center",
  },
  play: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    backgroundColor: "#0002",
  },
  playCircle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0008",
    borderWidth: 1,
    borderColor: "#ffffffaa",
  },
  section: { padding: 18, gap: 14 },
  handle: { fontSize: 12, color: colors.muted },
  title: { fontSize: 25, lineHeight: 31, fontWeight: "800", color: colors.ink },
  body: { fontSize: 14, lineHeight: 22, color: colors.muted },
  heading: { fontSize: 18, fontWeight: "700", color: colors.ink },
  search: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
  },
  categories:{flexDirection:'row',flexWrap:'wrap',gap:8},
  category:{minHeight:48,minWidth:48,maxWidth:'100%',justifyContent:'center',paddingVertical:9,paddingHorizontal:12,borderWidth:1,borderRadius:24},
  categoryText:{fontSize:13,lineHeight:18,fontWeight:'600',flexShrink:1},
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: CATALOG_CARD_GAP,
  },
  product: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    overflow: "hidden",
  },
  productName: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "700",
    color: colors.ink,
  },
  description:{fontSize:12,lineHeight:18,color:colors.muted},
  add:{minWidth:48,minHeight:48,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:6,paddingHorizontal:6,paddingVertical:8,borderWidth:1,borderRadius:7},
  addText:{minWidth:0,flexShrink:1,fontSize:12,lineHeight:16,fontWeight:'700',textAlign:'center'},
  price: { fontSize: 13, fontWeight: "600", color: colors.ink },
  link: {
    fontSize: 12,
    fontWeight: "600",
    color: colors.brand,
    paddingVertical: 9,
  },
  contact: { backgroundColor: "#263a38", padding: 22, gap: 12, marginTop: 12 },
  contactLink: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 48,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ffffff44",
    borderRadius: 6,
  },
});
