"use client";
import MarketSearchControls from './MarketSearchControls';
import independentStyles from './IndependentMarket.module.css';
import {useMarketFeed,type MarketBatch} from '@/lib/use-market-feed';
import {useBlockedBusinesses} from './useBlockedBusinesses';
import {excludedBusinessIds} from '@/lib/catalog-safety';
import {emptyMarketSearch,marketSearchParams,marketWorkspaceParams,MarketSearchError,type MarketSearch,type MarketScope} from '@/lib/market-search';
import {hasExplicitMarketIntent,marketWorkspaceFromParams,parseMarketWorkspaceSnapshot,serializeMarketWorkspaceSnapshot,type MarketWorkspaceState} from '@/lib/market-workspace';
import { normalizeDiscoveryPlaces, discoveryPlaceKey, discoveryLocationLabel } from "@/lib/discovery-contract";
import launchStyles from "./LaunchClarity.module.css";
import previewStyles from "./MapPreviewDialog.module.css";
import LoadingBar from "./LoadingBar";
import { useUiText } from "@/lib/i18n/ui";

import { mapDisplayLocation } from "@/lib/map-display-location";
import {clampMapZoom,mapClusterIndex,MAP_MAX_ZOOM} from "@/lib/map/map-clustering";
import {currentMapGroup,mapGroupMembers,mapGroupLayout,mapGroupViewport} from "./map-group-view";
import { readPlatformState } from "@/lib/platform-state";

import Image from "next/image";
import CategoryChooser from "./CategoryChooser";
import { productHref } from "@/lib/product-inquiry";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight, Crosshair, LocateFixed, Map as MapIcon, Minus, Package, Plus, Search, X, MapPin, PanelLeftOpen, PanelLeftClose } from "lucide-react";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, useTransition, type CSSProperties, type ReactNode } from "react";
import MarketplaceMap, { type MarketplaceMapController } from "@/components/MarketplaceMap";
import type { DiscoveryNearbyGroup, DiscoveryProductResult, DiscoverySearchSuggestion, DiscoveryShowroom, MarketplaceDiscoveryView } from "@/lib/discovery";
import { LIVE_PLATFORM_LABELS } from "@/lib/live-showroom";
import { productSupplyLabel } from "@/lib/offerings";

const ETHIOPIA_BOUNDS: [number, number, number, number] = [32, 3, 49, 15];
const DISCOVERY_SESSION_KEY = "suqpage:discovery-navigation:v2";
const DISCOVERY_RETURN_KEY = "suqpage:last-marketplace-url:v1";
const MARKET_WORKSPACE_KEY = "suqpage:market-workspace:v1";

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
    return {...parsed,mapView:{...parsed.mapView,zoom:clampMapZoom(parsed.mapView.zoom)}};
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

type GroupViewport=ReturnType<typeof mapGroupViewport>;
/** Same safe-area rectangle as the actual wide dialog, before membership. */
function useMapGroupViewport(provided?:GroupViewport):GroupViewport {
 const [viewport,setViewport]=useState(()=>mapGroupViewport(320,536));
 useLayoutEffect(()=>{
  if(provided)return;
  const probe=document.createElement('div');probe.style.cssText='position:fixed;visibility:hidden;pointer-events:none;box-sizing:border-box;width:min(760px,calc(100vw - 24px - env(safe-area-inset-left) - env(safe-area-inset-right)));height:calc(100dvh - 32px - env(safe-area-inset-top) - env(safe-area-inset-bottom));padding:env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);';document.body.append(probe);
  const measure=()=>{const rect=probe.getBoundingClientRect(),style=getComputedStyle(probe),scale=Math.max(1,(parseFloat(getComputedStyle(document.documentElement).fontSize)||16)/16),safe=(parseFloat(style.paddingTop)||0)+(parseFloat(style.paddingBottom)||0),height=Math.min(rect.height,(window.visualViewport?.height||window.innerHeight)-32-safe),next=mapGroupViewport(rect.width,height,scale);setViewport(prior=>prior.width===next.width&&prior.height===next.height&&prior.fontScale===next.fontScale?prior:next);};
  measure();const resize=new ResizeObserver(measure);resize.observe(document.documentElement);const changes=new MutationObserver(measure);changes.observe(document.documentElement,{attributes:true,attributeFilter:['style','class']});window.addEventListener('resize',measure);window.visualViewport?.addEventListener('resize',measure);let stopped=false;void document.fonts?.ready.then(()=>{if(!stopped)measure();});
  return()=>{stopped=true;resize.disconnect();changes.disconnect();window.removeEventListener('resize',measure);window.visualViewport?.removeEventListener('resize',measure);probe.remove();};
 },[provided]);
 return provided||viewport;
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


function discoveryHref(action: string, values: Record<string, string | number | undefined>, hash = "discover") {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return `${action}?${params.toString()}#${hash}`;
}


function ProductResultImage({ product }: { product: DiscoveryProductResult }) {
  const [failed, setFailed] = useState(false);
  return product.imagePath && !failed
    ? <Image src={product.imagePath} alt="" width={280} height={180} onError={() => setFailed(true)} />
    : <span className="discovery-search-result-fallback" aria-hidden="true"><Package /><b>{product.name}</b></span>;
}

function MarketUpdating() {
 const t=useUiText();
 return <span className={independentStyles.updating} role="status"><i aria-hidden="true"/>{t('Updating Market results')}</span>;
}

function MarketplaceSearchResults({discovery,items,loading,hasMore,loadingMore,moreError,onMore,enabled,resetKey,failed,snapshotCurrent}: {
 discovery:MarketplaceDiscoveryView;items:DiscoveryProductResult[];loading:boolean;hasMore:boolean;
 loadingMore:boolean;moreError:string;onMore:()=>void;enabled:boolean;resetKey:string|null;failed:boolean;snapshotCurrent:boolean;
}) {
 const t=useUiText(),resultList=useRef<HTMLDivElement>(null),sentinel=useRef<HTMLDivElement>(null),lastResetKey=useRef(resetKey);
 useEffect(()=>{
  // Next can reconnect passive effects for a preserved subtree. Only a newly
  // admitted snapshot changes scroll; replaying the same snapshot does not.
  if(lastResetKey.current===resetKey)return;
  lastResetKey.current=resetKey;resultList.current?.scrollTo({top:0});
 },[resetKey]);
 useEffect(()=>{
  if(!enabled||!hasMore||loading||loadingMore||moreError||!sentinel.current||!resultList.current)return;
  const observer=new IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting))onMore();},{root:resultList.current,rootMargin:'120px'});
  observer.observe(sentinel.current);return()=>observer.disconnect();
 },[enabled,hasMore,loading,loadingMore,moreError,onMore,items.length]);
 const visibleProducts=items;
  const renderProduct = (product: MarketplaceDiscoveryView["searchProducts"][number]) => <article key={product.id} className="discovery-product-card" data-industry={product.primaryIndustryKey}>
    <Link className="discovery-product-link" href={`${productHref(product.businessHandle, product.id)}&ref=discovery`} onClick={rememberCurrentPublicWorkspace} aria-label={t("{value1} from {value2}, {value3}. View details.", { value1: product.name, value2: product.businessName, value3: product.city })}>
      <span className="discovery-product-result-media"><ProductResultImage product={product} /></span>
      <span className="discovery-product-result-copy"><small>{product.categoryName}</small><strong>{product.name}</strong>{product.isDemo ? <span className={launchStyles.example}>{t("Example product")}</span> : null}<span className={independentStyles.supply}>{t(productSupplyLabel(product.offeringKind || '', product.availability || 'available'))}</span><p>{product.description}</p><em>{discoveryLocationLabel([product.city, product.region])}</em></span>
    </Link>
    <Link className="discovery-product-business" href={`/@${encodeURIComponent(product.businessHandle)}?ref=discovery`} onClick={rememberCurrentPublicWorkspace}>{t("From {business}", { business: product.businessName })}</Link>
  </article>;

  return <section className="discovery-search-workspace" aria-labelledby="discovery-search-results-title" aria-busy={loading} data-snapshot-current={snapshotCurrent}>
    <div className={independentStyles.resultsHeading}><h2 id="discovery-search-results-title" className="discovery-results-heading">{t("Products")}</h2>{loading&&enabled&&<MarketUpdating/>}</div>
    <div ref={resultList} className="discovery-search-results">
      {visibleProducts.length===0&&!loading&&!failed?<div className="discovery-search-empty"><Search aria-hidden="true"/><h3>{t("No matches found")}</h3><p>{t("Try another product, category or city.")}</p></div>:null}
      <div className="discovery-product-results">{visibleProducts.map(renderProduct)}</div>
      <div ref={sentinel} className={independentStyles.feedFooter} aria-live="polite">
       {loadingMore?<LoadingBar/>:moreError?<><p>{t(moreError)}</p><button type="button" onClick={onMore}>{t("Try again")}</button></>:hasMore?<button type="button" onClick={onMore}>{t("Load more")}</button>:snapshotCurrent&&!loading&&!failed&&visibleProducts.length>0?<p>{t("You've seen all the results.")}</p>:null}
       <span className="sr-only">{t("{count} results",{count:visibleProducts.length})}</span>
      </div>
    </div>
  </section>;
}

function productBatch(data:MarketplaceDiscoveryView):MarketBatch<MarketplaceDiscoveryView,DiscoveryProductResult> {
 return {data,items:data.searchProducts,page:data.resultPage.page,pages:data.resultPage.totalPages,total:data.resultPage.totalItems};
}
async function loadProductBatch(params:string,signal:AbortSignal) {
 const response=await fetch('/api/discovery?'+params,{signal});
 if(!response.ok)throw new Error('Search is unavailable. Try again.');
 return productBatch(await response.json() as MarketplaceDiscoveryView);
}

function useIndependentSearch(scope:MarketScope,search:MarketSearch,initial:MarketplaceDiscoveryView,initialSearch:MarketSearch,exclusionKey:string,initialExclusionKey:string|null) {
 const key=marketSearchParams(scope,search).toString();
 const batch=(data:MarketplaceDiscoveryView)=>({data,items:data.showrooms,page:1,pages:1,total:data.total});
 // Retention is limited to this same-origin public collection. Cached server
 // props retain their own criteria key; they are never authority for a new one.
 const feed=useMarketFeed(key,async(params,signal)=>{
  const response=await fetch('/api/discovery?'+params,{signal});
  if(!response.ok)throw new Error('Search is unavailable. Try again.');
  return batch(await response.json() as MarketplaceDiscoveryView);
 },initialExclusionKey===exclusionKey?batch(initial):undefined,{scopeKey:'/api/discovery:public:'+scope+':excluded:'+exclusionKey,initialSnapshotKey:marketSearchParams(scope,initialSearch).toString()});
 const visible=feed.batch?.data||{...initial,showrooms:[],nearbyGroups:[],searchProducts:[],searchOrder:[],searchBusinesses:[],total:0,resultCounts:{products:0,businesses:0},resultPage:{...initial.resultPage,totalItems:0,totalPages:1,firstItem:0,lastItem:0}};
 return {data:visible,pending:feed.loading,settled:feed.snapshotCurrent&&!feed.loading&&!feed.error,snapshotCurrent:feed.snapshotCurrent,error:feed.error,retry:feed.retry};
}

export default function DiscoveryWorkspace({discovery,productDiscovery,initialExclusions,initialBusiness=emptyMarketSearch(),initialProduct=emptyMarketSearch(),view}:{discovery:MarketplaceDiscoveryView;productDiscovery?:MarketplaceDiscoveryView;initialExclusions?:readonly number[];initialBusiness?:MarketSearch;initialProduct?:MarketSearch;hideIntro?:boolean;view?:DiscoveryViewMode}) {
 const t=useUiText();
 const blocked=useBlockedBusinesses(),exclusionKey=excludedBusinessIds(blocked.list.map(item=>item.id)).join(',');
 // Cached RSC props must prove the same preference boundary as their membership.
 const initialExclusionKey=initialExclusions===undefined?null:excludedBusinessIds(initialExclusions).join(',');
 const incomingKey=useSearchParams().toString();
 const [ready,setReady]=useState(false);
 const [businessSearch,setBusinessSearch]=useState(initialBusiness),[productSearch,setProductSearch]=useState(initialProduct),[panelOpen,setPanelOpen]=useState(view==='search');
 const readyRef=useRef(false),writtenParams=useRef<string|null>(null),pendingRestore=useRef<string|null>(null);
 const currentWorkspace=useRef<MarketWorkspaceState>({mode:panelOpen?'products':'businesses',business:businessSearch,product:productSearch});
 currentWorkspace.current={mode:panelOpen?'products':'businesses',business:businessSearch,product:productSearch};
 const businesses=useIndependentSearch('businesses',businessSearch,discovery,initialBusiness,exclusionKey,initialExclusionKey);
 const productKey=marketSearchParams('products',productSearch).toString();
 const products=useMarketFeed(productKey,loadProductBatch,initialExclusionKey===exclusionKey?productBatch(productDiscovery||discovery):undefined,{scopeKey:'/api/discovery:public:products:excluded:'+exclusionKey,initialSnapshotKey:marketSearchParams('products',initialProduct).toString()});
 const productData=products.batch?.data||{...(productDiscovery||discovery),searchProducts:[],resultPage:{...(productDiscovery||discovery).resultPage,totalItems:0}};
 const [mapFailed,setMapFailed]=useState(false),[selectedShowroomId,setSelectedShowroomId]=useState<number|null>(null),[activeNearbyGroupKey,setActiveNearbyGroupKey]=useState<string|null>(null),[requestedView,setRequestedView]=useState<MapView|null>(null),[nearMeStatus,setNearMeStatus]=useState('');
 const [mapZoom,setMapZoom]=useState(5);
 const mapRef=useRef<MarketplaceMapController|null>(null),mapViewRef=useRef<MapView>({center:[9.145,40.4897],zoom:5});
 const businessButton=useRef<HTMLButtonElement>(null),viewport=useRef<HTMLDivElement>(null),dragged=useRef(false);
 const dragStart=useRef<{x:number;progress:number;width:number}|null>(null);
 const [dragProgress,setDragProgress]=useState<number|null>(null);
 function panelDragStart(event:React.PointerEvent<HTMLButtonElement>){
  if(event.button!==0)return;
  dragged.current=false;dragStart.current={x:event.clientX,progress:panelOpen?1:0,width:Math.max(1,(viewport.current?.clientWidth||320)-32)};
  event.currentTarget.setPointerCapture(event.pointerId);
 }
 function panelDragMove(event:React.PointerEvent<HTMLButtonElement>){
  const start=dragStart.current;if(!start)return;const dx=event.clientX-start.x;
  if(Math.abs(dx)>8){dragged.current=true;setDragProgress(Math.max(0,Math.min(1,start.progress-dx/start.width)));}
 }
 function panelDragEnd(event:React.PointerEvent<HTMLButtonElement>){
  const start=dragStart.current;if(!start)return;const dx=event.clientX-start.x;
  if(dragged.current){const progress=Math.max(0,Math.min(1,start.progress-dx/start.width));setPanelOpen(Math.abs(dx)>48?dx<0:progress>=.5);}
  dragStart.current=null;setDragProgress(null);
 }
 function cancelPanelDrag(){dragStart.current=null;setDragProgress(null);dragged.current=true;}
 const moving=dragProgress!==null;
 const progress=dragProgress??(panelOpen?1:0);
 const paneWidth=Math.max(1,(viewport.current?.clientWidth||320)-16);

 const navigationScope=marketSearchParams('businesses',businessSearch).toString();
 const mapData=businesses.data,groupViewport=useMapGroupViewport();
 const groupIndex=useMemo(()=>mapClusterIndex(mapData.showrooms.map(showroom=>{
  const displayed=mapDisplayLocation(showroom);
  return {id:showroom.id,latitude:displayed.latitude,longitude:displayed.longitude,locationMode:showroom.locationMode,featured:showroom.id===mapData.featuredNowBusinessId,live:showroom.isLive};
 }),groupViewport.capacity),[mapData.showrooms,mapData.featuredNowBusinessId,groupViewport.capacity]);
 // A child SDK effect can report its default view before the parent restores
 // a newly settled projection. Fence that entire render, including old callbacks.
 const restorationToken=useMemo(()=>({}),[navigationScope,groupIndex,ready,businesses.settled]);
 const currentRestorationToken=useRef(restorationToken);currentRestorationToken.current=restorationToken;
 const committedRestorationToken=useRef<object|null>(null);
 const restorationTarget=useRef<{token:object;view:MapView;group:string|null;selected:number|null}|null>(null);
 useEffect(()=>{
  if(window.location.pathname!=='/')return;
  const params=new URLSearchParams(window.location.search);
  // A queued router update must not overwrite a newer local history write.
  if(params.toString()!==incomingKey)return;
  if(writtenParams.current===incomingKey){writtenParams.current=null;return;}
  let next:MarketWorkspaceState;
  try {
   if(hasExplicitMarketIntent(params))next=marketWorkspaceFromParams(params);
   else{
    let remembered:MarketWorkspaceState|null=null;
    try{remembered=parseMarketWorkspaceSnapshot(readPlatformState(window.sessionStorage,MARKET_WORKSPACE_KEY));}catch{/* Storage access itself can be denied. */}
    next=remembered||currentWorkspace.current;
   }
  } catch(error) {
   if(!(error instanceof MarketSearchError))throw error;
   // Preserve the explicit invalid URL for the server's existing filter error.
   readyRef.current=false;setReady(false);window.location.reload();return;
  }
  pendingRestore.current=marketWorkspaceParams(next.mode,next.business,next.product).toString();
  setBusinessSearch(next.business);setProductSearch(next.product);setPanelOpen(next.mode==='products');
  readyRef.current=true;setReady(true);
 },[incomingKey]);
 useEffect(()=>{
  if(!ready||!readyRef.current||window.location.pathname!=='/')return;
  const actualParams=new URLSearchParams(window.location.search).toString();
  if(actualParams!==incomingKey&&actualParams!==writtenParams.current)return;
  const state=currentWorkspace.current,p=marketWorkspaceParams(state.mode,state.business,state.product),key=p.toString();
  if(pendingRestore.current!==null){if(pendingRestore.current!==key)return;pendingRestore.current=null;}
  try{window.sessionStorage.setItem(MARKET_WORKSPACE_KEY,serializeMarketWorkspaceSnapshot(state));}catch{/* Public navigation works without storage. */}
  if(new URLSearchParams(window.location.search).toString()!==key||window.location.hash!=='#discover'){
   writtenParams.current=key;window.history.replaceState(window.history.state,'','/?'+key+'#discover');
  }
  rememberCurrentPublicWorkspace();
 },[businessSearch,productSearch,panelOpen,ready,incomingKey]);
 useLayoutEffect(()=>{
  if(!ready||!businesses.settled)return;
  const saved=readDiscoverySession(navigationScope);
  const next=saved?.mapView||initialMapView(mapData.showrooms,businessSearch.countries.join('|')||businessSearch.cities.join('|')||businessSearch.query);
  const restoredGroup=currentMapGroup(groupIndex,mapData.showrooms,saved?.activeNearbyGroupKey||null,next.zoom);
  const restoredSelected=saved&&mapData.showrooms.some(s=>s.id===saved.selectedShowroomId)&&(!saved.activeNearbyGroupKey||restoredGroup?.showroomIds.includes(saved.selectedShowroomId||-1))?saved.selectedShowroomId:null;
  restorationTarget.current={token:restorationToken,view:next,group:restoredGroup?.key||null,selected:restoredSelected};
  mapViewRef.current=next;setMapZoom(next.zoom);setRequestedView(next);
  setSelectedShowroomId(restoredSelected);setActiveNearbyGroupKey(restoredGroup?.key||null);
 },[restorationToken,mapData.showrooms,groupIndex,navigationScope,ready,businesses.settled]);
 useEffect(()=>{
  const target=restorationTarget.current;
  if(ready&&businesses.settled&&target?.token===restorationToken&&requestedView===target.view&&mapZoom===target.view.zoom&&activeNearbyGroupKey===target.group&&selectedShowroomId===target.selected)
   committedRestorationToken.current=restorationToken;
 },[restorationToken,ready,businesses.settled,requestedView,mapZoom,activeNearbyGroupKey,selectedShowroomId]);
 function navigationIsCommitted(){return ready&&businesses.settled&&currentRestorationToken.current===restorationToken&&committedRestorationToken.current===restorationToken;}
 function rememberNavigation(group:string|null,selected:number|null,mapView=mapViewRef.current){if(navigationIsCommitted())writeDiscoverySession({scope:navigationScope,activeNearbyGroupKey:group,selectedShowroomId:selected,mapView,updatedAt:Date.now()});}
 const byId=new Map(mapData.showrooms.map(s=>[s.id,s]));
 const selected=byId.get(selectedShowroomId||-1)||null,group=useMemo(()=>currentMapGroup(groupIndex,mapData.showrooms,activeNearbyGroupKey,mapZoom),[groupIndex,mapData.showrooms,activeNearbyGroupKey,mapZoom]);
 function nearMe(){if(!navigator.geolocation){setNearMeStatus('Location is not available in this browser.');return;}navigator.geolocation.getCurrentPosition(({coords})=>{mapRef.current?.centerAt(coords.latitude,coords.longitude,11);setNearMeStatus('Map centered near your location.');},()=>setNearMeStatus('Location was not shared. Choose a country or city instead.'),{timeout:8000,maximumAge:300000});}
 return <section className="discovery discovery-marketplace" id="discover" aria-label={t('AfricMade Market')}>
  <h2 className="sr-only">{t('AfricMade Market')}</h2>
  <div className={'discovery-workbench discovery-workbench-map discovery-drawer-workbench '+independentStyles.stage} data-panel-open={panelOpen}>
   <div className={independentStyles.modeBar}>
   <nav className={independentStyles.switch} aria-label={t('Search for')}>
    <button ref={businessButton} type="button" disabled={!ready} aria-pressed={!panelOpen} onClick={()=>setPanelOpen(false)}><MapIcon size={17}/><span>{t('Business locations')}</span></button>
    <button type="button" disabled={!ready} aria-pressed={panelOpen} onClick={()=>setPanelOpen(true)}><Package size={17}/><span>{t('Product listings')}</span></button>
   </nav>
   </div>
   <div className={independentStyles.activeControls}>
    <MarketSearchControls key={panelOpen?'products':'businesses'} scope={panelOpen?'products':'businesses'} value={panelOpen?productSearch:businessSearch} onChange={panelOpen?setProductSearch:setBusinessSearch} metadata={panelOpen?productData:mapData}/>
    {!panelOpen&&businesses.error&&<div className={independentStyles.error} role="alert">{t(businesses.error)} <button type="button" onClick={businesses.retry}>{t('Try again')}</button></div>}
   </div>
   <div ref={viewport} className={independentStyles.viewport} data-dragging={moving}>
   <aside id="discovery-search-panel" className={independentStyles.panel} data-open={panelOpen} style={moving?{transform:`translateX(${(1-progress)*(paneWidth-16)}px)`,transition:'none'}:undefined} aria-label={t('Products')} aria-hidden={!panelOpen} inert={!panelOpen} onKeyDown={event=>{if(event.key==='Escape'&&!event.defaultPrevented){setPanelOpen(false);requestAnimationFrame(()=>businessButton.current?.focus());}}}>
    {products.error&&<div className={independentStyles.error} role="alert">{t(products.error)} <button type="button" onClick={products.retry}>{t('Try again')}</button></div>}
    <div className={independentStyles.panelBody}><MarketplaceSearchResults discovery={productData} items={products.batch?.items||[]} loading={products.loading} failed={Boolean(products.error)} hasMore={products.hasMore} loadingMore={products.loadingMore} moreError={products.moreError} onMore={products.loadMore} enabled={panelOpen} resetKey={products.displayedSnapshotKey} snapshotCurrent={products.snapshotCurrent}/></div>
   </aside>
   <button type="button" className={independentStyles.peek} data-side={panelOpen?'map':'products'} style={moving?{left:Math.max(16,(viewport.current?.clientWidth||320)-64)-progress*Math.max(0,(viewport.current?.clientWidth||320)-80),right:'auto'}:undefined} aria-label={t(panelOpen?'Map only':'View products')} title={t(panelOpen?'Map only':'View products')} onClick={event=>{if(event.detail===0||!dragged.current)setPanelOpen(!panelOpen);dragged.current=false;}} onPointerDown={panelDragStart} onPointerMove={panelDragMove} onPointerUp={panelDragEnd} onPointerCancel={cancelPanelDrag} onLostPointerCapture={()=>{if(dragStart.current)cancelPanelDrag();}}><i aria-hidden="true"/>{panelOpen?<ChevronRight size={18}/>:<ChevronLeft size={18}/>}</button>
   <span className="sr-only" aria-live="polite">{t(nearMeStatus)}</span>
   <div className={'discovery-map-shell '+independentStyles.mapPanel} data-open={!panelOpen} data-snapshot-current={businesses.snapshotCurrent} aria-busy={businesses.pending} style={moving?{transform:`translateX(${-progress*(paneWidth-16)}px)`,transition:'none'}:undefined} aria-hidden={panelOpen} inert={panelOpen}><div className="discovery-map-stage">
   {!panelOpen&&businesses.pending&&<div className={independentStyles.mapUpdating}><MarketUpdating/></div>}
   {!businesses.pending&&!businesses.error&&mapData.showrooms.length===0&&<div className={independentStyles.emptyMap} role="status"><p>{t('No businesses with public map locations match these filters.')}</p><button type="button" onClick={()=>setPanelOpen(true)}>{t('Browse product listings')}</button></div>}
   {mapData.resultCounts.businesses>mapData.showrooms.length&&<p className={independentStyles.mapLimit}>{t('Showing {count} businesses. Search or filter to see more.',{count:mapData.showrooms.length})}</p>}
    <div className="discovery-floating-tools"><div className="discovery-floating-buttons" aria-label={t('Map controls')}>
     <button type="button" onClick={nearMe} aria-label={t('Center the map near me')}><LocateFixed/></button>
     <button type="button" className={previewStyles.zoomControl} disabled={mapZoom>=MAP_MAX_ZOOM} onClick={()=>mapRef.current?.zoomIn()} aria-label={t('Zoom in')}><Plus/></button>
     <button type="button" className={previewStyles.zoomControl} disabled={mapZoom<=1} onClick={()=>mapRef.current?.zoomOut()} aria-label={t('Zoom out')}><Minus/></button>
     <button type="button" onClick={()=>{setSelectedShowroomId(null);setActiveNearbyGroupKey(null);mapRef.current?.reset();}} aria-label={t('Reset map')}><Crosshair/></button>
    </div></div>
    {mapFailed?<div className="discovery-map-fallback"><p>{t('The marketplace map is temporarily unavailable.')}</p><button type="button" onClick={()=>setMapFailed(false)}>{t('Retry map')}</button></div>:<MarketplaceMap ref={mapRef} groupCapacity={groupViewport.capacity} showrooms={mapData.showrooms} featuredNowBusinessId={mapData.featuredNowBusinessId} selectedShowroomId={selectedShowroomId} requestedView={requestedView} onViewChange={v=>{if(!navigationIsCommitted())return;const bounded={...v,zoom:clampMapZoom(v.zoom)};mapViewRef.current=bounded;setMapZoom(bounded.zoom);rememberNavigation(activeNearbyGroupKey,selectedShowroomId,bounded);}} onOpenNearbyGroup={g=>{if(!navigationIsCommitted())return;const eligible=currentMapGroup(groupIndex,mapData.showrooms,g.key,mapViewRef.current.zoom);if(!eligible)return;setActiveNearbyGroupKey(eligible.key);setSelectedShowroomId(null);rememberNavigation(eligible.key,null);}} onSelectShowroom={s=>{if(!navigationIsCommitted())return;mapRef.current?.centerAt(s.latitude,s.longitude,14);setActiveNearbyGroupKey(null);setSelectedShowroomId(s.id);rememberNavigation(null,s.id);}} onError={()=>setMapFailed(true)}/>}
    {group&&<NearbyShowroomsViewer viewport={groupViewport} group={group} showrooms={group.showroomIds.flatMap(id=>byId.get(id)?[byId.get(id)!]:[])} featuredNowBusinessId={mapData.featuredNowBusinessId} selectedShowroomId={selectedShowroomId} onSelect={id=>{if(!navigationIsCommitted())return;setSelectedShowroomId(id);rememberNavigation(group.key,id);}} onBack={()=>{setSelectedShowroomId(null);rememberNavigation(group.key,null);}} onClose={()=>{setActiveNearbyGroupKey(null);setSelectedShowroomId(null);rememberNavigation(null,null);}} onOpen={rememberCurrentPublicWorkspace}/>}
    {selected&&!group&&<ShowroomPreview showroom={selected} source="discovery" onClose={()=>{setSelectedShowroomId(null);rememberNavigation(null,null);}} onOpen={rememberCurrentPublicWorkspace} presence={showroomPresence(selected,mapData.featuredNowBusinessId,t)}/>}
   </div></div>
   </div>
  </div>
 </section>;
}

function ShowroomImage({ showroom }: { showroom: DiscoveryShowroom }) {
  const [failed, setFailed] = useState(false);
  return showroom.heroImagePath && !failed ? <Image src={showroom.heroImagePath} unoptimized={showroom.heroImagePath.startsWith("/api/page-media/") || showroom.heroImagePath.startsWith("/media/product-private-")} alt="" width={240} height={150} onError={() => setFailed(true)} /> : <span className={`discovery-image-fallback ${showroom.fallbackStyle}`} aria-hidden="true"><i>{showroom.name.slice(0, 1)}</i><b>{showroom.name}</b></span>;
}

function MapPreviewDialog({ labelledBy, onClose, children, wide = false, restoreGroupKey, restoreShowroomId }: { labelledBy: string; onClose: () => void; children: ReactNode; wide?: boolean; restoreGroupKey?:string;restoreShowroomId?:number }) {
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
        const markers=[...document.querySelectorAll<HTMLElement>('.discovery-map [data-map-group-key], .discovery-map [data-showroom-id]')];
        const current=markers.find(marker=>restoreGroupKey?marker.dataset.mapGroupKey===restoreGroupKey:String(restoreShowroomId)===marker.dataset.showroomId)?.closest<HTMLElement>('[role="button"]');
        const fallback=current&&current.getClientRects().length?current:[...document.querySelectorAll<HTMLElement>('.discovery-floating-buttons button, .discovery-map [role="button"]')].find(element=>element.getClientRects().length&&!element.closest('[inert]'));
        fallback?.focus({ preventScroll: true });
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
  return <MapPreviewDialog labelledBy={`showroom-preview-${showroom.id}`} onClose={onClose} restoreShowroomId={showroom.id}><aside className="discovery-preview" data-hero-image={showroom.heroImagePath || undefined}><button className="discovery-preview-close" type="button" onClick={onClose} aria-label={t("Close page preview")}><X aria-hidden="true" /></button><article><ShowroomImage showroom={showroom} /><div className="discovery-preview-copy"><span className={presence?.kind ? `presence-${presence.kind}` : undefined}>{t(status)}</span><h3 id={`showroom-preview-${showroom.id}`}>{showroom.name}</h3>{showroom.isDemo ? <span className={launchStyles.example}>{t("Example showroom")}</span> : null}<p>{showroom.tagline}</p><small>{discoveryLocationLabel([showroom.city, showroom.region])}</small><Link href={`/@${showroom.handle}?ref=${source}`} onClick={onOpen}>{t("Open page")}{" "}<b aria-hidden="true">→</b></Link></div></article></aside></MapPreviewDialog>;
}

export function NearbyShowroomsViewer({group,showrooms:sourceShowrooms,featuredNowBusinessId,selectedShowroomId,onSelect,onBack,onClose,onOpen,viewport:providedViewport}: {
 group:DiscoveryNearbyGroup;showrooms:DiscoveryShowroom[];featuredNowBusinessId:number|null;selectedShowroomId:number|null;onSelect:(id:number)=>void;onBack:()=>void;onClose:()=>void;onOpen:()=>void;viewport?:GroupViewport;
}) {
 const viewport=useMapGroupViewport(providedViewport),members=mapGroupMembers(group,sourceShowrooms),showrooms=members||[];
 const t=useUiText(),closeRef=useRef<HTMLButtonElement|null>(null),backRef=useRef<HTMLButtonElement|null>(null),listRef=useRef<HTMLDivElement|null>(null),lastSelectedId=useRef<number|null>(selectedShowroomId);
 const selected=showrooms.find(showroom=>showroom.id===selectedShowroomId)||null,layout=mapGroupLayout(viewport.width,viewport.height,viewport.fontScale,showrooms.length);
 const valid=Boolean(members&&showrooms.length<=viewport.capacity&&layout.admitted);
 useEffect(()=>{closeRef.current?.focus({preventScroll:true});},[group.key]);
 useEffect(()=>{if(selected){lastSelectedId.current=selected.id;backRef.current?.focus({preventScroll:true});}else if(lastSelectedId.current!==null)listRef.current?.querySelector<HTMLButtonElement>(`[data-showroom-id="${lastSelectedId.current}"]`)?.focus({preventScroll:true});},[selectedShowroomId,group.key]);
 useEffect(()=>{if(!valid)onClose();},[valid,onClose]);
 if(!valid)return null;
 return <MapPreviewDialog labelledBy="nearby-showroom-title" onClose={onClose} restoreGroupKey={group.key} wide><aside className={`nearby-showroom-viewer${selected?' detail-open':''}`} data-compact={layout.compact} data-paginated="false" data-capacity={viewport.capacity}>
  <header>{selected?<button ref={backRef} className="nearby-showroom-back" type="button" onClick={onBack}><ArrowLeft aria-hidden="true"/><span>{t('Back to businesses')}</span></button>:<div className="nearby-showroom-heading"><h2 id="nearby-showroom-title">{t('Choose a business')}</h2><p>{showrooms.length===1?t('1 business'):t('{count} businesses',{count:showrooms.length})}</p></div>}<button ref={closeRef} type="button" onClick={onClose} aria-label={t('Close business list')}><X aria-hidden="true"/></button></header>
  {selected?<NearbyShowroomDetail showroom={selected} presence={showroomPresence(selected,featuredNowBusinessId,t)} onOpen={onOpen}/>:<div ref={listRef} className="nearby-showroom-grid" style={{'--group-row-height':`${layout.rowHeight}px`,'--group-columns':viewport.width>=600?2:1} as CSSProperties}>
   {showrooms.map(showroom=>{const presence=showroomPresence(showroom,featuredNowBusinessId,t),location=showroom.city||showroom.zone||showroom.region||t(showroom.primaryIndustryShortLabel);return <button key={showroom.id} type="button" data-showroom-id={showroom.id} data-industry={showroom.primaryIndustryKey} data-presence={presence.kind||undefined} className={presence.kind||undefined} onClick={()=>onSelect(showroom.id)} aria-label={t('{value1}, {value2}, {value3}.{value4} View details.',{value1:showroom.name,value2:showroom.primaryIndustryLabel,value3:[location,presence.label].filter(Boolean).join('. '),value4:''})}><span className="nearby-showroom-media"><ShowroomImage showroom={showroom}/>{presence.kind?<i>{presence.shortLabel}</i>:null}</span><span className="nearby-showroom-copy"><small className="nearby-showroom-location">{location}</small><strong>{showroom.name}</strong>{showroom.isDemo?<span className={launchStyles.example}>{t('Example showroom')}</span>:null}<em>{t('View details')}</em></span></button>;})}
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
      <small>{discoveryLocationLabel([showroom.city, showroom.region])}</small>
      <Link href={`/@${showroom.handle}?ref=discovery`} onClick={onOpen}>{t("Open page")}{" "}<b aria-hidden="true">→</b></Link>
    </div>
  </article>;
}
