/** Only repository-owned static illustrations enter the native SVG parser. */
export function isStaticSeedSvg(ref: string): boolean {
  return /^\/uploads\/seed\/[a-z0-9_-]+(?:\/[a-z0-9_-]+)*\.svg$/i.test(ref);
}
