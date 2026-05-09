// QCVN06 Journey Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let qcvn06JourneyData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            qcvn06JourneyData = data.qcvn06Journey || [];
            return qcvn06JourneyData;
        } catch (error) {
            console.error('Error loading QCVN06 journey data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/qcvn06-journey-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading qcvn06-journey-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateField = document.getElementById('qcvn06JourneyDate');
        if (dateField && !dateField.value) {
            dateField.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (qcvn06JourneyData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            qcvn06JourneyData.forEach((row, index) => {
                tableHTML += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${row.time || '-'}</td>
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
            const btn = e.target.closest('#qcvn06JourneySubmit');
            if (btn) {
                const tableBody = document.getElementById('qcvn06JourneyTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.Qcvn06JourneyReport = {
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

