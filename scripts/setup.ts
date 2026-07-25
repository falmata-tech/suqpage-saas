import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { databasePath, ensureRuntimeDirectories } from "../lib/config";
import { catalogToRevisionSnapshot } from "../lib/revision-domain";
import { migrateDatabase } from "../lib/schema";
import { curatedManifestForLegacyDesign, type LegacyShowroomDesignKey } from "../lib/showroom-manifests";
import type {
  Business,
  Catalog,
  Category,
  Collection,
  OptionGroup,
  OptionValue,
  Product,
} from "../lib/types";

const dbPath = databasePath();
if (process.argv.includes("--reset")) {
  for (const file of [dbPath, `${dbPath}-shm`, `${dbPath}-wal`]) if (fs.existsSync(file)) fs.rmSync(file);
}
ensureRuntimeDirectories();
const db = new DatabaseSync(dbPath);
try { fs.chmodSync(dbPath, 0o600); } catch {}
migrateDatabase(db);

const count = (db.prepare("SELECT COUNT(*) total FROM businesses").get() as { total: number }).total;
if (count > 0) {
  console.log(`Database already contains ${count} businesses. Use npm run reset to reseed.`);
  process.exit(0);
}

const addBusiness = db.prepare(`INSERT INTO businesses(handle,name,design_key,design_manifest_json,tagline,description,logo_path,hero_title,hero_subtitle,hero_image_path,contact_email,whatsapp,telegram,tiktok,status) VALUES(@handle,@name,'composition',@design_manifest_json,@tagline,@description,@logo_path,@hero_title,@hero_subtitle,@hero_image_path,@contact_email,@whatsapp,@telegram,@tiktok,'active')`);
const addCollection = db.prepare("INSERT INTO collections(business_id,name,slug,description,sort_order) VALUES(?,?,?,?,?)");
const addCategory = db.prepare("INSERT INTO categories(business_id,collection_id,name,slug,sort_order) VALUES(?,?,?,?,?)");
const addProduct = db.prepare(`INSERT INTO products(business_id,collection_id,category_id,name,slug,eyebrow,description,image_path,availability,is_published,sort_order) VALUES(?,?,?,?,?,?,?,?,?,1,?)`);
const addGroup = db.prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,?,?)");
const addValue = db.prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,?)");

const businesses = [
  { handle:"alhayabrand", name:"Al Haya Brand", sourceDesign:"alhaya", tagline:"Modest essentials, presented with grace.", description:"A refined collection of niqabs, hijabs, abayas and jilbabs.", logo_path:"/uploads/seed/alhaya/logo.png", hero_title:"Quiet elegance for every day.", hero_subtitle:"Explore thoughtfully selected modest wear and send one clear inquiry.", hero_image_path:"/uploads/seed/alhaya/hero-featured.jpg", contact_email:"", whatsapp:"", telegram:"AlHayaModest", tiktok:"alhayabrand" },
  { handle:"usashopet", name:"USAshopET", sourceDesign:"usashopet", tagline:"Beauty and wellness sourced from the U.S.", description:"Skincare, wellness and personal-care favorites.", logo_path:"/uploads/seed/usashopet/logo.png", hero_title:"Your U.S. beauty shelf, closer to home.", hero_subtitle:"Browse trusted personal-care essentials and ask about several products at once.", hero_image_path:"/uploads/seed/usashopet/hero.jpg", contact_email:"", whatsapp:"", telegram:"", tiktok:"usashopet" },
  { handle:"novatech", name:"NovaTech", sourceDesign:"novatech", tagline:"Flagship technology, curated without compromise.", description:"Category-defining devices for work, creativity and everyday life.", logo_path:"/uploads/seed/novatech/logo.png", hero_title:"The next generation is here.", hero_subtitle:"Flagship devices, precise product conversations and human confirmation.", hero_image_path:"/uploads/seed/novatech/iphone-17-pro.jpg", contact_email:"", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"homevibe", name:"HomeVibe", sourceDesign:"homevibe", tagline:"Objects that make home feel considered.", description:"Recognizable appliances and home essentials selected room by room.", logo_path:"/uploads/seed/homevibe/logo.svg", hero_title:"A calmer, smarter home.", hero_subtitle:"Discover useful design, trusted appliances and pieces worth living with.", hero_image_path:"/uploads/seed/homevibe/dyson-v16.jpg", contact_email:"", whatsapp:"", telegram:"", tiktok:"" }
] satisfies Array<Record<string,string> & { sourceDesign:LegacyShowroomDesignKey }>;

const seeded = new Map<string, number>();
for (const business of businesses) {
  const { sourceDesign, ...businessValues } = business;
  seeded.set(
    business.handle,
    Number(
      addBusiness.run({
        ...businessValues,
        design_manifest_json: JSON.stringify(
          curatedManifestForLegacyDesign(sourceDesign),
        ),
      }).lastInsertRowid,
    ),
  );
}

function seedCatalog(handle: string, collectionName: string, categoryNames: string[], products: any[]) {
  const businessId = seeded.get(handle)!;
  const collectionId = Number(addCollection.run(businessId, collectionName, collectionName.toLowerCase().replace(/[^a-z0-9]+/g,"-"), "Seed collection", 0).lastInsertRowid);
  const cats = new Map<string, number>();
  categoryNames.forEach((name, i) => cats.set(name, Number(addCategory.run(businessId, collectionId, name, name.toLowerCase().replace(/[^a-z0-9]+/g,"-"), i).lastInsertRowid)));
  products.forEach((p, i) => {
    const productId = Number(addProduct.run(businessId, collectionId, cats.get(p.category)!, p.name, p.slug, p.eyebrow, p.description, p.image, p.availability || "available", i).lastInsertRowid);
    (p.options || []).slice(0,4).forEach((g:any, gi:number) => {
      const groupId = Number(addGroup.run(productId, g.name, gi).lastInsertRowid);
      g.values.forEach((v:string) => addValue.run(groupId, v));
    });
  });
}

seedCatalog("alhayabrand", "Signature Collection", ["Niqabs","Hijabs","Abayas","Jilbabs"], [
  {name:"Noor Collection",slug:"noor-collection",category:"Niqabs",eyebrow:"Five-piece niqab",description:"A versatile five-piece set with a flowing finish.",image:"/uploads/seed/alhaya/niqab-noor.jpg",options:[{name:"Color",values:["Deep Black","Chocolate","Pearl Grey","Sand Beige"]},{name:"Set",values:["Five-piece set"]}]},
  {name:"Ayla Collection",slug:"ayla-collection",category:"Niqabs",eyebrow:"Soft layered niqab",description:"A softly structured niqab designed for comfortable daily wear.",image:"/uploads/seed/alhaya/niqab-ayla.jpg",options:[{name:"Color",values:["Forest Olive","Warm Sand","Dusty Mint"]}]},
  {name:"Mariam Hijab",slug:"mariam-hijab",category:"Hijabs",eyebrow:"Everyday hijab",description:"A lightweight hijab with natural drape.",image:"/uploads/seed/alhaya/hijab-mariam.jpg",options:[{name:"Color",values:["Mocha","Cream","Mushroom"]},{name:"Size",values:["1m × 2m"]}]},
  {name:"Safwa Abaya",slug:"safwa-abaya",category:"Abayas",eyebrow:"Refined abaya",description:"A clean silhouette with understated detailing.",image:"/uploads/seed/alhaya/abaya-safwa.jpg",options:[{name:"Color",values:["Midnight","Chocolate","Stone Grey"]},{name:"Size",values:["52","54","56","58"]}]},
  {name:"Layan Jilbab",slug:"layan-jilbab",category:"Jilbabs",eyebrow:"Two-piece jilbab",description:"An easy, full-coverage set with a balanced drape.",image:"/uploads/seed/alhaya/jilbab-layan.jpg",options:[{name:"Color",values:["Olive","Midnight Navy","Warm Taupe"]},{name:"Size",values:["S/M","L/XL"]}]}
]);

seedCatalog("usashopet", "Beauty Shelf", ["Skincare","Wellness","Hair","Body"], [
  {name:"CeraVe Hydrating Facial Cleanser",slug:"cerave-hydrating-cleanser",category:"Skincare",eyebrow:"Gentle cleanse",description:"A daily cleanser for normal-to-dry skin.",image:"/uploads/seed/usashopet/gentle-cleanser.jpg",options:[{name:"Size",values:["8 oz","12 oz","16 oz"]}]},
  {name:"TruSkin Vitamin C Facial Serum",slug:"truskin-vitamin-c",category:"Skincare",eyebrow:"Brightening serum",description:"A lightweight vitamin C serum for a simple morning routine.",image:"/uploads/seed/usashopet/vitamin-c.jpg",options:[{name:"Size",values:["1 fl oz"]}]},
  {name:"Vital Proteins Collagen Peptides",slug:"vital-proteins-collagen",category:"Wellness",eyebrow:"Daily wellness",description:"Unflavored collagen peptides for drinks and recipes.",image:"/uploads/seed/usashopet/collagen.jpg",options:[{name:"Size",values:["10 oz","20 oz"]}]},
  {name:"One A Day Women's Multivitamin",slug:"one-a-day-women",category:"Wellness",eyebrow:"Daily vitamins",description:"A familiar daily multivitamin option.",image:"/uploads/seed/usashopet/daily-vitamins.jpg",options:[{name:"Count",values:["100 tablets","200 tablets"]}]},
  {name:"Mielle Rosemary Mint Scalp & Hair Strengthening Oil",slug:"mielle-rosemary-oil",category:"Hair",eyebrow:"Hair care",description:"A scalp and hair oil for a focused care routine.",image:"/uploads/seed/usashopet/hair-care.jpg",options:[{name:"Size",values:["2 fl oz"]}]},
  {name:"e.l.f. Halo Glow Liquid Filter",slug:"elf-halo-glow",category:"Skincare",eyebrow:"Complexion",description:"A glow-enhancing complexion product.",image:"/uploads/seed/usashopet/makeup.jpg",options:[{name:"Shade",values:["1 Fair","2 Fair/Light","3 Light/Medium","4 Medium"]}]},
  {name:"Sol de Janeiro Brazilian Bum Bum Cream",slug:"sol-de-janeiro-cream",category:"Body",eyebrow:"Body care",description:"A scented body cream with a rich texture.",image:"/uploads/seed/usashopet/body-care.jpg",options:[{name:"Size",values:["75 ml","240 ml"]}]},
  {name:"Supergoop! Unseen Sunscreen SPF 40",slug:"supergoop-unseen",category:"Skincare",eyebrow:"Daily SPF",description:"An invisible-finish sunscreen primer.",image:"/uploads/seed/usashopet/sunscreen.jpg",options:[{name:"Size",values:["20 ml","50 ml"]}]}
]);

seedCatalog("novatech", "Flagship Collection", ["Phones","Computers","Tablets","Wearables","Audio"], [
  {name:"iPhone 17 Pro",slug:"iphone-17-pro",category:"Phones",eyebrow:"Apple flagship",description:"A professional flagship phone built around performance, camera capability and a refined pro experience.",image:"/uploads/seed/novatech/iphone-17-pro.jpg",options:[{name:"Color",values:["Silver","Deep Blue","Cosmic Orange"]},{name:"Storage",values:["256 GB","512 GB","1 TB"]},{name:"Region",values:["United States","Middle East"]}]},
  {name:"Samsung Galaxy S26 Ultra",slug:"galaxy-s26-ultra",category:"Phones",eyebrow:"Samsung flagship",description:"A large-screen flagship with an advanced camera system and S Pen productivity.",image:"/uploads/seed/novatech/galaxy-s26-series.jpg",availability:"limited",options:[{name:"Color",values:["Titanium Black","Titanium Silver"]},{name:"Storage",values:["256 GB","512 GB","1 TB"]}]},
  {name:"MacBook Pro 14-inch with M5",slug:"macbook-pro-m5",category:"Computers",eyebrow:"Pro computing",description:"A compact professional notebook for demanding creative and technical work.",image:"/uploads/seed/novatech/macbook-pro-m5.jpg",options:[{name:"Memory",values:["16 GB","24 GB","32 GB"]},{name:"Storage",values:["512 GB","1 TB","2 TB"]},{name:"Color",values:["Space Black","Silver"]}]},
  {name:"iPad Pro with M5",slug:"ipad-pro-m5",category:"Tablets",eyebrow:"Portable studio",description:"A thin creative canvas for illustration, editing and mobile work.",image:"/uploads/seed/novatech/ipad-pro-m5.jpg",options:[{name:"Size",values:["11-inch","13-inch"]},{name:"Storage",values:["256 GB","512 GB","1 TB"]},{name:"Connectivity",values:["Wi‑Fi","Wi‑Fi + Cellular"]}]},
  {name:"Apple Watch Ultra 3",slug:"apple-watch-ultra-3",category:"Wearables",eyebrow:"Adventure wearable",description:"A performance watch for training, travel and outdoor use.",image:"/uploads/seed/novatech/apple-watch-ultra-3.jpg",availability:"limited",options:[{name:"Band",values:["Alpine Loop","Trail Loop","Ocean Band"]},{name:"Band size",values:["Small","Medium","Large"]}]},
  {name:"Sony WH-1000XM6",slug:"sony-wh-1000xm6",category:"Audio",eyebrow:"Premium audio",description:"Flagship wireless headphones with advanced noise cancellation.",image:"/uploads/seed/novatech/sony-wh-1000xm6.svg",options:[{name:"Color",values:["Black","Platinum Silver","Midnight Blue"]}]}
]);

seedCatalog("homevibe", "Home Edit", ["Cleaning","Kitchen","Coffee","Lighting"], [
  {name:"Dyson V16 Piston Animal",slug:"dyson-v16",category:"Cleaning",eyebrow:"Whole-home cleaning",description:"A cordless vacuum designed for powerful everyday cleaning.",image:"/uploads/seed/homevibe/dyson-v16.jpg",options:[{name:"Finish",values:["Black/Copper"]},{name:"Bundle",values:["Standard","Pet home"]}]},
  {name:"KitchenAid Artisan Series 5 Quart Tilt-Head Stand Mixer",slug:"kitchenaid-artisan",category:"Kitchen",eyebrow:"Kitchen icon",description:"A recognizable stand mixer for baking and everyday preparation.",image:"/uploads/seed/homevibe/kitchenaid-artisan.webp",options:[{name:"Color",values:["Empire Red","Matte Black","Milkshake","Contour Silver"]}]},
  {name:"iRobot Roomba Max 705 Combo",slug:"roomba-max-705",category:"Cleaning",eyebrow:"Hands-off floor care",description:"Robot vacuum and mop support for busy homes.",image:"/uploads/seed/homevibe/roomba-max-705.webp",availability:"limited",options:[{name:"Dock",values:["AutoWash Dock"]}]},
  {name:"Le Creuset Signature Round Dutch Oven",slug:"le-creuset-dutch-oven",category:"Kitchen",eyebrow:"Cookware classic",description:"Enameled cast iron made for slow cooking and table-ready serving.",image:"/uploads/seed/homevibe/le-creuset-dutch-oven.jpg",options:[{name:"Size",values:["5.5 qt","7.25 qt"]},{name:"Color",values:["Flame","Cerise","Marseille","White"]}]},
  {name:"Ninja Crispi Air Fryer",slug:"ninja-crispi",category:"Kitchen",eyebrow:"Compact cooking",description:"A compact air-frying system for quick meals and reheating.",image:"/uploads/seed/homevibe/ninja-crispi.svg",options:[{name:"Color",values:["Stone","Sage","Blue"]}]},
  {name:"Nespresso Vertuo Creatista",slug:"nespresso-vertuo-creatista",category:"Coffee",eyebrow:"Coffee ritual",description:"Vertuo coffee with integrated milk-texturing control.",image:"/uploads/seed/homevibe/nespresso-vertuo-creatista.svg",options:[{name:"Finish",values:["Stainless Steel"]}]},
  {name:"Vitamix Ascent X5",slug:"vitamix-ascent-x5",category:"Kitchen",eyebrow:"Countertop performance",description:"A high-performance blender for smoothies, soups and prep.",image:"/uploads/seed/homevibe/vitamix-ascent-x5.svg",options:[{name:"Color",values:["Brushed Stainless","Graphite"]}]},
  {name:"Philips Hue Play Gradient Lightstrip",slug:"philips-hue-gradient",category:"Lighting",eyebrow:"Ambient lighting",description:"A gradient lightstrip for immersive room lighting.",image:"/uploads/seed/homevibe/philips-hue-gradient.svg",options:[{name:"Screen size",values:["55 inch","65 inch","75 inch"]}]}
]);

const seededGroupQuery = db.prepare(
  "SELECT * FROM option_groups WHERE product_id=? ORDER BY position,id",
);
const seededValueQuery = db.prepare(
  "SELECT * FROM option_values WHERE option_group_id=? ORDER BY id",
);
const retainBaseline = db.prepare(
  "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind) VALUES(?,1,?,'baseline')",
);
for (const businessId of seeded.values()) {
  const business = db
    .prepare("SELECT * FROM businesses WHERE id=?")
    .get(businessId) as unknown as Business;
  const collections = db
    .prepare("SELECT * FROM collections WHERE business_id=? ORDER BY sort_order,name")
    .all(businessId) as unknown as Collection[];
  const categories = db
    .prepare("SELECT * FROM categories WHERE business_id=? ORDER BY sort_order,name")
    .all(businessId) as unknown as Category[];
  const products = db
    .prepare(
      `SELECT p.*,c.name collection_name,cat.name category_name
       FROM products p
       LEFT JOIN collections c ON c.id=p.collection_id
       LEFT JOIN categories cat ON cat.id=p.category_id
       WHERE p.business_id=? ORDER BY p.sort_order,p.name`,
    )
    .all(businessId) as unknown as Product[];
  for (const product of products) {
    product.option_groups = (
      seededGroupQuery.all(product.id) as unknown as OptionGroup[]
    ).map((group) => ({
      ...group,
      values: seededValueQuery.all(group.id) as unknown as OptionValue[],
    }));
  }
  const catalog: Catalog = { business, collections, categories, products };
  retainBaseline.run(
    businessId,
    JSON.stringify(catalogToRevisionSnapshot(catalog)),
  );
}


const generatedCredentials: Array<{ role:string; business:string; email:string; password:string }> = [];
const generatePassword = () => crypto.randomBytes(18).toString("base64url");
const addUser = db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,?,?,?,?,1)");
const addAccessProfile = db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)");
function seedUser(role:"admin"|"owner",accessRole:"platform_admin"|"client",business:string,email:string,name:string,businessId:number|null){
  const password=generatePassword();
  const userId = Number(addUser.run(email,bcrypt.hashSync(password,12),name,role,businessId).lastInsertRowid);
  addAccessProfile.run(userId,accessRole);
  generatedCredentials.push({role:accessRole === "platform_admin" ? "ADMIN" : "CLIENT",business,email,password});
}
seedUser("admin","platform_admin","SuqPage",process.env.SEED_ADMIN_EMAIL||"admin@suqpage.local","SuqPage Admin",null);
seedUser("owner","client","Al Haya Brand",process.env.SEED_ALHAYA_EMAIL||"alhaya@suqpage.local","Al Haya Client",seeded.get("alhayabrand")!);
seedUser("owner","client","USAshopET",process.env.SEED_USASHOPET_EMAIL||"usashopet@suqpage.local","USAshopET Client",seeded.get("usashopet")!);
seedUser("owner","client","NovaTech",process.env.SEED_NOVATECH_EMAIL||"novatech@suqpage.local","NovaTech Client",seeded.get("novatech")!);
seedUser("owner","client","HomeVibe",process.env.SEED_HOMEVIBE_EMAIL||"homevibe@suqpage.local","HomeVibe Client",seeded.get("homevibe")!);

const addCompany = db.prepare("INSERT INTO delivery_companies(name,slug,service_area) VALUES(?,?,?)");
[["Malikt Express","malikt-express","Addis Ababa and surrounding areas"],["Addis Courier","addis-courier","Addis Ababa"],["Swift Delivery","swift-delivery","Major Ethiopian cities"],["CityDrop","citydrop","Same-day urban delivery"]].forEach((c) => addCompany.run(...c));

const inquiry = db.prepare("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,note,status,idempotency_key) VALUES(?,?,?,?,?,?,?)");
const inquiryItem = db.prepare("INSERT INTO inquiry_items(inquiry_id,product_id,product_name_snapshot,quantity,options_json) VALUES(?,?,?,?,?)");
for (const [handle, customer] of [["alhayabrand","Hana"],["usashopet","Mimi"],["novatech","Samuel"],["homevibe","Rahel"]] as const) {
  const businessId = seeded.get(handle)!;
  const iid = Number(inquiry.run(businessId, customer, "251911000000", "whatsapp", "Seed inquiry for local testing.", "new", `seed-${handle}`).lastInsertRowid);
  const product = db.prepare("SELECT id,name FROM products WHERE business_id=? ORDER BY id LIMIT 1").get(businessId) as any;
  inquiryItem.run(iid, product.id, product.name, 1, JSON.stringify({}));
}

const credentialPath=path.resolve(process.env.SUQPAGE_CREDENTIAL_PATH||path.join(process.cwd(),".local","seed-credentials.txt"));
fs.mkdirSync(path.dirname(credentialPath),{recursive:true});
const credentialText=["SuqPage temporary local credentials","Change every password on first login.","",...generatedCredentials.map(c=>`${c.role.toUpperCase()} | ${c.business} | ${c.email} | ${c.password}`)].join("\n");
fs.writeFileSync(credentialPath,credentialText,{mode:0o600});
console.log(`SuqPage database created at ${dbPath}`);
console.log(`Temporary credentials written to ${credentialPath}`);
if (process.env.SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT !== "1") console.log(credentialText);
