import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import { createHash } from 'node:crypto';
import { generateReviewGallery } from '../tools/review-icons.mjs';

const registry = JSON.parse(await fs.readFile('data/icon-registry.json', 'utf8'));
const artwork = new Map();
for (const icon of registry.icons) {
  const source = await fs.readFile(`icons/catalog/${icon.id}.svg`, 'utf8');
  const rootTag = source.match(/<svg\b[^>]*>/)?.[0];
  assert.ok(rootTag, `Missing root: ${icon.id}`);
  const children = source.slice(source.indexOf(rootTag) + rootTag.length).replace(/<\/svg>\s*$/, '');
  assert.doesNotMatch(children, /\b(?:fill|stroke|stroke-width|stroke-linecap|stroke-linejoin|style)\s*=/i,
    `Child paint must inherit the inspector/export settings: ${icon.id}`);
  const caps = icon.id === 'delivery-truck' ? 'butt' : 'round';
  const joins = icon.id === 'delivery-truck' ? 'miter' : 'round';
  assert.match(rootTag, new RegExp(`stroke-linecap=["']${caps}["']`), `Unexpected caps: ${icon.id}`);
  assert.match(rootTag, new RegExp(`stroke-linejoin=["']${joins}["']`), `Unexpected joins: ${icon.id}`);
  const geometry = children.replace(/\s+/g, '');
  assert.ok(!artwork.has(geometry), `Duplicate artwork: ${icon.id} / ${artwork.get(geometry)}`);
  artwork.set(geometry, icon.id);
}

const temporary = await fs.mkdtemp(path.join(os.tmpdir(), 'icon-authoring-test-'));
try {
  const outDir = path.join(temporary, 'catalogue');
  const manifest = await generateReviewGallery({ outDir });
  assert.equal(manifest.total, registry.icons.length);
  assert.deepEqual(manifest.sizes, [48, 24]);
  assert.deepEqual(manifest.backgrounds, ['light', 'dark']);
  const entries = manifest.pages.flatMap(page => page.icons);
  assert.equal(entries.length, registry.icons.length);
  assert.equal(new Set(entries.map(entry => entry.id)).size, registry.icons.length);
  assert.deepEqual(entries.map(entry => entry.id).sort(), registry.icons.map(icon => icon.id).sort());
  for (const page of manifest.pages) {
    assert.ok(page.icons.length <= 20, 'review pages should remain visually bounded');
    const html = await fs.readFile(path.join(outDir, page.file), 'utf8');
    assert.equal((html.match(/class="large"/g) || []).length, page.icons.length * 2);
    assert.equal((html.match(/class="small"/g) || []).length, page.icons.length * 2);
    for (const entry of page.icons) {
      const source = await fs.readFile(`icons/catalog/${entry.id}.svg`, 'utf8');
      assert.equal(entry.sha256, createHash('sha256').update(source).digest('hex'));
    }
  }

  // Exercise unknown categories, metadata escaping and multiline authoring.
  const fixture = path.join(temporary, 'fixture');
  await fs.mkdir(path.join(fixture, 'data'), { recursive: true });
  await fs.mkdir(path.join(fixture, 'icons/catalog'), { recursive: true });
  const category = 'Future & <Tools>';
  await fs.writeFile(path.join(fixture, 'package.json'), JSON.stringify({ version: 'test-<preview>' }));
  const writeRegistry = id => fs.writeFile(path.join(fixture, 'data/icon-registry.json'), JSON.stringify({
    categories: [{ id: category }], icons: [{ id, category }]
  }));
  const svg = '<svg\n xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 12h18"/></svg>';
  await writeRegistry('example');
  await fs.writeFile(path.join(fixture, 'icons/catalog/example.svg'), svg);
  const fixtureOutput = path.join(temporary, 'fixture-output');
  const result = await generateReviewGallery({ root: fixture, outDir: fixtureOutput });
  assert.equal(result.pages[0].file, 'other-1.html');
  const html = await fs.readFile(path.join(fixtureOutput, result.pages[0].file), 'utf8');
  assert.match(html, /Future &amp; &lt;Tools&gt;/);
  assert.match(html, /test-&lt;preview&gt;/);
  assert.match(html, /<svg class="large"\n/);
  assert.match(html, /<svg class="small"\n/);
  await writeRegistry('../escape');
  await assert.rejects(generateReviewGallery({ root: fixture, outDir: fixtureOutput }), /Invalid canonical ID/);
  await writeRegistry('example');
  await fs.writeFile(path.join(fixture, 'icons/catalog/example.svg'), svg.replace('<path', '<script/> <path'));
  await assert.rejects(generateReviewGallery({ root: fixture, outDir: fixtureOutput }), /Invalid canonical SVG/);
} finally {
  await fs.rm(temporary, { recursive: true, force: true });
}
console.log(`Canonical paint inheritance, artwork uniqueness and review gallery tests passed (${registry.icons.length} icons).`);
