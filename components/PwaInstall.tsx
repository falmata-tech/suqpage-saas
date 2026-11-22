"use client";

import { Download, X } from "lucide-react";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { useUiText } from "@/lib/i18n/ui";
import styles from "./PwaInstall.module.css";

type InstallPrompt = Event & {prompt(): Promise<unknown>};

const InstallContext = createContext<{installed: boolean; install(trigger: HTMLButtonElement): void} | null>(null);

export function PwaInstallProvider({children}: {children: ReactNode}) {
  const t = useUiText();
  const prompt = useRef<InstallPrompt | null>(null);
  const trigger = useRef<HTMLButtonElement | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const [installed, setInstalled] = useState(false);
  const [apple, setApple] = useState(false);
  const asking = useRef(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)");
    const device = navigator as Navigator & {standalone?: boolean};
    const update = () => setInstalled(standalone.matches || device.standalone === true);
    const onPrompt = (event: Event) => {
      event.preventDefault();
      prompt.current = event as InstallPrompt;
    };
    const onInstalled = () => {
      prompt.current = null;
      setInstalled(true);
      dialog.current?.close();
    };
    update();
    setApple(/iPad|iPhone|iPod/i.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1));
    standalone.addEventListener("change", update);
    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      standalone.removeEventListener("change", update);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  async function install(button: HTMLButtonElement) {
    if (asking.current) return;
    trigger.current = button;
    const installPrompt = prompt.current;
    prompt.current = null;
    if (installPrompt) {
      asking.current = true;
      try { await installPrompt.prompt(); return; }
      catch { /* Fall back to browser instructions if the prompt cannot open. */ }
      finally { asking.current = false; }
    }
    if (!dialog.current?.open) dialog.current?.showModal();
  }

  return <InstallContext.Provider value={{installed, install}}>
    {children}
    <dialog ref={dialog} className={styles.dialog} aria-labelledby="africmade-install-title" onClose={() => trigger.current?.focus()}>
      <div className={styles.heading}>
        <Download aria-hidden="true" size={22}/>
        <h2 id="africmade-install-title">{t("Install AfricMade")}</h2>
        <button type="button" aria-label={t("Close")} onClick={() => dialog.current?.close()}><X aria-hidden="true" size={20}/></button>
      </div>
      <p>{t(apple
        ? "In Safari, tap Share, then Add to Home Screen. Turn on Open as Web App if shown, then tap Add."
        : "Open your browser menu and choose Install app or Add to Home screen, if available.")}</p>
      <p>{t("Open AfricMade from your home screen to browse and sign in.")}</p>
      <button className={styles.done} type="button" onClick={() => dialog.current?.close()}>{t("Done")}</button>
    </dialog>
  </InstallContext.Provider>;
}

export function PwaInstallButton({compact = false}: {compact?: boolean}) {
  const t = useUiText();
  const state = useContext(InstallContext);
  if (!state || state.installed || process.env.NEXT_PUBLIC_SUQPAGE_PWA_ENABLED === "false") return null;
  return <button type="button" className={compact ? styles.compact : styles.rail}
    aria-label={t("Install AfricMade")} onClick={event => state.install(event.currentTarget)}>
    <Download aria-hidden="true" size={19}/>{!compact && <span>{t("Install AfricMade")}</span>}
  </button>;
}
