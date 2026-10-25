/** Presentation identity only. Runtime origins and persisted/provider IDs are separate contracts. */
export const PLATFORM_BRAND = {
  name: "AfricMade",
  wordmark: { leading: "Afric", trailing: "Made", width: 1094, height: 212 },
  colors: { logo: "#ff4b00", action: "#c93600", ink: "#202428", cream: "#f4f4f2", white: "#ffffff" },
  assets: {
    mark: "/brand/africmade-showroom-mark-v3.png",
    wordmark: "/brand/africmade-wordmark-v3.png",
    emailWordmark: "/brand/africmade-wordmark-email-white-v3.png",
    wordmarkReverse: "/brand/africmade-wordmark-reverse-v3.png",
    notificationBadge: "/pwa/africmade-badge-96.png",
    favicon: "/pwa/africmade-favicon-v3-32.png",
    apple: "/pwa/africmade-apple-touch-v3-180.png",
    icon192: "/pwa/africmade-icon-v3-192.png",
    icon512: "/pwa/africmade-icon-v3-512.png",
    maskable512: "/pwa/africmade-maskable-v3-512.png",
  },
} as const;
