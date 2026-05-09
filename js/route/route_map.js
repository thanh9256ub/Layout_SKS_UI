(function () {
  if (!window.MapManager) return;

  let initTimeout = null, routePolyline = null, routeData = null;
  let startMarker = null, currentPositionMarker = null, selectedPointIndex = null, endMarker = null;
  let routeMarkers = [];

  const injectStyle = (id, css) => {
    if (document.getElementById(id)) return;
    const style = document.createElement('style');
    style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
  };

  const createIcon = (type, color, label, isPulse = false, heading = 0) => {
    if (isPulse) {
      injectStyle('position-marker-animation', `
        @keyframes pulse { 0%, 100% { transform: scale(1); opacity: 0.3; } 50% { transform: scale(1.2); opacity: 0.1; } }
      `);
    }

    const rotation = heading !== null ? `transform: rotate(${heading}deg);` : '';

    const html = isPulse
      ? `<div style="position: relative; width: 50px; height: 50px; display: flex; align-items: center; justify-content: center;">
           <div style="position: absolute; width: 50px; height: 50px; background: ${color}; border-radius: 50%; opacity: 0.3; animation: pulse 1.5s ease-in-out infinite;"></div>
           <i class="fas fa-location-arrow" style="color: ${color}; font-size: 28px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); ${rotation}"></i>
         </div>`
      : `<div style="position: relative; width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
           <i class="fas fa-location-arrow" style="color: ${color}; font-size: 25px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3)); ${rotation}"></i>
         </div>`;

    return L.divIcon({
      className: type,
      html,
      iconSize: isPulse ? [50, 50] : [40, 40],
      iconAnchor: isPulse ? [25, 25] : [20, 20],
      popupAnchor: [0, -25]
    });
  };

  const createEndIcon = () => L.divIcon({
    className: 'route-end-marker',
    html: `<div style="position: relative; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center;">
             <div style="position: absolute; width: 30px; height: 30px; background: #ef4444; border-radius: 50%; opacity: 0.2;"></div>
             <div style="position: absolute; width: 24px; height: 24px; background: white; border: 3px solid #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">
               <i class="fas fa-flag-checkered" style="color: #ef4444; font-size: 10px;"></i>
             </div>
           </div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    popupAnchor: [0, -15]
  });

  function calculateHeading(lat1, lng1, lat2, lng2) {
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const lat1Rad = lat1 * Math.PI / 180;
    const lat2Rad = lat2 * Math.PI / 180;

    const y = Math.sin(dLng) * Math.cos(lat2Rad);
    const x = Math.cos(lat1Rad) * Math.sin(lat2Rad) -
      Math.sin(lat1Rad) * Math.cos(lat2Rad) * Math.cos(dLng);

    let heading = Math.atan2(y, x) * 180 / Math.PI;
    return (heading + 360) % 360;
  }

  function removeRouteLayers(keepImportantMarkers = false) {
    const map = window.MapManager.getCurrentMap();
    if (!map) return;

    if (routePolyline) { map.removeLayer(routePolyline); routePolyline = null; }
    routeMarkers.forEach(layer => { try { map.removeLayer(layer); } catch (e) { } });
    routeMarkers = [];

    if (!keepImportantMarkers) {
      if (startMarker) { try { map.removeLayer(startMarker); } catch (e) { } startMarker = null; }
      if (endMarker) { try { map.removeLayer(endMarker); } catch (e) { } endMarker = null; }
      if (currentPositionMarker) { try { map.removeLayer(currentPositionMarker); } catch (e) { } currentPositionMarker = null; }
    } else {
    }
  }

  function clearRoute() {
    removeRouteLayers();
    routeData = null;
    selectedPointIndex = null;
  }

  function showVehicleAtPoint(vehicle, point, index, shouldPan = true) {
    const map = window.MapManager.getCurrentMap();
    if (!map) return;

    selectedPointIndex = index;
    if (startMarker) { try { map.removeLayer(startMarker); startMarker = null; } catch (e) { } }
    if (currentPositionMarker) { try { map.removeLayer(currentPositionMarker); } catch (e) { } }

    map.closePopup();

    let heading = 0;
    if (routeData && routeData.routePoints && index < routeData.routePoints.length - 1) {
      const current = routeData.routePoints[index];
      const next = routeData.routePoints[index + 1];
      heading = calculateHeading(current.lat, current.lng, next.lat, next.lng);
    }

    currentPositionMarker = L.marker([point.lat, point.lng], {
      icon: createIcon('current-position-marker', '#f59e0b', vehicle.plate || 'Xe', true, heading),
      zIndexOffset: 2000
    }).addTo(map);

    if (shouldPan) map.setView([point.lat, point.lng], Math.max(map.getZoom(), 15), { animate: true });
  }

  function displayRoute(vehicle, routePoints, shouldFocus = false, restorePointIndex = null) {
    const map = window.MapManager.getCurrentMap();
    if (!map || !routePoints?.length) return;

    removeRouteLayers();

    injectStyle('route-animation-style', `@keyframes dash { to { stroke-dashoffset: -25; } } .animated-route-line { animation: dash 1s linear infinite; }`);
    const coords = routePoints.map(p => [p.lat, p.lng]);
    const lines = [
      { color: '#1e40af', weight: 6, opacity: 0.4 },
      { color: '#3b82f6', weight: 4, opacity: 0.9 },
      { color: '#60a5fa', weight: 4, opacity: 0.8, dashArray: '10, 15', className: 'animated-route-line' }
    ];

    lines.forEach((opt, i) => {
      const line = L.polyline(coords, { ...opt, smoothFactor: 1, lineCap: 'round', lineJoin: 'round' }).addTo(map);
      if (i === 1) routePolyline = line;
      else routeMarkers.push(line);
    });

    const pointToRestore = restorePointIndex !== null && restorePointIndex !== undefined ? restorePointIndex : selectedPointIndex;

    if (routePoints.length > 1) {
      endMarker = L.marker(coords[coords.length - 1], {
        icon: createEndIcon(),
        zIndexOffset: 1000
      }).addTo(map);
    }

    if (pointToRestore === null || pointToRestore === undefined || pointToRestore === 0) {
      let startHeading = 0;
      if (routePoints.length > 1) {
        startHeading = calculateHeading(routePoints[0].lat, routePoints[0].lng, routePoints[1].lat, routePoints[1].lng);
      }

      startMarker = L.marker(coords[0], {
        icon: createIcon('vehicle-route-marker', '#f3ad2bff', vehicle.plate || 'Bắt đầu', false, startHeading),
        zIndexOffset: 1000
      }).addTo(map);
    } else if (routePoints[pointToRestore]) {
      selectedPointIndex = pointToRestore;
      const pt = routePoints[pointToRestore];

      let heading = 0;
      if (pointToRestore < routePoints.length - 1) {
        const next = routePoints[pointToRestore + 1];
        heading = calculateHeading(pt.lat, pt.lng, next.lat, next.lng);
      }

      currentPositionMarker = L.marker([pt.lat, pt.lng], {
        icon: createIcon('current-position-marker', '#f5880bff', vehicle.plate || 'Xe', true, heading),
        zIndexOffset: 2000
      }).addTo(map);
    }

    if (shouldFocus) {
      const focusPoint = pointToRestore > 0 && routePoints[pointToRestore]
        ? [routePoints[pointToRestore].lat, routePoints[pointToRestore].lng]
        : coords[0];
      map.setView(focusPoint, 16, { animate: true });
    }

    routeData = { vehicle, routePoints };
  }

  const handlePageLoad = (e) => {
    const { page: pageName, container } = e.detail || {};
    if (pageName !== 'route') { removeRouteLayers(); return; }

    if (initTimeout) clearTimeout(initTimeout);

    if (window.MapManager.currentPage && window.MapManager.currentPage !== pageName) window.MapManager.saveMapState();
    window.MapManager.clearVehicleMarkers();

    let mapEl = container?.querySelector('#map') || document.querySelector(`[data-page="${pageName}"] #map`);
    if (!mapEl) return;

    const pageContainer = mapEl.closest('[data-page]');
    const isVisible = !pageContainer || pageContainer.style.display !== 'none';
    const hasMap = !!window.MapManager.maps[pageName];

    if (hasMap || isVisible) {
      if (!hasMap) void mapEl.offsetHeight;
      window.MapManager.init(mapEl, pageName);
      if (window.MapManager.map) {
        window.MapManager.map.closePopup();
        if (!hasMap) requestAnimationFrame(() => window.MapManager.map.invalidateSize());
      }

      if (routeData) {
        displayRoute(routeData.vehicle, routeData.routePoints, false, selectedPointIndex);
      } else if (window.LocationMarkers) {
        window.LocationMarkers.display(window.MapManager.getCurrentMap(), pageName);
      }
    } else {
      window.MapManager.init(mapEl, pageName);
      if (!routeData && window.LocationMarkers) window.LocationMarkers.display(window.MapManager.getCurrentMap(), pageName);
    }
  };

  window.addEventListener('vehicleRouteSelected', (e) => {
    const { vehicle, routePoints, shouldFocus, selectedPointIndex: ptIdx, currentRouteIndex } = e.detail || {};
    if (vehicle && routePoints?.length) {
      const indexToRestore = currentRouteIndex !== undefined && currentRouteIndex !== null
        ? currentRouteIndex
        : (ptIdx !== undefined && ptIdx !== null ? ptIdx : null);

      const invoke = () => displayRoute(vehicle, routePoints, shouldFocus !== false, indexToRestore);
      const map = window.MapManager.getCurrentMap();
      if (map && window.MapManager.currentPage === 'route') invoke();
    } else clearRoute();
  });

  window.addEventListener('vehicleRouteCleared', clearRoute);

  window.addEventListener('pageStateRestored', (e) => {
    if (e.detail?.page === 'route' && routeData) {
      displayRoute(routeData.vehicle, routeData.routePoints, false, selectedPointIndex);
    }
  });

  window.addEventListener('showVehicleAtPoint', (e) => {
    const { vehicle, point, index } = e.detail || {};
    if (window.MapManager?.currentPage !== 'route') return;
    if (vehicle && point?.lat) showVehicleAtPoint(vehicle, point, index, true);
  });

  let isRouteVisible = true;
  function toggleRouteVisibility() {
    isRouteVisible = !isRouteVisible;
    const btn = document.getElementById('toggleRouteBtn');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = isRouteVisible ? 'fas fa-eye' : 'fas fa-eye-slash';
        btn.title = isRouteVisible ? 'Ẩn lộ trình' : 'Hiện lộ trình';
      }
    }

    if (isRouteVisible) {
      if (routeData) {
        displayRoute(routeData.vehicle, routeData.routePoints, false, selectedPointIndex);
      }
    } else {
      removeRouteLayers(true);
    }
  }

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('#toggleRouteBtn');
    if (btn) {
      toggleRouteVisibility();
    }
  });

  const start = () => { if (document.getElementById('map')) window.MapManager.init(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.addEventListener('pageLoaded', handlePageLoad);
  window.addEventListener('pageShown', handlePageLoad);

  window.addEventListener('vehicleRouteSelected', () => {
    isRouteVisible = true;
    const btn = document.getElementById('toggleRouteBtn');
    if (btn) {
      const icon = btn.querySelector('i');
      if (icon) {
        icon.className = 'fas fa-eye';
        btn.title = 'Ẩn lộ trình';
      }
    }
  });
})();