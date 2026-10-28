import React, { useCallback, useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, AppState, Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "expo-router";
import type { Featured } from "@africmade/contracts";
import { useSponsorRotation } from "../../../lib/use-sponsor-rotation";
import { API, useApp } from "./runtime";
import { colors, Icon, useOpenLink, Photo } from "./ui";

export function SponsorCarousel({ sponsors, visible }: { sponsors: Featured["sponsors"]; visible: boolean }) {
  return sponsors.length ? <Carousel key={sponsors.map(s => s.id).join(",")} sponsors={sponsors} visible={visible} /> : null;
}

function Carousel({ sponsors, visible }: { sponsors: Featured["sponsors"]; visible: boolean }) {
  const { t } = useApp();
  const openLink = useOpenLink();
  const [focusedScreen, setFocusedScreen] = useState(false);
  const [foreground, setForeground] = useState(AppState.currentState === "active");
  const [reduced, setReduced] = useState(true);
  const [reader, setReader] = useState(Platform.OS !== "web");
  const [interacting, setInteracting] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focusedControl, setFocusedControl] = useState(false);
  useFocusEffect(useCallback(() => { setFocusedScreen(true); return () => setFocusedScreen(false); }, []));
  useEffect(() => {
    let mounted = true;
    void AccessibilityInfo.isReduceMotionEnabled().then(value => { if (mounted) setReduced(value); });
    // RN Web always reports true here; web relies on focus and reduced motion.
    if (Platform.OS !== "web") void AccessibilityInfo.isScreenReaderEnabled().then(value => { if (mounted) setReader(value); });
    const motion = AccessibilityInfo.addEventListener("reduceMotionChanged", setReduced);
    const screenReader = AccessibilityInfo.addEventListener("screenReaderChanged", setReader);
    const state = AppState.addEventListener("change", value => setForeground(value === "active"));
    return () => { mounted = false; motion.remove(); screenReader.remove(); state.remove(); };
  }, []);
  const rotation = useSponsorRotation(sponsors.length, visible && foreground && focusedScreen && !interacting && !hovered && !focusedControl, reduced || reader);
  const offset = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    offset.setValue(reduced ? 0 : 12);
    const animation = Animated.timing(offset, { toValue: 0, duration: reduced ? 0 : 280, useNativeDriver: Platform.OS !== "web" });
    animation.start();
    return () => animation.stop();
  }, [rotation.index, reduced, offset]);
  const sponsor = sponsors[rotation.index];
  const interaction = {
    onPressIn: () => setInteracting(true), onPressOut: () => setInteracting(false),
    onHoverIn: () => setHovered(true), onHoverOut: () => setHovered(false),
    onFocus: () => setFocusedControl(true), onBlur: () => setFocusedControl(false),
  };
  return <View style={s.container} testID="sponsor-carousel">
    <View style={s.header}>
      <Text style={s.label}>{t("Sponsored")}</Text>
      {sponsors.length > 1 && <View style={s.controls}>
        <Text style={s.count}>{rotation.index + 1} / {sponsors.length}</Text>
        <Pressable {...interaction} accessibilityRole="button" accessibilityLabel={t(rotation.paused ? "Resume sponsors" : "Pause sponsors")} onPress={() => { if (rotation.paused) { setFocusedControl(false); setHovered(false); } rotation.toggle(); }} style={s.control}><Icon name={rotation.paused ? "play" : "pause"} size={18} /></Pressable>
        <Pressable {...interaction} accessibilityRole="button" accessibilityLabel={t("Previous sponsor")} onPress={() => rotation.step(-1)} style={s.control}><Icon name="back" size={18} /></Pressable>
        <Pressable {...interaction} accessibilityRole="button" accessibilityLabel={t("Next sponsor")} onPress={() => rotation.step(1)} style={s.control}><Icon name="arrow" size={18} /></Pressable>
      </View>}
    </View>
    <View style={s.viewport}>
      <Animated.View style={{ transform: [{ translateX: offset }] }} accessibilityLiveRegion={rotation.running ? "none" : "polite"}>
        <Pressable {...interaction} testID={`sponsor-${sponsor.id}`} accessibilityRole="link" accessibilityLabel={sponsor.name}
          onPress={() => void openLink(sponsor.href.startsWith("/") ? API + sponsor.href : sponsor.href)} style={s.card}>
          <View style={{ width: 76 }}><Photo refPath={sponsor.imagePath} height={92} /></View>
          <View style={s.copy}>
            <Text style={s.name}>{sponsor.name}</Text>
            <Text style={s.details} numberOfLines={2}>{sponsor.details}</Text>
          </View>
          <Icon name="arrow" size={16} color={colors.brand} />
        </Pressable>
      </Animated.View>
    </View>
  </View>;
}
const s = StyleSheet.create({
  container: { backgroundColor: colors.soft, padding: 10, gap: 7, borderRadius: 7, borderWidth: 1, borderColor: "#ead9ce" },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 5 },
  label: { fontSize: 12, fontWeight: "700", color: colors.brand },
  controls: { flexDirection: "row", alignItems: "center", gap: 3 },
  count: { fontSize: 11, color: colors.muted, paddingRight: 5 },
  control: { width: 44, height: 44, alignItems: "center", justifyContent: "center", backgroundColor: "white", borderWidth: 1, borderColor: "#e4d4ca", borderRadius: 6 },
  viewport: { overflow: "hidden", borderRadius: 6 },
  card: { flexDirection: "row", alignItems: "center", gap: 10, paddingRight: 9, backgroundColor: "white", borderRadius: 6 },
  copy: { flex: 1, gap: 4, paddingVertical: 9 },
  name: { color: colors.ink, fontSize: 15, lineHeight: 20, fontWeight: "700" },
  details: { fontSize: 11, lineHeight: 16, color: colors.muted },
});
