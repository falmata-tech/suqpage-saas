/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "The businesses you follow, easier to explore.",
  description: "Browse their products and services in one organized storefront, without digging through old posts. Explore the options and ask about exactly what you want.",
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For customers", title: "You know the business. Explore what they offer.",
    description: "Open their Suqpage page to browse products, services and options together, instead of piecing the details together from old posts.",
    action: "Explore the Market",
    benefits: [
      { icon: "shop", title: "Find the item.", description: "Browse named products and services, with photos, videos and details together." },
      { icon: "search", title: "Explore your options.", description: "See different styles and services. Ask the business about availability, pricing or an option you need." },
      { icon: "chat", title: "Ask about exactly what you want.", description: "Choose one item or gather several in an inquiry list. Send the details to the business on Suqpage or through its social channels." },
    ],
  },
  {
    id: "businesses", label: "For businesses", title: "Give every post a place to lead.",
    description: "Turn attention on TikTok, Telegram or WhatsApp into a clear next step: your own storefront, where customers can browse what you offer and contact you.",
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
