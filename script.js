
"use strict";

document.addEventListener("DOMContentLoaded", () => {

    // =========================================
    // Light / dark mode
    // =========================================

    const themeToggle = document.getElementById("themeToggle");
    const root = document.documentElement;

    function applyTheme(theme) {
        const isDark = theme === "dark";

        root.setAttribute("data-theme", isDark ? "dark" : "light");

        if (themeToggle) {
            themeToggle.setAttribute(
                "aria-pressed",
                String(isDark)
            );

            themeToggle.setAttribute(
                "aria-label",
                isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
            );

            themeToggle.setAttribute(
                "title",
                isDark ? "تفعيل الوضع الفاتح" : "تفعيل الوضع الداكن"
            );
        }
    }

    let savedTheme = "light";

    try {
        savedTheme =
            localStorage.getItem("ye_affiliate_landing_theme") || "light";
    } catch {
        savedTheme = "light";
    }

    applyTheme(savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = root.getAttribute("data-theme");
            const nextTheme = currentTheme === "dark" ? "light" : "dark";

            applyTheme(nextTheme);

            try {
                localStorage.setItem("ye_affiliate_landing_theme", nextTheme);
            } catch {
                // Theme still works for the current page.
            }
        });
    }

    
    // =========================================
    // Mobile navigation
    // =========================================

    const menuToggle = document.getElementById("menuToggle");
    const mainNav = document.getElementById("mainNav");

    if (menuToggle && mainNav) {
        function closeMenu() {
            mainNav.classList.remove("is-open");
            menuToggle.classList.remove("is-active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "فتح القائمة");
        }

        menuToggle.addEventListener("click", () => {
            const isOpen = mainNav.classList.toggle("is-open");

            menuToggle.classList.toggle("is-active", isOpen);
            menuToggle.setAttribute("aria-expanded", String(isOpen));
            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "إغلاق القائمة" : "فتح القائمة"
            );
        });

        mainNav.querySelectorAll("a").forEach(link => {
            link.addEventListener("click", closeMenu);
        });

        document.addEventListener("click", event => {
            if (
                !mainNav.contains(event.target) &&
                !menuToggle.contains(event.target)
            ) {
                closeMenu();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                closeMenu();
                menuToggle.focus();
            }
        });

        window.addEventListener("resize", () => {
            if (window.innerWidth > 800) {
                closeMenu();
            }
        });
    }

    // =========================================
    // Reveal animations on scroll
    // =========================================

    const revealElements = document.querySelectorAll(".reveal");

    const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
        revealElements.forEach(element => {
            element.classList.add("is-visible");
        });
    } else {
        const revealObserver = new IntersectionObserver(
            (entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("is-visible");
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.12,
                rootMargin: "0px 0px -35px 0px"
            }
        );

        revealElements.forEach(element => {
            revealObserver.observe(element);
        });
    }

    // =========================================
    // FAQ accordion
    // =========================================

    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-question");

        if (!question) return;

        question.addEventListener("click", () => {
            const shouldOpen = !item.classList.contains("is-open");

            faqItems.forEach(otherItem => {
                otherItem.classList.remove("is-open");

                const otherQuestion = otherItem.querySelector(
                    ".faq-question"
                );

                if (otherQuestion) {
                    otherQuestion.setAttribute("aria-expanded", "false");
                }
            });

            if (shouldOpen) {
                item.classList.add("is-open");
                question.setAttribute("aria-expanded", "true");
            }
        });
    });

    // =========================================
    // Automatic copyright year
    // =========================================

    const yearElement = document.getElementById("currentYear");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
