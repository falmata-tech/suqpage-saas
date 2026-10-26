'use client';
import {useEffect,useRef,useState} from 'react';
import {useLocale} from 'next-intl';
import {Search,X,ChevronDown,ChevronLeft,MapPin,Grid2X2,Globe,Check,SlidersHorizontal} from 'lucide-react';
import {useUiText} from '@/lib/i18n/ui';
import {countryName} from '@/lib/countries';
import {emptyMarketSearch,hasMarketCriteria,type MarketScope,type MarketSearch} from '@/lib/market-search';
import type {MarketplaceDiscoveryView} from '@/lib/discovery';
import styles from './IndependentMarket.module.css';

export default function MarketSearchControls({scope,value,onChange,metadata,ready}:{scope:MarketScope;value:MarketSearch;onChange:(value:MarketSearch)=>void;metadata:Pick<MarketplaceDiscoveryView,'places'|'countries'|'industries'>;ready:boolean}) {
 const t=useUiText(),locale=useLocale(),dialog=useRef<HTMLDialogElement>(null);
 const filterTrigger=useRef<HTMLButtonElement>(null);
 const [picker,setPicker]=useState(''),[filterText,setFilterText]=useState(''),[fromOverview,setFromOverview]=useState(false);
 const isOpen=Boolean(picker),overview=picker==='filters';
 const title=overview?'Filters':picker==='category'?'Categories':picker==='country'?'Country':'City';
 useEffect(()=>{
  if(!isOpen)return;const previous=document.activeElement as HTMLElement|null,host=filterTrigger.current?.parentElement;dialog.current?.showModal();
  return()=>{dialog.current?.close();const visible=(element:HTMLElement|null|undefined)=>Boolean(element?.isConnected&&element.getClientRects().length),direct=host?.querySelector<HTMLElement>('[data-inline-filters] button:not(:disabled)'),search=host?.querySelector<HTMLElement>('input[type="search"]:not(:disabled)');const target=[previous,filterTrigger.current,direct,search].find(visible);target?.focus();};
 },[isOpen]);
 useEffect(()=>{
  if(!picker||!dialog.current?.open)return;
  dialog.current.querySelector<HTMLElement>(overview?'[data-filter-menu] button:not(:disabled)':'input[type="search"], [data-filter-options] input:not(:disabled), [data-filter-back]')?.focus();
 },[picker,overview]);
 function change(patch:Partial<MarketSearch>){if(ready)onChange({...value,...patch,page:1});}
 const choices=picker==='category'?metadata.industries.filter(c=>c.key!=='all').map(c=>({key:c.key,label:t(c.shortLabel)}))
  :picker==='country'?(metadata.countries||[]).map(c=>({key:c.code,label:countryName(c.code,locale)}))
  :metadata.places.filter(p=>p.countryCode&&value.countries.includes(p.countryCode)).map(p=>({key:p.key,label:`${p.city} · ${countryName(p.countryCode!,locale)}`}));
 const selected=picker==='category'?value.categories:picker==='country'?value.countries:value.cities;
 function select(key:string) {
  const next=selected.includes(key)?selected.filter(c=>c!==key):[...selected,key].slice(0,16);
  if(picker==='category')change({categories:next});
  else if(picker==='country')change({countries:next,cities:value.cities.filter(c=>next.includes(c.split(':')[0]))});
  else change({cities:next});
 }
 function openPicker(key:string,viaOverview=false){if(ready){setFilterText('');setFromOverview(viaOverview);setPicker(key);}}
 const activeCount=value.categories.length+value.countries.length+value.cities.length+(scope==='products'&&value.madeToOrder?1:0);
 const filterButtons=(inOverview=false)=><>
   {[{key:'category',label:'Category',count:value.categories.length,Icon:Grid2X2},{key:'country',label:'Country',count:value.countries.length,Icon:Globe},{key:'city',label:'City',count:value.cities.length,Icon:MapPin}].map(f=><button key={f.key} type="button" disabled={!ready||f.key==='city'&&!value.countries.length} aria-haspopup="dialog" data-active={f.count>0} onClick={()=>openPicker(f.key,inOverview)}><f.Icon size={15} aria-hidden="true"/><span>{t(f.label)}</span>{f.count>0?<b>{f.count}</b>:<ChevronDown size={12} aria-hidden="true"/>}</button>)}
   {scope==='products'&&<button type="button" disabled={!ready} aria-pressed={value.madeToOrder} data-active={value.madeToOrder} onClick={()=>change({madeToOrder:!value.madeToOrder})}>{value.madeToOrder&&<Check size={15} aria-hidden="true"/>}<span>{t('Made to order')}</span></button>}
  </>;
 return <div className={styles.controls} data-search-scope={scope}>
  <form role="search" aria-label={t(scope==='businesses'?'Search businesses':'Search products')} className={styles.search} onSubmit={event=>event.preventDefault()}>
   <Search size={19} aria-hidden="true"/><input type="search" disabled={!ready} maxLength={80} autoComplete="off" aria-label={t(scope==='businesses'?'Search businesses':'Search products')} placeholder={t(scope==='businesses'?'Search businesses':'Search products')} value={value.query} onChange={event=>change({query:event.target.value})}/>
   {value.query&&<button type="button" disabled={!ready} aria-label={t('Clear search')} onClick={()=>change({query:''})}><X size={18}/></button>}
   {hasMarketCriteria(value)&&<button type="button" disabled={!ready} className={styles.clear} aria-label={t('Clear all')} title={t('Clear all')} onClick={()=>{if(ready)onChange(emptyMarketSearch());}}>{t('Clear all')}</button>}
  </form>
  <button ref={filterTrigger} type="button" className={styles.compactFilters} disabled={!ready} aria-label={t('Filters, {count} selected',{count:activeCount})} aria-haspopup="dialog" aria-expanded={isOpen&&fromOverview} data-active={activeCount>0} onClick={()=>openPicker('filters',true)}><SlidersHorizontal size={16} aria-hidden="true"/><span>{t('Filters')}</span>{activeCount>0&&<b aria-hidden="true">{activeCount}</b>}</button>
  <div className={styles.filters} data-inline-filters>{filterButtons()}</div>
  {picker&&<dialog ref={dialog} className={styles.filterDialog} aria-labelledby={`${scope}-filter-title`} onKeyDown={event=>{if(event.key==='Escape')event.stopPropagation();}} onCancel={event=>{event.preventDefault();setPicker('');}} onClick={event=>{if(event.target===event.currentTarget){const r=event.currentTarget.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)setPicker('');}}}>
   <div className={styles.dialogHeading}>{fromOverview&&!overview&&<button type="button" data-filter-back aria-label={t('Back to filters')} onClick={()=>{setFilterText('');setPicker('filters');}}><ChevronLeft size={20}/></button>}<h2 id={`${scope}-filter-title`}>{t(title)}</h2><button type="button" aria-label={t('Close')} onClick={()=>setPicker('')}><X size={20}/></button></div>
   {overview?<div className={styles.filterMenu} data-filter-menu>{filterButtons(true)}</div>:<>
    {choices.length>8&&<input type="search" disabled={!ready} aria-label={t('Filter options')} placeholder={t('Search')} value={filterText} onChange={event=>setFilterText(event.target.value)}/>}
    <div className={styles.options} data-filter-options>{choices.filter(c=>c.label.toLocaleLowerCase().includes(filterText.toLocaleLowerCase())).map(c=><label key={c.key}><input type="checkbox" disabled={!ready} checked={selected.includes(c.key)} onChange={()=>select(c.key)}/><span>{c.label}</span></label>)}{!choices.length&&<p>{t('No locations listed yet.')}</p>}</div>
   </>}
   <div className={styles.dialogFooter}><button type="button" disabled={!ready} onClick={()=>{if(overview){if(ready)onChange(emptyMarketSearch());}else if(picker==='category')change({categories:[]});else if(picker==='country')change({countries:[],cities:[]});else change({cities:[]});}}>{t(overview?'Clear all':'Clear')}</button><button type="button" className="btn brand" onClick={()=>setPicker('')}>{t('Done')}</button></div>
  </dialog>}
 </div>;
}
