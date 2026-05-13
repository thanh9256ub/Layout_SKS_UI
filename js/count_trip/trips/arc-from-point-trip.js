// Arc From Point Trip Count Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.CountTripModules = window.CountTripModules || {};

    let arcFromPointData = [];

    const fallbackArcFromPointData = [
        {
            plate: '29A-12345',
            arrivalDate: '27/11/2025',
            timeAtPoint: '08:30:15',
            timeLeavePoint: '09:45:20',
            toPoint: 'Diem B',
            toPointArrivalDate: '27/11/2025',
            toPointArrivalTime: '10:05:30',
            kmTraveled: '15.5',
            arc: 'A - B',
            stopped: true,
            lifted: false
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            timeAtPoint: '10:15:30',
            timeLeavePoint: '11:20:45',
            toPoint: 'Diem C',
            toPointArrivalDate: '27/11/2025',
            toPointArrivalTime: '11:50:20',
            kmTraveled: '12.3',
            arc: 'A - C',
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
            arcFromPointData = fallbackArcFromPointData;
            return arcFromPointData;
        }

        try {
            const response = await fetch(`${APP_ROOT}json/count_trip_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            arcFromPointData = Array.isArray(data.arcFromPoint) ? data.arcFromPoint : [];
        } catch (error) {
            console.warn('Error loading arc from point data, using fallback data:', error);
            arcFromPointData = fallbackArcFromPointData;
        }

        return arcFromPointData;
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/trips/arc-from-point-trip.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading arc-from-point-trip HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const dateFromField = document.getElementById('arcFromPointDateFrom');
        const dateToField = document.getElementById('arcFromPointDateTo');

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
            if (arcFromPointData.length === 0) {
                arcFromPointData = await loadData();
            }

            let tableHTML = '';
            arcFromPointData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate || '-'}</strong></td>
                        <td>${row.arrivalDate || '-'}</td>
                        <td>${row.timeAtPoint || '-'}</td>
                        <td>${row.timeLeavePoint || '-'}</td>
                        <td><strong>${row.toPoint || '-'}</strong></td>
                        <td>${row.toPointArrivalDate || '-'}</td>
                        <td>${row.toPointArrivalTime || '-'}</td>
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
            const btn = e.target.closest('#arcFromPointSubmit');
            if (btn) {
                const tableBody = document.getElementById('arcFromPointTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
    }

    window.CountTripModules.ArcFromPointTrip = {
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
