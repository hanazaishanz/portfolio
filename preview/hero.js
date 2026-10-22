(() => {
  "use strict";
  const frame = document.getElementById("hero-preview");
  const caption = document.getElementById("preview-caption");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let mode = new URLSearchParams(location.search).get("mode") || "parallax";
  let controller;
  let motionFrame;

  function run() {
    const doc = frame.contentDocument;
    const hero = doc?.querySelector(".hero");
    if (!hero) return;
    controller?.abort();
    cancelAnimationFrame(motionFrame);
    controller = new AbortController();
    const { signal } = controller;
    hero.getAnimations({ subtree: true }).forEach((animation) => animation.cancel());
    hero.querySelector(".hero-portrait-art").style.transform = "";
    hero.querySelector(".hero-orbit").style.transform = "";
    document.querySelectorAll("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
    if (reducedMotion.matches) return;

    const animate = (selector, keyframes, duration, delay = 0, extra = {}) => {
      const element = hero.querySelector(selector);
      return element?.animate(keyframes, { duration, delay, easing: "cubic-bezier(.2,.8,.25,1)", fill: "backwards", ...extra });
    };
    const enter = [{ opacity: 0, transform: "translateY(24px)" }, { opacity: 1, transform: "translateY(0)" }];
    if (mode === "parallax") {
      animate(".hero-portrait", enter, 1000, 60);
      animate(".hero-title-better", enter, 700, 180);
      animate(".hero-title-call", enter, 700, 280);
      animate(".hero-title-name", enter, 850, 400);
      const art = hero.querySelector(".hero-portrait-art");
      const orbit = hero.querySelector(".hero-orbit");
      let targetX = 0, targetY = 0, x = 0, y = 0;
      function tick() {
        x += (targetX - x) * .09; y += (targetY - y) * .09;
        art.style.transform = `translate3d(${x * 7}px,${y * 5}px,0)`;
        orbit.style.transform = `translate3d(${-x * 14}px,${-y * 11}px,0)`;
        motionFrame = requestAnimationFrame(tick);
      }
      hero.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;
        const r = hero.getBoundingClientRect();
        targetX = (event.clientX - r.left) / r.width * 2 - 1;
        targetY = (event.clientY - r.top) / r.height * 2 - 1;
      }, { signal });
      hero.addEventListener("pointerleave", () => { targetX = 0; targetY = 0; }, { signal });
      tick();
      caption.textContent = "Gerakkan kursor di atas hero: foto dan lingkaran bergerak dengan kedalaman berbeda. Parallax halus sudah diterapkan pada hero utama.";
    } else if (mode === "playful") {
      animate(".hero-portrait", [
        { opacity: 0, transform: "translateY(35px) scale(.88) rotate(-3deg)" },
        { opacity: 1, transform: "translateY(-6px) scale(1.015) rotate(.7deg)", offset: .72 },
        { opacity: 1, transform: "translateY(0) scale(1) rotate(0)" },
      ], 1100, 60);
      [".hero-title-better", ".hero-title-call", ".hero-letter-r", ".hero-letter-a", ".hero-letter-f", ".hero-letter-i"].forEach((selector, i) => {
        const base = getComputedStyle(hero.querySelector(selector)).transform;
        const transform = base === "none" ? "" : base;
        animate(selector, [
          { opacity: 0, transform: `translateY(24px) rotate(-5deg) scale(.9) ${transform}` },
          { opacity: 1, transform: `translateY(-4px) rotate(1deg) scale(1.02) ${transform}`, offset: .7 },
          { opacity: 1, transform: `translateY(0) rotate(0) scale(1) ${transform}` },
        ], 700, 180 + i * 95);
      });
      animate(".hero-square", [{ transform: "translateY(0) rotate(0)" }, { transform: "translateY(-8px) rotate(3deg)" }, { transform: "translateY(0) rotate(0)" }], 3600, 1000, { iterations: Infinity });
      animate(".hero-orbit", [{ transform: "translateY(0)" }, { transform: "translateY(10px)" }, { transform: "translateY(0)" }], 5000, 0, { iterations: Infinity });
      caption.textContent = "Foto masuk dengan bounce ringan, lettering muncul bergantian, kotak dekorasi bergerak pelan. Posisi akhir tetap mengikuti desain.";
    } else {
      animate(".hero-portrait", [{ opacity: 0, clipPath: "inset(100% 0 0 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)" }], 1200, 80);
      animate(".hero-title", [{ opacity: 0, clipPath: "inset(0 100% 0 0)" }, { opacity: 1, clipPath: "inset(0 0 0 0)" }], 1300, 220);
      animate(".hero-square", [{ transform: "rotate(0)" }, { transform: "rotate(5deg)" }, { transform: "rotate(0)" }], 6000, 800, { iterations: Infinity });
      animate(".hero-orbit", [{ transform: "translateY(0)" }, { transform: "translateY(-7px)" }, { transform: "translateY(0)" }], 6000, 0, { iterations: Infinity });
      caption.textContent = "Foto dan lettering terbuka seperti sapuan mask. Gerakan dekorasi lebih pelan, tanpa mengikuti kursor.";
    }
    animate(".hero-description", enter, 800, 650);
    animate(".artwork-link", enter, 750, 850);
    document.querySelectorAll("[data-mode]").forEach((button) => button.setAttribute("aria-pressed", String(button.dataset.mode === mode)));
  }

  document.querySelectorAll("[data-mode]").forEach((button) => button.addEventListener("click", () => { mode = button.dataset.mode; run(); }));
  document.querySelector("[data-replay]").addEventListener("click", run);
  reducedMotion.addEventListener("change", run);
  frame.addEventListener("load", async () => { await frame.contentDocument.fonts.ready; run(); });
})();
