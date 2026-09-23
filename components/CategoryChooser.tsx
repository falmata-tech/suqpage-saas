'use client';
import { useUiText } from "@/lib/i18n/ui";

import { useRef } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import CategoryIllustration from './CategoryIllustration';
import styles from './CategoryChooser.module.css';

type Category = { key:string; shortLabel:string; icon:string };
export default function CategoryChooser({categories,value,onChange}:{categories:readonly Category[];value:string;onChange:(key:string)=>void}) {
  const t = useUiText();
  const details=useRef<HTMLDetailsElement>(null);
  const selected=categories.find(category=>category.key===value)||categories[0];
  if(!selected)return null;
  const close=()=>{if(details.current){details.current.open=false;details.current.querySelector('summary')?.focus();}};
  return <details ref={details} className={styles.chooser} onKeyDown={event=>{if(event.key==='Escape'&&details.current?.open){event.preventDefault();event.stopPropagation();close();}}}>
    <summary aria-label={t("Filter by category")}><CategoryIllustration name={selected.icon} size={30}/><span>{t(selected.shortLabel)}</span><ChevronDown size={16} aria-hidden="true"/></summary>
    <div className={styles.options} role="group" aria-label={t("Categories")}>
      {categories.map(category=><button key={category.key} type="button" aria-pressed={category.key===value} onClick={()=>{close();onChange(category.key);}}>
        <CategoryIllustration name={category.icon} size={34}/><span>{t(category.shortLabel)}</span>{category.key===value?<Check size={15} aria-hidden="true"/>:null}
      </button>)}
    </div>
  </details>;
}
