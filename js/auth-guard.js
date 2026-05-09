(function () {
    'use strict';
    if (window.__authGuardInitialized) return;
    window.__authGuardInitialized = true;
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    function isLoginPage() {
        const path = window.location.pathname.toLowerCase();
        return path.includes('/login.html') || path.endsWith('/login') || path === 'html/login.html';
    }

    function isAuthenticated() {
        const isLoggedIn = localStorage.getItem('isLoggedIn');
        return isLoggedIn === 'true';
    }

    function redirectToLogin() {
        if (isLoginPage()) return;

        const currentPath = window.location.pathname;
        if (currentPath && currentPath !== 'index.html' && currentPath !== '/') {
            sessionStorage.setItem('redirectAfterLogin', currentPath);
        }
        window.location.href = `${APP_ROOT}html/login.html`;
    }

    function redirectToHome() {
        window.location.href = `${APP_ROOT}index.html`;
    }

    function initAuthGuard() {
        if (isLoginPage()) {
            if (isAuthenticated()) {
                const redirectPath = sessionStorage.getItem('redirectAfterLogin');
                if (redirectPath && redirectPath !== 'html/login.html') {
                    sessionStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectPath;
                } else {
                    redirectToHome();
                }
            }
            return;
        }
        if (!isAuthenticated()) {
            redirectToLogin();
            return;
        }
    }

    initAuthGuard();

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAuthGuard);
    } else {
        initAuthGuard();
    }

    window.addEventListener('storage', function (e) {
        if (e.key === 'isLoggedIn' && e.newValue !== 'true') {
            if (!isLoginPage()) {
                redirectToLogin();
            }
        }
    });
})();

