import { normalizeDiscoveryPlaces, discoveryPlaceKey } from "../../../../lib/discovery-contract";
import { MARKET_STOREFRONT_COPY } from "../../../../lib/storefront-copy";
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  Animated,
  Platform,
  Keyboard,
  BackHandler,
  AccessibilityInfo,
  useWindowDimensions,
  StyleSheet,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { marketLinkState, type MarketLinkInput } from "../../src/incoming-link";
import type { Market, MapShop } from "@suqpage/contracts";
import { request, useApp, useLoad } from "../../src/runtime";
import {
  Screen,
  Copy,
  Photo,
  Status,
  Icon,
  colors,
  Button,
  useOpenLink,
} from "../../src/ui";
import {
  BuyingLauncher,
  CategoryArt,
  IconButton,
  Sheet,
} from "../../src/chrome";
import MarketMap from "../../src/MarketMap";
import {useBlockedBusinesses} from '../../src/blocked-businesses';
import type { MapControls } from "../../src/map-contract";
export default function MarketScreen() {
  const blocked=useBlockedBusinesses();
  const { t } = useApp();
  const openLink = useOpenLink();
  const { width } = useWindowDimensions();
  const incomingParams = useLocalSearchParams<MarketLinkInput>();
  const incoming = marketLinkState(incomingParams);
  const incomingKey = JSON.stringify({ ...incoming, intent: incomingParams._intent });
  const [stageHeight, setStageHeight] = useState(500),
    [panel, setPanel] = useState(incoming.open),
    [drawerVisible, setDrawerVisible] = useState(incoming.open),
    [query, setQuery] = useState(incoming.query),
    [text, setText] = useState(incoming.query),
    [categories, setCategories] = useState<string[]>(incoming.categories),
    [place, setPlace] = useState(incoming.place),
    [page, setPage] = useState(incoming.page),
    [picker, setPicker] = useState(""),
    [selected, setSelected] = useState<MapShop | null>(null),
    [nearby, setNearby] = useState<MapShop[]>([]),
    [reduced, setReduced] = useState(false);
  const map = useRef<MapControls>(null),
    opener = useRef<React.ElementRef<typeof Pressable>>(null),
    search = useRef<TextInput>(null),
    results = useRef<ScrollView>(null),
    progress = useRef(new Animated.Value(0)).current;
  const focusPanelControl = useRef(false);
  useEffect(() => {
    const target: ReturnType<typeof marketLinkState> = JSON.parse(incomingKey);
    setText(target.query); setQuery(target.query); setCategories(target.categories);
    setPlace(target.place); setPage(target.page); setPanel(target.open);
  }, [incomingKey]);
  useEffect(() => {
    if (Platform.OS !== "web" || !focusPanelControl.current) return;
    focusPanelControl.current = false;
    const frame = requestAnimationFrame(() => {
      if (panel) search.current?.focus();
      else (opener.current as unknown as { focus?: () => void })?.focus?.();
    });
    return () => cancelAnimationFrame(frame);
  }, [panel]);
  const drawerWidth = Math.min(440, width - 58);
  const params = new URLSearchParams({
    q: query,
    place,
    page: String(page),
  });
  categories.forEach((c) => params.append("category", c));
  if(blocked.list.length)params.set('exclude',blocked.list.map(v=>v.id).join(','));
  const key = params.toString();
  const load = useLoad(() => request<Market>("market?" + key), [key]);
  const data = blocked.ready&&!load.data?.showrooms.some(shop=>blocked.list.some(b=>b.id===shop.id))?load.data:undefined;
  const [filterOptions, setFilterOptions] = useState<Pick<Market, "categories" | "places"> | null>(null);
  useEffect(()=>{if(data)setFilterOptions({categories:data.categories,places:data.places});},[data]);
  useEffect(() => {
    setSelected(null);
    setNearby([]);
  }, [key]);
  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setReduced);
    const sub = AccessibilityInfo.addEventListener(
      "reduceMotionChanged",
      setReduced,
    );
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (panel) setDrawerVisible(true);
    const animation = Animated.timing(progress, {
      toValue: panel ? 1 : 0,
      duration: reduced ? 0 : 220,
      useNativeDriver: Platform.OS !== "web",
    });
    animation.start(({ finished }) => {
      if (finished && !panel) setDrawerVisible(false);
    });
    return () => animation.stop();
  }, [panel, reduced, progress]);
  useEffect(() => {
    if (Platform.OS === "web") return;
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (panel) {
        hide();
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [panel]);
  function hide() {
    focusPanelControl.current = true;
    setPanel(false);
    Keyboard.dismiss();
  }
  function choose(change: () => void) {
    change();
    setPage(1);
    results.current?.scrollTo({ y: 0, animated: false });
  }
  function submit() {
    choose(() => setQuery(text.trim()));
    Keyboard.dismiss();
  }
  function chooseBusiness(shop: MapShop) {
    map.current?.focus(shop);
    setSelected(shop);
  }
  const selectedPlaces = normalizeDiscoveryPlaces(place);
  const chosenPlace = data?.places.filter(p => selectedPlaces.includes(p.key)).map(p=>p.label).join(", ") || place;
  const controls = <View style={m.compactToolbar}>
    <Pressable ref={opener} accessibilityRole="button" accessibilityLabel={t(panel ? "Hide products" : "View products")} accessibilityState={{expanded:panel}} {...(Platform.OS === "web" ? { "aria-expanded": panel } : {})} onPress={()=>{focusPanelControl.current=true; panel ? hide() : setPanel(true);}} style={[m.compactButton,m.resultsToggle,panel && m.activeFilter]}><Icon name={panel ? "back" : "panel"} size={16}/><Text style={m.resultsToggleText}>{t(panel ? "Hide products" : "View products")}</Text></Pressable>
    <View style={m.searchInput}>
      <TextInput ref={search} accessibilityLabel={t("Search")} placeholder={t("Search")} placeholderTextColor={colors.muted} value={text} onChangeText={setText} onSubmitEditing={submit} returnKeyType="search" style={{flex:1,minWidth:0,height:42,padding:8,fontSize:14,color:colors.ink}}/>
      {text.length>0 && <Pressable accessibilityRole="button" accessibilityLabel={t("Clear search")} onPress={()=>choose(()=>{setText("");setQuery("");})} style={{width:44,minHeight:44,alignItems:"center",justifyContent:"center"}}><Icon name="close" size={16}/></Pressable>}
    </View>
    <Pressable accessibilityRole="button" accessibilityLabel={t("Search")} onPress={submit} style={m.searchButton}><Icon name="search" size={20} color="white"/></Pressable>
    {[{scope:"category",label:"Category",value:categories.length ? t("Categories")+` (${categories.length})` : t("All categories"),icon:"grid",count:categories.length,active:categories.length>0},{scope:"place",label:"Region or city",value:chosenPlace||t("All Ethiopia"),icon:"pin",count:selectedPlaces.length,active:!!place}].map(filter=><Pressable key={filter.scope} accessibilityRole="button" accessibilityLabel={t(filter.label)+": "+filter.value} accessibilityState={{selected:filter.active}} onPress={()=>setPicker(filter.scope)} style={[m.compactButton,filter.active && m.activeFilter]}><Icon name={filter.icon} size={21}/>{filter.count > 0 && <Text testID={`${filter.scope}-count`} style={m.filterCount}>{filter.count}</Text>}</Pressable>)}
  </View>;
  return (
    <Screen scroll={false}>
      <View style={m.intro}>
        <Text style={m.eyebrow}>{t("Suqpage Market").toUpperCase()}</Text>
        <Text style={m.headline}>
          {t(MARKET_STOREFRONT_COPY.title)}
        </Text>
        <Text style={m.description}>
          {t(
            MARKET_STOREFRONT_COPY.description,
          )}
        </Text>
      </View>
      <View
        style={m.stage}
        onLayout={(e) => setStageHeight(e.nativeEvent.layout.height)}
      >
        <MarketMap
          ref={map}
          height={stageHeight}
          shops={data?.showrooms || []}
          onSelect={chooseBusiness}
          groups={data?.nearbyGroups}
          selectedId={selected?.id}
          onGroup={setNearby}
        />
        <View style={m.mapTools}>
          <IconButton
            label={t("Zoom in")}
            icon="plus"
            onPress={() => map.current?.zoom(1)}
          />
          <IconButton
            label={t("Zoom out")}
            icon="minus"
            onPress={() => map.current?.zoom(-1)}
          />
          <IconButton
            label={t("Center Ethiopia")}
            icon="target"
            onPress={() => map.current?.reset()}
          />
        </View>
        {controls}
        <Animated.View
          testID="search-drawer"
          pointerEvents={panel ? "auto" : "none"}
          accessibilityElementsHidden={!panel}
          importantForAccessibility={panel ? "auto" : "no-hide-descendants"}
          style={[
            m.drawer,
            {
              width: drawerWidth,
              visibility: drawerVisible ? "visible" : "hidden",
              transform: [
                {
                  translateX: progress.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-drawerWidth, 0],
                  }),
                },
              ],
            },
          ]}
          {...(Platform.OS === "web"
            ? {
                onKeyDown: (e: { key: string; preventDefault: () => void }) => {
                  if (e.key === "Escape") {
                    e.preventDefault();
                    hide();
                  }
                },
              }
            : {})}
        >
          <ScrollView
            ref={results}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 12, gap: 12, paddingBottom: 18 }}
          >
            <Text accessibilityRole="header" style={{ fontSize: 16, fontWeight: "700", color: colors.ink }}>{t("Products & services")}</Text>
            <Status {...load} retry={load.reload} />
            {data && (
              <>
                <Text accessibilityLiveRegion="polite" style={m.count}>
                  {t("{count} results", { count: data.total })}
                </Text>
                {data.items.filter(item => item.kind === "product").map((item) => (
                  <View key={item.kind + "-" + item.id} style={m.result}>
                    <Pressable
                      accessibilityRole="button"
                      accessibilityLabel={item.name}
                      onPress={() => router.push({ pathname: "/product", params: { handle: item.handle, id: item.id } })}
                      style={m.resultProduct}
                    >
                      <View style={{ width: 78 }}>
                        <Photo refPath={item.image} height={92} />
                      </View>
                      <View style={{ flex: 1, gap: 6, paddingVertical: 7 }}>
                        <Text numberOfLines={2} style={m.resultName}>
                          {item.name}
                        </Text>
                      </View>
                    </Pressable>
                    <Pressable accessibilityRole="link" onPress={() => router.push({ pathname: "/shop/[handle]", params: { handle: item.handle } })} style={m.resultBusiness}>
                      <Text style={m.resultBusinessName}>{t("From {business}", { business: item.businessName })}</Text>
                    </Pressable>
                  </View>
                ))}
                {data.items.length === 0 && (
                  <Copy>{t("No matches found")}</Copy>
                )}
                <View style={m.pagination}>
                  <IconButton
                    label={t("Previous")}
                    icon="back"
                    disabled={page <= 1}
                    onPress={() => {
                      setPage((p) => p - 1);
                      results.current?.scrollTo({ y: 0 });
                    }}
                  />
                  <Text style={m.small}>
                    {data.page} / {Math.max(1, data.pages)}
                  </Text>
                  <IconButton
                    label={t("Next")}
                    icon="arrow"
                    disabled={data.page >= data.pages}
                    onPress={() => {
                      setPage((p) => p + 1);
                      results.current?.scrollTo({ y: 0 });
                    }}
                  />
                </View>
              </>
            )}
          </ScrollView>
        </Animated.View>
        <View style={[m.buying, { right: panel ? 7 : 12, bottom: 24 }]}>
          <BuyingLauncher compact={panel} />
        </View>
      </View>
      <Pressable accessibilityRole="link"
        onPress={() => void openLink("https://www.openstreetmap.org/copyright")}
        style={{backgroundColor: "white", padding: 5}}>
        <Text style={{textAlign: "right", fontSize: 11, color: colors.ink}}>© OpenStreetMap contributors</Text>
      </Pressable>
      <Sheet
        visible={!!picker}
        title={t(picker === "category" ? "Categories" : "Region or city")}
        onClose={() => setPicker("")}
      >
        <Button
          secondary
          label={t("Clear")}
          onPress={() =>
            choose(() =>
              picker === "category" ? setCategories([]) : setPlace(""),
            )
          }
        />
        {(picker === "category" ? filterOptions?.categories : filterOptions?.places)
          ?.filter((c) => c.key !== "all")
          .map((c) => {
            const checked =
              picker === "category"
                ? categories.includes(c.key)
                : selectedPlaces.includes(c.key);
            return (
              <Pressable
                key={c.key}
                accessibilityRole="checkbox"
                disabled={picker === "place" && !checked && selectedPlaces.length >= 16}
                accessibilityState={{ checked }}
                {...(Platform.OS === "web" ? { "aria-checked": checked } : {})}
                onPress={() =>
                  choose(() =>
                    picker === "category"
                      ? setCategories((old) =>
                          old.includes(c.key)
                            ? old.filter((v) => v !== c.key)
                            : [...old, c.key],
                        )
                      : setPlace(old => discoveryPlaceKey(normalizeDiscoveryPlaces(old).includes(c.key) ? normalizeDiscoveryPlaces(old).filter(key=>key!==c.key) : [...normalizeDiscoveryPlaces(old),c.key])),
                  )
                }
                style={m.choice}
              >
                {picker === "category" && <CategoryArt name={c.key} />}
                <Text style={{ flex: 1, fontSize: 15, color: colors.ink }}>
                  {picker === "category" ? t(c.label) : c.label}
                </Text>
                {checked && <Icon name="check" color={colors.brand} />}
              </Pressable>
            );
          })}
        {(picker === "category" ? categories.length > 0 : !!place) && <Button secondary label={t(picker === "category" ? "Clear categories" : "Clear location")} onPress={()=>choose(()=>picker === "category" ? setCategories([]) : setPlace(""))}/>}
        <Button label={t("Done")} onPress={() => setPicker("")} />
      </Sheet>
      <Sheet visible={nearby.length > 0} title={t('Nearby')} onClose={() => setNearby([])}>
        {nearby.map(shop => <Button key={shop.id} secondary label={shop.name} onPress={() => {setNearby([]); chooseBusiness(shop);}}/>)}
      </Sheet>
      <Sheet
        visible={!!selected}
        title={t("Business")}
        onClose={() => setSelected(null)}
      >
        {selected && (
          <>
            <Photo refPath={selected.heroImagePath} height={180} />
            <Copy big>{selected.name}</Copy>
            <Copy muted>
              {selected.city} · {selected.region}
            </Copy>
            <Copy>{selected.description}</Copy>
            <Button
              label={t("Explore this business")}
              onPress={() => {
                const handle = selected.handle;
                setSelected(null);
                router.push({ pathname: "/shop/[handle]", params: { handle } });
              }}
            />
          </>
        )}
      </Sheet>
    </Screen>
  );
}
const m = StyleSheet.create({
  intro: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    backgroundColor: "#fbfcfc",
    gap: 4,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
  eyebrow: {
    fontSize: 10,
    letterSpacing: 0.5,
    fontWeight: "800",
    color: colors.brand,
  },
  headline: {
    fontSize: 18,
    lineHeight: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  description: { fontSize: 12, lineHeight: 17, color: "#47606b" },
  stage: {
    flex: 1,
    minHeight: 180,
    backgroundColor: "#dfe9e8",
    overflow: "hidden",
  },
  mapTools: { position: "absolute", right: 9, top: 66, gap: 7 },
  compactToolbar:{position:"absolute",left:10,right:10,top:10,zIndex:10,maxWidth:680,flexDirection:"row",alignItems:"center",gap:6},
  resultsToggle: { width: 68, flexDirection: "column", gap: 1, padding: 2 },
  resultsToggleText: { fontSize: 11, lineHeight: 11, fontWeight: "700", textAlign: "center", color: colors.ink },
  compactButton:{width:44,height:44,flexShrink:0,alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:colors.line,borderRadius:7,backgroundColor:"white"},
  activeFilter:{borderColor:colors.brand,backgroundColor:colors.soft},
  filterCount:{position:"absolute",top:1,right:2,minWidth:14,paddingHorizontal:2,borderRadius:8,backgroundColor:colors.brand,color:"#fff",fontSize:10,lineHeight:14,fontWeight:"700",textAlign:"center"},
  floatingControls: { position:"absolute",left:10,top:12,gap:8 },
  opener: {
    alignSelf:"flex-start",
    maxWidth:"100%",
    minHeight:44,
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 9,
    boxShadow: "0 4px 12px #0001",
  },
  openerText: { fontSize: 14, fontWeight: "800", color: colors.ink, flexShrink:1 },
  small: { fontSize: 12, lineHeight: 17, color: colors.muted },
  openerArrow: { backgroundColor: colors.brand, padding: 9, borderRadius: 6 },
  drawer: {
    position: "absolute",
    left: 0,
    top: 64,
    bottom: 0,
    backgroundColor: "white",
    borderRightWidth: 1,
    borderColor: colors.line,
    boxShadow: "4px 0 14px #0002",
  },
  searchRow: { flexDirection: "row", gap: 6, alignItems: "center", backgroundColor:"white", borderRadius:8 },
  searchInput: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    minHeight: 44,
    backgroundColor:"white",
    flexDirection: "row",
    alignItems: "center",
  },
  searchButton: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.brand,
    borderRadius: 6,
  },
  filterRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  filterLabel: { fontSize: 12, color: colors.ink, fontWeight: "600" },
  select: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 6,
    paddingHorizontal: 8,
    flexDirection: "row",
    gap: 5,
    alignItems: "center",
  },
  clear: { fontSize: 12, color: colors.brand },
  checkbox: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
    minHeight: 30,
    flexShrink: 1,
  },
  check: {
    width: 17,
    height: 17,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 3,
    alignItems: "center",
    justifyContent: "center",
  },
  count: { fontSize: 12, color: colors.muted, paddingTop: 4 },
  resultProduct: { flexDirection: "row", gap: 10, paddingRight: 8 },
  resultBusiness: { marginLeft: 88, minHeight: 44, justifyContent: "center", paddingVertical: 4, paddingRight: 8 },
  resultBusinessName: { color: colors.brand, fontSize: 12, lineHeight: 18, fontWeight: "700", textDecorationLine: "underline" },
  result: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    overflow: "hidden",
    minHeight: 94,
  },
  resultName: {
    fontSize: 14,
    lineHeight: 19,
    fontWeight: "700",
    color: colors.ink,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 4,
  },
  buying: { position: "absolute" },
  choice: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderColor: colors.line,
  },
});
