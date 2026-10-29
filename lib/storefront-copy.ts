/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "Discover African farmers, manufacturers, and artisans in one place.",
  description: "Learn about their story, product lineup, and their production capacity for bulk purchase or small orders, without getting lost searching through their social media posts.",
} as const;

/** Keep the owner's headline on phones; the supporting paragraph stays on web/About. */
export const MARKET_COMPACT_COPY = {
  title: MARKET_STOREFRONT_COPY.title,
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For buyers", title: "See the business before you ask to buy.",
    description: "Each supplier's page brings its story, products and any listed supply details together. Browse first, then ask about one item or a larger order without piecing everything together from social posts.",
    action: "Explore products",
    benefits: [
      { icon: "shop", title: "Discover the source.", description: "See who grows, makes or supplies the product and where the business works." },
      { icon: "search", title: "Understand the offer.", description: "Review product options, listed availability and capacity when the supplier provides them." },
      { icon: "chat", title: "Start a conversation.", description: "Send one product or a list to the supplier's AfricMade Inbox, or use its published contact details." },
    ],
  },
  {
    id: "businesses", label: "For suppliers", title: "Make your business easier to discover.",
    description: "Give buyers one dependable page for your story, products and the quantities you can offer. Whether you run a farm, workshop, factory, home business or shop, your work stays visible beyond the next social post.",
    action: "Create your page",
    benefits: [
      { icon: "shop", title: "Tell your story.", description: "Show what you make, grow or supply and the people and work behind it." },
      { icon: "map", title: "Present your range.", description: "Add product photos, options, availability and any capacity details you choose to share." },
      { icon: "chat", title: "Hear from buyers.", description: "Receive questions in AfricMade Inbox or through your listed contact methods, then agree on an order directly." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map.",
  description: "Find businesses near and far. Open their pages to see their stories and products.",
} as const;
