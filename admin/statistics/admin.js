(() => {
  "use strict";

  const $ = (selector) => document.querySelector(selector);
  const state = { affiliates: [], products: {}, periodType: "month", periodValue: "", demo: false };
  const money = (value) => new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 2 }).format(Number(value) || 0);
  const number = (value) => new Intl.NumberFormat("en-SA", { maximumFractionDigits: 0 }).format(Number(value) || 0);
  const safe = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const dateOf = (value) => { const d = new Date(value); return Number.isNaN(d.getTime()) ? null : d; };
  const dateLabel = (value) => { const d = dateOf(value); return d ? new Intl.DateTimeFormat("en-SA", { year: "numeric", month: "short", day: "numeric" }).format(d) : "—"; };
  const keyForDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  const approved = (order) => String(order.status || "approved").toLowerCase() === "approved";
  const refunded = (order) => ["refunded", "cancelled", "canceled"].includes(String(order.status || "").toLowerCase());

  function productFor(order) { return state.products[order.productId] || { name: order.productId || "منتج غير معروف", price: 0 }; }
  function salePrice(order) {
    // Prefer the recorded order price; use products.json only if salePrice is absent.
    if (order.salePrice !== undefined && order.salePrice !== null && order.salePrice !== "" && Number.isFinite(Number(order.salePrice))) return Number(order.salePrice);
    return Number(productFor(order).price) || 0;
  }
  function commission(order) { return salePrice(order) * ((Number(order.commissionRate) || 0) / 100); }
  function warrantyEnded(order, now = new Date()) {
    const added = dateOf(order.addedAt);
    if (!added) return false;
    const days = Math.max(0, Number(order.warrantyDays) || 0);
    return now.getTime() >= added.getTime() + days * 86400000;
  }
  function allOrders() {
    const rows = [];
    state.affiliates.forEach((partner) => (Array.isArray(partner.orders) ? partner.orders : []).forEach((order, index) => {
      const date = dateOf(order.addedAt);
      rows.push({ ...order, date, partnerCode: partner.code || "", partnerName: partner.name || partner.code || "شريك", partnerActive: partner.active !== false, _index: index, sale: salePrice(order), commission: commission(order), product: productFor(order) });
    }));
    return rows;
  }
  function periodOrders() {
    return allOrders().filter((order) => {
      if (!order.date) return false;
      if (state.periodType === "all") return true;
      if (state.periodType === "year") return String(order.date.getFullYear()) === state.periodValue;
      return keyForDate(order.date) === state.periodValue;
    });
  }
  function formatStatus(status) {
    const s = String(status || "approved").toLowerCase();
    const map = { approved: ["معتمد", "approved"], pending: ["قيد المراجعة", "pending"], refunded: ["مسترد", "refunded"], cancelled: ["ملغي", "cancelled"], canceled: ["ملغي", "cancelled"] };
    return map[s] || [safe(status || "معتمد"), "pending"];
  }

  function refreshPeriodOptions() {
    const select = $("#periodValue");
    const type = $("#periodType").value;
    const dates = allOrders().map((o) => o.date).filter(Boolean).sort((a, b) => b - a);
    const old = select.value;
    let options = [];
    if (type === "year") {
      options = [...new Set(dates.map((d) => String(d.getFullYear())))];
      if (!options.length) options = [String(new Date().getFullYear())];
    } else if (type === "month") {
      options = [...new Set(dates.map(keyForDate))];
      if (!options.length) options = [keyForDate(new Date())];
    }
    select.hidden = type === "all";
    select.innerHTML = options.map((value) => {
      const label = type === "year" ? value : new Intl.DateTimeFormat("en-SA", { year: "numeric", month: "long" }).format(new Date(`${value}-01T12:00:00`));
      return `<option value="${safe(value)}">${safe(label)}</option>`;
    }).join("");
    if (options.includes(old)) select.value = old;
    else select.value = options[0] || "";
    state.periodType = type;
    state.periodValue = select.value;
  }

  function render() {
    const all = allOrders();
    const orders = periodOrders();
    const valid = orders.filter((o) => approved(o) && !refunded(o));
    const active = state.affiliates.filter((p) => p.active !== false).length;
    $("#activePartners").textContent = number(active);
    $("#partnerCountHint").textContent = `من إجمالي ${number(state.affiliates.length)} شريك`;
    $("#totalOrders").textContent = number(valid.length);
    $("#totalSales").textContent = money(valid.reduce((sum, o) => sum + o.sale, 0));
    const totalSales = valid.reduce((sum, o) => sum + o.sale, 0);
const totalCommissions = valid.reduce((sum, o) => sum + o.commission, 0);
const discountCost = totalSales * 0.10;

const storeProfit = totalSales - totalCommissions - discountCost;

$("#storeProfit").textContent = money(storeProfit);
    $("#earnedCommission").textContent = money(valid.filter((o) => warrantyEnded(o)).reduce((sum, o) => sum + o.commission, 0));

    const rankings = state.affiliates.map((partner) => {
      const partnerOrders = valid.filter((o) => o.partnerCode === partner.code);
      return { partner, count: partnerOrders.length, sales: partnerOrders.reduce((s, o) => s + o.sale, 0), commission: partnerOrders.filter((o) => warrantyEnded(o)).reduce((s, o) => s + o.commission, 0) };
    }).sort((a, b) => b.sales - a.sales || b.count - a.count || b.commission - a.commission);
    $("#rankingCount").textContent = `${number(rankings.length)} شركاء`;
    $("#rankingBody").innerHTML = rankings.length ? rankings.map((r, i) => `<tr><td><span class="rank-number">${number(i + 1)}</span></td><td class="partner-cell"><strong>${safe(r.partner.name || r.partner.code)}</strong><small>${safe(r.partner.code || "")}${r.partner.active === false ? " · غير نشط" : ""}</small></td><td>${number(r.count)}</td><td class="money">${money(r.sales)}</td><td class="money">${money(r.commission)}</td></tr>`).join("") : '<tr><td colspan="5" class="empty-cell">حمّل ملفات JSON لعرض الترتيب.</td></tr>';

    const byProduct = new Map();
    valid.forEach((o) => {
      const id = o.productId || "unknown";
      if (!byProduct.has(id)) byProduct.set(id, { name: o.product.name || id, count: 0, sales: 0 });
      const p = byProduct.get(id); p.count += 1; p.sales += o.sale;
    });
    const products = [...byProduct.values()].sort((a, b) => b.count - a.count || b.sales - a.sales);
    const max = Math.max(1, ...products.map((p) => p.count));
    $("#productPerformance").innerHTML = products.length ? products.map((p) => `<div class="product-row"><div><div class="product-name">${safe(p.name)}</div><div class="product-meta">${number(p.count)} طلب · ${money(p.sales)}</div></div><div class="product-value">${Math.round(p.count / max * 100)}%</div><div class="progress-track"><div class="progress-bar" style="width:${p.count / max * 100}%"></div></div></div>`).join("") : '<p class="empty-state">لا توجد مبيعات معتمدة ضمن هذه الفترة.</p>';

    const latest = [...orders].filter((o) => o.date).sort((a, b) => b.date - a.date).slice(0, 10);
    $("#ordersCount").textContent = `${number(latest.length)} طلبات`;
    $("#ordersBody").innerHTML = latest.length ? latest.map((o) => {
      const [label, cls] = formatStatus(o.status);
      return `<tr><td>${safe(o.id || "—")}</td><td>${safe(o.partnerName)}</td><td>${safe(o.product.name || o.productId || "—")}</td><td>${safe(dateLabel(o.addedAt))}</td><td class="money">${money(o.sale)}</td><td class="money">${money(o.commission)}</td><td><span class="status-pill ${cls}">${label}</span></td></tr>`;
    }).join("") : '<tr><td colspan="7" class="empty-cell">لا توجد طلبات ضمن الفترة المحددة.</td></tr>';
  }

  
  const DATA_BASE = "../../data/affiliates/";

  async function fetchJson(url) {
    const response = await fetch(url, { cache: "no-store" });
    if (!response.ok) throw new Error(`تعذر فتح ${url} (HTTP ${response.status})`);
    return response.json();
  }
  async function loadProjectData() {
    const button = $("#refreshData");
    button.disabled = true;
    button.textContent = "جارٍ تحميل البيانات…";
    status("جارٍ تحميل ملفات الشركاء والمنتجات من المشروع…");
    try {
      const [products, affiliateList] = await Promise.all([
  fetchJson(`${DATA_BASE}products.json`),
  fetchJson(".././affiliates.json")
]);

if (
  !affiliateList ||
  !Array.isArray(affiliateList.files) ||
  !affiliateList.files.every(
    (file) => typeof file === "string" && file.endsWith(".json")
  )
) {
  throw new Error("صيغة affiliates.json غير صحيحة.");
}

const loaded = await Promise.all(
  affiliateList.files.map((file) =>
    fetchJson(`${DATA_BASE}${encodeURIComponent(file)}`)
  )
);
      if (!products || typeof products !== "object" || Array.isArray(products)) throw new Error("صيغة products.json غير صحيحة.");
      const invalid = loaded.filter((p) => !p || typeof p !== "object" || !Array.isArray(p.orders));
      if (invalid.length) throw new Error("تأكد أن كل ملف شريك يحتوي على مصفوفة orders.");
      const seen = new Set();
      for (const p of loaded) {
        const code = String(p.code || "").toUpperCase();
        if (!code) throw new Error("يوجد ملف شريك لا يحتوي على code.");
        if (seen.has(code)) throw new Error(`رمز الشريك ${code} مكرر في قائمة الملفات.`);
        seen.add(code);
      }
      state.products = products;
      state.affiliates = loaded;
      state.demo = false;
      refreshPeriodOptions();
      render();
      status(`تم تحميل ${number(loaded.length)} ملف شريك و${number(Object.keys(products).length)} منتجات تلقائيًا من المشروع.`);
    } catch (error) {
      state.affiliates = [];
      state.products = {};
      refreshPeriodOptions();
      render();
      status(`تعذر تحميل البيانات تلقائيًا: ${error.message || "تأكد من مسارات الملفات وأسمائها."} — إذا فتحت الصفحة مباشرة من جهازك، افتحها عبر رابط GitHub Pages.`, true);
    } finally {
      button.disabled = false;
      button.textContent = "تحديث البيانات";
    }

    document.getElementById("logoutButton")?.addEventListener("click", () => {
  localStorage.removeItem("ye_admin_login_expiry");
  window.location.replace("../");
});

  }
  function status(message, isError = false) {
    $("#importStatus").textContent = message;
    $("#importStatus").style.color = isError ? "#C94C4C" : "";
  }
  $("#refreshData").addEventListener("click", loadProjectData);
  $("#periodType").addEventListener("change", () => { refreshPeriodOptions(); render(); });
  $("#periodValue").addEventListener("change", (event) => { state.periodValue = event.target.value; render(); });
  $("#themeToggle").addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("ye_admin_theme", next); } catch (_) {}
    $("#themeToggle").textContent = next === "dark" ? "☀" : "◐";
  });
  try { const saved = localStorage.getItem("ye_admin_theme"); if (saved === "dark") { document.documentElement.dataset.theme = "dark"; $("#themeToggle").textContent = "☀"; } } catch (_) {}
  $("#currentYear").textContent = new Date().getFullYear();
  refreshPeriodOptions(); render();
  loadProjectData();
})();
