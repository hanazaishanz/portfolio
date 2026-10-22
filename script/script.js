(() => {
  "use strict";

  // KONTAK CUSTOM: ubah URL, label, dan lokasi ikon di sini.
  // Perubahan diterapkan ke CTA dan footer sekaligus. Pakai SVG/PNG transparan
  // untuk ikon sendiri; object-fit menjaga proporsi tanpa mengubah ukuran tombol.
  const contacts = {
    instagram: {
      href: "https://www.instagram.com/",
      label: "@naufalhafizhaa_",
      name: "Instagram",
      icon: "./assets/social/instagram.svg",
    },
    whatsapp: {
      href: "https://www.whatsapp.com/",
      label: "WhatsApp",
      name: "WhatsApp",
      icon: "./assets/social/whatsapp.svg",
    },
    email: {
      href: "mailto:naufalraf837@gmail.com",
      label: "naufalraf837@gmail.com",
      name: "Email",
      icon: "./assets/social/gmail.svg",
    },
    linkedin: {
      href: "https://www.linkedin.com/",
      label: "Naufal Rafi",
      name: "LinkedIn",
      icon: "./assets/social/linkedin.svg",
    },
  };

  for (const link of document.querySelectorAll("[data-contact-link]")) {
    const contact = contacts[link.dataset.contactLink];
    if (!contact) continue;

    link.setAttribute("href", contact.href);
    link.setAttribute("aria-label", contact.name === contact.label ? contact.name : `${contact.name} — ${contact.label}`);
    const icon = link.querySelector("[data-contact-icon]");
    const label = link.querySelector("[data-contact-label]");
    if (icon) icon.setAttribute("src", contact.icon);
    if (label) label.textContent = contact.label;

    if (/^https?:\/\//i.test(contact.href)) {
      link.setAttribute("target", "_blank");
      link.setAttribute("rel", "noopener noreferrer");
    } else {
      link.removeAttribute("target");
      link.removeAttribute("rel");
    }
  }
})();

(() => {
  "use strict";

  const header = document.querySelector("[data-header]");
  if (!header) return;

  const navigation = header.querySelector(".primary-navigation");
  const panel = header.querySelector(".nav-panel");
  const toggle = header.querySelector(".menu-toggle");
  const indicator = header.querySelector(".nav-indicator");
  const links = [...header.querySelectorAll(".nav-link")];
  const items = links
    .map((link) => ({ link, section: document.getElementById(link.hash.slice(1)) }))
    .filter(({ section }) => section);

  if (!navigation || !panel || !toggle || !indicator || !items.length) return;

  const mobile = window.matchMedia("(max-width: 63.999rem)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  let activeLink = items[0].link;
  let framePending = false;
  let scrollDestination = null;
  let scrollIdleTimer;

  function positionIndicator() {
    const containerBounds = panel.getBoundingClientRect();
    const linkBounds = activeLink.getBoundingClientRect();
    const height = mobile.matches ? linkBounds.height : 36.5;

    indicator.style.setProperty("--indicator-x", `${linkBounds.left - containerBounds.left}px`);
    indicator.style.setProperty("--indicator-y", `${linkBounds.top - containerBounds.top + (linkBounds.height - height) / 2}px`);
    indicator.style.setProperty("--indicator-width", `${linkBounds.width}px`);
    indicator.style.setProperty("--indicator-height", `${height}px`);
  }

  function setActive(link) {
    activeLink = link;
    for (const item of items) {
      if (item.link === link) item.link.setAttribute("aria-current", "location");
      else item.link.removeAttribute("aria-current");
    }
    positionIndicator();
  }

  function updateFromScroll() {
    // Keep a clicked destination selected while smooth scrolling past other sections.
    if (scrollDestination) return;

    const activationLine = header.getBoundingClientRect().bottom + Math.min(window.innerHeight * 0.25, 180);
    let current = items[0];

    for (const item of items) {
      if (item.section.getBoundingClientRect().top <= activationLine) current = item;
    }

    // A short final section must still become active at the bottom of the page.
    if (window.scrollY > 0 && Math.ceil(window.scrollY + window.innerHeight) >= document.documentElement.scrollHeight - 2) {
      current = items[items.length - 1];
    }

    setActive(current.link);
  }

  function queueScrollUpdate() {
    if (framePending) return;
    framePending = true;
    window.requestAnimationFrame(() => {
      framePending = false;
      updateFromScroll();
    });
  }

  function finishScroll() {
    window.clearTimeout(scrollIdleTimer);
    scrollDestination = null;
    queueScrollUpdate();
  }

  function setMenuOpen(open, restoreFocus = false) {
    const expanded = mobile.matches && open;
    header.toggleAttribute("data-menu-open", expanded);
    toggle.setAttribute("aria-expanded", String(expanded));
    toggle.setAttribute("aria-label", expanded ? "Tutup menu navigasi" : "Buka menu navigasi");
    navigation.inert = mobile.matches && !expanded;
    if (restoreFocus) toggle.focus();
    if (expanded) positionIndicator();
  }

  function navigate(event, section, link) {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    setMenuOpen(false);

    const selected = link || items.find((item) => item.section === section || item.section.contains(section))?.link;
    if (selected) setActive(selected);
    scrollDestination = section;

    if (window.location.hash !== `#${section.id}`) {
      window.history.pushState(null, "", `#${section.id}`);
    }

    section.focus({ preventScroll: true });
    section.scrollIntoView({ behavior: reducedMotion.matches ? "instant" : "smooth", block: "start" });

    // Also handles clicks that do not produce a scroll event (already at the target).
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(finishScroll, 180);
  }

  for (const { link, section } of items) {
    link.addEventListener("click", (event) => navigate(event, section, link));
  }

  header.querySelector(".brand")?.addEventListener("click", (event) => {
    navigate(event, items[0].section, items[0].link);
  });

  for (const link of document.querySelectorAll("a[data-scroll-target]")) {
    const section = document.getElementById(link.hash.slice(1));
    if (section) link.addEventListener("click", (event) => navigate(event, section));
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && header.hasAttribute("data-menu-open")) {
      setMenuOpen(false, true);
    }
    if (["ArrowDown", "ArrowUp", "PageDown", "PageUp", "Home", "End", " "].includes(event.key)) {
      finishScroll();
    }
  });

  document.addEventListener("pointerdown", (event) => {
    if (!header.contains(event.target)) setMenuOpen(false);
  });

  header.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      if (!header.contains(document.activeElement)) setMenuOpen(false);
    });
  });

  window.addEventListener("scroll", () => {
    queueScrollUpdate();
    window.clearTimeout(scrollIdleTimer);
    scrollIdleTimer = window.setTimeout(finishScroll, 180);
  }, { passive: true });

  window.addEventListener("scrollend", finishScroll);
  window.addEventListener("wheel", finishScroll, { passive: true });
  window.addEventListener("touchstart", finishScroll, { passive: true });
  window.addEventListener("popstate", finishScroll);
  window.addEventListener("hashchange", finishScroll);

  function syncLayout() {
    // Resize directly into the new layout. Animating from a full-width mobile
    // indicator to a desktop link can briefly push the page past its viewport.
    header.removeAttribute("data-indicator-ready");
    setMenuOpen(false);
    positionIndicator();
    indicator.getBoundingClientRect();
    header.dataset.indicatorReady = "true";
    queueScrollUpdate();
  }

  mobile.addEventListener("change", syncLayout);
  window.addEventListener("resize", syncLayout, { passive: true });

  header.dataset.enhanced = "true";
  setMenuOpen(false);
  updateFromScroll();

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      header.dataset.indicatorReady = "true";
    });
  });

  document.fonts?.ready.then(() => {
    positionIndicator();
    queueScrollUpdate();
  });

  // Use the real lettering when its original font is available; never fake its weight.
  document.fonts?.load('80px "SCRIPT1 Script Casual"').then((faces) => {
    document.documentElement.toggleAttribute("data-script1-ready", faces.length > 0);
  }).catch(() => {
    document.documentElement.removeAttribute("data-script1-ready");
  });
})();

(() => {
  "use strict";

  const orbit = document.querySelector("[data-contact-orbit]");
  const stage = orbit?.querySelector("[data-orbit-stage]");
  if (!orbit || !stage) return;

  const custom = document.getElementById("contact-custom-previews");
  const projectSources = [...document.querySelectorAll(".project-card")];
  const customSources = custom ? [...custom.content.querySelectorAll("figure")] : [];
  const mode = orbit.dataset.previewSource;
  const sources = mode === "custom" ? customSources
    : mode === "mixed" ? [...projectSources, ...customSources] : projectSources;
  const usable = sources.filter((source) => source.querySelector("img"));
  if (!usable.length) return; // Keep the native Recent Projects fallback usable.

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pauseButton = orbit.querySelector("[data-orbit-pause]");
  const speed = Math.max(0.5, Number(orbit.dataset.orbitSpeed) || 4.5);
  const count = Math.max(8, usable.length);
  const step = 360 / count;
  const cards = [];
  let phase = 0;
  let radius = 0;
  let pitch = 0;
  let frame = null;
  let lastTime = 0;
  let visible = false;
  let hovered = false;
  let focused = false;
  let paused = false;
  let drag = null;

  for (let index = 0; index < count; index += 1) {
    const source = usable[index % usable.length];
    const card = document.createElement("figure");
    card.className = "contact-orbit-card";
    if (index >= usable.length) card.setAttribute("aria-hidden", "true");

    const previewWindow = document.createElement("div");
    previewWindow.className = "contact-preview-window";
    const image = source.querySelector("img").cloneNode(true);
    image.removeAttribute("id");
    image.loading = "lazy";
    image.draggable = false;
    previewWindow.append(image);
    card.append(previewWindow);

    const sourceCaption = source.querySelector("figcaption");
    if (sourceCaption) {
      const caption = document.createElement("figcaption");
      caption.className = "visually-hidden";
      caption.textContent = sourceCaption.textContent;
      card.append(caption);
    }
    stage.append(card);
    cards.push(card);
  }

  function signedAngle(angle) {
    return ((angle + 180) % 360 + 360) % 360 - 180;
  }

  function render() {
    const staticMode = reducedMotion.matches;
    orbit.toggleAttribute("data-static", staticMode);

    cards.forEach((card, index) => {
      const angle = signedAngle(index * step - phase);
      if (staticMode) {
        const slot = Math.round(angle / step);
        card.style.setProperty("--static-x", `${-slot * pitch}px`);
        return;
      }

      const radians = angle * Math.PI / 180;
      // Concave arc: its sides approach the viewer while the center stays at z=0.
      const x = -radius * Math.sin(radians);
      const z = radius * (1 - Math.cos(radians));
      const magnitude = Math.abs(angle);
      card.style.transform = `translate3d(${x}px, 0, ${z}px) rotateY(${angle}deg)`;
      card.style.visibility = magnitude < 118 ? "visible" : "hidden";
      card.style.opacity = String(Math.max(0, Math.min(1, (118 - magnitude) / 10)));
    });
  }

  function measure() {
    const width = parseFloat(getComputedStyle(cards[0]).width);
    const gap = parseFloat(getComputedStyle(stage).columnGap) || width * 20 / 172;
    pitch = width + gap;
    radius = pitch / (2 * Math.tan(Math.PI / count));
    orbit.style.setProperty("--orbit-perspective", `${radius * 2.8}px`);
    if (pauseButton) pauseButton.hidden = reducedMotion.matches;
    const instructions = orbit.querySelector("#orbit-instructions");
    if (instructions) instructions.textContent = reducedMotion.matches
      ? "Static project previews. Use the left and right arrow keys to explore."
      : "Project previews rotate from left to right. Hover or focus to pause. Use the left and right arrow keys to explore, or Space to pause and resume.";
    render();
  }

  function canMove() {
    return visible && !document.hidden && !reducedMotion.matches && !hovered && !focused && !paused && !drag;
  }

  function stop() {
    if (frame !== null) window.cancelAnimationFrame(frame);
    frame = null;
    lastTime = 0;
  }

  function tick(time) {
    frame = null;
    if (!canMove()) { lastTime = 0; return; }
    if (lastTime) phase = (phase + Math.min(time - lastTime, 60) * speed / 1000) % 360;
    lastTime = time;
    render();
    frame = window.requestAnimationFrame(tick);
  }

  function start() {
    if (frame === null && canMove()) frame = window.requestAnimationFrame(tick);
  }

  function setPaused(value) {
    paused = value;
    pauseButton?.setAttribute("aria-pressed", String(paused));
    if (pauseButton) pauseButton.textContent = paused ? "resume previews" : "pause previews";
    if (paused) stop();
    else start();
  }

  pauseButton?.addEventListener("click", () => setPaused(!paused));

  orbit.addEventListener("pointerenter", (event) => {
    if (event.pointerType === "mouse") { hovered = true; stop(); }
  });
  orbit.addEventListener("pointerleave", () => { hovered = false; start(); });
  orbit.addEventListener("focusin", () => { focused = true; stop(); });
  orbit.addEventListener("focusout", () => {
    window.requestAnimationFrame(() => {
      focused = orbit.contains(document.activeElement);
      start();
    });
  });

  orbit.addEventListener("keydown", (event) => {
    if (event.target.closest("button, a")) return;
    if (event.key === " ") {
      event.preventDefault();
      setPaused(!paused);
    } else if (["ArrowLeft", "ArrowRight"].includes(event.key)) {
      event.preventDefault();
      stop();
      phase += event.key === "ArrowRight" ? step : -step;
      render();
    }
  });

  orbit.addEventListener("pointerdown", (event) => {
    if (event.button !== 0 || event.target.closest("button, a")) return;
    drag = { id: event.pointerId, x: event.clientX, phase };
    orbit.dataset.dragging = "true";
    orbit.setPointerCapture(event.pointerId);
    stop();
  });
  orbit.addEventListener("pointermove", (event) => {
    if (!drag || drag.id !== event.pointerId) return;
    phase = drag.phase + (event.clientX - drag.x) * step / pitch;
    render();
  });

  function endDrag(event) {
    if (!drag || drag.id !== event.pointerId) return;
    if (orbit.hasPointerCapture(event.pointerId)) orbit.releasePointerCapture(event.pointerId);
    drag = null;
    orbit.removeAttribute("data-dragging");
    start();
  }
  orbit.addEventListener("pointerup", endDrag);
  orbit.addEventListener("pointercancel", endDrag);

  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) start();
    else stop();
  }).observe(orbit);
  new ResizeObserver(measure).observe(orbit);
  document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); else start(); });
  reducedMotion.addEventListener("change", () => { stop(); measure(); start(); });

  orbit.dataset.enhanced = "true";
  orbit.tabIndex = 0;
  measure();
})();

(() => {
  "use strict";

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  // Services: a single expanded description, with the lifted glass card above it.
  const services = document.querySelector("[data-services]");
  services?.addEventListener("click", (event) => {
    const selected = event.target.closest(".service-card");
    if (!selected || !services.contains(selected)) return;
    const open = selected.getAttribute("aria-expanded") !== "true";

    for (const button of services.querySelectorAll(".service-card")) {
      const expanded = button === selected && open;
      button.setAttribute("aria-expanded", String(expanded));
      const description = document.getElementById(button.getAttribute("aria-controls"));
      if (!description) continue;
      description.getAnimations().forEach((animation) => animation.cancel());
      description.hidden = !expanded;
      if (expanded && !reducedMotion.matches) {
        description.animate([
          { opacity: 0, transform: "translateY(10px)" },
          { opacity: 1, transform: "translateY(0)" },
        ], { duration: 260, delay: 160, fill: "backwards", easing: "ease-out" });
      }
    }
  });

  // Projects live in HTML for accessible, indexable content and simple customization.
  const filters = document.querySelector(".project-filters");
  const projects = [...document.querySelectorAll(".project-card[data-category]")];
  const projectStatus = document.querySelector("[data-project-status]");
  filters?.addEventListener("click", (event) => {
    const selected = event.target.closest("[data-filter]");
    if (!selected || !filters.contains(selected)) return;
    const category = selected.dataset.filter;
    let visible = 0;

    for (const button of filters.querySelectorAll("[data-filter]")) {
      button.setAttribute("aria-pressed", String(button === selected));
    }

    for (const project of projects) {
      const show = category === "all" || project.dataset.category.split(/\s+/).includes(category);
      project.getAnimations().forEach((animation) => animation.cancel());
      project.hidden = !show;
      if (show) {
        visible += 1;
        if (!reducedMotion.matches) {
          project.animate([
            { opacity: 0, transform: "translateY(14px)" },
            { opacity: 1, transform: "translateY(0)" },
          ], { duration: 300, delay: (visible - 1) * 35, fill: "backwards", easing: "ease-out" });
        }
      }
    }

    if (projectStatus) {
      projectStatus.textContent = category === "all"
        ? `Showing all ${visible} projects.`
        : `Showing ${visible} ${selected.textContent.trim()} projects.`;
    }
  });

  function initializeTools() {
    const marquee = document.querySelector("[data-tools]");
    const track = marquee?.querySelector(".tools-track");
    const group = track?.querySelector(".tool-group");
    if (!marquee || !track || !group || !group.children.length) return;

    const status = document.querySelector("[data-tool-status]");
    const pauseDuration = Math.max(1000, Number(marquee.dataset.pauseDuration) || 4000);
    const speed = Math.max(8, Number(marquee.dataset.speed) || 36);
    let distance = 1;
    let offset = 0;
    let frame = null;
    let lastTime = 0;
    let selectedId = null;
    let resetTimer;
    let inView = false;
    let keyboardPaused = false;

    marquee.dataset.enhanced = "true";

    function ensureClones() {
      const count = Math.max(2, Math.ceil(marquee.clientWidth / distance) + 1);
      while (track.children.length < count) {
        const clone = group.cloneNode(true);
        clone.dataset.toolsClone = "true";
        clone.setAttribute("aria-hidden", "true");
        clone.querySelectorAll("button").forEach((button) => button.tabIndex = -1);
        track.append(clone);
      }
    }

    function render() {
      // Keep the actual focused original visible, rather than wrapping to its clone.
      if (!keyboardPaused) offset = ((offset % distance) + distance) % distance;
      track.style.transform = reducedMotion.matches ? "none" : `translate3d(${-offset}px, 0, 0)`;
    }

    function measure() {
      distance = Math.max(1, group.getBoundingClientRect().width);
      ensureClones();
      render();
    }

    function canMove() {
      return inView && !document.hidden && !reducedMotion.matches && !selectedId && !keyboardPaused;
    }

    function stop() {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = null;
      lastTime = 0;
    }

    function tick(time) {
      frame = null;
      if (!canMove()) { lastTime = 0; return; }
      if (lastTime) offset += Math.min(time - lastTime, 60) * speed / 1000;
      lastTime = time;
      render();
      frame = window.requestAnimationFrame(tick);
    }

    function start() {
      if (frame === null && canMove()) frame = window.requestAnimationFrame(tick);
    }

    function visibleSelectedItem() {
      const bounds = marquee.getBoundingClientRect();
      return [...track.querySelectorAll(".tool-item")]
        .filter((item) => item.dataset.tool === selectedId)
        .sort((a, b) => {
          const overlap = (item) => {
            const r = item.getBoundingClientRect();
            return Math.max(0, Math.min(r.right, bounds.right) - Math.max(r.left, bounds.left));
          };
          return overlap(b) - overlap(a);
        })[0];
    }

    function keepVisible(element) {
      if (!element || reducedMotion.matches) return;
      const bounds = marquee.getBoundingClientRect();
      const item = element.getBoundingClientRect();
      if (item.left < bounds.left + 8) offset += item.left - bounds.left - 8;
      else if (item.right > bounds.right - 8) offset += item.right - bounds.right + 8;
      render();
    }

    function resetSelection() {
      const anchor = visibleSelectedItem();
      const before = anchor?.getBoundingClientRect().left;
      selectedId = null;
      for (const item of track.querySelectorAll(".tool-item")) {
        item.querySelector("button").setAttribute("aria-pressed", "false");
        item.querySelector(".tool-name").hidden = true;
      }
      if (anchor) offset += anchor.getBoundingClientRect().left - before;
      marquee.removeAttribute("data-paused");
      measure();
      if (status) status.textContent = "Tools carousel resumed.";
      start();
    }

    function selectTool(button) {
      const chosen = button.closest(".tool-item");
      if (!chosen) return;
      window.clearTimeout(resetTimer);
      stop();
      const before = button.getBoundingClientRect().left;
      selectedId = chosen.dataset.tool;

      for (const item of track.querySelectorAll(".tool-item")) {
        const active = item.dataset.tool === selectedId;
        item.querySelector("button").setAttribute("aria-pressed", String(active));
        item.querySelector(".tool-name").hidden = !active;
      }

      offset += button.getBoundingClientRect().left - before;
      marquee.dataset.paused = "true";
      measure();
      keepVisible(visibleSelectedItem());
      if (status) status.textContent = `${button.getAttribute("aria-label")}. Carousel paused for ${pauseDuration / 1000} seconds.`;
      resetTimer = window.setTimeout(resetSelection, pauseDuration);
    }

    marquee.addEventListener("click", (event) => {
      const button = event.target.closest(".tool-button");
      if (button && marquee.contains(button)) selectTool(button);
    });

    marquee.addEventListener("focusin", (event) => {
      const button = event.target.closest(".tool-button");
      keyboardPaused = Boolean(button?.matches(":focus-visible"));
      if (keyboardPaused) { stop(); keepVisible(button); }
    });

    marquee.addEventListener("focusout", () => {
      window.requestAnimationFrame(() => {
        keyboardPaused = marquee.contains(document.activeElement) && document.activeElement.matches(":focus-visible");
        start();
      });
    });

    marquee.addEventListener("keydown", (event) => {
      const button = event.target.closest(".tool-button");
      if (!button || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
      event.preventDefault();
      const buttons = [...group.querySelectorAll(".tool-button")];
      const index = buttons.indexOf(button);
      const step = event.key === "ArrowRight" ? 1 : -1;
      buttons[(index + step + buttons.length) % buttons.length].focus();
    });

    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      if (inView) start();
      else stop();
    });
    observer.observe(marquee);

    new ResizeObserver(() => {
      measure();
      if (selectedId) keepVisible(visibleSelectedItem());
    }).observe(group);

    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    reducedMotion.addEventListener("change", () => {
      stop();
      offset = 0;
      measure();
      start();
    });

    measure();
    offset = group.querySelector("button").getBoundingClientRect().width * 0.48;
    render();
  }

  initializeTools();

  // Career reveals run once, with a restrained line-drawing motion in brand red.
  const revealItems = document.querySelectorAll("[data-reveal]");
  if (revealItems.length && !reducedMotion.matches) {
    document.documentElement.dataset.revealReady = "true";
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    }, { threshold: 0.12 });
    revealItems.forEach((item) => observer.observe(item));
  }
})();
