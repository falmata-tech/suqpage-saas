import React from "react";
import OwnerLocationPicker, { type MapPoint } from "../../../components/OwnerLocationPicker";

type Props = { city: MapPoint; point: MapPoint | null; disabled?: boolean; t: (key: string) => string; onChange: (point: MapPoint | null) => void };

export default function OwnerLocationPickerWeb(props: Props) {
  return <>
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <OwnerLocationPicker {...props} />
  </>;
}
