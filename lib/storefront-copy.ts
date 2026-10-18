/** Platform copy only. Merchant content never goes through this vocabulary. */
export const MARKET_STOREFRONT_COPY = {
  title: "A professional digital showroom for every business.",
  description: "Explore what businesses sell, make and grow. See each business’s product range, collections, options and story together, along with the availability it lists. Find what interests you, then contact the business directly—without digging through social posts.",
} as const;

export const ABOUT_STOREFRONT_SECTIONS = [
  {
    id: "customers", label: "For customers", title: "Know what a business offers before you message.",
    description: "Know the business behind the products. Browse its range, collections and options, read its story and check the availability it lists. Choose what interests you, then contact the business directly to ask questions and agree the details.",
    action: "Explore the Market",
    benefits: [
      { icon: "shop", title: "Explore the range.", description: "Get to know the business and its story. Browse collections, models, colors and styles with photos, videos and descriptions together." },
      { icon: "search", title: "Check availability.", description: "See the availability the business has listed. Check whether a product is ready to ship or made to order, then confirm the details before ordering." },
      { icon: "chat", title: "Ask on their social channels.", description: "Choose the items you like and open the business's social account. Your message and product links are ready to paste, so they know exactly what you mean." },
    ],
  },
  {
    id: "businesses", label: "For businesses", title: "Give your business a showroom worth sharing.",
    description: "Whether you sell online or from a shop, make products or grow them, give your business a showroom worth sharing. Bring your brand, story and product range together in one organized place. Share one link so customers can explore what you offer and contact you directly.",
    action: "Create your business page",
    benefits: [
      { icon: "shop", title: "Show what you offer.", description: "Workshops, farms, manufacturers and suppliers can show their range with clear photos and details. Organize products into collections when useful, and help customers understand the choices you offer." },
      { icon: "map", title: "Easy to find. Easy to share.", description: "Online sellers and local shops can choose a business area or pin a shop on the map. Give retail customers and trade buyers one showroom link to explore and share. No physical shop required." },
      { icon: "chat", title: "Make the details clear.", description: "Show whether products are ready to ship or made to order. Describe options and any capacity or timing you list. Customers can ask about specific items on your social accounts." },
    ],
  },
] as const;

export const CUSTOMER_MAP_COPY = {
  title: "Explore the map.",
  description: "Discover businesses near and far on the map. Open a showroom to explore their products and collections.",
} as const;
