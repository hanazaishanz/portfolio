(() => {
  "use strict";
  const frame = document.getElementById("hero-preview");
  document.querySelector("[data-replay]").addEventListener("click", () => {
    frame.contentWindow.location.reload();
  });
})();
