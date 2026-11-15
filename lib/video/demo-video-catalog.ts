/** Reviewed first-party examples; each ref is bound to one fictional business. */
export const DEMO_VIDEO_ASSETS: Record<string, {businessId:number;status:"approved"|"preview_only";sha256:string}> = {
  "business-5": {businessId:5,status:"approved",sha256:"1e1d6554adb1595b7bfb99579cb969fcd96e818c6dc53549098235e7dc2602c7"},
  "business-6": {businessId:6,status:"approved",sha256:"9a579e7513fd1eef2a29f80585f5580577cc7a67ecc87f9235c1e3d27a2a0c96"},
  "business-7": {businessId:7,status:"approved",sha256:"e0ccf51681813341c9dd92b552bee7bfd13e698c01fe2b122e75c2d6ed2219c1"},
  "business-15": {businessId:15,status:"approved",sha256:"ff5e8fae6438a6c44753d0f36a201776a0ea62129fc2627fb6374f6b3dd34f51"},
  "business-21": {businessId:21,status:"approved",sha256:"4bc121e0076a67d1864f1ca716f3b7393882b2a14f913ac65e390a00fdad90d4"},
  "business-21-oat": {businessId:21,status:"approved",sha256:"ee4cdf10223826f00c151c675a0b7faa832199a5520e1cd4a10dcb523ba57cae"},
  "business-21-citrus": {businessId:21,status:"approved",sha256:"b4da7cb939868695b5bd7d51e47ccab69d34f56c05e165320521e2e6b8497121"},
  "business-21-coffee": {businessId:21,status:"approved",sha256:"89d3f1a8f601fe4edb6328557c90d2ad5fcf8a776110d6e7a76b9691eaf8562a"},
  "business-21-guest": {businessId:21,status:"approved",sha256:"3f49c1073dbed3d18cccebf62c4717eb655b0953bc0f18d6223568cbc704349c"},
  "business-22": {businessId:22,status:"approved",sha256:"d102360c64cf609f64bfe8f44993c09ddd37bdb46ac9ccc7655352be7dff5a16"},
  "business-27": {businessId:27,status:"approved",sha256:"2391f4b3953dc7a087f07fb7fbe576a5b958df4153ab05a02ea24f12647a614d"},
  "business-28": {businessId:28,status:"approved",sha256:"96eb93f423c016c44b5f116faac851b37d9000700fedec0c3a17251f71e1cf1a"},
  "business-29": {businessId:29,status:"approved",sha256:"52a7165fd461c85ad1d5c2bd086eb357921555e604216a3a54093bf9ebe09df0"},
  "business-30": {businessId:30,status:"approved",sha256:"939d94fc758dbaffba041d05359eeae200e855d921923f841c6399f38243739b"},
  "business-31": {businessId:31,status:"approved",sha256:"dcebcc8b52a23830cceaf39f9d60066fa22ba8191820994f93ce88fba1de3ec8"},
  "business-32": {businessId:32,status:"approved",sha256:"b826ea8791b4f6f5fd04b900520a7bfa650d3f0cf42ae7d4190c51071071da48"},
  "business-33": {businessId:33,status:"approved",sha256:"566e4f3491f8971a4308d312ea86c1494134a457ac277e3525db09278a73dec0"},
  "business-47": {businessId:47,status:"approved",sha256:"ac972f1c352f68193df486838edffa4a29da09fc2bb379408acd314815f7e4e5"},
  "business-60": {businessId:60,status:"approved",sha256:"c1cfe9bda8e00b5a0ae61dd30c085e5abbc5b6e1855fd239542731e9cf46c99a"},
  "business-61": {businessId:61,status:"approved",sha256:"bc045db38b3fb9ae0fd2c6a2976e6b2cfde94c5bd954325103e03574992448ed"},
};

export function approvedDemoVideo(ref: string, businessId: number): boolean {
  if (!/^demo:[a-z0-9](?:[a-z0-9-]{0,30}[a-z0-9])?$/.test(ref)) return false;
  const asset=DEMO_VIDEO_ASSETS[ref.slice(5)];
  return asset?.status==="approved" && asset.businessId===businessId;
}
