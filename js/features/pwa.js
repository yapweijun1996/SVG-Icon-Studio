const EMBEDDED_VERSION = typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '';

async function readVersion(url) {
  const response = await fetch(url, { cache: 'no-store', credentials: 'same-origin' });
  if (!response.ok) throw new Error('Version metadata failed to load.');
  const payload = await response.json();
  return typeof payload?.version === 'string' ? payload.version.trim() : '';
}

export async function resolveRunningVersion() {
  if (EMBEDDED_VERSION) return EMBEDDED_VERSION;
  try {
    return await readVersion(new URL('package.json', document.baseURI));
  } catch {
    return '';
  }
}

async function resolveWorkerVersion(worker) {
  if (typeof MessageChannel === 'undefined') return '';
  return new Promise(resolve => {
    const channel = new MessageChannel();
    const finish = version => {
      clearTimeout(timer);
      channel.port1.close();
      channel.port2.close();
      resolve(version);
    };
    // Older deployed workers may not support version messages yet.
    const timer = setTimeout(() => finish(''), 1500);
    channel.port1.onmessage = event => {
      const version = event.data?.version;
      finish(typeof version === 'string' ? version.trim() : '');
    };
    try {
      worker.postMessage({ type: 'GET_VERSION' }, [channel.port2]);
    } catch {
      finish('');
    }
  });
}

export function createPwaController({ versionNode, updateButton, toast = () => {} }) {
  if (!versionNode || !updateButton) return { destroy() {} };

  let waitingWorker = null;
  let reloading = false;
  let currentVersion = '';
  const fullLabel = updateButton.querySelector('[data-update-full]');
  const shortLabel = updateButton.querySelector('[data-update-short]');

  function showRunningVersion(version) {
    currentVersion = version;
    versionNode.textContent = version ? 'v' + version : 'Version';
    versionNode.setAttribute('aria-label', version ? 'App version v' + version : 'App version');
  }

  async function showUpdate(worker) {
    if (!worker) return;
    waitingWorker = worker;
    const target = await resolveWorkerVersion(worker);
    if (waitingWorker !== worker || reloading) return;
    const fullText = target ? 'Update v' + target : 'Update app';
    const shortText = target ? 'Update v' + target : 'Update';
    if (fullLabel) fullLabel.textContent = fullText;
    if (shortLabel) shortLabel.textContent = shortText;
    updateButton.setAttribute('aria-label', target ? 'Update Icon Studio to version ' + target : 'Update Icon Studio');
    versionNode.hidden = true;
    updateButton.hidden = false;
    toast(target ? 'Icon Studio v' + target + ' is ready to update' : 'Icon Studio update is ready');
  }

  function handleControllerChange() {
    if (!reloading) return;
    reloading = false;
    window.location.reload();
  }

  async function registerWorker() {
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' });

      if (registration.waiting && navigator.serviceWorker.controller) {
        await showUpdate(registration.waiting);
      }

      registration.addEventListener('updatefound', () => {
        const installing = registration.installing;
        if (!installing) return;
        installing.addEventListener('statechange', () => {
          if (installing.state === 'installed' && navigator.serviceWorker.controller) {
            void showUpdate(registration.waiting || installing);
          }
        });
      });

      void registration.update().catch(() => {});
    } catch (error) {
      console.warn('[Icon Studio] SW registration failed:', error.message);
    }
  }

  updateButton.addEventListener('click', () => {
    if (!waitingWorker || updateButton.disabled) return;
    reloading = true;
    updateButton.disabled = true;
    if (fullLabel) fullLabel.textContent = 'Updating…';
    if (shortLabel) shortLabel.textContent = '…';
    updateButton.setAttribute('aria-label', 'Updating Icon Studio');
    waitingWorker.postMessage({ type: 'SKIP_WAITING' });
  });

  resolveRunningVersion().then(showRunningVersion);

  const serviceWorkerSupported = typeof navigator !== 'undefined' && 'serviceWorker' in navigator;
  const productionBuild = Boolean(import.meta.env?.PROD);
  if (serviceWorkerSupported) {
    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);
    if (productionBuild) {
      if (document.readyState === 'complete') void registerWorker();
      else window.addEventListener('load', registerWorker, { once: true });
    }
  }

  return {
    destroy() {
      if (serviceWorkerSupported) navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    },
    get currentVersion() { return currentVersion; }
  };
}
