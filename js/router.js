(function () {
    if (window.__routerInitialized) return;
    window.__routerInitialized = true;
    window.__routerReady = false;
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    const mainBody = document.getElementById('sp-main-body');
    if (!mainBody) return;

    const PAGES = {
        home: {
            html: 'index.html', scripts: ['js/home/home_cards.js', 'js/home/home_filter.js', 'js/home/home_tracking_gps.js', "js/settings/settings_menu.js",
                'js/home/home_schedule.js', 'js/home/home_preview.js', 'js/home/home_search_vehicle.js', 'js/home/home_list.js']
        },
        tracking: { html: 'html/tracking.html', scripts: ['js/tracking/tracking_filter.js', 'js/map_manager.js', 'js/tracking/tracking_map.js'] },
        route: {
            html: 'html/route.html',
            scripts: ['js/route/route_filter.js', 'js/map_manager.js', 'js/route/route_map.js'],
            htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Skysoft Go</title></head>
<body>
    <section id="sp-main-body">
        <div class="container-fluid">
            <div class="main-content bg-white route-screen">
                <div class="row route-row">
                    <div class="col-12 col-sm-2" id="filter">
                        <div class="main-container">
                            <div class="filter-section">
                                <div class="custom-dropdown mb-2">
                                    <select id="groupFilterSelectTime" class="rounded">
                                        <option value="1" selected>1 giờ gần đây</option>
                                        <option value="2">4 giờ gần đây</option>
                                        <option value="3">6 giờ gần đây</option>
                                        <option value="4">12 giờ gần đây</option>
                                        <option value="5">24 giờ gần đây</option>
                                        <option value="6">Ngày hôm nay</option>
                                        <option value="7">Ngày hôm qua</option>
                                        <option value="8">Điều kiện khác</option>
                                    </select>
                                </div>
                                <div class="route-custom-time" id="routeCustomTime" style="display:none">
                                    <div class="mb-2">
                                        <label for="routeDateFrom" class="form-label-search"><i class="fas fa-calendar-day me-2"></i>Từ ngày</label>
                                        <input type="date" id="routeDateFrom" class="form-control-search">
                                    </div>
                                    <div class="mb-2">
                                        <label for="routeDateTo" class="form-label-search"><i class="fas fa-calendar-check me-2"></i>Đến ngày</label>
                                        <input type="date" id="routeDateTo" class="form-control-search">
                                    </div>
                                    <div class="mb-2">
                                        <label for="routeTimeFrom" class="form-label-search"><i class="fas fa-clock me-2"></i>Từ giờ</label>
                                        <input type="time" id="routeTimeFrom" class="form-control-search">
                                    </div>
                                    <div class="mb-2">
                                        <label for="routeTimeTo" class="form-label-search"><i class="fas fa-clock me-2"></i>Đến giờ</label>
                                        <input type="time" id="routeTimeTo" class="form-control-search">
                                    </div>
                                </div>
                                <div class="search-plate mb-2">
                                    <div class="autocomplete-container route-plate-search">
                                        <input type="text" class="form-control-search" id="vehicleSearchInput" placeholder="Tìm biển số xe...">
                                        <button type="button" class="route-inline-search-btn" id="routeInlineSearchBtn" title="Tìm kiếm">
                                            <i class="fas fa-search"></i>
                                        </button>
                                        <div class="autocomplete-results" id="autocompleteResults"></div>
                                    </div>
                                </div>
                                <button type="button" class="btn btn-primary-custom w-100 mb-2" id="searchRoutesBtn">
                                    <i class="fas fa-search me-2"></i>Tìm kiếm
                                </button>
                            </div>
                            <div class="table-container">
                                <div id="emptyState" class="empty-state">
                                    <i class="fas fa-search-location"></i>
                                    <h4>Chưa có kết quả tìm kiếm</h4>
                                    <p>Hãy nhập biển số xe bạn muốn tìm kiếm để xem lộ trình</p>
                                </div>
                                <div id="loadingIndicator" class="loading-spinner" style="display: none;">
                                    <div class="spinner"></div>
                                </div>
                                <div id="resultsTable" style="display: none;">
                                    <div class="table-responsive">
                                        <table class="table-filter table-hover mb-0">
                                            <thead>
                                                <tr>
                                                    <th>Thời điểm</th>
                                                    <th>VT</th>
                                                    <th>Km</th>
                                                    <th>Máy</th>
                                                </tr>
                                            </thead>
                                            <tbody id="vehicleTableBody"></tbody>
                                        </table>
                                    </div>
                                </div>
                                <div class="route-progress-container" id="routeProgressContainer" style="display: none;">
                                    <div class="route-progress-bar">
                                        <div class="route-progress-fill" id="routeProgressFill"></div>
                                    </div>
                                </div>
                                <div class="table-controls" id="tableControls" style="display: none;">
                                    <button class="btn-control" id="prevBtn" title="Điểm trước"><i class="fas fa-chevron-left"></i></button>
                                    <button class="btn-control" id="toggleRouteBtn" title="Ẩn/Hiện lộ trình"><i class="fas fa-eye"></i></button>
                                    <button class="btn-control" id="playBtn" title="Phát"><i class="fas fa-play"></i></button>
                                    <button class="btn-control" id="pauseBtn" title="Tạm dừng"><i class="fas fa-pause"></i></button>
                                    <button class="btn-control" id="nextBtn" title="Điểm tiếp"><i class="fas fa-chevron-right"></i></button>
                                    <div style="display: flex; align-items: center; gap: 4px; margin-left: auto;">
                                        <button class="btn-control" id="speedDownBtn" title="Giảm tốc độ"><i class="fas fa-minus"></i></button>
                                        <div style="min-width: 30px; text-align: center; font-weight: 600; font-size: 13px; color: #1f2937;" id="speedDisplay">x1</div>
                                        <button class="btn-control" id="speedUpBtn" title="Tăng tốc độ"><i class="fas fa-plus"></i></button>
                                    </div>
                                </div>
                                <div id="noResults" class="no-results" style="display: none;">
                                    <i class="fas fa-search"></i>
                                    <h4>Không tìm thấy lộ trình</h4>
                                    <p>Xe này không có lộ trình trong khoảng thời gian được chọn</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-12 col-sm-10 route-map-col">
                        <div id="map-container" class="route-map-container">
                            <div id="map"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
        },
        camera: { html: 'html/camera.html', scripts: ['js/camera/camera_filter.js', 'js/camera/camera_thumb.js'] },
        stream: {
            html: 'html/stream.html', scripts: ['js/stream/stream.js', 'js/map_manager.js', 'js/stream/stream_map.js'],
            externalScripts: ['https://cdn.jsdelivr.net/npm/hls.js@latest']
        },
        videoPlayback: {
            html: 'html/video_playback.html', scripts: ['js/video_playback/video_playback.js'],
            htmlContent: `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>Skysoft Go</title></head>
<body>
    <section id="sp-main-body">
        <div class="container-fluid">
            <div class="main-content video-playback-screen">
                <div class="video-playback-layout">
                    <aside class="video-playback-sidebar">
                        <form class="video-playback-filter" id="videoPlaybackFilter" autocomplete="off">
                            <label class="video-filter-field">
                                <span><i class="fas fa-calendar-day"></i> Ngày</span>
                                <input type="date" id="videoPlaybackDate">
                            </label>
                            <label class="video-filter-field video-plate-field">
                                <span><i class="fas fa-car-side"></i> Bi&#7875;n s&#7889;</span>
                                <div class="video-plate-search-row">
                                    <input type="text" id="videoPlaybackPlate" list="videoPlaybackPlates" placeholder="Nhap bien so..." autocomplete="off">
                                    <datalist id="videoPlaybackPlates"></datalist>
                                    <button type="submit" title="T&#236;m"><i class="fas fa-magnifying-glass"></i></button>
                                </div>
                            </label>
                        </form>
                        <div class="video-file-list" id="videoPlaybackList"></div>
                    </aside>
                    <main class="video-player-panel">
                        <div class="video-player-frame">
                            <video id="videoPlaybackPlayer" controls playsinline></video>
                            <div class="video-player-empty" id="videoPlaybackEmpty">
                                <i class="fas fa-play-circle"></i>
                                <span>Ch&#7885;n file video &#273;&#7875; ph&#225;t</span>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    </section>
</body>
</html>`
        },
        oilChart: { html: 'html/oil_chart.html', scripts: ['js/oil_chart/oil_chart.js'] },
        countTrip: {
            html: 'html/count_trip.html', scripts: ['js/count_trip/trips/single-point-trip.js', 'js/count_trip/trips/multi-point-trip.js',
                'js/count_trip/trips/arc-from-point-trip.js', 'js/count_trip/trips/arc-to-point-trip.js', 'js/count_trip/count_trip_screen.js']
        },
        report: {
            html: 'html/report.html', scripts: ['js/report/reports/journey-adco-report.js', 'js/report/reports/stop-points-report.js',
                'js/report/reports/temperature-report.js', 'js/report/reports/vehicle-history-report.js', 'js/report/reports/route-based-roadmap-report.js',
                'js/report/reports/fuel-usage-report.js', 'js/report/reports/events-report.js', 'js/report/reports/speed-violation-report.js',
                'js/report/reports/summary-new-report.js', 'js/report/reports/summary-3d-report.js', 'js/report/reports/summary-sci-report.js',
                'js/report/reports/qcvn06-stop-report.js', 'js/report/reports/qcvn06-driver-report.js', 'js/report/reports/qcvn06-vehicle-report.js',
                'js/report/reports/qcvn06-journey-report.js', 'js/report/reports/qcvn06-overspeed-report.js', 'js/report/reports/qcvn06-driving-time-report.js',
                'js/report/reports/qcvn06-speed-report.js', 'js/report/report_screen.js']
        },
        support: { html: 'html/support.html', scripts: ['js/support/support.js'] }
    };

    const PAGE_SCRIPTS_PATHS = ['js/home/', 'js/tracking/', 'js/route/', 'js/camera/', 'js/stream/', 'js/video_playback/', 'js/oil_chart/', 'js/count_trip/', 'js/report/', 'js/support/'];
    Object.values(PAGES).forEach(config => {
        config.html = `${APP_ROOT}${config.html}`;
        config.scripts = config.scripts.map(src => `${APP_ROOT}${src}`);
    });

    // ========== STATE ==========
    const pageCache = new Map(), loadedScripts = new Set();
    let currentPageName = null, currentPageStyles = [];

    const $ = (sel) => mainBody?.querySelector(sel);
    const getPageContainer = (pageName) => mainBody?.querySelector(`[data-page="${pageName}"]`);
    const triggerEvent = (el, type) => el.dispatchEvent(new Event(type, { bubbles: true }));

    // ========== SAVE PAGE STATE ==========
    function savePageState(pageName) {
        const container = getPageContainer(pageName);
        if (!pageName || !container) return;

        const state = { scrollPosition: window.scrollY, formData: {}, activeStates: {}, mapState: null };
        const processedRadioGroups = new Set();

        container.querySelectorAll('input, select, textarea').forEach(input => {
            const name = input.name || input.id || input.className || input.getAttribute('data-state-key');
            if (!name) return;

            if (input.type === 'radio') {
                if (!processedRadioGroups.has(name)) {
                    const checked = container.querySelector(`input[type="radio"][name="${name}"]:checked`);
                    state.formData[name] = checked?.value || null;
                    processedRadioGroups.add(name);
                }
            } else if (input.type === 'checkbox') {
                state.formData[name] = input.checked;
            } else {
                state.formData[name] = input.value;
            }
        });

        container.querySelectorAll('.active, [class*="active"], [data-active="true"]').forEach(el => {
            const className = el.className?.baseVal !== undefined ? el.className.baseVal : el.className;
            const key = el.id || (typeof className === 'string' ? className : null) || el.getAttribute('data-state-key') || el.getAttribute('data-name') || el.getAttribute('data-report');
            if (key && typeof key === 'string') state.activeStates[key] = true;
        });

        container.querySelectorAll('[data-selected="true"], .selected, [aria-selected="true"]').forEach(el => {
            const key = el.id || el.getAttribute('data-state-key') || el.getAttribute('data-id');
            if (key && typeof key === 'string') state.activeStates[`selected_${key}`] = true;
        });

        if (window.MapManager?.mapStates?.[pageName]) {
            state.mapState = window.MapManager.mapStates[pageName];
        } else if ((pageName === 'tracking' || pageName === 'route') && window.MapManager?.map?.currentPage === pageName) {
            const map = window.MapManager.map;
            state.mapState = { center: [map.getCenter().lat, map.getCenter().lng], zoom: map.getZoom() };
        }

        if (window.pageStateHandlers?.[pageName]?.save) {
            try { state.custom = window.pageStateHandlers[pageName].save(container); }
            catch (e) { console.warn('Error saving custom state for', pageName, e); }
        }

        if (pageCache.has(pageName)) pageCache.get(pageName).state = state;
    }

    // ========== RESTORE PAGE STATE ==========
    function restorePageState(pageName) {
        const cached = pageCache.get(pageName);
        if (!cached?.state) return;

        const container = getPageContainer(pageName);
        if (!container) return;

        const { state } = cached;
        const findEl = (name) => container.querySelector(`[name="${name}"], #${name}, .${name}, [data-state-key="${name}"]`);

        Object.entries(state.formData || {}).forEach(([name, value]) => {
            const input = findEl(name);
            if (!input) return;

            if (input.type === 'radio') {
                const radio = container.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);
                if (radio) { radio.checked = true; triggerEvent(radio, 'change'); }
            } else if (input.type === 'checkbox') {
                input.checked = value;
                triggerEvent(input, 'change');
                triggerEvent(input, 'input');
            } else {
                input.value = value;
                triggerEvent(input, 'change');
                triggerEvent(input, 'input');
            }
        });

        if (state.mapState && (pageName === 'tracking' || pageName === 'route') && window.MapManager?.maps?.[pageName]) {
            if (!window.MapManager.mapStates) window.MapManager.mapStates = {};
            window.MapManager.mapStates[pageName] = state.mapState;
        }

        Object.keys(state.activeStates || {}).forEach(key => {
            if (!key || typeof key !== 'string' || key.includes('[object')) return;

            if (key.startsWith('selected_')) {
                const itemKey = key.replace('selected_', '');
                if (!itemKey || itemKey.includes('[object')) return;

                try {
                    const item = container.querySelector(`[data-id="${itemKey}"], #${itemKey}, [data-state-key="${itemKey}"]`);
                    if (item) {
                        item.classList.add('active', 'selected');
                        item.setAttribute('data-selected', 'true');
                        item.setAttribute('aria-selected', 'true');
                    }
                } catch (e) {
                    console.warn('Error restoring selected state for:', itemKey, e);
                }
            } else {
                try {
                    const el = container.querySelector(`#${key}, .${key}, [data-name="${key}"], [data-report="${key}"], [data-state-key="${key}"]`);
                    if (el) {
                        el.classList.add('active');
                        el.setAttribute('data-active', 'true');
                        el.setAttribute('aria-selected', 'true');
                    }
                } catch (e) {
                    console.warn('Error restoring active state for:', key, e);
                }
            }
        });

        if (state.scrollPosition) window.scrollTo(0, state.scrollPosition);

        if (state.custom && window.pageStateHandlers?.[pageName]?.restore) {
            try { window.pageStateHandlers[pageName].restore(container, state.custom); }
            catch (e) { console.warn('Error restoring custom state for', pageName, e); }
        }

        window.dispatchEvent(new CustomEvent('pageStateRestored', { detail: { page: pageName, container, state } }));
    }

    // ========== STYLE MANAGEMENT ==========
    function removeOldStyles() {
        currentPageStyles.forEach(style => style.parentNode?.removeChild(style));
        currentPageStyles = [];
    }

    function injectPageStyles(doc, pageName = null) {
        if (pageName) {
            document.querySelectorAll(`style[data-page-style="${pageName}"]`).forEach(style => style.remove());
        } else {
            removeOldStyles();
        }

        doc.querySelectorAll('head style').forEach(style => {
            const newStyle = document.createElement('style');
            newStyle.textContent = style.textContent;
            newStyle.setAttribute('data-page-style', pageName || 'true');
            document.head.appendChild(newStyle);
            currentPageStyles.push(newStyle);
        });
    }

    function restoreCachedStyles(pageName, styles) {
        if (!styles?.length || document.querySelectorAll(`style[data-page-style="${pageName}"]`).length > 0) return;

        styles.forEach(styleContent => {
            const style = document.createElement('style');
            style.textContent = styleContent;
            style.setAttribute('data-page-style', pageName);
            document.head.appendChild(style);
            currentPageStyles.push(style);
        });
    }

    // ========== SCRIPT LOADING ==========
    function loadScript(src, isExternal = false) {
        return new Promise((resolve) => {
            const existingScript = Array.from(document.querySelectorAll('script[src]')).find(s => {
                const scriptSrc = s.getAttribute('src');
                return scriptSrc === src || scriptSrc.startsWith(src + '?') || scriptSrc.includes(src);
            });

            if (existingScript || loadedScripts.has(src)) {
                if (!loadedScripts.has(src)) loadedScripts.add(src);
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = src + (isExternal ? '' : `?t=${Date.now()}`);
            script.setAttribute('data-page-script', 'true');
            script.async = false;
            script.onload = () => { loadedScripts.add(src); resolve(); };
            script.onerror = () => { console.warn('Không thể load script:', src); script.remove(); resolve(); };
            (isExternal ? document.head : document.body).appendChild(script);
        });
    }

    async function loadPageScripts(config) {
        if (config.externalScripts) {
            for (const src of config.externalScripts) await loadScript(src, true);
        }
        for (const src of config.scripts) await loadScript(src, false);
    }

    function markLoadedScripts() {
        document.querySelectorAll('script[src]').forEach(script => {
            const src = script.getAttribute('src');
            if (!src) return;
            const baseSrc = src.split('?')[0];
            const isPageScript = PAGE_SCRIPTS_PATHS.some(path => baseSrc.includes(path)) || baseSrc.includes('hls.js') || baseSrc.includes('stream.js') || baseSrc.includes('camera');
            if (isPageScript) loadedScripts.add(baseSrc);
        });
    }

    // ========== PAGE DETECTION ==========
    function detectCurrentPageFromDOM() {
        if ($('#cards')) return 'home';
        if ($('.camera-screen')) return 'camera';
        if ($('.stream-screen')) return 'stream';
        if ($('.video-playback-screen')) return 'videoPlayback';
        if ($('.oil-chart-screen')) return 'oilChart';
        if ($('.support-screen')) return 'support';
        if ($('.route-screen')) return $('#vehicleList') ? 'tracking' : 'route';
        if ($('.report-screen')) {
            if ($('script[src*="count_trip_screen.js"]') || $('[data-page="countTrip"]')) return 'countTrip';
            if ($('script[src*="report_screen.js"]') || $('[data-page="report"]')) return 'report';
            const reportList = $('#reportList');
            if (reportList) return reportList.querySelectorAll('.report-item').length > 10 ? 'report' : 'countTrip';
            return 'report';
        }
        return null;
    }

    // ========== MAIN PAGE LOADER ==========
    async function createPageContainer(pageName, html) {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newContent = doc.getElementById('sp-main-body');
        if (!newContent) { console.warn('Không tìm thấy nội dung trong:', PAGES[pageName].html); return null; }

        const container = document.createElement('div');
        container.setAttribute('data-page', pageName);
        container.style.display = 'none';
        container.innerHTML = newContent.innerHTML;

        const pageStyles = Array.from(doc.querySelectorAll('head style')).map(style => style.textContent);
        pageCache.set(pageName, { container, styles: pageStyles, state: { scrollPosition: 0, formData: {}, mapState: null } });

        injectPageStyles(doc, pageName);
        mainBody.appendChild(container);
        return container;
    }

    async function loadPage(pageName) {
        const config = PAGES[pageName];
        if (!config) { console.warn('Không tìm thấy trang:', pageName); return; }
        if (currentPageName === pageName) return;

        try {
            if (currentPageName) savePageState(currentPageName);

            let pageContainer = getPageContainer(pageName);
            let isNewPage = false;

            if (!pageCache.has(pageName)) {
                isNewPage = true;
                let html = config.htmlContent;
                if (!html) {
                    const response = await fetch(config.html);
                    html = await response.text();
                }
                pageContainer = await createPageContainer(pageName, html);
                if (!pageContainer) return;
                await loadPageScripts(config);
            } else {
                pageContainer = pageCache.get(pageName).container;
                restoreCachedStyles(pageName, pageCache.get(pageName).styles);
            }

            mainBody.querySelectorAll('[data-page]').forEach(page => page.style.display = 'none');
            if (pageContainer) {
                pageContainer.style.display = '';
                restorePageState(pageName);

                if (isNewPage) {
                    window.dispatchEvent(new Event('DOMContentLoaded'));
                    window.dispatchEvent(new CustomEvent('pageLoaded', { detail: { page: pageName, isNew: true, container: pageContainer } }));
                }
                window.dispatchEvent(new CustomEvent('pageShown', { detail: { page: pageName, container: pageContainer } }));
            }

            if (window.updateActiveNavLink) window.updateActiveNavLink(pageName);

            currentPageName = pageName;
            window.history.replaceState({ page: pageName }, '', window.location.pathname);
            localStorage.setItem('currentPage', pageName);

            if (isNewPage) window.scrollTo(0, 0);

        } catch (error) {
            console.error('Lỗi khi load trang:', error);
        }
    }

    // ========== EVENT LISTENERS ==========
    document.addEventListener('click', (e) => {
        const navLink = e.target.closest('.nav-link[data-name], .sidebar-nav-item[data-name]');
        if (navLink?.dataset.name && PAGES[navLink.dataset.name]) {
            e.preventDefault();
            e.stopPropagation();
            loadPage(navLink.dataset.name);
            if (window.sidebarNav?.close) window.sidebarNav.close();
            return;
        }
        const logo = e.target.closest('.navbar-brand');
        if (logo) {
            e.preventDefault();
            e.stopPropagation();
            loadPage('home');
            if (window.sidebarNav?.close) window.sidebarNav.close();
        }
    }, true);

    window.addEventListener('forceSavePageState', (e) => {
        const pageName = e.detail?.page || currentPageName;
        if (pageName) savePageState(pageName);
    });

    window.addEventListener('popstate', (e) => {
        const pageName = e.state?.page || window.history.state?.page || 'home';
        if (pageName) loadPage(pageName);
    });

    // ========== INITIALIZATION ==========
    function clearStateOnReload() {
        localStorage.removeItem('activeNav');
        localStorage.removeItem('currentPage');
        pageCache.clear();
        loadedScripts.clear();
        currentPageName = 'home';
        localStorage.setItem('currentPage', 'home');
        localStorage.setItem('activeNav', 'home');

        if (window.pageStateHandlers) {
            Object.keys(window.pageStateHandlers).forEach(page => {
                try { window.pageStateHandlers[page]?.clear?.(); }
                catch (e) { console.warn('Error clearing state for', page, e); }
            });
        }

        if (window.updateActiveNavLink) window.updateActiveNavLink('home');
        document.querySelectorAll('.nav-link, .sidebar-nav-item').forEach(link => {
            link.classList.remove('active');
            if (link.dataset.name === 'home') link.classList.add('active');
        });
    }

    function wrapInitialContent() {
        if (mainBody.children.length > 0 && !mainBody.querySelector('[data-page]')) {
            const wrapper = document.createElement('div');
            wrapper.setAttribute('data-page', 'home');
            Array.from(mainBody.children).forEach(child => wrapper.appendChild(child));
            mainBody.innerHTML = '';
            mainBody.appendChild(wrapper);
            pageCache.set('home', { container: wrapper, styles: [], state: { scrollPosition: 0, formData: {}, mapState: null } });
        }
    }

    function initPage() {
        const init = () => loadPage(currentPageName || 'home');
        document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', init) : init();
    }

    const savedPage = window.history.state?.page || 'home';
    const detectedPage = detectCurrentPageFromDOM();
    const isReload = !window.history.state?.page || (window.performance?.navigation?.type === 1) || (window.performance?.getEntriesByType?.('navigation')[0]?.type === 'reload');

    if (isReload) {
        clearStateOnReload();
    } else {
        currentPageName = savedPage || detectedPage || 'home';
    }

    window.history.replaceState({ page: currentPageName }, '', window.location.pathname);
    markLoadedScripts();
    window.__routerReady = true;
    wrapInitialContent();

    if (!window.history.state?.page || (detectedPage !== currentPageName && currentPageName)) {
        initPage();
    }
})();
