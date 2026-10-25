import {TRANSPORT_COPY} from "../../../lib/i18n/transport-copy";
import {publicTransportPlacement} from "../../../lib/public-transport-placement";
import {View,useWindowDimensions} from "react-native";
import MainNavigation from "../src/main-navigation";
import React,{useEffect,useState} from "react";
import { router,Stack,useGlobalSearchParams,usePathname,useRootNavigationState } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider,useSafeAreaInsets } from "react-native-safe-area-context";
import { RuntimeProvider, useApp } from "../src/runtime";
import { AppHeader } from "../src/chrome";
import PublicActionDock from '../src/PublicActionDock';
import {PublicScrollInsetProvider} from '../src/public-scroll-inset';
import { colors } from "../src/ui";
import {OwnerAttentionProvider} from '../src/AttentionAlerts';
import {BlockedBusinessProvider} from '../src/blocked-businesses';
import {OwnerEditNavigationProvider} from '../src/owner-edit-navigation';
function Routes() {
  const { t, session, accountEntryReady, consumeAccountEntry } = useApp();
  const rootNavigation=useRootNavigationState();
  useEffect(()=>{
    if(session&&accountEntryReady&&rootNavigation?.key){
      router.replace('/account');consumeAccountEntry();
    }
  },[session?.user.id,accountEntryReady,rootNavigation?.key,consumeAccountEntry]);
  const path=usePathname(),{bottom}=useSafeAreaInsets(),{width,height}=useWindowDimensions();
  const params=useGlobalSearchParams();
  const transportVisible=publicTransportPlacement(path,"native")==="shell";
  // Public scroll actions can clear the floating entry; Market keeps its own placement.
  const [launcherHeight,setLauncherHeight]=useState(72);
  return (
    <View style={{flex:1}}>
      <StatusBar style="dark" />
      <PublicScrollInsetProvider value={transportVisible?launcherHeight+24:0}>
      <Stack
        key={session?.user.id || "visitor"}
        screenOptions={{
          header: () => <AppHeader back />,
          headerTintColor: colors.ink,
          headerStyle: { backgroundColor: "white" },
          headerTitleStyle: { fontWeight: "700" },
          contentStyle: { backgroundColor: colors.background },
          headerBackTitle: t("Back"),
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="shop/[handle]" options={{ title: t("Business page") }} />
        <Stack.Screen
          name="product"
          options={{ title: t("Products") }}
        />
        <Stack.Screen name="inquiry" options={{ title: t("Inquiry") }} />
        <Stack.Screen
          name="buying"
          options={{ title: t(TRANSPORT_COPY.title) }}
        />
        <Stack.Screen
          name="owner/[section]"
          options={{ title: t("Your business") }}
        />
      </Stack>
      </PublicScrollInsetProvider>
      {transportVisible&&<View testID="public-transport-overlay" onLayout={event=>setLauncherHeight(Math.max(48,Math.ceil(event.nativeEvent.layout.height)))} style={{pointerEvents:'box-none',position:'absolute',right:12,bottom:60+bottom+12,maxWidth:width-24,zIndex:20}}>
        <PublicActionDock placement="shell" compact={height<700||width<360||path==='/product'} hideInquiry={path==='/inquiry'&&!params.id}/>
      </View>}
      <MainNavigation/>
    </View>
  );
}
export default function Layout() {
  return (
    <SafeAreaProvider>
      <RuntimeProvider>
        <BlockedBusinessProvider><OwnerAttentionProvider><OwnerEditNavigationProvider><Routes /></OwnerEditNavigationProvider></OwnerAttentionProvider></BlockedBusinessProvider>
      </RuntimeProvider>
    </SafeAreaProvider>
  );
}
