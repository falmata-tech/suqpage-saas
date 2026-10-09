import { productVideo } from './video/product-video';
export type ProductMedia = {kind: 'image' | 'video'; ref: string};
export const MAX_PRODUCT_IMAGES = 8;
export const MAX_PRODUCT_VIDEOS = 4;
export const MAX_PRODUCT_MEDIA = MAX_PRODUCT_IMAGES + MAX_PRODUCT_VIDEOS;
export const MAX_PRODUCT_UPLOAD_BYTES = 5 * 1024 * 1024;

export function parseProductMedia(value: unknown): ProductMedia[] {
  if (!Array.isArray(value) || value.length > MAX_PRODUCT_MEDIA) throw new Error('Use up to 8 photos and 4 videos.');
  const items = value.map((entry: unknown): ProductMedia => {
    if (!entry || typeof entry !== 'object' || Array.isArray(entry)) throw new Error('Invalid product media.');
    const item = entry as Record<string, unknown>;
    if (Object.keys(item).some(key => key !== 'kind' && key !== 'ref') || (typeof item.ref !== 'string' || item.ref.length > 300)) throw new Error('Invalid product media.');
    if (item.kind === 'image' && /^(?:\/uploads\/seed\/[A-Za-z0-9._/-]+|\/media\/[A-Za-z0-9.-]+|request-attachment:\d+)$/.test(item.ref) && !item.ref.includes('..')) return {kind: 'image', ref: item.ref};
    if (item.kind === 'video') { productVideo(item.ref); return {kind: 'video', ref: item.ref}; }
    throw new Error('Use a valid photo or video link.');
  });
  if (items.filter(item=>item.kind==='image').length > MAX_PRODUCT_IMAGES || items.filter(item=>item.kind==='video').length > MAX_PRODUCT_VIDEOS) throw new Error('Use up to 8 photos and 4 videos.');
  if (new Set(items.map(item=>`${item.kind}:${item.ref}`)).size !== items.length) throw new Error('Remove duplicate photos or video links.');
  return items;
}
export function productMedia(product: {image_path?: string; video_ref?: string; media?: ProductMedia[]; media_json?: string}): ProductMedia[] {
  const stored = product.media ?? (product.media_json ? JSON.parse(product.media_json) as unknown : []);
  const media = parseProductMedia(stored);
  return media.length ? media : [
    ...(product.image_path ? [{kind: 'image' as const, ref: product.image_path}] : []),
    ...(product.video_ref ? [{kind: 'video' as const, ref: product.video_ref}] : []),
  ];
}
export function updateLegacyMedia(product: Parameters<typeof productMedia>[0] | null, image: string, video: string): ProductMedia[] {
  const old = product ? productMedia(product) : [];
  const media = old.flatMap(item => {
    const replacement = item.kind === 'image' && item.ref === product?.image_path ? image
      : item.kind === 'video' && item.ref === product?.video_ref ? video : item.ref;
    return replacement ? [{kind:item.kind,ref:replacement}] : [];
  });
  if (image && !media.some(item=>item.kind==='image' && item.ref===image)) media.unshift({kind:'image',ref:image});
  if (video && !media.some(item=>item.kind==='video' && item.ref===video)) media.push({kind:'video',ref:video});
  return parseProductMedia(media);
}
