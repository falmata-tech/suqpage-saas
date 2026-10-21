import {useCallback,useEffect,useRef,useState,type DependencyList,type SetStateAction} from 'react';
import {useFocusEffect} from 'expo-router';

type Scope = {values:DependencyList};
type Snapshot<T> = {scope:Scope;data:T|null;error:string;loading:boolean;resolved:boolean};
const sameScope=(a:DependencyList,b:DependencyList)=>a.length===b.length&&a.every((value,index)=>Object.is(value,b[index]));
const empty=<T,>(scope:Scope):Snapshot<T>=>({scope,data:null,error:'',loading:true,resolved:false});
const revoked=(error:unknown)=>Boolean(error&&typeof error==='object'&&'status' in error&&[401,403,404].includes(Number(error.status)));

/** A retained snapshot is readable only within its exact resource/authority scope. */
export function useResourceLoad<T>(loader:()=>Promise<T>,identity:DependencyList,refreshOnFocus=false){
  const scope=useRef<Scope>({values:[...identity]});
  if(!sameScope(scope.current.values,identity))scope.current={values:[...identity]};
  const currentScope=scope.current,latestLoader=useRef(loader);latestLoader.current=loader;
  const [snapshot,setSnapshot]=useState<Snapshot<T>>(()=>empty(currentScope));
  const [revision,setRevision]=useState(0),generation=useRef(0),focusedScope=useRef<Scope|null>(null);
  const reload=useCallback(()=>{
    if(scope.current!==currentScope)return;
    generation.current++;
    setSnapshot(old=>old.scope===currentScope?{...old,loading:true,error:''}:empty(currentScope));
    setRevision(value=>value+1);
  },[currentScope]);
  useFocusEffect(useCallback(()=>{
    // The ordinary effect owns initial/new-scope reads; focus only revalidates a
    // resource this hook has already shown, avoiding a duplicate mount request.
    if(refreshOnFocus&&focusedScope.current===currentScope)reload();
    focusedScope.current=currentScope;
  },[refreshOnFocus,reload,currentScope]));
  useEffect(()=>{
    let live=true;const request=++generation.current,read=latestLoader.current;
    setSnapshot(old=>old.scope===currentScope?{...old,loading:true,error:''}:empty(currentScope));
    void Promise.resolve().then(read).then(data=>{
      if(live&&scope.current===currentScope&&generation.current===request)setSnapshot({scope:currentScope,data,error:'',loading:false,resolved:true});
    }).catch((error:unknown)=>{
      if(live&&scope.current===currentScope&&generation.current===request)setSnapshot(old=>({
        scope:currentScope,data:old.scope===currentScope&&!revoked(error)?old.data:null,
        resolved:old.scope===currentScope&&!revoked(error)&&old.resolved,
        error:error instanceof Error?error.message:'Please try again.',loading:false,
      }));
    });
    return()=>{live=false;};
  },[currentScope,revision]);
  const visible=snapshot.scope===currentScope?snapshot:empty<T>(currentScope);
  const setData=useCallback((value:SetStateAction<T|null>)=>{
    if(scope.current!==currentScope)return;
    // An acknowledged command is newer authority than an earlier read.
    generation.current++;
    setSnapshot(old=>({scope:currentScope,data:typeof value==='function'?(value as (old:T|null)=>T|null)(old.scope===currentScope?old.data:null):value,error:'',loading:false,resolved:true}));
  },[currentScope]);
  return{data:visible.data,error:visible.error,loading:visible.loading,initialLoading:visible.loading&&!visible.resolved,refreshing:visible.loading&&visible.resolved,reload,setData};
}
