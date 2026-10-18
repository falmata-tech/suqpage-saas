import {Platform} from 'react-native';
import {Directory,File,Paths} from 'expo-file-system';
import type {InquiryBasketStorage} from './inquiry-baskets';
const prefix='suqpage-business-inquiry-v1-';
export function createInquiryBasketStorage(apiOrigin:string):InquiryBasketStorage {
 const url=new URL(apiOrigin);
 if(!['https:','http:'].includes(url.protocol)||url.username||url.password)throw Error('Invalid inquiry storage environment.');
 const environment=encodeURIComponent(url.origin),key=prefix+environment+'-';
 const directory=()=>new Directory(Paths.document,'suqpage-inquiries',environment);
 return {
 async read(id){
  if(Platform.OS==='web')return localStorage.getItem(key+id);
  const file=new File(directory(),`${id}.json`);
  return file.exists&&file.size<=65_536?file.text():null;
 },
 async write(id,value){
  if(Platform.OS==='web'){localStorage.setItem(key+id,value);return;}
  const dir=directory();dir.create({idempotent:true,intermediates:true});
  const pending=new File(dir,`${id}.pending`),target=new File(dir,`${id}.json`);
  pending.write(value);await pending.move(target,{overwrite:true});
 },
 };
}
