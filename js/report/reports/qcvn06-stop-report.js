// QCVN06 Stop Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let qcvn06StopData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            qcvn06StopData = data.qcvn06Stop || [];
            return qcvn06StopData;
        } catch (error) {
            console.error('Error loading QCVN06 stop data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/qcvn06-stop-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading qcvn06-stop-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateFromField = document.getElementById('qcvn06StopDateFrom');
        const dateToField = document.getElementById('qcvn06StopDateTo');
        
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
            if (qcvn06StopData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            qcvn06StopData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || '-'}</strong></td>
                        <td>${row.driverName || '-'}</td>
                        <td>${row.licenseNumber || '-'}</td>
                        <td>${row.operationType || '-'}</td>
                        <td>${row.stopTime || '-'}</td>
                        <td>${row.stopDuration || '-'}</td>
                        <td>${row.coordinates || '-'}</td>
                        <td>${row.location || '-'}</td>
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
            const btn = e.target.closest('#qcvn06StopSubmit');
            if (btn) {
                const tableBody = document.getElementById('qcvn06StopTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.Qcvn06StopReport = {
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

