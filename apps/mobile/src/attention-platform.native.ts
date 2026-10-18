import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import {Platform} from 'react-native';
import {overlayIsOpen} from './overlay-visibility';
const observed=new Set<number>();
let foregroundRoute='';
export function attentionRoute(path:string){foregroundRoute=path;}
Notifications.setNotificationHandler({handleNotification:async notification=>{
  const data=notification.request.content.data||{},id=Number(data.notificationId);
  const destination=data.destination as {screen?:string;id?:number}|undefined;
  const reading=!overlayIsOpen()&&(destination?.screen==='transport-chat'?foregroundRoute==='/buying':destination?.screen==='owner-chat'?foregroundRoute===`/owner/chat?id=${destination.id}`:false);
  const duplicate=observed.has(id);if(Number.isSafeInteger(id)){observed.add(id);if(observed.size>256)observed.delete(observed.values().next().value!);}
  return {shouldShowBanner:!reading&&!duplicate,shouldShowList:!reading&&!duplicate,shouldPlaySound:!reading&&!duplicate&&!data.silent,shouldSetBadge:false};
}});
export async function notificationDevice(){
  if(Platform.OS==='android'){
    await Notifications.setNotificationChannelAsync('suqpage-alerts',{name:'MirtPage',importance:Notifications.AndroidImportance.HIGH,sound:'default',vibrationPattern:[0,120]});
    await Notifications.setNotificationChannelAsync('suqpage-alerts-quiet',{name:'MirtPage · quiet',importance:Notifications.AndroidImportance.DEFAULT,sound:null,enableVibrate:false});
  }
  const permission=await Notifications.requestPermissionsAsync();if(permission.status!=='granted')throw new Error('Could not enable notifications. Try again.');
  const projectId=Constants.expoConfig?.extra?.eas?.projectId||Constants.easConfig?.projectId;
  if(!projectId)throw new Error('Could not enable notifications. Try again.');
  const token=(await Notifications.getExpoPushTokenAsync({projectId})).data;
  return {kind:'expo' as const,token};
}
export function listenToAttentionTap(open:(destination:unknown)=>void){
  const sub=Notifications.addNotificationResponseReceivedListener(response=>{open(response.notification.request.content.data?.destination);void Notifications.clearLastNotificationResponseAsync();});
  void Notifications.getLastNotificationResponseAsync().then(response=>{if(response){open(response.notification.request.content.data?.destination);void Notifications.clearLastNotificationResponseAsync();}});
  return ()=>sub.remove();
}
