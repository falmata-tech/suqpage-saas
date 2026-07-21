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
