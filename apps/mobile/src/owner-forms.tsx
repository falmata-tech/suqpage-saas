import {OWNER_PAGE_TASKS,type OwnerPageTask} from '../../../lib/owner-page-tasks';
import {publicContactFields} from '../../../lib/business-profile-contacts';
import {Sheet} from "./chrome";
import ProductSupply from './ProductSupply';
import {visibleCatalogProduct} from './catalog-products';
import {isActiveProductKind} from '../../../lib/offerings';
import {File as PickedFile} from 'expo-file-system';
import {appendPickedImage} from './image-upload';
import CitySelector from './CitySelector';
import CountrySelector from './CountrySelector';
import OwnerLocationPicker from './OwnerLocationPicker';
import LocationVisibilityChoices from './LocationVisibilityChoices';
import type {KnownPlace} from '../../../lib/place-search';
import { HandleInput } from "./owner-handle";
import StorefrontAccentPicker from "./StorefrontAccentPicker";
import { ShowroomContent } from "./ShowroomContent";
import {useOwnerEditGuard} from './owner-edit-navigation';
import OwnerEditConfirmation from './OwnerEditConfirmation';
import React, { useEffect, useRef, useState } from "react";
import { View, ScrollView, Platform,Pressable,Text } from "react-native";
import { router } from "expo-router";
import * as Crypto from "expo-crypto";
import * as ImagePicker from "expo-image-picker";
import type { OwnerHome, Profile, Media, Offering } from "@africmade/contracts";
import { useApp, useLoad, request, auth, API } from "./runtime";
import {
  Copy,
  Icon,
  colors,
  Card,
  Field,
  Button,
  Chip,
  Photo,
  Status,
  s,
  useOpenLink,
} from "./ui";
export function useAction() {
  const flight = useRef(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [notice, setNotice] = useState("");
  return {
    busy,
    error,
    notice,
    isBusy: () => flight.current,
    run: async (fn: () => Promise<void | false>, message = "Saved") => {
      if (flight.current) return;
      flight.current = true;
      setBusy(true);
      setError("");
      setNotice("");
      try {
        const result = await fn();
        if (result !== false) setNotice(message);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Please try again.");
      } finally {
        flight.current = false;
        setBusy(false);
      }
    },
  };
}
export function ActionStatus({
  state,
}: {
  state: ReturnType<typeof useAction>;
}) {
  const { t } = useApp();
  return (
    <>
      <Status loading={state.busy} error={state.error} />
      {Boolean(state.notice) && <Copy>{t(state.notice)}</Copy>}
    </>
  );
}
export async function addAsset(
  form: FormData,
  field: string,
  asset: ImagePicker.ImagePickerAsset,
) {
  await appendPickedImage(form,field,asset,async uri=>{
    if(Platform.OS==='web')return (await fetch(uri)).blob();
    if(!/^(?:file|content):\/\//.test(uri))throw new Error('Choose a JPG, PNG or WebP photo under 5 MB.');
    return new PickedFile(uri);
  });
}
export async function pickImages(multiple = false) {
  // The system picker grants access only to the selected photos.
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ["images"],
    allowsMultipleSelection: multiple,
    selectionLimit: 8,
    quality: 0.8,
  });
  return result.canceled ? [] : result.assets;
}
export function Setup() {
  const openLink = useOpenLink();
  const { t, ownerRequest, session } = useApp(),
    action = useAction();
  const [selectedPlace,setSelectedPlace]=useState<KnownPlace|null>(null),[countryCode,setCountryCode]=useState("");
  const [locationMode,setLocationMode]=useState<'area'|'storefront'>('area'),[point,setPoint]=useState<{latitude:number;longitude:number}|null>(null);
  const [name, setName] = useState(""),
    [phone, setPhone] = useState(""),
    [business, setBusiness] = useState(""),
    [handle, setHandle] = useState(""),
    [handleReady, setHandleReady] = useState(false),
    [handleRevision, setHandleRevision] = useState(0),
    [category, setCategory] = useState(""),
    [consent, setConsent] = useState(false),
    [key] = useState(() => Crypto.randomUUID());
  const categories = useLoad(() =>
    request<{ categories: { key: string; label: string }[] }>("categories"),
  );
  return (
    <>
      <Copy big>{t("Account setup")}</Copy>
      <Copy muted>{t("Verified email")}</Copy>
      <Copy>{session?.user.email || ""}</Copy>
      <Field label={t("Your name")} value={name} onChangeText={setName} />
      <Field
        label={t("Account phone")}
        value={phone}
        onChangeText={setPhone}
        keyboardType="phone-pad"
      />
      <Field
        label={t("Business name")}
        value={business}
        onChangeText={setBusiness}
      />
      <CountrySelector value={countryCode} onChange={value=>{setCountryCode(value);setSelectedPlace(null);setPoint(null);}}/>
      <CitySelector key={countryCode} countryCode={countryCode} onSelect={place=>{setSelectedPlace(place);setPoint(null);}}/>
      {selectedPlace ? <>
        <LocationVisibilityChoices value={locationMode} t={t} onChange={next=>{setLocationMode(next);if(next==='area')setPoint(null);}}/>
        {locationMode==='storefront' ? <OwnerLocationPicker key={selectedPlace.id} city={selectedPlace} point={point} disabled={action.busy} t={t} onChange={setPoint}/> : null}
      </> : null}
      <HandleInput value={handle} onChange={setHandle} onReady={setHandleReady} refreshKey={handleRevision} />
      <Copy>{t("Category")}</Copy>
      <Status {...categories} retry={categories.reload} />
      <View style={s.wrap}>
        {categories.data?.categories.map((c) => (
          <Chip
            key={c.key}
            label={t(c.label)}
            selected={category === c.key}
            onPress={() => setCategory(c.key)}
          />
        ))}
      </View>
      <Chip
        label={t("I agree to the Terms and Privacy Policy")}
        selected={consent}
        onPress={() => setConsent(!consent)}
      />
      <View style={s.row}>
        <Button
          secondary
          label={t("Terms")}
          onPress={() => void openLink(API + "/terms")}
        />
        <Button
          secondary
          label={t("Privacy")}
          onPress={() => void openLink(API + "/privacy")}
        />
      </View>
      <ActionStatus state={action} />
      <Button
        disabled={
          action.busy || !consent || !category || !name || !phone || !business || !handleReady || !selectedPlace || (locationMode==='storefront'&&!point)
        }
        label={t("Create your business page")}
        onPress={() => {
          const chosenPlace=selectedPlace;
          if(!chosenPlace)return;
          void action.run(async () => {
            try { await ownerRequest("signup", {
              name,
              phone,
              businessName: business,
              handle,
              businessCategory: category,
              placeId:chosenPlace.id,
              countryCode,
              ...(locationMode==='storefront'&&point?{latitude:point.latitude,longitude:point.longitude}:{}),
              consent,
              idempotencyKey: key,
            }); } catch (error) { setHandleReady(false); setHandleRevision(v => v + 1); throw error; }
            router.replace({
              pathname: "/owner/[section]",
              params: { section: "page", view: "preview" },
            });
          }, "Your page is ready to edit");
        }}
      />
    </>
  );
}
export function PageEditor({
  home, reload, initialPreview = false, initialTask = 'about', onSaved, onCancel,backLabel='Back to your page',
}: {
  home: OwnerHome; reload: () => void; initialPreview?: boolean;
  initialTask?: OwnerPageTask; onSaved?: () => void; onCancel?: () => void;backLabel?:'Back to account'|'Back to your page';
}) {
  const {t,ownerRequest}=useApp(),action=useAction(),flight=useRef(false);
  const fallback:Profile={template:'profile-v1',coverStyle:'blended',introduction:'',about:home.shop.about,heroImage:home.shop.cover,videoUrl:home.shop.videoUrl,accentColor:home.shop.accentColor,contacts:home.shop.contacts};
  const initial=home.draft?.content||fallback;
  const [content,setContent]=useState<Profile>(initial),[savedContent,setSavedContent]=useState<Profile>(initial);
  const [version,setVersion]=useState(home.draft?.version),[preview,setPreview]=useState(initialPreview||initialTask==='color');
  const [task,setTask]=useState<OwnerPageTask>(initialTask),[colorOpen,setColorOpen]=useState(initialTask==='color');
  const dirty=JSON.stringify(content)!==JSON.stringify(savedContent),unsaved=dirty;
  const signature=JSON.stringify(content);
  const guard=useOwnerEditGuard({dirty:unsaved,signature,busy:action.busy,isBusy:action.isBusy,discard:()=>setContent(savedContent)});
  const [publicationReview,setPublicationReview]=useState<{version:number;revision:number;issues:OwnerHome['issues']}|null>(null);
  useEffect(()=>{setTask(initialTask);setPreview(initialPreview||initialTask==='color');setColorOpen(initialTask==='color');},[initialTask,initialPreview]);
  const update=(key:keyof Profile,value:unknown)=>{guard.changed();setContent(current=>({...current,[key]:value}));};
  function run(fn:()=>Promise<void|false>,message='Saved'){
    if(flight.current)return;flight.current=true;
    void action.run(async()=>{try{return await fn();}finally{flight.current=false;}},message);
  }
  async function saveContent(){
    const saved=await ownerRequest<{version:number}>('owner/page',{action:version?'save':'start',version,content});
    setVersion(saved.version);setSavedContent(content);return saved.version;
  }
  async function saveTask(){
    const checkpoint=guard.checkpoint();
    await saveContent();
    guard.complete(onSaved,signature,checkpoint);
  }
  async function reviewPublication(){
    let reviewVersion=version;
    if(dirty||!version)reviewVersion=await saveContent();
    const current=await ownerRequest<OwnerHome>('owner/home');
    if(current.shop.status!=='draft'||!current.draft){reload();return;}
    if(reviewVersion&&current.draft.version!==reviewVersion){setContent(current.draft.content);setSavedContent(current.draft.content);setVersion(current.draft.version);throw Error('The draft has changed. Reload and review it before publishing.');}
    setVersion(current.draft.version);
    setPublicationReview({version:current.draft.version,revision:current.publicationRevision,issues:current.issues});
  }
  function switchTask(next:OwnerPageTask){
    setTask(next);setPreview(next==='color');setColorOpen(next==='color');
    router.setParams({view:next});
  }
  function openMissing(label:string){
    setPublicationReview(null);
    if(label==='Replace or remove sample offerings')router.push({pathname:'/owner/[section]',params:{section:'products'}});
    else if(label==='Choose your business location')router.push({pathname:'/owner/[section]',params:{section:'business'}});
    else switchTask(label==='Add your real contact details'?'contacts':'about');
  }
  function cancel(){guard.requestLeave(()=>onCancel?.());}
  const title=preview&&task!=='color'?'Your page':OWNER_PAGE_TASKS.find(item=>item.key===task)!.label;
  return <>
    <View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between',gap:12,flexWrap:'wrap'}}>
      <Pressable accessibilityRole="button" accessibilityLabel={t(backLabel)} disabled={action.busy} onPress={cancel} style={{minHeight:48,minWidth:120,flex:1,flexDirection:'row',alignItems:'center',gap:6,paddingVertical:8,opacity:action.busy ? 0.45 : 1}}><Icon name="back" size={18} color={colors.brand}/><Text style={{color:colors.brand,fontSize:14,lineHeight:20,fontWeight:'600',flexShrink:1}}>{t(backLabel)}</Text></Pressable>
      {!preview&&<Pressable accessibilityRole="button" accessibilityLabel={t('Preview')} disabled={action.busy} onPress={()=>setPreview(true)} style={{minHeight:48,minWidth:84,maxWidth:'45%',paddingVertical:8,paddingHorizontal:10,justifyContent:'center',opacity:action.busy ? 0.45 : 1}}><Text style={{color:colors.brand,fontSize:14,lineHeight:20,fontWeight:'600',flexShrink:1,textAlign:'right'}}>{t('Preview')}</Text></Pressable>}
    </View>
    <Copy big heading>{t(title)}</Copy>
    <ActionStatus state={action}/>
    <Copy muted>{t(unsaved?'Unsaved changes':home.shop.status==='active'?'Your page is live':'Private until you publish')}</Copy>
    {preview?<>
      <View style={s.row}><View style={{flex:1}}><Button secondary label={t('Edit')} disabled={action.busy} onPress={()=>{setPreview(false);if(task==='color')switchTask('about');}}/></View>{task!=='color'&&home.shop.status==='draft'&&<View style={{flex:1}}><Button label={t('Publish')} disabled={action.busy} onPress={()=>run(reviewPublication,'')}/></View>}</View>
      {task==='color'&&<Button secondary label={t('Page color')} disabled={action.busy} onPress={()=>setColorOpen(true)}/>}
      {colorOpen&&<StorefrontAccentPicker value={content.accentColor||''} onChange={value=>update('accentColor',value)} disabled={action.busy} onClose={()=>setColorOpen(false)}/>}
      <ShowroomContent preview shop={{...home.shop,about:content.about||content.introduction,cover:content.heroImage,videoUrl:content.videoUrl,accentColor:content.accentColor,contacts:content.contacts||home.shop.contacts,products:home.shop.products.filter(visibleCatalogProduct)}}/>
    </>:<>
      {task==='about'&&<Card><Field label={t('About the business')} hideLabel multiline value={content.about||content.introduction} maxLength={3000} editable={!action.busy} onChangeText={value=>{guard.changed();setContent(current=>({...current,introduction:'',about:value}));}}/><Copy muted>{t('Tell visitors what makes your shop and products worth exploring.')}</Copy></Card>}
      {task==='video'&&<Card><Copy muted>{t('TikTok, YouTube, Facebook videos or Instagram Reels')}</Copy><Field label={t('Business video')} hideLabel placeholder={t('Video link')} value={content.videoUrl} maxLength={500} editable={!action.busy} onChangeText={value=>update('videoUrl',value)} autoCapitalize="none"/></Card>}
      {task==='cover'&&<Card><Photo refPath={content.heroImage} height={210} privateImage/><Button secondary label={t('Choose cover photo')} disabled={action.busy} onPress={()=>run(async()=>{const picked=await pickImages();if(!picked.length)return false;const form=new FormData();await addAsset(form,'file',picked[0]);const result=await ownerRequest<{ref:string}>('owner/cover',undefined,form);update('heroImage',result.ref);},'Photo ready. Save your page to apply it.')}/></Card>}
      {task==='contacts'&&[
        {label:'Social accounts',fields:publicContactFields.filter(field=>['whatsapp','telegram','tiktok','instagram','facebook'].includes(field.key))},
        {label:'Business contacts',fields:publicContactFields.filter(field=>['phone','email','website'].includes(field.key))},
      ].map(group=><Card key={group.label}><Copy heading>{t(group.label)}</Copy>{group.fields.map(field=><Field key={field.key} label={t(field.label)} value={content.contacts?.[field.key]||''} maxLength={500} editable={!action.busy} autoCapitalize="none" keyboardType={field.type==='tel'?'phone-pad':field.type==='email'?'email-address':'default'} onChangeText={value=>{guard.changed();setContent(current=>({...current,contacts:{...current.contacts,[field.key]:value}}));}}/>)}</Card>)}
    </>}
    <View style={{flexDirection:'row',alignItems:'stretch',gap:10,flexWrap:'wrap'}}>{(!preview||task==='color'||unsaved)&&<View style={{flex:1,minWidth:120}}><Button label={t('Save changes')} wrapLabel disabled={action.busy} onPress={()=>run(saveTask)}/></View>}<View style={{flex:1,minWidth:120}}><Button secondary label={t('Cancel')} wrapLabel disabled={action.busy} onPress={cancel}/></View></View>
    {publicationReview&&<Sheet visible title={t('Publish page')} onClose={()=>{if(!action.busy)setPublicationReview(null);}}><ActionStatus state={action}/><Copy muted>{t('Your page and listed products will be visible to customers. You can update them any time.')}</Copy>{publicationReview.issues.map(issue=><Button key={issue.label} secondary label={t(issue.label)} onPress={()=>openMissing(issue.label)}/>)}<Button label={t('Publish page')} disabled={action.busy||publicationReview.issues.length>0} onPress={()=>run(async()=>{const checkpoint=guard.checkpoint();await ownerRequest('owner/publish',{version:publicationReview.version,revision:publicationReview.revision});setPublicationReview(null);guard.complete(onSaved||reload,signature,checkpoint);},'Your page is live')}/><Button secondary label={t('Cancel')} disabled={action.busy} onPress={()=>setPublicationReview(null)}/></Sheet>}
    <OwnerEditConfirmation guard={guard}/>
  </>;
}
export function ProductEditor({
  home,
  id,
  onSaved,
  onCancel,
}: {
  home: OwnerHome;
  id?: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const product = home.shop.products.find((p) => p.id === Number(id));
  const [name, setName] = useState(product?.name || ""),
    [description, setDescription] = useState(product?.description || ""),
    [price, setPrice] = useState(
      product?.priceMinor === null || product?.priceMinor === undefined
        ? ""
        : String(product.priceMinor / 100),
    ),
    [kind, setKind] = useState(product?.kind==='service'?"":product?.kind || "standard_product"),
    [orderScope, setOrderScope] = useState(product?.orderScope || "unspecified"),
    [quantityUnit, setQuantityUnit] = useState(product?.quantityUnit || ""),
    [highlights, setHighlights] = useState((product?.highlights || []).join("\n")),
    [minimumOrderSummary, setMinimumOrderSummary] = useState(product?.minimumOrderSummary || ""),
    [leadTimeSummary, setLeadTimeSummary] = useState(product?.leadTimeSummary || ""),
    [capacitySummary, setCapacitySummary] = useState(product?.capacitySummary || ""),
    [availability, setAvailability] = useState(
      product?.availability || "available",
    ),
    [published, setPublished] = useState(product?.published ?? true),
    [media, setMedia] = useState<Media[]>(product?.media || (home.exampleVideoRef?[{kind:"video",ref:home.exampleVideoRef}]:[])),
    [assets, setAssets] = useState<ImagePicker.ImagePickerAsset[]>([]),
    [video, setVideo] = useState(""),
    [key] = useState(() => Crypto.randomUUID());
  const values={name,description,price,kind,orderScope,quantityUnit,highlights,minimumOrderSummary,leadTimeSummary,capacitySummary,availability,published,media,assets,video};
  const baseline=useRef(values);
  const signature=JSON.stringify(values),guard=useOwnerEditGuard({dirty:signature!==JSON.stringify(baseline.current),signature,busy:action.busy,isBusy:action.isBusy,discard:()=>{
    const saved=baseline.current;setName(saved.name);setDescription(saved.description);setPrice(saved.price);setKind(saved.kind);setOrderScope(saved.orderScope);setQuantityUnit(saved.quantityUnit);setHighlights(saved.highlights);setMinimumOrderSummary(saved.minimumOrderSummary);setLeadTimeSummary(saved.leadTimeSummary);setCapacitySummary(saved.capacitySummary);setAvailability(saved.availability);setPublished(saved.published);setMedia(saved.media);setAssets(saved.assets);setVideo(saved.video);
  }});
  const save = () => {
    void action.run(async () => {
      const checkpoint=guard.checkpoint();
      if(!kind)throw Error('Choose Ready to ship or Made to order before saving.');
      const value = price.trim() === "" ? null : Number(price);
      if (value !== null && (!Number.isFinite(value) || value < 0))
        throw Error("Enter a valid price.");
      const form = new FormData();
      form.append(
        "details",
        JSON.stringify({
          name,
          description,
          priceMinor: value === null ? null : Math.round(value * 100),
          ...(isActiveProductKind(kind)?{offeringKind:kind}:{}),
          availability,
          orderScope,
          quantityUnit,
          highlights: highlights.split(/\r?\n/),
          minimumOrderSummary,
          leadTimeSummary,
          capacitySummary,
          isPublished: published,
          expectedContentVersion: home.shop.version,
          idempotencyKey: key,
          media,
        }),
      );
      for (const asset of assets) await addAsset(form, "images", asset);
      await ownerRequest(
        "owner/products" + (id ? "/" + id : ""),
        undefined,
        form,
      );
      baseline.current=values;
      guard.complete(onSaved,signature,checkpoint);
    });
  };
  if (id && !product) return <Copy>{t("Product not found.")}</Copy>;
  return (
    <View style={{flex:1,minHeight:0}}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={s.screen}>
      <Copy big heading>{t(product ? "Edit product" : "Add product")}</Copy>
      <Field label={t("Name")} value={name} onChangeText={value=>{guard.changed();setName(value);}} editable={!action.busy}/>
      <Copy>{t('How is this product supplied?')}</Copy>
      <View style={s.wrap}>
        {[
          ["standard_product", "Ready to ship"],
          ["made_to_order", "Made to order"],
        ].map(([k, label]) => (
          <Chip
            key={k}
            label={t(label)}
            selected={kind === k}
            minHeight={48}
            onPress={() => {if(!action.isBusy()){guard.changed();setKind(k);}}}
          />
        ))}
      </View>
      {!kind&&<Copy muted>{t('Choose Ready to ship or Made to order before saving.')}</Copy>}
      {kind&&!isActiveProductKind(kind)&&<Copy muted>{t('The current supply type is kept unless you choose an option.')}</Copy>}
      <Copy>{t("Order sizes")}</Copy>
      <View style={s.wrap}>
        {([
          ["unspecified", "Ask me about order size"],
          ["single", "Single items"],
          ["bulk", "Bulk orders"],
          ["both", "Single items and bulk orders"],
        ] as const).map(([value,label]) => <Chip key={value} label={t(label)} selected={orderScope===value} minHeight={48} onPress={()=>{if(!action.isBusy()){guard.changed();setOrderScope(value);}}}/>)}
      </View>
      <Field
        label={t("Description")}
        value={description}
        onChangeText={value=>{guard.changed();setDescription(value);}}
        multiline
        editable={!action.busy}
      />
      <Field
        label={t("Price in ETB")}
        value={price}
        onChangeText={value=>{guard.changed();setPrice(value);}}
        keyboardType="decimal-pad"
        editable={!action.busy}
      />
      <Field label={t("Offered by")} value={quantityUnit} onChangeText={value=>{guard.changed();setQuantityUnit(value);}} editable={!action.busy} />
      <Field label={t("Highlights")} value={highlights} onChangeText={value=>{guard.changed();setHighlights(value);}} multiline editable={!action.busy} />
      <Field label={t("Minimum order")} value={minimumOrderSummary} onChangeText={value=>{guard.changed();setMinimumOrderSummary(value);}} editable={!action.busy} />
      <Field label={t("Typical lead time")} value={leadTimeSummary} onChangeText={value=>{guard.changed();setLeadTimeSummary(value);}} editable={!action.busy} />
      <Field label={t("Supply capacity")} value={capacitySummary} onChangeText={value=>{guard.changed();setCapacitySummary(value);}} editable={!action.busy} />
      <Copy>{t("Photos and videos")}</Copy>
      {media.map((m, i) => (
        <Card key={m.ref}>
          {m.kind === "image" ? (
            <Photo refPath={m.ref} privateImage height={130} />
          ) : (
            <Copy>{t("Video")}</Copy>
          )}
          <View style={s.row}>
            <Button
              secondary
              disabled={action.busy || i === 0}
              label={t("Move up")}
              onPress={() => {
                if(action.isBusy())return;guard.changed();
                setMedia((old) => {
                  const copy = [...old];
                  [copy[i - 1], copy[i]] = [copy[i], copy[i - 1]];
                  return copy;
                });
              }}
            />
            <Button
              secondary
              disabled={action.busy}
              label={t("Remove")}
              onPress={() => {if(!action.isBusy()){guard.changed();setMedia((old) => old.filter((_, j) => i !== j));}}}
            />
          </View>
        </Card>
      ))}
      {assets.map((a, i) => (
        <Card key={a.uri}>
          <Photo refPath={a.uri} height={130} />
          <Button
            secondary
            disabled={action.busy}
            label={t("Remove")}
            onPress={() => {if(!action.isBusy()){guard.changed();setAssets((old) => old.filter((_, j) => j !== i));}}}
          />
        </Card>
      ))}
      <Button
        secondary
        disabled={action.busy}
        label={t("Add photos")}
        onPress={() =>
          void action.run(async () => {
            const chosen = await pickImages(true);
            if (
              chosen.length +
                assets.length +
                media.filter((m) => m.kind === "image").length >
              8
            )
              throw Error("Use up to 8 photos.");
            if(chosen.length){guard.changed();setAssets((old) => [...old, ...chosen]);}
          }, "")
        }
      />
      <Copy>{t('Availability')}</Copy>
      <View style={s.wrap}>
        {[
          ["available", "Available"],
          ["limited", "Limited"],
          ["unavailable", "Unavailable"],
          ["coming_soon", "Coming soon"],
        ].map(([v, l]) => (
          <Chip
            key={v}
            label={t(l)}
            selected={availability === v}
            minHeight={48}
            onPress={() => {if(!action.isBusy()){guard.changed();setAvailability(v);}}}
          />
        ))}
      </View>
      <ProductSupply kind={kind} availability={availability}/>
      <Card><Copy muted>{t("TikTok, YouTube, Facebook videos or Instagram Reels")}</Copy><Field label={t("Video link")} value={video} onChangeText={value=>{guard.changed();setVideo(value);}} editable={!action.busy} autoCapitalize="none"/><Button secondary disabled={action.busy||!video.trim()||media.filter(item=>item.kind==='video').length>=4} label={t('Add video')} onPress={()=>void action.run(async()=>{const result=await ownerRequest<{ref:string}>('owner/video-link',{url:video});guard.changed();setMedia(current=>[...current,{kind:'video',ref:result.ref}]);setVideo('');return false;})}/></Card>
      <Chip
        label={t("Show on my page")}
        selected={published}
        onPress={() => {if(!action.isBusy()){guard.changed();setPublished(!published);}}}
      />
      </ScrollView>
      <View testID="product-editor-actions" style={{paddingHorizontal:16,paddingVertical:12,borderTopWidth:1,borderColor:colors.line,backgroundColor:'white',gap:8}}>
        <ActionStatus state={action}/>
        <View style={{flexDirection:'row',alignItems:'stretch',gap:10,flexWrap:'wrap'}}>
          <View style={{flex:1,minWidth:120}}><Button disabled={action.busy||!name.trim()} label={t('Save changes')} wrapLabel onPress={save}/></View>
          <View style={{flex:1,minWidth:120}}><Button secondary wrapLabel disabled={action.busy} label={t('Cancel')} onPress={()=>guard.requestLeave(onCancel)}/></View>
        </View>
      </View>
      <OwnerEditConfirmation guard={guard}/>
    </View>
  );
}
