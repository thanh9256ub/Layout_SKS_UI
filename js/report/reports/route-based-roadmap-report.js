// Route Based Roadmap Report Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.ReportModules = window.ReportModules || {};

    let routeBasedRoadmapData = [];

    async function loadData() {
        try {
            const response = await fetch(`${APP_ROOT}json/report_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            routeBasedRoadmapData = data.routeBasedRoadmap || [];
            return routeBasedRoadmapData;
        } catch (error) {
            console.error('Error loading route based roadmap data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch(`${APP_ROOT}html/reports/route-based-roadmap-report.html`);
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading route-based-roadmap-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });

        const dateFrom = document.getElementById('routeBasedRoadmapDateFrom');
        const dateTo = document.getElementById('routeBasedRoadmapDateTo');

        if (dateFrom && !dateFrom.value) {
            dateFrom.value = dateStr;
        }
        if (dateTo && !dateTo.value) {
            dateTo.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (routeBasedRoadmapData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            routeBasedRoadmapData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || ''}</strong></td>
                        <td>${row.startEnd || ''}</td>
                        <td>${row.departureDestination || ''}</td>
                        <td>${row.checkPoint || ''}</td>
                        <td>${row.arrivalTime || ''}</td>
                        <td>${row.timeSpent || ''}</td>
                        <td>${row.stopAtPoint || ''}</td>
                        <td><strong>${row.km || '0'}</strong></td>
                        <td>${row.numberOfStops || '0'}</td>
                        <td>${row.cumulativeStops || '0'}</td>
                        <td>${row.overspeed || '0'}</td>
                        <td>${row.cumulativeOverspeed || '0'}</td>
                    </tr>
                `;
            });

            tableBody.innerHTML = tableHTML;
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            animateTableRows(tableBody);
        }, 100);
    }

    function animateTableRows(tableBody) {
        const rows = tableBody.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.style.opacity = '0';
            row.style.transform = 'translateY(20px)';
            setTimeout(() => {
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    function init() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('#routeBasedRoadmapSubmit');
            if (btn) {
                const tableBody = document.getElementById('routeBasedRoadmapTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.RouteBasedRoadmapReport = {
        loadHTML,
        handleSubmit,
        loadData,
        initDateFields
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

