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

   function initPerformance(orders) {
    const SHOW_PERFORMANCE_AVERAGE = true;
  const panel = document.querySelector(".performance-panel");
  const heading = panel?.querySelector(".panel-heading");
  const periodSelect = $("performancePeriod");
  const monthSelect = $("performanceMonth");
  const yearSelect = $("performanceYear");

  if (!panel || !periodSelect || !monthSelect || !yearSelect) {
    return;
  }

  // إنشاء جسم قابل للطي للمؤشر.
  let body = $("performanceBody");

  if (!body && heading) {
    body = document.createElement("div");
    body.id = "performanceBody";
    body.className = "performance-body";

    Array.from(panel.children).forEach((child) => {
      if (child !== heading) {
        body.appendChild(child);
      }
    });

    panel.appendChild(body);
  }

  // زر إظهار وإخفاء المؤشر.
  if (heading) {
    // زر إظهار وإخفاء المؤشر في أسفل القسم.
let toggleButton = $("performanceToggle");

if (!toggleButton) {
  toggleButton = document.createElement("button");
  toggleButton.type = "button";
  toggleButton.id = "performanceToggle";
  toggleButton.className = "performance-toggle";
  toggleButton.setAttribute("aria-controls", "performanceBody");
}

// ضمان وجود الزر في أسفل القسم، وليس داخل العنوان.
panel.appendChild(toggleButton);

function updateToggle(collapsed) {
  panel.classList.toggle("performance-collapsed", collapsed);

  toggleButton.setAttribute(
    "aria-expanded",
    String(!collapsed)
  );

 toggleButton.innerHTML = collapsed
  ? `<svg class="performance-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>`
  : `<svg class="performance-toggle-icon" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m18 15-6-6-6 6"/></svg>`;
}

toggleButton.addEventListener("click", () => {
  updateToggle(
    !panel.classList.contains("performance-collapsed")
  );
});

// إخفاء المؤشر افتراضيًا عند دخول الصفحة.
updateToggle(true);
  }

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth =
    `${currentYear}-${String(now.getMonth() + 1).padStart(2, "0")}`;

  const validOrders = orders.filter((order) => {
    const date = new Date(order.addedAt);
    return Number.isFinite(date.getTime());
  });

  // تحديد تاريخ أول طلب مؤهل.
  const firstOrderDate = validOrders.length
    ? new Date(
        Math.min(...validOrders.map((order) => new Date(order.addedAt).getTime()))
      )
    : null;

  const firstYear = firstOrderDate
    ? firstOrderDate.getFullYear()
    : currentYear;

  const firstMonth = firstOrderDate
    ? `${firstOrderDate.getFullYear()}-${String(
        firstOrderDate.getMonth() + 1
      ).padStart(2, "0")}`
    : currentMonth;

  const monthFormatter = new Intl.DateTimeFormat("en-SA", {
    month: "long",
    year: "numeric",
    calendar: "gregory"
  });

  // عرض الأشهر من الشهر الحالي إلى شهر أول طلب فقط.
  const monthOptions = [];

  let cursor = new Date(currentYear, now.getMonth(), 1);
  const firstMonthDate = new Date(
    firstOrderDate
      ? firstOrderDate.getFullYear()
      : currentYear,
    firstOrderDate
      ? firstOrderDate.getMonth()
      : now.getMonth(),
    1
  );

  while (cursor >= firstMonthDate) {
    const value =
      `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, "0")}`;

    monthOptions.push({
      value,
      label: monthFormatter.format(cursor)
    });

    cursor = new Date(
      cursor.getFullYear(),
      cursor.getMonth() - 1,
      1
    );
  }

  monthSelect.innerHTML = monthOptions
    .map((item) =>
      `<option value="${item.value}">${item.label}</option>`
    )
    .join("");

  monthSelect.value = currentMonth;

  // عرض السنوات من السنة الحالية إلى سنة أول طلب.
  const years = [];

  for (let year = currentYear; year >= firstYear; year--) {
    years.push(year);
  }

  yearSelect.innerHTML = years
    .map((year) => `<option value="${year}">${year}</option>`)
    .join("");

  yearSelect.value = String(currentYear);

  const averageCard = $("performanceAverage")?.closest(".performance-kpi");
  const averageTitle = averageCard?.querySelector("span");
  const averageDescription = averageCard?.querySelector("small");

  function render() {
    const period = periodSelect.value;
    const selectedMonth = monthSelect.value;
    const selectedYear = Number(yearSelect.value);

    monthSelect.hidden = period !== "month";
    yearSelect.hidden = period !== "year";

    const filtered = validOrders.filter((order) => {
      const date = new Date(order.addedAt);

      if (period === "month") {
        const key =
          `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

        return key === selectedMonth;
      }

      if (period === "year") {
        return date.getFullYear() === selectedYear;
      }

      return true;
    });

    const totalCommission = filtered.reduce(
      (sum, order) => sum + order.commission,
      0
    );

    const ordersElement = $("performanceOrders");

if (ordersElement) {
  ordersElement.textContent =
    new Intl.NumberFormat("en-SA").format(filtered.length);
}

    $("performanceCommission").textContent =
      window.YEAffiliate.formatMoney(totalCommission);

    // تغيير المتوسط وفق الفترة المختارة.
    let average = 0;

    if (period === "month") {
      const [year, month] = selectedMonth.split("-").map(Number);

const isCurrentMonth =
  year === now.getFullYear() &&
  month === now.getMonth() + 1;

const daysToDivide = isCurrentMonth
  ? now.getDate()
  : new Date(year, month, 0).getDate();

average = daysToDivide > 0
  ? totalCommission / daysToDivide
  : 0;

      if (averageTitle) {
        averageTitle.textContent = "المتوسط اليومي";
      }

      if (averageDescription) {
        averageDescription.textContent = "متوسط أرباحك اليومية";
      }
    } else if (period === "year") {
  const monthsToDivide =
    selectedYear === currentYear
      ? now.getMonth() + 1
      : 12;

  average = totalCommission / monthsToDivide;

      if (averageTitle) {
        averageTitle.textContent = "المتوسط الشهري";
      }

      if (averageDescription) {
        averageDescription.textContent = "متوسط أرباحك الشهرية";
      }
    } else {
      const yearCount = currentYear - firstYear + 1;

      average = yearCount > 0 ? totalCommission / yearCount : 0;

      if (averageTitle) {
        averageTitle.textContent = "المتوسط السنوي";
      }

      if (averageDescription) {
        averageDescription.textContent = "متوسط أرباحك السنوية";
      }
    }

    $("performanceAverage").textContent =
      window.YEAffiliate.formatMoney(average);

    $("performanceChartTitle").textContent =
      period === "month"
        ? "الطلبات اليومية خلال الشهر"
        : period === "year"
          ? "نشاط الطلبات خلال السنة"
          : "نشاط الطلبات عبر السنوات";

    const buckets = new Map();

    if (period === "month") {
      const [year, month] = selectedMonth.split("-").map(Number);
      const daysInMonth = new Date(year, month, 0).getDate();

      // في شهر أول طلب، لا تعرض الأيام السابقة لأول طلب.
      const startDay =
        firstOrderDate &&
        firstOrderDate.getFullYear() === year &&
        firstOrderDate.getMonth() + 1 === month
          ? firstOrderDate.getDate()
          : 1;

      for (let day = startDay; day <= daysInMonth; day++) {
        buckets.set(String(day), 0);
      }

      filtered.forEach((order) => {
        const day = new Date(order.addedAt).getDate();
        const key = String(day);

        if (buckets.has(key)) {
          buckets.set(key, buckets.get(key) + 1);
        }
      });
    } else if (period === "year") {
      const monthFormatterShort = new Intl.DateTimeFormat("en-SA", {
        month: "short",
        calendar: "gregory"
      });

      const startMonth =
        firstOrderDate && firstOrderDate.getFullYear() === selectedYear
          ? firstOrderDate.getMonth()
          : 0;

      for (let month = startMonth; month < 12; month++) {
        const label = monthFormatterShort.format(
          new Date(selectedYear, month, 1)
        );

        buckets.set(label, 0);
      }

      filtered.forEach((order) => {
        const date = new Date(order.addedAt);
        const label = monthFormatterShort.format(
          new Date(date.getFullYear(), date.getMonth(), 1)
        );

        if (buckets.has(label)) {
          buckets.set(label, buckets.get(label) + 1);
        }
      });
    } else {
      // تضمين السنوات الواقعة بين أول طلب والسنة الحالية.
      for (let year = firstYear; year <= currentYear; year++) {
        buckets.set(String(year), 0);
      }

      filtered.forEach((order) => {
        const year = String(new Date(order.addedAt).getFullYear());

        if (buckets.has(year)) {
          buckets.set(year, buckets.get(year) + 1);
        }
      });
    }

    const maxValue = Math.max(1, ...buckets.values());

    $("performanceChart").innerHTML = filtered.length
      ? [...buckets.entries()]
          .map(([label, count]) => `
            <div class="performance-bar-row">
              <span class="performance-bar-label">${label}</span>
              <div class="performance-bar-track">
                <div
                  class="performance-bar-fill"
                  style="width:${(count / maxValue) * 100}%"
                ></div>
              </div>
              <span class="performance-bar-value">${count}</span>
            </div>
          `)
          .join("")
      : '<div class="performance-empty">لا توجد طلبات مؤهلة خلال هذه الفترة</div>';

    $("performanceChartCaption").textContent =
      period === "month"
        ? `${buckets.size} يومًا`
        : period === "year"
          ? `${buckets.size} شهرًا`
          : `${buckets.size} سنة`;
  }

  periodSelect.addEventListener("change", render);
  monthSelect.addEventListener("change", render);
  yearSelect.addEventListener("change", render);

  render();
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
    initPerformance(eligibleOrders);

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
