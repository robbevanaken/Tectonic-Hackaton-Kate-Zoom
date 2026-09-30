// Injected into every recorded page (plain JS: tsx would add helpers that do not exist in the browser).
// Hides payday wording, the "Link 1×" hint and the KBC-vs-Bolero picker; draws tap ripples.
(() => {
  const RULES = [
    { re: /payday|salary/i, closest: "li, b, span.block, div.flex.items-start" },
    { re: /^End of the month$/, closest: "span.rounded-full, span" },
    { re: /Link 1×/, closest: "span.flex" },
  ];
  const hide = (root) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const text = (n.textContent ?? "").trim();
      const rule = RULES.find((r) => r.re.test(text));
      if (!rule) continue;
      const el = (rule.closest && n.parentElement?.closest(rule.closest)) || n.parentElement;
      if (el instanceof HTMLElement) el.style.display = "none";
    }
    // The Beleggen screen shows KBC-managed vs Bolero; the video only shows Bolero.
    document.querySelectorAll("h2").forEach((h) => {
      if (h.textContent?.trim() === "Where do you invest?" && h.dataset.hidden !== "1" && window.__hidePlatform) {
        h.dataset.hidden = "1";
        h.style.display = "none";
        h.nextElementSibling?.style.setProperty("display", "none");
      }
    });
  };
  new MutationObserver((muts) => muts.forEach((m) => m.addedNodes.forEach(hide))).observe(document, { childList: true, subtree: true, characterData: true });
  setInterval(() => document.body && hide(document.body), 50);

  const style = document.createElement("style");
  style.textContent = `
    .kz-tap{position:fixed;z-index:99999;width:44px;height:44px;margin:-22px 0 0 -22px;border-radius:50%;
      background:rgba(0,121,193,.28);border:2px solid rgba(0,121,193,.6);pointer-events:none;animation:kz-tap .55s ease-out forwards}
    @keyframes kz-tap{from{transform:scale(.4);opacity:1}to{transform:scale(1.5);opacity:0}}
    *{scrollbar-width:none} ::-webkit-scrollbar{display:none}`;
  document.addEventListener("DOMContentLoaded", () => document.head.appendChild(style));
  document.addEventListener("pointerdown", (e) => {
    const d = document.createElement("div");
    d.className = "kz-tap";
    d.style.left = `${e.clientX}px`;
    d.style.top = `${e.clientY}px`;
    document.body.appendChild(d);
    setTimeout(() => d.remove(), 700);
  }, true);
})();
