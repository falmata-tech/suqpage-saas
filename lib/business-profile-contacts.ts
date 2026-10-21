import type { Business } from "./types";

export const publicContactFields = [
  { key: "phone", label: "Public phone", placeholder: "+251…", type: "tel" },
  { key: "email", label: "Public email", placeholder: "", type: "email" },
  { key: "website", label: "Website", placeholder: "https://…", type: "url" },
  { key: "whatsapp", label: "WhatsApp number", placeholder: "+251…", type: "tel" },
  { key: "tiktok", label: "TikTok username", placeholder: "@yourshop", type: "text" },
  { key: "instagram", label: "Instagram username", placeholder: "@yourshop", type: "text" },
  { key: "telegram", label: "Telegram username or phone number", placeholder: "@yourshop / +251…", type: "text" },
  { key: "facebook", label: "Facebook username", placeholder: "yourshop", type: "text" },
] as const;
export type PublicContactKind = typeof publicContactFields[number]["key"];
export type PublicContacts = Partial<Record<PublicContactKind, string>>;
export type PublicContactLink = { kind: PublicContactKind; label: string; href: string; external: boolean };

export function parsePublicContacts(input: unknown): PublicContacts {
  if (!input || typeof input !== "object" || Array.isArray(input)
    || Object.keys(input).some((key) => !publicContactFields.some((field) => field.key === key))) throw new Error("Check the public contact details.");
  const result: PublicContacts = {};
  for (const { key, label } of publicContactFields) {
    if (!(key in input)) continue;
    const raw = (input as Record<string, unknown>)[key];
    if (typeof raw !== "string" || raw.length > 500 || /[\u0000-\u001f\u007f]/.test(raw)) throw new Error(key === "telegram" ? "Enter a Telegram username or phone number with its country code." : `Check ${label.toLowerCase()}.`);
    let value = raw.trim();
    if (value) {
      if (key === "phone" || key === "whatsapp") {
        value = value.replace(/[ ()-]/g, "");
        if (!/^\+?[1-9]\d{7,14}$/.test(value)) throw new Error(`Enter ${label.toLowerCase()} with its country code.`);
      } else if (key === "email") {
        if (value.length > 254 || !/^[a-zA-Z0-9.!#$&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+$/.test(value)) throw new Error("Enter a valid public email.");
      } else if (key === "website") {
        let url: URL;
        try { url = new URL(value); } catch { throw new Error("Enter a complete HTTPS website address."); }
        if (url.protocol !== "https:" || url.username || url.password || !url.hostname.includes(".") || /\s/.test(value)) throw new Error("Enter a complete HTTPS website address without credentials.");
        value = url.href;
      } else if (key === "telegram") {
        value = value.startsWith("+") ? value.replace(/[ ()-]/g, "") : value.replace(/^@/, "");
        if (!(value.startsWith("+") ? /^\+[1-9]\d{7,14}$/ : /^[a-zA-Z0-9_][a-zA-Z0-9_.]{0,63}$/).test(value)) throw new Error("Enter a Telegram username or phone number with its country code.");
      } else {
        value = value.replace(/^@/, "");
        if (!/^[a-zA-Z0-9_][a-zA-Z0-9_.]{0,63}$/.test(value)) throw new Error(`Enter a valid ${label.toLowerCase()}, without a link.`);
      }
    }
    result[key] = value;
  }
  return result;
}

export function legacyPublicContacts(business: Pick<Business, "whatsapp" | "telegram" | "tiktok" | "public_email" | "public_phone">): PublicContacts {
  const result: PublicContacts = {};
  // Only explicitly public fields may populate this fallback.
  for (const [key, value] of [["email", business.public_email], ["phone", business.public_phone]] as const) {
    if (value === undefined) continue;
    try { Object.assign(result, parsePublicContacts({ [key]: value || "" })); } catch { /* Omit malformed retained values. */ }
  }
  for (const key of ["whatsapp", "telegram", "tiktok"] as const) {
    try { Object.assign(result, parsePublicContacts({ [key]: business[key] || "" })); } catch { /* Omit malformed retained values. */ }
  }
  return result;
}

export function publicContactLinks(contacts: PublicContacts): PublicContactLink[] {
  const labels: Record<PublicContactKind, string> = { phone: "Call", email: "Email", website: "Website", whatsapp: "WhatsApp", tiktok: "TikTok", instagram: "Instagram", telegram: "Telegram", facebook: "Facebook" };
  const result: PublicContactLink[] = [];
  for (const { key } of publicContactFields) {
    let value: string | undefined;
    try { value = parsePublicContacts({ [key]: contacts[key] || "" })[key]; } catch { continue; }
    if (!value) continue;
    const encoded = encodeURIComponent(value);
    const href = key === "phone" ? `tel:+${value.replace(/^\+/, "")}` : key === "email" ? `mailto:${encoded}` : key === "website" ? value
      : key === "whatsapp" ? `https://wa.me/${value.replace(/^\+/, "")}` : key === "telegram" ? `https://t.me/${value.startsWith("+") ? value : encoded}`
      : key === "tiktok" ? `https://www.tiktok.com/@${encoded}` : key === "instagram" ? `https://www.instagram.com/${encoded}/` : `https://www.facebook.com/${encoded}`;
    result.push({ kind: key, label: key === "phone" ? `+${value.replace(/^\+/, "")}` : key === "email" ? value : labels[key], href, external: key !== "phone" && key !== "email" });
  }
  return result;
}

export const socialContactFields = publicContactFields.filter(field =>
  ["whatsapp", "telegram", "tiktok", "instagram", "facebook"].includes(field.key));

/** Public business contact now hands off to configured social accounts only. */
export function socialContactLinks(contacts: PublicContacts): PublicContactLink[] {
  return publicContactLinks(contacts).filter(link =>
    ["whatsapp", "telegram", "tiktok", "instagram", "facebook"].includes(link.kind));
}
