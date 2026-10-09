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
  return { ...shop, latitude: Math.max(-85.051129, Math.min(85.051129, latitude)), longitude: ((longitude + 180) % 360 + 360) % 360 - 180 };
}

/** Wrapped longitude copies are display coordinates, never stored business coordinates. */
export function wrappedMapLongitude(longitude:number,center:number):number {
  return longitude + 360 * Math.round((center-longitude)/360);
}
export function pointInMapViewport(longitude:number,latitude:number,bounds:readonly [number,number,number,number]):boolean {
  if(![longitude,latitude,...bounds].every(Number.isFinite)||latitude<bounds[1]||latitude>bounds[3])return false;
  if(bounds[2]-bounds[0]>=360)return true;
  const normalize=(value:number)=>((value+180)%360+360)%360-180;
  const west=normalize(bounds[0]),east=normalize(bounds[2]),x=normalize(longitude);
  return west<=east?x>=west&&x<=east:x>=west||x<=east;
}
