import React from "react";
import { Pressable, View, Text, StyleSheet } from "react-native";
import Svg, { Path, Rect } from "react-native-svg";
import { markerNameLines, type MarkerItem } from "./map-markers";

export function MapMarker({ item, selected, label, badge, nearby, onPress }: {
  item: MarkerItem; selected: boolean; label: string; badge: string; nearby: string; onPress: () => void;
}) {
  const color = selected ? "#a92f00" : "#c93600";
  return <Pressable accessibilityRole="button" accessibilityLabel={label}
    accessibilityState={{ selected }} onPress={onPress} style={s.touch}>
    {badge !== "" && <Text style={[s.badge, { backgroundColor: item.presence === "featured" ? "#c04a1d" : "#a92f00" }]}>{badge}</Text>}
    {item.kind === "shop" ? <>
      <Svg width={36} height={34} viewBox="0 0 36 34" aria-hidden>
        <Rect x={5} y={9} width={26} height={23} rx={2} fill={color} stroke="white" strokeWidth={2}/>
        <Path d="M5 3H31L34 11H2Z" fill={color} stroke="white" strokeWidth={2}/>
        <Path d="M9 16H27M9 19H27M11 30V23H25V30" fill="none" stroke="white" strokeWidth={1}/>
      </Svg>
      <Text style={s.name}>{markerNameLines(item.shop?.name || "")}</Text>
    </> : <View style={[s.cluster, item.kind === "nearby" && s.nearby]}>
      <Text style={s.count}>{item.count}</Text>
      {item.kind === "nearby" && <Text style={s.small}>{nearby}</Text>}
    </View>}
  </Pressable>;
}
const s = StyleSheet.create({
  touch: { width: 96, minHeight: 58, alignItems: "center", justifyContent: "center", paddingTop: 14, paddingBottom: 3 },
  name: { maxWidth: 94, backgroundColor: "#fffffff0", borderRadius: 3, paddingHorizontal: 4, paddingVertical: 2,
    fontSize: 10, lineHeight: 12, fontWeight: "800", color: "#202428", textAlign: "center" },
  cluster: { width: 46, height: 46, borderRadius: 29, borderWidth: 3, borderColor: "white", backgroundColor: "#c93600", alignItems: "center", justifyContent: "center" },
  nearby: { width: 58, height: 58 },
  count: { fontSize: 16, fontWeight: "800", color: "white" },
  small: { fontSize: 9, fontWeight: "800", color: "white" },
  badge: { position: "absolute", top: 0, alignSelf: "center", color: "white", borderWidth: 1, borderColor: "white", borderRadius: 3, paddingHorizontal: 5, fontSize: 9, fontWeight: "800" },
});
