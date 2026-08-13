import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const source = path.join(root, "public/brand/mirtpage-mark-v2.svg");
const output = path.join(root, "public/pwa");
fs.mkdirSync(output, { recursive: true });

for (const size of [32, 180, 192, 512]) {
  const name = size === 32 ? "favicon-32.png" : size === 180 ? "apple-touch-icon.png" : `icon-${size}.png`;
  await sharp(source).resize(size, size).png().toFile(path.join(output, name));
}

const maskableMark = await sharp(source).resize(360, 360).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: "#0B1D3A" } })
  .composite([{ input: maskableMark, gravity: "center" }])
  .png()
  .toFile(path.join(output, "icon-maskable-512.png"));

console.log("Generated MirtPage PWA icons.");
