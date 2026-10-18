import { parsePublicContacts } from '../lib/business-profile-contacts';

/** Explicit demo seed input only; never a fallback for real business contacts. */
export function demoPublicContacts(email: string, phone: string) {
  return parsePublicContacts({
    email: `${email.split('@')[0].replace(/[^a-zA-Z0-9+_.-]/g,'').slice(0,60)||'demo'}@example.invalid`,
    phone: /^\+447700900\d{3}$/.test(phone)?phone:'+447700900123',
    whatsapp: /^\+447700900\d{3}$/.test(phone)?phone:'+447700900123',
    website: 'https://example.invalid',
    telegram: '', tiktok: '', instagram: '', facebook: '',
  });
}
