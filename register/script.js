
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("registerForm");
  const themeToggle = document.querySelector("[data-theme-toggle]");
  const themeIcon = document.querySelector(".theme-icon");
  const submitButton = document.getElementById("submitButton");
  const formMessage = document.getElementById("formMessage");

  const platformHint = document.getElementById("platformHint");
  const methodHint = document.getElementById("methodHint");

  const platformCheckboxes = [
    ...document.querySelectorAll("[data-platform]")
  ];

  const methodCheckboxes = [
    ...document.querySelectorAll("[data-marketing-method]")
  ];

  // Current year
  document.querySelectorAll("[data-current-year]").forEach(function (element) {
    element.textContent = new Date().getFullYear();
  });

  // Dark mode
  function applyTheme(theme) {
    document.body.classList.toggle("dark", theme === "dark");
    document.documentElement.dataset.theme = theme;

    if (themeIcon) {
      if (theme === "dark") {
        // Sun icon
        themeIcon.innerHTML = `
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 3v1"></path>
          <path d="M12 20v1"></path>
          <path d="M3 12h1"></path>
          <path d="M20 12h1"></path>
          <path d="m18.364 5.636-.707.707"></path>
          <path d="m6.343 17.657-.707.707"></path>
          <path d="m5.636 5.636.707.707"></path>
          <path d="m17.657 17.657.707.707"></path>
        `;
      } else {
        // Moon icon
        themeIcon.innerHTML = `
          <path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"></path>
        `;
      }
    }

    if (themeToggle) {
      themeToggle.setAttribute(
        "aria-label",
        theme === "dark"
          ? "تفعيل الوضع الفاتح"
          : "تفعيل الوضع الداكن"
      );
    }
  }

  let savedTheme = "light";

  try {
    savedTheme = localStorage.getItem("ye_affiliate_theme") || "light";
  } catch (error) {
    savedTheme = "light";
  }

  applyTheme(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener("click", function () {
      const nextTheme = document.body.classList.contains("dark")
        ? "light"
        : "dark";

      applyTheme(nextTheme);

      try {
        localStorage.setItem("ye_affiliate_theme", nextTheme);
      } catch (error) {
        // Theme still works if storage is unavailable.
      }
    });
  }

  // Display selected platform fields
  function updatePlatformFields() {
    platformCheckboxes.forEach(function (checkbox) {
      const platform = checkbox.dataset.platform;

      const field = document.querySelector(
        `[data-profile-field="${platform}"]`
      );

      if (!field) return;

      const input = field.querySelector("input");

      field.hidden = !checkbox.checked;

      if (input) {
        input.disabled = !checkbox.checked;
        input.required = checkbox.checked;
      }
    });

    const hasPlatform = platformCheckboxes.some(function (checkbox) {
      return checkbox.checked;
    });

    // These hints are optional and may not exist in the HTML.
    if (platformHint) {
      platformHint.classList.toggle("invalid", !hasPlatform);

      platformHint.textContent = hasPlatform
        ? "أدخل اسم الحساب أو رابطه لكل منصة اخترتها."
        : "اختر منصة واحدة على الأقل للمتابعة.";
    }
  }

  platformCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      updatePlatformFields();

      if (formMessage) {
        formMessage.textContent = "";
        formMessage.className = "form-message";
      }
    });
  });

  // Check selected marketing methods
  function updateMethodHint() {
    const hasMethod = methodCheckboxes.some(function (checkbox) {
      return checkbox.checked;
    });

    // This hint is optional and may not exist in the HTML.
    if (methodHint) {
      methodHint.classList.toggle("invalid", !hasMethod);

      methodHint.textContent = hasMethod
        ? "يمكنك اختيار أكثر من طريقة."
        : "اختر طريقة تسويق واحدة على الأقل.";
    }
  }

  methodCheckboxes.forEach(function (checkbox) {
    checkbox.addEventListener("change", function () {
      updateMethodHint();

      if (formMessage) {
        formMessage.textContent = "";
        formMessage.className = "form-message";
      }
    });
  });

  updatePlatformFields();
  updateMethodHint();

  // Display validation messages
  function showMessage(message, type) {
    if (!formMessage) return;

    formMessage.textContent = message;
    formMessage.className = "form-message " + type;
  }

  // Validate before sending to FormSubmit
  if (form) {
    form.addEventListener("submit", function (event) {
      const hasPlatform = platformCheckboxes.some(function (checkbox) {
        return checkbox.checked;
      });

      const hasMethod = methodCheckboxes.some(function (checkbox) {
        return checkbox.checked;
      });

      updatePlatformFields();
      updateMethodHint();

      if (!hasPlatform) {
        event.preventDefault();

        showMessage(
          "يرجى اختيار منصة تسويقية واحدة على الأقل.",
          "error"
        );

        if (platformCheckboxes[0]) {
          platformCheckboxes[0].focus();
        }

        return;
      }

      if (!hasMethod) {
        event.preventDefault();

        showMessage(
          "يرجى اختيار طريقة تسويق واحدة على الأقل.",
          "error"
        );

        if (methodCheckboxes[0]) {
          methodCheckboxes[0].focus();
        }

        return;
      }

      if (!form.checkValidity()) {
        event.preventDefault();
        form.reportValidity();
        return;
      }

      // Let FormSubmit handle the actual submission.
      // Do not display success before the submission is confirmed.
      if (submitButton) {
        submitButton.disabled = true;

        const buttonText = submitButton.querySelector("span");

        if (buttonText) {
          buttonText.textContent = "جارٍ إرسال الطلب...";
        }
      }
    });
  }
});
