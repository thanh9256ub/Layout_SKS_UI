// QCVN06 Driver Report Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.ReportModules = window.ReportModules || {};

    let qcvn06DriverData = [];

    async function loadData() {
        try {
            const response = await fetch(`${APP_ROOT}json/report_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            qcvn06DriverData = data.qcvn06Driver || [];
            return qcvn06DriverData;
        } catch (error) {
            console.error('Error loading QCVN06 driver data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch(`${APP_ROOT}html/reports/qcvn06-driver-report.html`);
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading qcvn06-driver-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateFromField = document.getElementById('qcvn06DriverDateFrom');
        const dateToField = document.getElementById('qcvn06DriverDateTo');
        
        if (dateFromField && !dateFromField.value) {
            dateFromField.value = dateStr;
        }
        if (dateToField && !dateToField.value) {
            dateToField.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (qcvn06DriverData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            qcvn06DriverData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.driverName || '-'}</strong></td>
                        <td>${row.licenseNumber || '-'}</td>
                        <td>${row.totalKm ? row.totalKm.toLocaleString('vi-VN') : '-'}</td>
                        <td>${row.overspeedRatio5to10 || '-'}</td>
                        <td>${row.overspeedRatio10to20 || '-'}</td>
                        <td>${row.overspeedRatio20to35 || '-'}</td>
                        <td>${row.overspeedRatioAbove35 || '-'}</td>
                        <td>${row.overspeedCount5to10 || 0}</td>
                        <td>${row.overspeedCount10to20 || 0}</td>
                        <td>${row.overspeedCount20to35 || 0}</td>
                        <td>${row.overspeedCountAbove35 || 0}</td>
                        <td>${row.continuousDrivingOver4h || 0}</td>
                        <td>${row.overspeedRatioPer1000km || '-'}</td>
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
            const btn = e.target.closest('#qcvn06DriverSubmit');
            if (btn) {
                const tableBody = document.getElementById('qcvn06DriverTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.Qcvn06DriverReport = {
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

