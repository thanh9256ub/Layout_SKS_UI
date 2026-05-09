// Arc To Point Trip Count Module
(function () {
    'use strict';

    window.CountTripModules = window.CountTripModules || {};

    let arcToPointData = [];

    // async function loadData() {
    //     try {
    //         const response = await fetch('json/count_trip_data.json');
    //         if (!response.ok) throw new Error('Failed to load data');
    //         const data = await response.json();
    //         arcToPointData = data.arcToPoint || [];
    //         return arcToPointData;
    //     } catch (error) {
    //         console.error('Error loading arc to point data:', error);
    //         return [];
    //     }
    // }

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
        btn.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Đang tải...';
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
                        <td><span class="badge ${row.stopped === 'Có' ? 'bg-success' : 'bg-secondary'}">${row.stopped || '-'}</span></td>
                        <td><span class="badge ${row.lifted === 'Có' ? 'bg-warning' : 'bg-secondary'}">${row.lifted || '-'}</span></td>
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
            const btn = e.target.closest('#arcToPointSubmit');
            if (btn) {
                const tableBody = document.getElementById('arcToPointTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        // loadData();
    }

    window.CountTripModules.ArcToPointTrip = {
        loadHTML,
        handleSubmit,
        //loadData,
        initDateFields
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

