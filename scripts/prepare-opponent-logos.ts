/**
 * Turns Broadcasting's raw opponent art into web-ready marks under
 * `public/images/sports/opponents/`.
 *
 * Lisa's export is one 4608x3456 white slide per school: logo art on top, the
 * school name set as a caption underneath. A 44px directory thumbnail can't
 * render that caption legibly, so we keep only the top content band (the art)
 * and drop the caption rows, then square and downscale the result.
 *
 * Usage (source dir defaults to `.tmp-opponents/raw`):
 *   npx tsx scripts/prepare-opponent-logos.ts <source-dir>
 *   npx tsx scripts/prepare-opponent-logos.ts <source-dir> --keep-caption
 *
 * To unpack a new ZIP from Lisa first:
 *   Expand-Archive -Path "<zip>" -DestinationPath .tmp-opponents/raw -Force
 *
 * Output is committed, so this only needs re-running when the art changes.
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";

import { OPPONENT_SCHOOLS } from "./opponent-schools-data";

const REPO_ROOT = path.resolve(import.meta.dirname, "..");
const OUT_DIR = path.join(REPO_ROOT, "public", "images", "sports", "opponents");
const DEFAULT_SOURCE_DIR = path.join(REPO_ROOT, ".tmp-opponents", "raw");

const OUTPUT_SIZE = 512;
/** Pixels at least this bright count as slide background, not artwork. */
const INK_THRESHOLD = 235;

const args = process.argv.slice(2);
const keepCaption = args.includes("--keep-caption");
const sourceDir = args.find((arg) => !arg.startsWith("--")) ?? DEFAULT_SOURCE_DIR;

/**
 * Row ranges containing artwork, split wherever at least `gapMin` blank rows
 * appear. In this export the caption always lands in a band below the art.
 */
function findContentBands(
  grey: Buffer,
  width: number,
  height: number,
  gapMin: number,
): Array<[number, number]> {
  const bands: Array<[number, number]> = [];
  let start = -1;
  let blank = 0;

  for (let y = 0; y < height; y++) {
    let hasInk = false;
    const base = y * width;
    for (let x = 0; x < width; x++) {
      if (grey[base + x] < INK_THRESHOLD) {
        hasInk = true;
        break;
      }
    }

    if (hasInk) {
      if (start === -1) start = y;
      blank = 0;
      continue;
    }

    if (start !== -1) {
      blank++;
      if (blank >= gapMin) {
        bands.push([start, y - blank]);
        start = -1;
        blank = 0;
      }
    }
  }

  if (start !== -1) bands.push([start, height - 1]);
  return bands;
}

async function buildLogo(source: Buffer): Promise<{ png: Buffer; captionCropped: boolean }> {
  // Drop the slide's outer margin first so band math is relative to content.
  const trimmed = await sharp(source).trim({ threshold: 12 }).toBuffer();

  let artOnly = trimmed;
  let captionCropped = false;

  if (!keepCaption) {
    const { data, info } = await sharp(trimmed)
      .greyscale()
      .raw()
      .toBuffer({ resolveWithObject: true });

    const gapMin = Math.max(6, Math.round(info.height * 0.015));
    const bands = findContentBands(data, info.width, info.height, gapMin);

    // One band means the caption touches the art with no clean gap — leave it
    // rather than guessing a cut line.
    if (bands.length > 1) {
      const [top, bottom] = bands[0];
      artOnly = await sharp(trimmed)
        .extract({ left: 0, top, width: info.width, height: bottom - top + 1 })
        .toBuffer();
      captionCropped = true;
    }
  }

  // Cropping the caption can leave side margins, so re-trim, then letterbox on
  // a white square: every mark then scales identically in directory and overlay.
  const tight = await sharp(artOnly).trim({ threshold: 12 }).toBuffer();
  const inner = Math.round(OUTPUT_SIZE * 0.92);

  const png = await sharp(tight)
    .resize(inner, inner, { fit: "inside" })
    .flatten({ background: "#ffffff" })
    .resize(OUTPUT_SIZE, OUTPUT_SIZE, {
      fit: "contain",
      background: { r: 255, g: 255, b: 255, alpha: 1 },
    })
    .png({ compressionLevel: 9 })
    .toBuffer();

  return { png, captionCropped };
}

async function main() {
  if (!existsSync(sourceDir)) {
    console.error(`[opponent-logos] Source directory not found: ${sourceDir}`);
    console.error("[opponent-logos] Unpack Lisa's ZIP there first, e.g.");
    console.error(
      '[opponent-logos]   Expand-Archive -Path "<zip>" -DestinationPath .tmp-opponents/raw -Force',
    );
    process.exitCode = 1;
    return;
  }

  const available = new Set(readdirSync(sourceDir).filter((f) => f.toLowerCase().endsWith(".png")));
  if (available.size === 0) {
    console.error(`[opponent-logos] No PNGs found in ${sourceDir}`);
    process.exitCode = 1;
    return;
  }

  mkdirSync(OUT_DIR, { recursive: true });

  const missing: string[] = [];
  let written = 0;
  let cropped = 0;

  for (const school of OPPONENT_SCHOOLS) {
    if (!available.has(school.sourceFile)) {
      missing.push(`${school.sourceFile} (${school.name})`);
      continue;
    }

    const source = readFileSync(path.join(sourceDir, school.sourceFile));
    const { png, captionCropped } = await buildLogo(source);
    writeFileSync(path.join(OUT_DIR, `${school.slug}.png`), png);

    written++;
    if (captionCropped) cropped++;
    console.log(
      `[opponent-logos] ${school.sourceFile} -> ${school.slug}.png ` +
        `${String(Math.round(png.length / 1024)).padStart(4)}KB ` +
        `${captionCropped ? "caption-cropped" : "as-is        "} ${school.name}`,
    );
  }

  const unmapped = [...available].filter(
    (file) => !OPPONENT_SCHOOLS.some((school) => school.sourceFile === file),
  );

  console.log(
    `\n[opponent-logos] Wrote ${written} logo(s) (${cropped} caption-cropped) to ` +
      path.relative(REPO_ROOT, OUT_DIR),
  );
  if (missing.length > 0) {
    console.warn(`[opponent-logos] Expected but missing from source: ${missing.join(", ")}`);
  }
  if (unmapped.length > 0) {
    console.warn(
      `[opponent-logos] Present in source but not in the manifest: ${unmapped.join(", ")}`,
    );
  }
}

main().catch((error) => {
  console.error("[opponent-logos] Failed:", error);
  process.exitCode = 1;
});
