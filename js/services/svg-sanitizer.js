import {
  REQUIRED_VIEWBOX,
  MAX_SVG_LENGTH,
  ALLOWED_ATTRIBUTES,
  isDisallowedElement,
  isEventAttribute,
  isHrefAttribute,
  isInvalidReference,
} from './svg-policy.js';

export function sanitizeSvgText(raw, { stripDimensions = false } = {}) {
  try {
    if (typeof raw !== 'string' || raw.length === 0) throw new Error('SVG text is empty.');
    if (raw.length > MAX_SVG_LENGTH) throw new Error('SVG exceeds the 64 KB safety limit.');
    const documentNode = new DOMParser().parseFromString(raw, 'image/svg+xml');
    if (documentNode.querySelector('parsererror')) throw new Error('SVG XML is invalid.');
    const root = documentNode.documentElement;
    if (!root || root.tagName.toLowerCase() !== 'svg') throw new Error('SVG root is required.');
    const viewBox = String(root.getAttribute('viewBox') || '').replace(/\s+/g, ' ').trim();
    if (viewBox !== REQUIRED_VIEWBOX) throw new Error('SVG viewBox must be exactly 0 0 24 24.');
    if (stripDimensions) {
      root.removeAttribute('width');
      root.removeAttribute('height');
    } else if (root.hasAttribute('width') || root.hasAttribute('height')) {
      throw new Error('Canonical SVG must not contain fixed width or height.');
    }

    const elements = [root, ...root.querySelectorAll('*')];
    for (const element of elements) {
      const tag = element.tagName.toLowerCase();
      if (isDisallowedElement(tag)) throw new Error(`Forbidden SVG element: ${element.tagName}.`);
      for (const attribute of [...element.attributes]) {
        const name = attribute.name.toLowerCase();
        if (isEventAttribute(name)) throw new Error(`Event attribute is forbidden: ${attribute.name}.`);
        if (isHrefAttribute(name)) throw new Error('SVG references are forbidden.');
        if (!ALLOWED_ATTRIBUTES.has(name)) throw new Error(`Unsupported SVG attribute: ${attribute.name}.`);
        if (name !== 'xmlns' && isInvalidReference(attribute.value)) throw new Error(`External SVG reference is forbidden: ${attribute.name}.`);
      }
    }

    root.setAttribute('viewBox', '0 0 24 24');
    root.setAttribute('aria-hidden', 'true');
    root.removeAttribute('role');
    root.removeAttribute('aria-labelledby');
    root.removeAttribute('focusable');
    const svgText = new XMLSerializer().serializeToString(root);
    return { ok: true, root, svgText };
  } catch (error) {
    return { ok: false, error: error.message || 'SVG validation failed.' };
  }
}

export function cloneSanitizedRoot(sanitizedRoot) {
  return document.importNode(sanitizedRoot, true);
}
