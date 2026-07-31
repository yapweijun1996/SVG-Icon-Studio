// Authoring-time generator for the FILLED glyph style used by
// icons/catalog/purchase-order.svg: every "stroke" is really a filled shape
// of a constant weight, and hollow shapes are evenodd subpath pairs.
// Output is plain static SVG committed to the repo -- nothing runs at runtime.
import fs from 'node:fs/promises';
import path from 'node:path';

const T = 0.73; // measured off purchase-order.svg (6.75-6.023 and 11.742-11.016)
const n = v => {
  const r = Math.round(v * 1000) / 1000;
  return String(r);
};

// --- primitives ---------------------------------------------------------

// One rounded-rect subpath. Direction is irrelevant: evenodd ignores winding.
function roundRectSub(x, y, w, h, r) {
  r = Math.max(0, Math.min(r, w / 2, h / 2));
  if (r === 0) return `M${n(x)} ${n(y)}H${n(x + w)}V${n(y + h)}H${n(x)}Z`;
  return `M${n(x + r)} ${n(y)}` +
    `H${n(x + w - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w)} ${n(y + r)}` +
    `V${n(y + h - r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + w - r)} ${n(y + h)}` +
    `H${n(x + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y + h - r)}` +
    `V${n(y + r)}A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`;
}

// Hollow rounded-rect frame of thickness t.
const frame = (x, y, w, h, r, t = T) =>
  roundRectSub(x, y, w, h, r) + roundRectSub(x + t, y + t, w - 2 * t, h - 2 * t, r - t);

// Solid rounded bar (pill) -- used for text lines and arrow shafts.
const bar = (x, y, w, h = T) => roundRectSub(x, y, w, h, Math.min(w, h) / 2);

const solid = (x, y, w, h, r = 0) => roundRectSub(x, y, w, h, r);

function circleSub(cx, cy, r) {
  return `M${n(cx - r)} ${n(cy)}` +
    `A${n(r)} ${n(r)} 0 1 0 ${n(cx + r)} ${n(cy)}` +
    `A${n(r)} ${n(r)} 0 1 0 ${n(cx - r)} ${n(cy)}Z`;
}
const ring = (cx, cy, r, t = T) => circleSub(cx, cy, r) + circleSub(cx, cy, r - t);
const disc = circleSub;

// Document frame with a dog-eared top-right corner, thickness t.
// Outer contour cuts the corner on a diagonal; the flap is then drawn as a
// solid triangle sharing that diagonal, so the frame band underneath it
// cancels (evenodd) and the corner reads as one filled wedge -- which is what
// purchase-order.svg does (its flap subpath is solid, not hollow).
function docFrame(x, y, w, h, fold, r = 1.1, t = T) {
  const x2 = x + w, y2 = y + h, fx = x2 - fold, fy = y + fold;
  const ri = Math.max(0, r - t);
  // The inner contour's diagonal is offset from the outer one by t along the
  // normal, i.e. t*sqrt(2) along each axis, keeping the diagonal band width t.
  const k = t * Math.SQRT2;
  const outer =
    `M${n(x + r)} ${n(y)}H${n(fx)}L${n(x2)} ${n(fy)}V${n(y2 - r)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x2 - r)} ${n(y2)}H${n(x + r)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x)} ${n(y2 - r)}V${n(y + r)}` +
    `A${n(r)} ${n(r)} 0 0 1 ${n(x + r)} ${n(y)}Z`;
  const inner =
    `M${n(x + t + ri)} ${n(y + t)}H${n(fx - k + t)}L${n(x2 - t)} ${n(fy + k - t)}` +
    `V${n(y2 - t - ri)}A${n(ri)} ${n(ri)} 0 0 1 ${n(x2 - t - ri)} ${n(y2 - t)}` +
    `H${n(x + t + ri)}A${n(ri)} ${n(ri)} 0 0 1 ${n(x + t)} ${n(y2 - t - ri)}` +
    `V${n(y + t + ri)}A${n(ri)} ${n(ri)} 0 0 1 ${n(x + t + ri)} ${n(y + t)}Z`;
  const flap = `M${n(fx)} ${n(y)}L${n(x2)} ${n(fy)}H${n(fx)}Z`;
  return outer + inner + flap;
}

// --- icon definitions ---------------------------------------------------

// Two document geometries. A single evenodd path cannot mask one shape behind
// another -- overlapping regions cancel instead -- so a badged document is
// narrowed to stop just short of the badge rather than run under it. Badge-less
// icons must NOT reuse that narrowed box or they end up sitting well left of
// centre, so they get their own wider, centred one.
const DOC = { x: 3.6, y: 3.42, w: 11, h: 15.6, fold: 4 };
const WIDE = { x: 5.7, y: 3.1, w: 12.6, h: 17.8, fold: 4.4 };
const d = DOC;
const line = (yy, w) => bar(d.x + 1.6, yy, w);
const wideLine = (yy, w) => bar(WIDE.x + 1.6, yy, w);

// Badge: a SOLID disc at the bottom-right with the glyph knocked out of it by
// evenodd -- the construction purchase-order.svg uses (subpath 2 is a plain
// disc, subpath 3 is the tick). A ring would alternate fill against the glyph
// and render as a blob, so do not nest circles here.
const BADGE = { cx: 17.67, cy: 17.82, r: 2.75 };
const b = BADGE;
const badge = glyph => disc(b.cx, b.cy, b.r) + glyph;

const plusGlyph =
  bar(b.cx - 1.45, b.cy - T / 2, 2.9) +
  bar(b.cx - T / 2, b.cy - 1.45, T, 2.9);

const arrowUpGlyph =
  bar(b.cx - T / 2, b.cy - 0.35, T, 1.85) +
  `M${n(b.cx)} ${n(b.cy - 1.62)}L${n(b.cx + 1.32)} ${n(b.cy - 0.3)}` +
  `L${n(b.cx + 0.55)} ${n(b.cy - 0.3)}L${n(b.cx - 0.55)} ${n(b.cy - 0.3)}` +
  `L${n(b.cx - 1.32)} ${n(b.cy - 0.3)}Z`;

const ICONS = {
  'purchase-requisition': [
    docFrame(d.x, d.y, d.w, d.h, d.fold),
    line(8.3, 3.4), line(10.8, 7.4), line(13.3, 7.4),
    badge(plusGlyph)
  ],
  'debit-note': [
    docFrame(d.x, d.y, d.w, d.h, d.fold),
    line(8.3, 3.4), line(10.8, 7.4), line(13.3, 7.4),
    badge(arrowUpGlyph)
  ],
  'packing-list': [
    docFrame(WIDE.x, WIDE.y, WIDE.w, WIDE.h, WIDE.fold),
    wideLine(8.6, 4),
    // carton: frame + lid seam + tape
    frame(7.3, 11.4, 9.4, 7.2, 0.9),
    bar(7.3, 13.75, 9.4),
    bar(11.635, 11.4, T, 2.35)
  ],
  'pick-list': [
    docFrame(WIDE.x, WIDE.y, WIDE.w, WIDE.h, WIDE.fold),
    // Three checkbox rows, the first one ticked. A tick glyph inside a box this
    // small at this weight has no room and collides with the box wall, so the
    // checked state is a solid box instead.
    solid(6.9, 8, 2.8, 2.8, 0.65), bar(10.8, 9.035, 5.4),
    frame(6.9, 12, 2.8, 2.8, 0.65), bar(10.8, 13.035, 5.4),
    frame(6.9, 16, 2.8, 2.8, 0.65), bar(10.8, 17.035, 5.4)
  ],
  'journal-entry': [
    docFrame(WIDE.x, WIDE.y, WIDE.w, WIDE.h, WIDE.fold),
    wideLine(8.6, 4),
    // two-column ledger grid
    frame(7, 11.2, 10, 7.6, 0.8),
    bar(7, 13.4, 10),
    bar(11.635, 11.2, T, 7.6)
  ],
  dashboard: [
    frame(3.1, 4.2, 17.8, 15.6, 1.6),
    bar(3.1, 8.1, 17.8),
    // three bars rising inside the panel
    solid(6.6, 13.8, 1.9, 3.1, 0.5),
    solid(11.05, 11.4, 1.9, 5.5, 0.5),
    solid(15.5, 12.7, 1.9, 4.2, 0.5)
  ]
};

const HEAD = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none" aria-hidden="true">';
const outDir = process.argv[2];
for (const [id, parts] of Object.entries(ICONS)) {
  const svg = `${HEAD}\n  <path fill="currentColor" stroke="none" fill-rule="evenodd" d="${parts.join('')}"/>\n</svg>\n`;
  await fs.writeFile(path.join(outDir, `${id}.svg`), svg, 'utf8');
  console.log(`${id}.svg  ${svg.length} bytes`);
}
