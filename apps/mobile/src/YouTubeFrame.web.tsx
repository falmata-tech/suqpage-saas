import React, { useEffect, useMemo, useRef } from "react";
import { playerEvent, playerHtml, type PlayerProps } from "./youtube-player";
export default function YouTubeFrame({ id, height, onEvent }: PlayerProps) {
  const frame = useRef<HTMLIFrameElement>(null),
    callback = useRef(onEvent);
  callback.current = onEvent;
  const origin = window.location.origin,
    html = useMemo(() => playerHtml(id, origin), [id, origin]);
  useEffect(() => {
    function message(e: MessageEvent) {
      if (e.source !== frame.current?.contentWindow || e.origin !== origin)
        return;
      const event = playerEvent(e.data);
      if (event) callback.current(event);
    }
    window.addEventListener("message", message);
    return () => window.removeEventListener("message", message);
  }, [origin]);
  return (
    <iframe
      ref={frame}
      title="YouTube video"
      srcDoc={html}
      sandbox="allow-scripts allow-same-origin allow-presentation"
      allow="fullscreen; encrypted-media; picture-in-picture"
      allowFullScreen
      referrerPolicy="strict-origin-when-cross-origin"
      onError={() => callback.current("error")}
      style={{
        display: "block",
        width: "100%",
        height,
        border: 0,
        background: "#000",
      }}
    />
  );
}
