"use client";

import { useMemo, useState } from "react";
import {
  saveRevisionDraftAction,
  submitRevisionAction,
} from "@/app/revision-actions";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "@/lib/showroom-bank-release";
import type { ShowroomContentBlock } from "@/lib/showroom-content-blocks";
import type { ShowroomPrimitive } from "@/lib/showroom-composition";
import type { ShowroomSectionV2 } from "@/lib/showroom-composition-v2";
import type { RevisionSnapshotV4 } from "@/lib/revision-v4-domain";

type MediaOption = { value: string; label: string; kind: "image" | "video" };

const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function Field({
  value,
  onChange,
  label,
  max = 300,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
  max?: number;
}) {
  return (
    <div className="field">
      <label>{label}</label>
      <input
        aria-label={label}
        value={value}
        maxLength={max}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

function MediaChoice({
  label,
  value,
  options,
  kind,
  onChange,
}: {
  label: string;
  value: string;
  options: MediaOption[];
  kind: "image" | "video";
  onChange: (value: string) => void;
}) {
  const choices = options.filter((item) => item.kind === kind);
  const visible =
    value && !choices.some((item) => item.value === value)
      ? [{ value, label: kind === "video" ? "Current controlled video" : "Current tenant image", kind }, ...choices]
      : choices;
  return (
    <div className="field">
      <label>{label}</label>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Use the reviewed no-media treatment</option>
        {visible.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
    </div>
  );
}

function itemLines(block: ShowroomContentBlock) {
  if (!("items" in block)) return "";
  return block.items
    .map((item) =>
      "label" in item ? `${item.label}: ${item.value}` : `${item.title}: ${item.body}`,
    )
    .join("\n");
}

function parseItemLines(block: ShowroomContentBlock, value: string) {
  const items = value
    .split("\n")
    .map((line) => {
      const [first, ...rest] = line.split(":");
      return { first: first.trim(), second: rest.join(":").trim() };
    })
    .filter((item) => item.first && item.second)
    .slice(0, block.type === "information" ? 12 : 8);
  if (block.type === "information") {
    return items.map((item) => ({ label: item.first, value: item.second }));
  }
  return items.map((item) => ({ title: item.first, body: item.second }));
}

function mediaValue(block: ShowroomContentBlock, slotKey: string) {
  return block.media.find((media) => media.slotKey === slotKey)?.assetKeys[0] || "";
}

export default function RevisionEditor({
  requestId,
  revisionId,
  initial,
  summary: initialSummary,
  imageOptions,
}: {
  requestId: number;
  revisionId: number;
  initial: RevisionSnapshotV4;
  summary: string;
  imageOptions: MediaOption[];
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [summary, setSummary] = useState(initialSummary);
  const business = snapshot.business;
  const componentById = useMemo(
    () =>
      new Map(
        SHOWROOM_COMPONENT_BANK_LATEST.components.map((component) => [
          component.id,
          component,
        ]),
      ),
    [],
  );

  const setBusiness = (key: keyof typeof business, value: string) =>
    setSnapshot((current) => ({
      ...current,
      business: { ...current.business, [key]: value },
    }));
  const updateCategory = (index: number, patch: Record<string, unknown>) =>
    setSnapshot((current) => ({
      ...current,
      categories: current.categories.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  const removeCategory = (index: number) => {
    const removed = snapshot.categories[index].key;
    setSnapshot((current) => ({
      ...current,
      categories: current.categories.filter((_, i) => i !== index),
      products: current.products.map((item) =>
        item.categoryKey === removed ? { ...item, categoryKey: null } : item,
      ),
    }));
  };
  const updateProduct = (index: number, patch: Record<string, unknown>) =>
    setSnapshot((current) => ({
      ...current,
      products: current.products.map((item, itemIndex) =>
        itemIndex === index ? { ...item, ...patch } : item,
      ),
    }));
  const updateSection = (index: number, patch: Partial<ShowroomSectionV2>) =>
    setSnapshot((current) => ({
      ...current,
      designManifest: {
        ...current.designManifest,
        sections: current.designManifest.sections.map((section, itemIndex) =>
          itemIndex === index ? { ...section, ...patch } : section,
        ),
      },
    }));
  const updateSectionProperty = (
    index: number,
    key: string,
    value: ShowroomPrimitive,
  ) =>
    updateSection(index, {
      properties: {
        ...snapshot.designManifest.sections[index].properties,
        [key]: value,
      },
    });
  const updateBlock = (key: string, patch: Partial<ShowroomContentBlock>) =>
    setSnapshot((current) => ({
      ...current,
      contentBlocks: {
        ...current.contentBlocks,
        blocks: current.contentBlocks.blocks.map((block) =>
          block.key === key ? ({ ...block, ...patch } as ShowroomContentBlock) : block,
        ),
      },
    }));
  const setBlockMedia = (block: ShowroomContentBlock, slotKey: string, value: string) => {
    const nextMedia = block.media.filter((media) => media.slotKey !== slotKey);
    if (value) {
      nextMedia.push({
        slotKey,
        assetKeys: [value],
        altText: block.title,
        caption: "",
      });
    }
    updateBlock(block.key, { media: nextMedia } as Partial<ShowroomContentBlock>);
  };

  return (
    <div className="revision-workspace">
      <form action={saveRevisionDraftAction} className="form-stack">
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="revisionId" value={revisionId} />
        <input type="hidden" name="snapshot" value={JSON.stringify(snapshot)} />

        <section className="panel">
          <h2>Revision summary</h2>
          <div className="field">
            <label htmlFor="revision-summary">What changed for the client?</label>
            <textarea
              id="revision-summary"
              name="summary"
              value={summary}
              maxLength={500}
              onChange={(event) => setSummary(event.target.value)}
              placeholder="A short, client-readable summary of this preview."
            />
          </div>
        </section>

        <section className="panel">
          <h2>Business and showroom</h2>
          <div className="form-grid">
            <Field value={business.name} onChange={(value) => setBusiness("name", value)} label="Business name" max={100} />
            <div className="field">
              <label>Token system</label>
              <select
                aria-label="Token system"
                value={snapshot.designManifest.tokenPack}
                onChange={(event) =>
                  setSnapshot((current) => ({
                    ...current,
                    designManifest: {
                      ...current.designManifest,
                      tokenPack: event.target.value,
                    },
                  }))
                }
              >
                {SHOWROOM_COMPONENT_BANK_LATEST.tokenPacks.map((token) => (
                  <option key={token.id} value={token.id}>
                    {token.name}
                  </option>
                ))}
              </select>
            </div>
            <Field value={business.tagline} onChange={(value) => setBusiness("tagline", value)} label="Tagline" max={180} />
            <Field value={business.heroTitle} onChange={(value) => setBusiness("heroTitle", value)} label="Hero title" max={180} />
            <div className="field full">
              <label>Description</label>
              <textarea aria-label="Business description" value={business.description} maxLength={1200} onChange={(event) => setBusiness("description", event.target.value)} />
            </div>
            <div className="field full">
              <label>Hero subtitle</label>
              <textarea aria-label="Hero subtitle" value={business.heroSubtitle} maxLength={300} onChange={(event) => setBusiness("heroSubtitle", event.target.value)} />
            </div>
            <MediaChoice label="Logo image" value={business.logoRef} options={imageOptions} kind="image" onChange={(value) => setBusiness("logoRef", value)} />
            <MediaChoice label="Hero image" value={business.heroImageRef} options={imageOptions} kind="image" onChange={(value) => setBusiness("heroImageRef", value)} />
            <Field value={business.contactEmail} onChange={(value) => setBusiness("contactEmail", value)} label="Notification email" max={160} />
            <Field value={business.whatsapp} onChange={(value) => setBusiness("whatsapp", value)} label="WhatsApp" max={40} />
            <Field value={business.telegram} onChange={(value) => setBusiness("telegram", value)} label="Telegram" max={80} />
            <Field value={business.tiktok} onChange={(value) => setBusiness("tiktok", value)} label="TikTok" max={80} />
            <Field value={business.siteTitle} onChange={(value) => setBusiness("siteTitle", value)} label="Page title" max={120} />
            <div className="field full">
              <label>Search and sharing description</label>
              <textarea aria-label="Search and sharing description" value={business.siteDescription} maxLength={240} onChange={(event) => setBusiness("siteDescription", event.target.value)} />
            </div>
            <MediaChoice label="Browser icon" value={business.faviconRef} options={imageOptions} kind="image" onChange={(value) => setBusiness("faviconRef", value)} />
          </div>
        </section>

        <section className="panel">
          <h2>Focused design controls</h2>
          <div className="form-grid">
            {snapshot.designManifest.sections.map((section, index) => {
              const block = section.contentBlockKey
                ? snapshot.contentBlocks.blocks.find((entry) => entry.key === section.contentBlockKey)
                : undefined;
              const current = componentById.get(section.component);
              const compatible = SHOWROOM_COMPONENT_BANK_LATEST.components.filter((component) => {
                if (component.slot !== current?.slot) return false;
                if (!block) return component.acceptedContentTypes.length === 0;
                return component.acceptedContentTypes.includes(block.type);
              });
              return (
                <div className="revision-item form-grid" key={section.key}>
                  <div className="field">
                    <label>{section.key} component</label>
                    <select
                      aria-label={`${section.key} component`}
                      value={section.component}
                      onChange={(event) => updateSection(index, { component: event.target.value })}
                    >
                      {compatible.map((component) => (
                        <option key={component.id} value={component.id}>
                          {component.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  {current?.properties.some((property) => property.key === "motion_intensity") ? (
                    <div className="field">
                      <label>{section.key} motion</label>
                      <select
                        aria-label={`${section.key} motion`}
                        value={String(section.properties.motion_intensity || "balanced")}
                        onChange={(event) => updateSectionProperty(index, "motion_intensity", event.target.value)}
                      >
                        {["quiet", "balanced", "expressive"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </div>
                  ) : null}
                  {current?.properties.some((property) => property.key === "decorative_depth") ? (
                    <div className="field">
                      <label>{section.key} decoration</label>
                      <select
                        aria-label={`${section.key} decoration`}
                        value={String(section.properties.decorative_depth || "subtle")}
                        onChange={(event) => updateSectionProperty(index, "decorative_depth", event.target.value)}
                      >
                        {["clean", "subtle", "signature"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </div>
                  ) : null}
                  {current?.slot === "hero" || current?.slot === "content" ? (
                    <div className="field">
                      <label>{section.key} media treatment</label>
                      <select
                        aria-label={`${section.key} media treatment`}
                        value={section.mediaIntegration || "natural"}
                        onChange={(event) => updateSection(index, {
                          mediaIntegration: event.target.value as typeof section.mediaIntegration,
                        })}
                      >
                        {[
                          ["natural", "Natural"],
                          ["surface_blend", "Full-section surface blend"],
                          ["split_bleed", "Split bleed"],
                          ["edge_fade", "Directional edge fade"],
                          ["editorial_overlap", "Editorial overlap"],
                          ["product_stage", "Product stage"],
                          ["hidden", "Hide media"],
                        ].map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </div>
                  ) : null}
                  {typeof section.properties.height === "number" ? (
                    <div className="field">
                      <label>{section.key} height</label>
                      <input
                        aria-label={`${section.key} height`}
                        type="number"
                        min={320}
                        max={760}
                        value={section.properties.height}
                        onChange={(event) => updateSectionProperty(index, "height", Number(event.target.value))}
                      />
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="panel">
          <h2>Focused content blocks</h2>
          {snapshot.contentBlocks.blocks.map((block) => (
            <div className="revision-item form-grid" key={block.key}>
              <Field value={block.kicker} onChange={(value) => updateBlock(block.key, { kicker: value })} label={`${block.key} kicker`} max={100} />
              <Field value={block.title} onChange={(value) => updateBlock(block.key, { title: value })} label={`${block.key} title`} max={180} />
              <div className="field full">
                <label>{block.key} body</label>
                <textarea aria-label={`${block.key} body`} value={block.body} maxLength={3000} onChange={(event) => updateBlock(block.key, { body: event.target.value })} />
              </div>
              {"quote" in block ? <Field value={block.quote} onChange={(value) => updateBlock(block.key, { quote: value } as Partial<ShowroomContentBlock>)} label={`${block.key} quote`} max={500} /> : null}
              {"actionLabel" in block ? <Field value={block.actionLabel} onChange={(value) => updateBlock(block.key, { actionLabel: value } as Partial<ShowroomContentBlock>)} label={`${block.key} action label`} max={80} /> : null}
              {"transcript" in block ? (
                <div className="field full">
                  <label>{block.key} transcript</label>
                  <textarea aria-label={`${block.key} transcript`} value={block.transcript} maxLength={4000} onChange={(event) => updateBlock(block.key, { transcript: event.target.value } as Partial<ShowroomContentBlock>)} />
                </div>
              ) : null}
              {"items" in block ? (
                <div className="field full">
                  <label>{block.key} items</label>
                  <textarea
                    aria-label={`${block.key} items`}
                    value={itemLines(block)}
                    onChange={(event) => updateBlock(block.key, { items: parseItemLines(block, event.target.value) } as Partial<ShowroomContentBlock>)}
                  />
                  <small>One item per line: Label: value.</small>
                </div>
              ) : null}
              {block.type === "hero" ? (
                <MediaChoice label={`${block.key} hero media`} value={mediaValue(block, "hero_image")} options={imageOptions} kind="image" onChange={(value) => setBlockMedia(block, "hero_image", value)} />
              ) : null}
              {["story", "highlights", "information"].includes(block.type) ? (
                <MediaChoice label={`${block.key} story media`} value={mediaValue(block, "story_image")} options={imageOptions} kind="image" onChange={(value) => setBlockMedia(block, "story_image", value)} />
              ) : null}
              {block.type === "video" ? (
                <MediaChoice label={`${block.key} controlled video`} value={mediaValue(block, "video")} options={imageOptions} kind="video" onChange={(value) => setBlockMedia(block, "video", value)} />
              ) : null}
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="dashboard-head">
            <div><h2>Categories</h2><p>Categories drive showroom filters.</p></div>
            <button type="button" className="small-btn" onClick={() => setSnapshot((current) => ({ ...current, categories: [...current.categories, { key: uid("category"), collectionKey: null, name: "New category", slug: "", sortOrder: current.categories.length, active: true }] }))}>Add category</button>
          </div>
          {snapshot.categories.map((item, index) => (
            <div className="revision-item form-grid" key={item.key}>
              <Field value={item.name} onChange={(value) => updateCategory(index, { name: value })} label={`Category ${index + 1} name`} max={100} />
              <Field value={item.slug} onChange={(value) => updateCategory(index, { slug: value })} label={`Category ${index + 1} slug`} max={80} />
              <div className="field"><label>Sort order</label><input aria-label={`Category ${index + 1} sort order`} type="number" value={item.sortOrder} onChange={(event) => updateCategory(index, { sortOrder: Number(event.target.value) })} /></div>
              <label className="check-field"><input type="checkbox" checked={item.active} onChange={(event) => updateCategory(index, { active: event.target.checked })} /> Active</label>
              <button type="button" className="small-btn danger" onClick={() => removeCategory(index)}>Remove category</button>
            </div>
          ))}
        </section>

        <section className="panel">
          <div className="dashboard-head">
            <div><h2>Products &amp; capabilities</h2><p>Structured offerings remain private until this revision is approved and published.</p></div>
            <button type="button" className="small-btn" onClick={() => setSnapshot((current) => ({ ...current, products: [...current.products, { key: uid("product"), collectionKey: null, categoryKey: null, name: "New offering", slug: "", eyebrow: "", description: "", imageRef: "", availability: "available", offeringKind: "standard_product", quantityMode: "required", capacitySummary: "", minimumOrderSummary: "", leadTimeSummary: "", published: true, sortOrder: current.products.length, optionGroups: [] }] }))}>Add offering</button>
          </div>
          {snapshot.products.map((item, index) => (
            <div className="revision-item form-grid" key={item.key}>
              <Field value={item.name} onChange={(value) => updateProduct(index, { name: value })} label={`Product ${index + 1} name`} max={140} />
              <Field value={item.slug} onChange={(value) => updateProduct(index, { slug: value })} label={`Product ${index + 1} slug`} max={80} />
              <Field value={item.eyebrow} onChange={(value) => updateProduct(index, { eyebrow: value })} label={`Product ${index + 1} short label`} max={100} />
              <div className="field"><label>Category</label><select aria-label={`Product ${index + 1} category`} value={item.categoryKey || ""} onChange={(event) => updateProduct(index, { categoryKey: event.target.value || null })}><option value="">Unassigned</option>{snapshot.categories.map((entry) => <option key={entry.key} value={entry.key}>{entry.name}</option>)}</select></div>
              <div className="field"><label>Availability</label><select aria-label={`Product ${index + 1} availability`} value={item.availability} onChange={(event) => updateProduct(index, { availability: event.target.value })}>{["available", "limited", "unavailable", "coming_soon"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <div className="field"><label>Offering type</label><select aria-label={`Product ${index + 1} offering type`} value={item.offeringKind} onChange={(event) => updateProduct(index, { offeringKind: event.target.value })}><option value="standard_product">Standard product</option><option value="made_to_order">Made to order</option><option value="manufacturing_capability">Manufacturing capability</option><option value="production_supply">Production supply</option></select></div>
              <div className="field"><label>Desired quantity</label><select aria-label={`Product ${index + 1} desired quantity policy`} value={item.quantityMode} onChange={(event) => updateProduct(index, { quantityMode: event.target.value })}><option value="required">Required</option><option value="optional">Optional</option></select></div>
              <div className="field"><label>Sort order</label><input aria-label={`Product ${index + 1} sort order`} type="number" value={item.sortOrder} onChange={(event) => updateProduct(index, { sortOrder: Number(event.target.value) })} /></div>
              <MediaChoice label={`Product ${index + 1} image`} value={item.imageRef} options={imageOptions} kind="image" onChange={(value) => updateProduct(index, { imageRef: value })} />
              <label className="check-field"><input type="checkbox" checked={item.published} onChange={(event) => updateProduct(index, { published: event.target.checked })} /> Show in showroom</label>
              <div className="field full"><label>Description</label><textarea aria-label={`Product ${index + 1} description`} value={item.description} maxLength={3000} onChange={(event) => updateProduct(index, { description: event.target.value })} /></div>
              <Field value={item.capacitySummary} onChange={(value) => updateProduct(index, { capacitySummary: value })} label={`Product ${index + 1} capacity`} max={180} />
              <Field value={item.minimumOrderSummary} onChange={(value) => updateProduct(index, { minimumOrderSummary: value })} label={`Product ${index + 1} minimum order`} max={140} />
              <Field value={item.leadTimeSummary} onChange={(value) => updateProduct(index, { leadTimeSummary: value })} label={`Product ${index + 1} lead time`} max={140} />
              <div className="field full">
                <label>Option groups</label>
                <textarea
                  aria-label={`Product ${index + 1} option groups`}
                  value={item.optionGroups.map((group) => `${group.name}: ${group.values.join(", ")}`).join("\n")}
                  placeholder={"Color: Black, White\nSize: Small, Medium"}
                  onChange={(event) => updateProduct(index, { optionGroups: event.target.value.split("\n").map((line) => { const [name, ...rest] = line.split(":"); return { name: name.trim(), values: rest.join(":").split(",").map((value) => value.trim()).filter(Boolean) }; }).filter((group) => group.name && group.values.length).slice(0, 4) })}
                />
                <small>One group per line: Name: value, value. Up to four groups.</small>
              </div>
              <button type="button" className="small-btn danger" onClick={() => setSnapshot((current) => ({ ...current, products: current.products.filter((_, i) => i !== index) }))}>Remove offering</button>
            </div>
          ))}
        </section>

        <div className="sticky-actions">
          <button className="btn brand">Save private draft</button>
        </div>
      </form>

      <form action={submitRevisionAction} className="panel review-submit">
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="revisionId" value={revisionId} />
        <div>
          <h2>Ready for the client?</h2>
          <p>Save first. Sending freezes this numbered revision and makes its private preview actionable.</p>
        </div>
        <button className="btn">Send revision for client review</button>
      </form>
    </div>
  );
}
