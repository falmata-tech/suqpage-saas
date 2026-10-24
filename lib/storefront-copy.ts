/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "Discover what Africa makes.",
  description: "Explore product showrooms from farms, factories and artisans without sifting through their social media posts.",
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For buyers", title: "Find products made in Africa.",
    description: "Explore products from farms, workshops and manufacturers. Ask about one item or a larger order directly with the supplier.",
    action: "Explore products",
    benefits: [
      { icon: "shop", title: "Find products.", description: "See what businesses make, grow and supply without scrolling through social posts." },
      { icon: "search", title: "Meet the supplier.", description: "Read its story and browse product options and listed availability." },
      { icon: "chat", title: "Discuss your order.", description: "Send selected products to its AfricMade Inbox or use its contact links. Agree on details directly with the supplier." },
    ],
  },
  {
    id: "businesses", label: "For suppliers", title: "Show buyers what you make or sell.",
    description: "Give your business one clear place for its story and products. Farms, home businesses, workshops, factories and other sellers can show what they supply and hear from interested buyers.",
    action: "Create your showroom",
    benefits: [
      { icon: "shop", title: "Introduce your business.", description: "Show where you work, what you make, grow or sell, and the story behind it." },
      { icon: "map", title: "Show what you supply.", description: "Add products, options and listed availability. Organize collections when useful." },
      { icon: "chat", title: "Connect with buyers.", description: "Get product enquiries in your AfricMade Inbox or through the contact channels you provide, then discuss the sale directly." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map.",
  description: "Find businesses near and far. Open a digital showroom to explore their story and products.",
} as const;
