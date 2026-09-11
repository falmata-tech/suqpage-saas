import fs from "node:fs/promises";
import sharp from "sharp";

const mark = await fs.readFile("public/brand/africmade-mark.svg");

async function squareIcon(size, destination, options = {}) {
  const markWidth = Math.round(size * (options.maskable ? 0.54 : 0.62));
  const markHeight = Math.round(markWidth * 80 / 72);
  const rendered = await sharp(mark).resize(markWidth, markHeight, { fit: "contain" }).png().toBuffer();
  await sharp({ create: { width: size, height: size, channels: 4, background: options.background || "#ffffff" } })
    .composite([{ input: rendered, left: Math.round((size - markWidth) / 2), top: Math.round((size - markHeight) / 2) }])
    .png()
    .toFile(destination);
}

await Promise.all([
  squareIcon(32, "public/pwa/favicon-32.png"),
  squareIcon(180, "public/pwa/apple-touch-icon.png"),
  squareIcon(192, "public/pwa/icon-192.png"),
  squareIcon(512, "public/pwa/icon-512.png"),
  squareIcon(512, "public/pwa/icon-maskable-512.png", { maskable: true, background: "#f4f4f2" }),
  squareIcon(512, "public/favicon.png"),
]);
