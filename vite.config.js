import { promises as fs } from 'node:fs';
import path from 'node:path';

const packageJson = JSON.parse(await fs.readFile(new URL('./package.json', import.meta.url), 'utf8'));
const appVersion = packageJson.version;

// data/icon-registry.json and icons/catalog/*.svg are fetched at runtime by URL
// (see js/services/icon-repository.js), not imported by any JS/CSS/HTML, so Vite's
// asset graph never sees them and would otherwise drop them from the production
// build. This plugin copies both folders into dist/ verbatim after the bundle is
// written, so `vite build` output keeps the same file layout the app expects.
function copyRuntimeAssets() {
  return {
    name: 'copy-runtime-assets',
    apply: 'build',
    async closeBundle() {
      const root = process.cwd();
      const outDir = path.join(root, 'dist');
      await fs.cp(path.join(root, 'data'), path.join(outDir, 'data'), { recursive: true });
      await fs.cp(path.join(root, 'icons'), path.join(outDir, 'icons'), { recursive: true });
      await fs.writeFile(path.join(outDir, 'version.json'), JSON.stringify({ version: appVersion }) + '\n');

      const serviceWorkerPath = path.join(outDir, 'sw.js');
      const serviceWorkerSource = await fs.readFile(serviceWorkerPath, 'utf8');
      if (!serviceWorkerSource.includes('__ICON_STUDIO_VERSION__')) {
        throw new Error('Service-worker version placeholder is missing.');
      }
      await fs.writeFile(serviceWorkerPath, serviceWorkerSource.replace('__ICON_STUDIO_VERSION__', appVersion));
    }
  };
}

export default {
  // Relative base so the build works unmodified from a GitHub Pages project page
  // (served under /<repo>/) or any other subpath, with no repo name hardcoded.
  base: './',
  plugins: [copyRuntimeAssets()],
  define: {
    __APP_VERSION__: JSON.stringify(appVersion)
  },
  build: {
    outDir: 'dist'
  }
};
