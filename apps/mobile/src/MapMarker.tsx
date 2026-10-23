import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { markerNameLines, type MarkerItem } from "./map-markers";

export function MapMarker({ item, selected, label, badge, nearby, onPress, nativeMarker = false }: {
  item: MarkerItem; selected: boolean; label: string; badge: string; nearby: string; onPress: () => void; nativeMarker?: boolean;
}) {
  const nativeGroup = nativeMarker && item.kind !== "shop";
  const color = selected ? "#c93600" : "#fa4b00";
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ selected }} onPress={onPress}
    pointerEvents={nativeGroup ? "none" : "box-none"}
    style={[s.touch, item.kind === "shop" ? s.shopTouch:s.groupTouch, nativeGroup && s.nativeGroupTouch]}>
    {badge !== "" && <Text pointerEvents="none" style={[s.badge, nativeGroup && s.nativeGroupBadge, { backgroundColor: item.presence === "featured" ? "#c04a1d" : "#a92f00" }]}>{badge}</Text>}
    {item.kind === "shop" ? <>
      <View style={s.shopHit}>
      <Svg width={36} height={34} viewBox="0 0 36 34" aria-hidden>
        <Rect x={5} y={9} width={26} height={23} rx={2} fill={color} stroke="white" strokeWidth={1.5}/>
        <Path d="M5 3H31L34 11H2Z" fill={color} stroke="white" strokeWidth={1.5}/>
        <Path d="M9 16H27M9 19H27M11 30V23H25V30" fill="none" stroke="white" strokeWidth={1.4}/>
      </Svg>
      </View>
      <Text numberOfLines={3} style={[s.name, selected && s.selectedName]}>{markerNameLines(item.shop?.name || "")}</Text>
    </> : <View pointerEvents={nativeGroup ? "none" : "auto"} style={s.groupHit}><View pointerEvents="none" style={[s.cluster, item.kind === "nearby" && s.nearby]}>
      <Text style={s.count}>{item.count}</Text>
      {item.kind === "nearby" && <Text style={s.small}>{nearby}</Text>}
    </View></View>}
  </Pressable>;
}
const s = StyleSheet.create({
  touch: { width: 96, minHeight: 58, alignItems: "center", justifyContent: "center", paddingTop: 14, paddingBottom: 3 },
  // The 44px hit frame adds 10px; these offsets keep the existing glyph/name pixels.
  shopTouch: { paddingTop: 9 },
  groupTouch:{paddingTop:13},
  // Android hit-tests this measured host, not descendant pointerEvents. SDK
  // dispatch owns physical taps; the single Pressable retains its accessible action.
  nativeGroupTouch:{width:48,minHeight:48,paddingTop:0,paddingBottom:0},
  nativeGroupBadge:{top:-13},
  groupHit:{width:48,height:48,alignItems:'center',justifyContent:'center'},
  shopHit: { width: 44, height: 44, alignItems: "center", justifyContent: "center", marginBottom: -5 },
  name: { maxWidth: 94, backgroundColor: "#fff4e9", borderColor: "#c93600", borderWidth: 1,
    borderRadius: 4, paddingHorizontal: 4, paddingVertical: 3,
    fontSize: 11, lineHeight: 13, fontWeight: "800", color: "#c93600", textAlign: "center" },
  selectedName: { backgroundColor: "#c93600", color: "white" },
  cluster: { width: 46, height: 46, borderRadius: 29, borderWidth: 3, borderColor: "white", backgroundColor: "#c93600", alignItems: "center", justifyContent: "center" },
  nearby: { width: 58, height: 58 },
  count: { fontSize: 16, fontWeight: "800", color: "white" },
  small: { fontSize: 9, fontWeight: "800", color: "white" },
  badge: { position: "absolute", top: 0, alignSelf: "center", color: "white", borderWidth: 1, borderColor: "white", borderRadius: 3, paddingHorizontal: 5, fontSize: 9, fontWeight: "800" },
});
