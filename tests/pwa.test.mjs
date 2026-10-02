import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { MessageChannel } from 'node:worker_threads';

// Exercise the production registration branch without requiring a browser build.
const source = (await fs.readFile(new URL('../js/features/pwa.js', import.meta.url), 'utf8'))
  .replace('Boolean(import.meta.env?.PROD)', 'true');
const { createPwaController } = await import('data:text/javascript;base64,' + Buffer.from(source).toString('base64'));
const globalNames = ['navigator', 'document', 'window', 'fetch', 'MessageChannel'];
const originals = new Map(globalNames.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]));

class NodeStub extends EventTarget {
  hidden = false;
  disabled = false;
  textContent = '';
  attributes = {};
  setAttribute(name, value) { this.attributes[name] = value; }
}

function worker(version) {
  return {
    messages: [],
    postMessage(message, ports) {
      this.messages.push(message.type);
      if (message.type === 'GET_VERSION') ports[0].postMessage({ version });
    }
  };
}

function setup(waiting, controlled = true) {
  const registration = new EventTarget();
  registration.waiting = waiting;
  registration.update = async () => {};
  const serviceWorker = new EventTarget();
  serviceWorker.controller = controlled ? {} : null;
  const registrations = [];
  serviceWorker.register = async (...args) => { registrations.push(args); return registration; };
  const versionNode = new NodeStub();
  const updateButton = new NodeStub();
  updateButton.hidden = true;
  const full = new NodeStub();
  const short = new NodeStub();
  updateButton.querySelector = selector => selector === '[data-update-full]' ? full : short;
  let reloads = 0;
  const window = new EventTarget();
  window.location = { reload() { reloads += 1; } };
  const requests = [];
  const globals = {
    navigator: { serviceWorker },
    document: { readyState: 'complete', baseURI: 'https://example.test/studio/' },
    window,
    MessageChannel,
    fetch: async url => {
      requests.push(String(url));
      return { ok: true, json: async () => ({ version: '0.9.65' }) };
    }
  };
  for (const [name, value] of Object.entries(globals)) {
    Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  }
  const messages = [];
  const controller = createPwaController({ versionNode, updateButton, toast: text => messages.push(text) });
  return { registration, serviceWorker, registrations, versionNode, updateButton, full, short, messages, requests, controller, get reloads() { return reloads; } };
}

async function waitFor(predicate, timeout = 500) {
  for (let attempt = 0; attempt < Math.ceil(timeout / 10); attempt += 1) {
    if (predicate()) return;
    await new Promise(resolve => setTimeout(resolve, 10));
  }
  assert.ok(predicate(), `PWA state should settle within ${timeout}ms`);
}

try {
  {
    // Network metadata describes a different release; the button must name the actual waiting worker.
    const waiting = worker('0.9.66');
    const h = setup(waiting);
    await waitFor(() => !h.updateButton.hidden);
    assert.equal(h.full.textContent, 'Update v0.9.66');
    assert.equal(h.short.textContent, 'Update v0.9.66', 'mobile must retain both the action and version');
    assert.equal(h.updateButton.attributes['aria-label'], 'Update Icon Studio to version 0.9.66');
    assert.equal(h.controller.currentVersion, '0.9.65');
    assert.equal(h.versionNode.hidden, true);
    assert.deepEqual(h.registrations, [['./sw.js', { updateViaCache: 'none' }]]);
    assert.deepEqual(h.requests, ['https://example.test/studio/package.json']);
    assert.deepEqual(waiting.messages, ['GET_VERSION']);
    h.serviceWorker.dispatchEvent(new Event('controllerchange'));
    assert.equal(h.reloads, 0, 'unsolicited controller changes must not reload the page');
    h.updateButton.dispatchEvent(new Event('click'));
    h.updateButton.dispatchEvent(new Event('click'));
    assert.equal(h.updateButton.disabled, true);
    assert.deepEqual(waiting.messages, ['GET_VERSION', 'SKIP_WAITING']);
    h.serviceWorker.dispatchEvent(new Event('controllerchange'));
    h.serviceWorker.dispatchEvent(new Event('controllerchange'));
    assert.equal(h.reloads, 1, 'user-approved activation should reload exactly once');
    h.controller.destroy();
  }
  {
    const h = setup(null, false);
    await waitFor(() => h.controller.currentVersion === '0.9.65');
    const installing = new EventTarget();
    installing.state = 'installed';
    h.registration.installing = installing;
    h.registration.dispatchEvent(new Event('updatefound'));
    installing.dispatchEvent(new Event('statechange'));
    assert.equal(h.updateButton.hidden, true, 'first install is not an update');
    assert.equal(h.versionNode.hidden, false);
    h.serviceWorker.controller = {};
    h.registration.waiting = worker('0.9.66');
    installing.dispatchEvent(new Event('statechange'));
    await waitFor(() => !h.updateButton.hidden);
    assert.equal(h.full.textContent, 'Update v0.9.66');
    h.controller.destroy();
  }
  {
    const h = setup(worker(null));
    await waitFor(() => !h.updateButton.hidden);
    assert.equal(h.full.textContent, 'Update app', 'unknown worker versions must not be guessed from network metadata');
    assert.equal(h.short.textContent, 'Update');
    h.controller.destroy();
  }
  {
    const legacyWorker = { postMessage() {} };
    const h = setup(legacyWorker);
    await waitFor(() => !h.updateButton.hidden, 2000);
    assert.equal(h.full.textContent, 'Update app', 'legacy workers must not leave the update action hidden indefinitely');
    h.controller.destroy();
  }
  {
    const h = setup(worker('0.9.66'));
    globalThis.MessageChannel = undefined;
    await waitFor(() => !h.updateButton.hidden);
    assert.equal(h.full.textContent, 'Update app', 'version messaging should degrade gracefully');
    h.controller.destroy();
  }
} finally {
  for (const [name, descriptor] of originals) {
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else delete globalThis[name];
  }
}
console.log('PWA waiting-version, mobile label, first-install and user-approved update tests passed.');
