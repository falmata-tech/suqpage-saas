export type Business = {
  id: number; handle: string; name: string; design_key: string; tagline: string; description: string;
  logo_path: string; hero_title: string; hero_subtitle: string; hero_image_path: string;
  contact_email: string; whatsapp: string; telegram: string; tiktok: string;
  status: "active" | "draft" | "suspended"; site_title: string; site_description: string; favicon_path: string;
};
export type Collection = { id:number; business_id:number; name:string; slug:string; description:string; sort_order:number; is_active:number };
export type Category = { id:number; business_id:number; collection_id:number|null; name:string; slug:string; sort_order:number; is_active:number };
export type OptionGroup = { id:number; product_id:number; name:string; position:number; values:OptionValue[] };
export type OptionValue = { id:number; option_group_id:number; value:string; stock_count:number };
export type Product = { id:number; business_id:number; collection_id:number|null; category_id:number|null; name:string; slug:string; eyebrow:string; description:string; image_path:string; availability:"available"|"limited"|"unavailable"|"coming_soon"; stock_count:number; is_published:number; sort_order:number; collection_name?:string; category_name?:string; option_groups?:OptionGroup[] };
export type Catalog = { business:Business; collections:Collection[]; categories:Category[]; products:Product[] };
export type SessionUser = { id:number; email:string; name:string; role:"admin"|"owner"; business_id:number|null; must_change_password:number };
export type ServiceRequestType = "onboarding" | "change";
export type ServiceRequestStatus =
  | "submitted" | "under_review" | "needs_information" | "approved_for_work"
  | "in_progress" | "client_review" | "client_approved" | "published"
  | "completed" | "rejected" | "cancelled";
export type ServiceRequest = {
  id:number; public_ref:string; business_id:number|null; represented_client_user_id:number|null;
  request_type:ServiceRequestType; status:ServiceRequestStatus; contact_name:string;
  contact_value:string; business_name:string; request_text:string;
  submitter_kind:"public"|"client"|"manager"; submitted_by_user_id:number|null;
  assigned_user_id:number|null; idempotency_key:string|null; notification_state:"pending"|"sent"|"failed"|"not_required";
  created_at:string; updated_at:string;
};
export type RequestAttachment = {
  id:number; request_id:number; storage_key:string; original_name:string;
  mime_type:"image/jpeg"|"image/png"|"image/webp"; byte_size:number;
  width:number; height:number; created_at:string;
};
export type RequestEvent = {
  id:number; request_id:number; actor_user_id:number|null; event_type:string;
  detail:string; created_at:string;
};
