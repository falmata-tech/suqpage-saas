import {supportViewState,type SupportViewState} from '@/lib/support-navigation';
export default function SupportNavigationFields({state}:{state:SupportViewState}){return <>{Object.entries(supportViewState(state)).map(([key,value])=>value?<input key={key} type="hidden" name={'nav_'+key} value={value}/>:null)}</>;}
