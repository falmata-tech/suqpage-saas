"use client";

import { useState } from "react";
import type { ProductOptionInput } from "@/lib/product-upkeep-domain";

export default function ProductOptionsFields({ initial }: { initial: ProductOptionInput[] }) {
  const [groups, setGroups] = useState(initial.map((group, id) => ({ id, name: group.name, choices: group.values.join("\n") })));
  const [nextId, setNextId] = useState(initial.length);
  const update = (id: number, field: "name" | "choices", value: string) => setGroups(rows => rows.map(row => row.id === id ? { ...row, [field]: value } : row));
  return <fieldset className="field full product-options-editor">
    <legend>Product choices <span className="optional">(optional)</span></legend>
    <p>Add options such as color, size or material. Buyers choose these when they inquire.</p>
    <input type="hidden" name="optionGroups" value={JSON.stringify(groups.map(group => ({ name: group.name, values: group.choices.split(/\r?\n/).map(value => value.trim()).filter(Boolean) })))} />
    {groups.map((group, index) => <div className="product-option-editor" key={group.id}>
      <div className="field"><label htmlFor={`option-name-${group.id}`}>Option {index + 1} name</label><input id={`option-name-${group.id}`} value={group.name} required maxLength={80} onChange={event => update(group.id, "name", event.target.value)} placeholder="e.g. Color" /></div>
      <div className="field"><label htmlFor={`option-values-${group.id}`}>Option {index + 1} choices</label><textarea id={`option-values-${group.id}`} value={group.choices} required maxLength={5050} rows={3} onChange={event => update(group.id, "choices", event.target.value)} placeholder={"One choice per line\nBlue\nBlack"} /></div>
      <button type="button" className="small-btn" aria-label={`Remove option ${index + 1}`} onClick={() => setGroups(rows => rows.filter(row => row.id !== group.id))}>Remove option</button>
    </div>)}
    {groups.length < 4 ? <button type="button" className="small-btn" onClick={() => { setGroups(rows => [...rows, { id: nextId, name: "", choices: "" }]); setNextId(nextId + 1); }}>Add option</button> : <small>Four option groups added.</small>}
  </fieldset>;
}
