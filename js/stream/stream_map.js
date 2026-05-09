(function () {
    if (!window.MapManager) return;

    let initTimeout = null;
    const clearInitTimeout = () => {
        if (initTimeout) {
            clearTimeout(initTimeout);
            initTimeout = null;
        }
    };

    const startMap = () => {
        clearInitTimeout();
        if (document.getElementById('map')) window.MapManager.init();
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startMap);
    } else {
        startMap();
    }

    const handlePageLoad = (e) => {
        const pageName = e.detail?.page;
        const container = e.detail?.container;

        if (pageName !== 'stream') return;

        clearInitTimeout();

        if (window.MapManager.currentPage && window.MapManager.map && window.MapManager.currentPage !== pageName) {
            window.MapManager.saveMapState();
        }

        if (!window.MapManager.maps[pageName]) {
            if (window.MapManager.mapStates && window.MapManager.mapStates[pageName]) {
                delete window.MapManager.mapStates[pageName];
            }
        }

        let mapElement = container?.querySelector('#map');

        if (!mapElement && container) {
            mapElement = container.querySelector('#map');
            if (!mapElement) {
                const pageContainers = document.querySelectorAll(`[data-page="${pageName}"]`);
                for (const pageContainer of pageContainers) {
                    mapElement = pageContainer.querySelector('#map');
                    if (mapElement) break;
                }
            }
        }

        if (mapElement) {
            const pageContainer = mapElement.closest('[data-page]');
            const isVisible = !pageContainer || pageContainer.style.display !== 'none';

            if (window.MapManager.maps[pageName]) {
                window.MapManager.init(mapElement, pageName);
                // Khôi phục marker xe sau khi init
                if (window.MapManager.restoreStreamVehicle) {
                    requestAnimationFrame(() => {
                        window.MapManager.restoreStreamVehicle();
                    });
                }
            } else if (isVisible) {
                void mapElement.offsetHeight;
                window.MapManager.init(mapElement, pageName);

                if (window.MapManager.map) {
                    requestAnimationFrame(() => {
                        if (window.MapManager.map) {
                            window.MapManager.map.invalidateSize();
                        }
                    });
                }
            } else {
                window.MapManager.init(mapElement, pageName);
            }
        }
    };

    window.addEventListener('pageLoaded', handlePageLoad);
    window.addEventListener('pageShown', handlePageLoad);
})();
