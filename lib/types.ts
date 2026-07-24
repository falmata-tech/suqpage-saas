export type Business = {
  id: number; handle: string; name: string; design_key: string; design_manifest_json:string; tagline: string; description: string;
  logo_path: string; hero_title: string; hero_subtitle: string; hero_image_path: string;
  contact_email: string; whatsapp: string; telegram: string; tiktok: string;
  status: "active" | "draft" | "suspended"; site_title: string; site_description: string; favicon_path: string; content_version:number;
};
export type Collection = { id:number; business_id:number; name:string; slug:string; description:string; sort_order:number; is_active:number };
export type Category = { id:number; business_id:number; collection_id:number|null; name:string; slug:string; sort_order:number; is_active:number };
export type OptionGroup = { id:number; product_id:number; name:string; position:number; values:OptionValue[] };
export type OptionValue = { id:number; option_group_id:number; value:string };
export type Product = { id:number; business_id:number; collection_id:number|null; category_id:number|null; name:string; slug:string; eyebrow:string; description:string; image_path:string; availability:"available"|"limited"|"unavailable"|"coming_soon"; is_published:number; sort_order:number; collection_name?:string; category_name?:string; option_groups?:OptionGroup[] };
export type Catalog = { business:Business; collections:Collection[]; categories:Category[]; products:Product[] };
export type AccessRole = "platform_admin" | "client" | "team_member" | "operations_manager";
export type SessionUser = {
  id:number; email:string; name:string; role:"admin"|"owner"; access_role:AccessRole;
  business_id:number|null; must_change_password:number;
};
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
  detail:string; created_at:string; actor_name?:string|null; actor_access_role?:AccessRole|null;
};
export type ClientInvitation = {
  id:number; request_id:number|null; business_id:number; email:string; name:string;
  token_hash:string; expires_at:number; accepted_at:number|null; accepted_user_id:number|null;
  revoked_at:number|null; created_by_user_id:number; created_at:number;
};
export type ContentRevisionStatus = "draft"|"awaiting_review"|"approved"|"rejected"|"published"|"superseded";
export type ContentRevision = {
  id:number; request_id:number; business_id:number; revision_number:number;
  base_content_version:number; status:ContentRevisionStatus; snapshot_json:string;
  snapshot_schema_version:1|2|3|4;
  summary:string; recipe_import_hash:string|null; recipe_metadata_json:string|null;
  recipe_imported_by_user_id:number|null; recipe_imported_at:string|null;
  created_by_user_id:number; submitted_at:string|null;
  decided_by_user_id:number|null; decision_comment:string; decided_at:string|null;
  published_by_user_id:number|null; published_at:string|null;
  published_content_version:number|null; created_at:string; updated_at:string;
};
