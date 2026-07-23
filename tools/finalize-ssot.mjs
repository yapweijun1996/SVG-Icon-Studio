import fs from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const required = [
  'index.html', 'data/icon-registry.json', 'js/app.js', 'css/tokens.css',
  'icons/catalog/purchase-order.svg', 'icons/catalog/delivery-order.svg'
];
for (const relative of required) await fs.access(path.join(root, relative));
const registry = JSON.parse(await fs.readFile(path.join(root, 'data/icon-registry.json'), 'utf8'));
if (!Array.isArray(registry.icons) || registry.icons.length < 39) throw new Error('Refusing cleanup: SSOT catalogue is incomplete.');

const removeTargets = [
  'icon-library.js', 'script.js', 'styles.css',
  'tools/extract-icons.mjs', 'tools/split-css.mjs', 'modernized'
];
for (const relative of removeTargets) {
  await fs.rm(path.join(root, relative), { recursive: true, force: true });
}
console.log(`Legacy production sources removed after verifying ${registry.icons.length} canonical SVG icons.`);
