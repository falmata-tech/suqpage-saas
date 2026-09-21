import { parsePublicContacts } from './business-profile-contacts';
import { parseShopPageContent } from './owner-page-domain';
import type { OfferingKind } from './offerings';

// Explicit sample content for NEW private workspaces, never runtime fallbacks.
export const STARTER_NOTICE = 'Your page is filled with editable examples. Replace the sample text, images, video, prices, location and contact links with your own before sharing your business.';
export const STARTER_ABOUT = 'Sample page: Welcome to our business. Explore our products, services and custom work, read the details, and tell us what you need. We can help you choose an item, arrange a service or discuss a made-to-order request. Replace this introduction with your own story and what makes your business special.';
export const STARTER_VIDEO_REF = 'youtube:M7lc1UVf-VE';
export const STARTER_VIDEO_URL = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';
export const STARTER_IMAGE_ROOT = '/uploads/seed/starter';
export const starterContacts = parsePublicContacts({
  email: 'hello@example.test', phone: '+447700900123', website: 'https://example.com',
  whatsapp: '+447700900123', tiktok: 'your_business_example',
  instagram: 'your_business_example', telegram: 'your_business_example', facebook: 'your_business_example',
});
export const starterPage = parseShopPageContent({
  template: 'profile-v1', coverStyle: 'blended', introduction: '', about: STARTER_ABOUT,
  heroImage: `${STARTER_IMAGE_ROOT}/cover.png`, videoUrl: STARTER_VIDEO_URL, contacts: starterContacts,
});

export type StarterOffering = {
  name: string; slug: string; description: string; kind: OfferingKind; image: string;
  unit: string; priceMinor: number; highlights: string[]; option: string; values: string[];
};
export const starterOfferings: readonly StarterOffering[] = [
  { name: 'Sample everyday product', slug: 'sample-everyday-product', kind: 'standard_product',
    description: 'Sample product: Describe what this item does, who it is for and the choices you offer. The illustration, price and description are examples to replace with your own.',
    image: `${STARTER_IMAGE_ROOT}/product.png`, unit: '', priceMinor: 50000,
    highlights: [], option: '', values: [] },
  { name: 'Sample consultation service', slug: 'sample-consultation-service', kind: 'service',
    description: 'Sample service: Introduce the help or expertise you offer. Explain what a session includes and invite customers to discuss their needs. Describe your session length, location and price.',
    image: `${STARTER_IMAGE_ROOT}/service.png`, unit: '', priceMinor: 75000,
    highlights: [], option: '', values: [] },
  { name: 'Sample custom order', slug: 'sample-custom-order', kind: 'standard_product',
    description: 'Sample custom work: Show something you can make to a customer’s requirements. Invite them to share ideas and agree the details through an inquiry. This example is not a checkout or confirmed order.',
    image: `${STARTER_IMAGE_ROOT}/custom.png`, unit: '', priceMinor: 150000,
    highlights: [], option: '', values: [] },
];
