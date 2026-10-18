import React, { useState } from "react";
import {
  Pressable,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { router } from "expo-router";
import type { Featured } from "@suqpage/contracts";
import { request, useLoad, useApp } from "../../src/runtime";
import {
  Screen,
  Copy,
  Photo,
  Status,
  colors,
  Icon,
} from "../../src/ui";
import { SponsorCarousel } from "../../src/SponsorCarousel";
import { CategoryArt } from "../../src/chrome";
import {useBlockedBusinesses} from '../../src/blocked-businesses';
type Program = Featured & {
  schedule: {
    weekday: number;
    dayLabel: string;
    dateLabel: string;
    industryKey: string;
    industryLabel: string;
    isToday: boolean;
  }[];
};
export default function FeaturedScreen() {
  const blocked=useBlockedBusinesses();
  const { t } = useApp(),
    { fontScale } = useWindowDimensions();
  const [day, setDay] = useState("");
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [sponsorBounds, setSponsorBounds] = useState({ y: 0, height: 0 });
  const sponsorVisible = sponsorBounds.height > 0 && Math.min(sponsorBounds.y + sponsorBounds.height, scrollY + viewportHeight) - Math.max(sponsorBounds.y, scrollY) >= sponsorBounds.height / 2;
  const exclude=blocked.list.map(v=>v.id).join(',');
  const load = useLoad(async () => ({exclude, program: await request<Program>("featured?day=" + day+'&exclude='+exclude)}), [day,exclude], true);
  const program = blocked.ready && load.data?.exclude === exclude ? load.data.program : null,
    current = program?.schedule.find((d) =>
      day ? String(d.weekday) === day : d.isToday,
    );
  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: 30 }}
        onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
        onScroll={event => setScrollY(event.nativeEvent.contentOffset.y)} scrollEventThrottle={100}>
      <View style={{ gap: 5 }}>
        <Text style={f.eyebrow}>
          {current && t(current.industryLabel)} · {program?.date}
        </Text>
        <Copy big heading>{t("Daily Featured")}</Copy>
        {program && (
          <View style={f.broadcast}>
            <Icon name="star" size={18} color={colors.brand} />
            <Text style={f.broadcastText}>{program.broadcastLabel}</Text>
          </View>
        )}
      </View>
      <Status {...load} retry={load.reload} />
      {program && (
        <>
          {program.sponsors.length > 0 && (
            <View onLayout={event => setSponsorBounds(event.nativeEvent.layout)}>
              <SponsorCarousel sponsors={program.sponsors} visible={sponsorVisible} />
            </View>
          )}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ gap: 8 }}
          >
            {program.schedule.map((d) => (
              <Pressable
                key={d.weekday}
                accessibilityRole="button"
                accessibilityLabel={t(d.dayLabel)}
                accessibilityState={{
                  selected: current?.weekday === d.weekday,
                }}
                onPress={() => setDay(String(d.weekday))}
                style={[
                  f.day,
                  current?.weekday === d.weekday && {
                    borderColor: colors.brand,
                    backgroundColor: colors.soft,
                  },
                ]}
              >
                <CategoryArt name={d.industryKey} size={34} />
                <Text style={f.name}>{t(d.dayLabel)}</Text>
                <Text style={f.small}>{d.dateLabel}</Text>
              </Pressable>
            ))}
          </ScrollView>
          <View style={f.grid}>
            {program.slots.map((slot) => (
              <View
                key={slot.slot}
                style={[f.item, { width: fontScale > 1.3 ? "100%" : "48%" }]}
              >
                {slot.shop ? (
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={slot.shop.name}
                    onPress={() =>
                      router.push({
                        pathname: "/shop/[handle]",
                        params: { handle: slot.shop!.handle },
                      })
                    }
                  >
                    <Photo refPath={slot.shop.heroImagePath} height={145} />
                    <View style={{ padding: 10, gap: 6 }}>
                      <Text style={f.small}>{slot.shop.city}</Text>
                      <Text style={f.name}>{slot.shop.name}</Text>
                      {slot.shop.isDemo && (
                        <Text style={f.demo}>{t("Demo")}</Text>
                      )}
                      <Text style={f.link}>{t("Explore this business")} →</Text>
                    </View>
                  </Pressable>
                ) : (
                  <View
                    style={{
                      padding: 18,
                      minHeight: 220,
                      justifyContent: "center",
                      alignItems: "center",
                      gap: 12,
                    }}
                  >
                    <Icon name="shop" size={34} />
                    <Text style={f.name}>{t("Coming soon")}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      )}
      </ScrollView>
    </Screen>
  );
}
const f = StyleSheet.create({
  eyebrow: { fontSize: 11, fontWeight: "700", color: colors.brand },
  broadcast: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
  },
  broadcastText: { fontSize: 13, fontWeight: "600", color: colors.ink },
  name: { fontSize: 15, lineHeight: 20, fontWeight: "700", color: colors.ink },
  small: { fontSize: 11, lineHeight: 16, color: colors.muted },
  day: {
    width: 94,
    minHeight: 106,
    padding: 10,
    alignItems: "center",
    gap: 4,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    backgroundColor: "white",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  item: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 7,
    overflow: "hidden",
    backgroundColor: "white",
  },
  demo: {
    alignSelf: "flex-start",
    fontSize: 10,
    color: colors.muted,
    backgroundColor: colors.background,
    padding: 3,
  },
  link: {
    fontSize: 12,
    fontWeight: "700",
    color: colors.brand,
    paddingVertical: 8,
  },
});
