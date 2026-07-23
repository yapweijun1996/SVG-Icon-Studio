import assert from 'node:assert/strict';
import { convertSvgText, pixelateSvgText, rasterizeShapes, gridToRects } from '../tools/convert-svg.mjs';

// Square source, single fill colour: scales cleanly to 0 0 24 24, no centering needed,
// and the one colour used becomes currentColor.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><rect x="10" y="10" width="80" height="80" fill="#ff0000"/></svg>';
  const result = convertSvgText(source);
  assert.equal(result.check.ok, true, result.check.errors?.join('; '));
  assert.ok(result.output.includes('viewBox="0 0 24 24"'));
  assert.ok(result.output.includes('fill="currentColor"'));
  assert.ok(!result.output.includes('#ff0000'));
  assert.equal(result.highComplexity, false);
}

// Non-square source: scale must fit the longer side into 24, and the shorter side
// gets centered via translate (not squashed/stretched).
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100"><rect x="0" y="0" width="200" height="100" fill="#000"/></svg>';
  const result = convertSvgText(source);
  assert.equal(result.scale, 24 / 200);
  assert.equal(result.translateX, 0);
  assert.ok(result.translateY > 0, 'shorter dimension should be centered with a positive offset');
}

// width/height fallback when viewBox is missing entirely.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><circle cx="24" cy="24" r="20" fill="#123456"/></svg>';
  const result = convertSvgText(source);
  assert.equal(result.box.width, 48);
  assert.equal(result.box.height, 48);
  assert.equal(result.check.ok, true, result.check.errors?.join('; '));
}

// Multiple distinct fill colours must NOT be collapsed into one currentColor.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><rect width="12" height="24" fill="#ff0000"/><rect x="12" width="12" height="24" fill="#00ff00"/></svg>';
  const result = convertSvgText(source);
  assert.ok(result.output.includes('#ff0000') && result.output.includes('#00ff00'));
  assert.ok(!result.output.includes('currentColor'));
  assert.match(result.colorNote, /2 different fill colours/);
}

// Forbidden elements (script) and disallowed attributes (class, style, onclick) are stripped,
// not just rejected — the tool actively cleans them, then validates the result.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="logo"><script>alert(1)</script><path class="x" style="opacity:.5" onclick="x()" fill="#000" d="M0 0h24v24H0z"/></svg>';
  const result = convertSvgText(source);
  assert.ok(!result.output.includes('script'));
  assert.ok(!result.output.includes('onclick'));
  assert.ok(!result.output.includes('class='));
  assert.ok(!result.output.includes('style='));
  assert.equal(result.check.ok, true, result.check.errors?.join('; '));
}

// A huge auto-traced source (many shapes / long path data) still produces a policy-valid
// result — it is not the tool's job to redesign the artwork — but must be flagged as
// high complexity so nobody mistakes "passes validation" for "looks good at 24x24".
{
  const manyRects = Array.from({ length: 80 }, (_, i) => `<rect x="${i}" y="0" width="1" height="1" fill="#111111"/>`).join('');
  const source = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">${manyRects}</svg>`;
  const result = convertSvgText(source);
  assert.equal(result.highComplexity, true);
  assert.equal(result.check.ok, true, result.check.errors?.join('; '));
}

// No viewBox and no width/height at all: the coordinate system is unknowable, so this
// must throw rather than silently guessing a scale.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg"><path d="M0 0h10v10H0z"/></svg>';
  assert.throws(() => convertSvgText(source), /neither a viewBox nor numeric width\/height/);
}

// --- pixelateSvgText / rasterizeShapes / gridToRects ---

// A rectangle covering exactly the left half of a 10x10 box, rasterized on a 10x10 grid,
// must fill exactly columns 0-4 (coverage 1.0) and leave columns 5-9 empty (coverage 0).
{
  const grid = rasterizeShapes([{ x1: 0, y1: 0, x2: 5, y2: 10 }], { minX: 0, minY: 0, width: 10, height: 10 }, 10);
  for (let row = 0; row < 10; row++) {
    for (let col = 0; col < 10; col++) {
      assert.equal(grid[row * 10 + col], col < 5 ? 1 : 0, `cell (${row},${col})`);
    }
  }
}

// gridToRects merges a filled rectangular block into a single rect, not one per cell.
{
  const gridSize = 6;
  const grid = new Float64Array(gridSize * gridSize);
  for (let row = 1; row < 4; row++) for (let col = 1; col < 4; col++) grid[row * gridSize + col] = 1;
  const rects = gridToRects(grid, gridSize, 0.5);
  assert.equal(rects.length, 1);
  assert.deepEqual(rects[0], { x1: 1, y1: 1, x2: 4, y2: 4 });
}

// pixelateSvgText end-to-end: a single big square on a large canvas collapses to one rect
// at the target grid resolution and always reports a 0 0 24 24 viewBox regardless of gridSize.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><rect x="0" y="0" width="1000" height="1000" fill="#000"/></svg>';
  const result = pixelateSvgText(source, { gridSize: 32 });
  assert.equal(result.check.ok, true, result.check.errors?.join('; '));
  assert.ok(result.output.includes('viewBox="0 0 24 24"'));
  assert.equal(result.outputRectCount, 1);
}

// A source with only curved/unsupported geometry (no rect, no axis-aligned path) has
// nothing this rasterizer can place on the grid, so it must fail loudly rather than
// silently emit an empty icon.
{
  const source = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="#000"/></svg>';
  assert.throws(() => pixelateSvgText(source), /only supports scanline-style traced artwork/);
}

console.log('SVG converter tests passed.');
