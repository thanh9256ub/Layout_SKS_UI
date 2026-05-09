// Speed Violation Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let speedViolationData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            speedViolationData = data.speedViolation || [];
            return speedViolationData;
        } catch (error) {
            console.error('Error loading speed violation data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/speed-violation-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading speed-violation-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
        
        const dateField = document.getElementById('speedViolationDate');
        if (dateField && !dateField.value) {
            dateField.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            if (speedViolationData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            speedViolationData.forEach((row) => {
                const speed = parseFloat(row.speed) || 0;
                const speedLimit = parseFloat(row.speedLimit) || 0;
                const speedClass = speed > speedLimit ? 'text-danger' : '';
                
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || ''}</strong></td>
                        <td>${row.time || ''}</td>
                        <td>${row.coordinate || ''}</td>
                        <td><strong class="${speedClass}">${row.speed || '0'} km/h</strong></td>
                        <td>${row.speedLimit || '0'} km/h</td>
                        <td>${row.address || ''}</td>
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
            const btn = e.target.closest('#speedViolationSubmit');
            if (btn) {
                const tableBody = document.getElementById('speedViolationTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.SpeedViolationReport = {
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

