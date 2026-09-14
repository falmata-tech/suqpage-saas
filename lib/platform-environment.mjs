/**
 * Canonical environment names. The old prefix is accepted only at this boundary
 * so an already provisioned deployment can upgrade without moving credentials.
 * Explicit canonical values (including empty strings) always take precedence.
 * @param {Readonly<Record<string, string | undefined>>} source
 * @returns {Record<string, string | undefined>}
 */
export function platformEnvironment(source = process.env) {
  const result = { ...source };
  for (const [key, value] of Object.entries(source)) {
    const canonical = key.startsWith('MIRTPAGE_')
      ? `SUQPAGE_${key.slice('MIRTPAGE_'.length)}`
      : key.startsWith('NEXT_PUBLIC_MIRTPAGE_')
        ? `NEXT_PUBLIC_SUQPAGE_${key.slice('NEXT_PUBLIC_MIRTPAGE_'.length)}`
        : key;
    if (!(canonical in source)) result[canonical] = value;
  }
  return result;
}
