
    (() => {
        const emailElement = document.getElementById("supportEmail");
        const card = document.getElementById("emailContactCard");
        const feedback = document.getElementById("supportCopyFeedback");

        if (!emailElement || !card || !feedback) return;

        async function copyEmail() {
            const email = emailElement.textContent.trim();

            try {
                await navigator.clipboard.writeText(email);
                feedback.textContent = "تم نسخ البريد الإلكتروني بنجاح";
            } catch {
                const input = document.createElement("textarea");
                input.value = email;
                input.setAttribute("readonly", "");
                input.style.position = "fixed";
                input.style.opacity = "0";
                document.body.appendChild(input);
                input.select();

                const copied = document.execCommand("copy");
                input.remove();

                feedback.textContent = copied
                    ? "تم نسخ البريد الإلكتروني بنجاح"
                    : "تعذر النسخ تلقائيًا. يمكنك تحديد البريد ونسخه يدويًا.";
            }
        }

        card.addEventListener("click", copyEmail);

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                copyEmail();
            }
        });
    })();
