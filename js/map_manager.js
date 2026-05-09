if (!window.MapManager) {
    const DEFAULT_CENTER = [21.0285, 105.8542];
    const DEFAULT_ZOOM = 13;
    const RESIZE_DEBOUNCE = 100;

    let cachedMapContainer = null;
    let cacheTimestamp = 0;
    const CACHE_TTL = 100;

    const findMapContainer = (mapElement = null) => {
        if (mapElement) {
            cachedMapContainer = mapElement;
            cacheTimestamp = Date.now();
            return mapElement;
        }

        const now = Date.now();
        if (cachedMapContainer && (now - cacheTimestamp) < CACHE_TTL && document.body.contains(cachedMapContainer)) {
            return cachedMapContainer;
        }

        const visiblePages = Array.from(document.querySelectorAll('[data-page]')).filter(p => p.style.display !== 'none');
        for (const page of visiblePages) {
            const mapEl = page.querySelector('#map');
            if (mapEl) {
                cachedMapContainer = mapEl;
                cacheTimestamp = now;
                return mapEl;
            }
        }

        const mapEl = document.getElementById('map');
        if (mapEl) {
            cachedMapContainer = mapEl;
            cacheTimestamp = now;
        }
        return mapEl;
    };

    // ========== POPUP CREATORS ==========
    const createVehiclePopup = (vehicle) => {
        const statusColor = vehicle.status === 'online' ? '#10b981' : '#6b7280';
        const info = [
            ['fas fa-user', 'Tài xế', vehicle.driver || 'N/A'],
            ['fas fa-tachometer-alt', 'Tốc độ', `${vehicle.speed} km/h`],
            ['fas fa-power-off', 'Máy', vehicle.engine === 'on' ? 'Bật' : 'Tắt'],
            ['fas fa-gas-pump', 'Nhiên liệu', `${Math.round(vehicle.fuel)}%`],
            ['fas fa-circle', 'Trạng thái', vehicle.status === 'online' ? 'Hoạt động' : 'Dừng'],
            vehicle.tag && ['fa-solid fa-tag', 'Tag', vehicle.tag]
        ].filter(Boolean).map(([icon, label, value]) =>
            `<div style="margin-bottom: 4px;"><i class="${icon}" style="color: #6b7280; width: 16px;"></i><strong>${label}:</strong> ${value}</div>`
        ).join('');

        return `<div style="min-width: 200px;"><div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1f2937; border-bottom: 2px solid ${statusColor}; padding-bottom: 6px;"><i class="fas fa-car" style="margin-right: 6px;"></i>${vehicle.plate}</div><div style="font-size: 12px; line-height: 1.8;">${info}</div></div>`;
    };

    const createLocationPopup = (location) => {
        return `<div style="min-width: 200px;">
      <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #1f2937; border-bottom: 2px solid ${location.color}; padding-bottom: 6px; display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 18px;">${location.icon}</span><span>${location.name}</span>
      </div>
      <div style="font-size: 12px; line-height: 1.8; color: #6b7280;">
        <div style="margin-bottom: 4px;"><i class="fas fa-map-marker-alt" style="color: ${location.color}; width: 16px;"></i> ${location.address || 'N/A'}</div>
        ${location.type ? `<div><i class="fas fa-tag" style="color: ${location.color}; width: 16px;"></i> ${location.type}</div>` : ''}
      </div>
    </div>`;
    };

    // ========== ICON CREATORS ==========
    const createCarIcon = (vehicle) => {
        const statusColor = vehicle.status === 'online' ? '#10b981' : '#6b7280';
        const absCenter = 'position: absolute; transform: translate(-50%, -50%); top: 50%; left: 50%;';
        const rotation = vehicle.heading !== undefined ? `transform: rotate(${vehicle.heading}deg);` : '';

        return L.divIcon({
            className: 'vehicle-marker',
            html: `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
        <i class="fas fa-location-arrow" style="color: ${statusColor}; font-size: 24px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); ${rotation}"></i>
        <div style="position: absolute; bottom: -8px; left: 50%; transform: translateX(-50%); background: ${statusColor}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; white-space: nowrap; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">${vehicle.plate}</div>
      </div>`,
            iconSize: [40, 50],
            iconAnchor: [20, 25],
            popupAnchor: [0, -25]
        });
    };

    const createLocationIcon = (location) => {
        return L.divIcon({
            className: 'location-marker',
            html: `<div style="position: relative; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center;">
        <div style="position: absolute; width: 36px; height: 36px; background: ${location.color}40; border-radius: 50%;"></div>
        <div style="position: absolute; width: 30px; height: 30px; background: white; border: 2px solid ${location.color}; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.25); font-size: 16px;">${location.icon}</div>
      </div>`,
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            popupAnchor: [0, -18]
        });
    };

    // ========== MAP MANAGER ==========
    window.MapManager = {
        map: null,
        maps: {},
        centerMarker: null,
        centerLabel: null,
        centerMarkers: {},
        centerLabels: {},
        isInitializing: false,
        vehicleMarkers: {},
        locationMarkers: {},
        mapContainer: null,
        mapContainers: {},
        currentPage: null,
        mapStates: {},
        // ========== CLEANUP & RESET ==========
        cleanup() {
            this.clearLocationMarkers();
            Object.keys(this.maps).forEach(pageName => {
                const map = this.maps[pageName];
                if (map) {
                    try {
                        if (this.centerMarkers[pageName]) map.removeLayer(this.centerMarkers[pageName]);
                        map.off();
                        map.remove();
                    } catch (e) { }
                }
                const container = this.mapContainers[pageName];
                if (container) {
                    container.querySelector('#center-label')?.remove();
                    container.innerHTML = '';
                    delete container._leaflet_id;
                    container.removeAttribute('style');
                }
            });
            Object.assign(this, { maps: {}, mapContainers: {}, centerMarkers: {}, centerLabels: {} });
            this.clearVehicleMarkers();
            this.reset();
        },

        reset() {
            this.map = null;
            this.centerMarker = null;
            this.centerLabel = null;
            this.mapContainer = null;
            this.vehicleMarkers = {};
            this.isInitializing = false;
        },

        // ========== STATE MANAGEMENT ==========
        saveMapState(pageName = null) {
            const page = pageName || this.currentPage;
            const map = page ? this.maps[page] : this.map;
            if (!map || !page) return;

            const center = map.getCenter();
            this.mapStates[page] = { center: [center.lat, center.lng], zoom: map.getZoom() };
            window.dispatchEvent(new CustomEvent('mapStateChanged', {
                detail: { page, center: [center.lat, center.lng], zoom: map.getZoom() }
            }));
        },

        getSavedMapState(pageName) {
            return this.mapStates[pageName] || null;
        },

        getCurrentMap() {
            return this.map || (this.currentPage ? this.maps[this.currentPage] : null);
        },

        // ========== MAP INITIALIZATION ==========
        init(mapElement = null, pageName = null) {
            if (this.isInitializing) return;

            const container = findMapContainer(mapElement);
            if (!container) return;

            const pageContainer = container.closest('[data-page]');
            if (!pageContainer) return;

            const detectedPageName = pageName || pageContainer?.getAttribute('data-page') || null;
            if (!detectedPageName) return;

            if (pageContainer.style.display === 'none' && this.maps[detectedPageName]) return;

            // Switch to existing map
            if (this.maps[detectedPageName]) {
                const existingMap = this.maps[detectedPageName];
                const existingContainer = this.mapContainers[detectedPageName];

                if (existingContainer !== container) {
                    if (container._leaflet_id) {
                        delete container._leaflet_id;
                        container.innerHTML = '';
                        container.removeAttribute('style');
                    }
                } else {
                    this.map = existingMap;
                    this.mapContainer = existingContainer;
                    this.centerMarker = this.centerMarkers[detectedPageName];
                    this.centerLabel = this.centerLabels[detectedPageName];
                    this.currentPage = detectedPageName;

                    if (container && !container.style.position) container.style.position = 'relative';
                    if (this.centerLabel && this.centerLabel.parentNode !== container) {
                        this.centerLabel.remove();
                        container.appendChild(this.centerLabel);
                    }

                    const savedState = this.getSavedMapState(detectedPageName);
                    const timeSinceInit = this.map._initTimestamp ? Date.now() - this.map._initTimestamp : Infinity;

                    if (savedState && !(this.map._initializedWithDefault && timeSinceInit < 2000)) {
                        this.map.setView(savedState.center, savedState.zoom, { animate: false });
                    }

                    requestAnimationFrame(() => {
                        if (this.map) {
                            this.map.invalidateSize();
                            this.updateCenter(true);
                        }
                    });
                    return;
                }
            }

            // Save current map state before switching
            if (this.currentPage && this.maps[this.currentPage]) {
                this.saveMapState(this.currentPage);
            }

            this.mapContainer = container;
            this.currentPage = detectedPageName;
            this.mapContainers[detectedPageName] = container;

            if (container._leaflet_id && !this.maps[detectedPageName]) {
                delete container._leaflet_id;
                container.innerHTML = '';
                container.removeAttribute('style');
            }

            this.isInitializing = true;

            try {
                const mapAlreadyExists = this.maps[detectedPageName] !== undefined;
                let savedState = mapAlreadyExists ? this.getSavedMapState(detectedPageName) : null;

                if (!mapAlreadyExists && this.mapStates?.[detectedPageName]) {
                    delete this.mapStates[detectedPageName];
                }

                const initialCenter = savedState ? savedState.center : DEFAULT_CENTER;
                const initialZoom = savedState ? savedState.zoom : DEFAULT_ZOOM;

                const map = L.map(container, { zoomControl: true, attributionControl: true }).setView(initialCenter, initialZoom);

                if (!mapAlreadyExists) {
                    map._initializedWithDefault = true;
                    map._initTimestamp = Date.now();
                }

                if (!map._tileLayerAdded) {
                    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                        attribution: '&copy; OpenStreetMap',
                        maxZoom: 19,
                        updateWhenZooming: false,
                        updateWhenIdle: true,
                        keepBuffer: 2,
                        maxNativeZoom: 19,
                        tileSize: 256,
                        zoomOffset: 0,
                        reuseTiles: true,
                        updateInterval: 200
                    }).addTo(map);
                    map._tileLayerAdded = true;
                }

                this.maps[detectedPageName] = map;
                this.map = map;

                this.createCenterMarker();
                this.createLabel();

                this.centerMarkers[detectedPageName] = this.centerMarker;
                this.centerLabels[detectedPageName] = this.centerLabel;

                let moveThrottle = null;
                map.on('move zoom', () => {
                    if (!moveThrottle) {
                        moveThrottle = requestAnimationFrame(() => {
                            this.updateCenter(false);
                            moveThrottle = null;
                        });
                    }
                });

                let saveStateTimeout = null;
                map.on('moveend zoomend', () => {
                    this.updateCenter(true);
                    const timeSinceInit = map._initTimestamp ? Date.now() - map._initTimestamp : Infinity;
                    if (timeSinceInit > 1000) {
                        if (saveStateTimeout) clearTimeout(saveStateTimeout);
                        saveStateTimeout = setTimeout(() => this.saveMapState(detectedPageName), 300);
                    }
                });

                this.updateCenter(true);

                requestAnimationFrame(() => {
                    if (map && !map._sizeValidated) {
                        map.invalidateSize();
                        map._sizeValidated = true;
                    }
                });
            } catch (error) {
                console.error('Lỗi khởi tạo map:', error);
                if (this.maps[detectedPageName]) delete this.maps[detectedPageName];
            } finally {
                this.isInitializing = false;
            }
        },

        // ========== CENTER MARKER & LABEL ==========
        createCenterMarker() {
            if (!this.map) return;
            const crossStyle = 'position: absolute; width: 2px; height: 14px; background: #ff0000; transform: translate(-50%, -50%); top: 50%; left: 50%;';
            this.centerMarker = L.marker(this.map.getCenter(), {
                icon: L.divIcon({
                    className: 'center-marker',
                    html: `<div style="position: relative; width: 10px; height: 10px; display: flex; align-items: center; justify-content: center;"><div style="${crossStyle}"></div><div style="${crossStyle.replace('2px; height: 14px', '14px; height: 2px')}"></div></div>`,
                    iconSize: [10, 10],
                    iconAnchor: [10, 10]
                }),
                interactive: false
            }).addTo(this.map);
        },

        createLabel() {
            const container = this.mapContainer || findMapContainer();
            if (!container) return;

            container.querySelector('#center-label')?.remove();
            this.centerLabel = Object.assign(document.createElement('div'), {
                id: 'center-label',
                style: 'position: absolute;  left: 50%; transform: translateX(-50%); color: black; padding: 4px 6px; border-radius: 6px; font-size: 13px; font-weight: 700; z-index: 1000; pointer-events: none;'
            });
            container.style.position = 'relative';
            container.appendChild(this.centerLabel);
        },

        updateCenter(immediate = false) {
            if (!this.map || !this.centerMarker || !this.centerLabel) return;

            const center = this.map.getCenter();
            this.centerMarker.setLatLng(center);

            if (!immediate && this._updateCenterTimeout) clearTimeout(this._updateCenterTimeout);

            if (this.currentPage === 'stream') {
                this.centerLabel.style.display = 'none';
                return;
            } else {
                this.centerLabel.style.display = 'block';
            }

            const updateLabel = () => {
                if (!this.map || !this.centerLabel) return;
                const center = this.map.getCenter();
                const lat = center.lat.toFixed(5), lng = center.lng.toFixed(5);

                const copyBtnId = `copy-btn-${this.currentPage || 'default'}`;
                let copyBtn = this._cachedCopyBtn;
                if (!copyBtn || copyBtn.id !== copyBtnId) {
                    copyBtn = document.getElementById(copyBtnId);
                    this._cachedCopyBtn = copyBtn;
                }

                const newContent = `<div style="display: flex; align-items: center; gap: 8px;"><span style="font-weight: 600;">Tâm:</span>
                <span style="font-size: 12px;">${lat}, ${lng}</span>
              <button id="${copyBtnId}" style="background: rgba(255, 255, 255, 0.2); border: none; color: black; padding: 4px 6px; border-radius: 4px; cursor: pointer; font-size: 11px; pointer-events: auto; transition: all 0.2s;">
                            <i class="fas fa-copy"></i></button>
                </div>`;

                if (this.centerLabel.innerHTML !== newContent) {
                    this.centerLabel.innerHTML = newContent;
                    copyBtn = document.getElementById(copyBtnId);
                    this._cachedCopyBtn = copyBtn;
                }

                if (copyBtn && !copyBtn._listenersAttached) {
                    copyBtn.onmouseover = () => copyBtn.style.background = 'rgba(255, 255, 255, 0.3)';
                    copyBtn.onmouseout = () => copyBtn.style.background = 'rgba(255, 255, 255, 0.2)';
                    copyBtn.onclick = () => this.copyCoordinates(lat, lng, copyBtn);
                    copyBtn._listenersAttached = true;
                }
            };

            immediate ? updateLabel() : (this._updateCenterTimeout = setTimeout(updateLabel, 16));
        },

        copyCoordinates(lat, lng, button) {
            const text = `${lat}, ${lng}`;
            const copy = () => {
                const textarea = Object.assign(document.createElement('textarea'), {
                    value: text,
                    style: 'position: fixed; opacity: 0;'
                });
                document.body.appendChild(textarea);
                textarea.select();
                try {
                    document.execCommand('copy');
                    this.showCopySuccess(button);
                } catch (err) {
                    console.error('Không thể sao chép:', err);
                }
                document.body.removeChild(textarea);
            };

            navigator.clipboard?.writeText(text).then(() => this.showCopySuccess(button)).catch(copy) || copy();
        },

        showCopySuccess(button) {
            const original = button.innerHTML, originalBg = button.style.background;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = 'rgba(16, 185, 129, 0.9)';
            setTimeout(() => {
                button.innerHTML = original;
                button.style.background = originalBg || 'rgba(255, 255, 255, 0.2)';
            }, 1500);
        },

        // ========== VEHICLE MARKERS ==========
        displayVehicles(vehicles, shouldFitBounds = true) {
            if (this.currentPage !== 'tracking') {
                this.clearVehicleMarkers();
                return;
            }

            const map = this.getCurrentMap();
            if (!map || !Array.isArray(vehicles)) return;

            const vehicleIds = new Set(vehicles.filter(v => v.lat && v.lng).map(v => v.id));
            const currentIds = new Set(Object.keys(this.vehicleMarkers).map(id => parseInt(id)));

            if (vehicleIds.size !== currentIds.size || ![...vehicleIds].every(id => currentIds.has(id))) {
                this.clearVehicleMarkers();
            }

            const validVehicles = vehicles.filter(v => v.lat && v.lng).map(vehicle => {
                if (!this.vehicleMarkers[vehicle.id]) {
                    const marker = L.marker([vehicle.lat, vehicle.lng], { icon: createCarIcon(vehicle) }).addTo(map);
                    marker.bindPopup(createVehiclePopup(vehicle));
                    this.vehicleMarkers[vehicle.id] = marker;
                } else {
                    const currentPos = this.vehicleMarkers[vehicle.id].getLatLng();
                    if (Math.abs(currentPos.lat - vehicle.lat) > 0.0001 || Math.abs(currentPos.lng - vehicle.lng) > 0.0001) {
                        this.vehicleMarkers[vehicle.id].setLatLng([vehicle.lat, vehicle.lng]);
                    }
                }
                return [vehicle.lat, vehicle.lng];
            });

            const timeSinceInit = map._initTimestamp ? Date.now() - map._initTimestamp : Infinity;
            const shouldSkipFitBounds = map._initializedWithDefault && timeSinceInit < 2000;

            if (shouldFitBounds && !shouldSkipFitBounds && validVehicles.length > 0 && !map._boundsFitted) {
                map.fitBounds(validVehicles, { padding: [50, 50] });
                map._boundsFitted = true;
                map.once('moveend', () => { map._boundsFitted = false; });
            }
        },

        clearVehicleMarkers() {
            const map = this.getCurrentMap();
            if (!map) {
                this.vehicleMarkers = {};
                return;
            }
            Object.values(this.vehicleMarkers).forEach(marker => {
                try { map.removeLayer(marker); } catch (e) { }
            });
            this.vehicleMarkers = {};
        },

        updateVehiclePosition(vehicle) {
            if (this.currentPage !== 'tracking') return;

            const map = this.getCurrentMap();
            if (!map || !vehicle.lat || !vehicle.lng) return;

            if (this.vehicleMarkers[vehicle.id]) {
                this.vehicleMarkers[vehicle.id].setLatLng([vehicle.lat, vehicle.lng]);
                this.vehicleMarkers[vehicle.id].setIcon(createCarIcon(vehicle));
            } else {
                const marker = L.marker([vehicle.lat, vehicle.lng], { icon: createCarIcon(vehicle) }).addTo(map);
                marker.bindPopup(createVehiclePopup(vehicle));
                this.vehicleMarkers[vehicle.id] = marker;
            }
        },

        // ========== LOCATION MARKERS ==========
        displayLocations(locations) {
            if (this.currentPage !== 'tracking' && this.currentPage !== 'route') {
                this.clearLocationMarkers();
                return;
            }

            const map = this.getCurrentMap();
            if (!map || !Array.isArray(locations)) return;

            this.clearLocationMarkers();
            locations.filter(loc => loc.lat && loc.lng).forEach(location => {
                const marker = L.marker([location.lat, location.lng], { icon: createLocationIcon(location) }).addTo(map);
                marker.bindPopup(createLocationPopup(location));
                this.locationMarkers[location.id] = marker;
            });
        },

        clearLocationMarkers() {
            const map = this.getCurrentMap();
            if (!map) {
                this.locationMarkers = {};
                return;
            }
            Object.values(this.locationMarkers).forEach(marker => {
                try { map.removeLayer(marker); } catch (e) { }
            });
            this.locationMarkers = {};
        },

        // ========== STREAM PAGE ==========
        displayStreamVehicle(vehicle) {
            if (this.currentPage !== 'stream') return;

            const map = this.getCurrentMap();
            if (!map || !vehicle.lat || !vehicle.lng) return;

            this.clearVehicleMarkers();

            const marker = L.marker([vehicle.lat, vehicle.lng], { icon: createCarIcon(vehicle) }).addTo(map);
            marker.bindPopup(createVehiclePopup(vehicle));
            this.vehicleMarkers[vehicle.plate] = marker;
            this._streamVehicleData = vehicle;

            map.setView([vehicle.lat, vehicle.lng], 15, { animate: true });
            setTimeout(() => this.saveMapState('stream'), 500);
        },

        restoreStreamVehicle() {
            if (this.currentPage !== 'stream' || !this._streamVehicleData) return;

            const map = this.getCurrentMap();
            if (!map) return;

            const vehicle = this._streamVehicleData;
            if (this.vehicleMarkers[vehicle.plate]) return;

            const marker = L.marker([vehicle.lat, vehicle.lng], { icon: createCarIcon(vehicle) }).addTo(map);
            marker.bindPopup(createVehiclePopup(vehicle));
            this.vehicleMarkers[vehicle.plate] = marker;
        }
    };

    // ========== RESIZE HANDLER ==========
    let resizeTimeout = null;
    let lastResizeWidth = window.innerWidth;
    let lastResizeHeight = window.innerHeight;

    window.addEventListener('resize', () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            const currentWidth = window.innerWidth;
            const currentHeight = window.innerHeight;
            if (currentWidth !== lastResizeWidth || currentHeight !== lastResizeHeight) {
                lastResizeWidth = currentWidth;
                lastResizeHeight = currentHeight;

                const currentMap = window.MapManager.map;
                if (currentMap) {
                    currentMap._sizeValidated = false;
                    currentMap.invalidateSize();
                }

                Object.values(window.MapManager.maps).forEach(map => {
                    if (map && map !== currentMap) {
                        try {
                            map._sizeValidated = false;
                            map.invalidateSize();
                        } catch (e) { }
                    }
                });
            }
        }, RESIZE_DEBOUNCE);
    }, { passive: true });

    window.addEventListener('beforeunload', () => window.MapManager.cleanup());
}
