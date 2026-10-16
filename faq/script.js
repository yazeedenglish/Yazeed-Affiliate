document.querySelectorAll('[data-current-year]').forEach(e => e.textContent = new Date().getFullYear());

        const faqItems = document.querySelectorAll('.faq-item');

        faqItems.forEach(item => {
            const question = item.querySelector('.faq-question');
            const answer = item.querySelector('.faq-answer');

            question.addEventListener('click', () => {
                const shouldOpen = question.getAttribute('aria-expanded') !== 'true';

                faqItems.forEach(otherItem => {
                    const otherQuestion = otherItem.querySelector('.faq-question');
                    const otherAnswer = otherItem.querySelector('.faq-answer');

                    otherItem.classList.remove('is-open');
                    otherQuestion.setAttribute('aria-expanded', 'false');
                    otherAnswer.setAttribute('aria-hidden', 'true');
                });

                if (shouldOpen) {
                    item.classList.add('is-open');
                    question.setAttribute('aria-expanded', 'true');
                    answer.setAttribute('aria-hidden', 'false');
                }
            });
        });