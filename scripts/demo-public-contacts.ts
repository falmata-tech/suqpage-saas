import { parsePublicContacts } from '../lib/business-profile-contacts';
import { normalizeDemoInquiryPhone } from '../lib/demo-inquiry-policy';

/** Explicit demo seed input only; never a fallback for real business contacts. */
export function demoPublicContacts(email: string, phone: string, approvedDemoPhone?: string) {
  const approved = normalizeDemoInquiryPhone(approvedDemoPhone);
  const safeExamplePhone = /^\+447700900\d{3}$/.test(phone) ? phone : '+447700900123';
  const destination = approved ?? safeExamplePhone;
  return parsePublicContacts({
    email: `${email.split('@')[0].replace(/[^a-zA-Z0-9+_.-]/g,'').slice(0,60)||'demo'}@example.invalid`,
    phone: destination,
    whatsapp: destination,
    website: 'https://example.invalid',
    telegram: approved ?? '', tiktok: '', instagram: '', facebook: '',
  });
}
