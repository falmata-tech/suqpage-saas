import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {View} from 'react-native';
import {Map, Camera, Marker,TransformRequestManager, type CameraRef} from '@maplibre/maplibre-react-native';
import type {MapProps, MapControls} from './map-contract';
import {initialMapView, osmStyle, shopCoordinate, nextMapZoom} from './native-map-model';
import {Button} from './ui';
import LoadingBar from './LoadingBar';
import {useApp} from './runtime';
import {markerIndex, visibleMarkers, type MapBounds, type MarkerItem} from './map-markers';
import {MapMarker} from './MapMarker';
import {MAP_NATIVE_MAX_ZOOM,MAP_GROUP_DEFAULT_CAPACITY} from '../../../lib/map/map-clustering';

// Public tile requests only: never attach Supabase tokens or application cookies.
TransformRequestManager.addHeader({id: 'suqpage-osm-client', match: '^https://tile\\.openstreetmap\\.org/',
  name: 'User-Agent', value: 'MirtPage/0.1 (+https://mirtpage.com)'});

export default forwardRef<MapControls, MapProps>(function MarketMap({shops,groupCapacity=MAP_GROUP_DEFAULT_CAPACITY, groups = [], selectedId, onGroup, onSelect, onZoomChange,onViewChange,initialView, height = 500}, ref) {
  const camera = useRef<CameraRef>(null);
  const viewport = useRef(initialView?{center:initialView.center,zoom:Math.max(1,Math.min(MAP_NATIVE_MAX_ZOOM,initialView.zoom))}:initialMapView);
  const index = useMemo(() => markerIndex(shops,groupCapacity), [shops,groupCapacity]);
  const [view, setView] = useState({bounds: [31.5, 2.5, 49.5, 15.5] as MapBounds, zoom: viewport.current.zoom});
  const markers = useMemo(() => visibleMarkers(index, shops, groups, view.bounds, view.zoom+1), [index, shops, groups, view]);
  function select(item: MarkerItem) {
    if(item.expansionZoom!==undefined){
      const zoom=Math.min(MAP_NATIVE_MAX_ZOOM,Math.max(Math.floor(viewport.current.zoom)+1,(item.expansionZoom??viewport.current.zoom+2)-1));
      viewport.current={center:item.center,zoom};camera.current?.easeTo({...viewport.current,duration:300});
    }
    else if (item.kind !== 'shop') onGroup?.(item.shops || []);
    else if (item.shop) onSelect(item.shop);
  }
  const {t} = useApp();
  const [ready, setReady] = useState(false), [error, setError] = useState(false), [revision, setRevision] = useState(0);
  useImperativeHandle(ref, () => ({
    zoom: direction => {
      const zoom = nextMapZoom(viewport.current.zoom, direction,MAP_NATIVE_MAX_ZOOM);
      viewport.current = {...viewport.current, zoom};
      camera.current?.zoomTo(zoom, {duration: 200});
    },
    reset: () => {viewport.current = initialMapView; camera.current?.easeTo({...initialMapView, duration: 300});},
    focus: shop => {
      const center = shopCoordinate(shop);
      if (center) {viewport.current = {center, zoom: Math.min(MAP_NATIVE_MAX_ZOOM,Math.max(12, viewport.current.zoom))}; camera.current?.easeTo({...viewport.current, duration: 300});}
    },
  }), []);
  useEffect(() => {
    if (ready || error) return;
    const timer = setTimeout(() => setError(true), 20000);
    return () => clearTimeout(timer);
  }, [ready, error, revision]);
  return <View style={{height, backgroundColor: '#dfe9e8'}}>
    {!error && <Map key={revision} style={{flex: 1}} mapStyle={osmStyle} androidView="texture"
      accessibilityLabel={t('Business map')} attribution={false} compass={false} touchRotate={false} touchPitch={false}
      onRegionDidChange={event => {const {center} = event.nativeEvent,zoom=Math.max(1,Math.min(MAP_NATIVE_MAX_ZOOM,event.nativeEvent.zoom)); viewport.current = {center, zoom}; setView({bounds: event.nativeEvent.bounds, zoom});onZoomChange?.(zoom);onViewChange?.(viewport.current);}}
      onDidFinishRenderingMapFully={() => setReady(true)} onDidFailLoadingMap={() => setError(true)}>
      <Camera ref={camera} initialViewState={viewport.current} minZoom={1} maxZoom={MAP_NATIVE_MAX_ZOOM}/>
      {markers.map(item => <Marker key={item.key} id={item.key} lngLat={item.center} anchor="top" offset={[0, -31]} pointerEvents="box-none" onPress={item.kind==='shop'?event => {event.stopPropagation(); select(item);}:undefined}>
        <MapMarker item={item} selected={item.shop?.id === selectedId}
          label={item.shop ? `${item.shop.name}. ${t('Open page preview')}` : item.expansionZoom!==undefined?item.count===1?t('1 business. Zoom in.'):t('{count} businesses. Zoom in.',{count:item.count}):item.count===1?t('1 business. View business.'):t('{count} businesses. View businesses.', {count: item.count})}
          badge={item.presence ? t(item.presence === 'featured' ? 'Featured' : 'Live') : ''}
          nearby={t('Nearby')} onPress={() => select(item)}/>
      </Marker>)}
    </Map>}
    {!ready && !error && <View pointerEvents="none" style={{position:'absolute',top:60,left:12,right:70}}><LoadingBar/></View>}
    {error && <View style={{flex: 1, justifyContent: 'center', padding: 24}}><Button label={t('Try again')} onPress={() => {setReady(false); setError(false); setRevision(v => v + 1);}}/></View>}
  </View>;
});
