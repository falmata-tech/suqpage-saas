/** Display-only localization. Never use translated text as persisted or submitted data. */
export const locales = ["en", "am", "om", "so", "ti"] as const;
export type Locale = typeof locales[number];
export const languageNames: Record<Locale, string> = {
  en: "English", am: "አማርኛ", om: "Afaan Oromo", so: "Soomaali", ti: "ትግርኛ",
};
export const localeCookie = "suqpage-language";
export function parseLocale(value: unknown): Locale {
  return typeof value === "string" && locales.includes(value as Locale) ? value as Locale : "en";
}
export type UiMessages = Readonly<Record<string, string>>;
export type UiValues = Readonly<Record<string, string | number>>;
export type UiText = (source: string, values?: UiValues) => string;
export function messageKey(source: string): string {
  let hash = 2166136261;
  for (const char of source) { hash ^= char.codePointAt(0)!; hash = Math.imul(hash, 16777619); }
  return `m${(hash >>> 0).toString(16)}`;
}
const translators = new WeakMap<UiMessages, UiText>();
export function createUiText(messages: UiMessages): UiText {
  const cached = translators.get(messages);
  if (cached) return cached;
  const translate: UiText = (source, values) => {
    const text = messages[messageKey(source)] || source;
    // Replace tokens once. Inserted merchant text is always literal, never parsed again.
    return values ? text.replace(/\{([A-Za-z][A-Za-z0-9_]*)\}/g, (token, key: string) => Object.hasOwn(values, key) ? String(values[key]) : token) : text;
  };
  translators.set(messages, translate);
  return translate;
}
