(function () {
    'use strict';

    const SinglePointTrip = window.CountTripModules?.SinglePointTrip;
    const MultiPointTrip = window.CountTripModules?.MultiPointTrip;
    const ArcFromPointTrip = window.CountTripModules?.ArcFromPointTrip;
    const ArcToPointTrip = window.CountTripModules?.ArcToPointTrip;

    const countTripData = {
        'water-pump': {
            title: 'Đếm chuyến đơn điểm',
            icon: 'fas fa-tint',
            description: 'Đếm số chuyến xe qua một điểm cố định'
        },
        'vibration': {
            title: 'Đếm chuyến đa điểm',
            icon: 'fas fa-bell',
            description: 'Đếm số chuyến xe qua nhiều điểm khác nhau'
        },
        'ac': {
            title: 'Đếm chuyến theo cung độ (Từ điểm)',
            icon: 'fas fa-snowflake',
            description: 'Đếm chuyến xuất phát từ một điểm theo cung độ nhất định'
        },
        'tire-pressure': {
            title: 'Đếm chuyến theo cung độ (Đến điểm)',
            icon: 'fas fa-circle',
            description: 'Đếm chuyến đến một điểm theo cung độ nhất định'
        }
    };

    function getVisiblePageContainer() {
        return Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'countTrip'
        );
    }

    function initSidebarCollapse(storageKey = 'countTripSidebarCollapsed') {
        const container = getVisiblePageContainer();
        if (!container) return;

        const sidebarCol = container.querySelector('.report-sidebar-col');
        const toggleBtn = sidebarCol?.querySelector('.report-sidebar-toggle');
        const contentCol = container.querySelector('.report-content-col');
        const sidebarContent = sidebarCol?.querySelector('.report-sidebar-content');

        if (!sidebarCol || !toggleBtn || !contentCol || !sidebarContent) return;

        const icon = toggleBtn.querySelector('i');
        const reportItems = sidebarCol.querySelectorAll('.report-item');
        reportItems.forEach(item => {
            const text = item.querySelector('.report-item-text');
            if (text && !item.getAttribute('title')) {
                item.setAttribute('title', text.textContent.trim());
            }
        });

        const setCollapsed = (collapsed, { persist = true } = {}) => {
            sidebarCol.classList.toggle('is-collapsed', collapsed);
            contentCol.classList.toggle('is-sidebar-collapsed', collapsed);
            toggleBtn.setAttribute('aria-expanded', String(!collapsed));
            toggleBtn.setAttribute('aria-label', collapsed ? 'Mở danh sách đếm chuyến' : 'Thu gọn danh sách đếm chuyến');

            if (icon) {
                icon.classList.toggle('fa-chevron-left', !collapsed);
                icon.classList.toggle('fa-chevron-right', collapsed);
            }

            if (persist) {
                try {
                    localStorage.setItem(storageKey, collapsed ? 'true' : 'false');
                } catch (error) {
                    console.warn('Cannot persist sidebar state:', error);
                }
            }
        };

        const applyState = () => {
            const isMobile = window.matchMedia('(max-width: 768px)').matches;
            let storedCollapsed = false;
            try {
                storedCollapsed = localStorage.getItem(storageKey) === 'true';
            } catch (error) {
                storedCollapsed = false;
            }

            const targetCollapsed = isMobile ? false : storedCollapsed;
            setCollapsed(targetCollapsed, { persist: !isMobile });
        };

        applyState();

        if (!toggleBtn.dataset.listenerAttached) {
            toggleBtn.addEventListener('click', (event) => {
                event.preventDefault();
                const isMobile = window.matchMedia('(max-width: 768px)').matches;
                const current = sidebarCol.classList.contains('is-collapsed');
                setCollapsed(!current, { persist: !isMobile });
            });
            toggleBtn.dataset.listenerAttached = 'true';
        }

        window.addEventListener('resize', applyState);
    }

    function createDefaultContent(title, icon, description) {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        return `
            <div class="report-page">
                <div class="report-page-header">
                    <h2 class="report-page-title">
                        Tính năng đang được phát triển
                    </h2>
                </div>
            </div>
        `;
    }

    async function createContent(title, icon, description) {
        if (title.includes('đơn điểm') && SinglePointTrip) {
            return await SinglePointTrip.loadHTML() || createDefaultContent(title, icon, description);
        }

        if (title.includes('đa điểm') && MultiPointTrip) {
            return await MultiPointTrip.loadHTML() || createDefaultContent(title, icon, description);
        }

        if (title.includes('Từ điểm') && ArcFromPointTrip) {
            return await ArcFromPointTrip.loadHTML() || createDefaultContent(title, icon, description);
        }

        if (title.includes('Đến điểm') && ArcToPointTrip) {
            return await ArcToPointTrip.loadHTML() || createDefaultContent(title, icon, description);
        }

        return createDefaultContent(title, icon, description);
    }

    // Load trip content
    async function loadCountTrip(tripType) {
        const container = getVisiblePageContainer();
        const reportContent = container ? container.querySelector('#reportContent') : document.getElementById('reportContent');
        if (!reportContent) return;

        const trip = countTripData[tripType];
        if (!trip) {
            reportContent.innerHTML = `
                <div class="report-page">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Chức năng không tồn tại hoặc đang được phát triển.
                    </div>
                </div>
            `;
            return;
        }

        const content = await createContent(trip.title, trip.icon, trip.description);
        reportContent.innerHTML = content;

        if (tripType === 'water-pump' && SinglePointTrip) {
            SinglePointTrip.initDateFields();
        } else if (tripType === 'vibration' && MultiPointTrip) {
            MultiPointTrip.initDateFields();
        } else if (tripType === 'ac' && ArcFromPointTrip) {
            ArcFromPointTrip.initDateFields();
        } else if (tripType === 'tire-pressure' && ArcToPointTrip) {
            ArcToPointTrip.initDateFields();
        }
    }

    let isInitialized = false;
    let reportListClickHandler = null;
    let currentPageName = null;

    // Initialize the page
    function init() {
        const container = getVisiblePageContainer();
        if (!container) {
            console.warn('CountTrip page not visible, skipping init');
            return;
        }

        const reportList = container.querySelector('#reportList');
        const reportContent = container.querySelector('#reportContent');
        if (!reportList || !reportContent) {
            console.warn('CountTrip elements not found');
            return;
        }

        if (isInitialized) {
            // Reload content if empty or loading
            if (!reportContent.innerHTML.trim() || reportContent.querySelector('.report-loading')) {
                const activeItem = reportList.querySelector('.report-item.active');
                const reportType = activeItem?.dataset.report || 'water-pump';
                loadCountTrip(reportType);
            }
            return;
        }

        isInitialized = true;

        loadCountTrip('water-pump');

        initSidebarCollapse('countTripSidebarCollapsed');

        if (reportListClickHandler) {
            reportList.removeEventListener('click', reportListClickHandler);
        }

        reportListClickHandler = (e) => {
            const reportItem = e.target.closest('.report-item');
            if (!reportItem || !reportItem.dataset.report) return;

            reportList.querySelectorAll('.report-item').forEach(item => item.classList.remove('active'));
            reportItem.classList.add('active');

            loadCountTrip(reportItem.dataset.report);
        };

        reportList.addEventListener('click', reportListClickHandler);
    }

    window.addEventListener('pageShown', (e) => {
        if (e.detail?.page === 'countTrip') {
            if (currentPageName !== 'countTrip') {
                isInitialized = false;
            }
            currentPageName = 'countTrip';

            const container = getVisiblePageContainer();
            if (container) {
                init();
            }
        } else {
            if (currentPageName === 'countTrip') {
                isInitialized = false;
            }
            currentPageName = e.detail?.page || null;
        }
    });
})(); 