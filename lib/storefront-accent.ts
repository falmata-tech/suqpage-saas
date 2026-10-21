/** Pure storefront color contract shared by web, native and server validation. */
export const ACCENT_ERROR = "Enter a color like #087F75.";
export const ACCENT_PRESETS = ["#087F75", "#FF00B8", "#B6FF00", "#7900FF", "#FFFF00", "#FFFFFF", "#000000"] as const;
export function parseAccentColor(value: unknown): string {
  if (value === undefined || value === "") return "";
  if (typeof value !== "string" || !/^#[0-9a-f]{6}$/i.test(value)) throw new Error(ACCENT_ERROR);
  return value.toUpperCase();
}
const rgb = (hex: string) => [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
const hex = (values: number[]) => "#" + values.map(n => Math.round(n).toString(16).padStart(2, "0")).join("").toUpperCase();
const luminance = (color: string) => rgb(color).map(n => {
  const v = n / 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4;
}).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
export function accentContrast(a: string, b: string): number {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x, y) + .05) / (Math.min(x, y) + .05);
}
export type StorefrontAccent = { accent: string; ink: string; soft: string; on: string; edge: string };
export function storefrontAccent(value?: string): StorefrontAccent | null {
  // Fail safely for older/untrusted cached client DTOs; writes use strict validation.
  let accent: string; try { accent = parseAccentColor(value); } catch { return null; }
  if (!accent) return null;
  let ink = accent;
  for (let step = 1; accentContrast(ink, "#FFFFFF") < 5.2 && step <= 100; step++) ink = hex(rgb(accent).map(n => n * (1 - step / 100)));
  return { accent, ink, soft: hex(rgb(accent).map(n => n * .075 + 255 * .925)),
    on: accentContrast(accent, "#000000") >= accentContrast(accent, "#FFFFFF") ? "#000000" : "#FFFFFF",
    edge: accentContrast(accent, "#FFFFFF") >= 3 ? accent : ink };
}
export function storefrontAccentVariables(value?: string): Record<string, string> {
  const palette = storefrontAccent(value);
  return palette ? Object.fromEntries(Object.entries(palette).map(([key, color]) => [`--store-${key}`, color])) : {};
}
