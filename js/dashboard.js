(function () {
  const session = window.YEAffiliate.getSession();
  if (!session || !session.code) {
    window.location.replace("../login/");
    return;
  }

  const $ = (id) => document.getElementById(id);
  const copyCouponButton = $("copyCouponButton");

if (copyCouponButton) {
copyCouponButton.addEventListener("click", async () => {
const couponCode = $("couponCode").textContent.trim();
const message = $("couponMessage");

  if (!couponCode || copyCouponButton.disabled) return;

  try {
    await navigator.clipboard.writeText(couponCode);

    copyCouponButton.disabled = true;
    copyCouponButton.setAttribute("aria-label", "تم نسخ كود الخصم");
    copyCouponButton.setAttribute("title", "تم نسخ كود الخصم");

    message.textContent = "";
  } catch (error) {
    message.textContent =
      "تعذر النسخ تلقائيًا. حاول مرة أخرى.";
  }
});

}
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

      <div class="page-numbers-scroll">
  <span class="page-numbers">${pageButtons}</span>
</div>

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
    // Load product definitions
    const productsResponse = await fetch("../data/affiliates/products.json", {
      cache: "no-store"
    });

    if (!productsResponse.ok) {
      throw new Error("Could not load products.json");
    }

    const products = await productsResponse.json();

    // Load partner data
    const response = await fetch(
      `../data/affiliates/${encodeURIComponent(session.code)}.json`,
      { cache: "no-store" }
    );

    if (!response.ok) {
      throw new Error("Could not load partner JSON");
    }

    const partner = await response.json();

    if (
      String(partner.code || "").toUpperCase() !==
        String(session.code).toUpperCase() ||
      partner.active === false
    ) {
      throw new Error("Invalid or inactive partner");
    }

    $("partnerName").textContent = partner.name || "الشريك";
     const couponCode = String(partner.couponCode || "").trim();

    $("couponCode").textContent = couponCode || "غير مخصص";
    $("copyCouponButton").disabled = !couponCode;

    if (!couponCode) {
      $("couponMessage").textContent =
        "";
    }

    const now = Date.now();

    // Filter orders using the existing warranty and refund rules
    const eligibleOrders = (
      Array.isArray(partner.orders) ? partner.orders : []
    )
      .filter((order) => {
        const addedAt = new Date(order.addedAt).getTime();

        if (!Number.isFinite(addedAt)) return false;

        const warrantyDays = Number(order.warrantyDays ?? 15);
const warrantyEndsAt = addedAt + warrantyDays * 24 * 60 * 60 * 1000;

        if (now < warrantyEndsAt) return false;

        // Refunds during the warranty period exclude the order.
        // Refunds after the warranty do not automatically reverse commission.
        if (order.status === "refunded") {
          const refundedAt = new Date(
            order.refundedAt || ""
          ).getTime();

          if (
            !Number.isFinite(refundedAt) ||
            refundedAt <= warrantyEndsAt
          ) {
            return false;
          }
        }

        return true;
      })
      .map((order) => {
        // Find the product using its ID in products.json
        const product = products[order.productId];

        // Use the recorded sale price when provided.
        // Otherwise, use the product's price from products.json.
        const hasSalePrice =
          order.salePrice !== undefined &&
          order.salePrice !== null &&
          order.salePrice !== "";

        const salePrice = hasSalePrice
          ? Number(order.salePrice)
          : Number(product?.price);

        if (
          !product ||
          !Number.isFinite(salePrice) ||
          salePrice < 0
        ) {
          throw new Error(
            `Invalid product or sale price: ${order.productId}`
          );
        }

        // Calculate commission as a percentage
        const orderCommissionRate = Number(order.commissionRate ?? 0);
const commission = Number(
  (salePrice * orderCommissionRate / 100).toFixed(2)
);

        return {
          ...order,
          product: product.name || "منتج",
          commission
        };
      });

    // Load recorded bank transfers
    const transfers = Array.isArray(partner.transfers)
      ? partner.transfers
      : [];

    // Calculate the total earned commission
    const eligibleCommission = eligibleOrders.reduce(
      (sum, order) => sum + order.commission,
      0
    );

    // Subtract transfers from the available balance
    const transferredTotal = transfers.reduce(
      (sum, transfer) =>
        sum + Math.max(0, Number(transfer.amount) || 0),
      0
    );

    const availableBalance = Math.max(
      0,
      eligibleCommission - transferredTotal
    );

    // Update dashboard figures
    $("totalSales").textContent = new Intl.NumberFormat(
      "en-SA"
    ).format(eligibleOrders.length);

    $("transferredTotal").textContent =
      window.YEAffiliate.formatMoney(transferredTotal);

    $("availableBalance").textContent =
      window.YEAffiliate.formatMoney(availableBalance);

    // Keep your existing pagination and table rendering
    renderOrders(eligibleOrders);
    renderTransfers(transfers);

  } catch (error) {
    console.error("Dashboard loading error:", error);

    $("partnerName").textContent = "الشريك";

    $("ordersContent").innerHTML = emptyState(
      "!",
      "تعذر تحميل البيانات",
      "تحقق من ملفات المنتجات وبيانات الشريك وتطابق معرفات المنتجات"
    );

    $("transfersContent").innerHTML = "";

    const note = $("dashboardMessage");
    note.hidden = false;
    note.textContent =
      "تعذر تحميل البيانات. تحقق من وجود products.json وملف الشريك الصحيح، ومن تطابق productId مع معرف المنتج.";
  }
}


  init();
})();
