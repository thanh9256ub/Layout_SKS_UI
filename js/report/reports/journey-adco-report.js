(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let journeyAdcoData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            journeyAdcoData = data.journeyAdco || [];
            return journeyAdcoData;
        } catch (error) {
            console.error('Error loading journey ADCO data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/journey-adco-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading journey-adco-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const dateFrom = document.getElementById('journeyAdcoDateFrom');
        const dateTo = document.getElementById('journeyAdcoDateTo');

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
            if (journeyAdcoData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            journeyAdcoData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate}</strong></td>
                        <td>${row.start}</td>
                        <td>${row.end}</td>
                        <td><strong>${row.km}</strong></td>
                        <td>${row.maxSpeed}</td>
                        <td>${row.avgSpeed}</td>
                        <td>${row.startLocation}</td>
                        <td>${row.endLocation}</td>
                        <td>${row.drivingTime}</td>
                        <td>${row.restTime}</td>
                        <td>${row.workingTime}</td>
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
            const btn = e.target.closest('#journeyAdcoSubmit');
            if (btn) {
                const tableBody = document.getElementById('journeyAdcoTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.JourneyAdcoReport = {
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