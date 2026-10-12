/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "See how close the businesses selling products you’ve loved on social media are to you.",
  description: "Browse their products, styles and services in organized online stores, then contact them directly without digging through old posts.",
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For customers", title: "Find the business behind the product you love.",
    description: "A business selling the product you loved on social media could be nearby. See its location, browse its products, styles and services in one organized store, and contact it directly.",
    action: "Explore the Market",
    benefits: [
      { icon: "shop", title: "Browse the collection.", description: "See the products and services a business has added, with photos, videos and details together." },
      { icon: "search", title: "Look closer.", description: "Explore models, colors and styles before asking the business about availability or the option you need." },
      { icon: "chat", title: "Ask about exactly what you want.", description: "Choose one item or gather several in an inquiry list. Send the details to the business on Suqpage or through its social channels." },
    ],
  },
  {
    id: "businesses", label: "For businesses", title: "An organized store for your social media customers.",
    description: "Give people who see your products on social media one organized store to browse. Show your products, styles and services, add your location, and share one link for direct inquiries.",
    action: "Create your business page",
    benefits: [
      { icon: "shop", title: "Show your full range.", description: "Organize your products, services and story on one page. Add clear names and details so customers can tell one item from another." },
      { icon: "map", title: "On the map. Easy to share.", description: "Pin your shop or choose your area, then add your Suqpage link to your social profiles. No physical shop required." },
      { icon: "chat", title: "Get straight to the right item.", description: "See which items a customer is asking about, so you can spend less time identifying the product and more time helping them." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map.",
  description: "See where businesses are located, then open their stores to browse what they offer and contact them directly.",
} as const;
