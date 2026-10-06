/** Deep links are untrusted; server validation remains authoritative on submit. */
export function inquiryOptions(value: unknown): Record<string, string> {
  if (typeof value !== 'string' || value.length > 4096) return {};
  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    const entries = Object.entries(parsed);
    if (entries.length > 20 || entries.some(([key, item]) =>
      key.length > 100 || typeof item !== 'string' || item.length > 200 ||
      ['__proto__', 'constructor', 'prototype'].includes(key))) return {};
    return Object.fromEntries(entries) as Record<string, string>;
  } catch { return {}; }
}
