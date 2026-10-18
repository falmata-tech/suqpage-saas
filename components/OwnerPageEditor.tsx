"use client";
import LoadingBar from "./LoadingBar";
import {useRouter} from "next/navigation";
import { publicationReadiness } from "@/lib/publication-readiness";
import launchStyles from "./LaunchClarity.module.css";
import { useUiText } from "@/lib/i18n/ui";


import { Eye, Pencil, Save, LoaderCircle, Check, Upload, Globe, Undo2, ExternalLink, Palette, ArrowLeft } from "lucide-react";
import { useDeferredValue, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import StorefrontAccentPicker from "./StorefrontAccentPicker";
import ShowroomApp from "./showroom/ShowroomApp";
import { businessProfileDescription, initialBusinessProfile } from "@/lib/business-profile";
import type { Catalog } from "@/lib/types";
import { parseShopPageContent, type OwnerPageDraft, type ShopPageContent } from "@/lib/owner-page-domain";
import type { PagePublication } from "@/lib/owner-page-publication";
import { legacyPublicContacts, publicContactFields } from "@/lib/business-profile-contacts";
import styles from "./OwnerPageEditor.module.css";
import { STARTER_NOTICE } from '@/lib/business-starter';
import {OWNER_PAGE_TASKS,ownerPageTask,ownerPageReturn,type OwnerPageTask} from '@/lib/owner-page-tasks';
import {browserJson} from '@/lib/browser-json';

export default function OwnerPageEditor({ catalog, initialDraft, initialPublication = null, owner, initialPreview = false, locationConfirmed = false, returnToProfile = false, initialTask = 'about', returnTo }: { catalog: Catalog; initialDraft: OwnerPageDraft | null; initialPublication?: PagePublication | null; owner: boolean; initialPreview?: boolean; locationConfirmed?: boolean; handleEditor?: ReactNode; returnToProfile?: boolean; initialTask?: OwnerPageTask; returnTo?: 'profile'|'showroom' }) {
  const t = useUiText(), router=useRouter();
  const scopedInitialTask=!owner&&initialTask==='team'?'about':ownerPageTask(initialTask);
  const [draft, setDraft] = useState(initialDraft);
  const [publication, setPublication] = useState(initialPublication);
  const [confirmation, setConfirmation] = useState<"publish" | "restore" | null>(null);
  const confirmDialog = useRef<HTMLDialogElement>(null);
  const leaveDialog=useRef<HTMLDialogElement>(null);
  const [content, setContent] = useState<ShopPageContent>(initialDraft?.content || initialBusinessProfile(catalog));
  const checks = publicationReadiness(content, catalog.products, locationConfirmed);
  const [colorOpen, setColorOpen] = useState(false);
  const [mode, setMode] = useState<"edit" | "preview">(initialPreview ? "preview" : "edit");
  const [task,setTask]=useState<OwnerPageTask>(scopedInitialTask);
  const [assistance,setAssistance]=useState(Boolean(initialDraft?.assistanceEnabled));
  const [leaving,setLeaving]=useState(false);
  const operation=useRef(false);
  const returnHref=owner?ownerPageReturn(returnTo || (returnToProfile?'profile':'showroom')):`/dashboard?business=${catalog.business.id}`;
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const deferred = useDeferredValue(content);
  const dirty = JSON.stringify(draft?.content || initialBusinessProfile(catalog)) !== JSON.stringify(content);
  const assistanceDirty=assistance!==Boolean(draft?.assistanceEnabled);
  const unsaved=dirty||assistanceDirty;
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
  useEffect(()=>{setTask(scopedInitialTask);setMode(initialPreview||scopedInitialTask==='color'?'preview':'edit');setColorOpen(scopedInitialTask==='color');},[scopedInitialTask,initialPreview]);
  useEffect(() => {
    const dialog = confirmDialog.current;
    if (!dialog) return;
    if (confirmation && !dialog.open) dialog.showModal();
    if (!confirmation && dialog.open) dialog.close();
  }, [confirmation]);
  useEffect(()=>{const dialog=leaveDialog.current;if(!dialog)return;if(leaving&&!dialog.open)dialog.showModal();if(!leaving&&dialog.open)dialog.close();},[leaving]);

  useEffect(() => {
    if (!unsaved) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [unsaved]);

  function selectTask(next:OwnerPageTask) {
    setTask(next);setMode(next==='color'?'preview':'edit');setColorOpen(next==='color');
    const url=new URL(window.location.href);url.searchParams.set('task',next);url.searchParams.set('view',next==='color'?'preview':'edit');
    window.history.replaceState(window.history.state,'',url);
  }
  function returnToSection(){if(operation.current||uploading)return;if(unsaved)setLeaving(true);else router.push(returnHref);}

  async function command(action: "save" | "assistance", enabled?: boolean) {
    if (operation.current || uploading) return;
    operation.current=true;
    setBusy(true); setError("");
    try {
      let currentDraft=draft;
      // Task changes keep one working profile. Save it before permission changes,
      // so switching to Team editing cannot discard edits from another task.
      if(action==='assistance'&&(dirty||!currentDraft)){
        const {ok,body:profile}=await browserJson(`/api/page-drafts/${catalog.business.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(currentDraft?{action:'save',version:currentDraft.version,content}:{action:'start',content})});
        if(!ok)throw Error(typeof profile.error==='string'?profile.error:'The draft could not be saved.');
        currentDraft=profile as unknown as OwnerPageDraft;
        setDraft(currentDraft);setContent(currentDraft.content);
      }
      const body = action === "save"
        ? currentDraft ? { action, version: currentDraft.version, content } : { action: "start", content }
        : { action, version: currentDraft?.version, enabled };
      const {ok,body:result}=await browserJson(`/api/page-drafts/${catalog.business.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
      if (!ok) throw new Error(typeof result.error==='string'?result.error:"The draft could not be saved.");
      const saved=result as unknown as OwnerPageDraft & {publication?:PagePublication};
      let finalDraft=saved;
      if(action==='save'&&assistanceDirty){
        const {ok,body:permissions}=await browserJson(`/api/page-drafts/${catalog.business.id}`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'assistance',version:saved.version,enabled:assistance})});
        if(!ok){setDraft(saved);setContent(saved.content);throw Error(typeof permissions.error==='string'?permissions.error:'The draft could not be saved.');}
        finalDraft=permissions as unknown as OwnerPageDraft;
      }
      setDraft(finalDraft);
      if (saved.publication) setPublication(saved.publication);
      if (action !== "assistance") setContent(saved.content);
      setAssistance(Boolean(finalDraft.assistanceEnabled));
      if(returnTo||returnToProfile){router.push(`${returnHref}?saved=page`);router.refresh();}
    } catch (failure) { setError(failure instanceof Error ? failure.message : "Could not connect. Your edits are still here."); }
    finally { operation.current=false;setBusy(false); }
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
    {(busy||uploading)&&<LoadingBar/>}
    {catalog.business.description.startsWith('Sample page:') && catalog.business.status === 'draft' ? <p className="notice">{t(STARTER_NOTICE)}</p> : null}
    <header className={styles.toolbar}>
      <div><h1>{t(mode==='preview'&&task!=='color'?'Your page':OWNER_PAGE_TASKS.find(item=>item.key===task)!.label)}</h1><p role="status">{unsaved ? t("Unsaved changes") : draft ? activePage && matchesPublication ? t("Changes saved to your live page") : t("Private draft saved") : t("Private preview")}</p></div>
      <div className={styles.modes} aria-label={t("Editor view")}>
        <button type="button" disabled={busy||uploading} aria-pressed={mode === "edit"} onClick={() => {setMode('edit');if(task==='color')selectTask('about');}}><Pencil size={17} />{t("Edit")}</button>
        <button type="button" disabled={busy||uploading} aria-pressed={mode === "preview"} onClick={() => setMode("preview")}><Eye size={17} />{t("Preview")}</button>
      </div>
      {mode === 'edit' || task==='color' || unsaved ? <button type="button" className={styles.save} disabled={!ready || busy || uploading || Boolean(preview.error) || Boolean(draft && !unsaved && (!activePage || matchesPublication))}
        onClick={() => command(task==='team'?'assistance':'save',assistance)}>
        {busy ? <LoaderCircle size={18} /> : <Save size={18} />}
        {t("Save")}</button> : null}
    </header>
    {owner && mode==='preview' && task!=='color' ? <div className={styles.publication} aria-label={t("Page publication")}>
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
      <p>{confirmation === "restore" ? t("Visitors will see the previous published page. Your draft will stay saved.") : t("Your page and listed products will be visible to customers. You can update them any time.")}</p>
      {confirmation === "publish" && !activePage ? <ul className={launchStyles.review}>{checks.map(check => <li key={check.key}>{check.ready ? <Check size={18} aria-hidden="true" /> : <Pencil size={18} aria-hidden="true" />}<a href={check.key==='about'||check.key==='contacts'?`?view=edit&task=${check.key}`:check.href} onClick={event => { setConfirmation(null); if (check.key === 'contacts'||check.key==='about') {event.preventDefault();selectTask(check.key);} }}>{t(check.label)}</a></li>)}</ul> : null}
      <div><button type="button" autoFocus disabled={busy} onClick={() => setConfirmation(null)}>{t("Cancel")}</button>
        <button type="button" className={styles.publish} disabled={busy || (confirmation === "publish" && !activePage && checks.some(check => !check.ready))} onClick={() => void publishSavedPage()}>
          {busy ? <LoaderCircle size={16} aria-hidden="true" /> : confirmation === "restore" ? <Undo2 size={16} aria-hidden="true" /> : <Globe size={16} aria-hidden="true" />}
          {confirmation === "restore" ? t("Restore previous") : t("Publish page")}
        </button></div>
    </dialog>
    {error ? <p role="alert" className={styles.error}>{t(error)}</p> : null}
    <div className={styles.taskLayout}>
      {!(owner&&returnTo) && <nav className={styles.taskNavigation} aria-label={t('Your page')}>
        {OWNER_PAGE_TASKS.filter(item=>owner||item.key!=='team').map(item=><button type="button" key={item.key} aria-current={task===item.key?'page':undefined} disabled={busy||uploading} onClick={()=>selectTask(item.key)}>{t(item.label)}</button>)}
      </nav>}
      <div className={styles.workspace} data-mode={mode} data-task={task}>
      {mode==='edit' && <div className={styles.fields}>
        {task==='about' && <fieldset disabled={!ready || busy || uploading}>
          <legend className="sr-only">{t('About the business')}</legend>
          <label className="sr-only" htmlFor="shop-about">{t("About the business")}</label>
          <textarea id="shop-about" rows={5} maxLength={3000} value={businessProfileDescription(content)} onChange={(e) => setContent({ ...content, introduction: "", about: e.target.value })} />
          <span className={styles.uploadStatus}>{t("Tell visitors what makes your shop and products worth exploring.")}</span>
        </fieldset>}
        {task==='video' && <fieldset disabled={!ready || busy || uploading}>
          <legend className="sr-only">{t('Business video')}</legend>
          <label className="sr-only" htmlFor="shop-video">{t("Business video")}{" "}<span className={styles.optional}>{t("(optional)")}</span></label>
          <input id="shop-video" type="url" placeholder={t("Video link")} aria-describedby="shop-video-providers" maxLength={500} value={content.videoUrl} onChange={event=>setContent({...content,videoUrl:event.target.value})} />
          <small id="shop-video-providers">{t("TikTok, YouTube, Facebook videos or Instagram Reels")}</small>
        </fieldset>}
        {task==='cover' && <>
        <fieldset disabled={!ready || busy || uploading}>
          <legend className="sr-only">{t('Cover photo')}</legend>
          <span id="shop-cover-label" className="sr-only">{t("Cover image")}</span>
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
        </>}
        {task==='contacts' && <div className={styles.contactFields}>
          {[
            {label:'Social accounts',fields:publicContactFields.filter(field=>['whatsapp','telegram','tiktok','instagram','facebook'].includes(field.key))},
            {label:'Business contacts',fields:publicContactFields.filter(field=>['phone','email','website'].includes(field.key))},
          ].map(group=><fieldset key={group.label} disabled={!ready || busy || uploading}>
            <legend>{t(group.label)}</legend>
            {group.fields.map((field) => <div key={field.key}>
              <label htmlFor={`public-${field.key}`}>{t(field.label)}</label>
              <input id={`public-${field.key}`} type={field.type} maxLength={500} placeholder={field.placeholder}
                value={(content.contacts || legacyPublicContacts(catalog.business))[field.key] || ""}
                onChange={(event) => setContent({ ...content, contacts: { ...(content.contacts || legacyPublicContacts(catalog.business)), [field.key]: event.target.value } })} />
            </div>)}
          </fieldset>)}
        </div>}
        {preview.error ? <p role="alert" className={styles.error}>{t(preview.error)}</p> : null}
        {task==='team' && owner ? <div className={styles.assistance}>
          <label><input type="checkbox" checked={assistance} disabled={!ready || busy || uploading || !draft} onChange={(e) => setAssistance(e.target.checked)} />{t("Allow team editing")}</label>
          <p>{t("The team can prepare changes. Your Save applies them to your live page.")}</p>
        </div> : null}
      </div>}
      {(mode==='preview'||task==='color') && <div className={styles.preview} aria-label={t("Page preview")}>
        <div className={styles.previewLabel}><Eye size={16} />{t("Private preview")}<button type="button" aria-expanded={colorOpen} onClick={() => setColorOpen(!colorOpen)}><Palette size={16} />{t("Page color")}</button></div>
        {colorOpen || task==='color' ? <div className={styles.colorControls}><StorefrontAccentPicker value={content.accentColor || ""} onChange={accentColor => setContent({ ...content, accentColor })} disabled={!ready || busy || uploading} /></div> : null}
        {renderedProfile ? <ShowroomApp catalog={catalog} businessProfile={renderedProfile} previewMode embedded /> : <p role="status" className={styles.error}>{t("Complete the profile fields to preview.")}</p>}
      </div>}
      <div className={styles.taskActions}><button type="button" disabled={busy||uploading} onClick={returnToSection}><ArrowLeft size={17} aria-hidden="true"/>{t(!owner?'Overview':returnHref==='/dashboard/profile'?'Back to account':'Back to your page')}</button><button type="button" disabled={busy||uploading} onClick={returnToSection}>{t('Cancel')}</button></div>
      </div>
    </div>
    <dialog ref={leaveDialog} aria-labelledby="page-unsaved-title" className={styles.confirmation} onCancel={()=>setLeaving(false)} onClose={()=>setLeaving(false)}><h2 id="page-unsaved-title">{t('Unsaved changes')}</h2><p>{t('Your changes have not been saved.')}</p><div><button type="button" autoFocus onClick={()=>setLeaving(false)}>{t('Keep editing')}</button><button type="button" onClick={()=>router.push(returnHref)}>{t('Discard changes')}</button></div></dialog>
  </section>;
}
