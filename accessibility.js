/* نور القلوب — accessibility.js (SAFE / NO ERRORS) */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);

  // Respect reduced motion
  const reduceMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)");
  if (reduceMotion?.matches) {
    document.documentElement.style.scrollBehavior = "auto";
  }

  // Optional: improve focus for drawer open
  const navToggle = $("#navToggle");
  const firstDrawerLink = $(".drawer a");

  if (navToggle && firstDrawerLink) {
    navToggle.addEventListener("change", () => {
      if (navToggle.checked) {
        // focus first link when opened
        setTimeout(() => firstDrawerLink.focus?.(), 0);
      }
    });
  }
})();