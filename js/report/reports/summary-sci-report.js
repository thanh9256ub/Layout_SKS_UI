// Summary SCI Report Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.ReportModules = window.ReportModules || {};

    let summarySciData = [];

    async function loadData() {
        try {
            const response = await fetch(`${APP_ROOT}json/report_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            summarySciData = data.summarySci || [];
            return summarySciData;
        } catch (error) {
            console.error('Error loading summary SCI data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch(`${APP_ROOT}html/reports/summary-sci-report.html`);
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading summary-sci-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
        
        const dateFrom = document.getElementById('summarySciDateFrom');
        const dateTo = document.getElementById('summarySciDateTo');
        
        if (dateFrom && !dateFrom.value) {
            dateFrom.value = dateStr;
        }
        if (dateTo && !dateTo.value) {
            dateTo.value = dateStr;
        }
    }

    function formatNumber(num) {
        if (!num || num === '0' || num === 0) return '0';
        return parseFloat(num).toLocaleString('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 2 });
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (summarySciData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            summarySciData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td style="text-align: left;"><strong>${row.plate || ''}</strong></td>
                        <td style="text-align: center;">${row.date || ''}</td>
                        <td style="text-align: right;"><strong>${formatNumber(row.kmTraveled || row.km || '0')}</strong></td>
                        <td style="text-align: right;">${formatNumber(row.engineRunningTime || '0')}</td>
                        <td style="text-align: right;">${formatNumber(row.engineIdlingTime || '0')}</td>
                        <td style="text-align: right;"><strong>${formatNumber(row.totalWorkingTime || '0')}</strong></td>
                        <td style="text-align: right;">${formatNumber(row.workingTimeBySensor || '0')}</td>
                        <td style="text-align: right;">${formatNumber(row.stoppingTime || '0')}</td>
                        <td style="text-align: right;"><strong style="color: #dc3545;">${row.overspeedCount || '0'}</strong></td>
                        <td style="text-align: right;"><strong>${row.maxSpeed || '0'} km/h</strong></td>
                        <td style="text-align: right;"><strong style="color: #dc3545;">${formatNumber(row.fuelConsumption || '0')}</strong></td>
                        <td style="text-align: right;">${formatNumber(row.fuelSupplied || '0')}</td>
                    </tr>
                `;
            });

            tableBody.innerHTML = tableHTML;
            btn.innerHTML = originalHTML;
            btn.disabled = false;
            animateTableRows(tableBody);
        }, 800);
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
            const btn = e.target.closest('#summarySciSubmit');
            if (btn) {
                const tableBody = document.getElementById('summarySciTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.SummarySciReport = {
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

