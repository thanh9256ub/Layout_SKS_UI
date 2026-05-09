(function () {
    'use strict';

    function initSupportPage() {
        const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'support'
        );

        if (!visiblePageContainer) {
            return;
        }

        const contactItems = visiblePageContainer.querySelectorAll('.support-contact-item');
        contactItems.forEach(item => {
            item.addEventListener('click', function (e) {
                // Thêm hiệu ứng click
                this.style.transform = 'scale(0.98)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
            });
        });

        const faqQuestions = visiblePageContainer.querySelectorAll('.faq-question');
        faqQuestions.forEach(question => {
            question.style.cursor = 'pointer';
            question.addEventListener('click', function () {
                const answer = this.nextElementSibling;
                if (answer) {
                    const isExpanded = answer.style.display === 'block';
                    answer.style.display = isExpanded ? 'none' : 'block';
                    const icon = this.querySelector('i');
                    if (icon) {
                        icon.style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
                    }
                }
            });
        });

        const faqAnswers = visiblePageContainer.querySelectorAll('.faq-answer');
        faqAnswers.forEach(answer => {
            answer.style.display = 'none';
        });
    }

    function shouldInit() {
        const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'support'
        );
        return visiblePageContainer !== undefined;
    }

    function tryInit() {
        if (shouldInit()) {
            initSupportPage();
        }
    }

    function startInit() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', tryInit);
        } else {
            setTimeout(tryInit, 100);
        }
    }

    startInit();

    const handleSupportPageShow = (e) => {
        if (e.detail?.page === 'support') {
            setTimeout(() => {
                const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
                    page => page.style.display !== 'none' && page.getAttribute('data-page') === 'support'
                );
                if (visiblePageContainer) {
                    initSupportPage();
                }
            }, 200);
        }
    };

    window.addEventListener('pageLoaded', handleSupportPageShow);
    window.addEventListener('pageShown', handleSupportPageShow);
})();

