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
  categoryId?: number | null;
  categoryName?: string;
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
  categories?: Array<{ id: number; name: string }>;
  version: number;
  status: string;
  isDemo: boolean;
  approvedDemoContactMethods?: Array<"phone" | "whatsapp" | "telegram" | "website" | "tiktok" | "instagram" | "facebook">;
};
export type MapShop = {
  countryCode?:string;
  cityId?:string;
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
  offeringKind?: string;
  availability?: string;
  kind: "product" | "business";
  id: number;
  name: string;
  description: string;
  image: string;
  handle: string;
  businessName: string;
  city?: string;
  region?: string;
};
export type Market = {
  items: SearchItem[];
  showrooms: MapShop[];
  nearbyGroups?: NearbyGroup[];
  categories: Array<{ key: string; label: string }>;
  places: Array<{ key: string; label: string; countryCode?:string }>;
  countries?:Array<{code:string;count:number}>;
  page: number;
  pages: number;
  total: number;
};
export type Featured = {
  broadcastLabel: string;
  tiktokUrl: string;
  youtubeUrl: string;
  sponsors: Array<{
    id: string;
    name: string;
    details: string;
    imagePath: string;
    href: string;
  }>;
  title: string;
  date: string;
  policy: {
    startMinute: number;
    endMinute: number;
    presentationMinutes: number;
    changeoverMinutes: number;
    sponsorMentionCount: number;
    sponsorMentionMinutes: number;
  };
  schedule: Array<{
    weekday: number;
    dayLabel: string;
    dateIso: string;
    dateLabel: string;
    industryKey: string;
    industryLabel: string;
    isToday: boolean;
  }>;
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
  exampleVideoRef?: string;
  activity?: {visitsTotal:number;visits30Days:number;newInquiries:number;products:number};
  user: { name: string; email: string; phone: string };
  shop: Shop;
  draft: { version: number; content: Profile; assistanceEnabled?: boolean } | null;
  publicationRevision: number;
  issues: Array<{ label: string }>;
};
export type InquiryReceipt={inquiryId:number;duplicate:boolean;status:"received"};
export type Inquiry = {
  id: number;
  createdAt: string;
  readAt: string | null;
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
export type TransportMethod = 'air' | 'truck' | 'van' | 'car' | 'motorcycle';
export type TransportPlanLeg = {
  id: string;
  providerName: string;
  origin: string;
  destination: string;
  method: TransportMethod;
};
export type TransportPlan = { version: number; legs: TransportPlanLeg[] };

export type Conversation = {
  id: number;
  subject: string;
  status: string;
  publicRef: string;
  lastMessageAt: number;
  resolvedAt?: number | null;
  agentJoined?: boolean;
  replyState?: 'needs_reply' | 'overdue' | 'waiting_customer' | null;
  staffReplyDueAt?: number | null;
  idleWarningAt?: number | null;
  idleEndsAt?: number | null;
  idleEndedAt?: number | null;
  transportPlan?: TransportPlan;
  transportPlanLink?: string;
};
export type SupportAttachment = { id:number; originalName:string; mimeType:string; byteSize:number };
export type Message = {
  id: number;
  body: string;
  createdAt: number;
  senderName: string;
  attachment?: SupportAttachment | null;
  read?: boolean;
  sender?: 'owner' | 'staff' | 'visitor';
};
export type Buying = {
  publicRef: string;
  createdAt?: number;
  serverNow?: number;
  transportWaitStartedAt?: number;
  agentJoinedAt?: number | null;
  firstStaffReplyAt?: number | null;
  status: string;
  assignedUserName: string | null;
  agentJoined?: boolean;
  resolvedAt?: number | null;
  replyState?: 'needs_reply' | 'overdue' | 'waiting_customer' | null;
  staffReplyDueAt?: number | null;
  idleWarningAt?: number | null;
  idleEndsAt?: number | null;
  idleEndedAt?: number | null;
  transportPlan?: TransportPlan;
  transportPlanLink?: string;
  transportCallback?: { phone: string | null; email: string | null; submitted: boolean };
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
