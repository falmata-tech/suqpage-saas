"use client";

import { List, MapPin } from "lucide-react";
import styles from "./LocationVisibilityChoices.module.css";

type Mode = "area" | "storefront";

export default function LocationVisibilityChoices({
  value,
  name,
  disabled = false,
  t,
  onChange,
}: {
  value: Mode;
  name: string;
  disabled?: boolean;
  t: (key: string) => string;
  onChange: (value: Mode) => void;
}) {
  return (
    <fieldset className={styles.fieldset} disabled={disabled}>
      <legend>{t("Location visibility")}</legend>
      <div className={styles.choices}>
        <label className={styles.choice} data-selected={value === "area"}>
          <input
            type="radio"
            name={name}
            value="area"
            checked={value === "area"}
            onChange={() => onChange("area")}
          />
          <span className={styles.icon}><List aria-hidden="true" /></span>
          <span className={styles.copy}>
            <span className={styles.label}>{t("Show my city")}</span>
            <span className={styles.description}>{t("The map shows your city, not your exact address.")}</span>
          </span>
          <span className={styles.indicator} aria-hidden="true" />
        </label>
        <label className={styles.choice} data-selected={value === "storefront"}>
          <input
            type="radio"
            name={name}
            value="storefront"
            checked={value === "storefront"}
            onChange={() => onChange("storefront")}
          />
          <span className={styles.icon}><MapPin aria-hidden="true" /></span>
          <span className={styles.label}>{t("Show on map")}</span>
          <span className={styles.indicator} aria-hidden="true" />
        </label>
      </div>
    </fieldset>
  );
}
