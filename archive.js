/* نور القلوب — archive.js (PRO: filter + sort + pagination + import/export) */
(() => {
  "use strict";

  const STORAGE_KEY = "noor_al_qulub_testimonies_v1";
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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

  function escapeHtml(s) {
    return String(s ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // Page elements
  const listEl = $("#archiveList");
  if (!listEl) return; // not on archive page

  const qEl = $("#q");
  const placeEl = $("#placeFilter");
  const fromEl = $("#fromDate");
  const toEl = $("#toDate");

  const sortNewestBtn = $("#sortNewest");
  const sortOldestBtn = $("#sortOldest");

  const exportBtn = $("#exportBtn");
  const importBtn = $("#importBtn");
  const importFile = $("#importFile");
  const clearBtn = $("#clearArchiveBtn");

  const countEl = $("#count");

  const prevBtn = $("#prevPage");
  const nextBtn = $("#nextPage");
  const pageNowEl = $("#pageNow");
  const pageTotalEl = $("#pageTotal");

  // State
  let sortMode = "newest";   // newest | oldest
  let pageSize = 10;
  let page = 1;

  // Page size buttons
  const pageSizeButtons = $$("[data-page-size]");
  function setPageSize(n) {
    pageSize = n;
    page = 1;
    pageSizeButtons.forEach((b) => {
      const is = Number(b.getAttribute("data-page-size")) === n;
      b.setAttribute("aria-pressed", is ? "true" : "false");
    });
    rerender();
  }
  pageSizeButtons.forEach((b) => {
    b.addEventListener("click", () => setPageSize(Number(b.getAttribute("data-page-size")) || 10));
  });

  // Sort
  function setSort(mode) {
    sortMode = mode;
    page = 1;
    if (sortNewestBtn && sortOldestBtn) {
      sortNewestBtn.setAttribute("aria-pressed", mode === "newest" ? "true" : "false");
      sortOldestBtn.setAttribute("aria-pressed", mode === "oldest" ? "true" : "false");
    }
    rerender();
  }
  sortNewestBtn?.addEventListener("click", () => setSort("newest"));
  sortOldestBtn?.addEventListener("click", () => setSort("oldest"));

  // Filtering
  function normalize(s) {
    return String(s || "").trim().toLowerCase();
  }

  function inDateRange(itemDate, from, to) {
    if (!itemDate) return true;
    // itemDate is "YYYY-MM-DD"
    const d = itemDate;
    if (from && d < from) return false;
    if (to && d > to) return false;
    return true;
  }

  function getFilteredSorted() {
    let items = loadAll();

    const q = normalize(qEl?.value);
    const place = normalize(placeEl?.value);
    const from = (fromEl?.value || "").trim();
    const to = (toEl?.value || "").trim();

    if (q) {
      items = items.filter((t) => {
        const hay = normalize(`${t.title} ${t.place} ${t.alias || ""} ${t.body}`);
        return hay.includes(q);
      });
    }

    if (place) {
      items = items.filter((t) => normalize(t.place).includes(place));
    }

    if (from || to) {
      items = items.filter((t) => inDateRange(String(t.date || ""), from, to));
    }

    // sort
    items.sort((a, b) => {
      const da = a.createdAt || 0;
      const db = b.createdAt || 0;
      return sortMode === "newest" ? db - da : da - db;
    });

    return items;
  }

  function paginate(items) {
    const total = Math.max(1, Math.ceil(items.length / pageSize));
    page = Math.min(Math.max(1, page), total);
    const start = (page - 1) * pageSize;
    const slice = items.slice(start, start + pageSize);
    return { slice, total };
  }

  function render(items, totalPages) {
    listEl.innerHTML = "";

    if (countEl) countEl.textContent = String(items.length ? getFilteredSorted().length : getFilteredSorted().length);

    if (!getFilteredSorted().length) {
      listEl.innerHTML = `<div class="card"><p class="muted">لا توجد شهادات مطابقة (أو لا توجد شهادات أصلًا).</p></div>`;
      if (pageNowEl) pageNowEl.textContent = "1";
      if (pageTotalEl) pageTotalEl.textContent = "1";
      return;
    }

    // Update page indicators
    if (pageNowEl) pageNowEl.textContent = String(page);
    if (pageTotalEl) pageTotalEl.textContent = String(totalPages);

    items.forEach((t) => {
      const card = document.createElement("article");
      card.className = "card tcard";
      card.innerHTML = `
        <h3 class="ttitle">${escapeHtml(t.title)}</h3>
        <div class="tmeta">
          <span>📅 ${escapeHtml(t.date)}</span>
          <span>📍 ${escapeHtml(t.place)}</span>
          ${t.alias ? `<span>👤 ${escapeHtml(t.alias)}</span>` : ""}
        </div>
        <p class="tbody">${escapeHtml(t.body)}</p>
        <div class="actions-row">
          <button class="btn btn--ghost btn--small" data-copy="${escapeHtml(t.id)}">نسخ</button>
          <button class="btn btn--ghost btn--small" data-del="${escapeHtml(t.id)}">حذف</button>
        </div>
      `;
      listEl.appendChild(card);
    });
  }

  function rerender() {
    const all = getFilteredSorted();
    const { slice, total } = paginate(all);
    if (countEl) countEl.textContent = String(all.length);
    if (pageNowEl) pageNowEl.textContent = String(page);
    if (pageTotalEl) pageTotalEl.textContent = String(total);
    render(slice, total);

    // enable/disable nav
    if (prevBtn) prevBtn.disabled = page <= 1;
    if (nextBtn) nextBtn.disabled = page >= total;
    if (prevBtn) prevBtn.style.opacity = prevBtn.disabled ? ".55" : "1";
    if (nextBtn) nextBtn.style.opacity = nextBtn.disabled ? ".55" : "1";
  }

  // Input listeners
  [qEl, placeEl, fromEl, toEl].forEach((el) => {
    el?.addEventListener("input", () => {
      page = 1;
      rerender();
    });
  });

  // Prev/Next
  prevBtn?.addEventListener("click", () => {
    page -= 1;
    rerender();
  });
  nextBtn?.addEventListener("click", () => {
    page += 1;
    rerender();
  });

  // Delegated actions: copy / delete
  listEl.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const copyId = btn.getAttribute("data-copy");
    const delId = btn.getAttribute("data-del");

    if (copyId) {
      const all = loadAll();
      const item = all.find((x) => x.id === copyId);
      if (!item) return;

      const text =
`العنوان: ${item.title}
التاريخ: ${item.date}
المكان: ${item.place}
${item.alias ? `الاسم المستعار: ${item.alias}\n` : ""}النص:
${item.body}`;

      try {
        await navigator.clipboard.writeText(text);
        alert("تم النسخ ✅");
      } catch {
        alert("لم يتم النسخ (المتصفح يمنع).");
      }
    }

    if (delId) {
      const ok = confirm("حذف هذه الشهادة محليًا؟");
      if (!ok) return;
      const all = loadAll().filter((x) => x.id !== delId);
      saveAll(all);
      rerender();
    }
  });

  // Export JSON
  exportBtn?.addEventListener("click", () => {
    const data = loadAll();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "noor-al-qulub-archive.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  });

  // Import JSON
  importBtn?.addEventListener("click", () => importFile?.click());
  importFile?.addEventListener("change", async () => {
    const file = importFile.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (!Array.isArray(data)) {
        alert("ملف غير صالح: يجب أن يكون JSON Array.");
        return;
      }

      // Normalize items, keep only allowed fields
      const clean = data
        .map((x) => ({
          id: String(x.id || ("t_import_" + Math.random().toString(16).slice(2))),
          title: String(x.title || "").trim(),
          date: String(x.date || "").trim(),
          place: String(x.place || "").trim(),
          alias: String(x.alias || "").trim(),
          body: String(x.body || "").trim(),
          createdAt: Number(x.createdAt || Date.now())
        }))
        .filter((x) => x.title && x.date && x.place && x.body);

      if (!clean.length) {
        alert("لا توجد عناصر صالحة للاستيراد.");
        return;
      }

      const ok = confirm(`سيتم دمج ${clean.length} شهادة مع السجل الحالي. موافق؟`);
      if (!ok) return;

      const current = loadAll();

      // Merge by id (avoid duplicates)
      const map = new Map(current.map((t) => [t.id, t]));
      clean.forEach((t) => map.set(t.id, t));

      saveAll(Array.from(map.values()).sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));

      // reset file input
      importFile.value = "";
      page = 1;
      rerender();
      alert("تم الاستيراد ✅");
    } catch {
      alert("فشل الاستيراد: الملف ليس JSON صحيح.");
    }
  });

  // Clear all
  clearBtn?.addEventListener("click", () => {
    const ok = confirm("مسح كل الشهادات من هذا الجهاز؟");
    if (!ok) return;
    localStorage.removeItem(STORAGE_KEY);
    page = 1;
    rerender();
  });

  // Init
  rerender();
})();