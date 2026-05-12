(function () {
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';
    let jsonData = null;
    let isInitialized = false;
    let isInitializing = false;
    let isRestoringState = false;

    const TABS = {
        VEHICLES: 'vehicles',
        LOCATIONS: 'locations',
    };

    const ALL_COLORS = 'all';

    const SCROLL_KEYS = {
        [TABS.VEHICLES]: 'vehicleListScroll',
        [TABS.LOCATIONS]: 'locationListScroll',
    };

    // ===== STATE MANAGEMENT =====
    function getSavedState() {
        return window.trackingFilterState || null;
    }

    function saveScrollPositions() {
        const state = getSavedState() || {};

        Object.entries(SCROLL_KEYS).forEach(([tab, key]) => {
            const list = document.getElementById(`${tab}List`);
            const container = list?.closest('.tab-pane-custom');
            if (container) state[key] = container.scrollTop;
        });

        window.trackingFilterState = state;
    }

    function restoreScrollPositions(savedState) {
        if (!savedState) return;

        Object.entries(SCROLL_KEYS).forEach(([tab, key]) => {
            if (savedState[key] === undefined) return;

            setTimeout(() => {
                const list = document.getElementById(`${tab}List`);
                const container = list?.closest('.tab-pane-custom');
                if (container?.classList.contains('active')) {
                    container.scrollTop = savedState[key] || 0;
                }
            }, 100);
        });
    }

    function saveFilterState() {
        saveScrollPositions();

        const state = getSavedState() || {};
        state.groupSelect = document.getElementById('groupSelect')?.value || 'all';
        state.vehicleSearch = document.getElementById('vehicleSearch')?.value || '';
        state.vehicleColor = state.vehicleColor || ALL_COLORS;
        state.activeTab = document.querySelector('.custom-tab.active')?.getAttribute('data-tab') || 'vehicles';
        state.locationSearch = document.getElementById('locationSearch')?.value || '';

        window.trackingFilterState = state;
        window.dispatchEvent(new CustomEvent('forceSavePageState', { detail: { page: 'tracking' } }));
    }

    function restoreFilterState(savedState, shouldRender = true) {
        if (!savedState) return;

        isRestoringState = true;

        // Restore form values
        const updates = {
            'groupSelect': savedState.groupSelect,
            'vehicleSearch': savedState.vehicleSearch,
            'locationSearch': savedState.locationSearch,
        };

        Object.entries(updates).forEach(([id, value]) => {
            const el = document.getElementById(id);
            if (el && value) el.value = value;
        });

        const state = getSavedState() || {};
        state.vehicleColor = savedState.vehicleColor || ALL_COLORS;
        window.trackingFilterState = state;

        // Restore active tab
        if (savedState.activeTab) {
            document.querySelectorAll('.custom-tab, .tab-pane-custom').forEach(el =>
                el.classList.remove('active')
            );

            const tab = document.querySelector(`.custom-tab[data-tab="${savedState.activeTab}"]`);
            const pane = document.getElementById(`${savedState.activeTab}-tab`);
            if (tab && pane) {
                tab.classList.add('active');
                pane.classList.add('active');
            }
        }

        isRestoringState = false;

        // Render if needed
        if (shouldRender) {
            setTimeout(() => {
                const activeTab = savedState.activeTab || 'vehicles';
                renderTab(activeTab, savedState);
                restoreScrollPositions(savedState);
            }, 50);
        }
    }

    // ===== RENDER FUNCTIONS =====
    function renderTab(tab, savedState = {}) {
        switch (tab) {
            case TABS.VEHICLES:
                renderVehicles(document.getElementById('groupSelect')?.value || 'all', false);
                break;
            case TABS.LOCATIONS:
                renderLocations(savedState.locationSearch || '');
                break;
            default:
                break;
        }
    }

    function getScrollContainer(listId) {
        return document.getElementById(listId)?.closest('.tab-pane-custom');
    }

    function preserveScroll(listId, callback) {
        const container = getScrollContainer(listId);
        const savedScroll = container?.scrollTop || 0;

        callback();

        if (container && !isRestoringState) {
            requestAnimationFrame(() => container.scrollTop = savedScroll);
        }
    }

    function getVehicleColorMeta(vehicle) {
        const colors = jsonData?.color || [];
        if (vehicle.color) {
            return {
                id: vehicle.color,
                name: vehicle.colorName || vehicle.color,
                hex: vehicle.color
            };
        }

        if (vehicle.colorId) {
            const matched = colors.find(color => String(color.id) === String(vehicle.colorId));
            if (matched) return matched;
        }

        if (colors.length > 0) {
            return colors[(vehicle.id - 1) % colors.length];
        }

        return { id: 'default', name: 'Color', hex: '#64748b' };
    }

    function withVehicleColor(vehicle) {
        const color = getVehicleColorMeta(vehicle);
        return {
            ...vehicle,
            vehicleColorId: String(color.id),
            vehicleColorName: color.name,
            vehicleColorHex: color.hex,
            color: color.hex
        };
    }

    function getSelectedVehicleColor() {
        return getSavedState()?.vehicleColor || ALL_COLORS;
    }

    function setSelectedVehicleColor(colorId) {
        const state = getSavedState() || {};
        state.vehicleColor = colorId || ALL_COLORS;
        window.trackingFilterState = state;
    }

    function getBaseFilteredVehicles(filter = 'all') {
        let filtered = filter === 'all'
            ? jsonData.vehicles
            : jsonData.vehicles.filter(v => v.group === filter);

        const searchTerm = document.getElementById('vehicleSearch')?.value.trim().toLowerCase();
        if (searchTerm) {
            filtered = filtered.filter(v =>
                v.plate.toLowerCase().includes(searchTerm) ||
                v.driver?.toLowerCase().includes(searchTerm) ||
                v.tag?.toLowerCase().includes(searchTerm)
            );
        }

        return filtered.map(withVehicleColor);
    }

    function renderVehicleColorFilters(baseVehicles, selectedColor) {
        const container = document.getElementById('vehicleColorFilter');
        if (!container) return;

        const counts = baseVehicles.reduce((acc, vehicle) => {
            acc[vehicle.vehicleColorId] = (acc[vehicle.vehicleColorId] || 0) + 1;
            return acc;
        }, {});

        const colors = (jsonData.color || [])
            .filter(color => counts[String(color.id)])
            .map(color => ({ ...color, count: counts[String(color.id)] }));

        container.innerHTML = `
            <button type="button" class="vehicle-color-filter ${selectedColor === ALL_COLORS ? 'active' : ''}"
                data-color-id="${ALL_COLORS}" title="Tat ca">
                <span class="vehicle-color-dot all-colors-dot"></span>
                <span class="vehicle-color-count">${baseVehicles.length}</span>
            </button>
            ${colors.map(color => `
                <button type="button" class="vehicle-color-filter ${selectedColor === String(color.id) ? 'active' : ''}"
                    data-color-id="${color.id}" title="${color.name}">
                    <span class="vehicle-color-dot" style="background:${color.hex}"></span>
                    <span class="vehicle-color-count">${color.count}</span>
                </button>
            `).join('')}
        `;

        container.querySelectorAll('.vehicle-color-filter').forEach(button => {
            button.addEventListener('click', () => {
                if (isRestoringState) return;
                saveScrollPositions();
                setSelectedVehicleColor(button.dataset.colorId || ALL_COLORS);
                renderVehicles(document.getElementById('groupSelect')?.value || 'all');
                saveFilterState();
            });
        });
    }

    function renderVehicles(filter = 'all', shouldFitBounds = null) {
        const vehicleList = document.getElementById('vehicleList');
        if (!vehicleList || !jsonData?.vehicles) return;

        const vehiclesTab = document.getElementById('vehicles-tab');
        if (vehiclesTab && !vehiclesTab.classList.contains('active')) return;

        preserveScroll('vehicleList', () => {
            const baseFiltered = getBaseFilteredVehicles(filter);
            let selectedColor = getSelectedVehicleColor();
            if (selectedColor !== ALL_COLORS && !baseFiltered.some(v => v.vehicleColorId === selectedColor)) {
                selectedColor = ALL_COLORS;
                setSelectedVehicleColor(ALL_COLORS);
            }
            const filtered = selectedColor === ALL_COLORS
                ? baseFiltered
                : baseFiltered.filter(v => v.vehicleColorId === selectedColor);

            renderVehicleColorFilters(baseFiltered, selectedColor);

            if (filtered.length === 0) {
                vehicleList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-car"></i>
                        <p>Không có phương tiện phù hợp</p>
                    </div>`;
                return;
            }

            vehicleList.innerHTML = filtered.map(v => `
                <div class="vehicle-card" data-vehicle-id="${v.id}" data-vehicle-lat="${v.lat || ''}" data-vehicle-lng="${v.lng || ''}">
                    <div class="vehicle-header">
                        <div class="vehicle-plate">${v.plate}</div>
                        <div class="vehicle-status status-${v.status}">
                            <i class="fas fa-circle"></i>
                            ${v.status === 'online' ? 'Bật' : 'Dừng'}
                        </div>
                    </div>
                    <div class="vehicle-info-tracking">
                        <div class="info-item"><i class="fas fa-tachometer-alt"></i><span>${v.speed} km/h</span></div>
                        <div class="info-item"><i class="fas fa-power-off"></i><span>Máy: ${v.engine === 'on' ? 'Bật' : 'Tắt'}</span></div>
                        <div class="info-item"><i class="fas fa-gas-pump"></i><span>Nhiên liệu: ${Math.round(v.fuel)}%</span></div>
                        <div class="info-item"><i class="fas fa-user"></i><span>${v.driver || 'N/A'}</span></div>
                        <div class="info-item"><i class="fa-solid fa-tag"></i><span>${v.tag || 'N/A'}</span></div>
                    </div>
                </div>
            `).join('');

            // Add click events
            vehicleList.querySelectorAll('.vehicle-card').forEach(card => {
                card.addEventListener('click', function () {
                    const lat = parseFloat(this.dataset.vehicleLat);
                    const lng = parseFloat(this.dataset.vehicleLng);
                    if (lat && lng && window.MapManager?.map) {
                        window.MapManager.map.setView([lat, lng], 15);
                        const vehicleId = parseInt(this.dataset.vehicleId);
                        window.MapManager.vehicleMarkers[vehicleId]?.openPopup();
                    }
                });
            });


        });

        // Display on map
        if (shouldFitBounds === null) {
            const hasSavedState = window.MapManager?.mapStates?.tracking;
            const timeSinceInit = window.MapManager?.map?._initTimestamp
                ? Date.now() - window.MapManager.map._initTimestamp
                : Infinity;
            const isNewlyInitialized = window.MapManager?.map?._initializedWithDefault && timeSinceInit < 2000;
            shouldFitBounds = !hasSavedState && !isNewlyInitialized;
        }

        const displayOnMap = () => {
            if (window.MapManager?.currentPage !== 'tracking') {
                setTimeout(displayOnMap, 100);
                return;
            }
            const baseFiltered = getBaseFilteredVehicles(filter);
            const selectedColor = getSelectedVehicleColor();
            const filtered = selectedColor === ALL_COLORS
                ? baseFiltered
                : baseFiltered.filter(v => v.vehicleColorId === selectedColor);
            window.MapManager?.displayVehicles?.(filtered, shouldFitBounds);

            // Display locations on map
            if (jsonData?.locations && window.MapManager?.displayLocations) {
                window.MapManager.displayLocations(jsonData.locations);
            }
        };

        if (window.MapManager?.map) {
            displayOnMap();
        } else {
            setTimeout(displayOnMap, 500);
        }
    }

    function renderLocations(search = '') {
        const locationList = document.getElementById('locationList');
        if (!locationList || !jsonData?.locations) return;

        const locationsTab = document.getElementById('locations-tab');
        if (locationsTab && !locationsTab.classList.contains('active')) return;

        const filtered = jsonData.locations.filter(loc =>
            loc.name.toLowerCase().includes(search.toLowerCase()) ||
            loc.address?.toLowerCase().includes(search.toLowerCase())
        );

        preserveScroll('locationList', () => {
            if (filtered.length === 0) {
                locationList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-map-marker-alt"></i>
                        <p>Không tìm thấy địa điểm nào</p>
                    </div>
                    `;
                return;
            }

            locationList.innerHTML = filtered.map(loc => `
                <div class="location-card" data-location-id="${loc.id}" data-location-lat="${loc.lat || ''}" data-location-lng="${loc.lng || ''}">
                    <div class="location-icon" style="background: ${loc.color}20; color: ${loc.color}">
                        ${loc.icon}
                    </div>
                    <div class="location-info">
                        <div class="location-name">${loc.name}</div>
                        <div class="location-address">${loc.address || ''}</div>
                    </div>
                </div>
            `).join('');

            // Add click events for location cards
            locationList.querySelectorAll('.location-card').forEach(card => {
                card.addEventListener('click', function () {
                    const lat = parseFloat(this.dataset.locationLat);
                    const lng = parseFloat(this.dataset.locationLng);
                    if (lat && lng && window.MapManager?.map) {
                        window.MapManager.map.setView([lat, lng], 15);
                        const locationId = parseInt(this.dataset.locationId);
                        window.MapManager.locationMarkers[locationId]?.openPopup();
                    }
                });
            });
        });

        // Display locations on map with retry
        const displayOnMap = () => {
            if (window.MapManager?.currentPage !== 'tracking') {
                setTimeout(displayOnMap, 100);
                return;
            }
            if (window.MapManager?.displayLocations) {
                window.MapManager.displayLocations(filtered);
            }
        };

        if (window.MapManager?.map) {
            displayOnMap();
        } else {
            setTimeout(displayOnMap, 500);
        }
    }


    // ===== EVENT HANDLERS =====
    function setupEventListener(elementId, event, handler) {
        const el = document.getElementById(elementId);
        if (!el) return;

        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        newEl.addEventListener(event, handler);
    }

    function initVehicleTracking(shouldRestoreState = true) {
        if (shouldRestoreState && getSavedState()) return;

        renderVehicles('all');

        setupEventListener('groupSelect', 'change', (e) => {
            if (!isRestoringState) {
                saveScrollPositions();
                renderVehicles(e.target.value);
                saveFilterState();
            }
        });

        setupEventListener('vehicleSearch', 'input', () => {
            if (!isRestoringState) {
                saveScrollPositions();
                renderVehicles(document.getElementById('groupSelect').value);
                saveFilterState();
            }
        });

    }

    function initLocationTracking(shouldRestoreState = true) {
        if (shouldRestoreState && getSavedState()) return;
        if (!shouldRestoreState) renderLocations('');

        setupEventListener('locationSearch', 'input', (e) => {
            if (!isRestoringState) {
                saveScrollPositions();
                renderLocations(e.target.value);
                saveFilterState();
            }
        });
    }

    function initTabSwitching() {
        document.querySelectorAll('.custom-tab').forEach(tab => {
            const newTab = tab.cloneNode(true);
            tab.parentNode.replaceChild(newTab, tab);

            newTab.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();

                saveScrollPositions();
                isRestoringState = true;

                const targetTab = newTab.getAttribute('data-tab');
                const currentPane = document.querySelector('.tab-pane-custom.active');

                if (currentPane) {
                    currentPane.style.opacity = '0';
                    currentPane.style.visibility = 'hidden';
                }

                document.querySelectorAll('.tab-pane-custom, .custom-tab').forEach(el => {
                    el.classList.remove('active');
                    if (el.classList.contains('tab-pane-custom')) {
                        el.style.display = 'none';
                        el.style.opacity = '0';
                        el.style.visibility = 'hidden';
                    }
                });

                newTab.classList.add('active');
                const targetPane = document.getElementById(`${targetTab}-tab`);

                if (targetPane) {
                    targetPane.style.display = 'block';
                    targetPane.classList.add('active');

                    requestAnimationFrame(() => {
                        targetPane.style.opacity = '1';
                        targetPane.style.visibility = 'visible';
                        isRestoringState = false;

                        const list = document.getElementById(`${targetTab}List`);
                        if (!list?.innerHTML.trim()) {
                            renderTab(targetTab, getSavedState() || {});
                        }

                        setTimeout(() => restoreScrollPositions(getSavedState()), 50);
                    });
                } else {
                    isRestoringState = false;
                }

                saveFilterState();
            });
        });
    }

    // ===== INITIALIZATION =====
    async function initFilterComponent() {
        if (isInitializing) return;

        if (isInitialized) {
            const savedState = getSavedState();
            if (savedState) {
                restoreFilterState(savedState, true);
                restoreScrollPositions(savedState);
            }
            return;
        }

        isInitializing = true;

        if (!jsonData) {
            try {
                const response = await fetch(`${APP_ROOT}json/package.json`);
                jsonData = await response.json();
            } catch (error) {
                console.error("Error loading JSON:", error);
                isInitializing = false;
                return;
            }
        }

        setupStateHandlers();

        const savedState = getSavedState();
        const hasSavedState = !!savedState;

        if (hasSavedState) {
            restoreFilterState(savedState, false);
            window.trackingFilterState = savedState;
        }

        initVehicleTracking(hasSavedState);
        initLocationTracking(hasSavedState);
        initTabSwitching();

        // Add scroll listeners
        document.querySelectorAll('.tab-pane-custom').forEach(pane => {
            pane.addEventListener('scroll', () => {
                if (!isRestoringState) saveScrollPositions();
            }, { passive: true });
        });

        // Initial render
        if (!hasSavedState) {
            renderVehicles('all', false);
        } else {
            setTimeout(() => {
                const activeTab = savedState.activeTab || 'vehicles';
                renderTab(activeTab, savedState);
                restoreScrollPositions(savedState);
            }, 50);
        }

        isInitialized = true;
        isInitializing = false;
    }

    function setupStateHandlers() {
        if (!window.pageStateHandlers) window.pageStateHandlers = {};

        window.pageStateHandlers.tracking = {
            save: () => {
                saveScrollPositions();
                return getSavedState() || {
                    groupSelect: 'all',
                    vehicleSearch: '',
                    vehicleColor: ALL_COLORS,
                    activeTab: 'vehicles',
                    locationSearch: '',
                    ...SCROLL_KEYS
                };
            },
            restore: (container, customState) => {
                if (customState) {
                    window.trackingFilterState = customState;
                    restoreFilterState(customState, true);
                }
            },
            getSavedState: getSavedState
        };
    }

    // ===== EVENT LISTENERS =====
    document.addEventListener("click", (e) => {
        if (!e.target.closest(".dropdown-custom")) {
            document.querySelectorAll(".dropdown-menu-custom").forEach(m => m.style.display = "none");
        }
    });

    window.addEventListener('pageStateRestored', (e) => {
        if (e.detail?.page === 'tracking' && e.detail?.state?.custom) {
            window.trackingFilterState = e.detail.state.custom;
            if (isInitialized) restoreFilterState(e.detail.state.custom, true);
        }
    });

    const handlePageEvent = (e) => {
        const page = e.detail?.page;
        if (page === 'tracking' || page === 'stream') {
            if (!isInitialized) {
                setTimeout(initFilterComponent, 100);
            } else {
                const savedState = getSavedState();
                if (savedState) {
                    restoreFilterState(savedState, true);
                    setTimeout(() => restoreScrollPositions(savedState), 150);
                }
            }
        }
    };

    window.addEventListener('pageShown', handlePageEvent);
    window.addEventListener('pageLoaded', (e) => {
        if ((e.detail?.page === 'tracking' || e.detail?.page === 'stream') && !isInitialized) {
            setTimeout(initFilterComponent, 100);
        }
    });

    // Initialize on DOM ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            if (!isInitialized) initFilterComponent();
        });
    } else if (!isInitialized) {
        initFilterComponent();
    }
})();
