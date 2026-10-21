"use client";
import { useId } from "react";
import { useUiText } from "@/lib/i18n/ui";
import { ACCENT_PRESETS, storefrontAccent } from "@/lib/storefront-accent";
import styles from "./StorefrontAccentPicker.module.css";
export default function StorefrontAccentPicker({ value, onChange, disabled = false }: { value: string; onChange: (value: string) => void; disabled?: boolean }) {
  const t = useUiText(), id = useId();
  return <fieldset className={styles.picker} disabled={disabled}>
    <legend className="sr-only">{t("Page color")}</legend>
    <div className={styles.choices}>
      <button type="button" aria-pressed={!value} onClick={() => onChange("")}>{t("Default")}</button>
      {ACCENT_PRESETS.map(color => <button key={color} type="button" className={styles.swatch} aria-label={t("Choose color {color}", { color })} aria-pressed={value === color} onClick={() => onChange(color)} style={{ background: color, color: storefrontAccent(color)!.on }}><span aria-hidden="true">{value === color ? "✓" : ""}</span></button>)}
      <label className={styles.custom} htmlFor={id}><input id={id} type="color" value={value || "#087F75"} onChange={event => onChange(event.target.value.toUpperCase())} />{t("Custom color")}</label>
    </div>
  </fieldset>;
}
