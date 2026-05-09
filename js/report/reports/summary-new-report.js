// Summary New Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let summaryNewData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            summaryNewData = data.summaryNew || [];
            return summaryNewData;
        } catch (error) {
            console.error('Error loading summary new data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/summary-new-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading summary-new-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
        
        const dateFrom = document.getElementById('summaryNewDateFrom');
        const dateTo = document.getElementById('summaryNewDateTo');
        
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
            if (summaryNewData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            summaryNewData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || ''}</strong></td>
                        <td><strong>${row.km || '0'}</strong></td>
                        <td>${row.runningTime || '0'}</td>
                        <td>${row.idlingTime || '0'}</td>
                        <td>${row.workingTimeBySensor || '0'}</td>
                        <td>${row.stoppingTime || '0'}</td>
                        <td>${row.numberOfStops || '0'}</td>
                        <td><strong style="color: #dc3545;">${row.numberOfOverspeeds || '0'}</strong></td>
                        <td><strong>${row.maxSpeed || '0'} km/h</strong></td>
                        <td><strong style="color: #dc3545;">${row.fuelConsumed || '0'}</strong></td>
                        <td>${row.fuelAdded || '0'}</td>
                        <td>${row.route || ''}</td>
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
            const btn = e.target.closest('#summaryNewSubmit');
            if (btn) {
                const tableBody = document.getElementById('summaryNewTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.SummaryNewReport = {
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

