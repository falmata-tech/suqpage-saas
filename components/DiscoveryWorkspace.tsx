"use client";
import { readPlatformState } from "@/lib/platform-state";

import Image from "next/image";
import { productHref } from "@/lib/product-inquiry";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Crosshair, LocateFixed, Map as MapIcon, Minus, Package, Plus, Search, SlidersHorizontal, Store, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
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
type SearchResultType = "all" | "products" | "businesses";

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

const compactIndustryLabels: Record<string, string> = {
  all: "All categories",
  electronics: "Electronics & electrical",
  "beauty-wellness": "Personal & home care",
  "agriculture-growers": "Farms, livestock & feed",
  "food-farming": "Food & drink",
  "machinery-tools": "Tools & metalwork",
  "home-living": "Furniture, art & building",
  "fashion-textiles": "Clothing & textiles",
};

type ShowroomPresence = {
  kind: "featured" | "live" | "";
  label: string;
  shortLabel: string;
};

function showroomPresence(showroom: DiscoveryShowroom, featuredNowBusinessId: number | null): ShowroomPresence {
  if (showroom.id === featuredNowBusinessId) return { kind: "featured", label: "Featured now", shortLabel: "Featured" };
  if (showroom.isLive && showroom.livePlatform) {
    return { kind: "live", label: `Live on ${LIVE_PLATFORM_LABELS[showroom.livePlatform]}`, shortLabel: "Live" };
  }
  return { kind: "", label: "", shortLabel: "" };
}

const iconPath: Record<string, string> = {
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  circuit: "M4 4h6v6H4zM14 14h6v6h-6zM10 7h4v10h-4M7 10v4h10",
  leaf: "M19 4C11 4 5 8 5 15c4 1 9-1 12-5-3 4-7 6-12 7M5 20c1-6 5-10 11-13",
  sprout: "M12 21v-9M12 14c-5 0-8-3-8-8 5 0 8 3 8 8ZM12 11c0-4 3-7 8-7 0 5-3 8-8 8",
  bowl: "M4 10h16c0 5-3 9-8 9s-8-4-8-9ZM7 6c1-2 3-3 5-3s4 1 5 3M8 22h8",
  tool: "M14 6 6 14l4 4 8-8M15 3l6 6-3 3-6-6zM4 16l4 4-2 2H2v-4z",
  frame: "M4 5h16v14H4zM7 16l4-5 3 3 2-2 4 4M8 9h.01",
  thread: "M7 4h10v4H7zM8 8h8l2 12H6zM9 12h6M8 16h8",
  live: "M8 8.5a5 5 0 0 0 0 7M5 5.5a9 9 0 0 0 0 13M16 8l5-3v14l-5-3zM3 8h13v8H3z",
};

function IndustryIcon({ name }: { name: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={iconPath[name] || iconPath.home} /></svg>;
}

function MapPinIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0ZM12 7a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /></svg>;
}

function DiscoverySearch({ id, value, suggestions, onChange, onSelect, onSubmit, onClear }: { id: string; value: string; suggestions: DiscoverySearchSuggestion[]; onChange: (value: string) => void; onSelect: (value: string) => void; onSubmit: (value: string) => void; onClear: () => void }) {
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
    <label><span className="sr-only">Search by business, offering, capability, or place. Results and suggestions update as you type.</span><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.5-4.5M19 11a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg><input id={id} name="q" type="search" role="combobox" value={value} onFocus={() => setOpen(true)} onChange={(event) => { setOpen(true); setActiveIndex(-1); onChange(event.target.value); }} onKeyDown={(event) => {
      if (event.key === "ArrowDown" && visibleSuggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex((current) => Math.min(current + 1, visibleSuggestions.length - 1)); }
      if (event.key === "ArrowUp" && visibleSuggestions.length) { event.preventDefault(); setOpen(true); setActiveIndex((current) => current <= 0 ? visibleSuggestions.length - 1 : current - 1); }
      if (event.key === "Enter" && expanded && activeIndex >= 0) { event.preventDefault(); choose(visibleSuggestions[activeIndex]); }
      if (event.key === "Escape") { setOpen(false); setActiveIndex(-1); }
    }} minLength={2} maxLength={80} autoComplete="off" aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? listboxId : undefined} aria-activedescendant={activeIndex >= 0 ? `${listboxId}-${activeIndex}` : undefined} placeholder="Search products or businesses" /></label>
    {value ? <button className="discovery-search-clear" type="button" onClick={() => { setOpen(false); setActiveIndex(-1); onClear(); }} aria-label="Clear marketplace search" title="Clear search"><X aria-hidden="true" /></button> : null}
    <button className="discovery-search-submit" type="submit" aria-label="Show search results" title="Search"><Search aria-hidden="true" /><span>Search</span></button>
    {expanded ? <div id={listboxId} className="discovery-search-suggestions" role="listbox" aria-label="Search suggestions">{visibleSuggestions.map((suggestion, index) => <button id={`${listboxId}-${index}`} key={`${suggestion.kind}-${suggestion.query}`} type="button" role="option" aria-selected={index === activeIndex} onMouseEnter={() => setActiveIndex(index)} onClick={() => choose(suggestion)}><span><b>{suggestion.label}</b><small>{suggestion.detail}</small></span><em>{suggestion.kind === "offering" ? "Offering" : suggestion.kind === "showroom" ? "Page" : "Place"}</em></button>)}</div> : null}
  </form>;
}

function IndustryPicker({ discovery, action, view, resultType }: { discovery: MarketplaceDiscoveryView; action: string; view: DiscoveryViewMode; resultType: SearchResultType }) {
  return <details className="discovery-industry-picker">
    <summary data-industry={discovery.industry.key} aria-label="Choose a category"><IndustryIcon name={discovery.industry.icon} /><span><small>Category</small><b>{compactIndustryLabels[discovery.industry.key] || discovery.industry.label}</b></span><i aria-hidden="true">⌄</i></summary>
    <div className="discovery-industry-menu" role="menu" aria-label="Filter by category">
      {discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} role="menuitemradio" aria-checked={industry.key === discovery.industry.key} href={discoveryHref(action, { industry: industry.key, q: discovery.query, place: discovery.place, view, type: resultType })}><i className="industry-accent-swatch" aria-hidden="true" /><IndustryIcon name={industry.icon} /><span>{industry.label}</span></Link>)}
    </div>
  </details>;
}

function IndustryStartChooser({ discovery, action }: { discovery: MarketplaceDiscoveryView; action: string }) {
  return <section className="discovery-industry-start" aria-labelledby="discovery-industry-start-title">
    <span className="discovery-kicker">Choose what you need</span>
    <h2 id="discovery-industry-start-title">Choose a category</h2>
    <p>Select one category, or continue with all categories.</p>
    <div>{discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} href={discoveryHref(action, { industry: industry.key })}><span aria-hidden="true"><IndustryIcon name={industry.icon} /></span><b>{industry.shortLabel}</b><small>{industry.label}</small></Link>)}</div>
  </section>;
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

function MarketplaceSearchResults({
  action,
  discovery,
  resultType,
  businesses,
  onSelectBusiness,
}: {
  action: string;
  discovery: MarketplaceDiscoveryView;
  resultType: SearchResultType;
  businesses: DiscoveryShowroom[];
  onSelectBusiness: (businessId: number) => void;
}) {
  const resultList = useRef<HTMLDivElement>(null);
  useEffect(() => { resultList.current?.scrollTo({ top: 0 }); }, [discovery.resultPage.page, resultType, discovery.query, discovery.industry.key, discovery.place]);
  const showProducts = resultType !== "businesses";
  const showBusinesses = resultType !== "products";
  const visibleProducts = showProducts ? discovery.searchProducts : [];
  const visibleBusinesses = showBusinesses ? businesses : [];
  const visibleCount = visibleProducts.length + visibleBusinesses.length;
  const types: Array<{ key: SearchResultType; label: string; count: number; icon: typeof Package }> = [
    { key: "all", label: "All", count: discovery.resultCounts.products + discovery.resultCounts.businesses, icon: Search },
    { key: "products", label: "Products", count: discovery.resultCounts.products, icon: Package },
    { key: "businesses", label: "Businesses", count: discovery.resultCounts.businesses, icon: Store },
  ];

  return <section className="discovery-search-workspace" aria-labelledby="discovery-search-results-title">
    <header className="discovery-search-workspace-head">
      <div><h2 id="discovery-search-results-title">{discovery.query.length >= 2 ? `Results for “${discovery.query}”` : discovery.industry.label}</h2><p aria-live="polite">{discovery.resultCounts.products} products · {discovery.resultCounts.businesses} businesses</p></div>
      <Link className="discovery-search-map-action" aria-label="Clear results" href={discoveryHref(action, { industry: discovery.query ? discovery.industry.key : "", place: discovery.place, view: "map", type: resultType })}><X aria-hidden="true" /></Link>
    </header>
    <nav className="discovery-search-result-types" aria-label="Search result type">
      {types.map((type) => {
        const Icon = type.icon;
        return <Link key={type.key} className={resultType === type.key ? "active" : ""} aria-current={resultType === type.key ? "page" : undefined} href={discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: discovery.place, view: "search", type: type.key })}><Icon aria-hidden="true" /><span>{type.label}</span><b>{type.count}</b></Link>;
      })}
    </nav>
    {discovery.resultPage.totalItems > 0 ? <nav className="discovery-pagination" aria-label="Result pages">
      <p aria-live="polite">{discovery.resultPage.firstItem}–{discovery.resultPage.lastItem} of {discovery.resultPage.totalItems} results</p>
      <div>{discovery.resultPage.page > 1 ? <Link scroll={false} aria-label="Previous page" href={discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: discovery.place, view: "search", type: resultType, page: discovery.resultPage.page - 1 })}>Previous</Link> : <span aria-disabled="true">Previous</span>}
        <span>Page {discovery.resultPage.page} of {discovery.resultPage.totalPages}</span>
        {discovery.resultPage.page < discovery.resultPage.totalPages ? <Link scroll={false} aria-label="Next page" href={discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: discovery.place, view: "search", type: resultType, page: discovery.resultPage.page + 1 })}>Next</Link> : <span aria-disabled="true">Next</span>}
      </div>
    </nav> : null}
    <div ref={resultList} className="discovery-search-results">
      {visibleCount === 0 ? <div className="discovery-search-empty"><Search aria-hidden="true" /><h3>No matches found</h3><p>Try another product, business, category, or place.</p></div> : null}
      {visibleProducts.length ? <section className="discovery-search-result-section" aria-labelledby="discovery-product-results-title"><header><h3 id="discovery-product-results-title">Products</h3><span>{visibleProducts.length} shown</span></header><div className="discovery-product-results">{visibleProducts.map((product) => <Link key={product.id} href={`${productHref(product.businessHandle, product.id)}&ref=discovery`} onClick={rememberCurrentPublicWorkspace} data-industry={product.primaryIndustryKey} aria-label={`${product.name} from ${product.businessName}, ${product.city}. View details.`}><span className="discovery-product-result-media"><ProductResultImage product={product} /></span><span className="discovery-product-result-copy"><small>{product.categoryName}</small><strong>{product.name}</strong><p>{product.description}</p><span>{product.businessName}</span><em>{product.city}, {product.region}</em></span></Link>)}</div></section> : null}
      {visibleBusinesses.length ? <section className="discovery-search-result-section" aria-labelledby="discovery-business-results-title"><header><h3 id="discovery-business-results-title">Businesses</h3><span>{visibleBusinesses.length} shown</span></header><div className="discovery-business-results">{visibleBusinesses.map((business) => <button key={business.id} type="button" data-industry={business.primaryIndustryKey} onClick={() => onSelectBusiness(business.id)} aria-label={`${business.name}, ${business.primaryIndustryLabel}, ${business.city}. View details.`}><span className="discovery-business-result-media"><ShowroomImage showroom={business} /></span><span className="discovery-business-result-copy"><small>{business.primaryIndustryShortLabel}</small><strong>{business.name}</strong><p>{business.tagline}</p><em>{business.city}, {business.region}</em></span></button>)}</div></section> : null}
    </div>
  </section>;
}

export default function DiscoveryWorkspace({ discovery, hideIntro = false, view = "map", resultType = "all" }: { discovery: MarketplaceDiscoveryView; hideIntro?: boolean; view?: DiscoveryViewMode; resultType?: SearchResultType }) {
  const router = useRouter();
  const action = "/";
  const [searchInput, setSearchInput] = useState(discovery.query);
  const [mapFailed, setMapFailed] = useState(false);
  const [selectedShowroomId, setSelectedShowroomId] = useState<number | null>(null);
  const [activeNearbyGroupKey, setActiveNearbyGroupKey] = useState<string | null>(null);
  const [requestedView, setRequestedView] = useState<MapView | null>(null);
  const [nearMeStatus, setNearMeStatus] = useState("");
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const filterDialogRef = useRef<HTMLDialogElement | null>(null);
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
    setSearchInput(discovery.query);
  }, [discovery.query]);

  useEffect(() => {
    const dialog = filterDialogRef.current;
    if (!dialog) return;
    if (mobileFiltersOpen && !dialog.open) dialog.showModal();
    if (!mobileFiltersOpen && dialog.open) dialog.close();
  }, [mobileFiltersOpen]);

  useEffect(() => {
    const nextQuery = searchInput.trim();
    if (nextQuery === discovery.query || (nextQuery.length > 0 && nextQuery.length < 2)) return;
    const timer = window.setTimeout(() => {
      router.replace(discoveryHref(action, {
        industry: discovery.industry.key,
        q: nextQuery,
        place: discovery.place,
        view: nextQuery.length >= 2 ? "search" : "map",
        type: resultType,
      }), { scroll: false });
    }, 420);
    return () => window.clearTimeout(timer);
  }, [action, discovery.industry.key, discovery.place, discovery.query, resultType, router, searchInput]);

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
    setSearchInput(boundedQuery);
    router.push(discoveryHref(action, {
      industry: discovery.industry.key,
      q: boundedQuery,
      place: discovery.place,
      view: boundedQuery.length >= 2 ? "search" : "map",
      type: resultType,
    }), { scroll: false });
  }

  const showroomById = useMemo(() => new Map(discovery.showrooms.map((showroom) => [showroom.id, showroom])), [discovery.showrooms]);
  const searchBusinesses = discovery.searchBusinesses;
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

  const industrySelected = Boolean(discovery.industry.key);
  const searchActive = industrySelected;
  return <section className="discovery discovery-marketplace" id="discover" aria-label="Suqpage Market">
    {!hideIntro ? <div className="discovery-switcher">
      <div className="discovery-switcher-head"><div><span className="discovery-kicker">Suqpage Market</span><h2 id="discovery-title">Find shops and products.</h2></div><p>Search by name, product, or location.</p></div>
    </div> : null}

    <div className={`discovery-workbench discovery-workbench-map${industrySelected ? "" : " discovery-workbench-unselected"}${searchActive ? " discovery-workbench-search" : ""}`}>
    {industrySelected ? <div className="discovery-summary">
      <div className="discovery-command-search"><DiscoverySearch id="discovery-search" value={searchInput} suggestions={searchActive ? [] : discovery.suggestions} onChange={setSearchInput} onSelect={applySearch} onSubmit={applySearch} onClear={() => applySearch("")} /></div>
      {searchActive ? <MarketplaceSearchResults action={action} discovery={discovery} resultType={resultType} businesses={searchBusinesses} onSelectBusiness={(businessId) => {
        setActiveNearbyGroupKey(null); setSelectedShowroomId(businessId); rememberNavigation(null, mapViewRef.current, businessId);
      }} /> : <div className="discovery-search-welcome"><Search aria-hidden="true" /><h2>Find something you’ll love.</h2><p>Search for a product or shop, or explore the map.</p><span>{discovery.total} {discovery.total === 1 ? "shop" : "shops"} · {discovery.locationCount} {discovery.locationCount === 1 ? "location" : "locations"}</span></div>}
      <span className="sr-only" aria-live="polite">{nearMeStatus}</span>
    </div> : null}

    <dialog ref={filterDialogRef} id="discovery-mobile-filters" className="discovery-filter-sheet" aria-labelledby="discovery-filter-title" onClose={() => setMobileFiltersOpen(false)} onCancel={() => setMobileFiltersOpen(false)} onClick={(event) => { if (event.target === filterDialogRef.current) setMobileFiltersOpen(false); }}>
      <section>
        <header><div><span>{searchActive ? "Refine results" : "Refine the map"}</span><h3 id="discovery-filter-title">Filters</h3></div><button type="button" onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters"><X aria-hidden="true" /></button></header>
        <div className="discovery-filter-body">
          <fieldset><legend>Category</legend><div className="discovery-filter-industries">{discovery.industries.map((industry) => <Link key={industry.key} data-industry={industry.key} className={industry.key === discovery.industry.key ? "active" : ""} aria-current={industry.key === discovery.industry.key ? "true" : undefined} href={discoveryHref(action, { industry: industry.key, q: discovery.query, place: discovery.place, view, type: resultType })} onClick={() => setMobileFiltersOpen(false)}><i className="industry-accent-swatch" aria-hidden="true" /><IndustryIcon name={industry.icon} /><span>{compactIndustryLabels[industry.key] || industry.label}</span></Link>)}</div></fieldset>
          <label className="discovery-filter-place"><span>Region or city</span><select aria-label="Filter by region or city" value={discovery.place} onChange={(event) => { setMobileFiltersOpen(false); router.replace(discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: event.target.value, view, type: resultType }), { scroll: false }); }}><option value="">All Ethiopia</option><optgroup label="Regions">{discovery.places.filter((place) => place.kind === "region").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup><optgroup label="Cities">{discovery.places.filter((place) => place.kind === "city").map((place) => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup></select></label>
        </div>
        <button className="discovery-filter-done" type="button" onClick={() => setMobileFiltersOpen(false)}>{searchActive ? "Apply filters" : `Show ${discovery.total} ${discovery.total === 1 ? "result" : "results"}`}</button>
      </section>
    </dialog>

    <div className="discovery-map-shell">
      {industrySelected ? <div className="discovery-floating-tools">
        <div className="discovery-floating-filters"><IndustryPicker discovery={discovery} action={action} view={view} resultType={resultType} />
          <label className="discovery-location-picker"><span className="sr-only">Filter by region or city</span><select aria-label="Filter by region or city" value={discovery.place} onChange={(event) => router.replace(discoveryHref(action, { industry: discovery.industry.key, q: discovery.query, place: event.target.value, view, type: resultType }), { scroll: false })}><option value="">All Ethiopia</option><optgroup label="Regions">{discovery.places.filter(place => place.kind === "region").map(place => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup><optgroup label="Cities">{discovery.places.filter(place => place.kind === "city").map(place => <option key={place.key} value={place.key}>{place.label} ({place.count})</option>)}</optgroup></select></label>
        </div>
        <div className="discovery-floating-buttons" aria-label="Map controls">
          <button className="discovery-floating-filter-button" type="button" onClick={() => setMobileFiltersOpen(true)} aria-haspopup="dialog" aria-expanded={mobileFiltersOpen} aria-controls="discovery-mobile-filters" aria-label="Open category and location filters"><SlidersHorizontal aria-hidden="true" /><span>Filters</span></button>
          <button type="button" onClick={useNearMe} aria-label="Center the map near me" title="Near me"><LocateFixed aria-hidden="true" /></button>
          <button type="button" onClick={() => zoomBy(1.5)} aria-label="Zoom in" title="Zoom in"><Plus aria-hidden="true" /></button>
          <button type="button" onClick={() => zoomBy(1 / 1.5)} aria-label="Zoom out" title="Zoom out"><Minus aria-hidden="true" /></button>
          <button type="button" onClick={resetMap} aria-label="Center Ethiopia" title="Center Ethiopia"><Crosshair aria-hidden="true" /></button>
        </div>
      </div> : null}
      <div className="discovery-map-stage">
        {mapFailed ? <div className="discovery-map-fallback"><p>The marketplace map is temporarily unavailable.</p><button type="button" onClick={() => window.location.reload()}>Retry map</button></div> : null}
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
            setSelectedShowroomId(showroom.id);
            rememberNavigation(activeNearbyGroupKey, mapViewRef.current, showroom.id);
          }}
          onError={() => setMapFailed(true)}
        /> : null}
        {!industrySelected ? <IndustryStartChooser discovery={discovery} action={action} /> : null}
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
        }} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(selectedShowroom, discovery.featuredNowBusinessId)} /> : null}
      </div>
    </div>
    </div>

  </section>;
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.heroImagePath && !failed ? <Image src={showroom.heroImagePath} unoptimized={showroom.heroImagePath.startsWith("/api/page-media/")} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function ShowroomPreview({ showroom, source, onClose, onOpen, label, presence }: { showroom: DiscoveryShowroom; source: "discovery" | "featured"; onClose: () => void; onOpen?: () => void; label?: string; presence?: ShowroomPresence }) {
  const previewRef = useRef<HTMLElement | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    setPortalRoot(document.querySelector<HTMLElement>(".discovery-map-stage"));
  }, []);
  useEffect(() => {
    if (!portalRoot) return;
    previewRef.current?.focus({ preventScroll: true });
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [onClose, portalRoot, showroom.id]);
  if (!portalRoot) return null;
  const status = presence?.label || label || (showroom.sponsored ? "Sponsored" : showroom.primaryIndustryShortLabel);
  return createPortal(<div className="discovery-preview-layer discovery-preview-layer-map"><button className="discovery-preview-scrim" type="button" tabIndex={-1} onClick={onClose} aria-label="Dismiss page preview" /><aside ref={previewRef} className="discovery-preview" role="dialog" aria-modal="false" aria-labelledby={`showroom-preview-${showroom.id}`} data-hero-image={showroom.heroImagePath || undefined} tabIndex={-1}><article><button className="discovery-preview-close" type="button" onClick={onClose} aria-label="Close page preview"><X aria-hidden="true" /></button><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence?.kind ? `presence-${presence.kind}` : undefined}>{status}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3><p>{showroom.tagline}</p><small>{showroom.city} · {showroom.zone} · {showroom.region}</small><Link href={`/@${showroom.handle}?ref=${source}`} onClick={onOpen}>Open page <b aria-hidden="true">→</b></Link></div></article></aside></div>, portalRoot);
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
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const backRef = useRef<HTMLButtonElement | null>(null);
  const selectedShowroom = showrooms.find((showroom) => showroom.id === selectedShowroomId) || null;
  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true });
  }, [group.key]);
  useEffect(() => {
    if (selectedShowroom) backRef.current?.focus({ preventScroll: true });
  }, [selectedShowroomId]);

  return <aside className={`nearby-showroom-viewer${selectedShowroom ? " detail-open" : ""}`} role="dialog" aria-modal="false" aria-labelledby="nearby-showroom-title" onKeyDown={(event) => {
    if (event.key === "Escape") onClose();
  }}>
    <header>
      {selectedShowroom
        ? <button ref={backRef} className="nearby-showroom-back" type="button" onClick={onBack}><ArrowLeft aria-hidden="true" /><span>Back to results</span></button>
        : <div className="nearby-showroom-heading"><span>{group.city}</span><h2 id="nearby-showroom-title">Nearby pages</h2><p>{group.count} {group.count === 1 ? "result" : "results"} in this area</p></div>}
      <button ref={closeRef} type="button" onClick={onClose} aria-label="Close nearby results"><X aria-hidden="true" /></button>
    </header>
    {selectedShowroom ? <NearbyShowroomDetail showroom={selectedShowroom} presence={showroomPresence(selectedShowroom, featuredNowBusinessId)} onOpen={onOpen} /> : <div className="nearby-showroom-grid">
      {showrooms.map((showroom) => {
        const presence = showroomPresence(showroom, featuredNowBusinessId);
        return <button key={showroom.id} type="button" data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} data-presence={presence.kind || undefined} className={`${presence.kind ? ` ${presence.kind}` : ""}${selectedShowroomId === showroom.id ? " selected" : ""}`} onClick={() => onSelect(showroom.id)} aria-label={`${showroom.name}, ${showroom.primaryIndustryLabel}, ${showroom.city}.${presence.label ? ` ${presence.label}.` : ""} View details.`}>
          <span className="nearby-showroom-media"><ShowroomImage showroom={showroom} />{presence.kind ? <i>{presence.shortLabel}</i> : null}</span>
          <span className="nearby-showroom-copy"><small>{showroom.primaryIndustryShortLabel}</small><strong>{showroom.name}</strong><em>View details</em></span>
        </button>;
      })}
    </div>}
  </aside>;
}

function NearbyShowroomDetail({ showroom, presence, onOpen }: { showroom: DiscoveryShowroom; presence: ShowroomPresence; onOpen: () => void }) {
  const status = presence.label || (showroom.sponsored ? "Sponsored" : showroom.primaryIndustryShortLabel);
  return <article className="nearby-showroom-detail">
    <ShowroomImage showroom={showroom} />
    <div>
      <span className={presence.kind ? `presence-${presence.kind}` : undefined}>{status}</span>
      <h2 id="nearby-showroom-title">{showroom.name}</h2>
      <p>{showroom.tagline}</p>
      <small>{showroom.city} · {showroom.zone} · {showroom.region}</small>
      <Link href={`/@${showroom.handle}?ref=discovery`} onClick={onOpen}>Open page <b aria-hidden="true">→</b></Link>
    </div>
  </article>;
}
