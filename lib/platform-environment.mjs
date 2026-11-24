/**
 * Expose current names to callers while supporting the two deployed namespaces.
 * Use presence so an explicit empty value is never replaced by an older secret.
 * @param {Readonly<Record<string, string | undefined>>} source
 * @returns {Record<string, string | undefined>}
 */
export function platformEnvironment(source = process.env) {
  const result = { ...source };
  for (const key of Object.keys(source)) {
    const match = /^(NEXT_PUBLIC_)?(?:AFRICMADE|SUQPAGE|MIRTPAGE)_(.+)$/.exec(key);
    if (!match) continue;
    const prefix = match[1] || "";
    const suffix = match[2];
    const current = prefix + "AFRICMADE_" + suffix;
    const previous = prefix + "SUQPAGE_" + suffix;
    const oldest = prefix + "MIRTPAGE_" + suffix;
    const selected = Object.hasOwn(source, current) ? current : Object.hasOwn(source, previous) ? previous : oldest;
    result[current] = result[previous] = source[selected];
  }
  return result;
}
