#!/usr/bin/env node
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  ALLOWED_ELEMENTS,
  ALLOWED_ATTRIBUTES,
  FORBIDDEN_ELEMENTS,
} from '../js/services/svg-policy.js';
import { inspectSvgText } from './svg-policy.mjs';

// Converts an arbitrary SVG (any viewBox, any size, cosmetic cruft like
// class/style/id/scripts) into the shape Icon Studio requires: an exact
// 0 0 24 24 viewBox, no fixed width/height, only allow-listed elements and
// attributes. It does this by wrapping the original artwork in a single
// <g transform="translate(...) scale(...)"> — the geometry itself is never
// rewritten, only scaled/centered as a whole — then stripping anything the
// shared policy would reject, then validating the result against that same
// policy so this tool can never silently produce something the app would
// still refuse.
//
// What it CANNOT do: make a complex illustration or an auto-traced raster
// image readable at 24x24. If the source has too many shapes/path data, the
// output will still pass validation but look like a blob. Watch for the
// "complexity" warning below.

export const MAX_SVG_LENGTH = 65536;
export const WARN_SVG_LENGTH = 32768;
export const COMPLEXITY_SHAPE_WARNING = 60;
export const COMPLEXITY_PATHDATA_WARNING = 4000;

class ConvertSvgError extends Error {}

function readNumberList(value) {
  return value.trim().split(/[\s,]+/).map(Number);
}

export function parseRoot(text) {
  const match = text.match(/^\s*<svg\b([^>]*)>([\s\S]*)<\/svg>\s*$/i);
  if (!match) throw new ConvertSvgError('Input is not a single well-formed <svg>...</svg> document.');
  const [, rootAttrs, inner] = match;
  return { rootAttrs, inner };
}

export function resolveSourceBox(rootAttrs) {
  const viewBoxMatch = rootAttrs.match(/\bviewBox\s*=\s*["']([^"']+)["']/i);
  if (viewBoxMatch) {
    const box = readNumberList(viewBoxMatch[1]);
    if (box.length === 4 && box.every(Number.isFinite)) {
      return { minX: box[0], minY: box[1], width: box[2], height: box[3] };
    }
    throw new ConvertSvgError(`Could not parse viewBox="${viewBoxMatch[1]}".`);
  }
  const widthMatch = rootAttrs.match(/\bwidth\s*=\s*["']([\d.]+)/i);
  const heightMatch = rootAttrs.match(/\bheight\s*=\s*["']([\d.]+)/i);
  if (widthMatch && heightMatch) {
    return { minX: 0, minY: 0, width: Number(widthMatch[1]), height: Number(heightMatch[1]) };
  }
  throw new ConvertSvgError('Input has neither a viewBox nor numeric width/height — cannot determine its coordinate system.');
}

export function stripDisallowedTags(inner) {
  let out = inner;
  for (const tag of FORBIDDEN_ELEMENTS) {
    out = out.replace(new RegExp(`<${tag}\\b[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi'), '');
    out = out.replace(new RegExp(`<${tag}\\b[^>]*\\/>`, 'gi'), '');
  }
  return out;
}

function cleanAttributes(attrsText) {
  const kept = [];
  const attributeRegex = /([:\w-]+)\s*=\s*(["'])(.*?)\2/g;
  let match;
  while ((match = attributeRegex.exec(attrsText))) {
    const [, name, quote, value] = match;
    if (ALLOWED_ATTRIBUTES.has(name.toLowerCase())) kept.push(`${name}=${quote}${value}${quote}`);
  }
  return kept.length ? ' ' + kept.join(' ') : '';
}

export function cleanElements(text) {
  return text.replace(/<(\/?)([a-zA-Z][\w:-]*)\b([^>]*?)(\/?)>/g, (whole, closing, tag, attrs, selfClose) => {
    const lower = tag.toLowerCase();
    if (closing) return ALLOWED_ELEMENTS.has(lower) ? `</${lower}>` : '';
    if (!ALLOWED_ELEMENTS.has(lower)) return '';
    return `<${lower}${cleanAttributes(attrs)}${selfClose ? ' /' : ''}>`;
  });
}

export function collectFillColors(text) {
  const colors = new Set();
  const regex = /\bfill\s*=\s*["']([^"']+)["']/gi;
  let match;
  while ((match = regex.exec(text))) {
    const value = match[1].trim().toLowerCase();
    if (value && value !== 'none' && value !== 'currentcolor') colors.add(value);
  }
  return colors;
}

export function replaceSingleFillColor(text, color) {
  const escaped = color.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return text.replace(new RegExp(`\\bfill\\s*=\\s*(["'])${escaped}\\1`, 'gi'), 'fill="currentColor"');
}

export function measureComplexity(inner) {
  const shapeCount = (inner.match(/<(path|rect|circle|ellipse|line|polyline|polygon)\b/gi) || []).length;
  const pathDataLength = [...inner.matchAll(/\b(?:d|points)\s*=\s*["']([^"']*)["']/gi)]
    .reduce((sum, m) => sum + m[1].length, 0);
  return { shapeCount, pathDataLength };
}

function round(value) {
  return Math.round(value * 10000) / 10000;
}

// --- Pixelation: for sources too detailed to survive a plain rescale (raster
// traces, complex illustrations). Reduces the artwork to a small grid instead
// of trying to preserve every original shape. This only understands axis-
// aligned geometry (<rect> and <path> built from M/H/V/L/Z) — which is exactly
// what image-to-SVG tracers emit — not arbitrary curves.

function parseShapesFromSvg(inner) {
  const shapes = [];
  const rectRegex = /<rect\b([^>]*?)\/?>/gi;
  let match;
  while ((match = rectRegex.exec(inner))) {
    const attrs = match[1];
    const num = name => {
      const m = attrs.match(new RegExp(`\\b${name}\\s*=\\s*["']([\\d.eE+-]+)`, 'i'));
      return m ? Number(m[1]) : 0;
    };
    const x = num('x'), y = num('y'), w = num('width'), h = num('height');
    if (w > 0 && h > 0) shapes.push({ x1: x, y1: y, x2: x + w, y2: y + h });
  }
  const pathRegex = /<path\b[^>]*\bd\s*=\s*["']([^"']*)["'][^>]*\/?>/gi;
  while ((match = pathRegex.exec(inner))) shapes.push(...parsePathIntoRects(match[1]));
  return shapes;
}

function parsePathIntoRects(d) {
  const rects = [];
  const subpaths = d.match(/M[^M]*/gi) || [];
  for (const sub of subpaths) {
    const tokens = sub.match(/[MHVLZ][^MHVLZ]*/gi);
    if (!tokens) continue;
    let cx = 0, cy = 0, minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity, any = false;
    for (const token of tokens) {
      const cmd = token[0].toUpperCase();
      const nums = (token.slice(1).match(/-?\d+\.?\d*/g) || []).map(Number);
      if (cmd === 'M') [cx, cy] = nums;
      else if (cmd === 'H') cx = nums[0];
      else if (cmd === 'V') cy = nums[0];
      else if (cmd === 'L') [cx, cy] = nums;
      else continue;
      minX = Math.min(minX, cx); maxX = Math.max(maxX, cx);
      minY = Math.min(minY, cy); maxY = Math.max(maxY, cy);
      any = true;
    }
    if (any && maxX > minX && maxY > minY) rects.push({ x1: minX, y1: minY, x2: maxX, y2: maxY });
  }
  return rects;
}

// Exact geometric coverage per cell (not point-sampling), so this is already
// anti-aliased without needing a separate supersampling pass.
export function rasterizeShapes(shapes, box, gridSize) {
  const grid = new Float64Array(gridSize * gridSize);
  const cellW = box.width / gridSize;
  const cellH = box.height / gridSize;
  for (const shape of shapes) {
    const x1 = shape.x1 - box.minX, x2 = shape.x2 - box.minX;
    const y1 = shape.y1 - box.minY, y2 = shape.y2 - box.minY;
    const colStart = Math.max(0, Math.floor(x1 / cellW));
    const colEnd = Math.min(gridSize - 1, Math.ceil(x2 / cellW) - 1);
    const rowStart = Math.max(0, Math.floor(y1 / cellH));
    const rowEnd = Math.min(gridSize - 1, Math.ceil(y2 / cellH) - 1);
    for (let row = rowStart; row <= rowEnd; row++) {
      for (let col = colStart; col <= colEnd; col++) {
        const overlapX = Math.max(0, Math.min(x2, (col + 1) * cellW) - Math.max(x1, col * cellW));
        const overlapY = Math.max(0, Math.min(y2, (row + 1) * cellH) - Math.max(y1, row * cellH));
        const index = row * gridSize + col;
        grid[index] = Math.min(1, grid[index] + (overlapX * overlapY) / (cellW * cellH));
      }
    }
  }
  return grid;
}

// Threshold the coverage grid, then merge filled cells into as few rectangles
// as possible (horizontal run-length per row, extended vertically across rows
// with an identical run) — the same shape the source tracer itself used, just
// at a resolution small enough to stay a legible icon.
export function gridToRects(grid, gridSize, threshold) {
  const rowRuns = [];
  for (let row = 0; row < gridSize; row++) {
    const runs = [];
    let start = null;
    for (let col = 0; col <= gridSize; col++) {
      const filled = col < gridSize && grid[row * gridSize + col] >= threshold;
      if (filled && start === null) start = col;
      else if (!filled && start !== null) { runs.push([start, col]); start = null; }
    }
    rowRuns.push(runs);
  }
  const finished = [];
  const open = new Map();
  for (let row = 0; row <= gridSize; row++) {
    const runs = row < gridSize ? rowRuns[row] : [];
    const keys = new Set(runs.map(([s, e]) => `${s}-${e}`));
    for (const [key, rect] of [...open]) {
      if (!keys.has(key)) { finished.push(rect); open.delete(key); }
    }
    for (const [s, e] of runs) {
      const key = `${s}-${e}`;
      if (open.has(key)) open.get(key).y2 = row + 1;
      else open.set(key, { x1: s, y1: row, x2: e, y2: row + 1 });
    }
  }
  return finished;
}

// Pixelates an oversized/over-complex source into a small grid instead of a
// plain rescale. Loses fine detail by design — that detail is what made the
// plain rescale unreadable in the first place — but produces a genuinely
// small, genuinely simple icon rather than a technically-valid blob.
export function pixelateSvgText(raw, { gridSize = 24, threshold = 0.35 } = {}) {
  const { rootAttrs, inner } = parseRoot(raw);
  const box = resolveSourceBox(rootAttrs);
  const cleanedInner = cleanElements(stripDisallowedTags(inner));
  const shapes = parseShapesFromSvg(cleanedInner);
  if (!shapes.length) {
    throw new ConvertSvgError('Found no <rect> or axis-aligned M/H/V/L/Z <path> shapes to pixelate — this only supports scanline-style traced artwork, not curves.');
  }
  const grid = rasterizeShapes(shapes, box, gridSize);
  const rects = gridToRects(grid, gridSize, threshold);
  const scale = 24 / gridSize;
  const body = rects
    .map(r => `<rect x="${round(r.x1 * scale)}" y="${round(r.y1 * scale)}" width="${round((r.x2 - r.x1) * scale)}" height="${round((r.y2 - r.y1) * scale)}" fill="currentColor"/>`)
    .join('');
  const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">${body}</svg>\n`;

  const structuralCheck = inspectSvgText(output);
  const byteLength = Buffer.byteLength(output);
  const sizeOk = byteLength <= MAX_SVG_LENGTH;
  const check = { ok: structuralCheck.ok && sizeOk, errors: [...structuralCheck.errors] };
  if (!sizeOk) check.errors.push(`SVG is ${byteLength} bytes, over the ${MAX_SVG_LENGTH} byte hard limit.`);

  return { output, gridSize, threshold, sourceShapeCount: shapes.length, outputRectCount: rects.length, byteLength, check };
}

// Pure conversion: raw SVG text in, a full report + the converted SVG text out.
// No file I/O, no console output — this is what tests exercise directly.
export function convertSvgText(raw) {
  const { rootAttrs, inner } = parseRoot(raw);
  const box = resolveSourceBox(rootAttrs);
  const scale = 24 / Math.max(box.width, box.height);
  const translateX = (24 - box.width * scale) / 2 - box.minX * scale;
  const translateY = (24 - box.height * scale) / 2 - box.minY * scale;

  let cleanedInner = cleanElements(stripDisallowedTags(inner));

  const colors = collectFillColors(cleanedInner);
  let colorNote = 'no explicit fill colors found (already currentColor/none only).';
  if (colors.size === 1) {
    cleanedInner = replaceSingleFillColor(cleanedInner, [...colors][0]);
    colorNote = `replaced the single fill colour (${[...colors][0]}) with currentColor.`;
  } else if (colors.size > 1) {
    colorNote = `found ${colors.size} different fill colours (${[...colors].join(', ')}) — left as-is, ` +
      'since collapsing them to currentColor would merge a multi-colour design into one colour. ' +
      'Recompose it as one colour by hand if you want it themeable.';
  }

  const transform = `translate(${round(translateX)},${round(translateY)}) scale(${round(scale)})`;
  const output = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">\n  <g transform="${transform}">${cleanedInner}</g>\n</svg>\n`;

  const structuralCheck = inspectSvgText(output);
  const byteLength = Buffer.byteLength(output);
  const sizeOk = byteLength <= MAX_SVG_LENGTH;
  const check = { ok: structuralCheck.ok && sizeOk, errors: [...structuralCheck.errors] };
  if (!sizeOk) {
    check.errors.push(`SVG is ${byteLength} bytes, over the ${MAX_SVG_LENGTH} byte hard limit both the browser ` +
      'sanitizer and the build validator enforce (inspectSvgText itself does not check size, so this check adds it).');
  }
  const complexity = measureComplexity(cleanedInner);
  const highComplexity = complexity.shapeCount > COMPLEXITY_SHAPE_WARNING || complexity.pathDataLength > COMPLEXITY_PATHDATA_WARNING;

  return { output, box, scale, translateX, translateY, colorNote, check, byteLength, complexity, highComplexity };
}

async function main() {
  const args = process.argv.slice(2);
  const pixelateFlagIndex = args.findIndex(a => a === '--pixelate' || a.startsWith('--pixelate='));
  let pixelateGridSize = null;
  if (pixelateFlagIndex !== -1) {
    const flag = args[pixelateFlagIndex];
    pixelateGridSize = flag.includes('=') ? Number(flag.split('=')[1]) : 24;
    args.splice(pixelateFlagIndex, 1);
  }
  const [inputArg, outputArg] = args;
  if (!inputArg) {
    console.error('convert-svg: Usage: node tools/convert-svg.mjs <input.svg> [output.svg] [--pixelate[=gridSize]]');
    process.exit(1);
  }
  const raw = await fs.readFile(inputArg, 'utf8').catch(() => {
    console.error(`convert-svg: Cannot read ${inputArg}`);
    process.exit(1);
  });

  if (pixelateGridSize) {
    let result;
    try {
      result = pixelateSvgText(raw, { gridSize: pixelateGridSize });
    } catch (error) {
      console.error(`convert-svg: ${error.message}`);
      process.exit(1);
    }
    console.error(`Pixelated ${result.sourceShapeCount} source shapes on a ${result.gridSize}x${result.gridSize} grid → ${result.outputRectCount} rects.`);
    console.error(`Output size: ${result.byteLength} bytes`);
    console.error(result.check.ok ? 'Policy check: PASSED' : `Policy check: FAILED —\n${result.check.errors.map(e => `  - ${e}`).join('\n')}`);
    if (outputArg) { await fs.writeFile(outputArg, result.output, 'utf8'); console.error(`Written to ${outputArg}`); }
    else console.log(result.output);
    if (!result.check.ok) process.exitCode = 1;
    return;
  }

  let result;
  try {
    result = convertSvgText(raw);
  } catch (error) {
    console.error(`convert-svg: ${error.message}`);
    process.exit(1);
  }
  const { output, box, scale, translateX, translateY, colorNote, check, byteLength, complexity, highComplexity } = result;

  console.error(`Source box: ${box.width}x${box.height} → scale ${round(scale)}, translate(${round(translateX)}, ${round(translateY)})`);
  console.error(`Fill colours: ${colorNote}`);
  console.error(`Output size: ${byteLength} bytes${byteLength > MAX_SVG_LENGTH ? ' — EXCEEDS the 64 KB hard limit' : byteLength > WARN_SVG_LENGTH ? ' — over the 32 KB soft warning threshold' : ''}`);
  console.error(`Shape count: ${complexity.shapeCount}, path/points data: ${complexity.pathDataLength} chars` +
    (highComplexity
      ? ' — HIGH COMPLEXITY: this will likely render as an unrecognisable blob at 24x24 even though it may pass validation below. Consider hand-redrawing a simplified icon instead, or re-run with --pixelate to downsample it into a small grid instead.'
      : ' — reasonable for a 24x24 icon.'));

  if (check.ok) {
    console.error('Policy check: PASSED — this SVG will be accepted by both the built-in catalogue validator and the in-app Import SVG upload.');
  } else {
    console.error('Policy check: FAILED —');
    check.errors.forEach(error => console.error(`  - ${error}`));
  }

  if (outputArg) {
    await fs.writeFile(outputArg, output, 'utf8');
    console.error(`Written to ${outputArg}`);
  } else {
    console.log(output);
  }

  if (!check.ok) process.exitCode = 1;
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (isMain) await main();
