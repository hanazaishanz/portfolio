function initializeNavbar(header = document.querySelector('[data-navbar]')) {
  if (!header) return;

  const nav = header.querySelector('.site-nav');
  const list = header.querySelector('.navbar-links');
  const links = [...header.querySelectorAll('.navbar-link')];
  const toggle = header.querySelector('.navbar-toggle');
  const logo = header.querySelector('.navbar-logo');
  const compact = window.matchMedia('(max-width: 759px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const targets = links.map(link => document.getElementById(link.dataset.section || link.hash.slice(1)));
  links.forEach((link, index) => {
    if (!targets[index]) return;
    link.setAttribute('href', `#${targets[index].id}`);
    link.removeAttribute('aria-disabled');
    link.removeAttribute('tabindex');
  });
  let active = links.find(link => link.hasAttribute('aria-current')) ?? links[0];
  let scrollFrame;
  let pendingNavigation = false;
  let settleTimer;

  function positionPill() {
    if (compact.matches || !active) return;
    const bounds = active.getBoundingClientRect();
    const container = list.getBoundingClientRect();
    list.style.setProperty('--pill-x', `${bounds.left - container.left}px`);
    list.style.setProperty('--pill-width', `${bounds.width}px`);
  }

  function activate(link) {
    active = link;
    links.forEach(item => {
      if (item === active) item.setAttribute('aria-current', 'location');
      else item.removeAttribute('aria-current');
    });
    positionPill();
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

  links.forEach(link => {
    link.addEventListener('click', event => {
      if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      if (!document.getElementById(link.hash.slice(1))) {
        event.preventDefault();
        setMenu(false);
        return;
      }
      // Native anchors retain normal URL/history and smooth-scroll behavior.
      pendingNavigation = true;
      clearTimeout(settleTimer);
      settleTimer = setTimeout(finishNavigation, 180);
      activate(link);
      const keyboardActivation = event.detail === 0;
      setMenu(false, compact.matches && keyboardActivation);
    });
  });

  logo.addEventListener('click', event => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
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
    const focusedLink = nav.contains(document.activeElement);
    setMenu(false, compact.matches && focusedLink);
    if (!compact.matches && document.activeElement === toggle) active.focus({ preventScroll: true });
    positionPill();
  });
  window.addEventListener('scroll', scheduleScrollSync, { passive: true });
  window.addEventListener('scrollend', finishNavigation);
  window.addEventListener('wheel', finishNavigation, { passive: true });
  window.addEventListener('touchstart', finishNavigation, { passive: true });
  window.addEventListener('keydown', event => {
    if (['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End'].includes(event.key)) finishNavigation();
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
