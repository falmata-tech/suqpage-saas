"use client";
import { useUiText } from "@/lib/i18n/ui";


import { Eye, Pencil, Save, LoaderCircle, Check, Upload, Globe, Undo2, ExternalLink } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import ShowroomApp from "./showroom/ShowroomApp";
import { businessProfileDescription, initialBusinessProfile } from "@/lib/business-profile";
import type { Catalog } from "@/lib/types";
import { parseShopPageContent, type OwnerPageDraft, type ShopPageContent } from "@/lib/owner-page-domain";
import type { PagePublication } from "@/lib/owner-page-publication";
import { legacyPublicContacts, publicContactFields } from "@/lib/business-profile-contacts";
import styles from "./OwnerPageEditor.module.css";
import { STARTER_NOTICE } from '@/lib/business-starter';

export default function OwnerPageEditor({ catalog, initialDraft, initialPublication = null, owner, initialPreview = false }: { catalog: Catalog; initialDraft: OwnerPageDraft | null; initialPublication?: PagePublication | null; owner: boolean; initialPreview?: boolean }) {
  const t = useUiText();
  const [draft, setDraft] = useState(initialDraft);
  const [publication, setPublication] = useState(initialPublication);
  const [confirmation, setConfirmation] = useState<"publish" | "restore" | null>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const [content, setContent] = useState<ShopPageContent>(initialDraft?.content || initialBusinessProfile(catalog));
  const [mode, setMode] = useState<"edit" | "preview">(initialPreview ? "preview" : "edit");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const deferred = useDeferredValue(content);
  const dirty = JSON.stringify(draft?.content || initialBusinessProfile(catalog)) !== JSON.stringify(content);
  const matchesPublication = Boolean(publication?.content && JSON.stringify(publication.content) === JSON.stringify(draft?.content));
  const [activePage, setActivePage] = useState(catalog.business.status === "active");
  const preview = useMemo(() => {
    try { return { profile: parseShopPageContent(deferred), error: "" }; }
    catch (failure) { return { profile: null, error: failure instanceof Error ? failure.message : "Check the profile fields." }; }
  }, [deferred]);
  const [lastValidPreview, setLastValidPreview] = useState(preview.profile);
  useEffect(() => { if (preview.profile) setLastValidPreview(preview.profile); }, [preview.profile]);
  const renderedProfile = preview.profile || lastValidPreview;
  const images = useMemo(() => [...new Set([catalog.business.hero_image_path, catalog.business.logo_path,
    ...catalog.products.map((p) => p.image_path), draft?.content.heroImage, ...uploadedImages].filter((image): image is string => Boolean(image)))], [catalog, draft?.content.heroImage, uploadedImages]);
  useEffect(() => { setReady(true); }, []);
  useEffect(() => {
    const dialog = confirmDialog.current;
    if (!dialog) return;
    if (confirmation && !dialog.open) dialog.showModal();
    if (!confirmation && dialog.open) dialog.close();
  }, [confirmation]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  async function command(action: "save" | "assistance", enabled?: boolean) {
    if (busy || uploading) return;
    setBusy(true); setError("");
    try {
      const body = action === "save"
        ? draft ? { action, version: draft.version, content } : { action: "start", content }
        : { action, version: draft?.version, enabled };
      const response = await fetch(`/api/page-drafts/${catalog.business.id}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The draft could not be saved.");
      setDraft(result);
      if (result.publication) setPublication(result.publication);
      if (action !== "assistance") setContent(result.content);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not connect. Your edits are still here."); }
    finally { setBusy(false); }
  }

  async function uploadCover(file: File) {
    if (busy || uploading) return;
    setError("");
    if (!file.size || file.size > 5 * 1024 * 1024 || (file.type && !["image/jpeg", "image/png", "image/webp"].includes(file.type))) {
      setError("Choose a JPEG, PNG or WebP image, up to 5 MB."); return;
    }
    setUploading(true);
    try {
      const form = new FormData(); form.set("file", file);
      const response = await fetch(`/api/page-drafts/${catalog.business.id}/media`, { method: "POST", body: form });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The image could not be uploaded. Please try again.");
      if (typeof result.ref !== "string" || !result.ref.startsWith(`/api/page-drafts/${catalog.business.id}/media/`)) throw new Error("The image could not be uploaded. Please try again.");
      setUploadedImages((current) => [...current, result.ref]);
      setContent((current) => ({ ...current, heroImage: result.ref }));
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The image could not be uploaded. Your current cover is unchanged."); }
    finally { setUploading(false); }
  }

  async function publishSavedPage() {
    if (!confirmation || !draft || !owner || busy || uploading || (confirmation !== "restore" && dirty)) return;
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/page-drafts/${catalog.business.id}`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: confirmation, version: draft.version, revision: publication?.revision || 0 }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Publication could not be confirmed. Reload before trying again.");
      setPublication(result); setActivePage(true);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Publication could not be confirmed. Reload before trying again."); }
    finally { setBusy(false); setConfirmation(null); }
  }

  return <section className={styles.editor} aria-label={t("Business profile editor")} aria-busy={!ready || busy || uploading}>
    {catalog.business.description.startsWith('Sample page:') && catalog.business.status === 'draft' ? <p className="notice">{t(STARTER_NOTICE)}</p> : null}
    <header className={styles.toolbar}>
      <div><h1>{t("Business profile")}</h1><p role="status">{dirty ? t("Unsaved changes") : draft ? activePage && matchesPublication ? t("Changes saved to your live page") : t("Private draft saved") : t("Private preview")}</p></div>
      <div className={styles.modes} aria-label={t("Editor view")}>
        <button type="button" aria-pressed={mode === "edit"} onClick={() => setMode("edit")}><Pencil size={17} />{t("Edit")}</button>
        <button type="button" aria-pressed={mode === "preview"} onClick={() => setMode("preview")}><Eye size={17} />{t("Preview")}</button>
      </div>
      <button type="button" className={styles.save} disabled={!ready || busy || uploading || Boolean(preview.error) || Boolean(draft && !dirty && (!activePage || matchesPublication))}
        onClick={() => command("save")}>
        {busy ? <LoaderCircle size={18} /> : <Save size={18} />}
        {t("Save")}</button>
    </header>
    {owner ? <div className={styles.publication} aria-label={t("Page publication")}>
      <p role="status">{activePage ? t("Your page is live") : catalog.business.status === "suspended" ? t("Page suspended — contact support") : t("Private until you publish")}</p>
      <div className={styles.publicationActions}>
        {!activePage && catalog.business.status === "draft" ? <button type="button" className={styles.publish} disabled={!ready || busy || uploading || !draft || dirty || Boolean(preview.error) || !catalog.products.some(product => Boolean(product.is_published))} onClick={() => setConfirmation("publish")}><Globe size={16} aria-hidden="true" />{t("Publish")}</button> : null}
        {activePage ? <a href={`/@${catalog.business.handle}`} target="_blank" rel="noopener noreferrer"><ExternalLink size={16} aria-hidden="true" />{t("View page")}<span className="sr-only"> {" "}{t("(new tab)")}</span></a> : null}
        {publication && activePage ? <button type="button" disabled={!ready || busy || uploading} onClick={() => setConfirmation("restore")}><Undo2 size={16} aria-hidden="true" />{t("Restore previous")}</button> : null}
      </div>
    </div> : null}
    <dialog ref={confirmDialog} className={styles.confirmation} aria-labelledby="page-publication-title"
      onCancel={(event) => { if (busy) event.preventDefault(); else setConfirmation(null); }}
      onClose={() => setConfirmation(null)}>
      <h2 id="page-publication-title">{confirmation === "restore" ? t("Restore the previous page?") : t("Publish {value1}?", { value1: catalog.business.name })}</h2>
      <p>{confirmation === "restore" ? t("Visitors will see the previous published page. Your draft will stay saved.") : t("Your page and listed products or services will be visible to customers. You can update them any time.")}</p>
      <div><button type="button" autoFocus disabled={busy} onClick={() => setConfirmation(null)}>{t("Cancel")}</button>
        <button type="button" className={styles.publish} disabled={busy} onClick={() => void publishSavedPage()}>
          {busy ? <LoaderCircle size={16} aria-hidden="true" /> : confirmation === "restore" ? <Undo2 size={16} aria-hidden="true" /> : <Globe size={16} aria-hidden="true" />}
          {confirmation === "restore" ? t("Restore previous") : t("Publish page")}
        </button></div>
    </dialog>
    {error ? <p role="alert" className={styles.error}>{t(error)}</p> : null}
    <div className={styles.workspace} data-mode={mode}>
      <div className={styles.fields}>
        <fieldset disabled={!ready || busy || uploading}>
          <legend>{catalog.business.name}</legend>
          <label htmlFor="shop-about">{t("About the business")}</label>
          <textarea id="shop-about" rows={5} maxLength={3000} value={businessProfileDescription(content)} onChange={(e) => setContent({ ...content, introduction: "", about: e.target.value })} />
          <span className={styles.uploadStatus}>{t("Tell visitors what makes your shop and products worth exploring.")}</span>
          <label htmlFor="shop-video">{t("Business video")}{" "}<span className={styles.optional}>{t("(optional)")}</span></label>
          <input id="shop-video" type="url" placeholder={t("YouTube link")} maxLength={500} value={content.videoUrl} onChange={(e) => setContent({ ...content, videoUrl: e.target.value })} />
          <span id="shop-cover-label" className={styles.label}>{t("Cover image")}</span>
          <input ref={fileInput} type="file" hidden accept="image/jpeg,image/png,image/webp" aria-label={t("Choose cover image file")} onChange={(event) => {
            const file = event.currentTarget.files?.[0]; event.currentTarget.value = "";
            if (file) void uploadCover(file);
          }} />
          <button type="button" className={styles.upload} onClick={() => fileInput.current?.click()}>
            {uploading ? <LoaderCircle size={18} aria-hidden="true" /> : <Upload size={18} aria-hidden="true" />}
            {uploading ? t("Uploading image...") : t("Upload image")}
          </button>
          <span className={styles.uploadStatus} role="status">{uploading ? t("Uploading your cover image...") : t("JPG, PNG or WebP. Up to 5 MB.")}</span>
        </fieldset>
          <div className={styles.images} role="group" aria-labelledby="shop-cover-label" tabIndex={0}>
            <button type="button" disabled={!ready || busy || uploading} aria-pressed={!content.heroImage} onClick={() => setContent({ ...content, heroImage: "" })}>{t("No image")}</button>
            {images.map((image, index) => <button key={image} type="button" aria-label={t("Use shop image {value1}", { value1: index + 1 })} title={t("Shop image {value1}", { value1: index + 1 })}
              disabled={!ready || busy || uploading} aria-pressed={content.heroImage === image} onClick={() => setContent({ ...content, heroImage: image })}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image} alt="" loading="lazy" />
              {content.heroImage === image ? <Check size={17} aria-hidden="true" /> : null}
            </button>)}
          </div>
        <fieldset disabled={!ready || busy || uploading}>
          <legend className="sr-only">{t("Public contact details")}</legend>
          <details className={styles.contactFields}>
            <summary>{t("Public contact details")}{" "}<span className={styles.optional}>{t("(optional)")}</span></summary>
            {publicContactFields.map((field) => <div key={field.key}>
              <label htmlFor={`public-${field.key}`}>{t(field.label)}</label>
              <input id={`public-${field.key}`} type={field.type} maxLength={500} placeholder={field.placeholder}
                value={(content.contacts || legacyPublicContacts(catalog.business))[field.key] || ""}
                onChange={(event) => setContent({ ...content, contacts: { ...(content.contacts || legacyPublicContacts(catalog.business)), [field.key]: event.target.value } })} />
            </div>)}
          </details>
        </fieldset>
        {preview.error ? <p role="alert" className={styles.error}>{t(preview.error)}</p> : null}
        {owner && draft ? <div className={styles.assistance}>
          <label><input type="checkbox" checked={draft.assistanceEnabled} disabled={!ready || busy || uploading} onChange={(e) => command("assistance", e.target.checked)} />{t("Allow team editing")}</label>
          <p>{t("The team can prepare changes. Your Save applies them to your live page.")}</p>
        </div> : draft ? <p className={styles.note}>{t("Team editing is enabled by the owner.")}</p> : null}
      </div>
      <div className={styles.preview} aria-label={t("Page preview")}>
        <div className={styles.previewLabel}><Eye size={16} />{t("Private preview")}</div>
        {renderedProfile ? <ShowroomApp catalog={catalog} businessProfile={renderedProfile} previewMode embedded /> : <p role="status" className={styles.error}>{t("Complete the profile fields to preview.")}</p>}
      </div>
    </div>
  </section>;
}
