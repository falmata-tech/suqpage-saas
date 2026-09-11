export const MAP_PROVIDER_IDS = ["osm-standard"] as const;

export type MapProviderId = (typeof MAP_PROVIDER_IDS)[number];

export type MapProviderConfig = {
  id: MapProviderId;
  tileUrlTemplate: string;
  attributionHtml: string;
  maxNativeZoom: number;
  maxZoom: number;
};

const OSM_STANDARD_PROVIDER: MapProviderConfig = {
  id: "osm-standard",
  tileUrlTemplate: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
  attributionHtml: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>',
  maxNativeZoom: 19,
  maxZoom: 19,
};

export function mapProviderConfig(): MapProviderConfig {
  const providerId = process.env.NEXT_PUBLIC_MIRTPAGE_MAP_PROVIDER || "osm-standard";
  if (providerId !== OSM_STANDARD_PROVIDER.id) {
    throw new Error(`Unsupported AfricMade map provider: ${providerId}`);
  }
  return OSM_STANDARD_PROVIDER;
}
