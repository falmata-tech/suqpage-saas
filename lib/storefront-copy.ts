/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "Find the businesses you follow on social media.",
  description: "See where they’re located, browse their products and services in professional, organized digital stores, and contact them to order—without getting lost in the clutter of social media posts.",
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For customers", title: "Browse local businesses, without the clutter.",
    description: "Discover businesses on the map or open a store you already follow. Browse their products and services together, with photos, videos and details in one place.",
    action: "Explore the Market",
    benefits: [
      { icon: "shop", title: "Browse products and services.", description: "Browse named products and services, with photos, videos and details together." },
      { icon: "search", title: "Explore your options.", description: "See different styles and services. Ask the business about availability, pricing or an option you need." },
      { icon: "chat", title: "Ask about exactly what you want.", description: "Choose one item or gather several in an inquiry list. Send the details to the business on Suqpage or through its social channels." },
    ],
  },
  {
    id: "businesses", label: "For businesses", title: "Give your business a professional online store.",
    description: "Give your followers a clear view of what you offer. Keep products, services, photos and videos together, and share your Suqpage store on TikTok, Telegram or WhatsApp.",
    action: "Create your business page",
    benefits: [
      { icon: "shop", title: "Your catalog, organized.", description: "Present your products, services and story on one page. Update the details as your business changes." },
      { icon: "map", title: "On the map. Easy to share.", description: "Pin your shop or choose your area, then add your Suqpage link to your social profiles. No physical shop required." },
      { icon: "chat", title: "Start with a clearer inquiry.", description: "See which items a customer is asking about, so you can spend less time identifying the product and more time helping them." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map.",
  description: "Use the map to browse businesses in your area, then open their storefront to see what they offer.",
} as const;
