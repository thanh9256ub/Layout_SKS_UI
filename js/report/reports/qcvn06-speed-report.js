// QCVN06 Speed Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let qcvn06SpeedData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            qcvn06SpeedData = data.qcvn06Speed || [];
            return qcvn06SpeedData;
        } catch (error) {
            console.error('Error loading QCVN06 speed data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/qcvn06-speed-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading qcvn06-speed-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateField = document.getElementById('qcvn06SpeedDate');
        if (dateField && !dateField.value) {
            dateField.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (qcvn06SpeedData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            qcvn06SpeedData.forEach((row, index) => {
                tableHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${row.time || '-'}</td>
                        <td><strong>${row.speeds || '-'}</strong></td>
                        <td>${row.notes || '-'}</td>
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
            const btn = e.target.closest('#qcvn06SpeedSubmit');
            if (btn) {
                const tableBody = document.getElementById('qcvn06SpeedTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.Qcvn06SpeedReport = {
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

