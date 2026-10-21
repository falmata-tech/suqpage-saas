import type {Catalog, Category, Product} from '../../lib/types';
import type {ShopPageContent} from '../../lib/owner-page-domain';

const product=(id:number,category_id:number|null,patch:Partial<Product>={}):Product=>({
  id,business_id:1,collection_id:null,category_id,name:'Product '+id,slug:'product-'+id,
  eyebrow:'',description:'A literal merchant product description.',image_path:'',video_ref:'',price_minor:null,
  currency:'ETB',quantity_unit:'piece',highlights_json:'[]',highlights:[],availability:'available',
  offering_kind:'standard_product',quantity_mode:'optional',capacity_summary:'',minimum_order_summary:'',
  lead_time_summary:'',is_published:1,sort_order:id,option_groups:[],...patch,
});
const category=(id:number,name:string,patch:Partial<Category>={}):Category=>({
  id,business_id:1,collection_id:null,name,slug:'category-'+id,sort_order:id,is_active:1,...patch,
});
export const categoryName='ለቤት የተሠሩ · Tables & seats';
export const longCategoryName='Custom-made household pieces — '+ 'ለቤትናለሥራቦታ'.repeat(8);
export const categoryCatalog:Catalog={
  business:{id:1,handle:'fixture-category-shop',name:'Fixture category business',design_key:'profile',
    design_manifest_json:'',content_blocks_json:'',tagline:'',description:'',logo_path:'',hero_title:'',
    hero_subtitle:'',hero_image_path:'',contact_email:'',whatsapp:'',telegram:'',tiktok:'',process_video_ref:'',
    is_live:0,live_platform:'',live_url:'',status:'active',site_title:'',site_description:'',favicon_path:'',content_version:1},
  collections:[],categories:[category(10,categoryName),category(20,longCategoryName),
    category(30,'Inactive name',{is_active:0}),category(40,'Foreign name',{business_id:2}),
    category(50,'Hidden-only name'),category(60,'Empty name'),category(70,'Service-only name')],
  products:[product(101,10,{name:'Oak table',description:'A smooth oak table.'}),
    product(102,10,{name:'Blue chair',description:'A blue wooden chair.',availability:'limited'}),
    product(103,20,{name:'Custom shelf'}),product(104,null,{name:'Unassigned cup'}),
    product(105,30,{name:'Inactive-category box',category_name:'FORGED old active name'}),
    product(106,40,{name:'Foreign-category bowl',category_name:'FORGED foreign name'}),
    product(107,50,{name:'Hidden product',is_published:0}),
    product(108,70,{name:'Retired service',offering_kind:'service'})],
};
export const categoryProfile:ShopPageContent={template:'profile-v1',coverStyle:'blended',introduction:'',
  about:'Literal merchant introduction.',heroImage:'',videoUrl:'',accentColor:'#087F75'};
