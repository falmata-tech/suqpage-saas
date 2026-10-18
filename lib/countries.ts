import countries from './countries.json';

export const COUNTRIES: readonly { code: string; name: string }[] = countries;
const byCode = new Map(COUNTRIES.map(country => [country.code, country.name]));
export function isCountryCode(value: unknown): value is string {
  return typeof value === 'string' && byCode.has(value);
}
export function countryName(code: string, locale = 'en'): string {
  if (!byCode.has(code)) return '';
  try { return new Intl.DisplayNames([locale], { type: 'region' }).of(code) || byCode.get(code)!; }
  catch { return byCode.get(code)!; }
}
