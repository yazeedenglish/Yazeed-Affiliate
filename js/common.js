(function () {
  const THEME_KEY = "ye_affiliate_theme";
  const SESSION_KEY = "ye_affiliate_session";

  function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      button.textContent = theme === "dark" ? "☀️" : "🌙";
      button.setAttribute("aria-label", theme === "dark" ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن");
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
