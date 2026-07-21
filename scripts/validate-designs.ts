import fs from "node:fs";
const designFile="components/showroom/designs.tsx";
const source=fs.readFileSync(designFile,"utf8");
const required=["AlHayaDesign","UsaShopDesign","NovaTechDesign","HomeVibeDesign","openCart","addProduct","openProduct"];
const missing=required.filter(token=>!source.includes(token));
if(missing.length){console.error(`Design validation failed. Missing: ${missing.join(", ")}`);process.exit(1)}
const app=fs.readFileSync("components/showroom/ShowroomApp.tsx","utf8");
for(const key of ["alhaya","usashopet","homevibe","novatech"]){if(!app.includes(key)){console.error(`Design registry is missing ${key}`);process.exit(1)}}
console.log("All four custom renderers and smart integration callbacks are registered.");
