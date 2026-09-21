export type MapLocation = {
  id: number; latitude: number; longitude: number;
  locationMode?: 'area' | 'storefront' | 'legacy';
};

/** Visual city placement only. Never persist or use this point as a shop address. */
export function mapDisplayLocation<T extends MapLocation>(shop: T): T {
  if (shop.locationMode !== 'area') return shop;
  // A low-discrepancy angle gives different shops distinct points independently
  // of result order, filtering and pagination. Bounded rings stay near the city.
  const angle = shop.id * Math.PI * (3 - Math.sqrt(5));
  const radiusKm = 0.35 + (shop.id % 23) * 0.05;
  const latitude = shop.latitude + Math.sin(angle) * radiusKm / 110.574;
  const longitude = shop.longitude + Math.cos(angle) * radiusKm /
    (111.32 * Math.cos(shop.latitude * Math.PI / 180));
  return { ...shop, latitude: Math.max(3, Math.min(15, latitude)), longitude: Math.max(32, Math.min(49, longitude)) };
}
