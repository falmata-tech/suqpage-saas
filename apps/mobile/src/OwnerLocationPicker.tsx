import React, { useRef, useState } from "react";
import { View, Text } from "react-native";
import { Map, Camera, Marker, type CameraRef } from "@maplibre/maplibre-react-native";
import { nativeMapStyle } from "./native-map-model";
import { Button, colors } from "./ui";
import type { MapPoint } from "../../../components/OwnerLocationPicker";

const mapStyle = nativeMapStyle(__DEV__, process.env.EXPO_PUBLIC_NATIVE_MAP_FIXTURE);
type Props = { city: MapPoint; point: MapPoint | null; disabled?: boolean; t: (key: string) => string; onChange: (point: MapPoint | null) => void };

export default function OwnerLocationPicker({ city, point, disabled = false, t, onChange }: Props) {
  const camera = useRef<CameraRef>(null);
  const center = useRef<[number, number]>(point?[point.longitude,point.latitude]:[city.longitude, city.latitude]);
  const zoom = useRef(15);
  const readyRef = useRef(false), errorRef = useRef(false), disabledRef = useRef(disabled);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(false);
  disabledRef.current = disabled;
  return <View style={{ gap: 8 }}>
    <Text style={{ color: colors.muted, fontSize: 14, lineHeight: 20 }}>{t("Customers will see this exact public location.")}</Text>
    <View style={{ height: 280, borderRadius: 14, overflow: "hidden", borderWidth: 1, borderColor: colors.line, backgroundColor: "#e9efec" }}>
      {!error ? <Map key={String(error)} style={{ flex: 1 }} mapStyle={mapStyle} androidView="texture" accessibilityLabel={t("Storefront location map")} attribution={false} compass={false} touchRotate={false} touchPitch={false}
        onPress={event => { if(disabledRef.current||!readyRef.current||errorRef.current)return;const [longitude, latitude] = event.nativeEvent.lngLat; if (Number.isFinite(latitude) && Number.isFinite(longitude)) onChange({ latitude, longitude }); }}
        onRegionDidChange={event => { center.current = event.nativeEvent.center;zoom.current=event.nativeEvent.zoom; }}
        onDidFinishRenderingMapFully={() => {readyRef.current=true;setReady(true);}} onDidFailLoadingMap={() => {errorRef.current=true;readyRef.current=false;setError(true);}}>
        <Camera ref={camera} initialViewState={{ center: [city.longitude, city.latitude], zoom: 15 }} minZoom={12} maxZoom={19}/>
        {point ? <Marker id="owner-storefront-pin" lngLat={[point.longitude, point.latitude]} anchor="bottom">
          <View accessibilityLabel={t("Exact location selected")} style={{ width: 28, height: 28, borderRadius: 14, borderWidth: 4, borderColor: "white", backgroundColor: colors.brand, elevation: 5 }} />
        </Marker> : null}
      </Map> : <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 16 }}><Text style={{ color: colors.muted, textAlign: "center" }}>{t("The map could not load. Retry before choosing a public location.")}</Text></View>}
    </View>
    {!ready&&!error ? <Text style={{color:colors.muted}}>{t("Loading…")}</Text> : null}
    {!error ? <View style={{flexDirection:"row",gap:8}}><Button secondary disabled={disabled||!ready||zoom.current>=19} label={t("Zoom in")} onPress={()=>{zoom.current=Math.min(19,zoom.current+1);camera.current?.zoomTo(zoom.current,{duration:180});}}/><Button secondary disabled={disabled||!ready||zoom.current<=12} label={t("Zoom out")} onPress={()=>{zoom.current=Math.max(12,zoom.current-1);camera.current?.zoomTo(zoom.current,{duration:180});}}/></View> : null}
    {error ? <Button secondary disabled={disabled} label={t("Retry map")} onPress={() => { readyRef.current=false;errorRef.current=false;setReady(false);setError(false); }}/>
      : <Button secondary disabled={disabled || !ready} label={t("Place pin at map center")} onPress={() => onChange({ latitude: center.current[1], longitude: center.current[0] })}/>}
    <Text accessibilityLiveRegion="polite" style={{ color: colors.muted, fontSize: 13, lineHeight: 18 }}>
      {point ? `${t("Exact location selected")}: ${point.latitude.toFixed(5)}, ${point.longitude.toFixed(5)}` : ready&&!error?t("Tap the map to place the storefront pin."):""}
    </Text>
  </View>;
}
