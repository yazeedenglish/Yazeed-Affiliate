(function () {
  const THEME_KEY = "ye_affiliate_theme";
  const SESSION_KEY = "ye_affiliate_session";

  function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");

  const button = document.querySelector("[data-theme-toggle]");

  if (button) {
    button.innerHTML = theme === "dark"
      ? `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun-medium preview-icon"><circle cx="12" cy="12" r="4"/><path d="M12 3v1"/><path d="M12 20v1"/><path d="M3 12h1"/><path d="M20 12h1"/><path d="m18.364 5.636-.707.707"/><path d="m6.343 17.657-.707.707"/><path d="m5.636 5.636.707.707"/><path d="m17.657 17.657.707.707"/></svg>`
      : `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>`;

    button.setAttribute(
      "aria-label",
      theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
    );

    button.title = theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن";
  }
}

  function initTheme() {
    let theme = localStorage.getItem(THEME_KEY);
    if (!theme) theme = "light";
    applyTheme(theme);
    document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
      button.addEventListener("click", () => {
        theme = document.body.classList.contains("dark") ? "light" : "dark";
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
      });
    });
  }

  function initLogout() {
    document.querySelectorAll("[data-logout]").forEach((button) => {
      button.addEventListener("click", () => {
        localStorage.removeItem(SESSION_KEY);
        window.location.href = "../login/";
      });
    });
  }

  function formatMoney(value) {
    return new Intl.NumberFormat("en-SA", { style: "currency", currency: "SAR", maximumFractionDigits: 2 }).format(Number(value) || 0);
  }

  function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-SA", { year: "numeric", month: "short", day: "numeric" }).format(date);
  }

  function getSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY) || "null"); }
    catch (_) { return null; }
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]));
  }

  window.YEAffiliate = { initTheme, initLogout, formatMoney, formatDate, getSession, escapeHtml, SESSION_KEY };
  document.addEventListener("DOMContentLoaded", () => { initTheme(); initLogout(); });
})();
