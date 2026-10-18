function initializeNavbar(header = document.querySelector('[data-navbar]')) {
  if (!header) return;

  const nav = header.querySelector('.site-nav');
  const list = header.querySelector('.navbar-links');
  const sectionId = item => item.dataset.section || item.getAttribute('href')?.slice(1);
  const links = [...header.querySelectorAll('.navbar-link')].map(item => {
    const target = document.getElementById(sectionId(item));
    if (!target || item.tagName !== 'BUTTON') return item;
    // A pending section becomes a real navigation link when its content exists.
    const link = document.createElement('a');
    link.className = item.className;
    link.innerHTML = item.innerHTML;
    link.dataset.section = target.id;
    link.href = `#${target.id}`;
    item.replaceWith(link);
    return link;
  });
  const toggle = header.querySelector('.navbar-toggle');
  const logo = header.querySelector('.navbar-logo');
  const compact = window.matchMedia('(max-width: 759px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = links.map(link => document.getElementById(sectionId(link)));
  let active = links.find(link => link.hasAttribute('aria-current')) ?? links[0];
  let selected = active;
  let hovered = null;
  let previewSelection = false;
  let lastScrollY = window.scrollY;
  let scrollFrame;
  let pendingNavigation = false;
  let settleTimer;

  function positionPill() {
    if (compact.matches) return;
    const focus = document.activeElement;
    const focused = links.includes(focus) && focus.matches(':focus-visible') ? focus : null;
    const target = hovered || focused || selected;
    if (!target) return;
    const bounds = target.getBoundingClientRect();
    const container = list.getBoundingClientRect();
    list.style.setProperty('--pill-x', `${bounds.left - container.left}px`);
    list.style.setProperty('--pill-width', `${bounds.width}px`);
  }

  function select(link) {
    selected = link;
    links.forEach(item => {
      item.toggleAttribute('data-selected', item === selected);
      if (item.tagName === 'BUTTON') item.setAttribute('aria-pressed', String(item === selected));
    });
    positionPill();
  }

  function activate(link) {
    active = link;
    links.forEach(item => {
      if (item === active) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
    if (!previewSelection) select(link);
    else positionPill();
  }

  function setMenu(open, restoreFocus = false) {
    header.toggleAttribute('data-menu-open', open && compact.matches);
    toggle.setAttribute('aria-expanded', String(open && compact.matches));
    toggle.setAttribute('aria-label', open && compact.matches ? 'Close menu' : 'Open menu');
    nav.inert = compact.matches && !open;
    if (restoreFocus) toggle.focus({ preventScroll: true });
  }

  function syncFromScroll() {
    scrollFrame = undefined;
    if (pendingNavigation) return;
    const readingLine = header.getBoundingClientRect().height + 24;
    let selected = links[0];
    targets.forEach((target, index) => {
      if (target && target.getBoundingClientRect().top <= readingLine) selected = links[index];
    });
    // The last section may be too short to reach the reading line at the bottom.
    if (window.scrollY > 0 && window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
      selected = links.findLast((link, index) => targets[index]) ?? selected;
    }
    activate(selected);
  }

  function scheduleScrollSync() {
    if (pendingNavigation) {
      clearTimeout(settleTimer);
      settleTimer = setTimeout(finishNavigation, 180);
    }
    if (!scrollFrame) scrollFrame = requestAnimationFrame(syncFromScroll);
  }

  function finishNavigation() {
    clearTimeout(settleTimer);
    pendingNavigation = false;
    syncFromScroll();
  }

  function resumeScrollTracking() {
    previewSelection = false;
    finishNavigation();
  }

  links.forEach((link, index) => {
    link.addEventListener('pointerenter', event => {
      if (compact.matches || event.pointerType === 'touch') return;
      hovered = link;
      positionPill();
    });
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const keyboardActivation = event.detail === 0;
      if (!targets[index]) {
        event.preventDefault();
        previewSelection = true;
        // A focus/scroll-into-view event queued before this click must not undo it.
        lastScrollY = window.scrollY;
        pendingNavigation = false;
        clearTimeout(settleTimer);
        select(link);
        setMenu(false, compact.matches);
        return;
      }
      // Native anchors retain normal URL/history and smooth-scroll behavior.
      previewSelection = false;
      pendingNavigation = true;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(finishNavigation, 180);
      activate(link);
      setMenu(false, compact.matches && keyboardActivation);
    });
  });

  nav.addEventListener('pointerleave', () => {
    hovered = null;
    positionPill();
  });
  nav.addEventListener('focusin', positionPill);
  nav.addEventListener('focusout', () => requestAnimationFrame(positionPill));

  logo.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    previewSelection = false;
    pendingNavigation = true;
    clearTimeout(settleTimer);
    settleTimer = setTimeout(finishNavigation, 180);
    activate(links[0]);
    setMenu(false);
  });
  toggle.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
  header.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.hasAttribute('data-menu-open')) {
      setMenu(false, true);
    }
  });
  document.addEventListener('click', event => {
    if (!header.contains(event.target)) setMenu(false);
  });
  document.addEventListener('focusin', event => {
    if (!header.contains(event.target)) setMenu(false);
  });

  compact.addEventListener('change', () => {
    hovered = null;
    const focusedLink = nav.contains(document.activeElement);
    setMenu(false, compact.matches && focusedLink);
    if (!compact.matches && document.activeElement === toggle) active.focus({ preventScroll: true });
    positionPill();
  });
  window.addEventListener('scroll', () => {
    // Focusing sticky navigation can scroll the document automatically.
    if (window.scrollY !== lastScrollY && !header.contains(document.activeElement)) previewSelection = false;
    lastScrollY = window.scrollY;
    scheduleScrollSync();
  }, { passive: true });
  window.addEventListener('scrollend', finishNavigation);
  window.addEventListener('wheel', resumeScrollTracking, { passive: true });
  window.addEventListener('touchstart', finishNavigation, { passive: true });
  window.addEventListener('touchmove', resumeScrollTracking, { passive: true });
  document.addEventListener('pointerdown', event => {
    if (!header.contains(event.target)) resumeScrollTracking();
  });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) resumeScrollTracking();
  });
  window.addEventListener('hashchange', scheduleScrollSync);
  window.addEventListener('pageshow', scheduleScrollSync);
  window.addEventListener('resize', scheduleScrollSync, { passive: true });
  new ResizeObserver(positionPill).observe(list);

  toggle.hidden = false;
  setMenu(false);
  syncFromScroll();
  header.setAttribute('data-enhanced', '');
  document.fonts.ready.then(() => {
    positionPill();
    requestAnimationFrame(() => header.setAttribute('data-ready', ''));
  });

  // Allow a preference change to take effect during the same visit.
  reducedMotion.addEventListener('change', positionPill);
}

initializeNavbar();
