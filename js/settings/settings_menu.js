(function () {
    'use strict';
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    if (window.__settingsMenuInitialized) return;
    window.__settingsMenuInitialized = true;

    let settingsButton = null;
    let settingsDropdown = null;
    let isOpen = false;


    function initSettingsMenu() {
        settingsButton = document.getElementById('settingsButton');
        settingsDropdown = document.getElementById('settingsDropdown');

        if (!settingsButton || !settingsDropdown) {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initSettingsMenu);
            } else {
                setTimeout(initSettingsMenu, 100);
            }
            return;
        }

        settingsButton.addEventListener('click', handleSettingsClick);

        document.addEventListener('click', handleOutsideClick);

        const settingsItems = settingsDropdown.querySelectorAll('.settings-item');
        settingsItems.forEach(item => {
            item.addEventListener('click', handleItemClick);
            item.addEventListener('mouseenter', handleItemHover);
        });

        const logoutButton = document.getElementById('logoutButton');
        if (logoutButton) {
            logoutButton.addEventListener('click', handleLogout);
        }

        document.addEventListener('keydown', handleKeyDown);
    }


    function handleSettingsClick(e) {
        e.stopPropagation();
        toggleSettingsMenu();
    }

    function toggleSettingsMenu() {
        if (isOpen) {
            closeSettingsMenu();
        } else {
            openSettingsMenu();
        }
    }

    function openSettingsMenu() {
        if (!settingsDropdown || isOpen) return;

        isOpen = true;
        settingsDropdown.classList.add('show');
        settingsButton.classList.add('active');

        requestAnimationFrame(() => {
            settingsDropdown.classList.add('animating');
        });
    }

    function closeSettingsMenu() {
        if (!settingsDropdown || !isOpen) return;

        isOpen = false;
        settingsDropdown.classList.remove('animating');
        settingsButton.classList.remove('active');

        if (!isOpen) {
            settingsDropdown.classList.remove('show');
        }

    }

    function handleOutsideClick(e) {
        if (!isOpen) return;
        const wrapper = settingsButton?.closest('.settings-dropdown-wrapper');
        if (wrapper && !wrapper.contains(e.target)) {
            closeSettingsMenu();
        }
    }

    function handleItemClick(e) {
        e.preventDefault();
        const item = e.currentTarget;

        if (item.id === 'logoutButton') {
            return;
        }
        const section = item.dataset.section;
        createRippleEffect(item, e);
        closeSettingsMenu();

        if (section === 'groups') {
            window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page: 'vehicleGroups' } }));
        }
    }


    function handleLogout(e) {
        e.preventDefault();
        e.stopPropagation();
        const logoutButton = e.currentTarget;

        createRippleEffect(logoutButton, e);
        closeSettingsMenu();
        performLogout();
    }


    function performLogout() {
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('currentUser');
        window.location.href = `${APP_ROOT}html/login.html`;
    }


    function handleItemHover(e) {
        const item = e.currentTarget;
        item.classList.add('hover');

        item.addEventListener('mouseleave', () => {
            item.classList.remove('hover');
        }, { once: true });
    }


    function handleKeyDown(e) {
        if (e.key === 'Escape' && isOpen) {
            closeSettingsMenu();
        }
    }

    function createRippleEffect(element, event) {
        const ripple = document.createElement('span');
        ripple.className = 'settings-ripple';

        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        requestAnimationFrame(() => {
            ripple.classList.add('active');
        });

        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initSettingsMenu);
    } else {
        initSettingsMenu();
    }

    window.addEventListener('pageLoaded', () => {
        setTimeout(initSettingsMenu, 100);
    });

})();

