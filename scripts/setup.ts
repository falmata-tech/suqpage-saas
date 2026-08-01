import { DatabaseSync } from "node:sqlite";
import bcrypt from "bcryptjs";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { seedDefaultBazaarConfig } from "../lib/bazaar";
import { databasePath, ensureRuntimeDirectories } from "../lib/config";
import type { DenseDemoOfferingKind } from "../lib/dense-demo-seed";
import { DISCOVERY_INDUSTRIES } from "../lib/discovery";
import {
  isSeededFeatured,
  SEEDED_EXPO_PROFILES,
  seededExpoBoothPath,
} from "../lib/expo-seed";
import type { OfferingKind, QuantityMode } from "../lib/offerings";
import { parseOfferingHighlightsJson } from "../lib/offering-presentation";
import { catalogToRevisionSnapshotV4 } from "../lib/revision-v4-defaults";
import { SCALE_DEMO_BUSINESSES } from "../lib/scale-demo-seed";
import { migrateDatabase } from "../lib/schema";
import type {
  Business,
  Catalog,
  Category,
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

const SEED_VIDEO_REF = "youtube:M7lc1UVf-VE";
const addBusiness = db.prepare(`INSERT INTO businesses(handle,name,design_key,design_manifest_json,tagline,description,logo_path,hero_title,hero_subtitle,hero_image_path,contact_email,whatsapp,telegram,tiktok,process_video_ref,is_live,live_platform,live_url,status) VALUES(@handle,@name,'composition',@design_manifest_json,@tagline,@description,@logo_path,@hero_title,@hero_subtitle,@hero_image_path,@contact_email,@whatsapp,@telegram,@tiktok,@process_video_ref,@is_live,@live_platform,@live_url,'active')`);
const addCategory = db.prepare("INSERT INTO categories(business_id,collection_id,name,slug,sort_order) VALUES(?,?,?,?,?)");
const addProduct = db.prepare(`INSERT INTO products(
  business_id,collection_id,category_id,name,slug,eyebrow,description,image_path,
  availability,offering_kind,quantity_mode,capacity_summary,
  minimum_order_summary,lead_time_summary,is_published,sort_order
  ,video_ref,price_minor,currency,quantity_unit,highlights_json
) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?, ?,?,'ETB',?,?)`);
const addGroup = db.prepare("INSERT INTO option_groups(product_id,name,position) VALUES(?,?,?)");
const addValue = db.prepare("INSERT INTO option_values(option_group_id,value) VALUES(?,?)");

const benchmarkBusinesses = [
  { handle:"selam-weave", name:"Selam Weave Studio", tagline:"Handwoven cloth for useful everyday rituals.", description:"A small textile atelier producing cotton wraps, table linens and practical woven goods in limited runs.", logo_path:"", hero_title:"Woven slowly. Made to be lived with.", hero_subtitle:"Explore hand-finished textiles, natural fibers and made-to-order color options.", hero_image_path:"/uploads/seed/benchmarks/selam-weave/hero.jpg", contact_email:"", whatsapp:"251911100101", telegram:"selamweave", tiktok:"" },
  { handle:"afia-botanics", name:"Afia Botanics", tagline:"Simple botanical care, mixed in small batches.", description:"Plant-based cleansing and body-care products made with clearly presented ingredients and direct maker guidance.", logo_path:"", hero_title:"A clear ritual from leaf to jar.", hero_subtitle:"Browse small-batch soaps, oils and treatments, then ask the maker about fit and use.", hero_image_path:"/uploads/seed/benchmarks/afia-botanics/hero.jpg", contact_email:"hello@afia.local", whatsapp:"", telegram:"afiabotanics", tiktok:"" },
  { handle:"warka-furniture", name:"Warka Furniture Works", tagline:"Contemporary furniture shaped by hand.", description:"A compact workshop making hardwood seating, tables and storage pieces for homes and small hospitality spaces.", logo_path:"", hero_title:"Furniture with an honest material story.", hero_subtitle:"See the joinery, dimensions and finish choices before starting a project inquiry.", hero_image_path:"/uploads/seed/benchmarks/warka-furniture/hero.jpg", contact_email:"", whatsapp:"251911100103", telegram:"", tiktok:"" },
  { handle:"addis-metalworks", name:"Addis Metalworks", tagline:"Small-run fabrication with clear specifications.", description:"A production workshop for equipment frames, stainless work surfaces, racks and custom-cut metal parts.", logo_path:"", hero_title:"Built to the drawing. Ready for the floor.", hero_subtitle:"Review standard fabrications or send one RFQ for dimensions, finish and quantity.", hero_image_path:"/uploads/seed/benchmarks/addis-metalworks/hero.jpg", contact_email:"rfq@addismetal.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"green-terrace-farm", name:"Green Terrace Farm", tagline:"Seasonal produce from a working highland farm.", description:"Fresh greens, herbs and mixed harvest crates supplied according to the farm's current growing cycle.", logo_path:"", hero_title:"What is growing now, clearly presented.", hero_subtitle:"Browse the current harvest and ask about weekly household or kitchen supply.", hero_image_path:"/uploads/seed/benchmarks/green-terrace-farm/hero.jpg", contact_email:"", whatsapp:"251911100105", telegram:"", tiktok:"" },
  { handle:"blue-nile-apiary", name:"Blue Nile Apiary", tagline:"Honey, comb and beeswax from responsibly kept hives.", description:"A small apiary offering raw honey, seasonal comb and useful beeswax goods with batch-by-batch availability.", logo_path:"", hero_title:"From active hives to a careful harvest.", hero_subtitle:"Discover the current honey character and ask about jars, gifts or wholesale quantities.", hero_image_path:"/uploads/seed/benchmarks/blue-nile-apiary/hero.jpg", contact_email:"", whatsapp:"", telegram:"bluenileapiary", tiktok:"" },
  { handle:"rift-valley-mill", name:"Rift Valley Mill", tagline:"Local grains milled for homes and small bakeries.", description:"A clean small-scale mill producing teff flours, roasted barley blends and practical mixed-grain packs.", logo_path:"", hero_title:"Know the grain behind every bag.", hero_subtitle:"Compare grain types, milling styles and available pack formats in one clear catalog.", hero_image_path:"/uploads/seed/benchmarks/rift-valley-mill/hero.jpg", contact_email:"orders@riftmill.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"entoto-ceramics", name:"Entoto Ceramics", tagline:"Quiet tableware made in a working pottery studio.", description:"Wheel-thrown and hand-finished cups, bowls, vases and table pieces with natural glaze variation.", logo_path:"", hero_title:"Useful forms, shaped one at a time.", hero_subtitle:"Browse studio pieces and ask about sets, glaze variation or hospitality orders.", hero_image_path:"/uploads/seed/benchmarks/entoto-ceramics/hero.jpg", contact_email:"", whatsapp:"251911100108", telegram:"", tiktok:"" },
  { handle:"koba-leather", name:"Koba Leather Workshop", tagline:"Durable leather goods cut and stitched by hand.", description:"A practical range of work bags, wallets, rolls and satchels made in small production runs.", logo_path:"", hero_title:"Leather goods that show their construction.", hero_subtitle:"Inspect the forms, choose a finish and ask about personal or team orders.", hero_image_path:"/uploads/seed/benchmarks/koba-leather/hero.jpg", contact_email:"", whatsapp:"", telegram:"kobaleather", tiktok:"" },
  { handle:"nova-assembly", name:"Nova Assembly Lab", tagline:"Electronics assembly, repair and custom power work.", description:"A small technical studio building power-control products, cable harnesses and repair solutions for local operators.", logo_path:"", hero_title:"Technical work explained before it is ordered.", hero_subtitle:"Review standard builds or describe the equipment, repair and connector requirements.", hero_image_path:"/uploads/seed/benchmarks/nova-assembly/hero.jpg", contact_email:"lab@novaassembly.local", whatsapp:"251911100110", telegram:"", tiktok:"" }
] satisfies Array<Record<string,string>>;

const additionalBusinesses = [
  { handle:"tekle-circuit-systems", name:"Tekle Circuit Systems", tagline:"Control electronics assembled for demanding equipment.", description:"A production team building control boards, sensor interfaces and protected electrical assemblies for local equipment makers.", logo_path:"", hero_title:"Reliable control, assembled close to the work.", hero_subtitle:"Review standard modules and send production requirements for a documented quotation.", hero_image_path:"/uploads/seed/expo/tekle-circuit-systems/hero.webp", contact_email:"sales@teklecircuit.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"luna-cold-chain", name:"Luna Cold Chain", tagline:"Compact cooling equipment for growers and distributors.", description:"A small manufacturer of insulated storage, produce coolers and temperature-control assemblies.", logo_path:"", hero_title:"Keep valuable harvests within range.", hero_subtitle:"Compare cooling formats and discuss capacity, power and installation needs.", hero_image_path:"/uploads/seed/expo/luna-cold-chain/hero.webp", contact_email:"", whatsapp:"251911200102", telegram:"", tiktok:"" },
  { handle:"abyssinia-solar-devices", name:"Abyssinia Solar Devices", tagline:"Practical solar power products assembled in Bishoftu.", description:"A growing producer of solar lighting, protected power boxes and small commercial energy kits.", logo_path:"", hero_title:"Useful solar power, configured for the site.", hero_subtitle:"Explore standard devices or submit load and installation requirements.", hero_image_path:"/uploads/seed/expo/abyssinia-solar-devices/hero.webp", contact_email:"hello@abyssiniasolar.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"nuru-naturals-lab", name:"Nuru Naturals Lab", tagline:"Plant oils and personal care made with controlled batches.", description:"A formulation studio producing traceable body oils, hair treatments and botanical cleansing products.", logo_path:"", hero_title:"Natural care with a production record.", hero_subtitle:"Browse current formulas and ask about retail or private-label quantities.", hero_image_path:"/uploads/seed/expo/nuru-naturals-lab/hero.webp", contact_email:"lab@nurunaturals.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"bale-herb-care", name:"Bale Herb Care", tagline:"Herbal wellness products sourced near the Bale highlands.", description:"A regional producer preparing dried botanicals, infused oils and simple wellness blends.", logo_path:"", hero_title:"Highland botanicals, clearly prepared.", hero_subtitle:"Review ingredients, formats and available production batches.", hero_image_path:"/uploads/seed/expo/bale-herb-care/hero.webp", contact_email:"", whatsapp:"251911200105", telegram:"", tiktok:"" },
  { handle:"saba-soap-works", name:"Saba Soap Works", tagline:"Everyday cleansing bars made in disciplined small runs.", description:"A soap workshop serving households, hospitality buyers and private-label inquiries.", logo_path:"", hero_title:"A dependable bar from batch to box.", hero_subtitle:"Compare formulas, packaging formats and wholesale quantities.", hero_image_path:"/uploads/seed/expo/saba-soap-works/hero.webp", contact_email:"orders@sabasoap.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"geda-coffee-cooperative", name:"Geda Coffee Cooperative", tagline:"Roasted coffee and producer lots prepared for direct inquiry.", description:"A cooperative showroom for roasted coffee, green samples and hospitality supply formats.", logo_path:"", hero_title:"Coffee lots with a clear route to inquiry.", hero_subtitle:"Explore current formats and discuss recurring or wholesale supply.", hero_image_path:"/uploads/seed/expo/geda-coffee-cooperative/hero.webp", contact_email:"trade@gedacoffee.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"atlas-pump-works", name:"Atlas Pump Works", tagline:"Water-moving equipment built for farms and workshops.", description:"A mechanical producer assembling pump skids, guards and serviceable water-handling systems.", logo_path:"", hero_title:"Specify the flow. Inspect the build.", hero_subtitle:"Review standard assemblies and submit duty, power and connection requirements.", hero_image_path:"/uploads/seed/expo/atlas-pump-works/hero.webp", contact_email:"rfq@atlaspump.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"merkato-packaging-systems", name:"Merkato Packaging Systems", tagline:"Compact filling and packing equipment for growing producers.", description:"A machinery workshop building tables, sealers and assisted packing stations for small factories.", logo_path:"", hero_title:"Packaging equipment sized for the next stage.", hero_subtitle:"Compare stations and request a layout around your product and throughput.", hero_image_path:"/uploads/seed/expo/merkato-packaging-systems/hero.webp", contact_email:"", whatsapp:"251911200109", telegram:"", tiktok:"" },
  { handle:"jimma-agro-machinery", name:"Jimma Agro Machinery", tagline:"Serviceable processing tools for farms and cooperatives.", description:"A regional manufacturer of compact threshing, sorting and feed-processing equipment.", logo_path:"", hero_title:"Machines designed around the working day.", hero_subtitle:"Review capacities, drive options and locally serviceable assemblies.", hero_image_path:"/uploads/seed/expo/jimma-agro-machinery/hero.webp", contact_email:"sales@jimmaagro.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"hadiya-woodcraft", name:"Hadiya Woodcraft", tagline:"Furniture and interior joinery produced in Hosaena.", description:"A workshop producing repeatable tables, shelving and fitted interior pieces for homes and institutions.", logo_path:"", hero_title:"Measured joinery for useful spaces.", hero_subtitle:"Browse standard pieces or send dimensions for a project inquiry.", hero_image_path:"/uploads/seed/expo/hadiya-woodcraft/hero.webp", contact_email:"", whatsapp:"251911200111", telegram:"", tiktok:"" },
  { handle:"gurage-lighting-works", name:"Gurage Lighting Works", tagline:"Architectural lighting assembled for homes and hospitality.", description:"A small manufacturer of pendant, wall and task lighting using metal, glass and woven details.", logo_path:"", hero_title:"Light fixtures designed as part of the room.", hero_subtitle:"Compare forms, finishes and project quantities.", hero_image_path:"/uploads/seed/expo/gurage-lighting-works/hero.webp", contact_email:"projects@guragelighting.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"sidama-workwear", name:"Sidama Workwear", tagline:"Durable uniforms cut for production and service teams.", description:"A garment producer making repeatable work shirts, aprons and protective everyday uniforms.", logo_path:"", hero_title:"Workwear built for repeat orders.", hero_subtitle:"Select a garment family and discuss sizing, branding and team quantities.", hero_image_path:"/uploads/seed/expo/sidama-workwear/hero.webp", contact_email:"orders@sidamaworkwear.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"hawassa-loom-house", name:"Hawassa Loom House", tagline:"Woven interior textiles developed for contemporary spaces.", description:"A textile studio producing throws, cushions and hospitality fabrics in controlled color runs.", logo_path:"", hero_title:"Woven surfaces with a calm material rhythm.", hero_subtitle:"Review current patterns and inquire about coordinated project quantities.", hero_image_path:"/uploads/seed/expo/hawassa-loom-house/hero.webp", contact_email:"", whatsapp:"251911200114", telegram:"", tiktok:"" },
  { handle:"dawa-water-solutions", name:"Dawa Water Solutions", tagline:"Storage and treatment products for practical water access.", description:"A Dire Dawa producer assembling tanks, filtration frames and compact treatment packages.", logo_path:"", hero_title:"A clearer route from source to useful water.", hero_subtitle:"Compare system sizes and discuss source, volume and installation.", hero_image_path:"/uploads/seed/expo/dawa-water-solutions/hero.webp", contact_email:"projects@dawawater.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"eastern-safety-gear", name:"Eastern Safety Gear", tagline:"Protective equipment supplied and finished for working teams.", description:"A regional producer and assembler of high-visibility garments, signs and basic site-safety kits.", logo_path:"", hero_title:"Make essential protection easy to specify.", hero_subtitle:"Build a team kit by role, size and working environment.", hero_image_path:"/uploads/seed/expo/eastern-safety-gear/hero.webp", contact_email:"", whatsapp:"251911200116", telegram:"", tiktok:"" },
  { handle:"gambela-recycled-paper", name:"Gambela Recycled Paper", tagline:"Useful paper goods made from recovered local fiber.", description:"A circular-material workshop producing sheets, packaging inserts and simple stationery.", logo_path:"", hero_title:"Recovered fiber returned to useful work.", hero_subtitle:"Explore formats and ask about packaging or institutional quantities.", hero_image_path:"/uploads/seed/expo/gambela-recycled-paper/hero.webp", contact_email:"trade@gambelapaper.local", whatsapp:"", telegram:"", tiktok:"" },
  { handle:"baro-nursery-supplies", name:"Baro Nursery Supplies", tagline:"Propagation and growing supplies for farms and restoration teams.", description:"A producer of seedling trays, shade structures and nursery starter materials.", logo_path:"", hero_title:"Give young plants a dependable start.", hero_subtitle:"Compare nursery formats and discuss seasonal project quantities.", hero_image_path:"/uploads/seed/expo/baro-nursery-supplies/hero.webp", contact_email:"", whatsapp:"251911200118", telegram:"", tiktok:"" }
] satisfies Array<Record<string,string>>;

const scaleDemoBusinessRows = SCALE_DEMO_BUSINESSES.map((business) => ({
  handle: business.handle,
  name: business.name,
  tagline: business.tagline,
  description: business.description,
  logo_path: "",
  hero_title: business.heroTitle,
  hero_subtitle: business.heroSubtitle,
  hero_image_path: business.heroPath,
  contact_email: `${business.handle}@demo.suqpage.local`,
  whatsapp: "",
  telegram: "",
  tiktok: "",
}));

const businesses = [
  ...benchmarkBusinesses,
  ...scaleDemoBusinessRows,
];
const productionSupplyBusinesses = new Set([
  "green-terrace-farm",
  "blue-nile-apiary",
  "rift-valley-mill",
  "geda-coffee-cooperative",
  "bale-herb-care",
]);
const manufacturingBusinesses = new Set([
  "addis-metalworks",
  "nova-assembly",
  "tekle-circuit-systems",
  "luna-cold-chain",
  "abyssinia-solar-devices",
  "atlas-pump-works",
  "merkato-packaging-systems",
  "jimma-agro-machinery",
  "dawa-water-solutions",
  "eastern-safety-gear",
  "baro-nursery-supplies",
]);
const manufacturingCapabilityNames = new Set([
  "Short-Run Cut Parts",
  "Custom Cable Harness Kit",
  "Labeled Wiring Assembly",
  "Custom Site Sign Set",
]);

function seedOfferingProfile(handle: string, product: any) {
  if (productionSupplyBusinesses.has(handle)) {
    return {
      offeringKind: "production_supply",
      quantityMode: "optional",
      capacitySummary: "Batch or seasonal volume confirmed for each supply cycle",
      minimumOrderSummary: "Pack and wholesale minimums available on inquiry",
      leadTimeSummary: "Next supply window confirmed directly",
    };
  }
  if (manufacturingBusinesses.has(handle)) {
    const capability = manufacturingCapabilityNames.has(product.name);
    return {
      offeringKind: capability ? "manufacturing_capability" : "made_to_order",
      quantityMode: "optional",
      capacitySummary: capability
        ? "Prototype, small-run, and repeat production capacity"
        : "Configured production runs scheduled after specification review",
      minimumOrderSummary: capability
        ? "Project minimum depends on process and material"
        : "One configured unit or an agreed repeat run",
      leadTimeSummary: "Lead time confirmed after drawings and inputs are reviewed",
    };
  }
  if (/\b(custom|hospitality|project|private-label|fitted|run)\b/i.test(`${product.name} ${product.eyebrow}`)) {
    return {
      offeringKind: "made_to_order",
      quantityMode: "optional",
      capacitySummary: "Made-to-order capacity confirmed with the brief",
      minimumOrderSummary: "",
      leadTimeSummary: "Production window confirmed after requirements",
    };
  }
  return {
    offeringKind: "standard_product",
    quantityMode: "optional",
    capacitySummary: "",
    minimumOrderSummary: "",
    leadTimeSummary: "",
  };
}

const seeded = new Map<string, number>();
for (const business of businesses) {
  seeded.set(
    business.handle,
    Number(
      addBusiness.run({
        ...business,
        design_manifest_json: "{}",
        process_video_ref: SEED_VIDEO_REF,
        is_live: business.handle === "nova-assembly" ? 1 : 0,
        live_platform: business.handle === "nova-assembly" ? "youtube" : "",
        live_url: business.handle === "nova-assembly" ? "https://www.youtube.com/watch?v=M7lc1UVf-VE" : "",
      }).lastInsertRowid,
    ),
  );
}

function seedCatalog(handle: string, categoryNames: string[], products: any[]) {
  const businessId = seeded.get(handle)!;
  const cats = new Map<string, number>();
  categoryNames.forEach((name, i) => cats.set(name, Number(addCategory.run(businessId, null, name, name.toLowerCase().replace(/[^a-z0-9]+/g,"-"), i).lastInsertRowid)));
  products.forEach((p, i) => {
    const profile = seedOfferingProfile(handle, p);
    const productId = Number(addProduct.run(
      businessId,
      null,
      cats.get(p.category)!,
      p.name,
      p.slug,
      p.eyebrow,
      p.description,
      p.image,
      p.availability || "available",
      p.offeringKind || profile.offeringKind,
      p.quantityMode || profile.quantityMode,
      p.capacitySummary ?? profile.capacitySummary,
      p.minimumOrderSummary ?? profile.minimumOrderSummary,
      p.leadTimeSummary ?? profile.leadTimeSummary,
      i,
      p.videoRef || SEED_VIDEO_REF,
      p.priceMinor ?? (profile.offeringKind === "manufacturing_capability" ? null : 35_000 + i * 12_500),
      p.quantityUnit || (profile.offeringKind === "production_supply" ? "kg" : profile.offeringKind === "manufacturing_capability" ? "project" : "piece"),
      JSON.stringify(p.highlights || [p.eyebrow || p.category, profile.offeringKind === "standard_product" ? "Available for direct inquiry" : "Requirements confirmed before production"]),
    ).lastInsertRowid);
    const optionGroups =
      profile.offeringKind === "manufacturing_capability" ? [] : p.options || [];
    optionGroups.slice(0,4).forEach((g:any, gi:number) => {
      const groupId = Number(addGroup.run(productId, g.name, gi).lastInsertRowid);
      g.values.forEach((v:string) => addValue.run(groupId, v));
    });
  });
}

type BenchmarkProduct = { name:string; category:string; eyebrow:string; description:string; image?:number; availability?:string };
function benchmarkCatalog(handle:string, categories:string[], products:BenchmarkProduct[]) {
  seedCatalog(handle, categories, products.map((product, index) => ({
    ...product,
    slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    image: product.image ? `/uploads/seed/benchmarks/${handle}/product-${product.image}.jpg` : "",
    options: [{ name: "Request", values: ["Standard", "Custom inquiry"] }],
  })));
}

benchmarkCatalog("selam-weave",["Wear","Table","Carry"],[
  {name:"Indigo Kuta Shawl",category:"Wear",eyebrow:"Handwoven cotton",description:"A substantial indigo-and-ivory shawl with hand-finished fringe.",image:1},
  {name:"Natural Cotton Wrap",category:"Wear",eyebrow:"Undyed weave",description:"A breathable wrap woven from natural cotton yarn.",image:2},
  {name:"Indigo Table Linen",category:"Table",eyebrow:"Dining textile",description:"A woven table cloth with a restrained indigo border.",image:3},
  {name:"Workshop Tote",category:"Carry",eyebrow:"Woven utility",description:"A structured cloth tote with reinforced woven handles.",image:4},
  {name:"Custom Hospitality Runner",category:"Table",eyebrow:"Made to order",description:"A custom-length runner planned for cafes and guest spaces."},
]);
benchmarkCatalog("afia-botanics",["Cleanse","Treat","Hair"],[
  {name:"Garden Cleansing Bars",category:"Cleanse",eyebrow:"Cold-process soap",description:"A small set of botanical cleansing bars with clearly listed ingredients.",image:1},
  {name:"Leaf & Seed Body Oil",category:"Treat",eyebrow:"Light body oil",description:"A simple amber-bottled oil blended for everyday body care.",image:2},
  {name:"Mineral Clay Mask",category:"Treat",eyebrow:"Dry mask blend",description:"A dry clay and botanical powder mixed with water at use.",image:3},
  {name:"Nourishing Hair Butter",category:"Hair",eyebrow:"Rich treatment",description:"A concentrated butter for protective styles and dry ends.",image:4},
]);
benchmarkCatalog("warka-furniture",["Seating","Tables","Storage"],[
  {name:"Low Woven Lounge Chair",category:"Seating",eyebrow:"Hardwood and cord",description:"A low lounge chair with a handwoven seat and visible joinery.",image:1},
  {name:"Round Cross-Leg Table",category:"Tables",eyebrow:"Compact side table",description:"A small round table with a stable crossed hardwood base.",image:2},
  {name:"Entry Bench",category:"Seating",eyebrow:"Woven bench",description:"A narrow bench for entries, bedrooms and hospitality spaces.",image:3},
  {name:"Open Wall Shelf",category:"Storage",eyebrow:"Display storage",description:"An open hardwood shelf sized for useful everyday objects.",image:4},
  {name:"Custom Dining Table",category:"Tables",eyebrow:"Project inquiry",description:"A made-to-order table specified by size, timber and finish."},
  {name:"Hospitality Stool Set",category:"Seating",eyebrow:"Small production run",description:"A repeatable stool design for cafes and counters."},
]);
benchmarkCatalog("addis-metalworks",["Frames","Work Surfaces","Storage","Parts"],[
  {name:"Powder-Coated Equipment Frame",category:"Frames",eyebrow:"Machine support",description:"A rigid fabricated frame prepared for equipment installation.",image:1},
  {name:"Stainless Prep Table",category:"Work Surfaces",eyebrow:"Food-safe work surface",description:"A stainless work table with lower shelf and adjustable feet.",image:2},
  {name:"Modular Storage Rack",category:"Storage",eyebrow:"Workshop storage",description:"A bolt-together rack for bins, tools and production materials.",image:3},
  {name:"Precision Bracket Set",category:"Parts",eyebrow:"Cut and formed parts",description:"A configurable set of drilled and folded mounting brackets.",image:4},
  {name:"Protective Equipment Guard",category:"Frames",eyebrow:"Custom fabrication",description:"A measured guard fabricated to an approved drawing."},
  {name:"Mobile Tool Cart",category:"Storage",eyebrow:"Workshop utility",description:"A wheeled steel cart configured for tools and consumables."},
  {name:"Sink Support Stand",category:"Work Surfaces",eyebrow:"Stainless support",description:"A fabricated stand prepared for a specified sink and plumbing layout."},
  {name:"Short-Run Cut Parts",category:"Parts",eyebrow:"RFQ service",description:"A quoted batch of repeat metal parts from supplied dimensions."},
]);
benchmarkCatalog("green-terrace-farm",["Greens","Herbs","Seasonal Crates"],[
  {name:"Highland Greens Mix",category:"Greens",eyebrow:"Seasonal leaves",description:"A fresh mixed selection based on the current field harvest.",image:1},
  {name:"Kitchen Herb Bunch",category:"Herbs",eyebrow:"Mixed herbs",description:"A practical bunch of aromatic herbs for home and kitchen use.",image:2},
  {name:"Heirloom Tomato Mix",category:"Seasonal Crates",eyebrow:"Field tomatoes",description:"A mixed-color tomato selection available during its harvest window.",image:3,availability:"limited"},
  {name:"Weekly Produce Crate",category:"Seasonal Crates",eyebrow:"Farm assortment",description:"A rotating crate of vegetables selected from the week's harvest.",image:4},
  {name:"Cafe Greens Supply",category:"Greens",eyebrow:"Recurring inquiry",description:"A recurring greens inquiry sized for a small cafe or kitchen."},
]);
benchmarkCatalog("blue-nile-apiary",["Honey","Comb","Beeswax"],[
  {name:"Seasonal Raw Honey",category:"Honey",eyebrow:"Current harvest",description:"Raw amber honey presented by season and available jar size.",image:1},
  {name:"Cut Comb Honey",category:"Comb",eyebrow:"Whole comb",description:"Fresh comb honey cut and packed in limited seasonal quantities.",image:2,availability:"limited"},
  {name:"Pure Beeswax Candles",category:"Beeswax",eyebrow:"Hive byproduct",description:"Simple hand-poured candles made from cleaned beeswax.",image:3},
  {name:"Honey & Comb Gift Box",category:"Honey",eyebrow:"Small gift set",description:"A compact pairing of honey and comb for gifting.",image:4},
]);
benchmarkCatalog("rift-valley-mill",["Teff","Barley","Blends"],[
  {name:"Ivory Teff Flour",category:"Teff",eyebrow:"Fine milled",description:"A finely milled ivory teff flour for household and bakery use.",image:1},
  {name:"Brown Teff Flour",category:"Teff",eyebrow:"Whole grain",description:"Brown teff milled with a fuller grain character.",image:2},
  {name:"Roasted Barley Blend",category:"Barley",eyebrow:"Roasted grain",description:"A roasted barley blend prepared for traditional and modern drinks.",image:3},
  {name:"Mixed Grain Baking Pack",category:"Blends",eyebrow:"Practical blend",description:"A balanced grain blend for breads, pancakes and test batches.",image:4},
]);
benchmarkCatalog("entoto-ceramics",["Drinkware","Serveware","Objects"],[
  {name:"Studio Coffee Set",category:"Drinkware",eyebrow:"Wheel-thrown set",description:"A small set of cups and saucers with natural glaze variation.",image:1},
  {name:"Everyday Serving Bowl",category:"Serveware",eyebrow:"Wide bowl",description:"A useful serving bowl with a durable glazed interior.",image:2},
  {name:"Textured Stem Vase",category:"Objects",eyebrow:"Carved surface",description:"A hand-finished vase with a softly carved vertical texture.",image:3},
  {name:"Dinner Plate Set",category:"Serveware",eyebrow:"Table set",description:"A stackable plate set with a warm exposed rim.",image:4},
  {name:"Custom Cafe Cup Run",category:"Drinkware",eyebrow:"Hospitality order",description:"A repeat cup form produced in an agreed glaze and quantity."},
  {name:"Small Planter Pair",category:"Objects",eyebrow:"Studio object",description:"A paired planter format with drainage and glaze options."},
]);
benchmarkCatalog("koba-leather",["Bags","Small Goods","Tools"],[
  {name:"Structured Work Tote",category:"Bags",eyebrow:"Daily carry",description:"A sturdy open tote with reinforced handles and an exterior pocket.",image:1},
  {name:"Slim Card Wallet",category:"Small Goods",eyebrow:"Hand stitched",description:"A compact card wallet with visible edge finishing.",image:2},
  {name:"Leather Tool Roll",category:"Tools",eyebrow:"Organized carry",description:"A roll-up organizer for small tools, brushes or studio equipment.",image:3},
  {name:"Everyday Crossbody",category:"Bags",eyebrow:"Secure satchel",description:"A medium satchel with adjustable strap and covered closure.",image:4},
]);
benchmarkCatalog("nova-assembly",["Power","Repair","Harnesses"],[
  {name:"Rugged Solar Charge Controller",category:"Power",eyebrow:"Field power control",description:"A protected controller assembled for small off-grid systems.",image:1},
  {name:"Compact Backup Power Box",category:"Power",eyebrow:"Configured power",description:"A portable backup enclosure configured to the approved load plan.",image:2},
  {name:"Audio Amplifier Rebuild",category:"Repair",eyebrow:"Bench repair",description:"A diagnostic and rebuild service for compatible amplifier hardware.",image:3},
  {name:"Custom Cable Harness Kit",category:"Harnesses",eyebrow:"Made to specification",description:"A labeled harness kit built to connector, length and routing requirements.",image:4},
  {name:"Control Board Diagnostic",category:"Repair",eyebrow:"Technical service",description:"A documented diagnostic for an eligible control board or module."},
]);

const additionalCatalogs: Record<string, {
  categories: string[];
  products: Array<[string, string, string]>;
}> = {
  "tekle-circuit-systems": { categories:["Control Modules","Assemblies"], products:[["Protected Motor Controller","Control Modules","A documented controller for repeat equipment builds."],["Sensor Interface Board","Control Modules","A compact interface for specified industrial sensors."],["Labeled Wiring Assembly","Assemblies","A repeatable harness and enclosure assembly."]] },
  "luna-cold-chain": { categories:["Cooling","Storage"], products:[["Produce Cooling Cabinet","Cooling","A compact cabinet configured for produce holding."],["Insulated Market Crate","Storage","A reusable insulated crate for short cold-chain journeys."],["Modular Cold Room Package","Cooling","A quoted room package sized to site and capacity."]] },
  "abyssinia-solar-devices": { categories:["Lighting","Power"], products:[["Solar Work Light","Lighting","A rugged rechargeable light for shops and field work."],["Protected Power Box","Power","A configured DC power enclosure with labeled connections."],["Retail Solar Kit","Power","A practical panel, battery and lighting package."]] },
  "nuru-naturals-lab": { categories:["Body","Hair"], products:[["Cold-Pressed Body Oil","Body","A light botanical oil in retail and refill formats."],["Protective Hair Butter","Hair","A concentrated treatment for dry hair and protective styles."],["Private-Label Care Batch","Body","A quoted formulation and filling production run."]] },
  "bale-herb-care": { categories:["Botanicals","Oils"], products:[["Highland Herbal Blend","Botanicals","A clearly labeled dried botanical blend."],["Infused Massage Oil","Oils","A small-batch infused oil with documented ingredients."],["Hospitality Wellness Set","Botanicals","A coordinated inquiry set for guest spaces."]] },
  "saba-soap-works": { categories:["Bars","Wholesale"], products:[["Everyday Cleansing Bar","Bars","A dependable cold-process bar for daily use."],["Botanical Guest Soap","Bars","A compact wrapped bar for hospitality buyers."],["Private-Label Soap Run","Wholesale","A quoted batch with agreed formula and packaging."]] },
  "geda-coffee-cooperative": { categories:["Roasted Coffee","Trade"], products:[["Medium Roast Coffee","Roasted Coffee","A balanced roasted coffee in household formats."],["Hospitality Coffee Pack","Roasted Coffee","A larger pack prepared for cafes and offices."],["Green Coffee Sample Lot","Trade","A sample-led inquiry for eligible trade buyers."]] },
  "atlas-pump-works": { categories:["Pump Systems","Parts"], products:[["Compact Irrigation Pump Skid","Pump Systems","A serviceable pump assembly on a rigid frame."],["Protected Pump Guard","Parts","A fabricated guard sized to an approved assembly."],["Water Transfer Package","Pump Systems","A quoted pump, hose and connection package."]] },
  "merkato-packaging-systems": { categories:["Packing Stations","Sealing"], products:[["Assisted Filling Table","Packing Stations","A cleanable station for controlled manual filling."],["Continuous Band Sealer","Sealing","A configured sealer for compatible packaging film."],["Compact Packing Line","Packing Stations","A project layout for filling, sealing and dispatch."]] },
  "jimma-agro-machinery": { categories:["Processing","Handling"], products:[["Compact Grain Thresher","Processing","A serviceable thresher for cooperative-scale work."],["Feed Mixing Unit","Processing","A guarded mixer sized for practical farm batches."],["Mobile Sorting Table","Handling","A wheeled table for sorting and packing produce."]] },
  "hadiya-woodcraft": { categories:["Furniture","Interiors"], products:[["Solid Timber Work Table","Furniture","A repeatable table with visible durable joinery."],["Open Storage Unit","Furniture","A practical shelving format for home or institution."],["Fitted Interior Package","Interiors","A measured joinery inquiry for a defined room."]] },
  "gurage-lighting-works": { categories:["Pendant","Wall"], products:[["Woven Shade Pendant","Pendant","A warm pendant combining a structured frame and woven shade."],["Directional Wall Light","Wall","A compact adjustable fixture for focused lighting."],["Hospitality Lighting Set","Pendant","A coordinated quantity inquiry for guest spaces."]] },
  "sidama-workwear": { categories:["Uniforms","Protective"], products:[["Production Work Shirt","Uniforms","A durable repeat-order shirt with practical pockets."],["Workshop Apron","Protective","A reinforced apron for production and service teams."],["Team Uniform Program","Uniforms","A sized and branded garment production inquiry."]] },
  "hawassa-loom-house": { categories:["Soft Furnishings","Hospitality"], products:[["Structured Woven Throw","Soft Furnishings","A substantial throw in a controlled color run."],["Textured Cushion Cover","Soft Furnishings","A removable woven cover for coordinated interiors."],["Hospitality Textile Set","Hospitality","A project inquiry for rooms or common spaces."]] },
  "dawa-water-solutions": { categories:["Storage","Treatment"], products:[["Protected Water Tank","Storage","A practical storage package with specified connections."],["Compact Filter Frame","Treatment","A serviceable frame for an approved filter sequence."],["Community Water Package","Treatment","A site-specific storage and treatment inquiry."]] },
  "eastern-safety-gear": { categories:["Wear","Site Kits"], products:[["High-Visibility Work Vest","Wear","A repeatable safety vest with size and marking options."],["Workshop Safety Kit","Site Kits","A role-based set of common protective essentials."],["Custom Site Sign Set","Site Kits","A quoted set of durable directional and warning signs."]] },
  "gambela-recycled-paper": { categories:["Sheets","Packaging"], products:[["Recycled Fiber Sheet Set","Sheets","Textured recovered-fiber sheets for print and craft."],["Molded Packaging Insert","Packaging","A fitted insert developed for a repeat product."],["Institutional Stationery Run","Sheets","A quoted batch of simple paper goods."]] },
  "baro-nursery-supplies": { categories:["Propagation","Structures"], products:[["Reusable Seedling Tray","Propagation","A durable tray for repeat nursery cycles."],["Shade Frame Module","Structures","A modular frame for nursery shade material."],["Seasonal Nursery Starter Set","Propagation","A coordinated supply inquiry for a planting cycle."]] },
};

for (const [handle, catalog] of Object.entries(additionalCatalogs)) {
  if (!seeded.has(handle)) continue;
  seedCatalog(handle, catalog.categories, catalog.products.map(([name, category, description], index) => ({
    name,
    category,
    eyebrow: category,
    description,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    image: `/uploads/seed/expo/${handle}/product-${index + 1}.webp`,
    options: [{ name: "Request", values: ["Standard", "Custom inquiry"] }],
  })));
}

function denseOfferingProfile(kind: DenseDemoOfferingKind) {
  if (kind === "manufacturing_capability") {
    return {
      capacitySummary: "Prototype, short-run, and repeat production capacity",
      minimumOrderSummary: "Project minimum depends on process and material",
      leadTimeSummary: "Lead time confirmed after the requirement is reviewed",
    };
  }
  if (kind === "production_supply") {
    return {
      capacitySummary: "Recurring volume scheduled against the buyer's production cycle",
      minimumOrderSummary: "Pack, batch, or pallet minimum confirmed on inquiry",
      leadTimeSummary: "The next supply window is confirmed directly",
    };
  }
  if (kind === "made_to_order") {
    return {
      capacitySummary: "Configured production scheduled after specification review",
      minimumOrderSummary: "One configured unit or an agreed repeat run",
      leadTimeSummary: "Production timing is confirmed with the approved brief",
    };
  }
  return {
    capacitySummary: "",
    minimumOrderSummary: "",
    leadTimeSummary: "",
  };
}

for (const business of SCALE_DEMO_BUSINESSES) {
  const offerings = [...business.offerings];
  if (business === SCALE_DEMO_BUSINESSES[0]) {
    for (let index = 1; index <= 22; index += 1) {
      offerings.push({
        name: `Production Input ${String(index).padStart(2, "0")}`,
        category: "Inputs",
        description: `A fictional repeat electrical input used to exercise a multi-page offering catalog (${index}).`,
        kind: "production_supply",
      });
    }
  }
  seedCatalog(
    business.handle,
    [...new Set(offerings.map((offering) => offering.category))],
    offerings.map((offering) => ({
      name: offering.name,
      category: offering.category,
      eyebrow: offering.category,
      description: offering.description,
      slug: offering.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, ""),
      image: "",
      offeringKind: offering.kind,
      quantityMode: "optional",
      ...denseOfferingProfile(offering.kind),
      options:
        offering.kind === "manufacturing_capability"
          ? []
          : [{ name: "Request", values: ["Standard", "Custom inquiry"] }],
    })),
  );
}

const seededGroupQuery = db.prepare(
  "SELECT * FROM option_groups WHERE product_id=? ORDER BY position,id",
);
const seededValueQuery = db.prepare(
  "SELECT * FROM option_values WHERE option_group_id=? ORDER BY id",
);
const retainBaseline = db.prepare(
  "INSERT INTO published_catalog_versions(business_id,content_version,snapshot_json,change_kind) VALUES(?,1,?,'baseline')",
);
const updatePublishedComposition = db.prepare(
  "UPDATE businesses SET design_manifest_json=?,content_blocks_json=? WHERE id=?",
);
for (const businessId of seeded.values()) {
  const business = db
    .prepare("SELECT * FROM businesses WHERE id=?")
    .get(businessId) as unknown as Business;
  const categories = db
    .prepare("SELECT * FROM categories WHERE business_id=? ORDER BY sort_order,name")
    .all(businessId) as unknown as Category[];
  const products = db
    .prepare(
      `SELECT p.*,cat.name category_name
       FROM products p
       LEFT JOIN categories cat ON cat.id=p.category_id
       WHERE p.business_id=? ORDER BY p.sort_order,p.name`,
    )
    .all(businessId) as unknown as Product[];
  for (const product of products) {
    product.highlights = parseOfferingHighlightsJson(product.highlights_json);
    product.option_groups = (
      seededGroupQuery.all(product.id) as unknown as OptionGroup[]
    ).map((group) => ({
      ...group,
      values: seededValueQuery.all(group.id) as unknown as OptionValue[],
    }));
  }
  const catalog: Catalog = { business, collections: [], categories, products };
  const snapshot = catalogToRevisionSnapshotV4(catalog);
  updatePublishedComposition.run(
    JSON.stringify(snapshot.designManifest),
    JSON.stringify(snapshot.contentBlocks),
    businessId,
  );
  catalog.business.design_manifest_json = JSON.stringify(snapshot.designManifest);
  catalog.business.content_blocks_json = JSON.stringify(snapshot.contentBlocks);
  retainBaseline.run(
    businessId,
    JSON.stringify(snapshot),
  );
}

const subscriptionNow = Date.now();
const subscriptionAccountStart = subscriptionNow - 90 * 24 * 60 * 60 * 1000;
const subscriptionPeriodStart = subscriptionNow - 10 * 24 * 60 * 60 * 1000;
const subscriptionEnd = subscriptionNow + 20 * 24 * 60 * 60 * 1000;
const seedSubscription = db.prepare(`
  INSERT INTO business_subscriptions(
    business_id,plan_name,amount_minor,currency,starts_at,current_period_start,
    current_period_end,grace_ends_at,updated_at
  ) VALUES(?,'SuqPage monthly',NULL,'ETB',?,?,?,?,?)
  ON CONFLICT(business_id) DO UPDATE SET
    starts_at=excluded.starts_at,
    current_period_start=excluded.current_period_start,
    current_period_end=excluded.current_period_end,
    grace_ends_at=excluded.grace_ends_at,
    updated_at=excluded.updated_at
`);
for (const businessId of seeded.values()) {
  seedSubscription.run(
    businessId,
    subscriptionAccountStart,
    subscriptionPeriodStart,
    subscriptionEnd,
    subscriptionEnd + 4 * 24 * 60 * 60 * 1000,
    subscriptionNow,
  );
}

seedDefaultBazaarConfig(db);

const seedIndustry = db.prepare(`
  INSERT INTO discovery_industries(key,label,icon,position,active)
  VALUES(?,?,?,?,1)
`);
DISCOVERY_INDUSTRIES.forEach((industry, index) => {
  seedIndustry.run(industry.key, industry.label, industry.icon, index);
});
const seedDiscoveryProfile = db.prepare(`
  INSERT INTO business_discovery_profiles(
    business_id,booth_image_path,city,zone,region,latitude,longitude,
    fallback_style,is_featured,is_excluded,approved_at,updated_at
  ) VALUES(?,?,?,?,?,?,?,?,?,0,?,?)
`);
const seedBusinessIndustry = db.prepare(`
  INSERT INTO business_industries(business_id,industry_key) VALUES(?,?)
`);
const fallbackByIndustry: Record<string, string> = {
  electronics: "technical",
  "beauty-wellness": "botanical",
  "food-farming": "food",
  "machinery-tools": "workshop",
  "home-living": "home",
  "fashion-textiles": "textile",
};
for (const [handle, businessId] of seeded) {
  const profile = SEEDED_EXPO_PROFILES[handle];
  const industryKeys = profile?.industryKeys.filter((key) => key in fallbackByIndustry) || [];
  if (!profile || !industryKeys.length) continue;
  const industryKey = industryKeys[0];
  seedDiscoveryProfile.run(
    businessId,
    seededExpoBoothPath(handle),
    profile.city,
    profile.zone,
    profile.region,
    profile.latitude,
    profile.longitude,
    fallbackByIndustry[industryKey],
    isSeededFeatured(handle) ? 1 : 0,
    subscriptionNow,
    subscriptionNow,
  );
  for (const key of industryKeys) seedBusinessIndustry.run(businessId, key);
}


const generatedCredentials: Array<{ role:string; business:string; email:string; password:string }> = [];
const generatePassword = () => crypto.randomBytes(18).toString("base64url");
const addUser = db.prepare("INSERT INTO users(email,password_hash,name,role,business_id,must_change_password) VALUES(?,?,?,?,?,1)");
const addAccessProfile = db.prepare("INSERT INTO user_access_profiles(user_id,access_role) VALUES(?,?)");
function seedUser(role:"admin"|"owner",accessRole:"platform_admin"|"client"|"team_member"|"operations_manager",business:string,email:string,name:string,businessId:number|null){
  const password=generatePassword();
  const userId = Number(addUser.run(email,bcrypt.hashSync(password,12),name,role,businessId).lastInsertRowid);
  addAccessProfile.run(userId,accessRole);
  generatedCredentials.push({role:accessRole === "platform_admin" ? "ADMIN" : accessRole === "client" ? "CLIENT" : "STAFF",business,email,password});
  return userId;
}
const adminUserId = seedUser("admin","platform_admin","SuqPage",process.env.SEED_ADMIN_EMAIL||"admin@suqpage.local","SuqPage Admin",null);
const clientUsersByHandle = new Map<string, number>();
for (const business of [...benchmarkBusinesses, ...scaleDemoBusinessRows.slice(0, 24)]) {
  clientUsersByHandle.set(business.handle, seedUser(
    "owner",
    "client",
    business.name,
    `${business.handle}@suqpage.local`,
    `${business.name} Client`,
    seeded.get(business.handle)!,
  ));
}

const operationsStaff = ["Mekdes Operations", "Samuel Operations", "Rahel Operations", "Dawit Operations"]
  .map((name, index) => seedUser("admin", "operations_manager", "SuqPage", `operations-${index + 1}@demo.suqpage.local`, name, null));
const teamStaff = ["Hana Design", "Yonas Content", "Mimi Intake", "Abel Media", "Liya Review", "Sami Catalog", "Bethel Studio", "Nahom Support"]
  .map((name, index) => seedUser("admin", "team_member", "SuqPage", `team-${index + 1}@demo.suqpage.local`, name, null));

const subscriptionStateHandles = [
  SCALE_DEMO_BUSINESSES.find((business) => business.industryKey === "fashion-textiles"),
  SCALE_DEMO_BUSINESSES.find((business) => business.industryKey === "beauty-wellness"),
  SCALE_DEMO_BUSINESSES.find((business) => business.industryKey === "home-living"),
  SCALE_DEMO_BUSINESSES.find((business) => business.industryKey === "machinery-tools"),
  ...SCALE_DEMO_BUSINESSES.filter((business) => business.industryKey === "food-farming").slice(0, 3),
  SCALE_DEMO_BUSINESSES.filter((business) => business.industryKey === "home-living")[1],
].map((business) => {
  if (!business) throw new Error("Subscription lifecycle fixture is missing.");
  return business.handle;
});
subscriptionStateHandles.slice(0, 4).forEach((handle, index) => {
  const end = subscriptionNow - (index + 1) * 12 * 60 * 60 * 1000;
  db.prepare(`
    UPDATE business_subscriptions
    SET current_period_start=?,current_period_end=?,grace_ends_at=?,updated_at=?
    WHERE business_id=?
  `).run(end - 30 * 24 * 60 * 60 * 1000, end, end + 4 * 24 * 60 * 60 * 1000, subscriptionNow, seeded.get(handle)!);
});
subscriptionStateHandles.slice(4).forEach((handle, index) => {
  const end = subscriptionNow - (8 + index) * 24 * 60 * 60 * 1000;
  db.prepare(`
    UPDATE business_subscriptions
    SET current_period_start=?,current_period_end=?,grace_ends_at=?,updated_at=?
    WHERE business_id=?
  `).run(end - 30 * 24 * 60 * 60 * 1000, end, end + 4 * 24 * 60 * 60 * 1000, subscriptionNow, seeded.get(handle)!);
});

const seedPayment = db.prepare(`
  INSERT INTO subscription_payments(
    public_ref,business_id,amount_minor,currency,idempotency_key,paid_at,
    recorded_by_user_id,created_at
  ) VALUES(?,?,NULL,'ETB',?,?,?,?)
`);
let paymentOrdinal = 0;
for (const handle of clientUsersByHandle.keys()) {
  paymentOrdinal += 1;
  const paidAt = subscriptionPeriodStart - paymentOrdinal * 60_000;
  seedPayment.run(
    `DEMO-PAY-${String(paymentOrdinal).padStart(5, "0")}`,
    seeded.get(handle)!,
    `demo-payment-${paymentOrdinal}`,
    paidAt,
    adminUserId,
    paidAt,
  );
}

const seedVisit = db.prepare(`
  INSERT INTO showroom_visits(
    business_id,visitor_hash,visit_date,source,expo_occurrence_id,expo_hub_key,created_at
  ) VALUES(?,?,?,?,NULL,?,?)
`);
let visitOrdinal = 0;
for (const [handle, businessId] of seeded) {
  for (let index = 0; index < 8; index += 1) {
    visitOrdinal += 1;
    const createdAt = subscriptionNow - (index % 6) * 24 * 60 * 60 * 1000 - visitOrdinal;
    const source = index % 3 === 0 ? "expo" : index % 3 === 1 ? "directory" : "direct";
    seedVisit.run(
      businessId,
      crypto.createHash("sha256").update(`fictional-visitor-${handle}-${index}`).digest("hex"),
      new Date(createdAt).toISOString().slice(0, 10),
      source,
      source === "expo" ? "demo-host" : "",
      createdAt,
    );
  }
}

const seedSupportAgent = db.prepare(`
  INSERT INTO support_agent_settings(
    user_id,enabled,max_open_conversations,updated_by_user_id,updated_at
  ) VALUES(?,?,?,?,?)
`);
teamStaff.forEach((userId, index) => {
  seedSupportAgent.run(userId, index >= 4 ? 1 : 0, 3, adminUserId, subscriptionNow);
});

const addSupportConversation = db.prepare(`
  INSERT INTO support_conversations(
    public_ref,business_id,opened_by_user_id,subject,status,assigned_user_id,
    created_at,updated_at,last_message_at,closed_at
  ) VALUES(?,?,?,?,?,?,?,?,?,?)
`);
const addSupportMessage = db.prepare(`
  INSERT INTO support_messages(
    conversation_id,sender_user_id,body,idempotency_key,created_at
  ) VALUES(?,?,?,?,?)
`);
const addSupportAssignment = db.prepare(`
  INSERT INTO support_assignments(
    conversation_id,assigned_user_id,assigned_by_user_id,reason,assigned_at,released_at
  ) VALUES(?,?,NULL,'automatic',?,?)
`);
const addSupportEvent = db.prepare(`
  INSERT INTO support_events(conversation_id,actor_user_id,event_type,detail,created_at)
  VALUES(?,?,?,?,?)
`);
const supportHandles = [...clientUsersByHandle.keys()].slice(0, 30);
supportHandles.forEach((handle, index) => {
  const status = index < 10 ? "waiting" : index < 22 ? "open" : "closed";
  const assigned = status === "waiting" ? null : teamStaff[4 + ((index - 10) % 4)];
  const createdAt = subscriptionNow - (30 - index) * 45 * 60 * 1000;
  const closedAt = status === "closed" ? createdAt + 30 * 60 * 1000 : null;
  const conversationId = Number(addSupportConversation.run(
    `DEMO-SUP-${String(index + 1).padStart(5, "0")}`,
    seeded.get(handle)!,
    clientUsersByHandle.get(handle)!,
    [
      "Help updating showroom information",
      "Question about Expo participation",
      "Image replacement request",
      "Monthly account question",
    ][index % 4],
    status,
    assigned,
    createdAt,
    closedAt || createdAt,
    closedAt || createdAt,
    closedAt,
  ).lastInsertRowid);
  const firstMessage = addSupportMessage.run(
    conversationId,
    clientUsersByHandle.get(handle)!,
    `Fictional support message from ${handle} used to exercise the customer support queue.`,
    `demo-support-client-${index + 1}`,
    createdAt,
  );
  addSupportEvent.run(conversationId, clientUsersByHandle.get(handle)!, "created", "fictional seeded conversation", createdAt);
  if (assigned) {
    const replyAt = createdAt + 15 * 60 * 1000;
    const reply = addSupportMessage.run(
      conversationId,
      assigned,
      "Thanks. The SuqPage team has reviewed this fictional demo request and will follow up here.",
      `demo-support-staff-${index + 1}`,
      replyAt,
    );
    db.prepare(`
      UPDATE support_conversations
      SET client_last_read_message_id=?,staff_last_read_message_id=?,
        updated_at=?,last_message_at=?
      WHERE id=?
    `).run(Number(firstMessage.lastInsertRowid), Number(reply.lastInsertRowid), replyAt, replyAt, conversationId);
    addSupportAssignment.run(conversationId, assigned, createdAt, closedAt);
    addSupportEvent.run(conversationId, null, "assigned", `agent:${assigned};reason:automatic`, createdAt);
    addSupportEvent.run(conversationId, assigned, "message", "fictional staff reply", replyAt);
    if (closedAt) addSupportEvent.run(conversationId, assigned, "closed", "fictional seeded close", closedAt);
  } else {
    db.prepare(`
      UPDATE support_conversations SET client_last_read_message_id=? WHERE id=?
    `).run(Number(firstMessage.lastInsertRowid), conversationId);
  }
});

const lifecycleStatuses = [
  "submitted",
  "under_review",
  "needs_information",
  "approved_for_work",
  "in_progress",
  "client_review",
  "client_approved",
  "published",
  "completed",
  "rejected",
  "cancelled",
] as const;
const lifecycleHandles = [...clientUsersByHandle.keys()];
const addServiceRequest = db.prepare(`
  INSERT INTO service_requests(
    public_ref,business_id,represented_client_user_id,request_type,status,
    contact_name,contact_value,business_name,request_text,submitter_kind,
    submitted_by_user_id,assigned_user_id,idempotency_key,notification_state,
    created_at,updated_at
  ) VALUES(?,?,?,'change',?,?,?,?,?,'client',?,?,?,'not_required',
    datetime('now',?),datetime('now',?))
`);
const addRequestEvent = db.prepare(
  "INSERT INTO request_events(request_id,actor_user_id,event_type,detail,created_at) VALUES(?,?,?,?,datetime('now',?))",
);
const addAssignment = db.prepare(`
  INSERT INTO staff_business_assignments(user_id,business_id,assigned_by_user_id,active)
  VALUES(?,?,?,1)
  ON CONFLICT(user_id,business_id) DO UPDATE SET active=1,assigned_by_user_id=excluded.assigned_by_user_id
`);
const addLifecycleRevision = db.prepare(`
  INSERT INTO content_revisions(
    request_id,business_id,revision_number,base_content_version,status,
    snapshot_json,snapshot_schema_version,summary,created_by_user_id,
    submitted_at,decided_by_user_id,decision_comment,decided_at,
    published_by_user_id,published_at,published_content_version
  ) VALUES(?,?,1,1,?,?,4,?,?,CURRENT_TIMESTAMP,?,?,CURRENT_TIMESTAMP,?,?,?)
`);

for (let index = 0; index < 66; index += 1) {
  const handle = lifecycleHandles[index % lifecycleHandles.length];
  const businessId = seeded.get(handle)!;
  const clientUserId = clientUsersByHandle.get(handle)!;
  const status = lifecycleStatuses[index % lifecycleStatuses.length];
  const terminal = ["completed", "rejected", "cancelled"].includes(status);
  const assignedUserId = terminal ? null : teamStaff[index % teamStaff.length];
  const age = `-${66 - index} hours`;
  const requestId = Number(addServiceRequest.run(
    `DEMO-${String(index + 1).padStart(5, "0")}`,
    businessId,
    clientUserId,
    status,
    `${handle} client`,
    `${handle}@suqpage.local`,
    businesses.find((business) => business.handle === handle)!.name,
    `Fictional ${status.replaceAll("_", " ")} showroom request used to exercise the operations queue.`,
    clientUserId,
    assignedUserId,
    `demo-lifecycle-${index + 1}`,
    age,
    age,
  ).lastInsertRowid);
  addRequestEvent.run(requestId, clientUserId, "submitted", "fictional demo request", age);
  if (status !== "submitted") {
    addRequestEvent.run(requestId, assignedUserId || operationsStaff[0], "status_changed", `submitted->${status}`, age);
  }
  if (assignedUserId) addAssignment.run(assignedUserId, businessId, adminUserId);
  if (["client_review", "client_approved", "published"].includes(status)) {
    const retained = db.prepare(
      "SELECT snapshot_json FROM published_catalog_versions WHERE business_id=? AND content_version=1",
    ).get(businessId) as { snapshot_json: string };
    const revisionStatus =
      status === "client_review"
        ? "awaiting_review"
        : status === "client_approved"
          ? "approved"
          : "published";
    addLifecycleRevision.run(
      requestId,
      businessId,
      revisionStatus,
      retained.snapshot_json,
      `Fictional ${revisionStatus.replaceAll("_", " ")} revision`,
      assignedUserId || teamStaff[index % teamStaff.length],
      status === "client_review" ? null : clientUserId,
      status === "client_review" ? "" : "Approved in the fictional demo workflow.",
      status === "published" ? operationsStaff[index % operationsStaff.length] : null,
      status === "published" ? new Date().toISOString() : null,
      status === "published" ? 1 : null,
    );
  }
}

const addCompany = db.prepare("INSERT INTO delivery_companies(name,slug,service_area) VALUES(?,?,?)");
[["Malikt Express","malikt-express","Addis Ababa and surrounding areas"],["Addis Courier","addis-courier","Addis Ababa"],["Swift Delivery","swift-delivery","Major Ethiopian cities"],["CityDrop","citydrop","Same-day urban delivery"]].forEach((c) => addCompany.run(...c));

const inquiry = db.prepare("INSERT INTO inquiries(business_id,customer_name,contact,contact_method,note,status,idempotency_key) VALUES(?,?,?,?,?,?,?)");
const inquiryItem = db.prepare(`INSERT INTO inquiry_items(
  inquiry_id,product_id,product_name_snapshot,quantity,quantity_intent,
  offering_kind_snapshot,quantity_mode_snapshot,options_json
) VALUES(?,?,?,?,?,?,?,?)`);
for (const [handle, customer] of businesses.slice(0, 4).map((business, index) => [business.handle, ["Hana","Mimi","Samuel","Rahel"][index]] as const)) {
  const businessId = seeded.get(handle)!;
  const iid = Number(inquiry.run(businessId, customer, "251911000000", "whatsapp", "Seed inquiry for local testing.", "new", `seed-${handle}`).lastInsertRowid);
  const product = db.prepare("SELECT id,name,offering_kind,quantity_mode FROM products WHERE business_id=? ORDER BY id LIMIT 1").get(businessId) as any;
  inquiryItem.run(iid, product.id, product.name, null, "1 unit", product.offering_kind, product.quantity_mode, JSON.stringify({}));
}

const denseInquiryIds: number[] = [];
const denseInquiryBusinessId = seeded.get("selam-weave")!;
const denseInquiryProduct = db.prepare(
  "SELECT id,name,offering_kind,quantity_mode FROM products WHERE business_id=? ORDER BY id LIMIT 1",
).get(denseInquiryBusinessId) as {
  id: number;
  name: string;
  offering_kind: OfferingKind;
  quantity_mode: QuantityMode;
};
const inquiryStatuses = ["new", "contacted", "confirmed", "closed", "cancelled"] as const;
for (let index = 1; index <= 36; index += 1) {
  const inquiryId = Number(inquiry.run(
    denseInquiryBusinessId,
    `Demo Buyer ${String(index).padStart(2, "0")}`,
    `demo-buyer-${index}@example.test`,
    "email",
    `Fictional inquiry ${index} used to exercise server pagination.`,
    inquiryStatuses[(index - 1) % inquiryStatuses.length],
    `scale-inquiry-${index}`,
  ).lastInsertRowid);
  denseInquiryIds.push(inquiryId);
  inquiryItem.run(
    inquiryId,
    denseInquiryProduct.id,
    denseInquiryProduct.name,
    null,
    index % 3 === 0 ? "1 ton" : `${index} units`,
    denseInquiryProduct.offering_kind,
    denseInquiryProduct.quantity_mode,
    JSON.stringify({}),
  );
}

const addDelivery = db.prepare(`
  INSERT INTO delivery_requests(
    business_id,inquiry_id,customer_name,phone,pickup_address,delivery_address,
    package_count,note,status,external_request_id
  ) VALUES(?,?,?,?,?,?,?,?,?,?)
`);
const addDeliveryCompany = db.prepare(
  "INSERT INTO delivery_request_companies(delivery_request_id,company_id,status) VALUES(?,?,'sent')",
);
const primaryDeliveryCompany = (
  db.prepare("SELECT id FROM delivery_companies ORDER BY id LIMIT 1").get() as {
    id: number;
  }
).id;
const deliveryStatuses = ["submitted", "viewed", "accepted", "driver_assigned", "picked_up", "delivered", "cancelled"] as const;
for (let index = 1; index <= 28; index += 1) {
  const deliveryId = Number(addDelivery.run(
    denseInquiryBusinessId,
    denseInquiryIds[index - 1],
    `Demo Buyer ${String(index).padStart(2, "0")}`,
    `251911${String(index).padStart(6, "0")}`,
    "Selam Weave demo pickup",
    `Demo destination ${index}, Addis Ababa`,
    (index % 4) + 1,
    "Fictional delivery history for pagination testing.",
    deliveryStatuses[(index - 1) % deliveryStatuses.length],
    `DEMO-DELIVERY-${String(index).padStart(4, "0")}`,
  ).lastInsertRowid);
  addDeliveryCompany.run(deliveryId, primaryDeliveryCompany);
}

const credentialPath=path.resolve(process.env.SUQPAGE_CREDENTIAL_PATH||path.join(process.cwd(),".local","seed-credentials.txt"));
fs.mkdirSync(path.dirname(credentialPath),{recursive:true});
const credentialText=["SuqPage temporary local credentials","Change every password on first login.","",...generatedCredentials.map(c=>`${c.role.toUpperCase()} | ${c.business} | ${c.email} | ${c.password}`)].join("\n");
fs.writeFileSync(credentialPath,credentialText,{mode:0o600});
console.log(`SuqPage database created at ${dbPath}`);
console.log(`Temporary credentials written to ${credentialPath}`);
if (process.env.SUQPAGE_SUPPRESS_CREDENTIAL_OUTPUT !== "1") console.log(credentialText);
