/* نور القلوب — main.js (SAFE + PWA install) */
(() => {
  "use strict";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // Footer year
  const yearEl = $("#year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // Smooth scroll
  $$('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#") return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });

      const navToggle = $("#navToggle");
      if (navToggle) navToggle.checked = false;
    });
  });

  // Close drawer on any drawer link + ESC
  const navToggle = $("#navToggle");
  if (navToggle) {
    $$(".drawer a").forEach((link) => link.addEventListener("click", () => (navToggle.checked = false)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") navToggle.checked = false;
    });
  }

  // Service worker register
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/service-worker.js").catch(() => {});
    });
  }

  // ===== PWA Install Banner =====
  const installBar = $("#installBar");
  const installBtn = $("#installBtn");
  const dismissBtn = $("#installDismiss");

  let deferredPrompt = null;

  function showInstallBar() {
    if (!installBar) return;
    // لا تظهر إذا المستخدم رفض سابقًا
    const dismissed = localStorage.getItem("noor_install_dismissed") === "1";
    if (dismissed) return;
    installBar.hidden = false;
  }

  function hideInstallBar() {
    if (!installBar) return;
    installBar.hidden = true;
  }

  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallBar();
  });

  if (dismissBtn) {
    dismissBtn.addEventListener("click", () => {
      localStorage.setItem("noor_install_dismissed", "1");
      hideInstallBar();
    });
  }

  if (installBtn) {
    installBtn.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch {}
      deferredPrompt = null;
      hideInstallBar();
    });
  }

  window.addEventListener("appinstalled", () => {
    hideInstallBar();
  });
})();