/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "Find local makers and suppliers for your next order.",
  description: "Browse products in digital showrooms from farms, workshops, factories and shops. See styles and listed availability, then ask about large orders or made-to-order items—without digging through social posts.",
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For customers", title: "Browse the products before you reach out.",
    description: "See what nearby farms grow and workshops or factories make, alongside what shops and importers carry. Browse their products, styles and listed availability in one digital showroom. Whether you’re shopping for yourself or sourcing a larger order, ask the business directly—without digging through social posts.",
    action: "Explore the Market",
    benefits: [
      { icon: "shop", title: "Meet the business behind the products.", description: "Read the business’s story, see where it is based and browse its products, photos and videos." },
      { icon: "search", title: "Know what’s on offer.", description: "Browse products, colors, sizes and optional collections. Check listed availability, then ask about larger quantities or made-to-order items." },
      { icon: "chat", title: "Ask about what you like.", description: "Send selected products to the business’s MirtPage Inbox or use its social links. The business can follow up with you to discuss the sale." },
    ],
  },
  {
    id: "businesses", label: "For businesses", title: "Give customers one place to see what you offer.",
    description: "From farms, workshops and factories to local shops and importers, MirtPage gives businesses of every size a digital showroom for their story and products. Organize what you grow, make, source, import or sell; customers can browse and ask about availability or larger quantities before contacting you.",
    action: "Create your showroom",
    benefits: [
      { icon: "shop", title: "Put your business in context.", description: "Introduce your business and location alongside the products you grow, make, source, import or sell. Shops, workshops, farms, factories and suppliers all belong." },
      { icon: "map", title: "Organize what you offer.", description: "Add products and choices such as sizes or colors. Use collections if they help. List whether products are available, made to order or unavailable." },
      { icon: "chat", title: "Follow up with interested customers.", description: "Customers can send selected products to your MirtPage Inbox or contact you through the social links you share. You handle the conversation and final sale." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map.",
  description: "Find businesses near and far. Open a digital showroom to explore their story and products.",
} as const;
