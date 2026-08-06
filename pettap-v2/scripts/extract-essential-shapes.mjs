import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const source = "C:/Users/ricar/Desktop/fotos pattag/MODELOS/aaf725e6-4dea-4fa8-aeb0-b81f9d2f9ec5.png";
const outputDirectory = path.resolve("public/images/tag-shapes/essential");
const ids = [
  "circle", "square", "rounded-square", "oval", "teardrop",
  "bone", "heart", "paw", "shield", "star",
  "hexagon", "triangle", "home", "cat", "cloud",
  "diamond", "flower", "bear", "crescent-moon", "lightning-bolt",
];

function dilate(mask, width, height, iterations) {
  let current = mask;
  for (let iteration = 0; iteration < iterations; iteration += 1) {
    const next = current.slice();
    for (let y = 1; y < height - 1; y += 1) for (let x = 1; x < width - 1; x += 1) {
      const index = y * width + x;
      if (current[index]) continue;
      for (let dy = -1; dy <= 1 && !next[index]; dy += 1) for (let dx = -1; dx <= 1; dx += 1) {
        if (current[(y + dy) * width + x + dx]) next[index] = 255;
      }
    }
    current = next;
  }
  return current;
}

await fs.mkdir(outputDirectory, { recursive: true });
const image = sharp(source);
const metadata = await image.metadata();
if (!metadata.width || !metadata.height) throw new Error("The Essential shapes reference image has no dimensions.");

for (let index = 0; index < ids.length; index += 1) {
  const column = index % 5;
  const row = Math.floor(index / 5);
  const left = Math.floor((metadata.width * column) / 5);
  const top = Math.floor((metadata.height * row) / 4);
  const width = Math.floor((metadata.width * (column + 1)) / 5) - left;
  const height = Math.floor((metadata.height * (row + 1)) / 4) - top;
  const extracted = await image.clone().extract({ left, top, width, height }).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const mask = new Uint8Array(width * height);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const offset = pixel * 4;
    const luma = extracted.data[offset] * 0.2126 + extracted.data[offset + 1] * 0.7152 + extracted.data[offset + 2] * 0.0722;
    if (luma < 105) mask[pixel] = 255;
  }
  const alpha = dilate(mask, width, height, 15);
  let minX = width, minY = height, maxX = 0, maxY = 0;
  for (let y = 0; y < height; y += 1) for (let x = 0; x < width; x += 1) {
    if (!alpha[y * width + x]) continue;
    minX = Math.min(minX, x); minY = Math.min(minY, y); maxX = Math.max(maxX, x); maxY = Math.max(maxY, y);
  }
  const rgba = Buffer.alloc(width * height * 4);
  for (let pixel = 0; pixel < mask.length; pixel += 1) {
    const offset = pixel * 4;
    rgba[offset] = extracted.data[offset]; rgba[offset + 1] = extracted.data[offset + 1]; rgba[offset + 2] = extracted.data[offset + 2]; rgba[offset + 3] = alpha[pixel];
  }
  const padding = 6;
  const subjectLeft = Math.max(0, minX - padding), subjectTop = Math.max(0, minY - padding);
  const subjectWidth = Math.min(width - subjectLeft, maxX - minX + padding * 2 + 1);
  const subjectHeight = Math.min(height - subjectTop, maxY - minY + padding * 2 + 1);
  const subject = await sharp(rgba, { raw: { width, height, channels: 4 } }).extract({ left: subjectLeft, top: subjectTop, width: subjectWidth, height: subjectHeight }).png().toBuffer();
  const resized = await sharp(subject).resize(420, 420, { fit: "inside", withoutEnlargement: false }).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).composite([{ input: resized, gravity: "centre" }]).png({ compressionLevel: 9, palette: true }).toFile(path.join(outputDirectory, `${ids[index]}.png`));
}
