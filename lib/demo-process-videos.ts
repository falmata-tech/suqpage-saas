export type DemoProcessVideo = {
  ref: `youtube:${string}` | "";
  label: string;
  family: string;
};

const PROCESS_VIDEOS = {
  apparel: { ref: "youtube:vsO8bQ8e7x4", label: "Garment production process", family: "apparel" },
  art: { ref: "youtube:zDYlSLWAjQs", label: "Studio-art process", family: "art" },
  ceramics: { ref: "youtube:NJMPGgcDylY", label: "Ceramics production process", family: "ceramics" },
  concrete: { ref: "youtube:CPtmpcNJ6ec", label: "Concrete-product manufacturing", family: "concrete" },
  electronics: { ref: "youtube:rRbIS71ZVpU", label: "Electronics assembly process", family: "electronics" },
  farming: { ref: "youtube:a2c1vNB-Bpg", label: "Farm tour", family: "farming" },
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
  unknown: { ref: "", label: "", family: "unknown" },
} as const satisfies Record<string, DemoProcessVideo>;

// Product/category identity is stronger than an incidental noun in its prose.
// Keep these specific: coffee vessels, fruit bags and device pockets do not make
// the product coffee, clothing or electronics respectively.
const identityRules: Array<[RegExp, DemoProcessVideo]> = [
  [/\b(ceramics?|clay|pottery)\b/i, PROCESS_VIDEOS.ceramics],
  [/\b(soap|scrub bars?|cleansing bars?|body oils?)\b/i, PROCESS_VIDEOS.soap],
  [/\b(feed|flour|grain|mill(?:ing)?)\b/i, PROCESS_VIDEOS.grain],
  [/\b(stoves?|cooking equipment|metal(?:works?)?|rebar|weld(?:ing|ed)?|machin(?:e|ery|ing)|fabrication)\b/i, PROCESS_VIDEOS.metal],
  [/\b(farms?|growers?|orchard|nursery|produce|harvest|fresh fruit|mixed fruit|bulk fruit|citrus|fresh greens|fresh herbs)\b/i, PROCESS_VIDEOS.farming],
  [/\b(leather|wallet|satchel)\b/i, PROCESS_VIDEOS.leather],
  [/\b(garments?|workwear|uniforms?|textiles?|weav(?:e|ing)|loom|cloth|fabric|backpacks?|totes?|crossbody|small bags)\b/i, PROCESS_VIDEOS.apparel],
  [/\b(circuit boards?|pcb|charge controllers?|audio amplifiers?|radios?|electronics?)\b/i, PROCESS_VIDEOS.electronics],
  [/\b(coffee beans?|ground coffee|roasted coffee|coffee roasting)\b/i, PROCESS_VIDEOS.coffee],
  [/\b(pasta)\b/i, PROCESS_VIDEOS.pasta],
  [/\b(bottled water|water bottling|water cases?|dispenser jars?)\b/i, PROCESS_VIDEOS.water],
  [/\b(honey|apiary|beeswax)\b/i, PROCESS_VIDEOS.honey],
  [/\b(concrete|pavers?|masonry blocks?|kerbs?|precast)\b/i, PROCESS_VIDEOS.concrete],
  [/\b(paper|packaging)\b/i, PROCESS_VIDEOS.paper],
  [/\b(furniture|timber|joinery|woodwork)\b/i, PROCESS_VIDEOS.furniture],
  [/\b(art(?:ist|work)?|painting|canvas|sculpture|carv(?:e|ed|ing))\b/i, PROCESS_VIDEOS.art],
];
function identityVideo(value: string): DemoProcessVideo | undefined {
  return identityRules.find(([pattern]) => pattern.test(value))?.[1];
}

const rules: Array<[RegExp, DemoProcessVideo]> = [
  [/\b(pasta)\b/i, PROCESS_VIDEOS.pasta],
  [/\b(bottled water|water bottling|water cases?|dispenser jars?|hospitality bottles?)\b/i, PROCESS_VIDEOS.water],
  [/\b(coffee)\b/i, PROCESS_VIDEOS.coffee],
  [/\b(honey|apiary|beeswax)\b/i, PROCESS_VIDEOS.honey],
  [/\b(art(?:ist|work)?|painting|canvas|sculpture|sculpted|carv(?:e|ed|ing)|wall piece|wall panel)\b/i, PROCESS_VIDEOS.art],
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
  const identity = identityVideo(values.slice(0, 2).join(" "));
  const description = values.join(" ");
  return identity || rules.find(([pattern]) => pattern.test(description))?.[1] || PROCESS_VIDEOS.unknown;
}

export function demoOfferingVideoFor(
  businessVideo: DemoProcessVideo,
  ...values: string[]
): DemoProcessVideo {
  const [name = "", category = ""] = values;
  const specificVideo = identityVideo(category) || identityVideo(name);
  if (specificVideo) return specificVideo;
  if (businessVideo.family !== "unknown" && businessVideo.ref) return businessVideo;
  return demoProcessVideoFor(...values);
}

export const DEMO_PROCESS_VIDEOS = Object.freeze(PROCESS_VIDEOS);
