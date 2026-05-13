// Arc To Point Trip Count Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.CountTripModules = window.CountTripModules || {};

    let arcToPointData = [];

    const fallbackArcToPointData = [
        {
            plate: '29A-12345',
            departureTime: '08:30:15',
            fromPoint: 'Diem A',
            arrivalDate: '27/11/2025',
            arrivalTime: '09:45:20',
            departureDate: '27/11/2025',
            kmTraveled: '15.5',
            arc: 'A - B',
            stopped: true,
            lifted: false
        },
        {
            plate: '30B-67890',
            departureTime: '10:15:30',
            fromPoint: 'Diem C',
            arrivalDate: '27/11/2025',
            arrivalTime: '11:20:45',
            departureDate: '27/11/2025',
            kmTraveled: '12.3',
            arc: 'C - B',
            stopped: true,
            lifted: true
        }
    ];

    function isYes(value) {
        return value === true || ['yes', 'y', 'true', '1', 'co', 'cÃ³', 'cÃƒÂ³'].includes(String(value).trim().toLowerCase());
    }

    function renderStatusText(value) {
        return isYes(value) ? 'Co' : 'Khong';
    }

    async function loadData() {
        if (window.location.protocol === 'file:') {
            arcToPointData = fallbackArcToPointData;
            return arcToPointData;
        }

        try {
            const response = await fetch(`${APP_ROOT}json/count_trip_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            arcToPointData = Array.isArray(data.arcToPoint) ? data.arcToPoint : [];
        } catch (error) {
            console.warn('Error loading arc to point data, using fallback data:', error);
            arcToPointData = fallbackArcToPointData;
        }

        return arcToPointData;
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/trips/arc-to-point-trip.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading arc-to-point-trip HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const dateFromField = document.getElementById('arcToPointDateFrom');
        const dateToField = document.getElementById('arcToPointDateTo');

        if (dateFromField && !dateFromField.value) {
            dateFromField.value = dateStr;
        }
        if (dateToField && !dateToField.value) {
            dateToField.value = dateStr;
        }
    }

    function handleSubmit(btn, tableBody) {
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Dang tai...';
        btn.disabled = true;

        setTimeout(async () => {
            if (arcToPointData.length === 0) {
                arcToPointData = await loadData();
            }

            let tableHTML = '';
            arcToPointData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || '-'}</strong></td>
                        <td>${row.departureTime || '-'}</td>
                        <td><strong>${row.fromPoint || '-'}</strong></td>
                        <td>${row.arrivalDate || '-'}</td>
                        <td>${row.arrivalTime || '-'}</td>
                        <td>${row.departureDate || '-'}</td>
                        <td>${row.departureTime || '-'}</td>
                        <td><strong>${row.kmTraveled || '-'}</strong></td>
                        <td><strong style="color: #0dcaf0;">${row.arc || '-'}</strong></td>
                        <td>${renderStatusText(row.stopped)}</td>
                        <td>${renderStatusText(row.lifted)}</td>
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
                row.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    function init() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('#arcToPointSubmit');
            if (btn) {
                const tableBody = document.getElementById('arcToPointTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
    }

    window.CountTripModules.ArcToPointTrip = {
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
