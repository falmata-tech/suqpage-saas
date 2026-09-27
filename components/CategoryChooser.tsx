'use client';
import { useUiText } from '@/lib/i18n/ui';
import { useEffect, useRef } from 'react';
import { Check, ChevronDown, X } from 'lucide-react';
import { discoveryCategoryKey, normalizeDiscoveryCategories } from '@/lib/discovery-contract';
import CategoryIllustration from './CategoryIllustration';
import styles from './CategoryChooser.module.css';

type Category = { key: string; shortLabel: string; icon: string };
export default function CategoryChooser({ categories, value, disabled = false, onChange }: {
  categories: readonly Category[]; value: string; disabled?: boolean; onChange: (key: string) => void;
}) {
  const t = useUiText();
  const details = useRef<HTMLDetailsElement>(null);
  const wrapper = useRef<HTMLDivElement>(null);
  const selected = normalizeDiscoveryCategories(value);
  const options = categories.filter(category => category.key !== 'all');
  const label = selected.length > 1 ? t('{count} categories', { count: selected.length })
    : selected.length ? t(options.find(category => category.key === selected[0])?.shortLabel || 'Category') : t('All categories');
  const close = (focus = true) => {
    if (details.current) {
      details.current.open = false;
      if (focus) details.current.querySelector('summary')?.focus();
    }
  };
  useEffect(() => {
    const outside = (event: PointerEvent) => {
      if (event.target instanceof Node && !wrapper.current?.contains(event.target)) close(false);
    };
    document.addEventListener('pointerdown', outside);
    return () => document.removeEventListener('pointerdown', outside);
  }, []);
  return <div ref={wrapper} className={styles.field} onBlur={event => { if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget)) close(false); }}>
    <details ref={details} className={styles.chooser} onKeyDown={event => {
      if (event.key === 'Escape' && details.current?.open) { event.preventDefault(); event.stopPropagation(); close(); }
    }}>
      <summary aria-label={t("Filter by category")} title={label}><span>{label}</span><ChevronDown size={16} aria-hidden="true" /></summary>
      <div className={styles.options} role="group" aria-label={t('Categories')} aria-busy={disabled}>
        {options.map(category => <button key={category.key} type="button" aria-disabled={disabled} aria-pressed={selected.includes(category.key)} onClick={() => {
          if (disabled) return;
          const keys = selected.includes(category.key) ? selected.filter(key => key !== category.key) : [...selected, category.key];
          onChange(discoveryCategoryKey(keys));
        }}>
          <CategoryIllustration name={category.icon} size={30} /><span>{t(category.shortLabel)}</span>
          {selected.includes(category.key) ? <Check size={16} aria-hidden="true" /> : null}
        </button>)}
      </div>
    </details>
    {selected.length ? <button className={styles.clear} type="button" disabled={disabled} aria-label={t('Clear categories')} title={t('Clear categories')} onClick={() => { close(); onChange('all'); }}><X size={16} aria-hidden="true" /></button> : null}
  </div>;
}
