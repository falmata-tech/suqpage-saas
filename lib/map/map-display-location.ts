export type MapLocation = {
  id: number; latitude: number; longitude: number;
  locationMode?: 'area' | 'storefront' | 'legacy';
};

/** City-only businesses use the validated city anchor, never an inferred storefront point. */
export function mapDisplayLocation<T extends MapLocation>(shop: T): T {
  return shop;
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
