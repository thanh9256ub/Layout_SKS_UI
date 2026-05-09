// Vehicle History Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let vehicleHistoryData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            vehicleHistoryData = data.vehicleHistory || [];
            return vehicleHistoryData;
        } catch (error) {
            console.error('Error loading vehicle history data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/vehicle-history-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading vehicle-history-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateField = document.getElementById('vehicleHistoryDate');
        if (dateField && !dateField.value) {
            dateField.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (vehicleHistoryData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            vehicleHistoryData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td>${row.time}</td>
                        <td>${row.coordinate}</td>
                        <td><strong>${row.speed}</strong></td>
                        <td>${row.machineStatus}</td>
                        <td>${row.gpsStatus}</td>
                        <td><strong style="color: #3b82f6;">${row.fuel}</strong></td>
                        <td>${row.address}</td>
                        <td>${row.vibration}</td>
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
            const btn = e.target.closest('#vehicleHistorySubmit');
            if (btn) {
                const tableBody = document.getElementById('vehicleHistoryTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.VehicleHistoryReport = {
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