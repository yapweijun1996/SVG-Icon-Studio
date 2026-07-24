import { $$ } from '../core/dom.js';
import { STORAGE, getValue, setValue } from '../core/storage.js';

export function createShellController({ state, refs, toast, onViewChange, onBrandPreview }) {
  function updateBackdrop() {
    const active = refs.body.classList.contains('sidebar-open') || refs.body.classList.contains('inspector-open');
    refs.backdrop.hidden = !active;
  }
  function openSidebar() {
    refs.body.classList.add('sidebar-open');
    refs.mobileMenuButton.setAttribute('aria-expanded', 'true');
    updateBackdrop();
  }
  function closeSidebar() {
    refs.body.classList.remove('sidebar-open');
    refs.mobileMenuButton.setAttribute('aria-expanded', 'false');
    updateBackdrop();
  }
  function openInspector() {
    refs.body.classList.remove('inspector-collapsed');
    refs.body.classList.add('inspector-open');
    refs.mobileInspectorButton.setAttribute('aria-expanded', 'true');
    updateBackdrop();
  }
  function closeInspector() {
    if (window.matchMedia('(max-width: 1180px)').matches) {
      refs.body.classList.remove('inspector-open');
      refs.mobileInspectorButton.setAttribute('aria-expanded', 'false');
    } else {
      refs.body.classList.add('inspector-collapsed');
      setValue(STORAGE.inspector, 'true');
    }
    updateBackdrop();
  }
  function setView(view) {
    state.view = view;
    state.visibleLimit = 24;
    state.category = 'All';
    state.query = '';
    refs.searchInput.value = '';
    if (view === 'collections') {
      state.sort = 'category';
      refs.sortFilter.value = 'category';
    }
    if (view === 'brand') onBrandPreview();
    $$('.nav-item').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    onViewChange();
    closeSidebar();
  }

  // Nav labels are display:none while collapsed, which would strip the buttons'
  // accessible names — aria-label keeps them; title gives sighted users a tooltip
  // when only the icon is visible.
  function syncCollapsedState(collapsed) {
    refs.brandToggle.setAttribute('aria-expanded', String(!collapsed));
    refs.brandToggle.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    $$('.nav-item').forEach(button => {
      const label = button.querySelector('span')?.textContent || '';
      if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', label);
      if (collapsed) button.title = label; else button.removeAttribute('title');
    });
  }

  const sidebarCollapsed = getValue(STORAGE.sidebar, 'false') === 'true';
  const inspectorCollapsed = getValue(STORAGE.inspector, 'false') === 'true';
  const pinned = getValue(STORAGE.pinned, 'true') !== 'false';
  refs.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  refs.body.classList.toggle('inspector-collapsed', inspectorCollapsed);
  syncCollapsedState(sidebarCollapsed);
  refs.pinInspectorButton.setAttribute('aria-pressed', String(pinned));
  refs.pinInspectorButton.classList.toggle('is-active', pinned);
  refs.inspectorPinState.textContent = pinned ? 'Pinned' : 'Unpinned';

  refs.brandToggle.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 820px)').matches) return closeSidebar();
    const collapsed = refs.body.classList.toggle('sidebar-collapsed');
    syncCollapsedState(collapsed);
    setValue(STORAGE.sidebar, String(collapsed));
  });
  refs.mobileMenuButton.addEventListener('click', () => refs.body.classList.contains('sidebar-open') ? closeSidebar() : openSidebar());
  refs.mobileInspectorButton.addEventListener('click', () => refs.body.classList.contains('inspector-open') ? closeInspector() : openInspector());
  refs.backdrop.addEventListener('click', () => { closeSidebar(); closeInspector(); });
  $$('.nav-item').forEach(button => button.addEventListener('click', () => setView(button.dataset.view)));

  refs.pinInspectorButton.addEventListener('click', () => {
    const next = refs.pinInspectorButton.getAttribute('aria-pressed') !== 'true';
    refs.pinInspectorButton.setAttribute('aria-pressed', String(next));
    refs.pinInspectorButton.classList.toggle('is-active', next);
    refs.inspectorPinState.textContent = next ? 'Pinned' : 'Unpinned';
    setValue(STORAGE.pinned, String(next));
    toast(next ? 'Inspector pinned' : 'Inspector unpinned');
  });
  refs.collapseInspectorButton.addEventListener('click', () => {
    const collapsed = refs.body.classList.toggle('inspector-collapsed');
    setValue(STORAGE.inspector, String(collapsed));
  });
  refs.closeInspectorButton.addEventListener('click', closeInspector);
  refs.manageBrandButton.addEventListener('click', () => { onBrandPreview(); openInspector(); toast('Brand preview enabled'); });

  document.addEventListener('keydown', event => {
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (event.key === '/' && !['input', 'textarea', 'select'].includes(tag)) {
      event.preventDefault();
      refs.searchInput.focus();
    }
    if (event.key === 'Escape') {
      closeSidebar();
      if (window.matchMedia('(max-width: 1180px)').matches) closeInspector();
      if (refs.previewDialog.open) refs.previewDialog.close();
    }
  });
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 820px)').matches) closeSidebar();
    if (!window.matchMedia('(max-width: 1180px)').matches) {
      refs.body.classList.remove('inspector-open');
      refs.mobileInspectorButton.setAttribute('aria-expanded', 'false');
    }
    updateBackdrop();
  });

  return { openInspector, closeInspector, setView };
}
