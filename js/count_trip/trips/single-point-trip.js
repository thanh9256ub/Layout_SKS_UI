// Single Point Trip Count Module
(function () {
    'use strict';

    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    window.CountTripModules = window.CountTripModules || {};

    let singlePointData = [];

    const fallbackSinglePointData = [
        {
            plate: '29A-12345',
            arrivalDate: '27/11/2025',
            arrivalTime: '08:30:15',
            departureDate: '27/11/2025',
            departureTime: '09:45:20',
            stayDuration: '01:15:05',
            timeSincePrevious: '02:30:10',
            distance: '15.5',
            stopped: true,
            lifted: false
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        },
        {
            plate: '30B-67890',
            arrivalDate: '27/11/2025',
            arrivalTime: '10:15:30',
            departureDate: '27/11/2025',
            departureTime: '11:20:45',
            stayDuration: '01:05:15',
            timeSincePrevious: '00:30:10',
            distance: '12.3',
            stopped: true,
            lifted: true
        }
    ];
    function isYes(value) {
        return value === true || ['yes', 'y', 'true', '1', 'co', 'có', 'cÃ³'].includes(String(value).trim().toLowerCase());
    }

    function renderStatusText(value) {
        return isYes(value) ? 'Co' : 'Khong';
    }

    async function loadData() {
        if (window.location.protocol === 'file:') {
            singlePointData = fallbackSinglePointData;
            return singlePointData;
        }

        try {
            const response = await fetch(`${APP_ROOT}json/count_trip_data.json`);
            if (!response.ok) throw new Error('Failed to load data');
            const data = await response.json();
            singlePointData = Array.isArray(data.singlePoint) ? data.singlePoint : [];
        } catch (error) {
            console.warn('Error loading single point data, using fallback data:', error);
            singlePointData = fallbackSinglePointData;
        }

        return singlePointData;
    }

    async function loadHTML() {
        try {
            const response = await fetch('html/trips/single-point-trip.html');
            if (!response.ok) throw new Error('Failed to load HTML');
            const html = await response.text();
            return html;
        } catch (error) {
            console.error('Error loading single-point-trip HTML:', error);
            return null;
        }
    }

    function initDateFields() {
        const today = new Date();
        const dateStr = today.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });

        const dateFromField = document.getElementById('singlePointDateFrom');
        const dateToField = document.getElementById('singlePointDateTo');

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
            if (singlePointData.length === 0) {
                singlePointData = await loadData();
            }

            let tableHTML = '';
            singlePointData.forEach((row) => {
                tableHTML += `
                    <tr>
                        <td><strong>${row.plate}</strong></td>
                        <td>${row.arrivalDate}</td>
                        <td>${row.arrivalTime}</td>
                        <td>${row.departureDate}</td>
                        <td>${row.departureTime}</td>
                        <td><strong style="color: #0dcaf0;">${row.stayDuration}</strong></td>
                        <td>${row.timeSincePrevious}</td>
                        <td><strong>${row.distance}</strong></td>
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
                row.style.transition = 'all 0.3s ease';
                row.style.opacity = '1';
                row.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }

    function init() {
        document.addEventListener('click', function (e) {
            const btn = e.target.closest('#singlePointSubmit');
            if (btn) {
                const tableBody = document.getElementById('singlePointTableBody');
                if (tableBody) {
                    handleSubmit(btn, tableBody);
                }
            }
        });
        //loadData();
    }

    window.CountTripModules.SinglePointTrip = {
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
