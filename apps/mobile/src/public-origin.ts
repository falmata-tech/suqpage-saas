import { apiOrigin } from "@suqpage/contracts";

// Expo inlines this public value into the native bundle. Hosted builds qualify
// the exact target separately; development may point to the local web preview.
export const PUBLIC_ORIGIN = apiOrigin(
  process.env.EXPO_PUBLIC_API_ORIGIN || "https://mirtpage.com",
);

export function legalPageUrl(page: "privacy" | "terms"): string {
  return `${PUBLIC_ORIGIN}/${page}`;
}
