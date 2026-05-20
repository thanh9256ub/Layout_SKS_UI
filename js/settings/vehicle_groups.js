(function () {
    'use strict';

    const VEHICLES = [
        { id: 'v1', plate: '36HC-011.72', device: '6900005324', route: 'Tuyến A' },
        { id: 'v2', plate: '36HC-011.74', device: '6900005290', route: 'Tuyến A' },
        { id: 'v3', plate: '36HC-011.75', device: '6900005231', route: 'Tuyến B' },
        { id: 'v4', plate: '36HC-011.76', device: '6900005387', route: 'Tuyến B' },
        { id: 'v5', plate: '36HC-011.79', device: '6900005396', route: 'Tuyến C' },
        { id: 'v6', plate: '36HC-011.81', device: '6900005206', route: 'Tuyến C' },
        { id: 'v7', plate: '36HC-011.82', device: '6900005122', route: 'Tuyến D' },
        { id: 'v8', plate: '36HC-011.85', device: '6900005420', route: 'Tuyến D' },
        { id: 'v9', plate: '36HC-011.86', device: '6900005476', route: 'Tuyến E' },
        { id: 'v10', plate: '36HC-011.87', device: '6900005102', route: 'Tuyến E' },
        { id: 'v11', plate: '51C-812.30', device: '6900006210', route: 'Tuyến Nam' },
        { id: 'v12', plate: '29H-205.17', device: '6900007142', route: 'Tuyến Bắc' }
    ];

    const USERS = [
        { id: 'u1', username: 'huytv', name: 'Lê Việt Huy - Test', code: 'NV001' },
        { id: 'u2', username: 'vtamson', name: 'Hợp tác xã vận tải Sầm Sơn', code: 'KH329' },
        { id: 'u3', username: 'admin', name: 'Quản trị hệ thống', code: 'ADM' },
        { id: 'u4', username: 'operator01', name: 'Nhân viên vận hành 01', code: 'NV104' }
    ];

    const GROUP_PRESETS = {
        all: {
            vehicles: ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7', 'v8', 'v9', 'v10'],
            users: ['u2']
        },
        north: {
            vehicles: ['v3', 'v4', 'v12'],
            users: ['u1', 'u3']
        },
        south: {
            vehicles: ['v5', 'v6', 'v11'],
            users: ['u2', 'u4']
        }
    };

    const state = {
        selectedVehicleIds: new Set(GROUP_PRESETS.all.vehicles),
        selectedUserIds: new Set(GROUP_PRESETS.all.users),
        activeVehicleId: null,
        activeVehicleSide: 'selected',
        activeUserId: null,
        activeUserSide: 'selected'
    };

    function getVisiblePage() {
        return Array.from(document.querySelectorAll('[data-page]')).find(
            page => page.style.display !== 'none' && page.getAttribute('data-page') === 'vehicleGroups'
        );
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    function matchesSearch(item, search, fields) {
        const term = normalize(search);
        if (!term) return true;
        return fields.some(field => normalize(item[field]).includes(term));
    }

    function partition(items, selectedIds) {
        return {
            available: items.filter(item => !selectedIds.has(item.id)),
            selected: items.filter(item => selectedIds.has(item.id))
        };
    }

    function renderRows(tbody, items, columns, activeId, side, type) {
        if (!tbody) return;
        tbody.innerHTML = '';

        if (!items.length) {
            const emptyRow = document.createElement('tr');
            emptyRow.className = 'vg-empty-row';
            emptyRow.innerHTML = `<td colspan="${columns.length}">Không có dữ liệu</td>`;
            tbody.appendChild(emptyRow);
            return;
        }

        items.forEach(item => {
            const row = document.createElement('tr');
            row.dataset.id = item.id;
            row.dataset.side = side;
            row.dataset.type = type;
            row.className = activeId === item.id ? 'is-selected' : '';
            row.innerHTML = columns.map(column => `<td>${item[column]}</td>`).join('');
            tbody.appendChild(row);
        });
    }

    function setCount(container, id, count) {
        const el = container.querySelector(`#${id}`);
        if (el) el.textContent = count;
    }

    function render(container) {
        const vehicles = partition(VEHICLES, state.selectedVehicleIds);
        const users = partition(USERS, state.selectedUserIds);

        const availableVehicleSearch = container.querySelector('#availableVehicleSearch')?.value;
        const selectedVehicleSearch = container.querySelector('#selectedVehicleSearch')?.value;
        const availableUserSearch = container.querySelector('#availableUserSearch')?.value;
        const selectedUserSearch = container.querySelector('#selectedUserSearch')?.value;

        const availableVehicles = vehicles.available.filter(item => matchesSearch(item, availableVehicleSearch, ['plate', 'device', 'route']));
        const selectedVehicles = vehicles.selected.filter(item => matchesSearch(item, selectedVehicleSearch, ['plate', 'device', 'route']));
        const availableUsers = users.available.filter(item => matchesSearch(item, availableUserSearch, ['username', 'name', 'code']));
        const selectedUsers = users.selected.filter(item => matchesSearch(item, selectedUserSearch, ['username', 'name', 'code']));

        renderRows(container.querySelector('#availableVehicleBody'), availableVehicles, ['plate', 'device', 'route'], state.activeVehicleId, 'available', 'vehicle');
        renderRows(container.querySelector('#selectedVehicleBody'), selectedVehicles, ['plate', 'device', 'route'], state.activeVehicleId, 'selected', 'vehicle');
        renderRows(container.querySelector('#availableUserBody'), availableUsers, ['username', 'name', 'code'], state.activeUserId, 'available', 'user');
        renderRows(container.querySelector('#selectedUserBody'), selectedUsers, ['username', 'name', 'code'], state.activeUserId, 'selected', 'user');

        setCount(container, 'availableVehicleCount', vehicles.available.length);
        setCount(container, 'selectedVehicleCount', vehicles.selected.length);
        setCount(container, 'availableUserCount', users.available.length);
        setCount(container, 'selectedUserCount', users.selected.length);
    }

    function showMessage(container, message, type = 'success') {
        const messageEl = container.querySelector('#vehicleGroupsMessage');
        if (!messageEl) return;
        messageEl.textContent = message;
        messageEl.dataset.type = type;
        window.clearTimeout(showMessage.timeoutId);
        showMessage.timeoutId = window.setTimeout(() => {
            messageEl.textContent = '';
            delete messageEl.dataset.type;
        }, 2400);
    }

    function moveOne(container, type, direction) {
        const isVehicle = type === 'vehicle';
        const selectedIds = isVehicle ? state.selectedVehicleIds : state.selectedUserIds;
        const activeId = isVehicle ? state.activeVehicleId : state.activeUserId;
        const activeSide = isVehicle ? state.activeVehicleSide : state.activeUserSide;

        if (!activeId || activeSide !== direction.from) {
            showMessage(container, 'Vui lòng chọn một dòng cần chuyển.', 'warning');
            return;
        }

        if (direction.to === 'selected') {
            selectedIds.add(activeId);
        } else {
            selectedIds.delete(activeId);
        }

        if (isVehicle) {
            state.activeVehicleSide = direction.to;
        } else {
            state.activeUserSide = direction.to;
        }
        render(container);
    }

    function moveAll(container, type, toSelected) {
        const selectedIds = type === 'vehicle' ? state.selectedVehicleIds : state.selectedUserIds;
        const items = type === 'vehicle' ? VEHICLES : USERS;

        if (toSelected) {
            items.forEach(item => selectedIds.add(item.id));
        } else {
            selectedIds.clear();
        }

        render(container);
    }

    function loadPreset(container, groupId) {
        const preset = GROUP_PRESETS[groupId] || GROUP_PRESETS.all;
        state.selectedVehicleIds = new Set(preset.vehicles);
        state.selectedUserIds = new Set(preset.users);
        state.activeVehicleId = null;
        state.activeUserId = null;
        render(container);
    }

    function initVehicleGroupsPage() {
        const container = getVisiblePage();
        if (!container || container.dataset.vehicleGroupsReady === 'true') return;
        container.dataset.vehicleGroupsReady = 'true';

        container.querySelectorAll('input[type="search"]').forEach(input => {
            input.addEventListener('input', () => render(container));
        });

        container.querySelector('#vehicleGroupSelect')?.addEventListener('change', (event) => {
            loadPreset(container, event.target.value);
        });

        container.addEventListener('click', (event) => {
            const row = event.target.closest('.vg-table tbody tr[data-id]');
            if (!row || row.classList.contains('vg-empty-row')) return;

            if (row.dataset.type === 'vehicle') {
                state.activeVehicleId = row.dataset.id;
                state.activeVehicleSide = row.dataset.side;
            } else {
                state.activeUserId = row.dataset.id;
                state.activeUserSide = row.dataset.side;
            }
            render(container);
        });

        container.querySelector('#moveVehicleOne')?.addEventListener('click', () => moveOne(container, 'vehicle', { from: 'available', to: 'selected' }));
        container.querySelector('#moveVehicleAll')?.addEventListener('click', () => moveAll(container, 'vehicle', true));
        container.querySelector('#removeVehicleOne')?.addEventListener('click', () => moveOne(container, 'vehicle', { from: 'selected', to: 'available' }));
        container.querySelector('#removeVehicleAll')?.addEventListener('click', () => moveAll(container, 'vehicle', false));
        container.querySelector('#moveUserOne')?.addEventListener('click', () => moveOne(container, 'user', { from: 'available', to: 'selected' }));
        container.querySelector('#moveUserAll')?.addEventListener('click', () => moveAll(container, 'user', true));
        container.querySelector('#removeUserOne')?.addEventListener('click', () => moveOne(container, 'user', { from: 'selected', to: 'available' }));
        container.querySelector('#removeUserAll')?.addEventListener('click', () => moveAll(container, 'user', false));

        container.querySelector('#vehicleGroupSave')?.addEventListener('click', () => {
            showMessage(container, 'Đã ghi lại cấu hình nhóm phương tiện.');
        });

        container.querySelector('#vehicleGroupExport')?.addEventListener('click', () => {
            showMessage(container, 'Đã chuẩn bị dữ liệu kết xuất QR.');
        });

        container.querySelector('#vehicleGroupClose')?.addEventListener('click', () => {
            window.dispatchEvent(new CustomEvent('navigateToPage', { detail: { page: 'home' } }));
        });

        container.querySelector('#vehicleGroupAdd')?.addEventListener('click', () => showMessage(container, 'Chức năng thêm nhóm đang ở trạng thái mô phỏng.', 'warning'));
        container.querySelector('#vehicleGroupEdit')?.addEventListener('click', () => showMessage(container, 'Chức năng sửa nhóm đang ở trạng thái mô phỏng.', 'warning'));
        container.querySelector('#vehicleGroupDelete')?.addEventListener('click', () => showMessage(container, 'Chức năng xóa nhóm đang ở trạng thái mô phỏng.', 'warning'));

        render(container);
    }

    function scheduleInit(event) {
        if (event?.detail?.page && event.detail.page !== 'vehicleGroups') return;
        window.setTimeout(initVehicleGroupsPage, 80);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', scheduleInit);
    } else {
        scheduleInit();
    }

    window.addEventListener('pageLoaded', scheduleInit);
    window.addEventListener('pageShown', scheduleInit);
})();
