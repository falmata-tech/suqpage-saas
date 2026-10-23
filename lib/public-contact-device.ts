import type {PublicContactKind} from "./business-profile-contacts";
/** Product policy: external messaging is secondary on phones; unknown web stays text + Copy. */
export function publicContactIsPhone(platform:string,userAgent=""):boolean{
 return platform==="android"||platform==="ios"||platform==="web"&&/iPhone|iPod|Windows Phone|Android[^\n]*Mobile/i.test(userAgent);
}
export function publicContactDisplay(kind:PublicContactKind|"sms",contacts:{phone?:string;whatsapp?:string;telegram?:string}):string{
 return (kind==="sms"||kind==="phone"?contacts.phone:kind==="whatsapp"?contacts.whatsapp:kind==="telegram"?contacts.telegram:"")||"";
}
