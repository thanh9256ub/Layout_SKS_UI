(function () {
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';
    const state = {
        data: {},
        selectedVehicle: null,
        isDataLoaded: false,
        routeData: null,
        currentRouteIndex: 0,
        isPlaying: false,
        playInterval: null,
        isRestoringState: false,
        selectedPointIndex: null,
        speedMultiplier: 1,
        isDraggingSeekbar: false
    };

    const dom = {
        get: (id) => document.getElementById(id),
        show: (id, visible) => { const el = dom.get(id); if (el) el.style.display = visible ? 'block' : 'none'; },
        showFlex: (id, visible) => { const el = dom.get(id); if (el) el.style.display = visible ? 'flex' : 'none'; },
        toggleClass: (id, className, add) => dom.get(id)?.classList.toggle(className, add)
    };

    // ============ Data Loading ============
    async function loadData() {
        try {
            const response = await fetch(`${APP_ROOT}json/package.json`);
            state.data = await response.json();
            state.isDataLoaded = true;
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu:", error);
            const emptyState = dom.get('emptyState');
            if (emptyState) emptyState.innerHTML =
                '<div class="text-center text-danger"><i class="fas fa-exclamation-triangle fa-3x mb-3"></i><h4>Không thể tải dữ liệu</h4><p>Vui lòng kiểm tra kết nối và thử lại</p></div>';
        }
    }

    // ============ Vehicle Search ============
    const vehicleSearch = {
        findByKeyword(keyword) {
            if (!keyword || !state.data.vehicles?.length) return null;
            const lower = keyword.toLowerCase();
            const exact = state.data.vehicles.find(v => v.plate.toLowerCase() === lower);
            if (exact) return exact;
            const partial = state.data.vehicles.filter(v => ['plate', 'driver', 'carBrand', 'model'].some(k => v[k]?.toLowerCase().includes(lower)));
            return partial.length === 2311 ? partial[0] : null;
        },

        showAutocomplete(searchTerm) {
            const container = dom.get('autocompleteResults');
            const shouldShow = searchTerm?.trim() && !state.selectedVehicle && state.isDataLoaded && state.data.vehicles?.length;
            if (!container || !shouldShow) { dom.toggleClass('autocompleteResults', 'active', false); return; }

            const term = searchTerm.toLowerCase();
            const matches = state.data.vehicles
                .filter(v => ['plate', 'driver', 'carBrand', 'model'].some(k => (v[k] || '').toLowerCase().includes(term)))
                .sort((a, b) => {
                    const aPlate = a.plate.toLowerCase(), bPlate = b.plate.toLowerCase();
                    return (aPlate.startsWith(term) ? 0 : 1) - (bPlate.startsWith(term) ? 0 : 1) || aPlate.indexOf(term) - bPlate.indexOf(term);
                }).slice(0, 10);

            if (!matches.length) { dom.toggleClass('autocompleteResults', 'active', false); return; }

            container.innerHTML = matches.map(v => `<div class="autocomplete-item" data-vehicle-id="${v.id}">
                <div class="vehicle-details"><div class="vehicle-plate">${v.plate}</div></div></div>`).join('');
            container.querySelectorAll('.autocomplete-item').forEach((item, idx) => {
                item.onclick = () => {
                    vehicleSelection.select(matches[idx]);
                    dom.toggleClass('autocompleteResults', 'active', false);
                    const input = dom.get('vehicleSearchInput');
                    if (input) input.value = matches[idx].plate;
                };
            });
            dom.toggleClass('autocompleteResults', 'active', true);
        }
    };

    // ============ Vehicle Selection ============
    const vehicleSelection = {
        select(vehicle, shouldFocus = true) {
            state.selectedVehicle = vehicle;
            if (!state.isRestoringState) { state.currentRouteIndex = 0; state.selectedPointIndex = null; }
            state.routeData = state.data.routes?.[vehicle.id.toString()] || null;

            if (state.routeData && !state.isRestoringState) this.dispatchRoute(vehicle, state.routeData, shouldFocus);
            else if (!state.routeData) window.dispatchEvent(new CustomEvent('vehicleRouteCleared'));
            if (!state.isRestoringState) routeDisplay.search();
        },

        clear() {
            state.selectedVehicle = state.routeData = null;
            state.selectedPointIndex = null;
            state.currentRouteIndex = 0;
            const input = dom.get('vehicleSearchInput');
            if (input) input.value = '';
            dom.show('emptyState', true); dom.show('resultsTable', false); dom.show('noResults', false);
            dom.show('vehicleInfoSection', false); dom.toggleClass('autocompleteResults', 'active', false);
            window.dispatchEvent(new CustomEvent('vehicleRouteCleared'));
            window.dispatchEvent(new CustomEvent('forceSavePageState', { detail: { page: 'route' } }));
        },

        dispatchRoute(vehicle, routePoints, shouldFocus = false) {
            const dispatch = () => {
                if (window.MapManager?.currentPage !== 'route') { requestAnimationFrame(dispatch); return; }
                window.dispatchEvent(new CustomEvent('vehicleRouteSelected', {
                    detail: { vehicle, routePoints, shouldFocus, currentRouteIndex: state.currentRouteIndex }
                }));
            };
            if (window.MapManager?.map) dispatch(); else requestAnimationFrame(dispatch);
        }
    };

    // ============ Route Display ============
    const routeDisplay = {
        search() {
            if (!state.selectedVehicle) {
                const keyword = dom.get('vehicleSearchInput')?.value?.trim();
                if (keyword) { const match = vehicleSearch.findByKeyword(keyword); if (match) { vehicleSelection.select(match); return; } }
                dom.show('emptyState', true); dom.show('resultsTable', false); dom.show('noResults', false); return;
            }

            const timeCondition = dom.get('groupFilterSelectTime')?.value || '1';
            dom.showFlex('loadingIndicator', true); dom.show('emptyState', false); dom.show('resultsTable', false); dom.show('noResults', false);

            let history = state.data.history?.filter(h => h.vehicleId === state.selectedVehicle.id) || [];
            history = this.filterByTime(history, timeCondition);

            state.routeData = this.filterRoutePointsByTime(state.data.routes?.[state.selectedVehicle.id.toString()] || null, timeCondition);
            const hasRoute = state.routeData?.length > 0;
            if (hasRoute && !state.isRestoringState) { state.currentRouteIndex = 0; playbackControls.updateSeekbar(); }

            if (state.routeData?.length && !state.isRestoringState) vehicleSelection.dispatchRoute(state.selectedVehicle, state.routeData, false);
            else if (!state.routeData && !state.isRestoringState) window.dispatchEvent(new CustomEvent('vehicleRouteCleared'));

            history.sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
            dom.showFlex('loadingIndicator', false);
            const hasHistory = history.length > 0;

            if (!hasRoute && !hasHistory) { dom.show('noResults', true); dom.showFlex('tableControls', false); }
            else { dom.show('resultsTable', true); dom.showFlex('tableControls', true); this.renderTable(hasRoute ? state.routeData : history); }
            this.updateVehicleInfo();
        },

        filterByTime(history, condition) {
            if (!history?.length) return [];
            const now = new Date();
            const conditions = {
                '1': 1, '2': 4, '3': 6, '4': 12, '5': 24,
                '6': (item) => new Date(item.date + ' ' + item.time).toDateString() === now.toDateString(),
                '7': (item) => { const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1); return new Date(item.date + ' ' + item.time).toDateString() === yesterday.toDateString(); }
            };
            const check = conditions[condition];
            if (condition === '8') return this.filterByCustomTime(history);
            if (typeof check === 'function') return history.filter(check);
            if (typeof check === 'number') return history.filter(item => (now - new Date(item.date + ' ' + item.time)) / 3600000 <= check);
            return history;
        },

        filterByCustomTime(history) {
            const dateFrom = dom.get('routeDateFrom')?.value;
            const dateTo = dom.get('routeDateTo')?.value;
            const timeFrom = dom.get('routeTimeFrom')?.value;
            const timeTo = dom.get('routeTimeTo')?.value;

            return history.filter(item => {
                const itemDate = item.date || '';
                const itemTime = (item.time || '').slice(0, 5);
                if (dateFrom && itemDate < dateFrom) return false;
                if (dateTo && itemDate > dateTo) return false;
                if (timeFrom && itemTime < timeFrom) return false;
                if (timeTo && itemTime > timeTo) return false;
                return true;
            });
        },

        filterRoutePointsByTime(routePoints, condition) {
            if (!routePoints?.length) return routePoints;
            if (condition !== '8') return routePoints;

            const dateFrom = dom.get('routeDateFrom')?.value;
            const dateTo = dom.get('routeDateTo')?.value;
            const timeFrom = dom.get('routeTimeFrom')?.value;
            const timeTo = dom.get('routeTimeTo')?.value;

            return routePoints.filter(point => {
                if (!point.time) return true;
                const date = new Date(point.time);
                const itemDate = date.toISOString().slice(0, 10);
                const itemTime = date.toTimeString().slice(0, 5);
                if (dateFrom && itemDate < dateFrom) return false;
                if (dateTo && itemDate > dateTo) return false;
                if (timeFrom && itemTime < timeFrom) return false;
                if (timeTo && itemTime > timeTo) return false;
                return true;
            });
        },

        renderTable(records) {
            const tbody = dom.get('vehicleTableBody');
            if (!tbody) return;

            tbody.innerHTML = (records || []).map((item, idx) => {
                const isRoute = item.lat && item.lng && item.time;
                const engineStatus = (item.speed && item.speed > 0) ? 'Mở' : 'Tắt';
                const statusClass = (item.speed && item.speed > 0) ? 'text-success' : 'text-danger';

                if (isRoute) {
                    const date = new Date(item.time);
                    const displayDate = date.toLocaleDateString('vi-VN');
                    const displayTime = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    return `<tr data-index="${idx}" style="cursor: pointer;">
                    <td><div class="datetime-cell">
                    <span class="date">${displayDate}</span>
                    <span class="time">${displayTime}</span></div></td>
                    <td><span class="speed-indicator">${item.speed || 0} </span></td>
                    <td><span class="distance-badge">${(item.distance || 0).toFixed(1)} </span></td>
                    <td><div class="coordinates-cell"><span class="${statusClass} fw-bold">${engineStatus}</span></div></td>
                    </tr>`;
                }
                return `<tr>
                <td><div class="datetime-cell">
                <span class="date">${utils.formatDate(item.date)}</span>
                <span class="time">${item.time}</span></div></td>
                <td><span class="speed-indicator">${item.speed} </span></td>
                <td><span class="distance-badge">${item.distance} </span></td>
                <td><div class="coordinates-cell">
                <span class="${statusClass} fw-bold">${engineStatus}</span></div></td>
                </tr>`;
            }).join('');

            tbody.querySelectorAll('tr[data-index]').forEach(row => {
                row.onclick = () => {
                    tbody.querySelectorAll('tr').forEach(r => r.classList.remove('selected-row'));
                    row.classList.add('selected-row');
                    const idx = parseInt(row.dataset.index);
                    state.selectedPointIndex = idx; state.currentRouteIndex = idx;
                    playbackControls.updateSeekbar();
                    window.dispatchEvent(new CustomEvent('showVehicleAtPoint', { detail: { vehicle: state.selectedVehicle, point: records[idx], index: idx } }));
                };
            });
        },

        updateVehicleInfo() {
            const section = dom.get('vehicleInfoSection');
            if (!state.selectedVehicle) { if (section) section.style.display = 'none'; return; }

            let time = '', coords = '', speed = '';
            if (state.routeData?.length) {
                const p = state.routeData[state.routeData.length - 1];
                time = utils.formatTimeDisplay(p.time); coords = `${p.lat.toFixed(6)}, ${p.lng.toFixed(6)}`; speed = `${p.speed || 0} km/h`;
            } else if (state.selectedVehicle.lat && state.selectedVehicle.lng) {
                time = utils.formatTimeDisplay(new Date()); coords = `${state.selectedVehicle.lat.toFixed(6)}, ${state.selectedVehicle.lng.toFixed(6)}`; speed = `${state.selectedVehicle.speed || 0} km/h`;
            } else {
                const hist = state.data.history?.filter(h => h.vehicleId === state.selectedVehicle.id).sort((a, b) => new Date(b.date + ' ' + b.time) - new Date(a.date + ' ' + a.time));
                if (hist?.length) {
                    const latest = hist[0]; time = utils.formatDate(latest.date) + ' ' + latest.time;
                    const loc = state.data.locations?.find(l => l.id === latest.locationId);
                    coords = (loc?.lat && loc?.lng) ? `${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}` : 'N/A'; speed = `${latest.speed || 0} km/h`;
                }
            }

            if (section) {
                section.style.display = 'block';
                const updates = { vehicleInfoPlate: state.selectedVehicle.plate, vehicleInfoTime: time || 'Không xác định', vehicleInfoCoordinates: coords || 'Không xác định', vehicleInfoSpeed: speed || '0 km/h' };
                Object.entries(updates).forEach(([id, value]) => { const el = dom.get(id); if (el) el.textContent = value; });
            }
        }
    };

    // ============ Playback Controls ============
    const playbackControls = {
        showVehicleAtIndex(index) {
            if (state.selectedVehicle && state.routeData?.[index]) window.dispatchEvent(new CustomEvent('showVehicleAtPoint', { detail: { vehicle: state.selectedVehicle, point: state.routeData[index], index } }));
        },

        prev() {
            if (!state.routeData?.length) return;
            if (state.isPlaying) this.stop();
            state.currentRouteIndex = Math.max(0, state.currentRouteIndex - 1);
            this.highlightCurrentRow();
            this.showVehicleAtIndex(state.currentRouteIndex);
        },

        next() {
            if (!state.routeData?.length) return;
            if (state.isPlaying) this.stop();
            state.currentRouteIndex = Math.min(state.routeData.length - 1, state.currentRouteIndex + 1);
            this.highlightCurrentRow();
            this.showVehicleAtIndex(state.currentRouteIndex);
        },
        rewind() {
            if (!state.routeData?.length) return;
            if (state.isPlaying) this.stop();
            state.currentRouteIndex = 0;
            this.highlightCurrentRow();
            this.showVehicleAtIndex(0);
        },
        fast() {
            if (!state.routeData?.length) return;
            if (state.isPlaying) this.stop();
            state.currentRouteIndex = state.routeData.length - 1;
            this.highlightCurrentRow();
            this.showVehicleAtIndex(state.currentRouteIndex);
        },
        togglePlay() { if (!state.routeData?.length) return; state.isPlaying ? this.stop() : this.start(); },

        start() {
            if (state.isPlaying) return;
            state.isPlaying = true;
            const playBtn = dom.get('playBtn');
            if (playBtn) { playBtn.innerHTML = '<i class="fas fa-pause"></i>'; playBtn.disabled = false; }
            state.playInterval = setInterval(() => {
                if (state.currentRouteIndex < state.routeData.length - 1) {
                    state.currentRouteIndex++;
                    this.highlightCurrentRow();
                    this.showVehicleAtIndex(state.currentRouteIndex);
                }
                else this.stop();
            }, 500 / state.speedMultiplier);
        },

        stop() {
            state.isPlaying = false;
            if (state.playInterval) { clearInterval(state.playInterval); state.playInterval = null; }
            const playBtn = dom.get('playBtn');
            if (playBtn) playBtn.innerHTML = '<i class="fas fa-play"></i>';
        },

        speedUp() {
            if (state.speedMultiplier < 5) {
                state.speedMultiplier++;
                this.updateSpeedDisplay();
                if (state.isPlaying) { this.stop(); this.start(); }
            }
        },

        speedDown() {
            if (state.speedMultiplier > 1) {
                state.speedMultiplier--; this.updateSpeedDisplay();
                if (state.isPlaying) {
                    this.stop(); this.start();
                }
            }
        },

        updateSpeedDisplay() { const display = dom.get('speedDisplay'); if (display) display.textContent = `x${state.speedMultiplier}`; },

        highlightCurrentRow() {
            const rows = document.querySelectorAll('#vehicleTableBody tr');
            rows.forEach((row, idx) => {
                row.style.backgroundColor = '';
                if (idx === state.currentRouteIndex) row.classList.add('selected-row');
                else row.classList.remove('selected-row');
            });
            rows[state.currentRouteIndex]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            this.updateSeekbar();
        },

        updateSeekbar() {
            const fill = dom.get('routeProgressFill'), container = dom.get('routeProgressContainer');
            if (!fill || !container || !state.routeData?.length) return;
            fill.style.width = (state.currentRouteIndex / (state.routeData.length - 1) * 100) + '%';
            container.style.display = 'block';
        },

        setupSeekbar() {
            const container = dom.get('routeProgressContainer');
            if (!container) return;

            const handleSeek = (e) => {
                if (!state.routeData?.length) return;
                const rect = container.getBoundingClientRect(), x = e.clientX - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                const newIndex = Math.round((percentage / 100) * (state.routeData.length - 1));
                state.currentRouteIndex = newIndex;
                this.highlightCurrentRow();
                this.showVehicleAtIndex(state.currentRouteIndex);
            };

            const onMouseMove = (e) => { if (!state.isDraggingSeekbar) return; handleSeek(e); };
            const onMouseUp = () => {
                state.isDraggingSeekbar = false;
                document.removeEventListener('mousemove', onMouseMove);
                document.removeEventListener('mouseup', onMouseUp);
                container.style.cursor = 'pointer';
            };

            container.addEventListener('mousedown', (e) => {
                if (!state.routeData?.length) return;
                state.isDraggingSeekbar = true; container.style.cursor = 'grabbing';
                if (state.isPlaying) this.stop();
                handleSeek(e);
                document.addEventListener('mousemove', onMouseMove);
                document.addEventListener('mouseup', onMouseUp);
            });

            container.addEventListener('click', (e) => { if (!state.isDraggingSeekbar) handleSeek(e); });

            container.addEventListener('touchstart', (e) => { if (!state.routeData?.length) return; state.isDraggingSeekbar = true; if (state.isPlaying) this.stop(); });
            container.addEventListener('touchmove', (e) => {
                if (!state.isDraggingSeekbar || !state.routeData?.length) return;
                e.preventDefault();
                const touch = e.touches[0], rect = container.getBoundingClientRect(), x = touch.clientX - rect.left;
                const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
                const newIndex = Math.round((percentage / 100) * (state.routeData.length - 1));
                state.currentRouteIndex = newIndex;
                this.highlightCurrentRow();
                this.showVehicleAtIndex(state.currentRouteIndex);
            });
            container.addEventListener('touchend', () => { state.isDraggingSeekbar = false; });
        }
    };

    // ============ Utilities ============
    const utils = {
        formatDate: (dateStr) => new Date(dateStr).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        formatTimeDisplay: (ts) => {
            if (!ts) return 'Không xác định';
            try { return new Date(ts).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' }); }
            catch (e) { return ts; }
        }
    };

    // ============ State Management ============
    function setupStateHandlers() {
        if (!window.pageStateHandlers) window.pageStateHandlers = {};
        if (!window.pageStateHandlers.route) window.pageStateHandlers.route = {};

        window.pageStateHandlers.route.save = () => ({
            selectedVehicle: state.selectedVehicle ? {
                id: state.selectedVehicle.id,
                plate: state.selectedVehicle.plate,
                driver: state.selectedVehicle.driver,
                carBrand: state.selectedVehicle.carBrand,
                model: state.selectedVehicle.model,
                group: state.selectedVehicle.group
            } : null,
            selectedPointIndex: state.selectedPointIndex,
            currentRouteIndex: state.currentRouteIndex,
            isPlaying: state.isPlaying,
            speedMultiplier: state.speedMultiplier
        });

        window.pageStateHandlers.route.restore = (container, customState) => { restoreState(customState); };
    }

    function restoreState(customState) {
        const input = dom.get('vehicleSearchInput');
        if (!customState?.selectedVehicle) {
            state.selectedVehicle = state.routeData = null; state.selectedPointIndex = null; state.currentRouteIndex = 0;
            if (input) input.value = ''; dom.toggleClass('autocompleteResults', 'active', false);
            window.dispatchEvent(new CustomEvent('vehicleRouteCleared')); return;
        }

        if (!state.isDataLoaded || !state.data.vehicles?.length) {
            requestAnimationFrame(() => restoreState(customState)); return;
        }

        const vehicle = state.data.vehicles.find(v => v.id === customState.selectedVehicle.id);
        if (!vehicle) {
            state.selectedVehicle = state.routeData = null; state.selectedPointIndex = null; state.currentRouteIndex = 0;
            if (input) input.value = ''; window.dispatchEvent(new CustomEvent('vehicleRouteCleared')); return;
        }

        state.isRestoringState = true; state.selectedVehicle = vehicle;
        state.selectedPointIndex = customState.selectedPointIndex ?? null;
        state.currentRouteIndex = customState.currentRouteIndex ?? 0;
        state.speedMultiplier = customState.speedMultiplier ?? 1;

        if (input) input.value = vehicle.plate;
        dom.toggleClass('autocompleteResults', 'active', false);
        playbackControls.updateSpeedDisplay();
        state.routeData = state.data.routes?.[vehicle.id.toString()] || null;

        if (state.routeData) window.dispatchEvent(new CustomEvent('vehicleRouteSelected', { detail: { vehicle, routePoints: state.routeData, shouldFocus: false, selectedPointIndex: state.selectedPointIndex, currentRouteIndex: state.currentRouteIndex } }));
        else window.dispatchEvent(new CustomEvent('vehicleRouteCleared'));

        routeDisplay.search();

        if (state.routeData) {
            const tbody = dom.get('vehicleTableBody');
            if (tbody) {
                const rows = tbody.querySelectorAll('tr[data-index]'), indexToHighlight = state.selectedPointIndex ?? state.currentRouteIndex;
                rows.forEach((row, idx) => {
                    if (idx === indexToHighlight) { row.classList.add('selected-row'); row.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
                    else row.classList.remove('selected-row');
                });
                playbackControls.updateSeekbar();
            }
        }

        if (customState.isPlaying && state.routeData) playbackControls.start();
        state.isRestoringState = false;
    }

    // ============ Event Handlers ============
    function setupEventHandlers() {
        if (document.body.dataset.routeFilterHandlersAttached === 'true') return;
        document.body.dataset.routeFilterHandlersAttached = 'true';

        const input = dom.get('vehicleSearchInput');
        if (input) {
            input.addEventListener('input', (e) => { if (state.selectedVehicle && e.target.value !== state.selectedVehicle.plate) state.selectedVehicle = null; vehicleSearch.showAutocomplete(e.target.value); });
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); routeDisplay.search(); } });
        }

        window.addEventListener('pageStateRestored', (e) => { if (e.detail?.page === 'route') dom.toggleClass('autocompleteResults', 'active', false); });
        document.addEventListener('click', (e) => { if (!e.target.closest('.autocomplete-container')) dom.toggleClass('autocompleteResults', 'active', false); });

        const controls = {
            searchRoutesBtn: () => routeDisplay.search(),
            routeInlineSearchBtn: () => routeDisplay.search(),
            prevBtn: () => playbackControls.prev(),
            playBtn: () => playbackControls.togglePlay(),
            pauseBtn: () => playbackControls.stop(),
            nextBtn: () => playbackControls.next(),
            speedUpBtn: () => playbackControls.speedUp(),
            speedDownBtn: () => playbackControls.speedDown(),
            rewindBtn: () => playbackControls.rewind(),
            fastBtn: () => playbackControls.fast(),
        };
        Object.entries(controls).forEach(([id, handler]) => { dom.get(id)?.addEventListener('click', handler); });

        const timeSelect = dom.get('groupFilterSelectTime');
        const updateCustomTimeVisibility = () => {
            const customTime = dom.get('routeCustomTime');
            const isCustom = timeSelect?.value === '8';
            customTime?.classList.toggle('active', isCustom);
            if (customTime) customTime.style.display = isCustom ? 'grid' : 'none';
        };
        updateCustomTimeVisibility();

        ['groupFilterSelectTime', 'routeDateFrom', 'routeDateTo', 'routeTimeFrom', 'routeTimeTo'].forEach(id => {
            dom.get(id)?.addEventListener('change', () => routeDisplay.search());
        });
        timeSelect?.addEventListener('change', updateCustomTimeVisibility);
        playbackControls.setupSeekbar();
    }

    document.addEventListener('change', (event) => {
        if (event.target?.id !== 'groupFilterSelectTime') return;
        const customTime = dom.get('routeCustomTime');
        const isCustom = event.target.value === '8';
        customTime?.classList.toggle('active', isCustom);
        if (customTime) customTime.style.display = isCustom ? 'grid' : 'none';
    });

    // ============ Initialization ============
    async function init() {
        await loadData();
        setupStateHandlers();

        const displayLocations = () => {
            if (window.MapManager?.currentPage !== 'route') { requestAnimationFrame(displayLocations); return; }
            if (window.MapManager?.displayLocations && state.data.locations) window.MapManager.displayLocations(state.data.locations);
        };

        if (window.MapManager?.map) displayLocations(); else requestAnimationFrame(displayLocations);
        setupEventHandlers();
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
})();
