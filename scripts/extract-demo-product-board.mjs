import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [source, handle] = process.argv.slice(2);
if (!source || !handle || !/^demo-[a-z0-9-]+$/.test(handle)) {
  throw new Error("Usage: node scripts/extract-demo-product-board.mjs <source.png> <demo-handle>");
}
const metadata = await sharp(source).metadata();
if (!metadata.width || !metadata.height || metadata.width < 1000 || metadata.height < 700) {
  throw new Error(`${handle} product board is too small to extract safely.`);
}
const cellWidth = Math.floor(metadata.width / 2);
const cellHeight = Math.floor(metadata.height / 2);
const outputDir = path.join(process.cwd(), "public", "uploads", "seed", "portfolio", handle);
fs.mkdirSync(outputDir, { recursive: true });
for (let index = 0; index < 4; index += 1) {
  const left = index % 2 === 0 ? 0 : metadata.width - cellWidth;
  const top = index < 2 ? 0 : metadata.height - cellHeight;
  await sharp(source)
    .extract({ left, top, width: cellWidth, height: cellHeight })
    .webp({ quality: 84, effort: 5 })
    .toFile(path.join(outputDir, `product-${index + 1}.webp`));
}
console.log(`Extracted four generated product images for ${handle}.`);
