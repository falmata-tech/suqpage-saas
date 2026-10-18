import type {DiscoveryNearbyGroup, DiscoveryShowroom} from '@/lib/discovery';
import {mapExposedGroup, type MapClusterIndex, mapGroupPickerLayout, mapGroupCapacity, MAP_GROUP_MAX_MEMBERS} from '@/lib/map/map-clustering';

/** Saved navigation supplies a key, never a trusted list of businesses. */
export function currentMapGroup(index:MapClusterIndex,showrooms:DiscoveryShowroom[],key:string|null,zoom:number):DiscoveryNearbyGroup|null {
  if(!key)return null;
  const fixed=index.groups.find(item=>item.kind==='cluster'&&item.key===key);
  const marker=fixed?mapExposedGroup(index,fixed.ids,zoom):null;if(!marker)return null;
  const group={key:marker.key,longitude:marker.anchor[0],latitude:marker.anchor[1],count:marker.count,showroomIds:marker.ids,city:'',region:''};
  const members=mapGroupMembers(group,showrooms);if(!members||group.count>index.capacity)return null;
  return {...group,
    city:members.every(member=>member.city===members[0].city)?members[0].city:'',
    region:members.every(member=>member.region===members[0].region)?members[0].region:''};
}

/** A picker cannot silently admit or truncate an oversized/obsolete group. */
export function mapGroupMembers(group:DiscoveryNearbyGroup,showrooms:DiscoveryShowroom[]):DiscoveryShowroom[]|null {
  if(!Number.isInteger(group.count)||group.count<1||group.count>MAP_GROUP_MAX_MEMBERS||!Array.isArray(group.showroomIds)||group.showroomIds.length!==group.count)return null;
  const ids=group.showroomIds;if(new Set(ids).size!==ids.length||ids.some(id=>!Number.isSafeInteger(id)||id<=0))return null;
  const byId=new Map<number,DiscoveryShowroom>();for(const showroom of showrooms)if(!byId.has(showroom.id))byId.set(showroom.id,showroom);
  const members=ids.flatMap(id=>byId.has(id)?[byId.get(id)!]:[]);
  return members.length===group.count?members:null;
}

export function mapGroupLayout(width:number,height:number,fontScale=1,count=3) {
  return {width,height,fontScale,...mapGroupPickerLayout(width,height,fontScale,count)};
}


export function mapGroupViewport(width:number,height:number,fontScale=1) {
  return {width,height,fontScale,capacity:mapGroupCapacity(width,height,fontScale)};
}
