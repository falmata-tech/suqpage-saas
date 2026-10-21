import {Platform} from 'react-native';
import {parseMarketWorkspaceSnapshot,serializeMarketWorkspaceSnapshot,type MarketWorkspaceState} from '../../../lib/market-workspace';

const SESSION_KEY='suqpage:mobile-market-workspace:v1';
let snapshot:string|null=null;

/** Public navigation only: native app memory, or this browser tab's session. */
export function readMarketSession():MarketWorkspaceState|null {
 const remembered=parseMarketWorkspaceSnapshot(snapshot);
 if(remembered)return remembered;
 if(Platform.OS==='web')try {
  const stored=window.sessionStorage.getItem(SESSION_KEY);
  const restored=parseMarketWorkspaceSnapshot(stored);
  if(restored){snapshot=stored;return restored;}
 }catch{/* Storage denial must not block public navigation. */}
 return null;
}

export function rememberMarketSession(state:MarketWorkspaceState):void {
 snapshot=serializeMarketWorkspaceSnapshot(state);
 if(Platform.OS==='web')try{window.sessionStorage.setItem(SESSION_KEY,snapshot);}catch{/* App memory still preserves ordinary returns. */}
}
