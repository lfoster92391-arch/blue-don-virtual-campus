import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const iconsDir = join(root, "public/icons");

const SOURCE_LOGO = join(iconsDir, "source-logo.png");
const SOURCE_EMBLEM = join(iconsDir, "source-emblem.png");
const FULL_SVG = join(iconsDir, "icon.svg");
const EMBLEM_SVG = join(iconsDir, "icon-emblem.svg");

/** Crop region for emblem from full source-logo.png (percent of image). */
const EMBLEM_CROP = {
  left: 0.12,
  top: 0.06,
  width: 0.76,
  height: 0.52,
};

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.error("sharp is required to generate PWA icons. Run: npm install -D sharp");
  process.exit(1);
}

async function loadInput(path) {
  const input = readFileSync(path);
  const isSvg = path.endsWith(".svg");
  return isSvg ? sharp(input, { density: 300 }) : sharp(input);
}

async function resizeTo(input, size, output) {
  await input.clone().resize(size, size, { fit: "contain", background: "#0A2342" }).png().toFile(output);
  console.log(`Wrote icons/${output.split(/[/\\]/).pop()}`);
}

async function cropEmblemFromFull(fullInput, size) {
  const meta = await fullInput.clone().metadata();
  const imgW = meta.width ?? 512;
  const imgH = meta.height ?? 512;
  const left = Math.round(imgW * EMBLEM_CROP.left);
  const top = Math.round(imgH * EMBLEM_CROP.top);
  const width = Math.round(imgW * EMBLEM_CROP.width);
  const height = Math.round(imgH * EMBLEM_CROP.height);

  return fullInput
    .clone()
    .extract({ left, top, width, height })
    .resize(size, size, { fit: "contain", background: "#0A2342" });
}

async function main() {
  let fullInput;
  let emblemInput;

  if (existsSync(SOURCE_LOGO)) {
    console.log("Using public/icons/source-logo.png");
    fullInput = await loadInput(SOURCE_LOGO);
    emblemInput = existsSync(SOURCE_EMBLEM)
      ? await loadInput(SOURCE_EMBLEM)
      : await cropEmblemFromFull(fullInput, 512);
    if (!existsSync(SOURCE_EMBLEM)) {
      console.log("Cropped emblem from source-logo.png for small icons");
    }
  } else {
    console.log("No source-logo.png found; using SVG artwork");
    console.log("Tip: drop official PNG at public/icons/source-logo.png for an exact match");
    fullInput = await loadInput(FULL_SVG);
    emblemInput = await loadInput(EMBLEM_SVG);
  }

  const sizes = [
    { name: "icon-192.png", size: 192, input: fullInput },
    { name: "icon-512.png", size: 512, input: fullInput },
    { name: "apple-touch-icon.png", size: 180, input: emblemInput },
    { name: "favicon-32.png", size: 32, input: emblemInput },
  ];

  for (const { name, size, input } of sizes) {
    await resizeTo(input, size, join(iconsDir, name));
  }

  const favicon32 = await emblemInput
    .clone()
    .resize(32, 32, { fit: "contain", background: "#0A2342" })
    .png()
    .toBuffer();
  writeFileSync(join(root, "public/favicon.ico"), favicon32);
  console.log("Wrote public/favicon.ico");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
