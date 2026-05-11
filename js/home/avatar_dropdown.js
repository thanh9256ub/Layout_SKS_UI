(function () {
    'use strict';
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    // Prevent multiple initializations
    if (window.__avatarDropdownInitialized) return;
    window.__avatarDropdownInitialized = true;


    function initAvatarDropdown() {
        // Navbar dropdown
        const navbarDropdown = document.getElementById('navbarAvatarDropdown');
        const navbarMenu = document.getElementById('navbarUserDropdown');
        const navbarChangePassword = document.getElementById('navbarChangePassword');
        const navbarLogout = document.getElementById('navbarLogout');

        // Sidebar dropdown
        const sidebarDropdown = document.getElementById('sidebarAvatarDropdown');
        const sidebarMenu = document.getElementById('sidebarUserDropdown');
        const sidebarChangePassword = document.getElementById('sidebarChangePassword');
        const sidebarLogout = document.getElementById('sidebarLogout');

        if (navbarDropdown && navbarMenu) {
            setupDropdown(navbarDropdown, navbarMenu, 'navbar');

            if (navbarChangePassword && !navbarChangePassword.dataset.listenerAttached) {
                navbarChangePassword.addEventListener('click', handleChangePassword);
                navbarChangePassword.dataset.listenerAttached = 'true';
            }

            if (navbarLogout && !navbarLogout.dataset.listenerAttached) {
                navbarLogout.addEventListener('click', handleLogout);
                navbarLogout.dataset.listenerAttached = 'true';
            }
        }

        if (sidebarDropdown && sidebarMenu) {
            setupDropdown(sidebarDropdown, sidebarMenu, 'sidebar');

            if (sidebarChangePassword && !sidebarChangePassword.dataset.listenerAttached) {
                sidebarChangePassword.addEventListener('click', handleChangePassword);
                sidebarChangePassword.dataset.listenerAttached = 'true';
            }

            if (sidebarLogout && !sidebarLogout.dataset.listenerAttached) {
                sidebarLogout.addEventListener('click', handleLogout);
                sidebarLogout.dataset.listenerAttached = 'true';
            }
        }

        populateUserInfo();
    }

    function setupDropdown(dropdownElement, menuElement, type) {
        if (!dropdownElement || !menuElement) return;

        // Check if listeners already attached
        if (dropdownElement.dataset.dropdownInitialized === 'true') {
            return;
        }

        dropdownElement.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleDropdown(dropdownElement, menuElement, type);
        });

        // Use a named function for document click if we wanted to remove it later, 
        // but for now, checking dataset prevents adding multiple.
        document.addEventListener('click', (e) => {
            if (!dropdownElement.contains(e.target)) {
                closeDropdown(dropdownElement, menuElement);
            }
        });

        // Mark as initialized
        dropdownElement.dataset.dropdownInitialized = 'true';
    }


    function toggleDropdown(dropdownElement, menuElement, type) {
        const isOpen = menuElement.classList.contains('show');

        closeAllDropdowns();

        if (!isOpen) {
            openDropdown(dropdownElement, menuElement);
        } else {
            closeDropdown(dropdownElement, menuElement);
        }
    }


    function openDropdown(dropdownElement, menuElement) {
        dropdownElement.classList.add('active');
        menuElement.classList.add('show');
    }


    function closeDropdown(dropdownElement, menuElement) {
        dropdownElement.classList.remove('active');
        menuElement.classList.remove('show');
    }


    function closeAllDropdowns() {
        const allDropdowns = document.querySelectorAll('.user-avatar-dropdown');
        const allMenus = document.querySelectorAll('.user-dropdown-menu');

        allDropdowns.forEach(dropdown => dropdown.classList.remove('active'));
        allMenus.forEach(menu => menu.classList.remove('show'));
    }

    function populateUserInfo() {
        // Get user data from localStorage
        const username = localStorage.getItem('username') || localStorage.getItem('currentUser') || 'Người dùng';
        const email = localStorage.getItem('userEmail') || `${username.toLowerCase().replace(/\s+/g, '.')}@gmail.com`;

        // Update navbar dropdown
        const navbarFullname = document.getElementById('navbarUserFullname');
        const navbarEmail = document.getElementById('navbarUserEmail');
        const navbarUsername = document.querySelector('#navbarAvatarDropdown .username');
        if (navbarFullname) navbarFullname.textContent = username;
        if (navbarEmail) navbarEmail.textContent = email;
        if (navbarUsername) navbarUsername.textContent = username;

        // Update sidebar dropdown
        const sidebarFullname = document.getElementById('sidebarUserFullname');
        const sidebarEmail = document.getElementById('sidebarUserEmail');
        const sidebarUsername = document.querySelector('.sidebar-username');

        if (sidebarFullname) sidebarFullname.textContent = username;
        if (sidebarEmail) sidebarEmail.textContent = email;
        if (sidebarUsername) sidebarUsername.textContent = username;
    }

    function handleChangePassword(e) {
        e.preventDefault();
        e.stopPropagation();

        closeAllDropdowns();

        if (typeof window.openChangePasswordModal !== 'function' && typeof initChangePasswordModal === 'function') {
            initChangePasswordModal();
        }

        if (typeof window.openChangePasswordModal === 'function') {
            window.openChangePasswordModal();
        }
    }

    function handleLogout(e) {
        e.preventDefault();
        e.stopPropagation();

        closeAllDropdowns();

        performLogout();
    }


    function performLogout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        localStorage.removeItem('username');
        localStorage.removeItem('userEmail');

        window.location.href = `${APP_ROOT}html/login.html`;
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initAvatarDropdown);
    } else {
        initAvatarDropdown();
    }

    window.addEventListener('pageLoaded', () => {
        setTimeout(initAvatarDropdown, 100);
    });

    setTimeout(initAvatarDropdown, 500);
    setTimeout(initAvatarDropdown, 1000);

})();

