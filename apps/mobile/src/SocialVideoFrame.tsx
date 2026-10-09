import React,{useMemo} from 'react';
import {View} from 'react-native';
import {WebView} from 'react-native-webview';
import {socialPlayerHtml,socialPlayerNavigation,socialPlayerEvent} from './social-player';
import type {PlayerProps} from './youtube-player';

export default function SocialVideoFrame({id,height,onEvent,videoRef}:PlayerProps){
  const origin='https://suqpage.com';
  const source=useMemo(()=>({html:socialPlayerHtml(videoRef||`tiktok:${id}`,origin),baseUrl:origin+'/'}),[id,videoRef]);
  return <View style={{height,width:'100%'}}><WebView source={source} style={{flex:1,backgroundColor:'#202428'}} scrollEnabled={false} javaScriptEnabled allowsInlineMediaPlayback allowsFullscreenVideo mediaPlaybackRequiresUserAction sharedCookiesEnabled={false} thirdPartyCookiesEnabled={false} setSupportMultipleWindows originWhitelist={['*']} onShouldStartLoadWithRequest={request=>socialPlayerNavigation(request.url,origin)} onOpenWindow={()=>{}} onMessage={event=>{const value=socialPlayerEvent(event.nativeEvent.data);if(value)onEvent(value);}} onError={event=>{console.warn('Social video load failed',event.nativeEvent.code);onEvent('error');}} onHttpError={event=>{console.warn('Social video HTTP failure',event.nativeEvent.statusCode);onEvent('error');}} onRenderProcessGone={()=>onEvent('error')} onContentProcessDidTerminate={()=>onEvent('error')}/></View>;
}
