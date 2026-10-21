import React,{createContext,useContext,useEffect,useState} from 'react';
import {Platform} from 'react-native';
import {secure} from './runtime';
import {blockedBusinesses,excludedBusinessIds,type BlockedBusiness} from '../../../lib/catalog-safety';
const key='suqpage-blocked-businesses-v1';
const storage={
  get:async(k:string)=>Platform.OS==='web'?localStorage.getItem(k):secure.getItem(k),
  set:async(k:string,v:string)=>{if(Platform.OS==='web')localStorage.setItem(k,v);else await secure.setItem(k,v);},
  remove:async(k:string)=>{if(Platform.OS==='web')localStorage.removeItem(k);else await secure.removeItem(k);},
};
const Context=createContext<{list:BlockedBusiness[];ready:boolean;save:(items:BlockedBusiness[])=>Promise<void>}|null>(null);
export function BlockedBusinessProvider({children}:{children:React.ReactNode}){
  const [list,setList]=useState<BlockedBusiness[]>([]),[ready,setReady]=useState(false);
  useEffect(()=>{let active=true;(async()=>{try{
    const ids=excludedBusinessIds(JSON.parse(await storage.get(key)||'[]'));
    const records=await Promise.all(ids.map(async id=>{try{return JSON.parse(await storage.get(key+'-'+id)||'null');}catch{return null;}}));
    if(active)setList(blockedBusinesses(records.filter(Boolean)));
  }catch{if(active)setList([]);}finally{if(active)setReady(true);}})();return()=>{active=false;};},[]);
  async function save(items:BlockedBusiness[]){
    const next=blockedBusinesses(items);for(const item of next)await storage.set(key+'-'+item.id,JSON.stringify(item));
    await storage.set(key,JSON.stringify(next.map(v=>v.id)));
    setList(next);await Promise.all(list.filter(v=>!next.some(n=>n.id===v.id)).map(v=>storage.remove(key+'-'+v.id)));
  }
  return <Context.Provider value={{list,ready,save}}>{children}</Context.Provider>;
}
export function useBlockedBusinesses(){const v=useContext(Context);if(!v)throw Error('Missing catalog preferences.');return v;}
