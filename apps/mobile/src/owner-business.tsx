import CountrySelector from "./CountrySelector";
import CitySelector from "./CitySelector";
import OwnerLocationPicker from "./OwnerLocationPicker";
import LocationVisibilityChoices from "./LocationVisibilityChoices";
import type {KnownPlace} from "../../../lib/place-search";
import {countryName} from "../../../lib/countries";
import {BUSINESS_CATEGORY_OPTIONS} from "../../../lib/business-categories";
import React, { useRef, useState } from "react";
import { View } from "react-native";
import type { OwnerHome } from "@suqpage/contracts";
import { useApp, useLoad, request } from "./runtime";
import { Copy, Field, Chip, Button, Card, Status, Photo, s } from "./ui";
import {OwnerAlerts} from './AttentionAlerts';
import { router } from "expo-router";
import { useAction, ActionStatus, pickImages, addAsset } from "./owner-forms";
import {useOwnerEditGuard} from './owner-edit-navigation';
import OwnerEditConfirmation from './OwnerEditConfirmation';
import OwnerEmailChange, { nativeOwnerEmailChangeEnabled } from './OwnerEmailChange';
import ResourceLoading from './ResourceLoading';
type BusinessLocation = {
  country_code: string;
  city: string;
  region: string;
  location_mode: string;
  latitude: number | null;
  longitude: number | null;
  place_id: string | null;
};
type Details = {
  place:Place|null;
  business: { name: string; logo_path:string; content_version: number };
  location?: BusinessLocation | null;
  proposal: BusinessLocation & {version: number} | null;
  existing: { country_code:string; city: string; region: string } | null;
  category: string;
};
type Place = KnownPlace;
export function BusinessSummary({onEdit}:{onEdit:()=>void}) {
  const {t,ownerRequest}=useApp();
  const load=useLoad(()=>ownerRequest<Details>('owner/business'));
  return <><Copy big heading>{t('Business details')}</Copy><ResourceLoading load={load} variant="editor"/>{load.data&&<Card>
    <Copy muted>{t('Business name')}</Copy><Copy>{load.data.business.name}</Copy>
    <Copy muted>{t('Country')}</Copy><Copy>{countryName((load.data.location??load.data.proposal)?.country_code||load.data.existing?.country_code||'')}</Copy>
    <Copy muted>{t('City or town')}</Copy><Copy>{(load.data.location??load.data.proposal)?.city||load.data.existing?.city||t('Not configured')}</Copy>
    <Copy muted>{t('Category')}</Copy><Copy>{t(BUSINESS_CATEGORY_OPTIONS.find(item=>item.key===load.data!.category)?.label||'Not configured')}</Copy>
    <Button secondary label={t('Edit')} onPress={onEdit}/>
  </Card>}</>;
}
export function BusinessForm({onSaved,onCancel}: {onSaved?: () => void;onCancel?:()=>void} = {}) {
  const { ownerRequest } = useApp();
  const load = useLoad(() => ownerRequest<Details>("owner/business"));
  return (
    <>
      <ResourceLoading load={load} variant="editor"/>
      {load.data && <Form data={load.data} onSaved={onSaved} onCancel={onCancel}/>}
    </>
  );
}
function Form({ data, onSaved,onCancel }: { data: Details; onSaved?: () => void;onCancel?:()=>void }) {
  const { t, ownerRequest } = useApp(),
    action = useAction();
  const location=data.location??data.proposal;
  const [name, setName] = useState(data.business.name),
    [logo,setLogo]=useState<Awaited<ReturnType<typeof pickImages>>[number]|null>(null),
    [removeLogo,setRemoveLogo]=useState(false),
    [category, setCategory] = useState(data.category),
    [mode, setMode] = useState<"area" | "storefront">(location?.location_mode === "storefront" ? "storefront" : "area"),
    [placeId, setPlaceId] = useState(location?.place_id??data.place?.id??""),
    [countryCode,setCountryCode]=useState(location?.country_code||data.existing?.country_code||""),
    [city, setCity] = useState(
      location?.city || data.existing?.city || "",
    ),
    [region, setRegion] = useState(
      location?.region || data.existing?.region || "",
    ),
    [latitude, setLatitude] = useState(String(location?.location_mode==='storefront' ? location.latitude ?? "" : "")),
    [longitude, setLongitude] = useState(
      String(location?.location_mode==='storefront' ? location.longitude ?? "" : ""),
    ),
    [selectedPlace,setSelectedPlace]=useState<Place|null>(data.place),
    [version, setVersion] = useState(data.business.content_version),
    [locVersion, setLocVersion] = useState(data.proposal?.version || 0),[resetRevision,setResetRevision]=useState(0);
  const values={name,logo,removeLogo,category,mode,placeId,countryCode,city,region,latitude,longitude,selectedPlace},baseline=useRef(values),signature=JSON.stringify(values);
  const guard=useOwnerEditGuard({dirty:signature!==JSON.stringify(baseline.current),signature,busy:action.busy,isBusy:action.isBusy,discard:()=>{
    const saved=baseline.current;setName(saved.name);setLogo(saved.logo);setRemoveLogo(saved.removeLogo);setCategory(saved.category);setMode(saved.mode);setPlaceId(saved.placeId);setCountryCode(saved.countryCode);setCity(saved.city);setRegion(saved.region);setLatitude(saved.latitude);setLongitude(saved.longitude);setSelectedPlace(saved.selectedPlace);setResetRevision(value=>value+1);
  }});
  const categories = useLoad(() =>
      request<{ categories: { key: string; label: string }[] }>("categories"),
    );
  return (
    <>
      <Copy big heading>{t("Business details")}</Copy>
      <Field label={t("Business name")} value={name} onChangeText={value=>{guard.changed();setName(value);}} editable={!action.busy}/>
      {!removeLogo&&Boolean(logo?.uri||data.business.logo_path)&&<Photo refPath={logo?.uri||data.business.logo_path} privateImage height={100}/>}
      <Button secondary disabled={action.busy} label={t("Logo")} onPress={()=>void action.run(async()=>{const picked=await pickImages();if(picked.length){guard.changed();setLogo(picked[0]);setRemoveLogo(false);}},"")}/>
      <Button secondary disabled={action.busy} label={t("Remove logo")} onPress={()=>{if(action.isBusy())return;guard.changed();setLogo(null);setRemoveLogo(true);}}/>
      <Copy>{t("Category")}</Copy>
      <Status {...categories} retry={categories.reload}/>
      <View style={s.wrap}>
        {categories.data?.categories.map((c) => (
          <Chip
            key={c.key}
            label={t(c.label)}
            selected={category === c.key}
            onPress={() => {if(!action.isBusy()){guard.changed();setCategory(c.key);}}}
          />
        ))}
      </View>
      <CountrySelector value={countryCode} onChange={value=>{guard.changed();setCountryCode(value);setCity("");setRegion("");setPlaceId("");setSelectedPlace(null);setLatitude("");setLongitude("");}}/>
      <CitySelector key={`${countryCode}:${resetRevision}`} countryCode={countryCode} initialPlace={selectedPlace} onSelect={place=>{
        guard.changed();
        setSelectedPlace(place);setPlaceId(place?.id||"");setCity(place?.name||"");setRegion(place?.region||"");
        setLatitude("");setLongitude("");
      }}/>
      <LocationVisibilityChoices value={mode} t={t} onChange={next=>{if(!action.isBusy()){guard.changed();setMode(next);if(next==='area'){setLatitude("");setLongitude("");}}}}/>
      {mode === "storefront" ? selectedPlace ? <OwnerLocationPicker key={selectedPlace.id} city={selectedPlace} point={latitude&&longitude?{latitude:Number(latitude),longitude:Number(longitude)}:null} disabled={action.busy} t={t} onChange={point=>{guard.changed();setLatitude(point?String(point.latitude):"");setLongitude(point?String(point.longitude):"");}}/> : <Copy muted>{t("Choose a city or town from the results to place an exact public pin.")}</Copy> : null}
      <ActionStatus state={action} />
      <View style={{flexDirection:'row',alignItems:'stretch',gap:10,flexWrap:'wrap'}}><View style={{flex:1,minWidth:120}}><Button
        disabled={action.busy||!countryCode||!placeId||(mode==='storefront'&&(!latitude||!longitude))}
        label={t("Save changes")}
        wrapLabel
        onPress={() =>
          void action.run(async () => {
            const checkpoint=guard.checkpoint();
            const details = {
              name,
              category,
              city,
              region,
              placeId,
              countryCode,
              mode,
              latitude,
              longitude,
              expectedVersion: version,
              locationVersion: locVersion,
            };
            if(logo||removeLogo){const form=new FormData();form.set("details",JSON.stringify({...details,removeLogo}));if(logo)await addAsset(form,"logo",logo);await ownerRequest("owner/business",undefined,form);}else await ownerRequest("owner/business",details);
            const saved = await ownerRequest<Details>("owner/business");
            setVersion(saved.business.content_version);
            setLocVersion(saved.proposal?.version || 0);
            baseline.current=values;
            guard.complete(onSaved,signature,checkpoint);
          })
        }
      /></View>{onCancel&&<View style={{flex:1,minWidth:120}}><Button secondary wrapLabel disabled={action.busy} label={t('Cancel')} onPress={()=>guard.requestLeave(onCancel)}/></View>}</View>
      <OwnerEditConfirmation guard={guard}/>
    </>
  );
}
export function Settings({ home, onSaved, view }: { home: OwnerHome; onSaved?: () => void; view?:string }) {
  const { t, ownerRequest, signOut, logoutPending } = useApp(), action = useAction();
  const [phone, setPhone] = useState(home.user.phone), [name, setName] = useState(home.user.name);
  const values={name,phone},baseline=useRef(values),signature=JSON.stringify(values);
  const guard=useOwnerEditGuard({dirty:view==='profile'&&signature!==JSON.stringify(baseline.current),signature,busy:action.busy,isBusy:action.isBusy,discard:()=>{setName(baseline.current.name);setPhone(baseline.current.phone);}});
  async function leaveSession() {
    try { await signOut(); }
    catch { /* Account shows the provider-scoped logout error and Retry. */ }
    finally { router.replace("/account"); }
  }
  const settings=()=>router.replace({pathname:'/owner/[section]',params:{section:'settings',returnTo:'profile'}});
  if(view==='notifications')return <><Copy big heading>{t('Notifications')}</Copy><OwnerAlerts inline preferencesOnly/></>;
  if(view==='email'&&nativeOwnerEmailChangeEnabled)return <OwnerEmailChange currentEmail={home.user.email}/>;
  if(view==='profile')return <>
    <Copy big heading>{t("Edit account details")}</Copy><Copy muted>{home.user.email}</Copy>
    <Field label={t("Name")} value={name} onChangeText={value=>{guard.changed();setName(value);}} maxLength={80} editable={!action.busy}/>
    <Field label={t("Account phone")} value={phone} onChangeText={value=>{guard.changed();setPhone(value);}} keyboardType="phone-pad" editable={!action.busy}/>
    <Button disabled={action.busy} label={t("Save changes")} onPress={() => void action.run(async () => { const checkpoint=guard.checkpoint();await ownerRequest("owner/account", {phone, name});baseline.current=values;guard.complete(onSaved,signature,checkpoint); })} />
    <ActionStatus state={action} />
    <Button secondary label={t('Cancel')} disabled={action.busy} onPress={()=>guard.requestLeave(settings)}/>
    <OwnerEditConfirmation guard={guard}/>
  </>;
  return <>
    <Copy big heading>{t('Account settings')}</Copy>
    <Card><Copy muted>{t('Name')}</Copy><Copy>{home.user.name}</Copy><Copy muted>{t('Account email')}</Copy><Copy>{home.user.email}</Copy><Copy muted>{t('Account phone')}</Copy><Copy>{home.user.phone||t('Not configured')}</Copy>
      <Button secondary label={t('Edit account details')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'settings',view:'profile',returnTo:'settings'}})}/>
    </Card>
    <Card><Button secondary label={t('Notifications')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'settings',view:'notifications',returnTo:'settings'}})}/></Card>
    <Card><Copy heading>{t('Account security')}</Copy>{nativeOwnerEmailChangeEnabled&&<Button secondary label={t('Change sign-in email')} onPress={()=>router.push({pathname:'/owner/[section]',params:{section:'settings',view:'email',returnTo:'settings'}})}/>}<Button secondary disabled={logoutPending} label={t("Sign out")} onPress={() => void leaveSession()} /><Button secondary label={t("Delete account")} onPress={() => router.push("/account-deletion")} /></Card>
  </>;
}
