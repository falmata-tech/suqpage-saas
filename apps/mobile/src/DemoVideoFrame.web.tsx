import React from "react";
import { productVideoWatchUrl } from "../../../lib/video/product-video";
import { PUBLIC_ORIGIN } from "./public-origin";
import type { PlayerProps } from "./youtube-player";

export default function DemoVideoFrame({ id, height, onEvent }: PlayerProps) {
  return <video src={PUBLIC_ORIGIN + productVideoWatchUrl(`demo:${id}`)} title="Business video"
    controls autoPlay playsInline preload="metadata"
    onCanPlay={()=>onEvent("ready")} onPlaying={()=>onEvent("ready")} onError={()=>onEvent("error")}
    style={{display:"block",width:"100%",height,objectFit:"contain",background:"#202428"}}/>;
}
