// Summary 3D Report Module
(function () {
    'use strict';

    window.ReportModules = window.ReportModules || {};

    let summary3dData = [];

    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            summary3dData = data.summary3d || [];
            return summary3dData;
        } catch (error) {
            console.error('Error loading summary 3d data:', error);
            return [];
        }
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/reports/summary-3d-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading summary-3d-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: '2-digit' });
        
        const dateFrom = document.getElementById('summary3dDateFrom');
        const dateTo = document.getElementById('summary3dDateTo');
        
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
            if (summary3dData.length === 0) {
                await loadData();
            }

            let tableHTML = '';
            summary3dData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || ''}</strong></td>
                        <td>${row.date || ''}</td>
                        <td><strong>${row.km || '0'}</strong></td>
                        <td>${row.machine3dOn || '0'}</td>
                        <td>${row.engineStop || '0'}</td>
                        <td>${row.machineShutdown || '0'}</td>
                        <td><strong style="color: #dc3545;">${row.fuelConsumed || '0'}</strong></td>
                        <td>${row.fuelSupplied || '0'}</td>
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
            const btn = e.target.closest('#summary3dSubmit');
            if (btn) {
                const tableBody = document.getElementById('summary3dTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        loadData();
    }

    window.ReportModules.Summary3dReport = {
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

