export type DenseDemoDesignVariant =
  | "technical"
  | "producer"
  | "catalog"
  | "editorial";

export type DenseDemoOfferingKind =
  | "standard_product"
  | "made_to_order"
  | "manufacturing_capability"
  | "production_supply";

export type DenseDemoBusiness = {
  handle: string;
  name: string;
  tagline: string;
  description: string;
  heroTitle: string;
  heroSubtitle: string;
  designVariant: DenseDemoDesignVariant;
  latitude: number;
  longitude: number;
  offerings: [
    {
      name: string;
      category: string;
      description: string;
      kind: DenseDemoOfferingKind;
    },
    {
      name: string;
      category: string;
      description: string;
      kind: DenseDemoOfferingKind;
    },
    {
      name: string;
      category: string;
      description: string;
      kind: DenseDemoOfferingKind;
    },
  ];
};

export const DENSE_DEMO_BUSINESSES: readonly DenseDemoBusiness[] = [
  {
    handle: "addis-polymer-molding",
    name: "Addis Polymer Molding",
    tagline: "Reusable plastic parts and containers produced to specification.",
    description: "A compact molding workshop producing durable containers, closures, and repeat plastic components for growing businesses.",
    heroTitle: "Turn a practical plastic part into a repeatable production run.",
    heroSubtitle: "Review standard containers or discuss tooling, resin, dimensions, finish, and monthly demand.",
    designVariant: "technical",
    latitude: 8.925,
    longitude: 38.726,
    offerings: [
      { name: "Stackable Production Crate", category: "Containers", description: "A durable reusable crate for factory, farm, and distribution handling.", kind: "standard_product" },
      { name: "Custom Closure Molding", category: "Components", description: "A molding capability for approved caps, plugs, and protective closures.", kind: "manufacturing_capability" },
      { name: "Food-Grade Container Run", category: "Containers", description: "A scheduled supply run produced around agreed dimensions and resin requirements.", kind: "production_supply" },
    ],
  },
  {
    handle: "sheger-carton-label",
    name: "Sheger Carton & Label",
    tagline: "Printed cartons, sleeves, and labels for products ready to scale.",
    description: "A packaging producer serving food, beauty, household, and industrial businesses with repeatable paperboard formats.",
    heroTitle: "Packaging that fits the product and the production line.",
    heroSubtitle: "Compare common formats or submit dimensions, artwork, material, finish, and run quantity.",
    designVariant: "catalog",
    latitude: 9.018,
    longitude: 38.716,
    offerings: [
      { name: "Printed Folding Carton", category: "Cartons", description: "A compact paperboard carton prepared in an agreed size, print, and finish.", kind: "made_to_order" },
      { name: "Roll Product Labels", category: "Labels", description: "Repeat labels supplied for compatible manual and assisted application.", kind: "production_supply" },
      { name: "Packaging Structure Sample", category: "Development", description: "A short development service for testing folds, fit, and closure before production.", kind: "manufacturing_capability" },
    ],
  },
  {
    handle: "akaki-fastener-works",
    name: "Akaki Fastener Works",
    tagline: "Common and custom fasteners for equipment, furniture, and construction.",
    description: "A metalworking producer supplying bolts, threaded parts, washers, and short-run fastening components.",
    heroTitle: "Specify the thread, material, finish, and quantity.",
    heroSubtitle: "Source standard fastening stock or request a repeat component from an approved sample or drawing.",
    designVariant: "technical",
    latitude: 8.88,
    longitude: 38.79,
    offerings: [
      { name: "Zinc-Plated Bolt Set", category: "Standard Fasteners", description: "Common bolt, nut, and washer combinations for workshop and installation use.", kind: "standard_product" },
      { name: "Custom Threaded Component", category: "Custom Parts", description: "Short-run threaded parts made from an approved drawing or reference sample.", kind: "manufacturing_capability" },
      { name: "Repeat Fastener Supply", category: "Standard Fasteners", description: "A recurring mixed-fastener supply arranged around a production bill of materials.", kind: "production_supply" },
    ],
  },
  {
    handle: "kaliti-food-equipment",
    name: "Kaliti Food Equipment",
    tagline: "Serviceable food-processing and preparation equipment built locally.",
    description: "A fabrication workshop producing stainless preparation, mixing, heating, and handling equipment for food businesses.",
    heroTitle: "Build the equipment around the product and daily throughput.",
    heroSubtitle: "Share process, batch size, utilities, cleaning needs, dimensions, and operator workflow.",
    designVariant: "technical",
    latitude: 8.91,
    longitude: 38.755,
    offerings: [
      { name: "Stainless Mixing Vessel", category: "Processing", description: "A cleanable batch vessel configured for an agreed product and working volume.", kind: "made_to_order" },
      { name: "Food Equipment Fabrication", category: "Custom Builds", description: "A fabrication capability for reviewed stainless processing and handling assemblies.", kind: "manufacturing_capability" },
      { name: "Mobile Preparation Station", category: "Workstations", description: "A stainless preparation table with practical storage and movement options.", kind: "made_to_order" },
    ],
  },
  {
    handle: "ethio-labware-supply",
    name: "Ethio Labware Supply",
    tagline: "Routine laboratory containers, tools, and handling supplies.",
    description: "A production-input supplier helping small laboratories, processors, and quality teams assemble practical recurring supply lists.",
    heroTitle: "Keep routine laboratory work supplied and easy to repeat.",
    heroSubtitle: "Build a requirement by material, volume, accuracy, quantity, and replenishment schedule.",
    designVariant: "catalog",
    latitude: 9.035,
    longitude: 38.77,
    offerings: [
      { name: "Borosilicate Vessel Set", category: "Glassware", description: "A practical set of compatible laboratory vessels for routine preparation work.", kind: "standard_product" },
      { name: "Sample Handling Pack", category: "Consumables", description: "A configurable pack of containers, labels, and handling essentials.", kind: "made_to_order" },
      { name: "Recurring Lab Consumables", category: "Consumables", description: "A scheduled supply plan based on an approved laboratory requirement list.", kind: "production_supply" },
    ],
  },
  {
    handle: "bole-packaging-inputs",
    name: "Bole Packaging Inputs",
    tagline: "Bottles, closures, liners, and packing materials for small producers.",
    description: "A production-input supplier organizing compatible primary and secondary packaging for growing consumer-product businesses.",
    heroTitle: "Match the container, closure, product, and filling process.",
    heroSubtitle: "Compare available packaging families or share volume, material, neck, seal, and quantity requirements.",
    designVariant: "catalog",
    latitude: 8.995,
    longitude: 38.79,
    offerings: [
      { name: "Amber Bottle Family", category: "Primary Packaging", description: "A coordinated family of compatible bottles for oils and liquid products.", kind: "standard_product" },
      { name: "Closure & Liner Match", category: "Closures", description: "A compatibility-led selection of caps, pumps, seals, and liners.", kind: "made_to_order" },
      { name: "Monthly Packaging Supply", category: "Primary Packaging", description: "Recurring packaging quantities scheduled around the buyer's filling plan.", kind: "production_supply" },
    ],
  },
  {
    handle: "addis-yarn-trim-supply",
    name: "Addis Yarn & Trim Supply",
    tagline: "Yarn, webbing, elastic, thread, and garment trims for repeat production.",
    description: "A textile-input supplier supporting apparel, workwear, weaving, and soft-goods producers with coordinated materials.",
    heroTitle: "Build the material set before the cutting and sewing begin.",
    heroSubtitle: "Request fiber, count, color, width, performance, sample, and recurring production quantities.",
    designVariant: "editorial",
    latitude: 9.052,
    longitude: 38.738,
    offerings: [
      { name: "Cotton Yarn Supply", category: "Yarn", description: "Production yarn supplied by agreed count, color, and batch quantity.", kind: "production_supply" },
      { name: "Workwear Trim Set", category: "Trims", description: "A coordinated set of thread, closures, elastic, and reinforcement materials.", kind: "made_to_order" },
      { name: "Woven Webbing Roll", category: "Trims", description: "Durable webbing for bags, uniforms, and utility textile products.", kind: "standard_product" },
    ],
  },
  {
    handle: "finfine-irrigation-inputs",
    name: "Finfine Irrigation Inputs",
    tagline: "Drip, filtration, connection, and water-control inputs for growers.",
    description: "An agricultural-input supplier assembling field-ready irrigation materials around crop, area, source, and pressure.",
    heroTitle: "Plan the water route before ordering the field kit.",
    heroSubtitle: "Share crop, plot size, source, pressure, elevation, spacing, and seasonal expansion needs.",
    designVariant: "producer",
    latitude: 9.074,
    longitude: 38.71,
    offerings: [
      { name: "Drip Line Field Roll", category: "Distribution", description: "A production-length drip line roll selected for crop spacing and field use.", kind: "standard_product" },
      { name: "Filter & Control Head", category: "Control", description: "A configured inlet assembly matched to source, flow, filtration, and zone needs.", kind: "made_to_order" },
      { name: "Seasonal Irrigation Input Plan", category: "Projects", description: "A recurring supply plan for expansion, replacement, and maintenance inputs.", kind: "production_supply" },
    ],
  },
  {
    handle: "meskel-coatings-adhesives",
    name: "Meskel Coatings & Adhesives",
    tagline: "Workshop coatings, bonding products, and application inputs.",
    description: "A formulation and supply business serving furniture, packaging, metalwork, interiors, and general production teams.",
    heroTitle: "Choose the finish or bond around the material and working conditions.",
    heroSubtitle: "Describe substrates, preparation, exposure, cure time, application method, and monthly use.",
    designVariant: "technical",
    latitude: 9.009,
    longitude: 38.752,
    offerings: [
      { name: "Water-Based Wood Finish", category: "Coatings", description: "A practical clear finish for compatible furniture and interior woodwork.", kind: "standard_product" },
      { name: "Packaging Adhesive Supply", category: "Adhesives", description: "Recurring adhesive quantities matched to paperboard and production conditions.", kind: "production_supply" },
      { name: "Application Trial Batch", category: "Development", description: "A controlled trial for evaluating preparation, application, cure, and finish.", kind: "manufacturing_capability" },
    ],
  },
  {
    handle: "merkato-bearings-drives",
    name: "Merkato Bearings & Drives",
    tagline: "Bearings, belts, chain, and power-transmission inputs for working equipment.",
    description: "A maintenance and production-input supplier matching mechanical drive components to dimensions, load, speed, and environment.",
    heroTitle: "Identify the drive component before downtime grows.",
    heroSubtitle: "Share markings, dimensions, equipment context, load, speed, and quantity for a compatible inquiry.",
    designVariant: "catalog",
    latitude: 9.03,
    longitude: 38.735,
    offerings: [
      { name: "Industrial Bearing Range", category: "Bearings", description: "Common sealed and serviceable bearing formats for compatible equipment.", kind: "standard_product" },
      { name: "Belt & Pulley Match", category: "Drives", description: "A requirement-led set matched to profile, dimensions, speed, and power.", kind: "made_to_order" },
      { name: "Maintenance Spares Schedule", category: "Supply Programs", description: "A recurring supply list for approved bearings and drive components.", kind: "production_supply" },
    ],
  },
  {
    handle: "repi-cleaning-compounds",
    name: "Repi Cleaning Compounds",
    tagline: "Process and facility cleaning products prepared for repeat use.",
    description: "A local compound producer serving workshops, hospitality, food handling, and institutional cleaning operations.",
    heroTitle: "Match the cleaning compound to the surface and process.",
    heroSubtitle: "Discuss soil type, material compatibility, dilution, pack format, safety handling, and monthly use.",
    designVariant: "producer",
    latitude: 9.012,
    longitude: 38.69,
    offerings: [
      { name: "Workshop Degreasing Concentrate", category: "Process Cleaning", description: "A concentrated cleaner for compatible workshop surfaces and equipment.", kind: "standard_product" },
      { name: "Institutional Cleaning Refill", category: "Facility Care", description: "Recurring bulk supply in an agreed pack and delivery cycle.", kind: "production_supply" },
      { name: "Private-Pack Cleaning Run", category: "Production", description: "A filling and labeling run based on an approved compound and pack brief.", kind: "manufacturing_capability" },
    ],
  },
  {
    handle: "kaliti-glass-containers",
    name: "Kaliti Glass Containers",
    tagline: "Glass jars and bottles organized for food, care, and household products.",
    description: "A container supplier helping producers select practical glass formats, closures, dividers, and repeat quantities.",
    heroTitle: "See the container as part of filling, closing, and transport.",
    heroSubtitle: "Request volume, opening, color, closure, packing, sample, and production quantity.",
    designVariant: "catalog",
    latitude: 8.895,
    longitude: 38.742,
    offerings: [
      { name: "Food Jar Range", category: "Jars", description: "Common clear-glass jar formats for compatible food and dry products.", kind: "standard_product" },
      { name: "Amber Bottle Range", category: "Bottles", description: "Protective amber formats for compatible liquid and care products.", kind: "standard_product" },
      { name: "Pallet Container Supply", category: "Supply Programs", description: "Repeat quantities prepared with agreed closures and transport packing.", kind: "production_supply" },
    ],
  },
  {
    handle: "addis-foam-upholstery",
    name: "Addis Foam & Upholstery Supply",
    tagline: "Foam, batting, webbing, and upholstery inputs for furniture makers.",
    description: "A production-input supplier serving seating, mattress, hospitality, and interior workshops with repeat material formats.",
    heroTitle: "Build the comfort layer around use, density, and dimensions.",
    heroSubtitle: "Share application, firmness, thickness, sheet size, cover material, and recurring quantity.",
    designVariant: "editorial",
    latitude: 9.062,
    longitude: 38.77,
    offerings: [
      { name: "High-Density Foam Sheet", category: "Foam", description: "A durable sheet format selected by density, thickness, and intended use.", kind: "standard_product" },
      { name: "Cut Cushion Core Set", category: "Cut Components", description: "Repeat foam pieces cut to approved dimensions for a seating product.", kind: "manufacturing_capability" },
      { name: "Upholstery Input Bundle", category: "Workshop Inputs", description: "A coordinated supply of foam, batting, webbing, and related materials.", kind: "production_supply" },
    ],
  },
  {
    handle: "pioneer-feed-ingredients",
    name: "Pioneer Feed Ingredients",
    tagline: "Milling and feed-production inputs supplied with clear batch needs.",
    description: "An agricultural production-input supplier organizing grain byproducts, mineral inputs, and handling formats for feed producers.",
    heroTitle: "Plan the input mix around the animal, formula, and production cycle.",
    heroSubtitle: "Discuss ingredient specification, batch volume, testing needs, bag format, and delivery cadence.",
    designVariant: "producer",
    latitude: 8.965,
    longitude: 38.704,
    offerings: [
      { name: "Milled Bran Supply", category: "Feed Inputs", description: "Recurring bran quantities supplied in agreed bag and delivery formats.", kind: "production_supply" },
      { name: "Mineral Input Pack", category: "Supplement Inputs", description: "A bounded input pack prepared from an approved feed-production requirement.", kind: "made_to_order" },
      { name: "Bulk Handling Bag", category: "Packing", description: "A durable bag format for compatible dry agricultural production inputs.", kind: "standard_product" },
    ],
  },
  {
    handle: "blue-crane-steel-profiles",
    name: "Blue Crane Steel Profiles",
    tagline: "Tube, angle, channel, and cut steel supplied for fabrication.",
    description: "A material supplier serving equipment, furniture, construction, and general metalworking with repeat profile lists.",
    heroTitle: "Turn the cutting list into one organized material inquiry.",
    heroSubtitle: "Share grade, profile, wall, length, cut tolerance, finish, and recurring quantity.",
    designVariant: "technical",
    latitude: 8.94,
    longitude: 38.81,
    offerings: [
      { name: "Structural Tube Range", category: "Profiles", description: "Common square and rectangular tube formats for compatible fabrication work.", kind: "standard_product" },
      { name: "Cut-to-Length Profile Pack", category: "Cut Material", description: "A prepared material pack cut from an approved list and tolerance.", kind: "manufacturing_capability" },
      { name: "Monthly Steel Profile Supply", category: "Supply Programs", description: "Recurring profile quantities organized around a stable fabrication plan.", kind: "production_supply" },
    ],
  },
  {
    handle: "unity-timber-panels",
    name: "Unity Timber Panels",
    tagline: "Boards, panels, edging, and cut components for furniture production.",
    description: "A wood-material supplier serving joinery, interiors, displays, and furniture workshops with practical sheet and component formats.",
    heroTitle: "Start the furniture run with a clear board and cutting requirement.",
    heroSubtitle: "Specify material, thickness, finish, dimensions, edge treatment, and production quantity.",
    designVariant: "editorial",
    latitude: 9.096,
    longitude: 38.735,
    offerings: [
      { name: "Furniture Panel Range", category: "Panels", description: "Common sheet materials supplied by agreed thickness and surface finish.", kind: "standard_product" },
      { name: "Cut & Edged Component Set", category: "Components", description: "Repeat panel components cut and edged from an approved schedule.", kind: "manufacturing_capability" },
      { name: "Workshop Board Supply", category: "Supply Programs", description: "A recurring mixed-sheet supply arranged around a production plan.", kind: "production_supply" },
    ],
  },
  {
    handle: "abay-bakery-ingredients",
    name: "Abay Bakery Ingredients",
    tagline: "Flour, seeds, inclusions, and production inputs for bakeries.",
    description: "A food-production input supplier helping bakeries and snack producers organize repeat ingredients and pack formats.",
    heroTitle: "Keep the recipe input consistent from test batch to daily production.",
    heroSubtitle: "Discuss ingredient specification, pack size, batch usage, substitution limits, and supply cadence.",
    designVariant: "producer",
    latitude: 9.045,
    longitude: 38.795,
    offerings: [
      { name: "Bread Flour Supply", category: "Core Ingredients", description: "Recurring flour quantities supplied in agreed bakery pack formats.", kind: "production_supply" },
      { name: "Seed & Grain Inclusion Pack", category: "Inclusions", description: "A configurable set of bakery seeds and grain inclusions.", kind: "made_to_order" },
      { name: "Baking Input Sample Set", category: "Development", description: "A practical sample set for recipe trials and supplier comparison.", kind: "standard_product" },
    ],
  },
  {
    handle: "sheba-welding-consumables",
    name: "Sheba Welding Consumables",
    tagline: "Wire, electrodes, abrasives, and workshop consumables for fabrication.",
    description: "A production-input supplier serving metal workshops with compatible welding and finishing consumables.",
    heroTitle: "Match the consumable to the process, material, and working position.",
    heroSubtitle: "Share base material, thickness, process, machine, finish, pack, and monthly use.",
    designVariant: "catalog",
    latitude: 8.972,
    longitude: 38.735,
    offerings: [
      { name: "General Fabrication Electrode", category: "Welding", description: "A common electrode format for compatible workshop fabrication.", kind: "standard_product" },
      { name: "Cutting & Grinding Pack", category: "Abrasives", description: "A configurable consumables pack based on material and tool size.", kind: "made_to_order" },
      { name: "Workshop Consumables Refill", category: "Supply Programs", description: "Recurring welding and finishing inputs supplied from an approved list.", kind: "production_supply" },
    ],
  },
  {
    handle: "addis-rubber-seals",
    name: "Addis Rubber & Seals",
    tagline: "Gaskets, pads, seals, and protective rubber components.",
    description: "A component producer making common and custom rubber parts for equipment, enclosures, furniture, and general industry.",
    heroTitle: "Define the contact, material, environment, and repeated shape.",
    heroSubtitle: "Submit dimensions or a sample with hardness, exposure, tolerance, and quantity requirements.",
    designVariant: "technical",
    latitude: 8.905,
    longitude: 38.82,
    offerings: [
      { name: "Standard Gasket Sheet", category: "Materials", description: "A practical sheet material for compatible sealing and isolation work.", kind: "standard_product" },
      { name: "Custom Cut Gasket Run", category: "Components", description: "Repeat gasket shapes cut from an approved drawing or sample.", kind: "manufacturing_capability" },
      { name: "Equipment Isolation Pad", category: "Components", description: "A durable rubber pad configured for load, dimensions, and environment.", kind: "made_to_order" },
    ],
  },
  {
    handle: "prime-insulated-panels",
    name: "Prime Insulated Panels",
    tagline: "Insulated wall, ceiling, and enclosure panels for controlled spaces.",
    description: "A building-component producer serving cold rooms, food handling, workshops, and clean storage projects.",
    heroTitle: "Size the enclosure around temperature, hygiene, and daily use.",
    heroSubtitle: "Share dimensions, target conditions, openings, finish, installation site, and project schedule.",
    designVariant: "technical",
    latitude: 8.932,
    longitude: 38.775,
    offerings: [
      { name: "Insulated Wall Panel", category: "Panels", description: "A modular panel prepared in an agreed thickness, finish, and length.", kind: "made_to_order" },
      { name: "Cold-Room Panel Package", category: "Project Packages", description: "A panel and trim package sized from an approved enclosure layout.", kind: "manufacturing_capability" },
      { name: "Replacement Panel Supply", category: "Panels", description: "Repeat or replacement panel quantities matched to a retained specification.", kind: "production_supply" },
    ],
  },
];

export const DENSE_DEMO_HANDLES = Object.freeze(
  DENSE_DEMO_BUSINESSES.map((business) => business.handle),
);

export function denseDemoHeroPath(handle: string) {
  return `/uploads/seed/expo/${handle}/hero.webp`;
}

export function denseDemoBusiness(handle: string) {
  return DENSE_DEMO_BUSINESSES.find((business) => business.handle === handle);
}
