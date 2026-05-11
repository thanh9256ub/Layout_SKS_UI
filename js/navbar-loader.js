(function () {
    if (window.__navbarLoaded) {
        return;
    }
    window.__navbarLoaded = true;

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';
    const NAVBAR_COMPONENT = `${APP_ROOT}html/components/navbar.html`;

    async function getNavbarHtml() {
        const response = await fetch(NAVBAR_COMPONENT);
        if (!response.ok) {
            throw new Error(`Failed to load navbar: ${response.status}`);
        }

        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return doc.body?.innerHTML?.trim() || html;
    }

    function ensureHeaderContainer() {
        let headerContainer = document.getElementById('sp-header');
        if (!headerContainer) {
            headerContainer = document.createElement('header');
            headerContainer.id = 'sp-header';
            document.body.prepend(headerContainer);
        }
        return headerContainer;
    }

    function applyNavbarPaths(headerContainer) {
        if (!APP_ROOT) return;

        headerContainer.querySelectorAll('img[src^="images/"]').forEach(img => {
            img.src = `${APP_ROOT}${img.getAttribute('src')}`;
        });

        headerContainer.querySelectorAll('a[href="index.html"]').forEach(link => {
            link.href = `${APP_ROOT}index.html`;
        });
    }

    function appendScriptOnce(src) {
        if (document.querySelector(`script[src="${src}"]`)) return;

        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        document.body.appendChild(script);
    }

    function setActiveNavLink() {
        const activePage = window.history.state?.page || localStorage.getItem('currentPage') || 'home';

        document.querySelectorAll('.nav-link, .sidebar-nav-item').forEach(link => {
            link.classList.toggle('active', link.dataset.name === activePage);
        });
    }

    async function loadNavbar() {
        const headerContainer = ensureHeaderContainer();

        try {
            headerContainer.innerHTML = await getNavbarHtml();
            applyNavbarPaths(headerContainer);
            setActiveNavLink();

            if (typeof initNavbar === 'function') {
                initNavbar();
            }

            if (typeof initSearchButton === 'function') {
                setTimeout(initSearchButton, 100);
            }

            appendScriptOnce(`${APP_ROOT}js/settings/settings_menu.js`);
            appendScriptOnce(`${APP_ROOT}js/home/sidebar.js`);
            appendScriptOnce(`${APP_ROOT}js/home/avatar_dropdown.js`);
        } catch (error) {
            console.error('Error loading navbar:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNavbar);
    } else {
        loadNavbar();
    }

    window.updateActiveNavLink = function (pageName) {
        document.querySelectorAll('.nav-link, .sidebar-nav-item').forEach(link => {
            link.classList.toggle('active', link.dataset.name === pageName);
        });
    };
})();
