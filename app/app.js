// FridayList — renders the deal board, its filters and its deal pages.
// All data lives in data.js; nothing is fetched from the network.
import { deals, CHECKED_AT } from "./data.js";

const VERDICT_LABEL = {
  "new-low": "NEW LOW",
  strong: "STRONG DEAL",
  routine: "ROUTINE SALE",
};
const VERDICT_RANK = { "new-low": 0, strong: 1, routine: 2 };

const listEl = document.getElementById("list");
const detailEl = document.getElementById("detail");
const countEl = document.getElementById("count");
const statsEl = document.getElementById("stats");
const qEl = document.getElementById("q");
const catEl = document.getElementById("category");
const storeEl = document.getElementById("store");
const discEl = document.getElementById("mindisc");
const sortEl = document.getElementById("sort");
const lowsEl = document.getElementById("newlows");

export function discountOf(d) {
  return Math.round((1 - d.price / d.was) * 100);
}

export function savingOf(d) {
  return Math.round((d.was - d.price) * 100) / 100;
}

export function money(n) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

export function checkedLabel(iso) {
  const d = new Date(iso);
  return d.toLocaleString("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC",
  }) + " UTC";
}

function option(select, value, label) {
  const o = document.createElement("option");
  o.value = value;
  o.textContent = label;
  select.appendChild(o);
}

function fillFilters() {
  const cats = [...new Set(deals.map((d) => d.category))].sort();
  option(catEl, "", "All categories");
  cats.forEach((c) => option(catEl, c, c));
  const stores = [...new Set(deals.map((d) => d.store))].sort();
  option(storeEl, "", "All stores");
  stores.forEach((s) => option(storeEl, s, s));
}

function currentFilters() {
  return {
    q: qEl.value.trim().toLowerCase(),
    category: catEl.value,
    store: storeEl.value,
    mindisc: Number(discEl.value),
    sort: sortEl.value,
    newlows: lowsEl.checked,
  };
}

export function applyFilters(all, f) {
  let out = all.filter((d) => {
    if (f.category && d.category !== f.category) return false;
    if (f.store && d.store !== f.store) return false;
    if (discountOf(d) < f.mindisc) return false;
    if (f.newlows && d.signal !== "new-low") return false;
    if (f.q) {
      const hay = (d.title + " " + d.store + " " + d.category).toLowerCase();
      if (!f.q.split(/\s+/).every((w) => hay.includes(w))) return false;
    }
    return true;
  });
  const by = {
    verdict: (a, b) =>
      VERDICT_RANK[a.signal] - VERDICT_RANK[b.signal] ||
      discountOf(b) - discountOf(a),
    discount: (a, b) => discountOf(b) - discountOf(a),
    saving: (a, b) => savingOf(b) - savingOf(a),
    "price-asc": (a, b) => a.price - b.price,
    "price-desc": (a, b) => b.price - a.price,
  };
  return out.sort(by[f.sort] || by.verdict);
}

function cardHTML(d) {
  const pct = discountOf(d);
  const also = d.alsoAt
    ? `<p class="also">Also at ${d.alsoAt.map((a) => `${a.store} ${money(a.price)}`).join(" · ")}.</p>`
    : "";
  return `<article class="card">
    <div class="meta"><span class="badge store">${d.store}</span><span class="badge">${d.category}</span></div>
    <h3><a href="#/deal/${d.id}">${d.title}</a></h3>
    <div class="price-row"><span class="now">${money(d.price)}</span><span class="was">${money(d.was)}</span><span class="off">−${pct}%</span></div>
    <p class="save">You save ${money(savingOf(d))}</p>
    <p class="verdict"><span class="v-${d.signal}">${VERDICT_LABEL[d.signal]}</span> ${d.note}</p>
    ${also}
    <p class="source">Checked ${checkedLabel(d.checked)} · ${d.source}</p>
    <a class="cta" href="${d.url}" target="_blank" rel="noopener">View at ${d.store} →</a>
    <p class="detail-link"><a href="#/deal/${d.id}">Deal details</a></p>
  </article>`;
}

function renderStats() {
  const total = deals.length;
  const avg = Math.round(deals.reduce((s, d) => s + discountOf(d), 0) / total);
  const lows = deals.filter((d) => d.signal === "new-low").length;
  const best = Math.max(...deals.map((d) => savingOf(d)));
  statsEl.innerHTML = [
    [total, "verified deals"],
    [avg + "%", "average discount"],
    [lows, "all-time lows"],
    [money(best), "biggest single saving"],
  ]
    .map(([b, l]) => `<div class="stat"><b>${b}</b><span>${l}</span></div>`)
    .join("");
}

export function renderList() {
  const rows = applyFilters(deals, currentFilters());
  countEl.textContent =
    rows.length === deals.length
      ? `Showing all ${rows.length} deals, best verdict first.`
      : `Showing ${rows.length} of ${deals.length} deals.`;
  listEl.innerHTML = rows.length
    ? rows.map(cardHTML).join("")
    : `<p class="empty">No deals match those filters. Loosen the search or the discount filter.</p>`;
  listEl.hidden = false;
  detailEl.hidden = true;
}

function renderDetail(id) {
  const d = deals.find((x) => x.id === id);
  if (!d) {
    location.hash = "#/";
    return;
  }
  const pct = discountOf(d);
  const also = d.alsoAt
    ? `<li><b>Also at</b> ${d.alsoAt.map((a) => `${a.store} — ${money(a.price)}`).join("; ")}</li>`
    : "";
  detailEl.innerHTML = `
    <a class="back" href="#/">← Back to all deals</a>
    <div class="meta"><span class="badge store">${d.store}</span><span class="badge">${d.category}</span></div>
    <h2>${d.title}</h2>
    <div class="price-row"><span class="now">${money(d.price)}</span><span class="was">${money(d.was)}</span><span class="off">−${pct}%</span></div>
    <p class="save">You save ${money(savingOf(d))} off the usual price.</p>
    <p class="verdict"><span class="v-${d.signal}">${VERDICT_LABEL[d.signal]}</span> ${d.note}</p>
    <ul class="facts">
      <li><b>Store</b> ${d.store}</li>
      <li><b>Category</b> ${d.category}</li>
      <li><b>Sale price</b> ${money(d.price)}</li>
      <li><b>Usual price</b> ${money(d.was)}</li>
      <li><b>Discount</b> ${pct}% — save ${money(savingOf(d))}</li>
      <li><b>Price checked</b> ${checkedLabel(d.checked)}</li>
      <li><b>Where checked</b> ${d.source}</li>
      ${also}
    </ul>
    <a class="cta" href="${d.url}" target="_blank" rel="noopener">View at ${d.store} →</a>`;
  listEl.hidden = true;
  detailEl.hidden = false;
  countEl.textContent = "";
  window.scrollTo(0, 0);
}

function route() {
  const m = location.hash.match(/^#\/deal\/([\w-]+)$/);
  if (m) renderDetail(m[1]);
  else renderList();
}

// A filtered view can be shared as a link: ?category=Audio&store=Amazon
// &mindisc=30&sort=discount&q=macbook&newlows=1 presets the controls.
function presetFromURL() {
  const p = new URLSearchParams(location.search);
  if (p.get("category") && [...catEl.options].some((o) => o.value === p.get("category"))) catEl.value = p.get("category");
  if (p.get("store") && [...storeEl.options].some((o) => o.value === p.get("store"))) storeEl.value = p.get("store");
  if (p.get("mindisc") && [...discEl.options].some((o) => o.value === p.get("mindisc"))) discEl.value = p.get("mindisc");
  if (p.get("sort") && [...sortEl.options].some((o) => o.value === p.get("sort"))) sortEl.value = p.get("sort");
  if (p.get("q")) qEl.value = p.get("q");
  if (p.get("newlows") === "1") lowsEl.checked = true;
}

[qEl, catEl, storeEl, discEl, sortEl, lowsEl].forEach((el) =>
  el.addEventListener("input", renderList),
);
window.addEventListener("hashchange", route);

fillFilters();
presetFromURL();
renderStats();
route();
