import type {
  ShowroomDecorativeDepth,
  ShowroomMotionIntensity,
} from "./showroom-experience";
import type { SectionMediaIntegration } from "./showroom-design-systems";
import type { ProductDetailPattern } from "./product-detail-patterns";

export type SeedShowroomBrief = {
  objective: string;
  template: string;
  profile: {
    tokenPack: string;
    motion: ShowroomMotionIntensity;
    decoration: ShowroomDecorativeDepth;
    header: string;
    hero: string;
    story: string;
    highlights: string;
    catalog: string;
    cta: string;
    footer: string;
    ctaVariant: "magazine-close" | "technical-brief";
    heroMediaIntegration: SectionMediaIntegration;
    storyMediaIntegration: SectionMediaIntegration;
    productDetailPattern?: ProductDetailPattern;
  };
  story: {
    kicker: string;
    title: string;
    quote: string;
  };
  process: {
    title: string;
    body: string;
    items: [string, string, string];
  };
  cta: {
    title: string;
    body: string;
  };
};

export const ADDITIONAL_SEED_SHOWROOM_BRIEFS: Record<string, SeedShowroomBrief> = {
  "selam-weave": {
    objective: "Present handwoven textiles as useful material objects with visible craft and custom-run potential.",
    template: "Textile-led editorial opening, tactile process chapter, and vertically paced product stack.",
    profile: {
      tokenPack: "silk-atelier", motion: "quiet", decoration: "signature",
      header: "header.editorial-wordmark@1", hero: "hero.textile-swatch@1",
      story: "content.swatch-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.textile-stack@1", cta: "call-to-action.magazine-close@1",
      footer: "footer.editorial@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "editorial_overlap", storyMediaIntegration: "natural",
      productDetailPattern: "editorial",
    },
    story: { kicker: "At the loom", title: "Every cloth begins with fiber, rhythm, and intended use", quote: "A useful textile should make its construction easy to see." },
    process: { title: "From yarn choice to hand-finished edge", body: "Color, weave density, dimensions, and finishing are agreed before a limited or custom run begins.", items: ["Choose fiber and palette", "Set dimensions and weave", "Finish, inspect, and pack"] },
    cta: { title: "Start with the cloth, size, and setting you have in mind.", body: "Add a textile and share color, dimensions, quantity, and whether it is for home, hospitality, or gifting." },
  },
  "afia-botanics": {
    objective: "Make small-batch botanical care feel clean, credible, and easy to compare by ritual.",
    template: "Ingredient-focused beauty story with a light product stage and concise formulation details.",
    profile: {
      tokenPack: "cosmetic-laboratory", motion: "expressive", decoration: "subtle",
      header: "header.floating-capsule@1", hero: "hero.beauty-orbit@1",
      story: "content.founder-note@1", highlights: "content.ritual-steps@1",
      catalog: "catalog.beauty-swatch@1", cta: "call-to-action.inquiry@1",
      footer: "footer.magazine-masthead@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "product_stage", storyMediaIntegration: "natural",
      productDetailPattern: "product_stage",
    },
    story: { kicker: "Formula notes", title: "Simple care begins with ingredients people can understand", quote: "Botanical does not have to mean vague." },
    process: { title: "A measured path from ingredient to jar", body: "Each batch follows a clear formula, preparation sequence, fill, and label check.", items: ["Select and measure ingredients", "Mix the controlled batch", "Fill, label, and review"] },
    cta: { title: "Ask about a ritual, ingredient, or small production run.", body: "Choose a formula and share intended use, pack size, quantity, and any labeling needs." },
  },
  "warka-furniture": {
    objective: "Let buyers understand proportion, joinery, finish, and project fit before discussing furniture.",
    template: "Room-scene opening followed by material proof and grouped furniture browsing.",
    profile: {
      tokenPack: "paper-gallery", motion: "balanced", decoration: "subtle",
      header: "header.catalog-command@1", hero: "hero.room-scene@1",
      story: "content.material-focus@1", highlights: "content.process-steps@1",
      catalog: "catalog.room-set@1", cta: "call-to-action.consultation@1",
      footer: "footer.contact-panel@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "surface_blend", storyMediaIntegration: "natural",
      productDetailPattern: "editorial",
    },
    story: { kicker: "Material and joinery", title: "Furniture shaped around the room and the way it is used", quote: "Proportion is a practical decision before it is a visual one." },
    process: { title: "From room measure to finished piece", body: "Standard pieces begin with dimensions and finish; project work adds site conditions and installation.", items: ["Measure use and space", "Choose timber and finish", "Build, inspect, and install"] },
    cta: { title: "Bring the room, dimensions, and intended use.", body: "Add a related piece and share measurements, finish, quantity, and installation location." },
  },
  "addis-metalworks": {
    objective: "Turn fabricated products and capabilities into a precise requirement-led RFQ conversation.",
    template: "Industrial specification opening, production proof, and compact technical catalog.",
    profile: {
      tokenPack: "industrial-steel", motion: "quiet", decoration: "clean",
      header: "header.compact-utility@1", hero: "hero.industrial-spec@1",
      story: "content.origin-story@1", highlights: "content.production-metrics@1",
      catalog: "catalog.minimal-list@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.technical-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "split_bleed", storyMediaIntegration: "natural",
      productDetailPattern: "technical",
    },
    story: { kicker: "Fabrication floor", title: "Built from reviewed dimensions, material, and finish", quote: "The drawing and the working environment belong in the same brief." },
    process: { title: "From requirement to inspected fabrication", body: "Material, dimensions, joints, finish, and quantity are reviewed before cutting begins.", items: ["Review drawing and duty", "Cut, form, and join", "Inspect finish and fit"] },
    cta: { title: "Send the dimensions, material, finish, and required quantity.", body: "Add the closest fabrication and include drawings, tolerances, operating context, and delivery timing." },
  },
  "green-terrace-farm": {
    objective: "Keep seasonal produce current while making recurring household and kitchen supply easy to discuss.",
    template: "Field provenance, harvest rhythm, and a horizontally browsable seasonal shelf.",
    profile: {
      tokenPack: "forest-botanical", motion: "quiet", decoration: "subtle",
      header: "header.producer-badge@1", hero: "hero.provenance@1",
      story: "content.origin-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.horizontal-shelf@1", cta: "call-to-action.wholesale@1",
      footer: "footer.catalog-directory@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
      productDetailPattern: "compact",
    },
    story: { kicker: "Current field cycle", title: "A seasonal catalog connected to what is actually growing", quote: "The field sets the rhythm; the inquiry sets the useful quantity." },
    process: { title: "Harvested around the current supply window", body: "Crop condition, harvest day, handling, and recurring need shape each supply conversation.", items: ["Review the current harvest", "Choose pack or crate format", "Confirm collection or supply day"] },
    cta: { title: "Plan a household, kitchen, or recurring harvest inquiry.", body: "Select current produce and share preferred quantity, frequency, and collection or delivery area." },
  },
  "blue-nile-apiary": {
    objective: "Explain seasonal honey character and hive products without turning the showroom into rustic decoration.",
    template: "Ingredient monograph with clear harvest notes and restrained product-led browsing.",
    profile: {
      tokenPack: "honey-amber", motion: "quiet", decoration: "clean",
      header: "header.transparent-overlay@1", hero: "hero.ingredient-monograph@1",
      story: "content.origin-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.collection-led@1", cta: "call-to-action.wholesale@1",
      footer: "footer.compact@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
      productDetailPattern: "product_stage",
    },
    story: { kicker: "Harvest character", title: "Each hive product follows a season, source, and careful handling path", quote: "Good honey needs a clear harvest story, not an invented one." },
    process: { title: "From active hive to clean jar", body: "Harvest timing, separation, settling, and packing protect each small batch.", items: ["Observe and select the harvest", "Separate and settle carefully", "Jar, label, and store"] },
    cta: { title: "Ask about the current honey, comb, or beeswax batch.", body: "Select an item and share jar size, gift, household, or wholesale quantity needs." },
  },
  "rift-valley-mill": {
    objective: "Make grain source, milling style, pack format, and recurring bakery supply simple to compare.",
    template: "Grain-led producer story with dense factual shelf and trade-ready close.",
    profile: {
      tokenPack: "ocean-trade", motion: "quiet", decoration: "clean",
      header: "header.producer-badge@1", hero: "hero.ingredient-monograph@1",
      story: "content.origin-story@1", highlights: "content.production-metrics@1",
      catalog: "catalog.collection-led@1", cta: "call-to-action.wholesale@1",
      footer: "footer.catalog-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "natural", storyMediaIntegration: "natural",
      productDetailPattern: "compact",
    },
    story: { kicker: "Inside the mill", title: "Grain identity stays visible from intake to finished pack", quote: "A useful flour catalog should tell buyers what was milled and how." },
    process: { title: "Clean, mill, check, and pack", body: "Grain type, milling target, pack size, and supply cadence are agreed for each request.", items: ["Receive and clean grain", "Mill to the chosen format", "Check and pack the run"] },
    cta: { title: "Start with grain type, pack size, and expected frequency.", body: "Add a flour or blend and share household, bakery, hospitality, or recurring supply needs." },
  },
  "entoto-ceramics": {
    objective: "Show tableware as useful studio forms with honest glaze variation and hospitality potential.",
    template: "Material-detail opening, quiet studio story, and spacious editorial product grid.",
    profile: {
      tokenPack: "artisan-clay", motion: "quiet", decoration: "subtle",
      header: "header.editorial-wordmark@1", hero: "hero.material-detail@1",
      story: "content.material-focus@1", highlights: "content.ritual-steps@1",
      catalog: "catalog.editorial-grid@1", cta: "call-to-action.magazine-close@1",
      footer: "footer.editorial@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "editorial_overlap", storyMediaIntegration: "natural",
      productDetailPattern: "editorial",
    },
    story: { kicker: "Studio form", title: "Useful objects shaped with room for natural variation", quote: "The hand remains visible, but the form still has a job to do." },
    process: { title: "Shape, dry, fire, glaze, and fire again", body: "Form, set quantity, glaze family, and use guide the studio production plan.", items: ["Shape and refine the form", "Dry and complete first firing", "Glaze, fire, and inspect"] },
    cta: { title: "Build a table, gift, or hospitality set with the studio.", body: "Add a form and share quantity, glaze family, timing, and tolerance for natural variation." },
  },
  "koba-leather": {
    objective: "Put construction, carry use, finish, and small-run customization at the center of leather goods.",
    template: "Material-led opening with practical process proof and a restrained editorial catalog.",
    profile: {
      tokenPack: "maker-indigo", motion: "balanced", decoration: "clean",
      header: "header.compact-utility@1", hero: "hero.material-detail@1",
      story: "content.material-focus@1", highlights: "content.process-steps@1",
      catalog: "catalog.editorial-grid@1", cta: "call-to-action.consultation@1",
      footer: "footer.compact@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
      productDetailPattern: "product_stage",
    },
    story: { kicker: "Cut and construction", title: "Leather goods designed around what they must carry", quote: "Durability is visible in the edge, stitch, reinforcement, and closure." },
    process: { title: "From pattern to finished edge", body: "Use, dimensions, leather, hardware, and quantity define the cut and assembly plan.", items: ["Choose form and finish", "Cut, reinforce, and stitch", "Finish edges and inspect"] },
    cta: { title: "Choose a carry form or describe a small team run.", body: "Add a product and share finish, dimensions, quantity, marking, and delivery timing." },
  },
  "nova-assembly": {
    objective: "Make electronics assembly and repair understandable without hiding specification requirements.",
    template: "Cinematic technical opening, structured process proof, and specification-led catalog.",
    profile: {
      tokenPack: "chrome-future", motion: "balanced", decoration: "clean",
      header: "header.technical-marquee@1", hero: "hero.technology-cinematic@1",
      story: "content.editorial-quote@1", highlights: "content.production-metrics@1",
      catalog: "catalog.technology-spec@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.technical-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "surface_blend", storyMediaIntegration: "natural",
      productDetailPattern: "technical",
    },
    story: { kicker: "Bench discipline", title: "Technical work documented before assembly or repair begins", quote: "The connector, load, fault, and operating environment all matter." },
    process: { title: "Diagnose, define, assemble, and verify", body: "The lab records the requirement, confirms compatibility, completes the work, and verifies the result.", items: ["Document equipment and need", "Review circuit and interfaces", "Assemble, test, and label"] },
    cta: { title: "Send the equipment, fault, load, connector, and quantity context.", body: "Add a related build or service and include photos, model details, interfaces, and expected operating conditions." },
  },
  "tekle-circuit-systems": {
    objective: "Make repeat electronics assembly legible to equipment buyers.",
    template: "Technical proof with a compact comparison catalog.",
    profile: {
      tokenPack: "chrome-future", motion: "balanced", decoration: "clean",
      header: "header.technical-marquee@1", hero: "hero.technology-cinematic@1",
      story: "content.editorial-quote@1", highlights: "content.exploded-feature@1",
      catalog: "catalog.collection-led@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.technical-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "surface_blend", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Assembly discipline",
      title: "Control electronics prepared for repeat equipment builds",
      quote: "Document the module, protect the assembly, repeat the result.",
    },
    process: {
      title: "From electrical requirement to labeled assembly",
      body: "The buyer defines the operating need before boards, harnesses, and enclosures are prepared.",
      items: ["Define signals and loads", "Review protection and connectors", "Quote the repeat production run"],
    },
    cta: {
      title: "Send the control requirement, quantity, and equipment context.",
      body: "Add relevant modules and include voltage, interfaces, enclosure needs, and expected production quantity.",
    },
  },
  "luna-cold-chain": {
    objective: "Help growers compare cooling capacity and installation formats.",
    template: "Operational story followed by capacity-led equipment choices.",
    profile: {
      tokenPack: "ocean-trade", motion: "quiet", decoration: "subtle",
      header: "header.compact-utility@1", hero: "hero.split-story@1",
      story: "content.origin-story@1", highlights: "content.production-metrics@1",
      catalog: "catalog.feature-tiles@1", cta: "call-to-action.consultation@1",
      footer: "footer.contact-panel@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "split_bleed", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Cold-chain purpose",
      title: "Cooling formats sized around harvest movement",
      quote: "Useful cooling begins with volume, temperature, power, and time.",
    },
    process: {
      title: "Size the system before selecting the enclosure",
      body: "Capacity, product type, ambient conditions, and available power shape the right cold-chain format.",
      items: ["Describe the produce flow", "Confirm temperature and power", "Plan delivery and installation"],
    },
    cta: {
      title: "Plan a cooling setup around the product you handle.",
      body: "Share daily volume, holding time, target temperature, site power, and installation constraints.",
    },
  },
  "abyssinia-solar-devices": {
    objective: "Present configurable solar devices without hiding technical needs.",
    template: "Product-led opening with a clear specification path.",
    profile: {
      tokenPack: "technology-mono", motion: "balanced", decoration: "clean",
      header: "header.transparent-overlay@1", hero: "hero.product-spotlight@1",
      story: "content.origin-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.minimal-list@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.compact@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Practical energy",
      title: "Solar assemblies configured around real site loads",
      quote: "Start with the work the system must power.",
    },
    process: {
      title: "Turn a site need into a serviceable power kit",
      body: "Load, runtime, charging conditions, and installation determine the final configuration.",
      items: ["List devices and runtime", "Match generation and storage", "Confirm protection and installation"],
    },
    cta: {
      title: "Describe the load before requesting a solar configuration.",
      body: "Include device wattage, operating hours, location, installation conditions, and quantity.",
    },
  },
  "nuru-naturals-lab": {
    objective: "Balance botanical appeal with controlled-batch credibility.",
    template: "Sculptural product story with formula and batch clarity.",
    profile: {
      tokenPack: "cosmetic-laboratory", motion: "expressive", decoration: "signature",
      header: "header.floating-capsule@1", hero: "hero.beauty-orbit@1",
      story: "content.founder-note@1", highlights: "content.ritual-steps@1",
      catalog: "catalog.beauty-swatch@1", cta: "call-to-action.inquiry@1",
      footer: "footer.magazine-masthead@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "product_stage", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Inside the formulation room",
      title: "Plant oils prepared with a traceable batch record",
      quote: "A natural formula should still explain what is inside and how it was made.",
    },
    process: {
      title: "A measured path from ingredient to filled product",
      body: "Ingredients are selected, formulas are controlled, and each production request is matched to an appropriate run.",
      items: ["Review formula and use", "Confirm pack and quantity", "Schedule the controlled batch"],
    },
    cta: {
      title: "Choose a current formula or begin a private-label discussion.",
      body: "Add products, then share format, pack size, quantity, labeling, and timing needs.",
    },
  },
  "bale-herb-care": {
    objective: "Connect highland sourcing to clear preparation and use.",
    template: "Source-led editorial page with a calm product shelf.",
    profile: {
      tokenPack: "mineral-spa", motion: "quiet", decoration: "subtle",
      header: "header.producer-badge@1", hero: "hero.ingredient-monograph@1",
      story: "content.origin-story@1", highlights: "content.ritual-steps@1",
      catalog: "catalog.horizontal-shelf@1", cta: "call-to-action.sample-question@1",
      footer: "footer.editorial@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Bale highland source",
      title: "Botanicals prepared close to where they are gathered",
      quote: "Source, preparation, and intended use belong in the same conversation.",
    },
    process: {
      title: "From selected botanical to a clearly labeled format",
      body: "Each request starts with the ingredient, preparation method, intended use, and available batch.",
      items: ["Identify the botanical", "Review preparation and format", "Confirm batch and handling"],
    },
    cta: {
      title: "Ask about the current botanical batch and suitable format.",
      body: "Share the product, intended use, quantity, and any packaging or hospitality requirements.",
    },
  },
  "saba-soap-works": {
    objective: "Show a disciplined soap workshop serving retail and hospitality.",
    template: "Confident statement, production proof, then wholesale-ready catalog.",
    profile: {
      tokenPack: "beauty-editorial", motion: "balanced", decoration: "clean",
      header: "header.catalog-command@1", hero: "hero.centered-statement@1",
      story: "content.founder-note@1", highlights: "content.production-metrics@1",
      catalog: "catalog.editorial-grid@1", cta: "call-to-action.wholesale@1",
      footer: "footer.catalog-directory@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "natural", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Workshop standard",
      title: "Everyday cleansing bars made for dependable repeat orders",
      quote: "A simple bar earns trust through formula, cure, finish, and consistency.",
    },
    process: {
      title: "A repeatable route from formula to packed case",
      body: "Formula, bar size, cure timing, wrap, and order quantity are agreed before production.",
      items: ["Choose formula and size", "Confirm wrap and labeling", "Plan batch and case quantity"],
    },
    cta: {
      title: "Build a household, hospitality, or private-label soap order.",
      body: "Select a bar and share quantity, packaging, labeling, and preferred production timing.",
    },
  },
  "geda-coffee-cooperative": {
    objective: "Support both household coffee discovery and trade-lot inquiry.",
    template: "Provenance-led producer page with trade-ready catalog density.",
    profile: {
      tokenPack: "coffee-roast", motion: "quiet", decoration: "subtle",
      header: "header.producer-badge@1", hero: "hero.provenance@1",
      story: "content.origin-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.horizontal-shelf@1", cta: "call-to-action.wholesale@1",
      footer: "footer.catalog-directory@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Producer lot",
      title: "Coffee formats connected to a cooperative supply route",
      quote: "The inquiry should identify the coffee, format, volume, and expected cadence.",
    },
    process: {
      title: "Choose the format, then define the supply need",
      body: "Roasted packs, hospitality formats, and green samples each begin with a different buyer requirement.",
      items: ["Review current coffee formats", "Request sample or pack details", "Confirm volume and recurrence"],
    },
    cta: {
      title: "Start a coffee inquiry with format, volume, and frequency.",
      body: "Add the relevant coffee and note pack size, sample needs, recurring volume, and destination.",
    },
  },
  "atlas-pump-works": {
    objective: "Turn pump selection into a requirement-led mechanical inquiry.",
    template: "Indexed industrial proof with a compact specification catalog.",
    profile: {
      tokenPack: "industrial-steel", motion: "quiet", decoration: "clean",
      header: "header.technical-marquee@1", hero: "hero.industrial-spec@1",
      story: "content.material-focus@1", highlights: "content.exploded-feature@1",
      catalog: "catalog.minimal-list@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.technical-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "split_bleed", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Mechanical build",
      title: "Pump assemblies arranged for access, protection, and service",
      quote: "Flow is only one part of a pump that must work on site.",
    },
    process: {
      title: "Specify duty before selecting the skid",
      body: "Source, lift, flow, power, connections, protection, and service access shape the assembly.",
      items: ["Define source and duty point", "Match pump, drive, and connections", "Review frame, guard, and service access"],
    },
    cta: {
      title: "Send the flow, lift, power, and connection requirement.",
      body: "Add a relevant assembly and include source conditions, duty point, pipe sizes, power, quantity, and site constraints.",
    },
  },
  "merkato-packaging-systems": {
    objective: "Help growing producers visualize a practical packing station.",
    template: "Workflow-led machinery page with dense project choices.",
    profile: {
      tokenPack: "technology-mono", motion: "balanced", decoration: "clean",
      header: "header.compact-utility@1", hero: "hero.split-story@1",
      story: "content.origin-story@1", highlights: "content.production-metrics@1",
      catalog: "catalog.feature-tiles@1", cta: "call-to-action.consultation@1",
      footer: "footer.contact-panel@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "natural", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Packing workflow",
      title: "Compact equipment arranged around product and throughput",
      quote: "The line should fit the product, operator, pack, and room.",
    },
    process: {
      title: "Map the pack before choosing the station",
      body: "Product behavior, container, closure, target output, operator count, and floor space define the layout.",
      items: ["Describe product and package", "Set output and operator needs", "Review station layout and utilities"],
    },
    cta: {
      title: "Request a packing layout around your actual product.",
      body: "Share product, container, closure, hourly target, room dimensions, utilities, and budget stage.",
    },
  },
  "jimma-agro-machinery": {
    objective: "Present serviceable farm-processing equipment with operational clarity.",
    template: "Producer-led machinery story with feature-forward catalog.",
    profile: {
      tokenPack: "harvest-earth", motion: "quiet", decoration: "subtle",
      header: "header.producer-badge@1", hero: "hero.industrial-spec@1",
      story: "content.origin-story@1", highlights: "content.exploded-feature@1",
      catalog: "catalog.feature-tiles@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.catalog-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "surface_blend", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Built near the work",
      title: "Processing tools designed around farm and cooperative routines",
      quote: "Capacity matters, but service access keeps the machine useful.",
    },
    process: {
      title: "Match crop, batch, power, and handling",
      body: "The working material and desired daily output guide capacity, drive, guarding, and mobility.",
      items: ["Identify crop and batch size", "Choose drive and handling", "Confirm guards, spares, and service"],
    },
    cta: {
      title: "Describe the crop, daily volume, power, and working conditions.",
      body: "Add the closest machine and include material, capacity, mobility, power, site access, and quantity.",
    },
  },
  "hadiya-woodcraft": {
    objective: "Balance repeatable furniture with measured interior project work.",
    template: "Room-led furniture story with grouped product scenes.",
    profile: {
      tokenPack: "furniture-walnut", motion: "balanced", decoration: "subtle",
      header: "header.catalog-command@1", hero: "hero.room-scene@1",
      story: "content.material-focus@1", highlights: "content.process-steps@1",
      catalog: "catalog.room-set@1", cta: "call-to-action.consultation@1",
      footer: "footer.contact-panel@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "surface_blend", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Joinery and proportion",
      title: "Furniture developed for useful rooms and repeat production",
      quote: "Good joinery begins with the space, the use, and the material.",
    },
    process: {
      title: "From room measurement to finished joinery",
      body: "Standard pieces begin with quantity and finish; fitted work adds site dimensions and installation planning.",
      items: ["Choose standard or fitted work", "Confirm dimensions and material", "Review finish, quantity, and installation"],
    },
    cta: {
      title: "Start with the room, dimensions, and intended use.",
      body: "Add a related piece and share measurements, material preference, finish, quantity, and installation location.",
    },
  },
  "gurage-lighting-works": {
    objective: "Present lighting as a designed part of the room, not a loose object grid.",
    template: "Editorial spatial opening with project-oriented catalog.",
    profile: {
      tokenPack: "paper-gallery", motion: "balanced", decoration: "signature",
      header: "header.transparent-overlay@1", hero: "hero.editorial-collage@1",
      story: "content.lookbook-chapter@1", highlights: "content.process-steps@1",
      catalog: "catalog.editorial-grid@1", cta: "call-to-action.consultation@1",
      footer: "footer.magazine-masthead@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "editorial_overlap", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Light in the room",
      title: "Fixtures composed around scale, surface, and atmosphere",
      quote: "A fitting belongs to the architecture around it.",
    },
    process: {
      title: "Choose the effect before the finish",
      body: "Room use, mounting position, light direction, scale, finish, and quantity shape the project selection.",
      items: ["Describe room and mounting point", "Choose light effect and scale", "Confirm finish, quantity, and installation"],
    },
    cta: {
      title: "Build a lighting inquiry around the room and required effect.",
      body: "Add relevant fixtures and note room use, dimensions, mounting, finish, quantity, and project timing.",
    },
  },
  "sidama-workwear": {
    objective: "Make repeat uniform ordering easy for operations teams.",
    template: "Textile-led opening with production and sizing clarity.",
    profile: {
      tokenPack: "maker-indigo", motion: "balanced", decoration: "clean",
      header: "header.compact-utility@1", hero: "hero.textile-swatch@1",
      story: "content.swatch-story@1", highlights: "content.production-metrics@1",
      catalog: "catalog.textile-stack@1", cta: "call-to-action.wholesale@1",
      footer: "footer.catalog-directory@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Working fabric",
      title: "Uniforms developed for movement, wear, and repeat orders",
      quote: "The right garment must survive the work and remain easy to reorder.",
    },
    process: {
      title: "Set the role, garment, size range, and identity",
      body: "Team role and environment guide fabric, reinforcement, sizing, pockets, color, and branding.",
      items: ["Define role and conditions", "Approve garment and size set", "Confirm branding and repeat quantity"],
    },
    cta: {
      title: "Plan a uniform run by role, size, and team quantity.",
      body: "Add garments and share work conditions, size breakdown, colors, branding, quantity, and delivery timing.",
    },
  },
  "hawassa-loom-house": {
    objective: "Create a calm interior-textile showroom with visible material range.",
    template: "Editorial textile composition with coordinated project close.",
    profile: {
      tokenPack: "silk-atelier", motion: "quiet", decoration: "signature",
      header: "header.editorial-wordmark@1", hero: "hero.collection-mosaic@1",
      story: "content.lookbook-chapter@1", highlights: "content.process-steps@1",
      catalog: "catalog.textile-stack@1", cta: "call-to-action.magazine-close@1",
      footer: "footer.editorial@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "editorial_overlap", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Interior weave",
      title: "Textile surfaces developed as a coordinated room language",
      quote: "Pattern, weight, color, and quantity should be considered together.",
    },
    process: {
      title: "Build a coordinated textile run",
      body: "Use, dimensions, weave, color, finish, and repeat quantity define each interior or hospitality request.",
      items: ["Choose use and textile weight", "Coordinate color and pattern", "Confirm dimensions and production run"],
    },
    cta: {
      title: "Gather the textile pieces for one coordinated project inquiry.",
      body: "Add products and share dimensions, color direction, room count, quantity, and target delivery.",
    },
  },
  "dawa-water-solutions": {
    objective: "Explain water storage and treatment as one system decision.",
    template: "System-led technical page with requirement close.",
    profile: {
      tokenPack: "ocean-trade", motion: "quiet", decoration: "clean",
      header: "header.technical-marquee@1", hero: "hero.split-story@1",
      story: "content.origin-story@1", highlights: "content.production-metrics@1",
      catalog: "catalog.collection-led@1", cta: "call-to-action.technical-brief@1",
      footer: "footer.technical-directory@1", ctaVariant: "technical-brief",
      heroMediaIntegration: "split_bleed", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Water system context",
      title: "Storage and treatment planned around source and daily use",
      quote: "A useful package begins with water quality, volume, and site conditions.",
    },
    process: {
      title: "Define source, demand, treatment, and installation",
      body: "Water source, quality concerns, daily demand, storage window, power, and site space guide the system.",
      items: ["Describe source and water quality", "Set daily demand and storage", "Review treatment and installation"],
    },
    cta: {
      title: "Send the source, volume, quality concern, and site requirement.",
      body: "Add a related system and include daily demand, source details, test results if available, power, and installation context.",
    },
  },
  "eastern-safety-gear": {
    objective: "Let team buyers assemble a role-based safety kit quickly.",
    template: "Product-forward utility page with clear team-order path.",
    profile: {
      tokenPack: "vibrant-market", motion: "balanced", decoration: "clean",
      header: "header.compact-utility@1", hero: "hero.product-spotlight@1",
      story: "content.material-focus@1", highlights: "content.process-steps@1",
      catalog: "catalog.feature-tiles@1", cta: "call-to-action.wholesale@1",
      footer: "footer.compact@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "product_stage", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Visible protection",
      title: "Safety essentials organized around people and working conditions",
      quote: "Specify protection by role, not by a random list of products.",
    },
    process: {
      title: "Build the kit from role and risk",
      body: "Work environment, hazards, role, sizing, visibility, and site marking determine the practical set.",
      items: ["List roles and conditions", "Match garments, kits, and signs", "Confirm sizes, marking, and quantity"],
    },
    cta: {
      title: "Create a team safety request by role, size, and site.",
      body: "Add the relevant items and note working conditions, size breakdown, marking, quantities, and delivery location.",
    },
  },
  "gambela-recycled-paper": {
    objective: "Make recovered fiber feel credible for packaging and institutional use.",
    template: "Material-led editorial page with buyer-ready formats.",
    profile: {
      tokenPack: "artisan-clay", motion: "quiet", decoration: "subtle",
      header: "header.editorial-wordmark@1", hero: "hero.material-detail@1",
      story: "content.origin-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.editorial-grid@1", cta: "call-to-action.wholesale@1",
      footer: "footer.editorial@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "edge_fade", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Recovered material",
      title: "Local fiber returned to useful paper and packaging work",
      quote: "The material story matters most when the finished format performs.",
    },
    process: {
      title: "From recovered fiber to repeatable format",
      body: "Fiber character, sheet or molded form, dimensions, finish, print needs, and quantity define the run.",
      items: ["Choose sheet or formed format", "Confirm size, finish, and print", "Prepare sample and production quantity"],
    },
    cta: {
      title: "Request a paper or packaging format with dimensions and quantity.",
      body: "Add the closest product and share size, thickness, finish, print, fit, sample, and production needs.",
    },
  },
  "baro-nursery-supplies": {
    objective: "Organize nursery supplies around a planting cycle and project scale.",
    template: "Growing-cycle provenance with a practical supply shelf.",
    profile: {
      tokenPack: "forest-botanical", motion: "quiet", decoration: "subtle",
      header: "header.producer-badge@1", hero: "hero.provenance@1",
      story: "content.origin-story@1", highlights: "content.process-steps@1",
      catalog: "catalog.horizontal-shelf@1", cta: "call-to-action.wholesale@1",
      footer: "footer.catalog-directory@1", ctaVariant: "magazine-close",
      heroMediaIntegration: "surface_blend", storyMediaIntegration: "natural",
    },
    story: {
      kicker: "Propagation setup",
      title: "Nursery supplies planned around young plants and seasonal work",
      quote: "The useful supply list begins with crop, count, climate, and timing.",
    },
    process: {
      title: "Plan the propagation cycle before ordering materials",
      body: "Plant type, seedling count, tray format, shade need, site conditions, and season define the starter set.",
      items: ["Set crop and seedling count", "Choose propagation and shade format", "Confirm site, season, and quantity"],
    },
    cta: {
      title: "Build a nursery supply request around the next planting cycle.",
      body: "Add relevant supplies and share crop, seedling count, tray size, shade area, site, season, and delivery timing.",
    },
  },
};
