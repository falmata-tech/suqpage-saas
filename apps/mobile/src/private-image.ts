export type PrivateImageBytes = {bytes:Uint8Array;extension:'jpg'|'png'|'webp'};
export type PrivateImageResource = {uri:string;dispose:()=>void};
export type PrivateImageResourcePort = (image:PrivateImageBytes)=>PrivateImageResource;

/** Private media is fetched with current Auth; native Image never owns bearer tokens. */
export async function readPrivateImage(response:Response):Promise<PrivateImageBytes>{
  if(!response.ok)throw new Error('Private image unavailable');
  const type=response.headers.get('content-type')?.split(';')[0];
  const extension=type==='image/jpeg'?'jpg':type==='image/png'?'png':type==='image/webp'?'webp':null;
  if(!extension || Number(response.headers.get('content-length')||0)>5*1024*1024)throw new Error('Invalid private image');
  const bytes=new Uint8Array(await response.arrayBuffer());
  if(!bytes.length||bytes.length>5*1024*1024)throw new Error('Invalid private image');
  return {bytes,extension};
}

export async function preparePrivateImage(response:Response,create:PrivateImageResourcePort,isCurrent:()=>boolean):Promise<PrivateImageResource|null>{
  const image=await readPrivateImage(response);
  if(!isCurrent())return null;
  const resource=create(image);
  if(!isCurrent()){resource.dispose();return null;}
  return resource;
}
