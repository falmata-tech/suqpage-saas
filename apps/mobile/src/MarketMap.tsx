import React, {forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState} from 'react';
import {ActivityIndicator, View} from 'react-native';
import {Map, Camera, Marker, TransformRequestManager, type CameraRef} from '@maplibre/maplibre-react-native';
import type {MapProps, MapControls} from './map-contract';
import {initialMapView, osmStyle, shopCoordinate, nextMapZoom} from './native-map-model';
import {Button} from './ui';
import {useApp} from './runtime';
import {markerIndex, visibleMarkers, type MapBounds, type MarkerItem} from './map-markers';
import {MapMarker} from './MapMarker';

// Public tile requests only: never attach Supabase tokens or application cookies.
TransformRequestManager.addHeader({id: 'suqpage-osm-client', match: '^https://tile\\.openstreetmap\\.org/',
  name: 'User-Agent', value: 'Suqpage/0.1 (+https://suqpage.com)'});

export default forwardRef<MapControls, MapProps>(function MarketMap({shops, groups = [], selectedId, onGroup, onSelect, height = 500}, ref) {
  const camera = useRef<CameraRef>(null);
  const viewport = useRef(initialMapView);
  const index = useMemo(() => markerIndex(shops), [shops]);
  const [view, setView] = useState({bounds: [31.5, 2.5, 49.5, 15.5] as MapBounds, zoom: initialMapView.zoom});
  const markers = useMemo(() => visibleMarkers(index, shops, groups, view.bounds, view.zoom), [index, shops, groups, view]);
  function select(item: MarkerItem) {
    if (item.kind === 'cluster') camera.current?.easeTo({center: item.center, zoom: item.expansionZoom!, duration: 300});
    else if (item.kind === 'nearby') onGroup?.(item.shops || []);
    else if (item.shop) onSelect(item.shop);
  }
  const {t} = useApp();
  const [ready, setReady] = useState(false), [error, setError] = useState(false), [revision, setRevision] = useState(0);
  useImperativeHandle(ref, () => ({
    zoom: direction => {
      const zoom = nextMapZoom(viewport.current.zoom, direction);
      viewport.current = {...viewport.current, zoom};
      camera.current?.zoomTo(zoom, {duration: 200});
    },
    reset: () => {viewport.current = initialMapView; camera.current?.easeTo({...initialMapView, duration: 300});},
    focus: shop => {
      const center = shopCoordinate(shop);
      if (center) {viewport.current = {center, zoom: Math.max(12, viewport.current.zoom)}; camera.current?.easeTo({...viewport.current, duration: 300});}
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
      onRegionDidChange={event => {const {center, zoom} = event.nativeEvent; viewport.current = {center, zoom}; setView({bounds: event.nativeEvent.bounds, zoom});}}
      onDidFinishRenderingMapFully={() => setReady(true)} onDidFailLoadingMap={() => setError(true)}>
      <Camera ref={camera} initialViewState={viewport.current} minZoom={3} maxZoom={19}/>
      {markers.map(item => <Marker key={item.key} id={item.key} lngLat={item.center} anchor="top" offset={[0, -31]} onPress={event => {event.stopPropagation(); select(item);}}>
        <MapMarker item={item} selected={item.shop?.id === selectedId}
          label={item.shop ? `${item.shop.name}. ${t('Open page preview')}` : t('{count} nearby businesses', {count: item.count})}
          badge={item.presence ? t(item.presence === 'featured' ? 'Featured' : 'Live') : ''}
          nearby={t('Nearby')} onPress={() => select(item)}/>
      </Marker>)}
    </Map>}
    {!ready && !error && <ActivityIndicator accessibilityLabel={t('Loading')} style={{position: 'absolute', top: '50%', alignSelf: 'center'}}/>}
    {error && <View style={{flex: 1, justifyContent: 'center', padding: 24}}><Button label={t('Try again')} onPress={() => {setReady(false); setError(false); setRevision(v => v + 1);}}/></View>}
  </View>;
});
