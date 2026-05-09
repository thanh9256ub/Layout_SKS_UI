// Temperature Report Module
(function () {
    'use strict';

    // Khởi tạo namespace
    window.ReportModules = window.ReportModules || {};

    // Data store
    let temperatureData = [];

    // Load dữ liệu từ JSON
    async function loadData() {
        try {
            const response = await fetch('json/report_data.json');
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            temperatureData = data.temperature || [];
            return temperatureData;
        } catch (error) {
            console.error('Error loading temperature data:', error);
            return [];
        }
    }

    // Load HTML từ file
    async function loadHTML() {
        try {
            const response = await fetch('html/reports/temperature-report.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading temperature-report HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        
        const dateField = document.getElementById('temperatureDate');
        if (dateField && !dateField.value) {
            dateField.value = dateStr;
        }
    }

    // Xử lý khi nhấn nút xem báo cáo
    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
        btn.disabled = true;

        setTimeout(async () => {
            // Load data nếu chưa có
            if (temperatureData.length === 0) {
                await loadData();
            }

            // Tạo HTML cho bảng
            let tableHTML = '';
            temperatureData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td>${row.time}</td>
                        <td>${row.coordinate}</td>
                        <td>${row.speed}</td>
                        <td>${row.machineStatus}</td>
                        <td>${row.gpsStatus}</td>
                        <td><strong>${row.temperA}</strong></td>
                        <td><strong>${row.temperB}</strong></td>
                        <td>${row.address}</td>
                        <td>${row.vibration}</td>
                    </tr>
                `;
            });

            tableBody.innerHTML = tableHTML;

            // Khôi phục nút
            btn.innerHTML = originalHTML;
            btn.disabled = false;

            // Animation
            animateTableRows(tableBody);
        }, 800);
    }

    // Animation cho các dòng bảng
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

    // Khởi tạo event listeners
    function init() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('#temperatureSubmit');
            if (btn) {
                const tableBody = document.getElementById('temperatureTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });

        // Load data khi module được tải
        loadData();
    }

    // Export module
    window.ReportModules.TemperatureReport = {
        loadHTML,
        handleSubmit,
        loadData,
        initDateFields
    };

    // Khởi tạo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();