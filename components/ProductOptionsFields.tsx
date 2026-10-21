"use client";
import { useUiText } from "@/lib/i18n/ui";


import { useState } from "react";
import type { ProductOptionInput } from "@/lib/product-upkeep-domain";

export default function ProductOptionsFields({ initial }: { initial: ProductOptionInput[] }) {
  const t = useUiText();
  const [groups, setGroups] = useState(initial.map((group, id) => ({ id, name: group.name, choices: group.values.join("\n") })));
  const [nextId, setNextId] = useState(initial.length);
  const update = (id: number, field: "name" | "choices", value: string) => setGroups(rows => rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  return <fieldset className="field full product-options-editor">
    <legend>{t("Product choices")}{" "}<span className="optional">{t("(optional)")}</span></legend>
    <p>{t("Add options such as color, size or material. Buyers choose these when they inquire.")}</p>
    <input type="hidden" name="optionGroups" value={JSON.stringify(groups.map(group => ({ name: group.name, values: group.choices.split(/\r?\n/).map(value => value.trim()).filter(Boolean) })))} />
    {groups.map((group, index) => <div className="product-option-editor" key={group.id}>
      <div className="field"><label htmlFor={`option-name-${group.id}`}>{t("Option")}{" "}{index + 1} {" "}{t("name")}</label><input id={`option-name-${group.id}`} value={group.name} required maxLength={80} onChange={event => update(group.id, "name", event.target.value)} placeholder={t("e.g. Color")} /></div>
      <div className="field"><label htmlFor={`option-values-${group.id}`}>{t("Option")}{" "}{index + 1} {" "}{t("choices")}</label><textarea id={`option-values-${group.id}`} value={group.choices} required maxLength={5050} rows={3} onChange={event => update(group.id, "choices", event.target.value)} placeholder={t("One choice per line")} /></div>
      <button type="button" className="small-btn" aria-label={t("Remove option {value1}", { value1: index + 1 })} onClick={() => setGroups(rows => rows.filter(row => row.id !== group.id))}>{t("Remove option")}</button>
    </div>)}
    {groups.length < 4 ? <button type="button" className="small-btn" onClick={() => { setGroups(rows => [...rows, { id: nextId, name: "", choices: "" }]); setNextId(nextId + 1); }}>{t("Add option")}</button> : <small>{t("Four option groups added.")}</small>}
  </fieldset>;
}
