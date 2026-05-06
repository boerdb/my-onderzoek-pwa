/**
 * Generates PWA icons from the SVG source.
 * Run: node scripts/generate-icons.mjs
 * Requires: npm install -D sharp  (one-time setup)
 */
import { readFileSync, writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const svgPath = join(__dirname, "../public/icons/icon.svg");
const outDir = join(__dirname, "../public/icons");

let sharp;
try {
  const mod = await import("sharp");
  sharp = mod.default;
} catch {
  console.warn("'sharp' not installed. Using fallback placeholder PNG.");
  // Write minimal valid 1x1 transparent PNG as placeholder
  const placeholder = Buffer.from(
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
    "base64"
  );
  writeFileSync(join(outDir, "icon-192.png"), placeholder);
  writeFileSync(join(outDir, "icon-512.png"), placeholder);
  console.log("Wrote placeholder icons. Install 'sharp' and re-run for real icons.");
  process.exit(0);
}

const svg = readFileSync(svgPath);

await sharp(svg).resize(192, 192).png().toFile(join(outDir, "icon-192.png"));
await sharp(svg).resize(512, 512).png().toFile(join(outDir, "icon-512.png"));

console.log("Icons generated: icon-192.png, icon-512.png");
