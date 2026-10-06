/** Platform-neutral mobile wire contracts. No application or vendor imports. */
export const MOBILE_API_VERSION = 1 as const;
export type Locale = "en" | "am" | "om" | "so" | "ti";
export type Media = { kind: "image" | "video"; ref: string };
export type Contacts = Partial<
  Record<
    | "phone"
    | "email"
    | "website"
    | "whatsapp"
    | "telegram"
    | "tiktok"
    | "instagram"
    | "facebook",
    string
  >
>;
export type Offering = {
  id: number;
  name: string;
  description: string;
  kind: string;
  priceMinor: number | null;
  media: Media[];
  published: boolean;
  availability: string;
  quantityMode: string;
  options: Array<{ name: string; values: string[] }>;
};
export type Shop = {
  id: number;
  handle: string;
  name: string;
  about: string;
  cover: string;
  logo?: string;
  videoUrl: string;
  accentColor?: string;
  contacts: Contacts;
  products: Offering[];
  version: number;
  status: string;
  isDemo: boolean;
};
export type MapShop = {
  id: number;
  handle: string;
  name: string;
  description: string;
  heroImagePath: string;
  city: string;
  region: string;
  latitude: number;
  longitude: number;
  locationMode?: "area" | "storefront" | "legacy";
  isDemo?: boolean;
  isLive?: boolean;
  isFeatured?: boolean;
};
export type NearbyGroup = { key: string; city: string; latitude: number; longitude: number; showroomIds: number[] };
export type SearchItem = {
  kind: "product" | "business";
  id: number;
  name: string;
  description: string;
  image: string;
  handle: string;
  businessName: string;
};
export type Market = {
  items: SearchItem[];
  showrooms: MapShop[];
  nearbyGroups?: NearbyGroup[];
  categories: Array<{ key: string; label: string }>;
  places: Array<{ key: string; label: string }>;
  page: number;
  pages: number;
  total: number;
};
export type Featured = {
  broadcastLabel: string;
  sponsors: Array<{
    id: string;
    name: string;
    details: string;
    imagePath: string;
    href: string;
  }>;
  title: string;
  date: string;
  slots: Array<{ slot: number; revealed: boolean; shop: MapShop | null }>;
  nowBusinessId: number | null;
};
export type Profile = {
  template: "profile-v1";
  coverStyle: "blended" | "overlay";
  introduction: string;
  about: string;
  heroImage: string;
  videoUrl: string;
  accentColor?: string;
  contacts?: Contacts;
};
export type OwnerHome = {
  user: { name: string; email: string; phone: string };
  shop: Shop;
  draft: { version: number; content: Profile } | null;
  publicationRevision: number;
  issues: Array<{ label: string }>;
};
export type Inquiry = {
  id: number;
  customerName: string;
  contact: string;
  contactMethod: string;
  note: string;
  status: string;
  items: Array<{ name: string; quantity: string; options: Record<string,string> }>;
};
export type Page<T> = {
  items: T[];
  page: number;
  pages: number;
  total: number;
};
export type Conversation = {
  id: number;
  subject: string;
  status: string;
  publicRef: string;
  lastMessageAt: number;
};
export type SupportAttachment = { id:number; originalName:string; mimeType:string; byteSize:number };
export type Message = {
  id: number;
  body: string;
  createdAt: number;
  senderName: string;
  attachment?: SupportAttachment | null;
};
export type Buying = {
  publicRef: string;
  status: string;
  assignedUserName: string | null;
  messages: Array<Message & { sender: "visitor" | "staff" }>;
};
export type ApiError = { error: string; code?: string };
export function apiOrigin(raw: string): string {
  const url = new URL(raw);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/"
  )
    throw Error("Use an API origin without a path.");
  if (
    url.protocol !== "https:" &&
    !(
      url.protocol === "http:" &&
      /^(localhost|127\.0\.0\.1|10\.0\.2\.2|192\.168\.\d+\.\d+|10\.\d+\.\d+\.\d+)$/.test(
        url.hostname,
      )
    )
  )
    throw Error("Use HTTPS for the API.");
  return url.origin;
}
export function publicLink(base: string, path: string): string {
  const url = new URL(path, base);
  if (
    !["https:", "http:"].includes(url.protocol) ||
    url.origin !== new URL(base).origin
  )
    throw Error("Invalid Suqpage link.");
  return url.href;
}
