"use client";

import {useEffect, useId, useLayoutEffect, useRef, useState, type RefObject} from "react";
import {useRouter} from "next/navigation";
import {useUiText} from "@/lib/i18n/ui";
import styles from "./OwnerPageEditor.module.css";

/** Read live controls, including unnamed option drafts and ordered hidden media. */
function draftSnapshot(form: HTMLFormElement | null): string {
  if (!form) return "";
  return JSON.stringify(Array.from(form.elements).flatMap((control): unknown[] => {
    if (control instanceof HTMLInputElement) {
      if (["submit", "button", "reset"].includes(control.type)) return [];
      return [[control.name, control.id, control.type,
        control.type === "file" ? Array.from(control.files || []).map(file => [file.name, file.size, file.lastModified])
          : control.type === "checkbox" || control.type === "radio" ? [control.checked, control.value] : control.value]];
    }
    if (control instanceof HTMLSelectElement) return [[control.name, control.id, Array.from(control.selectedOptions, option => option.value)]];
    if (control instanceof HTMLTextAreaElement) return [[control.name, control.id, control.value]];
    return [];
  }));
}

/** Guard concrete editor exits without replacing or rewriting browser history. */
export default function useFormExitGuard(form: RefObject<HTMLFormElement | null>, pending: RefObject<boolean>) {
  const t = useUiText();
  const router = useRouter();
  const titleId = useId();
  const initial = useRef<string | null>(null);
  const accepted = useRef(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const [destination, setDestination] = useState<string | null>(null);
  const hasChanges = () => !accepted.current && initial.current !== null && draftSnapshot(form.current) !== initial.current;

  useLayoutEffect(() => { initial.current = draftSnapshot(form.current); }, [form]);
  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!pending.current && !hasChanges()) return;
      event.preventDefault();
      event.returnValue = "";
    };
    const followLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(anchor instanceof HTMLAnchorElement) || anchor.hasAttribute("download") || (anchor.target && anchor.target !== "_self")) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      if (!pending.current && !hasChanges()) return;
      event.preventDefault();
      event.stopPropagation();
      if (!pending.current) setDestination(url.pathname + url.search + url.hash);
    };
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", followLink, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", followLink, true);
    };
  });
  useEffect(() => {
    if (destination && !dialog.current?.open) dialog.current?.showModal();
    else if (!destination && dialog.current?.open) dialog.current.close();
  }, [destination]);

  return {
    allowExit: () => { accepted.current = true; },
    markSaved: () => { initial.current = draftSnapshot(form.current); },
    requestExit: (href: string) => {
      if (pending.current) return;
      if (hasChanges()) setDestination(href);
      else router.push(href);
    },
    confirmation: <dialog ref={dialog} aria-labelledby={titleId} className={styles.confirmation}
      onCancel={() => setDestination(null)} onClose={() => setDestination(null)}>
      <h2 id={titleId}>{t("Unsaved changes")}</h2>
      <p>{t("Your changes have not been saved.")}</p>
      <div>
        <button type="button" autoFocus onClick={() => setDestination(null)}>{t("Keep editing")}</button>
        <button type="button" onClick={() => {
          if (!destination || pending.current) return;
          accepted.current = true;
          router.push(destination);
        }}>{t("Discard changes")}</button>
      </div>
    </dialog>,
  };
}
