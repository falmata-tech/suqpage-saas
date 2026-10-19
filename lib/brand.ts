/** Presentation identity only. Runtime origins and persisted/provider IDs are separate contracts. */
export const PLATFORM_BRAND = {
  name: "MirtPage",
  wordmark: { leading: "Mirt", trailing: "Page", width: 440, height: 96 },
  colors: { logo: "#ff4b00", action: "#c93600", ink: "#202428", cream: "#f4f4f2", white: "#ffffff" },
  assets: {
    mark: "/brand/mirtpage-panels-mark.svg",
    wordmark: "/brand/mirtpage-panels-wordmark.svg",
    emailWordmark: "/brand/mirtpage-panels-wordmark-email.png",
    wordmarkReverse: "/brand/mirtpage-panels-wordmark-reverse.svg",
    notificationBadge: "/pwa/mirtpage-panels-badge-96.png",
    favicon: "/pwa/mirtpage-panels-favicon-32.png",
    apple: "/pwa/mirtpage-panels-apple-touch-icon.png",
    icon192: "/pwa/mirtpage-panels-icon-192.png",
    icon512: "/pwa/mirtpage-panels-icon-512.png",
    maskable512: "/pwa/mirtpage-panels-icon-maskable-512.png",
  },
} as const;
