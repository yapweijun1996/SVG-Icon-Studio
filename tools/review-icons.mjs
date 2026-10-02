import fs from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { inspectSvgText } from './svg-policy.mjs';

const escapeHtml = value => String(value).replace(/[&<>"']/g, character => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
})[character]);

const GROUPS = [
  ['interface', ['Interface']],
  ['arrows-actions', ['Arrows', 'Actions']],
  ['files-users-commerce', ['Files', 'Users', 'Commerce']],
  ['finance-logistics-ai', ['Finance', 'Logistics', 'AI']],
  ['erp', ['ERP']]
];

const CSS = `
* { box-sizing: border-box; }
body { margin: 20px; background: #e9edf2; font: 13px system-ui, sans-serif; }
h1 { margin: 0 0 12px; font-size: 18px; }
section { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; padding: 20px; margin-bottom: 20px; border-radius: 12px; background: #fff; color: #101828; }
section.dark { background: #151b24; color: #f8fafc; }
article { min-height: 104px; display: grid; place-content: center; text-align: center; }
.shapes { display: flex; align-items: center; justify-content: center; gap: 26px; }
.large { width: 48px; height: 48px; }
.small { width: 24px; height: 24px; }
p { margin: 10px 0 0; }
small { color: #667085; }
.dark small { color: #94a3b8; }
`;

// A local authoring artifact, not a production rendering path. Inline artwork
// comes only from the project's trusted canonical files; uploads are never read.
export async function generateReviewGallery({ root = process.cwd(), outDir = path.join(root, 'dist/icon-review') } = {}) {
  const registry = JSON.parse(await fs.readFile(path.join(root, 'data/icon-registry.json'), 'utf8'));
  const packageJson = JSON.parse(await fs.readFile(path.join(root, 'package.json'), 'utf8'));
  const knownCategories = new Set(GROUPS.flatMap(([, categories]) => categories));
  const groups = [...GROUPS, ['other', registry.categories.map(category => category.id).filter(id => !knownCategories.has(id))]];
  const pages = [];
  await fs.mkdir(outDir, { recursive: true });

  for (const [group, categories] of groups) {
    const icons = registry.icons.filter(icon => categories.includes(icon.category));
    for (let start = 0; start < icons.length; start += 20) {
      const batch = icons.slice(start, start + 20);
      const entries = await Promise.all(batch.map(async icon => {
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(icon.id)) throw new Error(`Invalid canonical ID: ${icon.id}`);
        const source = await fs.readFile(path.join(root, 'icons/catalog', `${icon.id}.svg`), 'utf8');
        const checked = inspectSvgText(source);
        if (!checked.ok) throw new Error(`Invalid canonical SVG ${icon.id}: ${checked.errors.join('; ')}`);
        const label = escapeHtml(icon.id);
        return {
          id: icon.id,
          sha256: createHash('sha256').update(source).digest('hex'),
          card: `<article data-icon-id="${label}"><div class="shapes">${source.replace(/<svg(?=\s)/, '<svg class="large"')}${source.replace(/<svg(?=\s)/, '<svg class="small"')}</div><p>${label}</p><small>${escapeHtml(icon.category)}</small></article>`
        };
      }));
      const filename = `${group}-${Math.floor(start / 20) + 1}.html`;
      const title = `${group} · ${batch[0].id} → ${batch.at(-1).id}`;
      const cards = entries.map(entry => entry.card).join('\n');
      await fs.writeFile(path.join(outDir, filename), `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>${escapeHtml(title)}</title><style>${CSS}</style></head><body><h1>${escapeHtml(title)} · v${escapeHtml(packageJson.version)} · 48px / 24px</h1><section aria-label="Light background">${cards}</section><section class="dark" aria-label="Dark background">${cards}</section></body></html>\n`);
      pages.push({ file: filename, icons: entries.map(({ id, sha256 }) => ({ id, sha256 })) });
    }
  }
  const manifest = { version: packageJson.version, total: registry.icons.length, sizes: [48, 24], backgrounds: ['light', 'dark'], pages };
  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  return manifest;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const args = process.argv.slice(2);
  if (args.length && (args.length !== 2 || args[0] !== '--out')) {
    console.error('Usage: node tools/review-icons.mjs [--out <directory>]');
    process.exitCode = 1;
  } else {
    const manifest = await generateReviewGallery(args.length ? { outDir: path.resolve(args[1]) } : {});
    console.log(JSON.stringify(manifest));
  }
}
