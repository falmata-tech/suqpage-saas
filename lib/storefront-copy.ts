/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "Discover African farmers, manufacturers, and artisans in one place.",
  description: "Learn about their story, product lineup, and their production capacity for bulk purchase or small orders, without getting lost searching through their social media posts.",
} as const;

/** Keep the owner's headline on phones; the supporting paragraph stays on web/About. */
export const MARKET_COMPACT_COPY = {
  title: MARKET_STOREFRONT_COPY.title,
} as const;

export const ABOUT_INTRO = "AfricMade brings together businesses that grow, make and supply goods in Africa. Here you can see what they offer, learn about their work and get in touch with them directly.";

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "businesses", label: "For sellers", title: "A showroom for your business",
    description: "Create a page for your farm, workshop, factory or shop. Put your products, photos and contact details in one place so customers know what they can order and how to reach you.",
    action: "Create your page",
    benefits: [
      { icon: "shop", title: "Show what you make", description: "Tell customers who you are, where you work and what goes into your products." },
      { icon: "search", title: "Share your order details", description: "List what is available, what you make to order and the quantities you can supply." },
      { icon: "chat", title: "Talk to customers directly", description: "Answer questions in your AfricMade inbox or through the contact details on your page." },
    ],
  },
  {
    id: "customers", label: "For buyers", title: "Find the people behind the products",
    description: "Browse products from farms, workshops and other suppliers. When you find something you need, ask the seller about price, quantity and delivery, then work out the order with them.",
    action: "Browse products",
    benefits: [
      { icon: "search", title: "Compare products", description: "Look through photos, sizes, materials and availability where sellers have listed them." },
      { icon: "shop", title: "Get to know a supplier", description: "Visit their showroom to see their range and learn how they work." },
      { icon: "chat", title: "Ask about an order", description: "Send an inquiry for one product or several items from the same seller." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map",
  description: "Find suppliers by location and visit their showrooms.",
} as const;
