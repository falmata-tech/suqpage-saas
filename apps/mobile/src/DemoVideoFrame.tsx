import React, { useMemo } from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { demoPlayerEvent, demoPlayerHtml, demoPlayerNavigation } from "./demo-player";
import { PUBLIC_ORIGIN } from "./public-origin";
import type { PlayerProps } from "./youtube-player";

export default function DemoVideoFrame({ id, height, onEvent }: PlayerProps) {
  const source = useMemo(() => ({ html: demoPlayerHtml(id, PUBLIC_ORIGIN), baseUrl: PUBLIC_ORIGIN + "/" }), [id]);
  return <View style={{height,width:"100%"}}><WebView source={source} style={{flex:1,backgroundColor:"#202428"}}
    scrollEnabled={false} javaScriptEnabled allowsInlineMediaPlayback allowsFullscreenVideo
    mediaPlaybackRequiresUserAction={false} sharedCookiesEnabled={false} thirdPartyCookiesEnabled={false}
    setSupportMultipleWindows originWhitelist={["*"]}
    onShouldStartLoadWithRequest={request=>demoPlayerNavigation(request.url,PUBLIC_ORIGIN,id)}
    onOpenWindow={()=>{}}
    onMessage={event=>{const value=demoPlayerEvent(event.nativeEvent.data);if(value)onEvent(value);}}
    onError={()=>onEvent("error")} onHttpError={()=>onEvent("error")}
    onRenderProcessGone={()=>onEvent("error")} onContentProcessDidTerminate={()=>onEvent("error")}/></View>;
}
