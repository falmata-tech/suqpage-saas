/** Presentation identity only. Runtime origins and persisted/provider IDs are separate contracts. */
export const PLATFORM_BRAND = {
  name: "AfricMade",
  wordmark: { leading: "Afric", trailing: "Made", width: 1824, height: 500 },
  colors: { logo: "#ff4b00", action: "#c93600", ink: "#202428", cream: "#f4f4f2", white: "#ffffff" },
  assets: {
    mark: "/brand/africmade-afro-mark-v1.png",
    wordmark: "/brand/africmade-wordmark-v1.png",
    emailWordmark: "/brand/africmade-wordmark-email-white-v1.png",
    wordmarkReverse: "/brand/africmade-wordmark-reverse-v1.png",
    notificationBadge: "/pwa/africmade-badge-96.png",
    favicon: "/pwa/africmade-favicon-32.png",
    apple: "/pwa/africmade-apple-touch-icon-180.png",
    icon192: "/pwa/africmade-icon-192.png",
    icon512: "/pwa/africmade-icon-512.png",
    maskable512: "/pwa/africmade-maskable-512.png",
  },
} as const;
