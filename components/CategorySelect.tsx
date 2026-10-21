'use client';
import { useUiText } from "@/lib/i18n/ui";

import { useState } from 'react';
import CategoryIllustration from './CategoryIllustration';
import { BUSINESS_CATEGORY_OPTIONS } from '@/lib/business-categories';
import styles from './CategoryChooser.module.css';

export default function CategorySelect({id,name,defaultValue='',required=false}:{id:string;name:string;defaultValue?:string;required?:boolean}){
  const t = useUiText();
  const [value,setValue]=useState(defaultValue);
  return <div className={styles.native}><CategoryIllustration name={value} size={32}/>
    <select id={id} name={name} value={value} required={required} onChange={event=>setValue(event.target.value)}>
      <option value="" disabled={required}>{t("Choose a category")}</option>
      {BUSINESS_CATEGORY_OPTIONS.map(option=><option key={option.key} value={option.key}>{t(option.label)}</option>)}
    </select>
  </div>;
}
