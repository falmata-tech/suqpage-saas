import {usePublicScrollInset} from '../../src/public-scroll-inset';
import React from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { Shop } from "@africmade/contracts";
import { useLoad, request } from "../../src/runtime";
import { Screen, Status } from "../../src/ui";
import { ShowroomContent } from "../../src/ShowroomContent";
import {CatalogSafety} from '../../src/CatalogSafety';
import ResourceLoading from '../../src/ResourceLoading';
import {usePublicShop} from '../../src/use-public-shop';
export default function Showroom() {
  const bottomInset=usePublicScrollInset();
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const load = usePublicShop(handle);
  return <Screen scroll={false}>
    <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{paddingBottom:bottomInset}}>
      <ResourceLoading load={load} variant="showroom"/>
      {load.data && <CatalogSafety key={handle} business={load.data}><ShowroomContent shop={load.data} catalogReady={!load.loading&&!load.error}/></CatalogSafety>}
    </ScrollView>
  </Screen>;
}
