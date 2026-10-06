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
import { youtubeId, type PlayerEvent } from "./youtube-player";
export default function YouTubeVideo({
  video,
  posterTint,
  poster,
  height = 270,
  active = true,
  privateImage = false,
}: {
  video: string;
  posterTint?: string;
  poster?: string;
  height?: number;
  active?: boolean;
  privateImage?: boolean;
}) {
  const { t } = useApp(),
    id = youtubeId(video);
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
    setState(value);
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
        {id && <Button secondary label={t("Try again")} onPress={start} />}
      </View>
    );
  if (playing && active && focused)
    return (
      <View style={{ gap: 5 }}>
        <YouTubeFrame
          key={video + attempt}
          id={id}
          height={Math.max(200, height)}
          onEvent={event}
        />
        {state === "loading" && (
          <Text
            accessibilityLiveRegion="polite"
            style={{ fontSize: 12, color: colors.muted }}
          >
            {t("Loading video…")}
          </Text>
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
      <Photo
        privateImage={privateImage}
        refPath={poster || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
        height={height}
      />
      {posterTint ? <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: posterTint, opacity: .08 }]} /> : null}
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
