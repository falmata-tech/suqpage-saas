export type PickedImage = {uri:string;fileName?:string|null};
export type PickedImageFilePort = (uri:string) => Promise<Blob>;

/** Pass real file bytes to SDK-standard FormData, never the legacy URI object. */
export async function appendPickedImage(form:FormData,field:string,image:PickedImage,read:PickedImageFilePort):Promise<void>{
  const file=await read(image.uri);
  if(!file.size||file.size>5*1024*1024||!['image/jpeg','image/png','image/webp'].includes(file.type))throw new Error('Choose a JPG, PNG or WebP photo under 5 MB.');
  const extension=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg';
  form.append(field,file,image.fileName||`photo.${extension}`);
}
