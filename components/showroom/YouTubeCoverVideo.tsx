"use client";

import {useEffect, useRef, useState} from "react";
import {useUiText} from "@/lib/i18n/ui";
import {productVideoEmbedUrl, productVideoWatchUrl} from "@/lib/video/product-video";
import LoadingBar from "../LoadingBar";
import styles from "./BusinessProfile.module.css";

const providerOrigin = "https://www.youtube-nocookie.com";

export default function YouTubeCoverVideo({video, image, title}: {video: string; image: string; title: string}) {
  const t = useUiText();
  const frame = useRef<HTMLIFrameElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "slow" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const src = new URL(productVideoEmbedUrl(video));
  src.searchParams.set("autoplay", "1");
  src.searchParams.set("playsinline", "1");
  src.searchParams.set("enablejsapi", "1");
  src.searchParams.set("origin", window.location.origin);

  useEffect(() => {
    // The embed needs a subscription after it has installed its message handler.
    function receive(event: MessageEvent) {
      if (event.origin !== providerOrigin || event.source !== frame.current?.contentWindow ||
          typeof event.data !== "string" || event.data.length > 65_536) return;
      try {
        const message = JSON.parse(event.data);
        if (!message || typeof message !== "object") return;
        if (message.event === "onError") {
          window.clearInterval(subscription);
          setState("error");
          return;
        }
        const playerState = message.event === "onStateChange" ? message.info : message.info?.playerState;
        if ([0, 1, 2, 5].includes(playerState) || message.event === "onAutoplayBlocked") {
          window.clearInterval(subscription);
          setState(current => current === "error" ? current : "ready");
        }
      } catch {
        // Ignore messages outside the player protocol.
      }
    }
    function listen() {
      const player = frame.current?.contentWindow;
      player?.postMessage(JSON.stringify({event: "listening"}), providerOrigin);
      for (const event of ["onStateChange", "onError", "onAutoplayBlocked"]) {
        player?.postMessage(JSON.stringify({event: "command", func: "addEventListener", args: [event]}), providerOrigin);
      }
    }
    window.addEventListener("message", receive);
    const subscription = window.setInterval(listen, 500);
    const deadline = window.setTimeout(() => {
      window.clearInterval(subscription);
      setState(current => current === "loading" ? "slow" : current);
    }, 15_000);
    return () => {
      window.removeEventListener("message", receive);
      window.clearInterval(subscription);
      window.clearTimeout(deadline);
    };
  }, [attempt]);

  function retry() {
    setState("loading");
    setAttempt(current => current + 1);
  }

  const showPoster = state === "loading" || state === "error";
  return <div className={styles.youtubeCover}>
    {state !== "error" && <iframe key={attempt} ref={frame} src={src.href} title={title}
      className={showPoster ? styles.startingCoverFrame : undefined}
      allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
      tabIndex={showPoster ? -1 : undefined} aria-hidden={showPoster || undefined}
      allowFullScreen referrerPolicy="strict-origin-when-cross-origin" onError={() => setState("error")} />}
    {showPoster && <>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      {image && <img className={styles.videoPoster} src={image} alt="" />}
      <div className={styles.coverVideoFeedback}>
        {state === "loading" ? <LoadingBar label={t("Loading video…")} /> : <p role="status">{t("Video unavailable")}</p>}
      </div>
    </>}
    {(state === "error" || state === "slow") && <div className={styles.coverVideoActions}>
      <a href={productVideoWatchUrl(video)} target="_blank" rel="noreferrer">{t("Open on YouTube")}</a>
      <button type="button" onClick={retry}>{t("Try again")}</button>
    </div>}
  </div>;
}
