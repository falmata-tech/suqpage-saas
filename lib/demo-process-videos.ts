export type DemoProcessVideo = {
  ref: `youtube:${string}`;
  label: string;
  family: string;
};

const PROCESS_VIDEOS = {
  apparel: { ref: "youtube:vsO8bQ8e7x4", label: "Garment production process", family: "apparel" },
  ceramics: { ref: "youtube:NJMPGgcDylY", label: "Ceramics production process", family: "ceramics" },
  concrete: { ref: "youtube:CPtmpcNJ6ec", label: "Concrete-product manufacturing", family: "concrete" },
  electronics: { ref: "youtube:rRbIS71ZVpU", label: "Electronics assembly process", family: "electronics" },
  farming: { ref: "youtube:a2c1vNB-Bpg", label: "Farm production and packing", family: "farming" },
  food: { ref: "youtube:GRll4MBQfAI", label: "Prepared-food production process", family: "food" },
  furniture: { ref: "youtube:pLL4PW4LZT8", label: "Furniture production process", family: "furniture" },
  grain: { ref: "youtube:ftMC5TSJSBg", label: "Grain milling process", family: "grain" },
  honey: { ref: "youtube:gkqKw1n6VQg", label: "Honey production process", family: "honey" },
  leather: { ref: "youtube:bkQ_Rka6Iek", label: "Leather-goods production process", family: "leather" },
  metal: { ref: "youtube:G034cOM2th8", label: "Metal production process", family: "metal" },
  paper: { ref: "youtube:IaFy4gizZXk", label: "Paper and packaging production", family: "paper" },
  pasta: { ref: "youtube:2H4PO4yVIsI", label: "Pasta production process", family: "pasta" },
  soap: { ref: "youtube:WHyh9auBmA0", label: "Soap and personal-care production", family: "soap" },
  coffee: { ref: "youtube:Az0W61hotLM", label: "Coffee processing", family: "coffee" },
  water: { ref: "youtube:_ZybbjLgOuQ", label: "Bottled-water production", family: "water" },
  unknown: { ref: "youtube:G034cOM2th8", label: "Production process", family: "unknown" },
} as const satisfies Record<string, DemoProcessVideo>;

const rules: Array<[RegExp, DemoProcessVideo]> = [
  [/\b(pasta)\b/i, PROCESS_VIDEOS.pasta],
  [/\b(bottled water|water cases?|dispenser jars?|hospitality bottles?)\b/i, PROCESS_VIDEOS.water],
  [/\b(coffee)\b/i, PROCESS_VIDEOS.coffee],
  [/\b(honey|apiary|beeswax)\b/i, PROCESS_VIDEOS.honey],
  [/\b(concrete|pavers?|masonry blocks?|kerbs?|precast)\b/i, PROCESS_VIDEOS.concrete],
  [/\b(leather|wallet|satchel)\b/i, PROCESS_VIDEOS.leather],
  [/\b(flour|grain|mill|spice)\b/i, PROCESS_VIDEOS.grain],
  [/\b(soap|hygiene|botanics?|botanicals?|herbal|aloe|body care|hair care|skin care|natural oils?|balms?|diapers?|sanitary pads?|underpads?)\b/i, PROCESS_VIDEOS.soap],
  [/\b(ceramics?|clay|pottery)\b/i, PROCESS_VIDEOS.ceramics],
  [/\b(paper|packaging)\b/i, PROCESS_VIDEOS.paper],
  [/\b(injera|prepared foods?|food kitchen|lunch|lentil|stew)\b/i, PROCESS_VIDEOS.food],
  [/\b(electric(?:al)?|electronics?|circuit|device|solar|radio|cable|sensor|meter|lighting|appliance|control panels?|harnesses?)\b/i, PROCESS_VIDEOS.electronics],
  [/\b(metal(?:works?)?|rebar|weld(?:ing|ed)?|machin(?:e|ery|ing)|fabrication|equipment|tools?|building products?)\b/i, PROCESS_VIDEOS.metal],
  [/\b(garments?|workwear|uniforms?|textiles?|weav(?:e|ing)|loom|cloth|fabric|bags?)\b/i, PROCESS_VIDEOS.apparel],
  [/\b(furniture|timber|joinery|wood|basket)\b/i, PROCESS_VIDEOS.furniture],
  [/\b(farm|growers?|seed|orchard|nursery|produce|harvest|greens?|herbs?|fruit)\b/i, PROCESS_VIDEOS.farming],
];

export function demoProcessVideoFor(...values: string[]): DemoProcessVideo {
  const description = values.join(" ");
  return rules.find(([pattern]) => pattern.test(description))?.[1] || PROCESS_VIDEOS.unknown;
}

export function demoOfferingVideoFor(
  businessVideo: DemoProcessVideo,
  ...values: string[]
): DemoProcessVideo {
  const specificVideo = demoProcessVideoFor(...values);
  return specificVideo.family === "unknown" ? businessVideo : specificVideo;
}

export const DEMO_PROCESS_VIDEOS = Object.freeze(PROCESS_VIDEOS);
