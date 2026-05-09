// Fuel Usage Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let fuelUsageData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            fuelUsageData = data.fuelUsage || [];
            return fuelUsageData;
        } catch (error) {
            console.error('Error loading fuel usage data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/fuel-usage-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading fuel-usage-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateFrom = document.getElementById('fuelUsageDateFrom');
        const dateTo = document.getElementById('fuelUsageDateTo');
        
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
            if (fuelUsageData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            fuelUsageData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || ''}</strong></td>
                        <td>${row.date || ''}</td>
                        <td>${row.time || ''}</td>
                        <td><strong>${row.inTank || '0'}</strong></td>
                        <td>${row.initialStock || '0'}</td>
                        <td>${row.added || '0'}</td>
                        <td><strong style="color: #dc3545;">${row.consumed || '0'}</strong></td>
                        <td>${row.finalStock || '0'}</td>
                        <td>${row.location || ''}</td>
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
            const btn = e.target.closest('#fuelUsageSubmit');
            if (btn) {
                const tableBody = document.getElementById('fuelUsageTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.FuelUsageReport = {
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

