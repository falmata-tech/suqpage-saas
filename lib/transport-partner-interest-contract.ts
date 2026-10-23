/** Portable validation only: no HTTP, database, credentials or mail vendor. */
export type PartnerInterest = Readonly<{
  companyName: string;
  contactName: string;
  email: string;
  phone: string | null;
  message: string;
  locale: 'en' | 'am' | 'om';
  idempotencyKey: string;
}>;
export type PartnerInterestField = keyof PartnerInterest;
export type PartnerInterestResult =
  | { ok: true; value: PartnerInterest }
  | { ok: false; field: PartnerInterestField | null; code: 'invalid_partner_interest' };

const fields = new Set(['companyName', 'contactName', 'email', 'phone', 'message', 'locale', 'idempotencyKey']);
const count = (value: string) => Array.from(value).length;
function name(value: unknown, maximum: number): string | null {
  if (typeof value !== 'string' || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const normalized = value.normalize('NFC').trim().replace(/\s+/g, ' ');
  return count(normalized) >= 2 && count(normalized) <= maximum ? normalized : null;
}

export function parsePartnerInterest(raw: unknown): PartnerInterestResult {
  const invalid = (field: PartnerInterestField | null): PartnerInterestResult => ({ ok: false, field, code: 'invalid_partner_interest' });
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return invalid(null);
  const input = raw as Record<string, unknown>;
  if (Object.keys(input).some(key => !fields.has(key))) return invalid(null);
  const companyName = name(input.companyName, 160);
  if (companyName === null) return invalid('companyName');
  const contactName = name(input.contactName, 80);
  if (contactName === null) return invalid('contactName');
  if (typeof input.email !== 'string') return invalid('email');
  const email = input.email.normalize('NFC').trim().toLowerCase();
  if (email.length > 160 || /[\u0000-\u001f\u007f]/.test(input.email) || !/^[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+$/.test(email)) return invalid('email');
  if (input.phone !== undefined && input.phone !== null && typeof input.phone !== 'string') return invalid('phone');
  const phone = typeof input.phone === 'string' ? input.phone.trim().replace(/[\s().-]/g, '') : '';
  if (phone && !/^\+?[0-9]{7,15}$/.test(phone)) return invalid('phone');
  if (typeof input.message !== 'string') return invalid('message');
  const message = input.message.normalize('NFC').replace(/\r\n?/g, '\n').trim();
  if (!message || count(message) > 4000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/.test(message)) return invalid('message');
  if (typeof input.locale !== 'string' || !['en', 'am', 'om'].includes(input.locale)) return invalid('locale');
  if (typeof input.idempotencyKey !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.idempotencyKey)) return invalid('idempotencyKey');
  return { ok: true, value: Object.freeze({ companyName, contactName, email, phone: phone || null, message, locale: input.locale as PartnerInterest['locale'], idempotencyKey: input.idempotencyKey.toLowerCase() }) };
}
