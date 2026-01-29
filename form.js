/* نور القلوب — form.js (SAFE / LOCAL STORAGE) */
(() => {
  "use strict";

  const STORAGE_KEY = "noor_al_qulub_testimonies_v1";
  const $ = (sel, root = document) => root.querySelector(sel);

  function loadAll() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }

  function saveAll(items) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }

  function uid() {
    // short unique id
    return "t_" + Math.random().toString(16).slice(2) + "_" + Date.now();
  }

  const form = $("#testimonyForm");
  if (!form) return; // this file also loads on pages without the form safely

  const bodyEl = form.querySelector('textarea[name="body"]');
  const charCount = $("#charCount");
  const clearAllBtn = $("#clearAllBtn");

  // char counter
  if (bodyEl && charCount) {
    const update = () => (charCount.textContent = String(bodyEl.value.length));
    bodyEl.addEventListener("input", update);
    update();
  }

  // Submit: save locally
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const item = {
      id: uid(),
      title: String(fd.get("title") || "").trim(),
      date: String(fd.get("date") || "").trim(),
      place: String(fd.get("place") || "").trim(),
      alias: String(fd.get("alias") || "").trim(),
      body: String(fd.get("body") || "").trim(),
      createdAt: Date.now()
    };

    // basic validation
    if (!item.title || !item.date || !item.place || !item.body) {
      alert("رجاءً املأ الحقول المطلوبة.");
      return;
    }

    const all = loadAll();
    all.unshift(item);
    saveAll(all);

    form.reset();
    if (bodyEl && charCount) charCount.textContent = "0";

    alert("تم حفظ الشهادة محليًا على جهازك ✅");
  });

  // Clear all local testimonies
  if (clearAllBtn) {
    clearAllBtn.addEventListener("click", () => {
      const ok = confirm("هل تريد مسح كل الشهادات المحفوظة محليًا على هذا الجهاز؟");
      if (!ok) return;
      localStorage.removeItem(STORAGE_KEY);
      alert("تم المسح ✅");
    });
  }
})();