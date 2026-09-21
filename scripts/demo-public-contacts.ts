import { parsePublicContacts } from '../lib/business-profile-contacts';

/** Explicit demo seed input only; never a fallback for real business contacts. */
export function demoPublicContacts(email: string, phone: string) {
  return parsePublicContacts({
    email, phone, whatsapp: phone, website: 'https://example.com',
    telegram: 'alhayabrand', tiktok: 'alhayabrand',
    instagram: 'alhayabrand', facebook: 'alhayabrand',
  });
}
