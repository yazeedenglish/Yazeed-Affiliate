(function () {
  const session = window.YEAffiliate.getSession();
  if (!session || !session.code) {
    window.location.replace("../login/");
    return;
  }

  const $ = (id) => document.getElementById(id);
  document.querySelectorAll("[data-current-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  function emptyState(icon, title, description) {
    return `<div class="empty-state"><div class="empty-icon" aria-hidden="true">${icon}</div><strong>${window.YEAffiliate.escapeHtml(title)}</strong><p>${window.YEAffiliate.escapeHtml(description)}</p></div>`;
  }

let currentOrdersPage = 1;
const ordersPerPage = 20;

function renderOrders(orders) {
  const ordersContent = $("ordersContent");
  const totalPages = Math.ceil(orders.length / ordersPerPage);

  // Keep the current page valid when the number of orders changes.
  currentOrdersPage = Math.max(1, Math.min(currentOrdersPage, totalPages || 1));

  $("ordersCount").textContent = String(orders.length);

  if (!orders.length) {
    ordersContent.innerHTML = emptyState(
      "▤",
      "لا توجد طلبات حتى الآن",
      "ستظهر طلباتك هنا بعد انتهاء فترة الضمان الذهبي"
    );
    return;
  }

  const startIndex = (currentOrdersPage - 1) * ordersPerPage;
  const pageOrders = orders.slice(startIndex, startIndex + ordersPerPage);

  const rows = pageOrders.map((order) => {
    const status =
      order.status === "refunded"
        ? '<span class="status-pill refunded">مسترجع</span>'
        : '<span class="status-pill">مكتمل</span>';

    return `<tr>
      <td>${window.YEAffiliate.escapeHtml(order.product || "منتج")}</td>
      <td>${window.YEAffiliate.formatDate(order.addedAt)}</td>
      <td class="amount">${window.YEAffiliate.formatMoney(order.commission)}</td>
      <td>${status}</td>
    </tr>`;
  }).join("");

  let pagination = "";

  if (totalPages > 1) {
  let pageButtons = "";

  for (let page = totalPages; page >= 1; page--) {
    pageButtons += `
      <button
        type="button"
        class="page-btn ${page === currentOrdersPage ? "active" : ""}"
        data-orders-page="${page}"
        ${page === currentOrdersPage ? 'aria-current="page"' : ""}
      >${page}</button>`;
  }

  pagination = `
    <div class="pagination" aria-label="صفحات الطلبات">
      <button
        type="button"
        class="page-btn"
        data-orders-page="${currentOrdersPage - 1}"
        ${currentOrdersPage === 1 ? "disabled" : ""}
      >السابق</button>

      <span class="page-numbers">${pageButtons}</span>

      <button
        type="button"
        class="page-btn"
        data-orders-page="${currentOrdersPage + 1}"
        ${currentOrdersPage === totalPages ? "disabled" : ""}
      >التالي</button>
    </div>`;
}

  ordersContent.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
        <thead>
          <tr>
            <th>المنتج</th>
            <th>تاريخ الطلب</th>
            <th>العمولة</th>
            <th>الحالة</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    ${pagination}
  `;

  ordersContent.querySelectorAll("[data-orders-page]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.disabled) return;

      currentOrdersPage = Number(button.dataset.ordersPage);
      renderOrders(orders);
    });
  });
}

  function renderTransfers(transfers) {
    $("transfersCount").textContent = String(transfers.length);
    if (!transfers.length) {
      $("transfersContent").innerHTML = emptyState("↔", "لا توجد حوالات حتى الآن", "ستظهر هنا تواريخ ومبالغ الحوالات البنكية التي تم تسجيلها");
      return;
    }
    const rows = transfers.slice().sort((a, b) => new Date(b.date) - new Date(a.date)).map((transfer) =>
      `<tr><td>${window.YEAffiliate.formatDate(transfer.date)}</td><td class="amount">${window.YEAffiliate.formatMoney(transfer.amount)}</td></tr>`
    ).join("");
    $("transfersContent").innerHTML = `<div class="table-wrap"><table class="data-table"><thead><tr><th>تاريخ الحوالة</th><th>المبلغ المحوّل</th></tr></thead><tbody>${rows}</tbody></table></div>`;
  }

  async function init() {
    try {
      const response = await fetch(`../data/affiliates/${encodeURIComponent(session.code)}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error("missing-partner");
      const partner = await response.json();
      if (String(partner.code || "").toUpperCase() !== String(session.code).toUpperCase() || partner.active === false) throw new Error("invalid-partner");

      $("partnerName").textContent = partner.name || "الشريك";
      const now = Date.now();
      const warrantyDays = Number(partner.warrantyDays) || 15;
      const eligibleOrders = (Array.isArray(partner.orders) ? partner.orders : []).filter((order) => {
        const addedAt = new Date(order.addedAt).getTime();
        if (!Number.isFinite(addedAt)) return false;
        const warrantyEndsAt = addedAt + warrantyDays * 24 * 60 * 60 * 1000;
        if (now < warrantyEndsAt) return false;
        // A refund recorded during the warranty excludes the order.
        // A refund recorded after the warranty does not automatically reverse earned commission.
        if (order.status === "refunded") {
          const refundedAt = new Date(order.refundedAt || "").getTime();
          if (!Number.isFinite(refundedAt) || refundedAt <= warrantyEndsAt) return false;
        }
        return true;
      });
      const transfers = Array.isArray(partner.transfers) ? partner.transfers : [];
      const eligibleCommission = eligibleOrders.reduce((sum, order) => sum + (Number(order.commission) || 0), 0);
      const transferredTotal = transfers.reduce((sum, transfer) => sum + Math.max(0, Number(transfer.amount) || 0), 0);
      const availableBalance = Math.max(0, eligibleCommission - transferredTotal);

      $("totalSales").textContent = new Intl.NumberFormat("en-SA").format(eligibleOrders.length);
      $("transferredTotal").textContent = window.YEAffiliate.formatMoney(transferredTotal);
      $("availableBalance").textContent = window.YEAffiliate.formatMoney(availableBalance);
      renderOrders(eligibleOrders);
      renderTransfers(transfers);
    } catch (_) {
      $("partnerName").textContent = "الشريك";
      $("ordersContent").innerHTML = emptyState("!", "تعذر تحميل البيانات", "تحقق من وجود ملف JSON للشريك وصحة تنسيقه");
      $("transfersContent").innerHTML = "";
      const note = $("dashboardMessage");
      note.hidden = false;
      note.textContent = "تعذر تحميل ملف بيانات الشريك. تأكد من تشغيل الموقع عبر استضافة أو خادم محلي يدعم fetch، وليس بفتح ملف HTML مباشرة";
    }
  }

  init();
})();
