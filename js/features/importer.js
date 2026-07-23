import { sanitizeSvgText } from '../services/svg-sanitizer.js';
import { registerUploadedIcons } from '../services/icon-repository.js';
import { saveUploadedIcon } from '../core/storage.js';
import { slugify } from '../core/dom.js';

function titleCase(value) {
  return String(value).replace(/[-_]+/g, ' ').trim().replace(/\b\w/g, letter => letter.toUpperCase()) || 'Uploaded Icon';
}

function uniqueId(base, icons) {
  const initial = `uploaded-${slugify(base) || 'icon'}`;
  if (!icons.some(icon => icon.id === initial)) return initial;
  let index = 2;
  while (icons.some(icon => icon.id === `${initial}-${index}`)) index += 1;
  return `${initial}-${index}`;
}

export function createImporterController({ state, refs, toast, onImported }) {
  refs.importButton.addEventListener('click', () => refs.svgFileInput.click());
  refs.svgFileInput.addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > 65536) throw new Error('SVG file must be 64 KB or smaller.');
      const checked = sanitizeSvgText(await file.text(), { stripDimensions: true });
      if (!checked.ok) throw new Error(checked.error);
      const sourceName = file.name.replace(/\.svg$/i, '');
      const name = titleCase(sourceName);
      const rootFill = checked.root.getAttribute('fill');
      const rootStroke = checked.root.getAttribute('stroke');
      const style = rootFill && rootFill !== 'none' && rootStroke === 'none' ? 'filled' : 'custom';
      const record = {
        id: uniqueId(sourceName, state.icons), name, category: 'Uploaded', style,
        tags: ['uploaded', 'custom', sourceName.toLowerCase()], aliases: [],
        status: 'active', featured: false, sortOrder: Date.now(), uploaded: true,
        svgText: checked.svgText
      };
      await saveUploadedIcon(record);
      registerUploadedIcons([record]);
      state.icons.push(record);
      toast(`${name} imported safely`);
      onImported(record);
    } catch (error) {
      toast(error.message || 'Unable to import this SVG', { error: true });
    } finally {
      refs.svgFileInput.value = '';
    }
  });
}
