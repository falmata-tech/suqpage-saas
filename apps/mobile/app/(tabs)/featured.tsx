import {usePublicScrollInset} from '../../src/public-scroll-inset';
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Pressable,
  Platform,
  View,
  Text,
  ScrollView,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { router, useFocusEffect } from "expo-router";
import type { Featured } from "@africmade/contracts";
import { request, useLoad, useApp } from "../../src/runtime";
import {
  Screen,
  Copy,
  Photo,
  Status,
  colors,
  Icon,
  useOpenLink,
} from "../../src/ui";
import { SponsorCarousel } from "../../src/SponsorCarousel";
import { CategoryArt } from "../../src/chrome";
import {useBlockedBusinesses} from '../../src/blocked-businesses';
import {CATALOG_CARD_GAP,catalogCardStyle} from '../../src/catalog-card-layout';
import ResourceLoading from '../../src/ResourceLoading';
import { featuredBroadcastHeader } from "../../../../lib/featured-broadcast-header";
import {featuredBoothWalkthroughs} from '../../../../lib/featured-program';
export default function FeaturedScreen() {
  const blocked=useBlockedBusinesses();
  const { t } = useApp(),
    openLink = useOpenLink(),
    { fontScale } = useWindowDimensions();
  const [day, setDay] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const [scrollY, setScrollY] = useState(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const [sponsorBounds, setSponsorBounds] = useState({ y: 0, height: 0 });
  const [gridWidth,setGridWidth] = useState(0);
  const sponsorVisible = sponsorBounds.height > 0 && Math.min(sponsorBounds.y + sponsorBounds.height, scrollY + viewportHeight) - Math.max(sponsorBounds.y, scrollY) >= sponsorBounds.height / 2;
  const exclude=blocked.list.map(v=>v.id).join(',');
  const load = useLoad(async () => ({exclude, program: await request<Featured>("featured?day=" + day+'&exclude='+exclude)}), [day,exclude], true);
  const program = blocked.ready && load.data?.exclude === exclude ? load.data.program : null,
    current = program?.schedule.find((d) =>
      day ? String(d.weekday) === day : d.isToday,
    );
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);
  const broadcast = program && current
    ? featuredBroadcastHeader({
        day: current,
        boothCount: program.slots.length,
        now,
        policy: program.policy,
        tiktokUrl: program.tiktokUrl,
        youtubeUrl: program.youtubeUrl,
        t,
      })
    : null;
  const presentationTimes=new Map(program&&current?featuredBoothWalkthroughs(current.dateIso,program.slots.length,now,program.policy).map(entry=>[entry.slot,entry.label]):[]);
  const bottomInset=usePublicScrollInset();
  const categoryScroll = useRef<ScrollView>(null);
  const categoryLayouts = useRef(new Map<number, { x: number; width: number }>());
  const categoryViewport = useRef(0);
  const categoryContentWidth = useRef(0);
  const categoryOffset = useRef(0);
  const selectedCategory = useRef(current?.weekday);
  selectedCategory.current = current?.weekday;
  const revealCurrentCategory = useCallback((restoreOffset = false) => {
    const selected = selectedCategory.current;
    const bounds = selected === undefined ? undefined : categoryLayouts.current.get(selected);
    const viewport = categoryViewport.current;
    if (!bounds || viewport <= 0 || categoryContentWidth.current <= 0) return;
    const offset = categoryOffset.current;
    const visible = bounds.x >= offset && bounds.x + bounds.width <= offset + viewport;
    if (visible && !restoreOffset) return;
    const desired = visible ? offset : bounds.x < offset ? bounds.x - 8 : bounds.x + bounds.width + 8 - viewport;
    const next = Math.max(0, Math.min(desired, categoryContentWidth.current - viewport));
    if (!restoreOffset && Math.abs(next - offset) < 1) return;
    categoryOffset.current = next;
    categoryScroll.current?.scrollTo({ x: next, animated: false });
  }, []);
  useEffect(revealCurrentCategory, [current?.weekday, fontScale, revealCurrentCategory]);
  useFocusEffect(useCallback(() => { revealCurrentCategory(true); }, [revealCurrentCategory]));
  return (
    <Screen scroll={false}>
      <ScrollView contentContainerStyle={{ padding: 18, gap: 16, paddingBottom: Math.max(30,bottomInset) }}
        onLayout={event => setViewportHeight(event.nativeEvent.layout.height)}
        onScroll={event => setScrollY(event.nativeEvent.contentOffset.y)} scrollEventThrottle={100}>
      <View style={{ gap: 8 }}>
        <Copy big heading>{t("Daily Featured on TikTok Live")}</Copy>
        {broadcast && (
          <View testID="featured-broadcast-status" style={f.programSummary}>
            <Text style={f.summaryDate}>{t(current!.dayLabel)} · {current!.dateLabel}</Text>
            <Text style={f.summaryTime}>{broadcast.timeLabel}</Text>
            <Text style={[f.summaryStatus,broadcast.phase==='ended'&&{color:colors.muted}]}>{broadcast.statusLabel}</Text>
            {!!broadcast.href && <Pressable accessibilityRole="link" onPress={() => void openLink(broadcast.href)} style={f.broadcastAction}>
              <Text style={f.broadcastActionText}>{broadcast.actionLabel}</Text>
              <Icon name="arrow" size={15} color={colors.brand} />
            </Pressable>}
          </View>
        )}
      </View>
      {(load.loading||load.error||!program)&&<ResourceLoading load={load} variant="featured"/>}
      {program && (
        <>
          <ScrollView
            ref={categoryScroll}
            testID="featured-category-choices"
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={f.categoryChoices}
            onLayout={event => {
              const width = event.nativeEvent.layout.width;
              if (Number.isFinite(width) && width > 0) {
                categoryViewport.current = width;
                revealCurrentCategory();
              }
            }}
            onContentSizeChange={width => {
              if (Number.isFinite(width) && width > 0) {
                categoryContentWidth.current = width;
                revealCurrentCategory();
              }
            }}
            onScroll={event => { categoryOffset.current = event.nativeEvent.contentOffset.x; }}
            scrollEventThrottle={16}
          >
            {program.schedule.map((d) => (
              <Pressable
                key={d.weekday}
                testID={`featured-category-${d.weekday}`}
                accessibilityRole="button"
                {...(Platform.OS === "web" ? { "aria-pressed": current?.weekday === d.weekday } : {})}
                accessibilityLabel={t("{value1}, {value2}, {value3}{value4}", {
                  value1: t(d.industryLabel), value2: t(d.dayLabel), value3: d.dateLabel,
                  value4: d.isToday ? `, ${t("Today")}` : "",
                })}
                accessibilityState={{
                  selected: current?.weekday === d.weekday,
                }}
                onPress={() => setDay(String(d.weekday))}
                onLayout={event => {
                  const { x, width } = event.nativeEvent.layout;
                  if (Number.isFinite(x) && x >= 0 && Number.isFinite(width) && width > 0) {
                    categoryLayouts.current.set(d.weekday, { x, width });
                    revealCurrentCategory();
                  }
                }}
                style={[
                  f.day,
                  current?.weekday === d.weekday && {
                    borderColor: colors.brand,
                    backgroundColor: colors.soft,
                  },
                ]}
              >
                <View style={f.categoryHeading}>
                  <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants" aria-hidden>
                    <CategoryArt name={d.industryKey} size={32} />
                  </View>
                  <Text style={f.categoryName}>{t(d.industryLabel)}</Text>
                </View>
                <Text style={[f.categorySchedule, d.isToday && f.today]}>
                  {t(d.dayLabel)} · {d.dateLabel}{d.isToday ? ` · ${t("Today")}` : ""}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <View testID="featured-business-grid" style={f.grid} onLayout={event=>{const width=event.nativeEvent.layout.width;if(Number.isFinite(width)&&width>0)setGridWidth(current=>current===width?current:width);}}>
            {program.slots.map((slot) => (
              <View
                key={slot.slot}
                testID={`featured-business-${slot.slot}`}
                style={[f.item,catalogCardStyle(gridWidth,fontScale)]}
              >
                {current?.isToday&&slot.revealed&&slot.shop ? (
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
                      <Text style={f.name}>{slot.shop.name}</Text>
                      <Text style={f.small}>{slot.shop.city}</Text>
                      <Text testID={`featured-presentation-${slot.slot}`} style={f.presentationTime}>{presentationTimes.get(slot.slot)} {t('EAT')}</Text>
                      {slot.shop.isDemo && (
                        <Text style={f.demo}>{t("Example page")}</Text>
                      )}
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
                    <Text testID={`featured-presentation-${slot.slot}`} style={f.presentationTime}>{presentationTimes.get(slot.slot)} {t('EAT')}</Text>
                  </View>
                )}
              </View>
            ))}
          </View>
          {program.sponsors.length > 0 && (
            <View testID="featured-sponsors" onLayout={event => setSponsorBounds(event.nativeEvent.layout)}>
              <SponsorCarousel sponsors={program.sponsors} visible={sponsorVisible} />
            </View>
          )}
        </>
      )}
      </ScrollView>
    </Screen>
  );
}
const f = StyleSheet.create({
  programSummary:{flexDirection:'row',flexWrap:'wrap',alignItems:'center',columnGap:12,rowGap:5},
  summaryDate:{fontSize:13,lineHeight:19,color:colors.muted},
  summaryTime:{fontSize:13,lineHeight:19,fontWeight:'600',color:colors.ink},
  summaryStatus:{fontSize:12,lineHeight:18,fontWeight:'600',color:colors.brand},
  broadcastAction:{minHeight:44,alignSelf:'flex-start',flexDirection:'row',alignItems:'center',gap:6,paddingHorizontal:4},
  broadcastActionText:{fontSize:13,lineHeight:18,fontWeight:'700',color:colors.brand},
  presentationTime:{fontSize:12,lineHeight:18,fontWeight:'600',color:colors.brand},
  name: { fontSize: 15, lineHeight: 20, fontWeight: "700", color: colors.ink },
  small: { fontSize: 11, lineHeight: 16, color: colors.muted },
  categoryChoices: { gap: 8, alignItems: "stretch" },
  categoryHeading: { flexDirection: "row", alignItems: "center", gap: 8 },
  categoryName: { flex: 1, minWidth: 0, fontSize: 14, lineHeight: 18, fontWeight: "700", color: colors.ink },
  categorySchedule: { fontSize: 12, lineHeight: 17, color: colors.muted },
  today: { color: colors.brand, fontWeight: "600" },
  day: {
    width: 176,
    minHeight: 96,
    flexShrink: 0,
    padding: 10,
    justifyContent: "space-between",
    gap: 8,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    backgroundColor: "white",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: CATALOG_CARD_GAP,
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
});
