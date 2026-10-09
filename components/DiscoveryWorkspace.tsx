"use client";
import { normalizeDiscoveryPlaces, discoveryPlaceKey } from "@/lib/discovery-contract";
import launchStyles from "./LaunchClarity.module.css";
import previewStyles from "./MapPreviewDialog.module.css";
import LoadingBar from "./LoadingBar";
import { useUiText } from "@/lib/i18n/ui";

import { mapDisplayLocation } from "@/lib/map-display-location";
import { readPlatformState } from "@/lib/platform-state";

import Image from "next/image";
import CategoryChooser from "./CategoryChooser";
import { productHref } from "@/lib/product-inquiry";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Crosshair, LocateFixed, Map as MapIcon, Minus, Package, Plus, Search, X, MapPin, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import MarketplaceMap, { type MarketplaceMapController } from "@/components/MarketplaceMap";
import type { DiscoveryNearbyGroup, DiscoveryProductResult, DiscoverySearchSuggestion, DiscoveryShowroom, MarketplaceDiscoveryView } from "@/lib/discovery";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";

const ETHIOPIA_BOUNDS: [number, number, number, number] = [32, 3, 49, 15];
const DISCOVERY_SESSION_KEY = "suqpage:discovery-navigation:v2";
const DISCOVERY_RETURN_KEY = "suqpage:last-marketplace-url:v1";

type MapView = {
  center: [number, number];
  zoom: number;
};

type DiscoveryViewMode = "map" | "search";

function initialMapView(showrooms: DiscoveryShowroom[], place: string): MapView {
  if (!place || showrooms.length === 0) return { center: [9.145, 40.4897], zoom: 5 };
  const latitudes = showrooms.map((showroom) => showroom.latitude).filter(Number.isFinite);
  const longitudes = showrooms.map((showroom) => showroom.longitude).filter(Number.isFinite);
  if (!latitudes.length || !longitudes.length) return { center: [9.145, 40.4897], zoom: 5 };
  const latitude = latitudes.reduce((sum, value) => sum + value, 0) / latitudes.length;
  const longitude = longitudes.reduce((sum, value) => sum + value, 0) / longitudes.length;
  const span = Math.max(Math.max(...latitudes) - Math.min(...latitudes), Math.max(...longitudes) - Math.min(...longitudes));
  const zoom = span <= 0.15 ? 12 : span <= 0.5 ? 10 : span <= 1.5 ? 8 : span <= 4 ? 7 : 6;
  return { center: [latitude, longitude], zoom };
}

type DiscoverySessionState = {
  scope: string;
  activeNearbyGroupKey: string | null;
  selectedShowroomId: number | null;
  mapView: MapView;
  updatedAt: number;
};

function readDiscoverySession(scope: string): DiscoverySessionState | null {
  try {
    const parsed = JSON.parse(readPlatformState(window.sessionStorage, DISCOVERY_SESSION_KEY) || "null") as DiscoverySessionState | null;
    if (!parsed || parsed.scope !== scope || Date.now() - parsed.updatedAt > 2 * 60 * 60 * 1000) return null;
    if (![...parsed.mapView.center, parsed.mapView.zoom].every(Number.isFinite)) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeDiscoverySession(state: DiscoverySessionState) {
  try {
    window.sessionStorage.setItem(DISCOVERY_SESSION_KEY, JSON.stringify(state));
  } catch {}
}

function rememberCurrentPublicWorkspace() {
  try {
    window.sessionStorage.setItem(DISCOVERY_RETURN_KEY, `${window.location.pathname}${window.location.search}${window.location.pathname === "/" ? "#discover" : ""}`);
  } catch {}
}

type ShowroomPresence = {
  kind: "featured" | "live" | "";
  label: string;
  shortLabel: string;
};

function showroomPresence(showroom: DiscoveryShowroom, featuredNowBusinessId: number | null, t: import("@/lib/i18n/core").UiText): ShowroomPresence {
  if (showroom.id === featuredNowBusinessId) return { kind: "featured", label: t("Featured now"), shortLabel: t("Featured") };
  if (showroom.isLive && showroom.livePlatform) {
    return { kind: "live", label: t("Live on {value1}", { value1: LIVE_PLATFORM_LABELS[showroom.livePlatform] }), shortLabel: t("Live") };
  }
  return { kind: "", label: "", shortLabel: "" };
}

function MapPinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
}

function DiscoverySearch({ id, value, suggestions, onChange, onSelect, onSubmit, onClear }: { id: string; value: string; suggestions: DiscoverySearchSuggestion[]; onChange: (value: string) => void; onSelect: (value: string) => void; onSubmit: (value: string) => void; onClear: () => void }) {
  const t = useUiText();
  const [ready, setReady] = useState(false);
  useEffect(() => { setReady(true); }, []);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const normalizedValue = value.trim().toLocaleLowerCase();
  const visibleSuggestions = normalizedValue.length >= 2
    ? suggestions.filter((suggestion) => `${suggestion.label} ${suggestion.detail} ${suggestion.query}`.toLocaleLowerCase().includes(normalizedValue)).slice(0, 6)
    : [];
  const listboxId = `${id}-suggestions`;
  const expanded = open && visibleSuggestions.length > 0;
  const choose = (suggestion: DiscoverySearchSuggestion) => {
    setOpen(false);
    setActiveIndex(-1);
    onSelect(suggestion.query);
  };
  return <form className="discovery-search" role="search" onSubmit={(event) => { event.preventDefault(); setOpen(false); setActiveIndex(-1); onSubmit(value); }} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) { setOpen(false); setActiveIndex(-1); } }}>
    <label><span className="sr-only">{t("Search products, services, businesses or places")}</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg><input disabled={!ready} id={id} name="q" type="search" role="combobox" value={value} onFocus={() => setOpen(true)} onChange={(event) => { setOpen(true); setActiveIndex(-1); onChange(event.target.value); }} onKeyDown={(event) => {
      if (event.key === "ArrowDown" && visibleSuggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex((current) => Math.min(current + 1, visibleSuggestions.length - 1)); }
      if (event.key === "ArrowUp" && visibleSuggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1); }
      if (event.key === "Enter" && expanded && activeIndex >= 0) { event.preventDefault(); choose(visibleSuggestions[activeIndex]); }
      if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); }
    }} maxLength={80} autoComplete="off" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listboxId : undefined} aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined} placeholder={t("Search")} /></label>
    {value ? <button disabled={!ready} className="discovery-search-clear" type="button" onClick={() => { setOpen(false); setActiveIndex(-1); onClear(); }} aria-label={t("Clear marketplace search")} title={t("Clear search")}><X aria-hidden="true" /></button> : null}
    <button disabled={!ready} className="discovery-search-submit" type="submit" aria-label={t("Show search results")} title={t("Search")}><Search aria-hidden="true" /><span>{t("Search")}</span></button>
    {expanded ? <div id={listboxId} className="discovery-search-suggestions" role="listbox" aria-label={t("Search suggestions")}>{visibleSuggestions.map((suggestion, index) => <button id={`${listboxId}-${index}`} key={`${suggestion.kind}-${suggestion.query}`} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(suggestion)}><span><b>{suggestion.label}</b><small>{suggestion.detail}</small></span><em>{suggestion.kind === "offering" ? t("Item") : suggestion.kind === "showroom" ? t("Business") : t("Place")}</em></button>)}</div> : null}
  </form>;
}

function discoveryHref(action: string, values: Record<string, string | number | undefined>, hash = "discover") {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `${action}?${params.toString()}#${hash}`;
}

function searchRelevance(query: string, values: string[]) {
  const needle = query.trim().toLocaleLowerCase();
  const normalized = values.map((value) => value.toLocaleLowerCase());
  if (normalized.some((value) => value === needle)) return 0;
  if (normalized.some((value) => value.startsWith(needle))) return 1;
  if (normalized.some((value) => value.includes(needle))) return 2;
  return 3;
}

function ProductResultImage({ product }: { product: DiscoveryProductResult }) {
  const [failed, setFailed] = useState(false);
  return product.imagePath && !failed
    ? <Image src={product.imagePath} alt="" width={280} height={180} onError={() => setFailed(true)} />
    : <span className="discovery-search-result-fallback" aria-hidden="true"><Package /><b>{product.name}</b></span>;
}

function MarketplaceSearchResults({ action, discovery }: {
  action: string;
  discovery: MarketplaceDiscoveryView;
}) {
  const t = useUiText();
  const resultList = useRef<HTMLDivElement>(null);
  useEffect(() => { resultList.current?.scrollTo({ top: 0 }); }, [discovery.resultPage.page, discovery.query, discovery.industry.key, discovery.place]);
  const productsById = new Map(discovery.searchProducts.map(product => [product.id, product]));
  const visibleProducts = discovery.searchOrder
    ? discovery.searchOrder.flatMap(result => result.kind === "product" && productsById.has(result.id) ? [productsById.get(result.id)!] : [])
    : discovery.searchProducts;
  const renderProduct = (product: MarketplaceDiscoveryView["searchProducts"][number]) => <article key={product.id} className="discovery-product-card" data-industry={product.primaryIndustryKey}>
    <Link className="discovery-product-link" href={`${productHref(product.businessHandle, product.id)}&ref=discovery`} onClick={rememberCurrentPublicWorkspace} aria-label={t("{value1} from {value2}, {value3}. View details.", { value1: product.name, value2: product.businessName, value3: product.city })}>
      <span className="discovery-product-result-media"><ProductResultImage product={product} /></span>
      <span className="discovery-product-result-copy"><small>{product.categoryName}</small><strong>{product.name}</strong>{product.isDemo ? <span className={launchStyles.example}>{t("Demo")}</span> : null}<p>{product.description}</p><em>{product.city}, {product.region}</em></span>
    </Link>
    <Link className="discovery-product-business" href={`/@${encodeURIComponent(product.businessHandle)}?ref=discovery`} onClick={rememberCurrentPublicWorkspace}>{t("From {business}", { business: product.businessName })}</Link>
  </article>;

  return <section className="discovery-search-workspace" aria-labelledby="discovery-search-results-title">
    <h2 id="discovery-search-results-title" className="discovery-results-heading">{t("Products & services")}</h2>
    <div ref={resultList} className="discovery-search-results">
      {visibleProducts.length === 0 ? <div className="discovery-search-empty"><Search aria-hidden="true" /><h3>{t("No matches found")}</h3><p>{t("Try another product, business, category, or place.")}</p></div> : null}
      <div className="discovery-product-results">{visibleProducts.map(renderProduct)}</div>
    </div>
    {discovery.resultPage.totalItems > 0 ? <nav className="discovery-pagination" aria-label={t("Result pages")}>
      <p className="sr-only" aria-live="polite">{t("{first}–{last} of {total} results", { first: discovery.resultPage.firstItem, last: discovery.resultPage.lastItem, total: discovery.resultPage.totalItems })}</p>
      <div>{discovery.resultPage.page > 1 ? <Link scroll={false} aria-label={t("Previous page")} href={discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: discovery.place, view: "search", page: discovery.resultPage.page - 1 })}><ChevronLeft aria-hidden="true" /></Link> : <span role="link" aria-disabled="true" aria-label={t("Previous page")}><ChevronLeft aria-hidden="true" /></span>}
        <span>{t("Page {page} of {pages}", { page: discovery.resultPage.page, pages: discovery.resultPage.totalPages })}</span>
        {discovery.resultPage.page < discovery.resultPage.totalPages ? <Link scroll={false} aria-label={t("Next page")} href={discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: discovery.place, view: "search", page: discovery.resultPage.page + 1 })}><ChevronRight aria-hidden="true" /></Link> : <span role="link" aria-disabled="true" aria-label={t("Next page")}><ChevronRight aria-hidden="true" /></span>}
      </div>
    </nav> : null}
  </section>;
}

export default function DiscoveryWorkspace({ discovery, hideIntro = false, view }: { discovery: MarketplaceDiscoveryView; hideIntro?: boolean; view?: DiscoveryViewMode }) {
  const t = useUiText();
  const router = useRouter();
  const action = "/";
  const [searchInput, setSearchInput] = useState(discovery.query);
  const searchEditing = useRef(false);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [activeNearbyGroupKey, setActiveNearbyGroupKey] = useState<string | null>(null);
  const [requestedView, setRequestedView] = useState<MapView | null>(null);
  const [nearMeStatus, setNearMeStatus] = useState("");
  const [panelOpen, setPanelOpen] = useState(view === "search" || (view !== "map" && Boolean(discovery.query || discovery.place || discovery.industry.key !== "all")));
  const [filtersPending, startFilterTransition] = useTransition();
  function changeFilters(industry: string, place: string) {
    startFilterTransition(() => router.push(discoveryHref(action, {
      industry, place, q: searchInput.trim(), view: panelOpen ? "search" : "map",
    }), { scroll: false }));
  }
  const locationMenu = useRef<HTMLDetailsElement | null>(null);
  useEffect(() => {
    const closeLocation = (event: PointerEvent) => {
      if (event.target instanceof Node && !locationMenu.current?.contains(event.target) && locationMenu.current) locationMenu.current.open=false;
    };
    document.addEventListener("pointerdown", closeLocation);
    return () => document.removeEventListener("pointerdown", closeLocation);
  }, []);
  const panelOpener = useRef<HTMLButtonElement | null>(null);
  const panelCloser = useRef<HTMLButtonElement | null>(null);
  const panelFocusRequested = useRef(false);
  function setResultsView(open: boolean) {
    panelFocusRequested.current=true; setPanelOpen(open);
    const url = new URL(window.location.href);
    url.searchParams.set("view", open ? "search" : "map");
    window.history.replaceState(null, "", url.href);
    rememberCurrentPublicWorkspace();
  }
  function hidePanel() { setResultsView(false); }
  function showPanel() { setResultsView(true); }
  useEffect(()=>{
    if (!panelFocusRequested.current) return;
    panelFocusRequested.current=false;
    const frame=requestAnimationFrame(()=>(panelOpen ? panelCloser : panelOpener).current?.focus());
    return ()=>cancelAnimationFrame(frame);
  },[panelOpen]);
  const mapRef = useRef<MarketplaceMapController | null>(null);
  const mapViewRef = useRef<MapView>({ center: [9.145, 40.4897], zoom: 5 });
  const navigationScope = useMemo(() => [action, discovery.industry.key, discovery.place].join("|"), [action, discovery.industry.key, discovery.place]);

  useEffect(() => {
    setSelectedShowroomId(null);
    setActiveNearbyGroupKey(null);
  }, [discovery.industry.key, discovery.place, discovery.query]);

  useEffect(() => {
    const saved = readDiscoverySession(navigationScope);
    if (saved) {
      mapViewRef.current = saved.mapView;
      setRequestedView(saved.mapView);
      const savedGroup = discovery.nearbyGroups.find((group) => group.key === saved.activeNearbyGroupKey) || null;
      const savedSelection = discovery.showrooms.find((showroom) => showroom.id === saved.selectedShowroomId) || null;
      const selectionBelongsToGroup = !savedGroup || (savedSelection && savedGroup.showroomIds.includes(savedSelection.id));
      setActiveNearbyGroupKey(savedGroup?.key || null);
      setSelectedShowroomId(savedSelection && selectionBelongsToGroup ? savedSelection.id : null);
    } else {
      const defaultView = initialMapView(discovery.showrooms, discovery.place);
      mapViewRef.current = defaultView;
      setRequestedView(defaultView);
      setSelectedShowroomId(null);
    }
    rememberCurrentPublicWorkspace();
  }, [discovery.nearbyGroups, discovery.showrooms, navigationScope]);

  useEffect(() => {
    setSearchInput((current) => {
      if (searchEditing.current && current.trim() !== discovery.query) return current;
      searchEditing.current = false;
      return discovery.query;
    });
  }, [discovery.query]);

  useEffect(() => {
    const restoreSearch = () => {
      searchEditing.current = false;
      setPanelOpen(new URL(window.location.href).searchParams.get("view") === "search");
      setSearchInput(new URL(window.location.href).searchParams.get("q")?.trim().slice(0, 80) || "");
    };
    window.addEventListener("popstate", restoreSearch);
    return () => window.removeEventListener("popstate", restoreSearch);
  }, []);

  function editSearch(value: string) {
    searchEditing.current = true;
    setSearchInput(value);
  }

  useEffect(() => {
    const nextQuery = searchInput.trim();
    if (nextQuery === discovery.query || (nextQuery.length > 0 && nextQuery.length < 2)) return;
    const timer = window.setTimeout(() => {
      router.replace(discoveryHref(action, {
        industry: discovery.industry.key,
        q: nextQuery,
        place: discovery.place,
        view: panelOpen ? "search" : "map",
      }), { scroll: false });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [action, discovery.industry.key, discovery.place, discovery.query, router, searchInput, panelOpen]);

  function rememberNavigation(activeGroup: string | null, mapView = mapViewRef.current, selectedId = selectedShowroomId) {
    writeDiscoverySession({
      scope: navigationScope,
      activeNearbyGroupKey: activeGroup,
      selectedShowroomId: selectedId,
      mapView,
      updatedAt: Date.now(),
    });
  }

  function openNearbyGroup(group: DiscoveryNearbyGroup) {
    setSelectedShowroomId(null);
    setActiveNearbyGroupKey(group.key);
    rememberNavigation(group.key, mapViewRef.current, null);
  }

  function applySearch(nextQuery: string) {
    const boundedQuery = nextQuery.trim().slice(0, 80);
    editSearch(boundedQuery);
    router.push(discoveryHref(action, {
      industry: discovery.industry.key,
      q: boundedQuery,
      place: discovery.place,
      view: panelOpen ? "search" : "map",
    }), { scroll: false });
  }

  const showroomById = useMemo(() => new Map(discovery.showrooms.map((showroom) => [showroom.id, showroom])), [discovery.showrooms]);
  const selectedShowroom = showroomById.get(selectedShowroomId || -1) || null;
  const activeNearbyGroup = discovery.nearbyGroups.find((group) => group.key === activeNearbyGroupKey) || null;
  const activeNearbyShowrooms = useMemo(() => activeNearbyGroup?.showroomIds.map((showroomId) => showroomById.get(showroomId)).filter((showroom): showroom is DiscoveryShowroom => Boolean(showroom)) || [], [activeNearbyGroup, showroomById]);
  function resetMap() {
    setActiveNearbyGroupKey(null);
    setSelectedShowroomId(null);
    rememberNavigation(null, mapViewRef.current, null);
    mapRef.current?.reset();
  }

  function zoomBy(factor: number) {
    if (factor > 1) mapRef.current?.zoomIn();
    else mapRef.current?.zoomOut();
  }

  function useNearMe() {
    if (!navigator.geolocation) {
      setNearMeStatus("Location is not available in this browser.");
      return;
    }
    setNearMeStatus("Finding your general area...");
    navigator.geolocation.getCurrentPosition(({ coords }) => {
      if (coords.longitude < ETHIOPIA_BOUNDS[0] || coords.latitude < ETHIOPIA_BOUNDS[1] || coords.longitude > ETHIOPIA_BOUNDS[2] || coords.latitude > ETHIOPIA_BOUNDS[3]) {
        setNearMeStatus("Your location is outside the current Ethiopia map.");
        return;
      }
      mapRef.current?.centerAt(coords.latitude, coords.longitude, 11);
      setNearMeStatus("Map centered near your location.");
    }, () => {
      setNearMeStatus("Location was not shared. Choose a region or city instead.");
    }, {
      enableHighAccuracy: false,
      timeout: 8_000,
      maximumAge: 300_000,
    });
  }

  const selectedPlaces = normalizeDiscoveryPlaces(discovery.place);
  const controls = <div className="discovery-compact-toolbar" aria-busy={filtersPending} onKeyDown={event=>{if(event.key === "Escape" && !event.defaultPrevented && panelOpen) {event.preventDefault();hidePanel();}}}>
    <button ref={panelOpen ? panelCloser : panelOpener} type="button" className="discovery-results-toggle" aria-label={t(panelOpen ? "Hide products" : "View products")} title={t("Products & services")} aria-controls="discovery-search-panel" aria-expanded={panelOpen} onClick={panelOpen ? hidePanel : showPanel}>
      {panelOpen ? <PanelLeftClose size={16} aria-hidden="true"/> : <PanelLeftOpen size={16} aria-hidden="true"/>}
      <span>{t(panelOpen ? "Hide products" : "View products")}</span>
    </button>
    <div className="discovery-command-search"><DiscoverySearch id="discovery-search" value={searchInput} suggestions={[]} onChange={editSearch} onSelect={applySearch} onSubmit={applySearch} onClear={() => applySearch("")} /></div>
    <CategoryChooser compact categories={discovery.industries} value={discovery.industry.key} disabled={filtersPending} onChange={key => changeFilters(key, discovery.place)} />
    <details ref={locationMenu} className="discovery-location-menu" data-active={Boolean(discovery.place)} onKeyDown={event=>{if(event.key === "Escape" && event.currentTarget.open){event.preventDefault();event.stopPropagation();event.currentTarget.open=false;event.currentTarget.querySelector('summary')?.focus();}}}>
      <summary aria-label={t("Filter by region or city")} aria-describedby={selectedPlaces.length ? "discovery-location-count" : undefined} title={`${t("Region or city")}: ${discovery.places.filter(place=>selectedPlaces.includes(place.key)).map(place=>place.label).join(", ") || t("All Ethiopia")}`}><MapPin size={21} aria-hidden="true"/>{selectedPlaces.length > 0 ? <b id="discovery-location-count" className="discovery-filter-count">{selectedPlaces.length}</b> : null}</summary>
      <div className="discovery-location-options">
        <strong>{t("Region or city")}</strong>
        <div role="group" aria-label={t("Region or city")}>
          {(["region", "city"] as const).map(kind => <div key={kind}>
            <strong>{t(kind === "region" ? "Regions" : "Cities")}</strong>
            {discovery.places.filter(place=>place.kind === kind).map(place => <label key={place.key}>
              <input type="checkbox" checked={selectedPlaces.includes(place.key)} disabled={filtersPending || (selectedPlaces.length >= 16 && !selectedPlaces.includes(place.key))}
                onChange={()=>changeFilters(discovery.industry.key, discoveryPlaceKey(selectedPlaces.includes(place.key) ? selectedPlaces.filter(key=>key!==place.key) : [...selectedPlaces,place.key]))}/>
              <span>{place.label}</span>
            </label>)}
          </div>)}
        </div>
        {discovery.place ? <button type="button" disabled={filtersPending} onClick={event=>{changeFilters(discovery.industry.key,"");const menu=event.currentTarget.closest('details');if(menu)menu.open=false;}}><X size={16}/>{t("Clear location")}</button> : null}
      </div>
    </details>
  </div>;

  return <section className="discovery discovery-marketplace" id="discover" aria-label={t("Suqpage Market")}>
    {!hideIntro ? <div className="discovery-switcher">
      <div className="discovery-switcher-head"><div><span className="discovery-kicker">{t("Suqpage Market")}</span><h2 id="discovery-title">{t("Find businesses, products and services.")}</h2></div><p>{t("Search by product, service, business or place.")}</p></div>
    </div> : null}

    <div className="discovery-workbench discovery-workbench-map discovery-drawer-workbench" data-panel-open={panelOpen}>
      {controls}
      {filtersPending && <div className="discovery-loading-feedback"><LoadingBar/></div>}
      <aside id="discovery-search-panel" className="discovery-summary discovery-search-panel" aria-labelledby="discovery-panel-title" aria-hidden={!panelOpen} inert={!panelOpen} onKeyDown={event=>{if(event.key === "Escape" && !event.defaultPrevented) { event.preventDefault(); hidePanel(); }}}>
        <h2 id="discovery-panel-title" className="sr-only">{t("Search & filters")}</h2>
        <MarketplaceSearchResults action={action} discovery={discovery} />
      </aside>
      <span className="sr-only" aria-live="polite">{nearMeStatus}</span>
    <div className="discovery-map-shell">
      <div className="discovery-map-stage">
      <div className="discovery-floating-tools">
        <div className="discovery-floating-buttons" aria-label={t("Map controls")}>
          <button type="button" onClick={useNearMe} aria-label={t("Center the map near me")} title={t("Near me")}><LocateFixed aria-hidden="true" /></button>
          <button type="button" onClick={() => zoomBy(1.5)} aria-label={t("Zoom in")} title={t("Zoom in")}><Plus aria-hidden="true" /></button>
          <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label={t("Zoom out")} title={t("Zoom out")}><Minus aria-hidden="true" /></button>
          <button type="button" onClick={resetMap} aria-label={t("Center Ethiopia")} title={t("Center Ethiopia")}><Crosshair aria-hidden="true" /></button>
        </div>
      </div>
        {mapFailed ? <div className="discovery-map-fallback"><p>{t("The marketplace map is temporarily unavailable.")}</p><button type="button" onClick={() => window.location.reload()}>{t("Retry map")}</button></div> : null}
        {!mapFailed ? <MarketplaceMap
          ref={mapRef}
          showrooms={discovery.showrooms}
          nearbyGroups={discovery.nearbyGroups}
          featuredNowBusinessId={discovery.featuredNowBusinessId}
          selectedShowroomId={selectedShowroomId}
          requestedView={requestedView}
          onViewChange={(mapView) => {
            mapViewRef.current = mapView;
            rememberNavigation(activeNearbyGroupKey, mapView, selectedShowroomId);
          }}
          onOpenNearbyGroup={openNearbyGroup}
          onSelectShowroom={(showroom) => {
            mapRef.current?.centerAt(showroom.latitude, showroom.longitude, 14);
            setActiveNearbyGroupKey(null);
            setSelectedShowroomId(showroom.id);
            rememberNavigation(activeNearbyGroupKey, mapViewRef.current, showroom.id);
          }}
          onError={() => setMapFailed(true)}
        /> : null}
        {activeNearbyGroup ? <NearbyShowroomsViewer group={activeNearbyGroup} showrooms={activeNearbyShowrooms} featuredNowBusinessId={discovery.featuredNowBusinessId} selectedShowroomId={selectedShowroomId} onSelect={(showroomId) => {
          setSelectedShowroomId(showroomId);
          rememberNavigation(activeNearbyGroup.key, mapViewRef.current, showroomId);
        }} onBack={() => {
          setSelectedShowroomId(null);
          rememberNavigation(activeNearbyGroup.key, mapViewRef.current, null);
        }} onClose={() => {
          setActiveNearbyGroupKey(null);
          setSelectedShowroomId(null);
          rememberNavigation(null, mapViewRef.current, null);
        }} onOpen={rememberCurrentPublicWorkspace} /> : null}
        {selectedShowroom && !activeNearbyGroup ? <ShowroomPreview showroom={selectedShowroom} source="discovery" onClose={() => {
          setSelectedShowroomId(null);
          rememberNavigation(null, mapViewRef.current, null);
        }} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(selectedShowroom, discovery.featuredNowBusinessId, t)} /> : null}
      </div>
    </div>
    </div>

  </section>;
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.heroImagePath && !failed ? <Image src={showroom.heroImagePath} unoptimized={showroom.heroImagePath.startsWith("/api/page-media/")} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function MapPreviewDialog({ labelledBy, onClose, children, wide = false }: { labelledBy: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      // Leaflet may replace the selected marker while centering the map.
      if (previousFocus && previousFocus !== document.body && previousFocus.isConnected && previousFocus.getClientRects().length) {
        previousFocus.focus({ preventScroll: true });
      } else {
        document.querySelector<HTMLElement>('.discovery-workbench[data-panel-open="true"] .discovery-panel-close, .discovery-panel-opener:not([hidden])')?.focus({ preventScroll: true });
      }
    };
  }, []);
  return <dialog ref={dialogRef} className={previewStyles.dialog} data-wide={wide} aria-labelledby={labelledBy}
    onCancel={event => { event.preventDefault(); onClose(); }}
    onKeyDown={event => {
      if (event.key !== "Tab") return;
      const controls = [...event.currentTarget.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], [tabindex="0"]')].filter(element => element.getClientRects().length);
      const first = controls[0], last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) onClose();
    }}>{children}</dialog>;
}

function ShowroomPreview({ showroom, source, onClose, onOpen, label, presence }: { showroom: DiscoveryShowroom; source: "discovery" | "featured"; onClose: () => void; onOpen?: () => void; label?: string; presence?: ShowroomPresence }) {
  const t = useUiText();
  const status = presence?.label || label || (showroom.sponsored ? "Sponsored" : showroom.primaryIndustryShortLabel);
  return <MapPreviewDialog labelledBy={`showroom-preview-${showroom.id}`} onClose={onClose}><aside className="discovery-preview" data-hero-image={showroom.heroImagePath || undefined}><button className="discovery-preview-close" type="button" onClick={onClose} aria-label={t("Close page preview")}><X aria-hidden="true" /></button><article><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence?.kind ? `presence-${presence.kind}` : undefined}>{t(status)}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3>{showroom.isDemo ? <span className={launchStyles.example}>{t("Demo")}</span> : null}<p>{showroom.tagline}</p><small>{showroom.city} · {showroom.region}{showroom.locationMode === "area" ? t("· Approximate area") : ""}</small><Link href={`/@${showroom.handle}?ref=${source}`} onClick={onOpen}>{t("Open page")}{" "}<b aria-hidden="true">→</b></Link></div></article></aside></MapPreviewDialog>;
}

function NearbyShowroomsViewer({
  group,
  showrooms,
  featuredNowBusinessId,
  selectedShowroomId,
  onSelect,
  onBack,
  onClose,
  onOpen,
}: {
  group: DiscoveryNearbyGroup;
  showrooms: DiscoveryShowroom[];
  featuredNowBusinessId: number | null;
  selectedShowroomId: number | null;
  onSelect: (showroomId: number) => void;
  onBack: () => void;
  onClose: () => void;
  onOpen: () => void;
}) {
  const t = useUiText();
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const lastSelectedId = useRef<number | null>(null);
  const selectedShowroom = showrooms.find((showroom) => showroom.id === selectedShowroomId) || null;
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, [group.key]);
  useEffect(() => {
    if (selectedShowroom) {
      lastSelectedId.current = selectedShowroom.id;
      backRef.current?.focus({ preventScroll: true });
    } else if (lastSelectedId.current !== null) {
      listRef.current?.querySelector<HTMLButtonElement>(`[data-showroom-id="${lastSelectedId.current}"]`)?.focus({ preventScroll: true });
    }
  }, [selectedShowroomId]);

  return <MapPreviewDialog labelledBy="nearby-showroom-title" onClose={onClose} wide><aside className={`nearby-showroom-viewer${selectedShowroom ? " detail-open" : ""}`}>
    <header>
      {selectedShowroom
        ? <button ref={backRef} className="nearby-showroom-back" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /><span>{t("Back to results")}</span></button>
        : <div className="nearby-showroom-heading"><span>{group.city}</span><h2 id="nearby-showroom-title">{t("Nearby pages")}</h2><p>{group.count} {group.count === 1 ? t("result") : t("results")} {" "}{t("in this area")}</p></div>}
      <button ref={closeRef} type="button" onClick={onClose} aria-label={t("Close nearby results")}><X aria-hidden="true" /></button>
    </header>
    {selectedShowroom ? <NearbyShowroomDetail showroom={selectedShowroom} presence={showroomPresence(selectedShowroom, featuredNowBusinessId, t)} onOpen={onOpen} /> : <div ref={listRef} className="nearby-showroom-grid">
      {showrooms.map((showroom) => {
        const presence = showroomPresence(showroom, featuredNowBusinessId, t);
        return <button key={showroom.id} type="button" data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} data-presence={presence.kind || undefined} className={`${presence.kind ? ` ${presence.kind}` : ""}${selectedShowroomId === showroom.id ? " selected" : ""}`} onClick={() => onSelect(showroom.id)} aria-label={t("{value1}, {value2}, {value3}.{value4} View details.", { value1: showroom.name, value2: showroom.primaryIndustryLabel, value3: showroom.city, value4: presence.label ? ` ${t(presence.label)}.` : "" })}>
          <span className="nearby-showroom-media"><ShowroomImage showroom={showroom} />{presence.kind ? <i>{t(presence.shortLabel)}</i> : null}</span>
          <span className="nearby-showroom-copy"><small>{t(showroom.primaryIndustryShortLabel)}</small><strong>{showroom.name}</strong>{showroom.isDemo ? <span className={launchStyles.example}>{t("Demo")}</span> : null}<em>{t("View details")}</em></span>
        </button>;
      })}
    </div>}
  </aside></MapPreviewDialog>;
}

function NearbyShowroomDetail({ showroom, presence, onOpen }: { showroom: DiscoveryShowroom; presence: ShowroomPresence; onOpen: () => void }) {
  const t = useUiText();
  const status = presence.label || (showroom.sponsored ? "Sponsored" : showroom.primaryIndustryShortLabel);
  return <article className="nearby-showroom-detail">
    <ShowroomImage showroom={showroom} />
    <div>
      <span className={presence.kind ? `presence-${presence.kind}` : undefined}>{t(status)}</span>
      <h2 id="nearby-showroom-title">{showroom.name}</h2>
      <p>{showroom.tagline}</p>
      <small>{showroom.city} · {showroom.region}{showroom.locationMode === "area" ? t("· Approximate area") : ""}</small>
      <Link href={`/@${showroom.handle}?ref=discovery`} onClick={onOpen}>{t("Open page")}{" "}<b aria-hidden="true">→</b></Link>
    </div>
  </article>;
}
