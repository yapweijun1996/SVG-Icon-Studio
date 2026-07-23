import fs from 'node:fs/promises';
import path from 'node:path';
import { inspectSvgText } from './svg-policy.mjs';

const root = process.cwd();
const registry = JSON.parse(await fs.readFile(path.join(root, 'data/icon-registry.json'), 'utf8'));
const directory = path.join(root, 'icons/catalog');
const files = (await fs.readdir(directory)).filter(file => file.endsWith('.svg')).sort();
const errors = [];
const warnings = [];
if (registry.schemaVersion !== 1) errors.push('Unsupported registry schemaVersion.');
if (!Array.isArray(registry.categories) || !Array.isArray(registry.icons)) errors.push('Registry categories/icons must be arrays.');
const categoryIds = new Set((registry.categories || []).map(category => category.id));
const ids = new Set();
for (const icon of registry.icons || []) {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.id)) errors.push(`Invalid icon ID: ${icon.id}`);
  if (ids.has(icon.id)) errors.push(`Duplicate icon ID: ${icon.id}`);
  ids.add(icon.id);
  if (!categoryIds.has(icon.category)) errors.push(`Unknown category for ${icon.id}: ${icon.category}`);
  if (!['outline', 'filled'].includes(icon.style)) errors.push(`Invalid style for ${icon.id}: ${icon.style}`);
  if (!Array.isArray(icon.tags) || !Array.isArray(icon.aliases)) errors.push(`Invalid tags/aliases for ${icon.id}`);
  for (const key of ['body', 'svg', 'markup', 'pathData']) if (Object.hasOwn(icon, key)) errors.push(`Geometry found in registry: ${icon.id}`);
  const assetPath = path.join(directory, `${icon.id}.svg`);
  try {
    const stat = await fs.stat(assetPath);
    if (stat.size > 65536) errors.push(`SVG exceeds 64 KB: ${icon.id}`);
    else if (stat.size > 32768) warnings.push(`SVG exceeds 32 KB: ${icon.id}`);
    const text = await fs.readFile(assetPath, 'utf8');
    const checked = inspectSvgText(text);
    if (!checked.ok) errors.push(...checked.errors.map(error => `${icon.id}: ${error}`));
    if (!/currentColor/i.test(text)) errors.push(`${icon.id}: currentColor is required.`);
    if (icon.style === 'filled' && !/stroke\s*=\s*["']none["']/i.test(text)) errors.push(`${icon.id}: filled icon must use stroke="none".`);
    if (icon.style === 'outline' && !/stroke\s*=\s*["']currentColor["']/i.test(text)) errors.push(`${icon.id}: outline icon must use currentColor stroke.`);
  } catch { errors.push(`Missing SVG file: ${icon.id}`); }
}
for (const file of files) {
  const id = file.replace(/\.svg$/, '');
  if (!ids.has(id)) errors.push(`Orphan SVG file: ${file}`);
}
if (files.length !== (registry.icons || []).length) errors.push(`Registry/file count mismatch: ${registry.icons.length}/${files.length}`);
warnings.forEach(warning => console.warn(`Warning: ${warning}`));
if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`Validated ${registry.icons.length} SSOT SVG icons with zero errors.`);
