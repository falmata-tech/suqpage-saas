import {CoverEditor,ShowroomMenu} from "../../src/owner-profile";
import ProductSupply from '../../src/ProductSupply';
import {HandleEditor} from "../../src/owner-handle";
import React from "react";
import { View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import type { OwnerHome } from "@suqpage/contracts";
import { useApp, useLoad } from "../../src/runtime";
import { Screen, Copy, Button, Card, Photo, Status } from "../../src/ui";
import { Setup, PageEditor, ProductEditor } from "../../src/owner-forms";
import { BusinessForm, BusinessSummary, Settings } from "../../src/owner-business";
import { Inquiries, SupportList, OwnerChat } from "../../src/owner-inbox";
import BuyingScreen from '../buying';
import OwnerTransportHistory from '../../src/OwnerTransportHistory';
import {ownerPageTask} from '../../../../lib/owner-page-tasks';
import {useOwnerNavigation} from '../../src/owner-edit-navigation';
import ResourceLoading from '../../src/ResourceLoading';
export default function OwnerScreen() {
  const { section: screen, id, view, returnTo } = useLocalSearchParams<{
      section: string;
      id?: string;
      view?: string;
      returnTo?: string;
    }>(),
    { session, t, ownerRequest } = useApp();
  const navigate=useOwnerNavigation();
  const load = useLoad(
    () =>
      session && !['setup','transport','transport-history'].includes(screen)
        ? ownerRequest<OwnerHome>("owner/home")
        : Promise.resolve(null),
    [screen, id, session?.user.id],
    ["products","inquiries","support"].includes(screen),
  );
  if (!session)
    return (
      <Screen>
        <Copy>{t("Sign in to AfricMade.")}</Copy>
        <Button
          label={t("Sign in")}
          onPress={() => router.replace("/account")}
        />
      </Screen>
    );
  if (screen === "setup")
    return (
      <Screen>
        <Setup />
      </Screen>
    );
  if(screen==='transport')return <BuyingScreen key={`${session.user.id}:${id||'active'}:${view||''}`} owner conversationId={id} newIntake={view==='new'}/>;
  if(screen==='transport-history')return <OwnerTransportHistory key={session.user.id}/>;
  const backToProfile=()=>router.replace("/account");
  const backToShowroom=()=>router.replace({pathname:'/owner/[section]',params:{section:'showroom',returnTo:'profile'}});
  const backToBusiness=()=>router.replace({pathname:'/owner/[section]',params:{section:'business',returnTo:'profile'}});
  const backToSettings=()=>router.replace({pathname:'/owner/[section]',params:{section:'settings',returnTo:'profile'}});
  const backToProducts=()=>router.replace({pathname:'/owner/[section]',params:{section:'products'}});
  const done=returnTo === "profile" ? backToProfile : backToShowroom;
  return (
    <View style={{ flex: 1 }}>
      <Screen key={`${screen}:${screen==='page'?'':view||''}:${id||''}`} scroll={screen!=='product'}>
        <ResourceLoading load={load} variant={screen==='products'?'list':screen==='settings'||screen==='showroom'?'profile':screen==='chat'?'thread':'editor'}/>
        {screen!=='page'&&<View style={screen==='product'?{paddingHorizontal:16,paddingTop:12}:undefined}><Button secondary label={t(screen==='product'?'Products':returnTo==='showroom'?'Back to your page':returnTo==='settings'?'Account settings':returnTo==='business'?'Business details':'Back to account')} onPress={()=>navigate(screen==='product'?backToProducts:returnTo==='showroom'?backToShowroom:returnTo==='settings'?backToSettings:returnTo==='business'?backToBusiness:backToProfile)}/></View>}
        {load.data && (
          <>
            {screen === "showroom" ? <ShowroomMenu/> : screen === "cover" ? <CoverEditor home={load.data} onSaved={done} onCancel={done}/> : screen === "handle" ? <HandleEditor initialHandle={load.data.shop.handle} onSaved={done} onCancel={done}/> : screen === "page" ? (
              <PageEditor home={load.data} reload={load.reload} onSaved={done} onCancel={done} backLabel={returnTo==='profile'?'Back to account':'Back to your page'} initialTask={ownerPageTask(view)} initialPreview={view === "preview" || view==='color' || (!view && load.data.shop.status === "draft")} />
            ) : screen === "business" ? (
              view==='edit'?<BusinessForm onSaved={returnTo==='profile'?backToProfile:backToBusiness} onCancel={returnTo==='profile'?backToProfile:backToBusiness}/>:<BusinessSummary onEdit={()=>router.push({pathname:'/owner/[section]',params:{section:'business',view:'edit',returnTo:'business'}})}/>
            ) : screen === "settings" ? (
              <Settings key={view||'summary'} home={load.data} view={view} onSaved={returnTo==='profile'?backToProfile:backToSettings}/>
            ) : screen === "product" ? (
              <ProductEditor
                home={load.data}
                id={id}
                onCancel={backToProducts}
                onSaved={() =>
                  router.replace({
                    pathname: "/owner/[section]",
                    params: { section: "products" },
                  })
                }
              />
            ) : screen === "inquiries" ? (
              <Inquiries focusId={id}/>
            ) : screen === "support" ? (
              <SupportList />
            ) : screen === "chat" && id ? (
              <OwnerChat id={id} />
            ) : screen === "products" ? (
              <>
                <Copy big heading>{t("Products")}</Copy>
                <Button
                  label={t("Add product")}
                  icon="plus"
                  onPress={() =>
                    router.push({
                      pathname: "/owner/[section]",
                      params: { section: "product" },
                    })
                  }
                />
                {load.data.shop.products.map((p) => (
                  <Card key={p.id}>
                    <View style={{flexDirection:'row',alignItems:'center',gap:12}}>
                    <View style={{width:72,flexShrink:0}}><Photo
                      refPath={
                        p.media.find((m) => m.kind === "image")?.ref || ""
                      }
                      privateImage
                      height={72}
                    /></View>
                    <View style={{flex:1,minWidth:0,gap:4}}><Copy>{p.name}</Copy>
                    <Copy muted>{t(p.kind==='service'?'Retired listing':p.published ? "Published" : "Draft")}</Copy>
                    <ProductSupply kind={p.kind} availability={p.availability}/>
                    </View>
                    <View style={{maxWidth:90,flexShrink:0}}><Button
                      secondary
                      wrapLabel
                      label={t("Edit")}
                      onPress={() =>
                        router.push({
                          pathname: "/owner/[section]",
                          params: { section: "product", id: p.id },
                        })
                      }
                    /></View></View>
                  </Card>
                ))}
              </>
            ) : (
              <Copy>{t("Page not found.")}</Copy>
            )}
          </>
        )}
      </Screen>

    </View>
  );
}
