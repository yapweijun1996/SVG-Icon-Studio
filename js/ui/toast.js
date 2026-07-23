export function createToastController(region) {
  return function toast(message, { error = false } = {}) {
    const item = document.createElement('div');
    item.className = `toast${error ? ' is-error' : ''}`;
    item.textContent = message;
    region.append(item);
    window.setTimeout(() => item.remove(), 2800);
  };
}

export async function copyText(text, toast, message) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.append(area);
    area.select();
    document.execCommand('copy');
    area.remove();
  }
  toast(message);
}
