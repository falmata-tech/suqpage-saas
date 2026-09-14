// Only persisted-key migration belongs here. Domain/session validation stays in its adapter.
export const platformCookies = Object.freeze({
  session: { current: "suqpage_session", legacy: "mirtpage_session" },
  visitor: { current: "suqpage_visitor", legacy: "mirtpage_visitor" },
  support: { current: "suqpage_public_support", legacy: "mirtpage_public_support" },
});
export interface CookieReader { get(name: string): { value: string } | undefined }
export function platformCookie(reader: CookieReader, kind: keyof typeof platformCookies) {
  const names = platformCookies[kind];
  return reader.get(names.current)?.value ?? reader.get(names.legacy)?.value;
}
export interface BrowserStateStore {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}
export function readPlatformState(store: BrowserStateStore, key: string): string | null {
  const legacyKey = key.startsWith("suqpage-cart:") ? key.replace(/^suqpage-cart:/, "mirtpage-cart:")
    : key === "suqpage:discovery-navigation:v2" ? "mirtpage:discovery-navigation:v2"
      : key === "suqpage:last-marketplace-url:v1" ? "mirtpage:last-marketplace-url:v1" : null;
  try {
    const current = store.getItem(key);
    if (current !== null || !legacyKey || key.endsWith(":private-preview")) return current;
    const saved = store.getItem(legacyKey);
    if (saved !== null) {
      // Do not remove the recoverable old value when storage writes are blocked.
      try { store.setItem(key, saved); store.removeItem(legacyKey); } catch { /* still return saved state */ }
    }
    return saved;
  } catch { return null; }
}
