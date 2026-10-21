import { parsePublicContacts, type PublicContactKind, type PublicContacts } from "./business-profile-contacts";

export type DemoContactMethod = "phone" | "whatsapp" | "telegram" | "website" | "tiktok" | "instagram" | "facebook";

/** Provider-owned public examples; these are not merchant identities or inboxes. */
export const DEMO_PROFILE_CONTACT_EXAMPLES = {
  website: "https://example.com/",
  tiktok: "tiktok",
  instagram: "instagram",
  facebook: "facebookapp",
} as const;

/** Operator input must be an explicit international number, never a username. */
export function normalizeDemoInquiryPhone(value: string | undefined): string | null {
  if (!value || /[\u0000-\u001f\u007f]/.test(value)) return null;
  const phone = value.trim().replace(/[ ()-]/g, "");
  return /^\+[1-9]\d{7,14}$/.test(phone) ? phone : null;
}

/** Approval is derived on the server from effective public contacts, not snapshots. */
export function approvedDemoContactMethods(
  isDemo: boolean | number | undefined,
  contacts: PublicContacts,
  configuredPhone: string | undefined,
): DemoContactMethod[] {
  if (!isDemo) return [];
  const approved = normalizeDemoInquiryPhone(configuredPhone);
  const result: DemoContactMethod[] = approved ? (["phone", "whatsapp", "telegram"] as const).filter(method => {
    try {
      const value = parsePublicContacts({ [method]: contacts[method] || "" })[method];
      if (!value || (method === "telegram" && !value.startsWith("+"))) return false;
      return `+${value.replace(/^\+/, "")}` === approved;
    } catch { return false; }
  }) : [];
  for (const method of ["website", "tiktok", "instagram", "facebook"] as const) {
    try {
      const value = parsePublicContacts({ [method]: contacts[method] || "" })[method];
      if (value === DEMO_PROFILE_CONTACT_EXAMPLES[method]) result.push(method);
    } catch { /* Malformed or unrelated example contacts remain inert. */ }
  }
  return result;
}

export function canOpenPublicContact(
  isDemo: boolean | number | undefined,
  approvedMethods: readonly DemoContactMethod[] | undefined,
  kind: PublicContactKind,
): boolean {
  return !isDemo || Boolean(approvedMethods?.some(method => method === kind));
}
