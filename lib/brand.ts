/** Presentation identity only. Runtime origins and persisted/provider IDs are separate contracts. */
export const PLATFORM_BRAND = {
  name: "AfricMade",
  wordmark: { leading: "Afric", trailing: "Made", width: 1094, height: 300 },
  colors: { logo: "#ff4b00", action: "#c93600", ink: "#202428", cream: "#f4f4f2", white: "#ffffff" },
  assets: {
    mark: "/brand/africmade-maker-mark-v2.png",
    wordmark: "/brand/africmade-wordmark-v2.png",
    emailWordmark: "/brand/africmade-wordmark-email-white-v2.png",
    wordmarkReverse: "/brand/africmade-wordmark-reverse-v2.png",
    notificationBadge: "/pwa/africmade-badge-96.png",
    favicon: "/pwa/africmade-favicon-v2-32.png",
    apple: "/pwa/africmade-apple-touch-v2-180.png",
    icon192: "/pwa/africmade-icon-v2-192.png",
    icon512: "/pwa/africmade-icon-v2-512.png",
    maskable512: "/pwa/africmade-maskable-v2-512.png",
  },
} as const;
