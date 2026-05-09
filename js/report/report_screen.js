(function () {
    'use strict';

    const TemperatureReport = window.ReportModules?.TemperatureReport;
    const StopPointsReport = window.ReportModules?.StopPointsReport;
    const JourneyAdcoReport = window.ReportModules?.JourneyAdcoReport;
    const VehicleHistoryReport = window.ReportModules?.VehicleHistoryReport;
    const RouteBasedRoadmapReport = window.ReportModules?.RouteBasedRoadmapReport;
    const FuelUsageReport = window.ReportModules?.FuelUsageReport;
    const EventsReport = window.ReportModules?.EventsReport;
    const SpeedViolationReport = window.ReportModules?.SpeedViolationReport;
    const SummaryNewReport = window.ReportModules?.SummaryNewReport;
    const Summary3dReport = window.ReportModules?.Summary3dReport;
    const SummarySciReport = window.ReportModules?.SummarySciReport;
    const Qcvn06StopReport = window.ReportModules?.Qcvn06StopReport;
    const Qcvn06DriverReport = window.ReportModules?.Qcvn06DriverReport;
    const Qcvn06VehicleReport = window.ReportModules?.Qcvn06VehicleReport;
    const Qcvn06JourneyReport = window.ReportModules?.Qcvn06JourneyReport;
    const Qcvn06OverspeedReport = window.ReportModules?.Qcvn06OverspeedReport;
    const Qcvn06DrivingTimeReport = window.ReportModules?.Qcvn06DrivingTimeReport;
    const Qcvn06SpeedReport = window.ReportModules?.Qcvn06SpeedReport;

    const reportData = {
        'water-pump': {
            title: 'Báo cáo bơm nước (Chinfon)',
            icon: 'fas fa-tint',
            description: 'Báo cáo chi tiết về hoạt động bơm nước theo hệ thống Chinfon'
        },
        'vibration': {
            title: 'Báo cáo bật rung',
            icon: 'fas fa-bell',
            description: 'Báo cáo về các sự kiện bật rung của phương tiện'
        },
        'ac': {
            title: 'Báo cáo bật điều hòa',
            icon: 'fas fa-snowflake',
            description: 'Báo cáo chi tiết về việc sử dụng hệ thống điều hòa'
        },
        'tire-pressure': {
            title: 'Báo cáo chi tiết cảm biến áp suất lốp',
            icon: 'fas fa-circle',
            description: 'Báo cáo về áp suất lốp từ cảm biến theo thời gian thực'
        },
        'customer-sensor': {
            title: 'Báo cáo chi tiết khách theo cảm biến',
            icon: 'fas fa-users',
            description: 'Báo cáo số lượng khách hàng được ghi nhận qua cảm biến'
        },
        'temperature': {
            title: 'Báo cáo chi tiết nhiệt độ',
            icon: 'fas fa-thermometer-half',
            description: 'Báo cáo nhiệt độ môi trường và nhiệt độ động cơ'
        },
        'stop-points': {
            title: 'Báo cáo các điểm dừng',
            icon: 'fas fa-map-marker-alt',
            description: 'Báo cáo về các điểm dừng của phương tiện trong hành trình'
        },
        'journey-adco': {
            title: 'Báo cáo hành trình (ADCO)',
            icon: 'fas fa-route',
            description: 'Báo cáo chi tiết hành trình theo hệ thống ADCO'
        },
        'vehicle-history': {
            title: 'Báo cáo lịch sử xe chạy',
            icon: 'fas fa-history',
            description: 'Báo cáo lịch sử hoạt động của phương tiện theo thời gian'
        },
        'route-by-line': {
            title: 'Báo cáo lộ trình theo tuyến',
            icon: 'fas fa-route',
            description: 'Báo cáo lộ trình được phân loại theo từng tuyến đường'
        },
        'route-by-station': {
            title: 'Báo cáo lộ trình theo tuyến (theo trạm)',
            icon: 'fas fa-map-marked-alt',
            description: 'Báo cáo lộ trình chi tiết theo từng trạm trong tuyến'
        },
        'overspeed-new': {
            title: 'Báo cáo quá tốc độ (mới)',
            icon: 'fas fa-tachometer-alt',
            description: 'Báo cáo các trường hợp vi phạm tốc độ với giao diện mới'
        },
        'fuel-usage': {
            title: 'Báo cáo sử dụng nhiên liệu',
            icon: 'fas fa-gas-pump',
            description: 'Báo cáo chi tiết về việc sử dụng nhiên liệu của phương tiện'
        },
        'events': {
            title: 'Báo cáo sự kiện',
            icon: 'fas fa-calendar-alt',
            description: 'Báo cáo tổng hợp các sự kiện quan trọng trong quá trình vận hành'
        },
        'speed-violation': {
            title: 'Báo cáo thống kê vi phạm tốc độ',
            icon: 'fas fa-exclamation-triangle',
            description: 'Báo cáo thống kê chi tiết về các vi phạm tốc độ'
        },
        '3d-timing': {
            title: 'Báo cáo tính giờ 3D trực tiếp (Tuyến Than)',
            icon: 'fas fa-clock',
            description: 'Báo cáo tính giờ theo định dạng 3D cho tuyến Than'
        },
        'summary-gtpt': {
            title: 'Báo cáo tổng hợp (GTPT)',
            icon: 'fas fa-chart-bar',
            description: 'Báo cáo tổng hợp theo hệ thống GTPT'
        },
        'summary-new': {
            title: 'Báo cáo tổng hợp (mới)',
            icon: 'fas fa-chart-pie',
            description: 'Báo cáo tổng hợp với giao diện và tính năng mới'
        },
        'summary-3d': {
            title: 'Báo cáo tổng hợp làm việc theo 3D',
            icon: 'fas fa-cube',
            description: 'Báo cáo tổng hợp công việc được phân tích theo định dạng 3D'
        },
        'summary-sci': {
            title: 'Báo cáo tổng hợp mới (SCI)',
            icon: 'fas fa-file-alt',
            description: 'Báo cáo tổng hợp theo hệ thống SCI'
        },
        'student-transport': {
            title: 'Báo cáo tổng hợp đưa đón học sinh',
            icon: 'fas fa-school',
            description: 'Báo cáo chi tiết về hoạt động đưa đón học sinh'
        },
        'image-export': {
            title: 'Kết xuất danh sách ảnh chụp',
            icon: 'fas fa-images',
            description: 'Xuất danh sách và quản lý các ảnh đã được chụp từ camera'
        },
        'qcvn-stop': {
            title: 'QCVN06 - Báo cáo dừng đỗ',
            icon: 'fas fa-parking',
            description: 'Báo cáo tuân thủ QCVN06 về việc dừng đỗ phương tiện'
        },
        'qcvn-driver': {
            title: 'QCVN06 - Báo cáo tổng hợp theo lái xe',
            icon: 'fas fa-user-tie',
            description: 'Báo cáo tổng hợp theo từng lái xe theo QCVN06'
        },
        'qcvn-vehicle': {
            title: 'QCVN06 - Báo cáo tổng hợp theo xe',
            icon: 'fas fa-car',
            description: 'Báo cáo tổng hợp theo từng phương tiện theo QCVN06'
        },
        'qcvn-journey': {
            title: 'QCVN06 - Hành trình chạy xe',
            icon: 'fas fa-route',
            description: 'Báo cáo hành trình chạy xe tuân thủ QCVN06'
        },
        'qcvn-overspeed': {
            title: 'QCVN06 - Quá tốc độ giới hạn',
            icon: 'fas fa-tachometer-alt',
            description: 'Báo cáo các trường hợp quá tốc độ giới hạn theo QCVN06'
        },
        'qcvn-driving-time': {
            title: 'QCVN06 - Thời gian lái xe liên tục',
            icon: 'fas fa-clock',
            description: 'Báo cáo thời gian lái xe liên tục theo quy định QCVN06'
        },
        'qcvn-speed': {
            title: 'QCVN06 - Tốc độ vận hành của xe',
            icon: 'fas fa-speedometer',
            description: 'Báo cáo tốc độ vận hành của phương tiện theo QCVN06'
        },
        'qcvn-time-violation': {
            title: 'QCVN31/2014 - Tổng hợp vi phạm thời gian',
            icon: 'fas fa-ban',
            description: 'Báo cáo tổng hợp các vi phạm về thời gian theo QCVN31/2014'
        }
    };

    function initSidebarCollapse(storageKey = 'reportSidebarCollapsed') {
        const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'report'
        );

        if (!visiblePageContainer) return;

        const sidebarCol = visiblePageContainer.querySelector('.report-sidebar-col');
        const toggleBtn = sidebarCol?.querySelector('.report-sidebar-toggle');
        const contentCol = visiblePageContainer.querySelector('.report-content-col');
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
            toggleBtn.setAttribute('aria-label', collapsed ? 'Mở danh sách báo cáo' : 'Thu gọn danh sách báo cáo');

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

    function createDefaultReportContent() {
        return `
            <div class="report-page">
                <div class="report-page-header">
                    <h2 class="report-page-title">Tính năng đang được phát triển</h2>
                </div>
            </div>
        `;
    }

    async function createReportContent(title, icon, description) {
        const reportModules = [
            { keywords: ['nhiệt độ', 'Nhiệt độ'], module: TemperatureReport },
            { keywords: ['điểm dừng', 'Điểm dừng'], module: StopPointsReport },
            { keywords: ['hành trình (ADCO)', 'HÀNH TRÌNH (ADCO)'], module: JourneyAdcoReport },
            { keywords: ['lịch sử xe chạy', 'Lịch sử xe chạy', 'LỊCH SỬ XE CHẠY'], module: VehicleHistoryReport },
            { keywords: ['lộ trình theo tuyến', 'Lộ trình theo tuyến', 'LỘ TRÌNH THEO TUYẾN'], module: RouteBasedRoadmapReport },
            { keywords: ['sử dụng nhiên liệu', 'Sử dụng nhiên liệu', 'SỬ DỤNG NHIÊN LIỆU'], module: FuelUsageReport },
            { keywords: ['sự kiện', 'Sự kiện', 'SỰ KIỆN'], module: EventsReport },
            { keywords: ['thống kê vi phạm tốc độ', 'Thống kê vi phạm tốc độ', 'THỐNG KÊ VI PHẠM TỐC ĐỘ'], module: SpeedViolationReport },
            { keywords: ['tổng hợp (mới)', 'Tổng hợp (mới)', 'TỔNG HỢP (MỚI)'], module: SummaryNewReport },
            { keywords: ['tổng hợp làm việc theo 3D', 'Tổng hợp làm việc theo 3D', 'TỔNG HỢP LÀM VIỆC THEO 3D'], module: Summary3dReport },
            { keywords: ['tổng hợp mới (SCI)', 'Tổng hợp mới (SCI)', 'TỔNG HỢP MỚI (SCI)'], module: SummarySciReport }
        ];

        const qcvnModules = [
            { keywords: ['dừng đỗ', 'Dừng đỗ', 'DỪNG ĐỖ'], module: Qcvn06StopReport },
            { keywords: ['tổng hợp theo lái xe', 'Tổng hợp theo lái xe', 'TỔNG HỢP THEO LÁI XE'], module: Qcvn06DriverReport },
            { keywords: ['tổng hợp theo xe', 'Tổng hợp theo xe', 'TỔNG HỢP THEO XE'], module: Qcvn06VehicleReport },
            { keywords: ['hành trình chạy xe', 'Hành trình chạy xe', 'HÀNH TRÌNH CHẠY XE'], module: Qcvn06JourneyReport },
            { keywords: ['quá tốc độ giới hạn', 'Quá tốc độ giới hạn', 'QUÁ TỐC ĐỘ GIỚI HẠN'], module: Qcvn06OverspeedReport },
            { keywords: ['thời gian lái xe liên tục', 'Thời gian lái xe liên tục', 'THỜI GIAN LÁI XE LIÊN TỤC'], module: Qcvn06DrivingTimeReport },
            { keywords: ['tốc độ vận hành của xe', 'Tốc độ vận hành của xe', 'TỐC ĐỘ VẬN HÀNH CỦA XE'], module: Qcvn06SpeedReport }
        ];

        for (const { keywords, module } of reportModules) {
            if (keywords.some(kw => title.includes(kw)) && module) {
                const html = await module.loadHTML();
                if (html) return html;
            }
        }

        const isQcvn = title.includes('QCVN06') || title.includes('qcvn06');
        if (isQcvn) {
            for (const { keywords, module } of qcvnModules) {
                if (keywords.some(kw => title.includes(kw)) && module) {
                    const html = await module.loadHTML();
                    if (html) return html;
                }
            }
        }

        return createDefaultReportContent();
    }

    async function loadReport(reportType) {
        let reportContent = null;
        const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'report'
        );

        if (visiblePageContainer) {
            reportContent = visiblePageContainer.querySelector('#reportContent');
        } else {
            reportContent = document.getElementById('reportContent');
        }

        if (!reportContent) return;

        const report = reportData[reportType];
        if (!report) {
            reportContent.innerHTML = `
                <div class="report-page">
                    <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Báo cáo không tồn tại hoặc đang được phát triển.
                    </div>
                </div>
            `;
            return;
        }

        const content = await createReportContent(report.title, report.icon, report.description);
        reportContent.innerHTML = content;

        const reportModuleMap = {
            'temperature': TemperatureReport,
            'stop-points': StopPointsReport,
            'journey-adco': JourneyAdcoReport,
            'vehicle-history': VehicleHistoryReport,
            'route-by-line': RouteBasedRoadmapReport,
            'fuel-usage': FuelUsageReport,
            'events': EventsReport,
            'speed-violation': SpeedViolationReport,
            'summary-new': SummaryNewReport,
            'summary-3d': Summary3dReport,
            'summary-sci': SummarySciReport,
            'qcvn-stop': Qcvn06StopReport,
            'qcvn-driver': Qcvn06DriverReport,
            'qcvn-vehicle': Qcvn06VehicleReport,
            'qcvn-journey': Qcvn06JourneyReport,
            'qcvn-overspeed': Qcvn06OverspeedReport,
            'qcvn-driving-time': Qcvn06DrivingTimeReport,
            'qcvn-speed': Qcvn06SpeedReport
        };

        const module = reportModuleMap[reportType];
        if (module?.initDateFields) {
            module.initDateFields();
        }
    }

    let isInitialized = false;
    let reportListClickHandler = null;

    async function init() {
        const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'report'
        );

        if (!visiblePageContainer) {
            console.warn('Report page not visible, skipping init');
            return;
        }

        const reportList = visiblePageContainer.querySelector('#reportList');
        const reportContent = visiblePageContainer.querySelector('#reportContent');

        if (!reportList || !reportContent) {
            console.warn('Report elements not found');
            return;
        }

        if (reportListClickHandler) {
            reportList.removeEventListener('click', reportListClickHandler);
        }

        const activeItem = reportList.querySelector('.report-item.active');
        const isLoading = reportContent.querySelector('.report-loading');
        const hasContent = reportContent.innerHTML.trim() && !isLoading;

        if (!activeItem || isLoading || !hasContent) {
            if (isLoading) {
                reportContent.innerHTML = '';
            }

            await loadReport('water-pump');

            const firstItem = reportList.querySelector('.report-item');
            if (firstItem) {
                reportList.querySelectorAll('.report-item').forEach(item => {
                    item.classList.remove('active');
                });
                firstItem.classList.add('active');
            }
        }

        initSidebarCollapse('reportSidebarCollapsed');

        reportListClickHandler = function (e) {
            const reportItem = e.target.closest('.report-item');
            if (!reportItem) return;

            const reportType = reportItem.dataset.report;
            if (!reportType) return;

            reportList.querySelectorAll('.report-item').forEach(item => {
                item.classList.remove('active');
            });

            reportItem.classList.add('active');
            loadReport(reportType);
        };

        reportList.addEventListener('click', reportListClickHandler);
        isInitialized = true;
    }

    function shouldInit() {
        const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'report'
        );
        return visiblePageContainer !== undefined;
    }

    function tryInit() {
        if (shouldInit()) {
            init();
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

    const handleReportPageShow = (e) => {
        if (e.detail?.page === 'report') {
            setTimeout(() => {
                const visiblePageContainer = Array.from(document.querySelectorAll('[data-page]')).find(
                    page => page.style.display !== 'none' && page.getAttribute('data-page') === 'report'
                );
                if (visiblePageContainer) {
                    init();
                }
            }, 200);
        }
    };

    window.addEventListener('pageLoaded', handleReportPageShow);
    window.addEventListener('pageShown', handleReportPageShow);
})();