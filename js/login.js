(function () {
  const form = document.getElementById("loginForm");
  const codeInput = document.getElementById("affiliateCode");
  const passwordInput = document.getElementById("affiliatePassword");
  const message = document.getElementById("formMessage");

  document.querySelectorAll("[data-current-year]").forEach((el) => { el.textContent = new Date().getFullYear(); });

  function showMessage(text, type) {
    message.textContent = text;
    message.className = "form-message " + type;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const code = codeInput.value.trim().toUpperCase();
    const password = passwordInput.value;

    if (!/^[A-Z0-9_-]{3,40}$/.test(code)) {
      showMessage("تحقق من رمز الشريك وحاول مرة أخرى", "error");
      return;
    }
    if (password.length !== 8) {
      showMessage("يجب أن تتكون كلمة المرور من 8 أحرف بالضبط.", "error");
      return;
    }

    const submit = form.querySelector("button[type='submit']");
    submit.disabled = true;
    submit.textContent = "جارٍ التحقق...";
    try {
      const response = await fetch(`../data/affiliates/${encodeURIComponent(code)}.json`, { cache: "no-store" });
      if (!response.ok) throw new Error("not-found");
      const partner = await response.json();
      if (String(partner.code || "").toUpperCase() !== code || partner.password !== password || partner.active === false) {
        throw new Error("invalid-login");
      }
      localStorage.setItem(window.YEAffiliate.SESSION_KEY, JSON.stringify({ code: partner.code, loggedInAt: new Date().toISOString() }));
      window.location.href = "../dashboard/";
    } catch (_) {
      showMessage("تعذر تسجيل الدخول. تحقق من الرمز وكلمة المرور", "error");
    } finally {
      submit.disabled = false;
      submit.innerHTML = 'تسجيل الدخول <span aria-hidden="true">←</span>';
    }
  });
})();
