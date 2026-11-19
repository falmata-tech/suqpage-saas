/** Exact creator footage reviewed for a fictional showroom. Expand only after
 * checking moving frames, subject fit, and playback in the containing page. */
export const DEMO_SOCIAL_VIDEOS = {
  21: {
    handle: 'demo-liya-soap-kitchen',
    ref: 'tiktok:7703762862484851981',
    source: 'https://www.tiktok.com/@brambleberry/video/7703762862484851981',
    creator: 'Bramble Berry',
    family: 'soap',
    label: 'Soap-making example',
  },
  24: {
    handle: 'demo-sena-body-care',
    ref: 'tiktok:7638698619176340749',
    source: 'https://www.tiktok.com/@brambleberry/video/7638698619176340749',
    creator: 'Bramble Berry',
    family: 'body-butter',
    label: 'Making whipped body butter',
  },
  26: {
    handle: 'demo-zema-plant-balms',
    ref: 'tiktok:7614568317126184205',
    source: 'https://www.tiktok.com/@brambleberry/video/7614568317126184205',
    creator: 'Bramble Berry',
    family: 'lip-balm',
    label: 'Mixing and pouring lip care',
  },
} as const;

export function demoSocialVideoForHandle(handle: string) {
  return Object.values(DEMO_SOCIAL_VIDEOS).find(video => video.handle === handle);
}

export function approvedDemoSocialVideo(ref: string, businessId: number): boolean {
  return DEMO_SOCIAL_VIDEOS[businessId as keyof typeof DEMO_SOCIAL_VIDEOS]?.ref === ref;
}
