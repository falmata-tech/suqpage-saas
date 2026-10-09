'use client';
import { useUiText } from "@/lib/i18n/ui";

import { useEffect, useId, useRef, useState } from 'react';
import type { KnownPlace } from '@/lib/place-search';
import styles from './PlaceSearch.module.css';

export default function PlaceSearch({ value, selected, onChange, onSelect, inputId="owner-city", selectionRequired=false }: {
  inputId?:string; selectionRequired?:boolean; value: string; selected: KnownPlace | null; onChange: (value: string) => void; onSelect: (place: KnownPlace) => void;
}) {
  const t = useUiText();
  const id = useId();
  const input = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<KnownPlace[]>([]);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState('');
  useEffect(() => {
    if (!open || selected || value.trim().length < 2) { setResults([]); setStatus(''); return; }
    const controller = new AbortController();
    setResults([]); setActive(-1); setStatus('Searching places…');
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`/api/places?q=${encodeURIComponent(value)}`, { signal: controller.signal });
        if (!response.ok) throw new Error('Search unavailable');
        const body = await response.json() as { places: KnownPlace[] };
        if (controller.signal.aborted) return;
        setResults(body.places); setStatus(body.places.length ? `${body.places.length} places found.` : selectionRequired?'No matching city. Try another name.':'No matching place. You can enter your city and region manually.');
      } catch {
        if (!controller.signal.aborted) setStatus(selectionRequired?'City search is unavailable. Try again.':'Place search is unavailable. Try typing again, or enter your city and region manually.');
      }
    }, 200);
    return () => { clearTimeout(timer); controller.abort(); };
  }, [value, open, selected, selectionRequired]);
  function choose(place: KnownPlace) { onSelect(place); setOpen(false); setActive(-1); }
  const expanded = open && results.length > 0;
  useEffect(() => {
    if (expanded && document.activeElement === input.current && window.matchMedia("(max-width: 700px)").matches) input.current?.scrollIntoView({block:"center",behavior:"instant"});
  }, [expanded]);
  return <div className={styles.search}>
    <input ref={input} id={inputId} name={selectionRequired?undefined:"city"} value={value} maxLength={80} autoComplete="off" role="combobox"
      aria-autocomplete="list" aria-expanded={expanded} aria-controls={expanded ? `${id}-results` : undefined}
      aria-activedescendant={expanded && active >= 0 ? `${id}-${active}` : undefined} aria-describedby={`${id}-status`}
      placeholder={t("Search a city or town")} onFocus={event => { setOpen(true); if (window.matchMedia("(max-width: 700px)").matches) event.currentTarget.scrollIntoView({block:"center",behavior:"instant"}); }} onBlur={() => setOpen(false)}
      onChange={event => { onChange(event.target.value); setOpen(true); }}
      onKeyDown={event => {
        if (event.key === 'Escape') { setOpen(false); setActive(-1); }
        if (event.key === 'ArrowDown' && results.length) { event.preventDefault(); setOpen(true); setActive(index => (index + 1) % results.length); }
        if (event.key === 'ArrowUp' && results.length) { event.preventDefault(); setOpen(true); setActive(index => (index - 1 + results.length) % results.length); }
        if (event.key === 'Enter' && expanded) { event.preventDefault(); if (active >= 0) choose(results[active]); }
      }} />
    <input type="hidden" name="placeId" value={selected?.id || ''} />
    {expanded ? <ul id={`${id}-results`} role="listbox" aria-label={t("Matching cities and towns")} className={styles.results}>
      {results.map((place,index) => <li id={`${id}-${index}`} key={place.id} role="option" aria-selected={active === index}
        onPointerDown={event => event.preventDefault()} onClick={() => choose(place)}>
        <strong>{place.name}{place.localName && place.localName !== place.name ? <span> · {place.localName}</span> : null}</strong>
        <small>{place.region}{!selectionRequired?` · ${place.kind} · ${place.latitude.toFixed(3)}, ${place.longitude.toFixed(3)}`:null}</small>
      </li>)}
    </ul> : null}
    <small id={`${id}-status`} role="status">{selected ? selectionRequired ? `${selected.name}, ${selected.region}` : t("Selected: {value1}, {value2}. Area coordinates filled.", { value1: selected.name, value2: selected.region }) : t(status) || t("Search by city or town name, including local names.")}</small>
    <small className={styles.attribution}>{t("Place data ©")}{" "}<a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">{t("OpenStreetMap contributors")}<span className="sr-only"> {" "}{t("(new tab)")}</span></a>.</small>
  </div>;
}
