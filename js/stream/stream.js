(function () {
  const SAMPLE_URLS = [
    'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8',
    'https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8'
  ];

  const makeStreams = (n = 32) => Array.from({ length: n }, (_, i) => ({
    name: `Camera ${i + 1}`,
    src: SAMPLE_URLS[i % SAMPLE_URLS.length]
  }));

  const VEHICLES = {
    '29A-12345': { plate: '29A-12345', status: 'online', lat: 21.0285, lng: 105.8542, heading: 45, speed: 35, driver: 'Nguyễn Văn A', engine: 'on', fuel: 75, streams: makeStreams() },
    '30B-67890': { plate: '30B-67890', status: 'online', lat: 21.0195, lng: 105.8435, heading: 120, speed: 42, driver: 'Trần Văn B', engine: 'on', fuel: 60, streams: makeStreams() },
    '51C-11111': { plate: '51C-11111', status: 'offline', lat: 21.0375, lng: 105.8650, heading: 270, speed: 0, driver: 'Lê Văn C', engine: 'off', fuel: 30, streams: makeStreams() },
  };

  let selectedVehicle = null, currentLayout = 4, hlsList = [], draggedElement = null, fullscreenItem = null;

  // HLS Management
  function createHLS(video, url) {
    if (!Hls.isSupported()) { video.src = url; return null; }
    const hls = new Hls({ debug: false, enableWorker: true, lowLatencyMode: false });
    hls.loadSource(url);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => { }));
    video._hls = hls;
    hlsList.push(hls);
    return hls;
  }

  function updateStream(video, url) {
    const hls = video._hls;
    if (!hls) return createHLS(video, url);
    hls.stopLoad();
    hls.loadSource(url);
    hls.attachMedia(video);
    video.play().catch(() => { });
  }

  function destroyAllHLS() {
    hlsList.forEach(h => h?.destroy());
    hlsList = [];
    document.querySelectorAll('video').forEach(v => v._hls = null);
  }

  // Vehicle List
  function renderVehicleList(filter = "") {
    const list = document.getElementById("streamVehicleList");
    list.innerHTML = "";

    Object.values(VEHICLES)
      .filter(v => v.plate.toLowerCase().includes(filter.toLowerCase()))
      .forEach(v => {
        const card = document.createElement("div");
        card.className = "stream-vehicle-card";
        card.dataset.plate = v.plate;
        if (selectedVehicle?.plate === v.plate) card.classList.add("selected");

        card.innerHTML = `
          <div class="stream-vehicle-card-icon"><i class="fas fa-car"></i></div>
          <div class="stream-vehicle-card-info">
            <div class="stream-vehicle-plate">${v.plate}</div>
            <div class="stream-vehicle-status ${v.status}">
              <i class="fas fa-circle"></i>${v.status === "online" ? "Đang hoạt động" : "Ngoại tuyến"}
            </div>
          </div>
        `;
        card.onclick = () => selectVehicle(v);
        list.appendChild(card);
      });
  }

  function selectVehicle(vehicle) {
    selectedVehicle = vehicle;
    document.querySelectorAll(".stream-vehicle-card").forEach(c => c.classList.remove("selected"));
    document.querySelector(`[data-plate="${vehicle.plate}"]`)?.classList.add("selected");
    renderGrid();
    if (window.MapManager && vehicle.lat && vehicle.lng) {
      window.MapManager.displayStreamVehicle(vehicle);
    }
  }

  /*
  function toggleFullscreen(camItem) {
    if (fullscreenItem) return exitFullscreen();

    fullscreenItem = camItem;
    camItem.classList.add('fullscreen');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'fullscreen-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.onclick = (e) => { e.stopPropagation(); exitFullscreen(); };
    camItem.appendChild(closeBtn);

    const backdrop = document.createElement('div');
    backdrop.className = 'fullscreen-backdrop';
    backdrop.onclick = exitFullscreen;
    document.body.appendChild(backdrop);

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscKey);
  }

  function exitFullscreen() {
    if (!fullscreenItem) return;

    fullscreenItem.classList.remove('fullscreen');
    fullscreenItem.querySelector('.fullscreen-close-btn')?.remove();
    document.querySelector('.fullscreen-backdrop')?.remove();
    document.removeEventListener('keydown', handleEscKey);
    fullscreenItem = null;

    setTimeout(() => {
      const lightbox = document.getElementById('lightbox');
      const isLightboxActive = lightbox && lightbox.classList.contains('active');
      
      const cameraContainer = document.querySelector('#list-image .container');
      const isCameraContainerHidden = cameraContainer && 
        (cameraContainer.style.display === 'none' || 
         cameraContainer.style.visibility === 'hidden');

      if (!isLightboxActive && !isCameraContainerHidden) {
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      } else if (isLightboxActive || isCameraContainerHidden) {
        const scrollY = document.body.dataset.scrollY || '0';
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
        document.body.style.overflow = 'hidden';
      }
    }, 500);
  }
  
  // OLD CSS for fullscreen (add to addDragDropStyles if needed):
  // .stream-camera-item.fullscreen {
  //   position: fixed !important; top: 0 !important; left: 0 !important;
  //   width: 100vw !important; height: 100vh !important; z-index: 10000 !important;
  // }
  // .fullscreen-backdrop {
  //   position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
  //   background: rgba(0, 0, 0, 0.95); z-index: 9999;
  // }
  */


  // Fullscreen (within wrapper only)
  function toggleFullscreen(camItem) {
    if (fullscreenItem) return exitFullscreen();

    fullscreenItem = camItem;
    camItem.classList.add('fullscreen');

    const closeBtn = document.createElement('button');
    closeBtn.className = 'fullscreen-close-btn';
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.onclick = (e) => { e.stopPropagation(); exitFullscreen(); };
    camItem.appendChild(closeBtn);

    document.addEventListener('keydown', handleEscKey);
  }

  function exitFullscreen() {
    if (!fullscreenItem) return;

    fullscreenItem.classList.remove('fullscreen');
    fullscreenItem.querySelector('.fullscreen-close-btn')?.remove();

    document.removeEventListener('keydown', handleEscKey);
    fullscreenItem = null;
  }

  const handleEscKey = (e) => e.key === 'Escape' && exitFullscreen();

  document.addEventListener("dblclick", (e) => {
    const camItem = e.target.closest(".stream-camera-item");
    if (camItem) toggleFullscreen(camItem);
  });

  // Drag & Drop
  function swapCameras(cam1, cam2) {
    const cam1IsMain = cam1.classList.contains("main");
    const cam2IsMain = cam2.classList.contains("main");

    const tempDiv = document.createElement("div");
    cam1.parentNode.insertBefore(tempDiv, cam1);
    cam2.parentNode.insertBefore(cam1, cam2);
    tempDiv.parentNode.insertBefore(cam2, tempDiv);
    tempDiv.remove();

    if ([6, 8].includes(currentLayout)) {
      if (cam1IsMain) { cam1.classList.remove("main"); cam2.classList.add("main"); }
      else if (cam2IsMain) { cam2.classList.remove("main"); cam1.classList.add("main"); }
    }
  }

  function initDragAndDrop(item) {
    item.setAttribute('draggable', 'true');

    item.addEventListener('dragstart', (e) => {
      draggedElement = item;
      item.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';

      const ghost = item.cloneNode(true);
      ghost.style.cssText = 'opacity:0.5; position:absolute; top:-1000px';
      document.body.appendChild(ghost);
      e.dataTransfer.setDragImage(ghost, 0, 0);
      setTimeout(() => ghost.remove(), 0);
    });

    item.addEventListener('dragend', () => {
      item.classList.remove('dragging');
      document.querySelectorAll('.stream-camera-item').forEach(i => i.classList.remove('drag-over'));
      draggedElement = null;
    });

    item.addEventListener('dragover', (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      if (draggedElement && draggedElement !== item) item.classList.add('drag-over');
    });

    item.addEventListener('dragleave', () => item.classList.remove('drag-over'));

    item.addEventListener('drop', (e) => {
      e.preventDefault();
      item.classList.remove('drag-over');
      if (draggedElement && draggedElement !== item) swapCameras(draggedElement, item);
    });
  }

  // Grid Rendering
  function renderGrid() {
    const container = document.getElementById("streamCameraContainer");
    if (!selectedVehicle) return;

    destroyAllHLS();
    container.innerHTML = "";
    container.className = `stream-camera-container grid-${currentLayout}`;

    selectedVehicle.streams.slice(0, currentLayout).forEach((stream, index) => {
      const item = document.createElement("div");
      item.className = "stream-camera-item";
      if (index === 0 && [6, 8].includes(currentLayout)) item.classList.add("main");

      item.innerHTML = `
        <video class="stream-camera-video" autoplay muted playsinline></video>
        <div class="stream-camera-label">
          <i class="fas fa-grip-vertical stream-drag-handle"></i>
          ${stream.name}
        </div>
        <div class="stream-camera-status loading"></div>
      `;

      container.appendChild(item);
      initDragAndDrop(item);

      const video = item.querySelector("video");
      const status = item.querySelector(".stream-camera-status");
      updateStream(video, stream.src);

      video.onplaying = () => status.classList.remove("loading");
      video.onerror = () => {
        status.classList.remove("loading");
        status.classList.add("error");
      };
    });

    addDragDropStyles();
  }

  function addDragDropStyles() {
    if (document.getElementById('drag-drop-styles')) return;

    const style = document.createElement('style');
    style.id = 'drag-drop-styles';
    style.textContent = `
      .stream-camera-item { cursor: move; transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s; }
      .stream-camera-item.dragging { opacity: 0.5; transform: scale(0.95); }
      .stream-camera-item.drag-over { box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.5); transform: scale(1.02); }
      .stream-drag-handle { margin-right: 6px; opacity: 0.6; cursor: grab; }
      .stream-camera-item:hover .stream-drag-handle { opacity: 1; }
      .stream-camera-item.dragging .stream-drag-handle { cursor: grabbing; }
      .stream-camera-label { display: flex; align-items: center; }
      .stream-camera-item::after {
        content: 'Kéo để đổi vị trí | Double-click để phóng to';
        position: absolute; bottom: -30px; left: 50%; transform: translateX(-50%);
        background: rgba(0, 0, 0, 0.8); color: white; padding: 4px 8px;
        border-radius: 4px; font-size: 11px; white-space: nowrap;
        opacity: 0; pointer-events: none; transition: opacity 0.3s; z-index: 1000;
      }
      .stream-camera-item:hover::after { opacity: 1; }
      .stream-camera-item.dragging::after, .stream-camera-item.drag-over::after { display: none; }
      
      .stream-camera-item.fullscreen {
        position: absolute !important; top: 0 !important; left: 0 !important;
        width: 100% !important; height: 100% !important; z-index: 100 !important;
        background: #000; grid-column: unset !important; grid-row: unset !important; cursor: default;
      }
      .stream-camera-item.fullscreen::after { display: none; }
      .stream-camera-item.fullscreen .stream-camera-video { width: 100%; height: 100%; object-fit: contain; }
      .stream-camera-item.fullscreen .stream-camera-label { font-size: 18px; padding: 12px 20px; background: rgba(0, 0, 0, 0.8); }
      

      .fullscreen-close-btn {
        position: absolute; top: 20px; right: 20px; width: 50px; height: 50px;
        background: rgba(255, 255, 255, 0.2); border: 2px solid rgba(255, 255, 255, 0.5);
        border-radius: 50%; color: white; font-size: 24px; cursor: pointer; z-index: 10001;
        display: flex; align-items: center; justify-content: center;
        transition: all 0.3s; backdrop-filter: blur(10px);
      }
      .fullscreen-close-btn:hover { background: rgba(255, 255, 255, 0.3); border-color: white; transform: rotate(90deg); }
    `;
    document.head.appendChild(style);
  }

  // Layout Controls
  function initLayout() {
    document.querySelectorAll(".stream-layout-btn").forEach(btn => {
      btn.onclick = () => {
        currentLayout = +btn.dataset.layout;
        document.querySelectorAll(".stream-layout-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderGrid();
      };
    });
  }

  // Initialization
  function init() {
    renderVehicleList();
    initLayout();
    document.getElementById("streamVehicleSearch").oninput = e => renderVehicleList(e.target.value);

    setTimeout(() => window.MapManager?.map?.invalidateSize(), 100);

    window.addEventListener('pageShown', (e) => {
      if (e.detail?.page === 'stream') {
        const container = document.getElementById("streamCameraContainer");
        if (selectedVehicle) {
          if (!container?.children.length) renderGrid();
          if (window.MapManager && selectedVehicle.lat && selectedVehicle.lng) {
            window.MapManager.displayStreamVehicle(selectedVehicle);
          }
        }
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  window.addEventListener("beforeunload", () => { exitFullscreen(); destroyAllHLS(); });
})();