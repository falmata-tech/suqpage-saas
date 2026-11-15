"use client";

import { useEffect, useState } from "react";
import { useUiText } from "@/lib/i18n/ui";
import { productVideo, productVideoWatchUrl } from "@/lib/video/product-video";
import LoadingBar from "./LoadingBar";

/** Only render packaged fictional-demo footage after a visitor presses Play. */
export default function FirstPartyDemoVideo({ video, title }: { video: string; title: string }) {
  const t = useUiText();
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const parsed = productVideo(video);
  useEffect(() => {
    if (state !== "loading") return;
    const timer = setTimeout(() => setState("error"), 20_000);
    return () => clearTimeout(timer);
  }, [state, attempt]);
  if (parsed.provider !== "demo") throw new Error("Expected a packaged demo video.");
  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100%", minHeight: 0, background: "#202428", color: "white" }}>
      <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
        {state === "error" ? (
          <div style={{ height: "100%", display: "grid", placeContent: "center", gap: 12, padding: 20 }}>
            <p role="status">{t("Video unavailable")}</p>
            <button className="btn secondary" onClick={() => { setState("loading"); setAttempt(value => value + 1); }}>{t("Try again")}</button>
          </div>
        ) : (
          <>
            <video key={video + attempt} src={productVideoWatchUrl(video)} title={title}
              controls autoPlay playsInline preload="metadata"
              onCanPlay={() => setState("ready")} onPlaying={() => setState("ready")}
              onError={() => setState("error")}
              style={{ display: "block", width: "100%", height: "100%", objectFit: "contain" }} />
            {state === "loading" ? <div style={{ position: "absolute", top: 4, left: 8, right: 8, pointerEvents: "none" }}><LoadingBar label={t("Loading video…")} /></div> : null}
          </>
        )}
      </div>
    </div>
  );
}
