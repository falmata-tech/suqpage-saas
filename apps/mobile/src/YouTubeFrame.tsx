import React, { useMemo } from "react";
import { Platform, View } from "react-native";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import {
  nativePlayerNavigation,
  playerEvent,
  playerHtml,
  type PlayerProps,
} from "./youtube-player";
export default function YouTubeFrame({ id, height, onEvent }: PlayerProps) {
  const appId =
    Constants.executionEnvironment === "storeClient"
      ? "host.exp.exponent"
      : Platform.OS === "ios"
        ? Constants.expoConfig?.ios?.bundleIdentifier
        : Constants.expoConfig?.android?.package;
  const origin = "https://" + (appId || "com.suqpage.app").toLowerCase();
  const source = useMemo(
    () => ({ html: playerHtml(id, origin), baseUrl: origin + "/" }),
    [id, origin],
  );
  return (
    <View style={{height,width:"100%"}}><WebView
      source={source}
      style={{ flex:1, backgroundColor: "#000" }}
      scrollEnabled={false}
      javaScriptEnabled
      allowsInlineMediaPlayback
      allowsFullscreenVideo
      mediaPlaybackRequiresUserAction
      sharedCookiesEnabled={false}
      thirdPartyCookiesEnabled={false}
      setSupportMultipleWindows
      originWhitelist={["*"]}
      onShouldStartLoadWithRequest={(r) =>
        nativePlayerNavigation(r.url, origin)
      }
      onOpenWindow={() => {}}
      onMessage={(event) => {
        const value = playerEvent(event.nativeEvent.data);
        if (value) onEvent(value);
      }}
      onError={() => onEvent("error")}
      onHttpError={() => onEvent("error")}
      onRenderProcessGone={() => onEvent("error")}
      onContentProcessDidTerminate={() => onEvent("error")}
    /></View>
  );
}
