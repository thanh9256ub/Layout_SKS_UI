(function () {
    'use strict';

    // DOM Elements
    const sidebarToggleBtn = document.getElementById('sidebarToggle');
    const sidebarCloseBtn = document.getElementById('sidebarClose');
    const sidebar = document.getElementById('modernSidebar');
    const overlay = document.getElementById('sidebarOverlay');
    const sidebarNavItems = document.querySelectorAll('.sidebar-nav-item');

    // Check if elements exist
    if (!sidebarToggleBtn || !sidebar || !overlay) {
        console.warn('Sidebar elements not found');
        return;
    }

    /**
     * Open sidebar with smooth animation
     */
    function openSidebar() {
        sidebar.classList.add('active');
        overlay.classList.add('active');
        sidebarToggleBtn.classList.add('active');
        document.body.style.overflow = 'hidden'; // Prevent body scroll when sidebar is open
    }

    function closeSidebar() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        sidebarToggleBtn.classList.remove('active');
        document.body.style.overflow = ''; // Restore body scroll
    }

    function toggleSidebar() {
        if (sidebar.classList.contains('active')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    }

    /**
     * Set active navigation item based on current page
     */
    function setActiveNavItem() {
        const currentPath = window.location.pathname;
        const currentPage = currentPath.split('/').pop() || 'index.html';

        sidebarNavItems.forEach(item => {
            const href = item.getAttribute('href');
            const pageName = href ? href.split('/').pop() : '';

            // Check if current page matches
            if (pageName === currentPage ||
                (currentPage === '' && pageName === 'index.html') ||
                (currentPage === '/' && pageName === 'index.html')) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
    }

    /**
     * Handle window resize to close sidebar on desktop
     */
    function handleResize() {
        if (window.innerWidth > 1024) {
            closeSidebar();
        }
    }

    /**
     * Handle navigation click - close sidebar after click on mobile
     */
    function handleNavClick(e) {
        // Close sidebar after a short delay to allow navigation to complete
        setTimeout(() => {
            closeSidebar();
        }, 300);
    }

    // Event Listeners
    sidebarToggleBtn.addEventListener('click', toggleSidebar);

    if (sidebarCloseBtn) {
        sidebarCloseBtn.addEventListener('click', closeSidebar);
    }

    overlay.addEventListener('click', closeSidebar);

    // Close sidebar when clicking navigation items
    sidebarNavItems.forEach(item => {
        item.addEventListener('click', handleNavClick);
    });

    // Handle resize events
    window.addEventListener('resize', handleResize);

    // Handle escape key to close sidebar
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('active')) {
            closeSidebar();
        }
    });

    // Prevent sidebar from closing when clicking inside it
    sidebar.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // Set active nav item on page load
    setActiveNavItem();

    // Sync username from main navbar to sidebar
    function syncUserInfo() {
        const mainUsername = document.querySelector('.logo-user .username');
        const sidebarUsername = document.querySelector('.sidebar-username');

        if (mainUsername && sidebarUsername) {
            sidebarUsername.textContent = mainUsername.textContent;
        }
    }

    // Sync user info on page load
    syncUserInfo();

    // Also sync after a short delay to ensure navbar JS has loaded
    setTimeout(syncUserInfo, 500);

    // Export functions for external use if needed
    window.sidebarNav = {
        open: openSidebar,
        close: closeSidebar,
        toggle: toggleSidebar,
        setActive: setActiveNavItem
    };

})();

