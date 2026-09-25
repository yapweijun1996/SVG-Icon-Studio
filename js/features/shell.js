import { $$ } from '../core/dom.js';
import { STORAGE, getValue, setValue } from '../core/storage.js';

export function createShellController({ state, refs, toast, onViewChange, onBrandPreview }) {
  const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]';
  let restoreFocusTarget = null;
  let lastNonCollectionSort = state.sort;

  function activeDrawer() {
    if (refs.body.classList.contains('inspector-open')) return refs.inspector;
    if (refs.body.classList.contains('sidebar-open')) return refs.sidebar;
    return null;
  }

  function getDrawerTabbables(drawer) {
    return [...(drawer?.querySelectorAll(focusableSelector) || [])].filter(element =>
      element.getClientRects().length > 0 &&
      getComputedStyle(element).visibility !== 'hidden' &&
      element.tabIndex >= 0
    );
  }

  function focusDrawer(drawer) {
    const firstFocusable = getDrawerTabbables(drawer)[0];
    if (firstFocusable) firstFocusable.focus();
  }

  function openDrawer(drawer, trigger) {
    restoreFocusTarget = trigger;
    focusDrawer(drawer);
  }

  function restoreDrawerFocus() {
    const target = restoreFocusTarget;
    restoreFocusTarget = null;
    target?.focus();
  }

  function updateBackdrop() {
    const active = refs.body.classList.contains('sidebar-open') || refs.body.classList.contains('inspector-open');
    refs.backdrop.hidden = !active;
    syncInertState();
  }

  function syncInspectorCollapsedState(collapsed) {
    const actionLabel = collapsed ? 'Expand inspector' : 'Collapse inspector';
    refs.collapseInspectorButton.setAttribute('aria-label', actionLabel);
    refs.collapseInspectorButton.title = actionLabel;
  }

  function syncInertState() {
    const inspectorDrawerOpen = window.matchMedia('(max-width: 1180px)').matches && refs.body.classList.contains('inspector-open');
    const sidebarDrawerOpen = !inspectorDrawerOpen && window.matchMedia('(max-width: 820px)').matches && refs.body.classList.contains('sidebar-open');
    const drawerOpen = sidebarDrawerOpen || inspectorDrawerOpen;
    refs.workspace.inert = drawerOpen;
    refs.sidebar.inert = inspectorDrawerOpen;
    refs.inspector.inert = sidebarDrawerOpen;
  }
  function syncMobileMenuState(open) {
    refs.mobileMenuButton.setAttribute('aria-expanded', String(open));
    refs.mobileMenuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  }
  function syncMobileInspectorState(open) {
    refs.mobileInspectorButton.setAttribute('aria-expanded', String(open));
    refs.mobileInspectorButton.setAttribute('aria-label', open ? 'Close icon inspector' : 'Open icon inspector');
  }
  function openSidebar() {
    refs.body.classList.add('sidebar-open');
    syncMobileMenuState(true);
    updateBackdrop();
    openDrawer(refs.sidebar, refs.mobileMenuButton);
  }
  function closeSidebar() {
    const wasOpen = refs.body.classList.contains('sidebar-open');
    refs.body.classList.remove('sidebar-open');
    syncMobileMenuState(false);
    updateBackdrop();
    if (wasOpen && !refs.body.classList.contains('inspector-open')) restoreDrawerFocus();
  }
  function openInspector(trigger = refs.mobileInspectorButton) {
    refs.body.classList.remove('inspector-collapsed');
    syncInspectorCollapsedState(false);
    // inspector-open (and the dimming backdrop it triggers) is the mobile
    // slide-in drawer -- on desktop the inspector is already docked, so
    // adding it there just shows a backdrop with no panel motion behind it.
    // Mirrors the same viewport branch closeInspector() already uses.
    if (window.matchMedia('(max-width: 1180px)').matches) {
      refs.body.classList.remove('sidebar-open');
      syncMobileMenuState(false);
      refs.body.classList.add('inspector-open');
      syncMobileInspectorState(true);
      updateBackdrop();
      openDrawer(refs.inspector, trigger || refs.mobileInspectorButton);
      return;
    }
    updateBackdrop();
  }
  function closeInspector() {
    const drawerMode = window.matchMedia('(max-width: 1180px)').matches;
    const wasOpen = drawerMode && refs.body.classList.contains('inspector-open');
    if (drawerMode) {
      refs.body.classList.remove('inspector-open');
      syncMobileInspectorState(false);
    } else {
      refs.body.classList.add('inspector-collapsed');
      syncInspectorCollapsedState(true);
      setValue(STORAGE.inspector, 'true');
    }
    updateBackdrop();
    if (wasOpen && !refs.body.classList.contains('sidebar-open')) restoreDrawerFocus();
  }
  function setView(view) {
    const previousView = state.view;
    if (view === 'collections') {
      if (previousView !== 'collections') lastNonCollectionSort = state.sort;
      state.sort = 'category';
    } else if (previousView === 'collections') {
      state.sort = lastNonCollectionSort;
    }
    state.view = view;
    state.visibleLimit = 24;
    state.category = 'All';
    state.query = '';
    refs.searchInput.value = '';
    refs.sortFilter.value = state.sort;
    if (view === 'brand') onBrandPreview();
    $$('.nav-item').forEach(button => {
      const active = button.dataset.view === view;
      button.classList.toggle('is-active', active);
      if (active) button.setAttribute('aria-current', 'page'); else button.removeAttribute('aria-current');
    });
    onViewChange();
    closeSidebar();
    if (view !== previousView) refs.pageTitle.focus();
  }

  // Nav labels are display:none while collapsed, which would strip the buttons'
  // accessible names — aria-label keeps them; title gives sighted users a tooltip
  // when only the icon is visible.
  function syncCollapsedState(collapsed) {
    const actionLabel = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    refs.brandToggle.setAttribute('aria-expanded', String(!collapsed));
    refs.brandToggle.setAttribute('aria-label', actionLabel);
    refs.brandToggle.title = actionLabel;
    $$('.nav-item').forEach(button => {
      const label = button.querySelector('span')?.textContent || '';
      if (!button.hasAttribute('aria-label')) button.setAttribute('aria-label', label);
      if (collapsed) button.title = label; else button.removeAttribute('title');
    });
  }

  const sidebarCollapsed = getValue(STORAGE.sidebar, 'false') === 'true';
  const inspectorCollapsed = getValue(STORAGE.inspector, 'false') === 'true';
  refs.body.classList.toggle('sidebar-collapsed', sidebarCollapsed);
  refs.body.classList.toggle('inspector-collapsed', inspectorCollapsed);
  syncCollapsedState(sidebarCollapsed);
  syncInspectorCollapsedState(inspectorCollapsed);

  refs.brandToggle.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 820px)').matches) return closeSidebar();
    const collapsed = refs.body.classList.toggle('sidebar-collapsed');
    syncCollapsedState(collapsed);
    setValue(STORAGE.sidebar, String(collapsed));
  });
  refs.mobileMenuButton.addEventListener('click', () => refs.body.classList.contains('sidebar-open') ? closeSidebar() : openSidebar());
  refs.mobileInspectorButton.addEventListener('click', () => refs.body.classList.contains('inspector-open') ? closeInspector() : openInspector());
  refs.backdrop.addEventListener('click', () => { closeSidebar(); closeInspector(); });
  $$('.nav-item').forEach(button => button.addEventListener('click', () => {
    // Re-activating the current navigation destination must not behave like a
    // hidden reset action. Preserve the current catalogue state; on mobile the
    // only effect is closing the navigation drawer and restoring its trigger.
    if (button.dataset.view === state.view) return closeSidebar();
    setView(button.dataset.view);
  }));

  refs.collapseInspectorButton.addEventListener('click', () => {
    const collapsed = refs.body.classList.toggle('inspector-collapsed');
    syncInspectorCollapsedState(collapsed);
    setValue(STORAGE.inspector, String(collapsed));
  });
  refs.closeInspectorButton.addEventListener('click', closeInspector);
  refs.manageBrandButton.addEventListener('click', () => { onBrandPreview(); openInspector(); toast('Brand preview enabled'); });

  document.addEventListener('keydown', event => {
    const drawer = activeDrawer();
    if (drawer && event.key === 'Tab') {
      const focusable = getDrawerTabbables(drawer);
      if (!focusable.length) {
        event.preventDefault();
      } else {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !drawer.contains(document.activeElement))) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (event.key === '/' && !['input', 'textarea', 'select'].includes(tag)) {
      event.preventDefault();
      refs.searchInput.focus();
    }
    if (event.key === 'Escape') {
      // The native modal dialog is the topmost interaction layer. Let its own
      // Escape/cancel behavior close it first; an underlying mobile drawer must
      // remain open until the user dismisses that layer separately.
      if (refs.previewDialog.open) return;
      closeSidebar();
      if (window.matchMedia('(max-width: 1180px)').matches) closeInspector();
    }
  });
  window.addEventListener('resize', () => {
    if (!window.matchMedia('(max-width: 820px)').matches) closeSidebar();
    if (!window.matchMedia('(max-width: 1180px)').matches) {
      refs.body.classList.remove('inspector-open');
      syncMobileInspectorState(false);
    }
    updateBackdrop();
  });

  return { openInspector, closeInspector, setView };
}
