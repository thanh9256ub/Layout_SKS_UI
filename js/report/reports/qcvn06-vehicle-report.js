// QCVN06 Vehicle Report Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.ReportModules = window.ReportModules || {};

    let qcvn06VehicleData = [];

    async function loadData() {
        try {
            const response = await fetch(`${APP_ROOT}json/report_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            qcvn06VehicleData = data.qcvn06Vehicle || [];
            return qcvn06VehicleData;
        } catch (error) {
            console.error('Error loading QCVN06 vehicle data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch(`${APP_ROOT}html/reports/qcvn06-vehicle-report.html`);
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading qcvn06-vehicle-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateFromField = document.getElementById('qcvn06VehicleDateFrom');
        const dateToField = document.getElementById('qcvn06VehicleDateTo');
        
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
            if (qcvn06VehicleData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            qcvn06VehicleData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || '-'}</strong></td>
                        <td>${row.activityType || '-'}</td>
                        <td>${row.totalKm ? row.totalKm.toLocaleString('vi-VN') : '-'}</td>
                        <td>${row.overspeedRatio5to10 || '-'}</td>
                        <td>${row.overspeedRatio10to20 || '-'}</td>
                        <td>${row.overspeedRatio20to35 || '-'}</td>
                        <td>${row.overspeedRatioAbove35 || '-'}</td>
                        <td>${row.overspeedCount5to10 || 0}</td>
                        <td>${row.overspeedCount10to20 || 0}</td>
                        <td>${row.overspeedCount20to35 || 0}</td>
                        <td>${row.overspeedCountAbove35 || 0}</td>
                        <td>${row.totalStops || 0}</td>
                        <td>${row.overspeedRatioPer1000km || '-'}</td>
                        <td><strong>${row.totalOverspeedCount || 0}</strong></td>
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
            const btn = e.target.closest('#qcvn06VehicleSubmit');
            if (btn) {
                const tableBody = document.getElementById('qcvn06VehicleTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.Qcvn06VehicleReport = {
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

