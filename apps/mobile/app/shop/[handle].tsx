import React from "react";
import { ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import type { Shop } from "@suqpage/contracts";
import { useLoad, request } from "../../src/runtime";
import { Screen, Status } from "../../src/ui";
import { ShowroomContent } from "../../src/ShowroomContent";
import {CatalogSafety} from '../../src/CatalogSafety';
import ResourceLoading from '../../src/ResourceLoading';
export default function Showroom() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const load = useLoad(() => request<Shop>("shops/" + encodeURIComponent(handle)), [handle]);
  return <Screen scroll={false}>
    <ScrollView keyboardShouldPersistTaps="handled">
      <ResourceLoading load={load} variant="showroom"/>
      {load.data && <CatalogSafety key={handle} business={load.data}><ShowroomContent shop={load.data} catalogReady={!load.loading&&!load.error}/></CatalogSafety>}
    </ScrollView>
  </Screen>;
}
