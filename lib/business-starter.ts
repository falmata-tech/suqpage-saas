import { parsePublicContacts } from './business-profile-contacts';
import { parseShopPageContent } from './owner-page-domain';
import type { OfferingKind } from './offerings';

// Explicit sample content for NEW private workspaces, never runtime fallbacks.
export const STARTER_NOTICE = 'Make this example page your own before publishing.';
export const STARTER_ABOUT = 'Sample page: Thoughtful pieces for everyday use. Browse our collection or tell us about a product you would like made. Based in Addis Ababa, we welcome questions about colors, sizes and custom orders.';
export const STARTER_VIDEO_REF = 'youtube:M7lc1UVf-VE';
export const STARTER_VIDEO_URL = 'https://www.youtube.com/watch?v=M7lc1UVf-VE';
export const STARTER_IMAGE_ROOT = '/uploads/seed/starter';
// Reuse admitted fictional ceramics demo photography as editable sample media.
export const STARTER_PHOTO_ROOT = '/uploads/seed/benchmarks/entoto-ceramics';
export const starterContacts = parsePublicContacts({
  email: 'hello@example.invalid', phone: '+447700900123', website: 'https://example.invalid',
  whatsapp: '+447700900123', tiktok: '',
  instagram: '', telegram: '', facebook: '',
});
export const starterPage = parseShopPageContent({
  template: 'profile-v1', coverStyle: 'blended', introduction: '', about: STARTER_ABOUT,
  heroImage: `${STARTER_PHOTO_ROOT}/hero.jpg`, videoUrl: STARTER_VIDEO_URL, contacts: starterContacts,
});

export type StarterOffering = {
  name: string; slug: string; description: string; kind: OfferingKind; image: string; galleryImage: string;
  unit: string; priceMinor: number; highlights: string[]; option: string; values: string[];
};
export const starterOfferings: readonly StarterOffering[] = [
  { name: 'Sample everyday product', slug: 'sample-everyday-product', kind: 'standard_product',
    description: 'Sample product: A ceramic cup for everyday coffee or tea. A simple shape, a comfortable handle and a soft neutral finish make it easy to use at home or give as a gift. Ask about colors and matching pieces.',
    image: `${STARTER_PHOTO_ROOT}/product-1.jpg`, galleryImage: `${STARTER_PHOTO_ROOT}/product-2.jpg`, unit: '', priceMinor: 50000,
    highlights: [], option: '', values: [] },
  { name: 'Sample ceramic vase', slug: 'sample-ceramic-vase', kind: 'standard_product',
    description: 'Sample product: A textured ceramic vase for a shelf, table or small flower arrangement. Compare the shape and finish, then ask about available colors and sizes.',
    image: `${STARTER_PHOTO_ROOT}/product-3.jpg`, galleryImage: `${STARTER_PHOTO_ROOT}/product-4.jpg`, unit: '', priceMinor: 75000,
    highlights: [], option: '', values: [] },
  { name: 'Sample custom order', slug: 'sample-custom-order', kind: 'made_to_order',
    description: 'Sample made-to-order product: A ceramic set for your table, a special gift or your business. Tell us the colors, shapes and number of pieces you have in mind. We will discuss the design and price before making it.',
    image: `${STARTER_PHOTO_ROOT}/product-2.jpg`, galleryImage: `${STARTER_PHOTO_ROOT}/product-1.jpg`, unit: '', priceMinor: 150000,
    highlights: [], option: '', values: [] },
];
