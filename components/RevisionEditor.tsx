"use client";

import { Eye, Monitor, Smartphone } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import {
  saveRevisionDraftAction,
  submitRevisionAction,
} from "@/app/revision-actions";
import { SHOWROOM_COMPONENT_BANK_LATEST } from "@/lib/showroom-bank-release";
import type { ShowroomContentBlock } from "@/lib/showroom-content-blocks";
import type { ShowroomPrimitive } from "@/lib/showroom-composition";
import {
  SHOWROOM_CUSTOM_PALETTE_KEYS,
  SHOWROOM_SECTION_SURFACE_ROLES,
  showroomColorContrast,
  type ShowroomSectionV2,
} from "@/lib/showroom-composition-v2";
import {
  SHOWROOM_DESIGN_SYSTEMS,
  type ShowroomColorPalette,
} from "@/lib/showroom-design-systems";
import {
  parseRevisionSnapshotV4,
  type RevisionSnapshotV4,
} from "@/lib/revision-v4-domain";
import { PRODUCT_DETAIL_PATTERN_DEFINITIONS } from "@/lib/product-detail-patterns";
import { snapshotToCatalog } from "@/lib/revision-domain";
import type { Business } from "@/lib/types";
import ShowroomApp from "@/components/showroom/ShowroomApp";

type MediaOption = { value: string; label: string; kind: "image" | "video" };
type AdmittedMedia = MediaOption & { previewUrl?: string };
type EditorArea = "settings" | "design" | "content" | "offerings";

const EDITOR_AREAS: Array<{ key: EditorArea; label: string }> = [
  { key: "settings", label: "Design foundation" },
  { key: "design", label: "Layout and style" },
  { key: "content", label: "Page content" },
  { key: "offerings", label: "Offerings" },
];
const EDITOR_PAGE_SIZE = 8;

const uid = (prefix: string) => `${prefix}-${crypto.randomUUID()}`;

function readableForeground(background: string, current: string) {
  if (showroomColorContrast(current, background) >= 4.5) return current;
  return ["#111111", "#ffffff"].sort(
    (first, second) =>
      showroomColorContrast(second, background) -
      showroomColorContrast(first, background),
  )[0];
}

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

const paletteLabels: Record<keyof ShowroomColorPalette, string> = {
  canvas: "Page canvas",
  surface: "Raised surface",
  layer: "Alternate layer",
  text: "Primary text",
  textMuted: "Muted text",
  primary: "Primary accent",
  primarySoft: "Primary soft surface",
  secondary: "Secondary accent",
  secondarySoft: "Secondary soft surface",
  onSecondary: "Text on secondary",
  strong: "Strong section",
  onStrong: "Text on strong",
  inverse: "Inverse section",
  onInverse: "Text on inverse",
  border: "Borders",
};

function ColorField({
  colorKey,
  value,
  onChange,
}: {
  colorKey: keyof ShowroomColorPalette;
  value: string;
  onChange: (value: string) => void;
}) {
  const label = paletteLabels[colorKey];
  return (
    <div className="field">
      <label htmlFor={`palette-${colorKey}`}>{label}</label>
      <div className="color-field">
        <input
          id={`palette-${colorKey}`}
          type="color"
          value={/^#[0-9a-fA-F]{6}$/.test(value) ? value : "#000000"}
          aria-label={`${label} swatch`}
          onChange={(event) => onChange(event.target.value)}
        />
        <input
          type="text"
          aria-label={`${label} hex value`}
          value={value}
          maxLength={7}
          pattern="^#[0-9a-fA-F]{6}$"
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
    </div>
  );
}

function MediaChoice({
  label,
  value,
  options,
  kind,
  requestId,
  revisionId,
  onChange,
  onAdmitted,
}: {
  label: string;
  value: string;
  options: MediaOption[];
  kind: "image" | "video";
  requestId: number;
  revisionId: number;
  onChange: (value: string) => void;
  onAdmitted: (media: AdmittedMedia) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const choices = options.filter((item) => item.kind === kind);
  const visible =
    value && !choices.some((item) => item.value === value)
      ? [{ value, label: kind === "video" ? "Current approved video" : "Current showroom image", kind }, ...choices]
      : choices;
  const previewUrl = value.startsWith("request-attachment:")
    ? `/api/requests/${requestId}/attachments/${value.split(":")[1]}`
    : kind === "image" ? value : "";
  const admit = async (form: FormData) => {
    setBusy(true);
    setError("");
    try {
      form.set("label", label);
      const response = await fetch(`/api/requests/${requestId}/revisions/${revisionId}/media`, {
        method: "POST",
        credentials: "same-origin",
        body: form,
      });
      const result = await response.json() as { error?: string; ref?: string; previewUrl?: string; label?: string; kind?: "image" | "youtube" };
      if (!response.ok || !result.ref) throw new Error(result.error || "The media could not be added.");
      const admitted: AdmittedMedia = {
        value: result.ref,
        label: `${result.kind === "youtube" ? "Added" : "Uploaded"} · ${result.label || label}`,
        kind: result.kind === "youtube" ? "video" : "image",
        previewUrl: result.previewUrl,
      };
      onAdmitted(admitted);
      onChange(admitted.value);
      if (kind === "video") setYoutubeUrl("");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "The media could not be added.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="field editor-media-field">
      <label>{label}</label>
      {previewUrl ? <img className="editor-media-thumbnail" src={previewUrl} alt={`${label} preview`} /> : null}
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">{kind === "video" ? "No video" : "Use this section's image-free design"}</option>
        {visible.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      {kind === "image" ? <label className="editor-inline-upload"><span>{busy ? "Uploading image..." : "Upload replacement image"}</span><input type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} onChange={(event) => { const file = event.target.files?.[0]; if (!file) return; const form = new FormData(); form.set("kind", "image"); form.set("file", file); void admit(form); event.currentTarget.value = ""; }}/></label> : <div className="editor-youtube-upload"><input type="url" aria-label={`${label} YouTube URL`} value={youtubeUrl} disabled={busy} placeholder="https://www.youtube.com/watch?v=..." onChange={(event) => setYoutubeUrl(event.target.value)}/><button type="button" className="small-btn" disabled={busy || !youtubeUrl.trim()} onClick={() => { const form = new FormData(); form.set("kind", "youtube"); form.set("url", youtubeUrl); void admit(form); }}>{busy ? "Adding..." : "Add YouTube video"}</button></div>}
      {error ? <small className="field-error" role="alert">{error}</small> : <small>{kind === "image" ? "The selected file appears in this draft immediately and becomes public only after approved publication." : "YouTube links are validated and embedded with the controlled privacy-enhanced player."}</small>}
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
  previewBusiness,
  initialArea,
}: {
  requestId: number;
  revisionId: number;
  initial: RevisionSnapshotV4;
  summary: string;
  imageOptions: MediaOption[];
  previewBusiness: Business;
  initialArea: EditorArea;
}) {
  const [snapshot, setSnapshot] = useState(initial);
  const [summary, setSummary] = useState(initialSummary);
  const [activeArea, setActiveArea] = useState<EditorArea>(initialArea);
  const [categoryPage, setCategoryPage] = useState(1);
  const [productPage, setProductPage] = useState(1);
  const [mediaOptions, setMediaOptions] = useState(imageOptions);
  const [previewViewport, setPreviewViewport] = useState<"desktop" | "phone">("desktop");
  const previewValidation = useMemo(() => {
    try {
      return {
        snapshot: parseRevisionSnapshotV4(
          snapshot,
          SHOWROOM_COMPONENT_BANK_LATEST,
        ),
        error: "",
      };
    } catch (error) {
      return {
        snapshot: null,
        error:
          error instanceof Error
            ? error.message
            : "Complete the palette correction to update the preview.",
      };
    }
  }, [snapshot]);
  const [lastValidPreview, setLastValidPreview] = useState(initial);
  useEffect(() => {
    if (previewValidation.snapshot) setLastValidPreview(previewValidation.snapshot);
  }, [previewValidation.snapshot]);
  const deferredSnapshot = useDeferredValue(
    previewValidation.snapshot || lastValidPreview,
  );
  const business = snapshot.business;
  const foundation =
    SHOWROOM_DESIGN_SYSTEMS[snapshot.designManifest.tokenPack] ||
    Object.values(SHOWROOM_DESIGN_SYSTEMS)[0];
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
  const previewCatalog = useMemo(
    () => snapshotToCatalog(
      deferredSnapshot,
      previewBusiness,
      (ref) => ref.startsWith("request-attachment:")
        ? `/api/requests/${requestId}/attachments/${ref.split(":")[1]}`
        : ref,
    ),
    [deferredSnapshot, previewBusiness, requestId],
  );
  const addMediaOption = (media: AdmittedMedia) => setMediaOptions((current) => [
    { value: media.value, label: media.label, kind: media.kind },
    ...current.filter((item) => item.value !== media.value),
  ]);

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
  const setCustomPalette = (palette?: ShowroomColorPalette) =>
    setSnapshot((current) => {
      const { customPalette: _currentPalette, ...manifest } =
        current.designManifest;
      return {
        ...current,
        designManifest: {
          ...manifest,
          ...(palette ? { customPalette: palette } : {}),
        },
      };
    });
  const updatePaletteColor = (
    key: keyof ShowroomColorPalette,
    value: string,
  ) => {
    setSnapshot((current) => {
      const currentFoundation =
        SHOWROOM_DESIGN_SYSTEMS[current.designManifest.tokenPack] ||
        Object.values(SHOWROOM_DESIGN_SYSTEMS)[0];
      const palette = {
        ...(current.designManifest.customPalette || currentFoundation.colors),
        [key]: value,
      };
      if (key === "secondary" && /^#[0-9a-fA-F]{6}$/.test(value)) {
        palette.onSecondary = readableForeground(value, palette.onSecondary);
      }
      if (key === "strong" && /^#[0-9a-fA-F]{6}$/.test(value)) {
        palette.onStrong = readableForeground(value, palette.onStrong);
      }
      if (key === "inverse" && /^#[0-9a-fA-F]{6}$/.test(value)) {
        palette.onInverse = readableForeground(value, palette.onInverse);
      }
      return {
        ...current,
        designManifest: { ...current.designManifest, customPalette: palette },
      };
    });
  };
  const updateBlock = (key: string, patch: Partial<ShowroomContentBlock>) =>
    setSnapshot((current) => {
      let nextBusiness = current.business;
      const blocks = current.contentBlocks.blocks.map((block) => {
        if (block.key !== key) return block;
        const nextBlock = { ...block, ...patch } as ShowroomContentBlock;
        if (nextBlock.type === "hero") {
          nextBusiness = {
            ...nextBusiness,
            tagline: nextBlock.kicker,
            heroTitle: nextBlock.title,
            heroSubtitle: nextBlock.body,
            heroImageRef: mediaValue(nextBlock, "hero_image"),
          };
        }
        return nextBlock;
      });
      return {
        ...current,
        business: nextBusiness,
        contentBlocks: { ...current.contentBlocks, blocks },
      };
    });
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
  const categoryPages = Math.max(1, Math.ceil(snapshot.categories.length / EDITOR_PAGE_SIZE));
  const productPages = Math.max(1, Math.ceil(snapshot.products.length / EDITOR_PAGE_SIZE));
  useEffect(() => setCategoryPage((page) => Math.min(page, categoryPages)), [categoryPages]);
  useEffect(() => setProductPage((page) => Math.min(page, productPages)), [productPages]);

  return (
    <div className="revision-workspace">
      <form action={saveRevisionDraftAction} className="form-stack">
        <input type="hidden" name="requestId" value={requestId} />
        <input type="hidden" name="revisionId" value={revisionId} />
        <input type="hidden" name="snapshot" value={JSON.stringify(snapshot)} />

        <nav className="editor-area-tabs" aria-label="Showroom editing areas">
          {EDITOR_AREAS.map((area) => (
            <button
              type="button"
              key={area.key}
              className={activeArea === area.key ? "active" : ""}
              aria-pressed={activeArea === area.key}
              onClick={() => setActiveArea(area.key)}
            >
              {area.label}
            </button>
          ))}
        </nav>

        <section className="panel" hidden={activeArea !== "settings"}>
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

        <section className="panel" hidden={activeArea !== "settings"}>
          <h2>Design foundation</h2>
          <div className="form-grid">
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
          </div>
          <div className="revision-item">
            <div className="field">
              <label>Product detail pattern</label>
              <select
                aria-label="Product detail pattern"
                value={snapshot.designManifest.productDetailPattern}
                onChange={(event) => setSnapshot((current) => ({ ...current, designManifest: { ...current.designManifest, productDetailPattern: event.target.value as RevisionSnapshotV4["designManifest"]["productDetailPattern"] } }))}
              >
                {PRODUCT_DETAIL_PATTERN_DEFINITIONS.map((pattern) => <option key={pattern.id} value={pattern.id}>{pattern.name} - {pattern.density}</option>)}
              </select>
            </div>
            <label className="check-field">
              <input
                type="checkbox"
                checked={Boolean(snapshot.designManifest.customPalette)}
                onChange={(event) =>
                  setCustomPalette(
                    event.target.checked ? { ...foundation.colors } : undefined,
                  )
                }
              />
              Use a custom showroom palette
            </label>
            {snapshot.designManifest.customPalette ? (
              <div className="form-grid">
                {SHOWROOM_CUSTOM_PALETTE_KEYS.map((key) => (
                  <ColorField
                    key={key}
                    colorKey={key}
                    value={snapshot.designManifest.customPalette![key]}
                    onChange={(value) => updatePaletteColor(key, value)}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="panel" hidden={activeArea !== "design"}>
          <h2>Layout and style</h2>
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
              const sectionName = block?.title || current?.slot || section.key;
              return (
                <details className="revision-item editor-disclosure" key={section.key} open={index === 0}>
                  <summary><span><strong>{sectionName}</strong><small>{current?.name || "Section design"}</small></span><b>Edit</b></summary>
                  <div className="form-grid editor-disclosure-body">
                  <div className="field">
                    <label>Section design</label>
                    <select
                      aria-label={`${sectionName} component`}
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
                      <label>Motion</label>
                      <select
                        aria-label={`${sectionName} motion`}
                        value={String(section.properties.motion_intensity || "balanced")}
                        onChange={(event) => updateSectionProperty(index, "motion_intensity", event.target.value)}
                      >
                        {["quiet", "balanced", "expressive"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </div>
                  ) : null}
                  {current?.properties.some((property) => property.key === "decorative_depth") ? (
                    <div className="field">
                      <label>Visual detail</label>
                      <select
                        aria-label={`${sectionName} decoration`}
                        value={String(section.properties.decorative_depth || "subtle")}
                        onChange={(event) => updateSectionProperty(index, "decorative_depth", event.target.value)}
                      >
                        {["clean", "subtle", "signature"].map((value) => <option key={value}>{value}</option>)}
                      </select>
                    </div>
                  ) : null}
                  {current?.slot === "hero" || current?.slot === "content" ? (
                    <div className="field">
                      <label>Image treatment</label>
                      <select
                        aria-label={`${sectionName} media treatment`}
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
                  <div className="field">
                    <label>Section color role</label>
                    <select
                      aria-label={`${sectionName} surface`}
                      value={section.surfaceRole || "canvas"}
                      onChange={(event) =>
                        updateSection(index, {
                          surfaceRole:
                            event.target.value as typeof section.surfaceRole,
                        })
                      }
                    >
                      {SHOWROOM_SECTION_SURFACE_ROLES.map((value) => (
                        <option key={value} value={value}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  {typeof section.properties.height === "number" ? (
                    <div className="field">
                      <label>Section height</label>
                      <input
                        aria-label={`${sectionName} height`}
                        type="number"
                        min={320}
                        max={760}
                        value={section.properties.height}
                        onChange={(event) => updateSectionProperty(index, "height", Number(event.target.value))}
                      />
                    </div>
                  ) : null}
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        <section className="panel" hidden={activeArea !== "content"}>
          <h2>Page content</h2>
          <div className="field full">
            <label>Public business summary</label>
            <textarea aria-label="Public business summary" value={business.description} maxLength={1200} onChange={(event) => setBusiness("description", event.target.value)} />
          </div>
          {snapshot.contentBlocks.blocks.map((block, index) => {
            const sectionName = block.title || `${block.type} section`;
            const sectionTypeLabel = block.type === "highlights"
              ? "story and process"
              : block.type.replaceAll("_", " ");
            return <details className="revision-item editor-disclosure" key={block.key} open={index === 0}>
              <summary><span><strong>{sectionName}</strong><small>{sectionTypeLabel}</small></span><b>Edit</b></summary>
              <div className="form-grid editor-disclosure-body">
              <Field value={block.kicker} onChange={(value) => updateBlock(block.key, { kicker: value })} label={`${sectionName} short label`} max={100} />
              <Field value={block.title} onChange={(value) => updateBlock(block.key, { title: value })} label={`${sectionName} heading`} max={180} />
              <div className="field full">
                <label>Body copy</label>
                <textarea aria-label={`${sectionName} body`} value={block.body} maxLength={3000} onChange={(event) => updateBlock(block.key, { body: event.target.value })} />
              </div>
              {"quote" in block ? <Field value={block.quote} onChange={(value) => updateBlock(block.key, { quote: value } as Partial<ShowroomContentBlock>)} label={`${sectionName} quote`} max={500} /> : null}
              {"actionLabel" in block ? <Field value={block.actionLabel} onChange={(value) => updateBlock(block.key, { actionLabel: value } as Partial<ShowroomContentBlock>)} label={`${sectionName} action label`} max={80} /> : null}
              {"transcript" in block ? (
                <div className="field full">
                  <label>Video transcript</label>
                  <textarea aria-label={`${sectionName} transcript`} value={block.transcript} maxLength={4000} onChange={(event) => updateBlock(block.key, { transcript: event.target.value } as Partial<ShowroomContentBlock>)} />
                </div>
              ) : null}
              {"items" in block ? (
                <div className="field full">
                  <label>Section items</label>
                  <textarea
                    aria-label={`${sectionName} items`}
                    value={itemLines(block)}
                    onChange={(event) => updateBlock(block.key, { items: parseItemLines(block, event.target.value) } as Partial<ShowroomContentBlock>)}
                  />
                  <small>One item per line: Label: value.</small>
                </div>
              ) : null}
              {block.type === "hero" ? (
                <MediaChoice label={`${sectionName} image`} value={mediaValue(block, "hero_image")} options={mediaOptions} kind="image" requestId={requestId} revisionId={revisionId} onAdmitted={addMediaOption} onChange={(value) => setBlockMedia(block, "hero_image", value)} />
              ) : null}
              {["story", "highlights", "information"].includes(block.type) ? (
                <MediaChoice label={`${sectionName} image`} value={mediaValue(block, "story_image")} options={mediaOptions} kind="image" requestId={requestId} revisionId={revisionId} onAdmitted={addMediaOption} onChange={(value) => setBlockMedia(block, "story_image", value)} />
              ) : null}
              {block.type === "highlights" ? (
                <MediaChoice label="Process video" value={business.processVideoRef} options={mediaOptions} kind="video" requestId={requestId} revisionId={revisionId} onAdmitted={addMediaOption} onChange={(value) => setBusiness("processVideoRef", value)} />
              ) : null}
              {block.type === "video" ? (
                <MediaChoice label={`${sectionName} video`} value={mediaValue(block, "video")} options={mediaOptions} kind="video" requestId={requestId} revisionId={revisionId} onAdmitted={addMediaOption} onChange={(value) => setBlockMedia(block, "video", value)} />
              ) : null}
              </div>
            </details>;
          })}
        </section>

        <section className="panel" hidden={activeArea !== "offerings"}>
          <div className="dashboard-head">
            <div><h2>Categories</h2><p>Categories drive showroom filters.</p></div>
            <button type="button" className="small-btn" onClick={() => { setSnapshot((current) => ({ ...current, categories: [...current.categories, { key: uid("category"), collectionKey: null, name: "New category", slug: "", sortOrder: current.categories.length, active: true }] })); setCategoryPage(Math.ceil((snapshot.categories.length + 1) / EDITOR_PAGE_SIZE)); }}>Add category</button>
          </div>
          {snapshot.categories
            .slice((categoryPage - 1) * EDITOR_PAGE_SIZE, categoryPage * EDITOR_PAGE_SIZE)
            .map((item, offset) => {
            const index = (categoryPage - 1) * EDITOR_PAGE_SIZE + offset;
            return <details className="revision-item editor-disclosure" key={item.key} open={offset === 0}>
              <summary><span><strong>{item.name || "Untitled category"}</strong><small>Category {index + 1}</small></span><b>Edit</b></summary>
              <div className="form-grid editor-disclosure-body">
              <Field value={item.name} onChange={(value) => updateCategory(index, { name: value })} label={`Category ${index + 1} name`} max={100} />
              <Field value={item.slug} onChange={(value) => updateCategory(index, { slug: value })} label={`Category ${index + 1} slug`} max={80} />
              <div className="field"><label>Sort order</label><input aria-label={`Category ${index + 1} sort order`} type="number" value={item.sortOrder} onChange={(event) => updateCategory(index, { sortOrder: Number(event.target.value) })} /></div>
              <label className="check-field"><input type="checkbox" checked={item.active} onChange={(event) => updateCategory(index, { active: event.target.checked })} /> Active</label>
              <button type="button" className="small-btn danger" onClick={() => removeCategory(index)}>Remove category</button>
              </div>
            </details>;
          })}
          {categoryPages > 1 ? <div className="editor-pagination" aria-label="Category pages"><button type="button" className="small-btn" disabled={categoryPage === 1} onClick={() => setCategoryPage((page) => page - 1)}>Previous</button><span>Page {categoryPage} of {categoryPages}</span><button type="button" className="small-btn" disabled={categoryPage === categoryPages} onClick={() => setCategoryPage((page) => page + 1)}>Next</button></div> : null}
        </section>

        <section className="panel" hidden={activeArea !== "offerings"}>
          <div className="dashboard-head">
            <div><h2>Products &amp; capabilities</h2><p>Structured offerings remain private until this revision is approved and published.</p></div>
            <button type="button" className="small-btn" onClick={() => { setSnapshot((current) => ({ ...current, products: [...current.products, { key: uid("product"), collectionKey: null, categoryKey: null, name: "New offering", slug: "", eyebrow: "", description: "", imageRef: "", videoRef: "", priceMinor: null, currency: "ETB", quantityUnit: "", highlights: [], availability: "available", offeringKind: "standard_product", quantityMode: "optional", capacitySummary: "", minimumOrderSummary: "", leadTimeSummary: "", published: true, sortOrder: current.products.length, optionGroups: [] }] })); setProductPage(Math.ceil((snapshot.products.length + 1) / EDITOR_PAGE_SIZE)); }}>Add offering</button>
          </div>
          {snapshot.products
            .slice((productPage - 1) * EDITOR_PAGE_SIZE, productPage * EDITOR_PAGE_SIZE)
            .map((item, offset) => {
            const index = (productPage - 1) * EDITOR_PAGE_SIZE + offset;
            return <details className="revision-item editor-disclosure" key={item.key} open={offset === 0}>
              <summary><span><strong>{item.name || "Untitled offering"}</strong><small>{item.offeringKind.replaceAll("_", " ")}</small></span><b>Edit</b></summary>
              <div className="form-grid editor-disclosure-body">
              <Field value={item.name} onChange={(value) => updateProduct(index, { name: value })} label={`Product ${index + 1} name`} max={140} />
              <Field value={item.slug} onChange={(value) => updateProduct(index, { slug: value })} label={`Product ${index + 1} slug`} max={80} />
              <Field value={item.eyebrow} onChange={(value) => updateProduct(index, { eyebrow: value })} label={`Product ${index + 1} short label`} max={100} />
              <div className="field"><label>Category</label><select aria-label={`Product ${index + 1} category`} value={item.categoryKey || ""} onChange={(event) => updateProduct(index, { categoryKey: event.target.value || null })}><option value="">Unassigned</option>{snapshot.categories.map((entry) => <option key={entry.key} value={entry.key}>{entry.name}</option>)}</select></div>
              <div className="field"><label>Availability</label><select aria-label={`Product ${index + 1} availability`} value={item.availability} onChange={(event) => updateProduct(index, { availability: event.target.value })}>{["available", "limited", "unavailable", "coming_soon"].map((value) => <option key={value}>{value}</option>)}</select></div>
              <div className="field"><label>Offering type</label><select aria-label={`Product ${index + 1} offering type`} value={item.offeringKind} onChange={(event) => updateProduct(index, { offeringKind: event.target.value })}><option value="standard_product">Standard product</option><option value="made_to_order">Made to order</option><option value="manufacturing_capability">Manufacturing capability</option><option value="production_supply">Production supply</option></select></div>
              <div className="field"><label>Desired quantity</label><p>Optional for the buyer</p></div>
              <div className="field"><label>Sort order</label><input aria-label={`Product ${index + 1} sort order`} type="number" value={item.sortOrder} onChange={(event) => updateProduct(index, { sortOrder: Number(event.target.value) })} /></div>
              <MediaChoice label={`Product ${index + 1} image`} value={item.imageRef} options={mediaOptions} kind="image" requestId={requestId} revisionId={revisionId} onAdmitted={addMediaOption} onChange={(value) => updateProduct(index, { imageRef: value })} />
              <MediaChoice label={`Product ${index + 1} video`} value={item.videoRef} options={mediaOptions} kind="video" requestId={requestId} revisionId={revisionId} onAdmitted={addMediaOption} onChange={(value) => updateProduct(index, { videoRef: value })} />
              <div className="field"><label>Price in ETB</label><input aria-label={`Product ${index + 1} price in ETB`} type="number" min="0" step="0.01" value={item.priceMinor === null ? "" : item.priceMinor / 100} onChange={(event) => updateProduct(index, { priceMinor: event.target.value === "" ? null : Math.round(Number(event.target.value) * 100), currency: "ETB" })} /></div>
              <Field value={item.quantityUnit} onChange={(value) => updateProduct(index, { quantityUnit: value })} label={`Product ${index + 1} offered by`} max={40} />
              <label className="check-field"><input type="checkbox" checked={item.published} onChange={(event) => updateProduct(index, { published: event.target.checked })} /> Show in showroom</label>
              <div className="field full"><label>Description</label><textarea aria-label={`Product ${index + 1} description`} value={item.description} maxLength={3000} onChange={(event) => updateProduct(index, { description: event.target.value })} /></div>
              <Field value={item.capacitySummary} onChange={(value) => updateProduct(index, { capacitySummary: value })} label={`Product ${index + 1} capacity`} max={180} />
              <Field value={item.minimumOrderSummary} onChange={(value) => updateProduct(index, { minimumOrderSummary: value })} label={`Product ${index + 1} minimum order`} max={140} />
              <Field value={item.leadTimeSummary} onChange={(value) => updateProduct(index, { leadTimeSummary: value })} label={`Product ${index + 1} lead time`} max={140} />
              <div className="field full"><label>Highlights</label><textarea aria-label={`Product ${index + 1} highlights`} value={item.highlights.join("\n")} maxLength={485} onChange={(event) => updateProduct(index, { highlights: [...new Set(event.target.value.split(/\r?\n/).map((value) => value.trim()).filter(Boolean))].slice(0, 6) })} /><small>One concise highlight per line, up to six.</small></div>
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
            </details>;
          })}
          {productPages > 1 ? <div className="editor-pagination" aria-label="Offering pages"><button type="button" className="small-btn" disabled={productPage === 1} onClick={() => setProductPage((page) => page - 1)}>Previous</button><span>Page {productPage} of {productPages}</span><button type="button" className="small-btn" disabled={productPage === productPages} onClick={() => setProductPage((page) => page + 1)}>Next</button></div> : null}
        </section>

        <div className="sticky-actions editor-save-actions">
          <button className="btn brand" disabled={!previewValidation.snapshot}>Save private draft</button>
          <button className="btn secondary" type="button" onClick={() => document.getElementById("revision-live-preview")?.scrollIntoView({ behavior: "smooth", block: "start" })}><Eye aria-hidden="true"/> Preview changes</button>
        </div>
      </form>

      <section className="panel revision-live-preview" id="revision-live-preview">
        <div className="dashboard-head editor-preview-toolbar">
          <div><span className="eyebrow">Unsaved preview</span><h2>See your changes</h2><p>This uses the current editor values. It does not save or publish anything.</p></div>
          <div className="preview-viewport-control" role="group" aria-label="Preview width">
            <button type="button" className={previewViewport === "desktop" ? "active" : ""} aria-pressed={previewViewport === "desktop"} onClick={() => setPreviewViewport("desktop")}><Monitor aria-hidden="true"/> Desktop</button>
            <button type="button" className={previewViewport === "phone" ? "active" : ""} aria-pressed={previewViewport === "phone"} onClick={() => setPreviewViewport("phone")}><Smartphone aria-hidden="true"/> Phone</button>
          </div>
        </div>
        {previewValidation.error ? (
          <p className="error" role="alert">
            Preview kept on the last valid design. {previewValidation.error}
          </p>
        ) : null}
        <div className={`editor-preview-stage ${previewViewport}`}>
          <div className="editor-preview-frame"><ShowroomApp catalog={previewCatalog} previewMode embedded privateMediaRequestId={requestId} /></div>
        </div>
      </section>

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
