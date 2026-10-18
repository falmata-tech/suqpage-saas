import React, { useEffect, useState, useCallback } from "react";
import {
  AppState,
  Platform,
  Pressable,
  View,
  Text,
  StyleSheet,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useApp } from "./runtime";
import { Photo, Icon, Button, Copy, colors } from "./ui";
import YouTubeFrame from "./YouTubeFrame";
import SocialVideoFrame from "./SocialVideoFrame";
import { productVideo,normalizeProductVideoUrl } from "../../../lib/video/product-video";
import LoadingBar from "./LoadingBar";
import { youtubeId, type PlayerEvent } from "./youtube-player";
export default function YouTubeVideo({
  video,
  posterTint,
  poster,
  height = 270,
  active = true,
  privateImage = false,
  allowSocial = false,
}: {
  video: string;
  posterTint?: string;
  poster?: string;
  height?: number;
  active?: boolean;
  privateImage?: boolean;
  allowSocial?: boolean;
}) {
  const { t } = useApp(),
    parsed = (()=>{try{return allowSocial ? video.includes(":")&&!video.startsWith("https:") ? productVideo(video) : normalizeProductVideoUrl(video) : null;}catch{return null;}})(),
    tikTok = parsed?.provider === "tiktok" || parsed?.provider === "instagram",
    social = parsed && parsed.provider !== "youtube",
    id = social ? parsed.providerId : youtubeId(video),
    Frame = social ? SocialVideoFrame : YouTubeFrame;
  const [focused, setFocused] = useState(true);
  const [playing, setPlaying] = useState(false),
    [state, setState] = useState<"loading" | "ready" | "error">("loading"),
    [attempt, setAttempt] = useState(0);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => {
        setFocused(false);
        setPlaying(false);
      };
    }, []),
  );
  useEffect(() => {
    setPlaying(false);
    setState("loading");
  }, [video, active, focused]);
  useEffect(() => {
    if (Platform.OS === "web") {
      const stop = () => {
        if (document.hidden) setPlaying(false);
      };
      document.addEventListener("visibilitychange", stop);
      return () => document.removeEventListener("visibilitychange", stop);
    }
    const sub = AppState.addEventListener("change", (next) => {
      if (next !== "active") setPlaying(false);
    });
    return () => sub.remove();
  }, []);
  useEffect(() => {
    if (!playing || state !== "loading") return;
    const timeout = setTimeout(() => setState("error"), 20000);
    return () => clearTimeout(timeout);
  }, [playing, state, attempt]);
  function event(value: PlayerEvent) {
    setState(current=>value === "ready" && current === "error" ? current : value);
  }
  function start() {
    setState("loading");
    setAttempt((n) => n + 1);
    setPlaying(true);
  }
  if (!id || state === "error")
    return (
      <View
        style={{
          minHeight: height,
          padding: 18,
          justifyContent: "center",
          gap: 12,
          backgroundColor: colors.background,
        }}
      >
        <Copy>{t("Video unavailable")}</Copy>
        {Boolean(id) && <Button secondary label={t("Try again")} onPress={start} />}
      </View>
    );
  if (playing && active && focused)
    return (
      <View style={{ gap: 5 }}>
        <View style={{height:Math.max(200,height),backgroundColor:'#202428',overflow:'hidden'}}>
          {tikTok&&poster?<View style={[StyleSheet.absoluteFill,{pointerEvents:'none',opacity:.45}]}><Photo refPath={poster} height={Math.max(200,height)} privateImage={privateImage} blurRadius={12}/></View>:null}
          <View style={{height:Math.max(200,height),width:tikTok?Math.max(200,height)*9/16:'100%',maxWidth:'100%',alignSelf:'center'}}><Frame
          key={video + attempt}
          id={id}
          videoRef={parsed?.managedRef}
          height={Math.max(200, height)}
          onEvent={event}
        /></View></View>
        {state === "loading" && (
          <LoadingBar label={t("Loading video…")} />
        )}
      </View>
    );
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("Watch video")}
      disabled={!active}
      onPress={start}
    >
      {social && !poster ? <View style={{height,backgroundColor:colors.background,alignItems:"center",justifyContent:"center"}}><Copy>{parsed.provider === 'instagram' ? 'Instagram' : parsed.provider === 'facebook' ? 'Facebook' : 'TikTok'}</Copy></View> : <Photo
        privateImage={privateImage}
        refPath={poster || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        height={height}
      />}
      {posterTint ? <View style={[StyleSheet.absoluteFill, { pointerEvents:'none',backgroundColor: posterTint, opacity: .08 }]} /> : null}
      <View style={p.overlay}>
        <View style={p.circle}>
          <Icon name="play" color="white" size={28} />
        </View>
      </View>
    </Pressable>
  );
}
const p = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0002",
  },
  circle: {
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#0009",
    borderWidth: 1,
    borderColor: "#ffffffaa",
  },
});
