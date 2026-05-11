(function () {
  const input = document.querySelector('.search-box-gps input');
  const icon = document.querySelector('.search-box-gps i');

  icon.addEventListener('click', () => {
    input.style.display = 'block';
    input.focus();
  });
})();
function initMap() {
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('Phần tử #map không tồn tại trong DOM');
    return;
  }

  // Kiểm tra xem container có được hiển thị không
  const pageContainer = mapContainer.closest('[data-page]');
  if (pageContainer && pageContainer.style.display === 'none') {
    console.warn('Map container is hidden, cannot initialize');
    return;
  }

  // Cleanup map cũ nếu có
  if (mapContainer._leaflet_id) {
    try {
      const oldMap = L.map._instances?.[mapContainer._leaflet_id];
      if (oldMap) {
        oldMap.remove();
      }
    } catch (e) {
      // Bỏ qua lỗi
    }
    delete mapContainer._leaflet_id;
    mapContainer.innerHTML = '';
  }

  // Khởi tạo bản đồ
  const map = L.map('map').setView([21.0285, 105.8542], 13);

  // Thêm các lớp bản đồ
  const streetLayer = L.tileLayer('https://maps.skysoft.vn/web_tile.jsp?c={x}&r={y}&z={z}', {
    attribution: '&copy; Skysoft',
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

  const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
    attribution: '&copy; Esri',
    maxZoom: 19
  });

  const topoLayer = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenTopoMap',
    maxZoom: 17
  });

  L.control.layers({
    'Bản đồ đường': streetLayer,
    'Vệ tinh': satelliteLayer,
    'Địa hình': topoLayer
  }, null, { position: 'topright', collapsed: true }).addTo(map);
  const marker = L.marker([21.0285, 105.8542]).addTo(map);
  marker.bindPopup('<b>Hà Nội</b><br>Vị trí hiện tại').openPopup();

  const searchInput = document.getElementById('searchInput');
  const searchIcon = document.querySelector('.search-box-gps i');
  if (searchInput && searchIcon) {
    searchIcon.addEventListener('click', () => {
      searchInput.style.display = 'block';
      searchInput.focus();
    });

    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const query = searchInput.value.trim();
        if (query) {
          fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`)
            .then(response => response.json())
            .then(data => {
              if (data && data.length > 0) {
                const result = data[0];
                const lat = parseFloat(result.lat);
                const lon = parseFloat(result.lon);

                map.setView([lat, lon], 15);
                L.marker([lat, lon])
                  .addTo(map)
                  .bindPopup(`<b>${result.display_name}</b>`)
                  .openPopup();
              } else {
                alert('Không tìm thấy vị trí!');
              }
            })
            .catch(error => {
              console.error('Lỗi tìm kiếm:', error);
              alert('Có lỗi xảy ra khi tìm kiếm!');
            });
        }
      }
    });
  } else {
    console.error('Không tìm thấy searchInput hoặc searchIcon');
  }

  // Xử lý zoom
  const zoomIn = document.getElementById('zoomIn');
  const zoomOut = document.getElementById('zoomOut');
  if (zoomIn && zoomOut) {
    zoomIn.addEventListener('click', () => {
      map.zoomIn();
    });
    zoomOut.addEventListener('click', () => {
      map.zoomOut();
    });
  } else {
    console.error('Không tìm thấy zoomIn hoặc zoomOut');
  }

  // Xử lý fullscreen
  const container = document.querySelector('.gps-container');
  const maximizeBtn = document.getElementById('maximizeBtn');
  let isFullscreen = false;
  if (container && maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      isFullscreen = !isFullscreen;
      if (isFullscreen) {
        container.classList.add('fullscreen');
        maximizeBtn.classList.remove('fa-maximize');
        maximizeBtn.classList.add('fa-minimize');
      } else {
        container.classList.remove('fullscreen');
        maximizeBtn.classList.remove('fa-minimize');
        maximizeBtn.classList.add('fa-maximize');
      }
      setTimeout(() => {
        map.invalidateSize();
      }, 100);
    });
  } else {
    console.error('Không tìm thấy gps-container hoặc maximizeBtn');
  }
}

// Khởi tạo map lần đầu
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initMap();
} else {
  document.addEventListener('DOMContentLoaded', initMap);
}

// Lắng nghe event pageLoaded và pageShown để khởi tạo lại map khi quay về trang home
function reinitMap(e) {
  const container = e?.detail?.container;

  // Đợi một chút để đảm bảo container đã được hiển thị và DOM đã sẵn sàng
  setTimeout(() => {
    // Tìm map element trong container của trang home
    let mapElement = null;
    if (container) {
      mapElement = container.querySelector('#map');
    } else {
      // Fallback: tìm trong container của trang home đang hiển thị
      const homeContainer = document.querySelector('[data-page="home"]');
      if (homeContainer && homeContainer.style.display !== 'none') {
        mapElement = homeContainer.querySelector('#map');
      }
    }

    if (mapElement) {
      // Kiểm tra xem map element có được hiển thị không
      const pageContainer = mapElement.closest('[data-page]');
      const isVisible = !pageContainer || pageContainer.style.display !== 'none';

      if (isVisible) {
        // Force reflow
        void mapElement.offsetHeight;
        initMap();
      }
    }
  }, 300);
}

window.addEventListener('pageLoaded', (e) => {
  if (e.detail?.page === 'home') {
    reinitMap(e);
  }
});

window.addEventListener('pageShown', (e) => {
  if (e.detail?.page === 'home') {
    reinitMap(e);
  }
});


