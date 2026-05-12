(function () {
  let vehicles = [], displayedImages = [], currentImageIndex = 0;
  let lastGridFilterState = { plate: '', date: '', camera: '', timeFrom: '', timeTo: '', group: 'all' };
  let savedGridFilterState = null, savedSelectedPlate = null, savedSelectedTime = null;
  let savedGridViewState = null;
  let scale = 1, posX = 0, posY = 0, lastPosX = 0, lastPosY = 0;
  let isDragging = false, wasDragging = false, dragStartX = 0, dragStartY = 0, dragDeltaX = 0;
  let isProgressDragging = false, wasProgressDragging = false;
  let ptMouseDown = { x: 0, y: 0 }, isLightboxDown = false;

  const MIN_SCALE = 1, MAX_SCALE = 5;
  const $ = id => document.getElementById(id);
  const $$ = sel => document.querySelectorAll(sel);
  const getAllImages = () => vehicles.flatMap(v => v.images.map(img => ({ ...img, plate: v.plate, group: v.group, _uId: img._uId }))).sort((a, b) => b.time.localeCompare(a.time));
  const getTime = (timeStr) => timeStr ? timeStr.split(' ').pop() : '';
  const getDate = (timeStr) => {
    if (!timeStr) return '';
    const date = timeStr.split(' ')[0] || '';
    const match = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : date;
  };
  const getShortDateTime = (timeStr) => {
    if (!timeStr) return '';
    const parts = timeStr.split(' ');
    const time = (parts.pop() || '').slice(0, 5);
    const date = (parts.pop() || '').slice(0, 5);
    return date ? `${date} ${time}` : time;
  };

  const getListImageElement = () => $('list-image');

  const captureGridViewState = (selectedImage = null) => {
    const listImage = getListImageElement();
    return {
      filterState: { ...lastGridFilterState },
      selectedImageUId: selectedImage?._uId || displayedImages[currentImageIndex]?._uId || null,
      listScrollTop: listImage?.scrollTop || 0,
      listScrollLeft: listImage?.scrollLeft || 0,
      windowScrollY: window.scrollY || 0
    };
  };

  const restoreGridViewState = (state) => {
    if (!state) return;

    requestAnimationFrame(() => {
      const listImage = getListImageElement();
      if (listImage) {
        listImage.scrollTop = state.listScrollTop || 0;
        listImage.scrollLeft = state.listScrollLeft || 0;
      }

      window.scrollTo(0, state.windowScrollY || 0);

      if (state.selectedImageUId && !state.listScrollTop && !state.windowScrollY) {
        const selectedItem = document.querySelector(`[data-image-uid="${state.selectedImageUId}"]`);
        selectedItem?.scrollIntoView({ block: 'center', inline: 'nearest' });
      }
    });
  };

  // Utility: Toggle element visibility
  const setElementVisibility = (selector, visible) => {
    const el = typeof selector === 'string' ? document.querySelector(selector) : selector;
    if (!el) return;
    if (visible) {
      el.style.cssText = '';
      el.style.display = 'block';
    } else {
      el.style.cssText = 'display: none !important; visibility: hidden !important; opacity: 0 !important; z-index: -1 !important; pointer-events: none !important;';
    }
  };

  // Utility: Lock/unlock body scroll
  const setBodyScroll = (locked) => {
    if (locked) {
      const scrollY = window.scrollY;
      Object.assign(document.body.style, { position: 'fixed', top: `-${scrollY}px`, width: '100%' });
      document.body.dataset.scrollY = scrollY;
      if ($('list-image')) $('list-image').style.overflow = 'hidden';
    } else {
      const scrollY = document.body.dataset.scrollY || '0';
      Object.assign(document.body.style, { position: '', top: '', width: '', overflow: '' });
      window.scrollTo(0, parseInt(scrollY));
      delete document.body.dataset.scrollY;
      if ($('list-image')) $('list-image').style.overflow = 'auto';
    }
  };

  // Data loading
  async function loadData() {
    try {
      const response = await fetch('json/package.json');
      if (!response.ok) throw new Error('Failed to load data config');
      vehicles = (await response.json()).cameraGallery || [];
      vehicles.forEach(v => {
        if (v.images) {
          v.images.forEach((img, idx) => {
            img._uId = `${v.plate}_${idx}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          });
        }
      });

      const allImages = getAllImages();
      const latestImagesByPlate = new Map();
      allImages.forEach(img => {
        if (!latestImagesByPlate.has(img.plate)) latestImagesByPlate.set(img.plate, img);
      });
      displayedImages = Array.from(latestImagesByPlate.values()).sort((a, b) => b.time.localeCompare(a.time));
      renderGallery();
    } catch (error) {
      console.error('Error loading camera data:', error);
      vehicles = [];
      renderGallery();
    }
  }

  window.getAvailablePlates = () => vehicles.map(v => v.plate);

  window.searchCameraImages = ({ plate, date, camera, timeFrom, timeTo, group }, isInternal = false, skipLightboxReset = false) => {
    if (!isInternal) {
      lastGridFilterState = { plate, date, camera, timeFrom, timeTo, group };
    }

    const filteredVehicles = plate ? vehicles.filter(v => v.plate.toLowerCase().includes(plate.toLowerCase())) : vehicles;

    let allFilteredImages = filteredVehicles
      .flatMap(v => v.images.map(img => ({ ...img, plate: v.plate, group: v.group, _uId: img._uId })))
      .filter(img => (!group || group === 'all' || img.group === group) &&
        (!camera || img.camera.toLowerCase().includes(camera.toLowerCase())) &&
        (!plate || img.plate.toLowerCase().includes(plate.toLowerCase())))
      .sort((a, b) => b.time.localeCompare(a.time));

    if (!plate) {
      const latestImagesByPlate = new Map();
      allFilteredImages.forEach(img => {
        if (!latestImagesByPlate.has(img.plate)) latestImagesByPlate.set(img.plate, img);
      });
      displayedImages = Array.from(latestImagesByPlate.values()).sort((a, b) => b.time.localeCompare(a.time));
    } else {
      displayedImages = allFilteredImages;
    }

    renderGallery();
    if ($('lightbox')?.classList.contains('active') && !skipLightboxReset) {
      displayedImages.length > 0 ? showImage(0) : closeLightbox();
    }
  };

  // Render gallery
  function renderGallery() {
    const gallery = $('gallery'), thumbnails = $('thumbnails');
    if (gallery) gallery.innerHTML = '';
    if (thumbnails) thumbnails.innerHTML = '';

    displayedImages.forEach((img, i) => {
      // Gallery item
      const item = document.createElement('div');
      item.className = 'gallery-item';
      item.dataset.plate = img.plate;
      item.dataset.time = img.time;
      item.dataset.imageUid = img._uId;
      item.onclick = () => openLightbox(i);
      item.innerHTML = `
        <div class="gallery-item-image">
          <img src="${img.url}" alt="${img.plate}">
          <div class="info-plate-badge">${img.plate}</div>
        </div>
        <div class="item-info">
          <span class="info-camera">📷 ${img.camera}</span>
          <span class="info-time" title="${img.time}">🕒 ${getShortDateTime(img.time)}</span>
        </div>`;
      const itemInfo = item.querySelector('.item-info');
      if (itemInfo) {
        itemInfo.innerHTML = `
          <div class="info-row info-row-top">
            <span class="info-camera"><i class="fas fa-video"></i> ${img.camera}</span>
            <span class="info-plate">${img.plate}</span>
          </div>
          <div class="info-row info-row-bottom" title="${img.time}">
            <span class="info-date"><i class="fas fa-calendar-day"></i> ${getDate(img.time)}</span>
            <span class="info-time"><i class="fas fa-clock"></i> ${getTime(img.time)}</span>
          </div>`;
      }
      gallery?.appendChild(item);

      // Thumbnail item
      const thumb = document.createElement('div');
      thumb.className = 'thumbnail-item';
      thumb.onclick = (e) => {
        if (isDragging) { e.preventDefault(); e.stopPropagation(); return false; }
        showImage(i);
      };
      thumb.innerHTML = `
        <div class="thumb-img-box"><img src="${img.url}" alt="${img.plate}"></div>
        <div class="thumb-details">
          <div class="thumb-cam">📷 ${img.camera}</div>
          <div class="thumb-time">🕒 ${getTime(img.time)}</div>
        </div>`;
      thumbnails?.appendChild(thumb);
    });
  }

  // Lightbox open
  function openLightbox(index) {
    const img = displayedImages[index];
    if (!img) return;

    savedGridFilterState = { ...lastGridFilterState };
    savedGridViewState = captureGridViewState(img);
    savedSelectedPlate = img.plate;
    savedSelectedTime = img.time;

    const plateInput = document.querySelector('#lightboxFilterForm #plateInput');
    if (plateInput) plateInput.value = img.plate;

    window.searchCameraImages({
      plate: img.plate,
      date: $('lbDateInput')?.value || '',
      group: $('groupSelect')?.value || 'all',
      camera: '',
      timeFrom: '',
      timeTo: ''
    }, true, true);

    setTimeout(() => {
      const newIndex = displayedImages.findIndex(item => item._uId === img._uId);
      currentImageIndex = newIndex >= 0 ? newIndex : 0;

      const lightbox = $('lightbox');
      if (lightbox) {
        setElementVisibility('#list-image .container', false);
        setElementVisibility($('filter-camera'), false);
        document.body.classList.add('camera-detail-open');
        lightbox.classList.add('active');
        setBodyScroll(true);

        requestAnimationFrame(() => {
          document.querySelector('.lightbox-thumbnails')?.scrollTo({ left: 0 });
          showImage(currentImageIndex);
          setupImageInteraction();
          initProgressBar();
        });
      }
    }, 0);
  }

  // Lightbox close
  function closeLightbox() {
    const lightbox = $('lightbox');
    const gridViewState = savedGridViewState || captureGridViewState();
    if (lightbox) {
      lightbox.classList.remove('active');
      setElementVisibility('#list-image .container', true);
      setElementVisibility($('filter-camera'), true);

      const lbPlateInput = document.querySelector('#lightboxFilterForm #plateInput');
      if (lbPlateInput) lbPlateInput.value = '';

      setTimeout(() => {
        window.searchCameraImages(savedGridFilterState || lastGridFilterState, false);
        restoreGridViewState(gridViewState);
        savedGridFilterState = null;
        savedGridViewState = null;
      }, 0);
    }

    setBodyScroll(false);
    document.body.classList.remove('camera-detail-open');
    $$('.thumbnail-item').forEach(t => t.classList.remove('active'));
  }

  // Show image
  function showImage(index) {
    if (index < 0 || index >= displayedImages.length) return;

    currentImageIndex = index;
    const img = displayedImages[index];
    const lightboxImage = $('lightboxImage');

    if (lightboxImage) {
      scale = 1; posX = 0; posY = 0; lastPosX = 0; lastPosY = 0; dragDeltaX = 0; isDragging = false;
      lightboxImage.style.cssText = 'transition: all 0.3s ease; transform: none; opacity: 1; animation: none;';
      setTimeout(() => { const img2 = $('lightboxImage'); if (img2) { img2.src = img.url; updateImageTransform(); } }, 10);
    }

    const imageContainer = document.querySelector('.lightbox-image-container');
    if (imageContainer) {
      let addressOverlay = imageContainer.querySelector('.lightbox-address-overlay');
      if (!addressOverlay) {
        addressOverlay = document.createElement('div');
        addressOverlay.className = 'lightbox-address-overlay';
        imageContainer.appendChild(addressOverlay);
      }
      addressOverlay.innerHTML = `<i class="fas fa-map-marker-alt"></i><span>${img.address || ''}</span>`;
    }

    $$('.thumbnail-item').forEach((t, i) => t.classList.toggle('active', i === index));

    const thumbnailsContainer = $('thumbnails');
    if (thumbnailsContainer) {
      const thumb = thumbnailsContainer.children[index];
      if (thumb) thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }

    updateProgressBar(index);
  }

  // Navigate image
  function navigateImage(direction) {
    if (displayedImages.length === 0) return;
    currentImageIndex = (currentImageIndex + direction + displayedImages.length) % displayedImages.length;
    showImage(currentImageIndex);
  }

  // Update image transform
  function updateImageTransform() {
    const image = $('lightboxImage');
    if (!image) return;

    image.style.animation = 'none';
    if (scale === 1) {
      const scaleEffect = Math.max(0.9, 1 - Math.abs(dragDeltaX) / 2000);
      const opacity = Math.max(0.6, 1 - Math.abs(dragDeltaX) / 800);
      image.style.transform = `translateX(${dragDeltaX}px) scale(${scaleEffect})`;
      image.style.opacity = opacity;
    } else {
      image.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
      image.style.opacity = '1';
    }
  }

  // Setup image interaction (zoom & drag)
  function setupImageInteraction() {
    const container = document.querySelector('.lightbox-image-container');
    const img = $('lightboxImage');
    if (!container || !img || container.dataset.zoomListenersAttached === 'true') return;

    container.dataset.zoomListenersAttached = 'true';
    img.addEventListener('dragstart', e => e.preventDefault());

    // Wheel zoom
    container.addEventListener('wheel', e => {
      e.preventDefault();
      const rect = container.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      let newScale = scale + (e.deltaY < 0 ? 1 : -1) * scale * 0.15;
      newScale = Math.min(Math.max(MIN_SCALE, newScale), MAX_SCALE);
      if (Math.abs(newScale - scale) < 0.01) return;

      if (newScale > MIN_SCALE) {
        const ratio = newScale / scale;
        posX = mouseX - (mouseX - posX) * ratio;
        posY = mouseY - (mouseY - posY) * ratio;
        dragDeltaX = 0;
      } else {
        posX = posY = dragDeltaX = 0;
      }

      scale = newScale;
      lastPosX = posX; lastPosY = posY;
      img.style.transition = 'none';
      updateImageTransform();
      container.style.cursor = scale > 1 ? 'grab' : 'grab';
    }, { passive: false });

    // Mouse drag handlers
    container.addEventListener('mousedown', e => {
      if (e.target.closest('.lightbox-nav')) return;
      wasDragging = false; isDragging = true;
      dragStartX = e.clientX; dragStartY = e.clientY; dragDeltaX = 0;
      img.style.transition = 'none';
      container.style.cursor = 'grabbing';
    });

    document.addEventListener('mousemove', e => {
      if (!isDragging) return;

      const dx = e.clientX - dragStartX, dy = e.clientY - dragStartY;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) wasDragging = true;

      if (scale === 1) {
        dragDeltaX = dx;
      } else {
        posX = lastPosX + dx; posY = lastPosY + dy;
        const maxX = Math.max(0, (img.offsetWidth * scale - container.offsetWidth) / 2);
        const maxY = Math.max(0, (img.offsetHeight * scale - container.offsetHeight) / 2);
        posX = Math.max(-maxX, Math.min(maxX, posX));
        posY = Math.max(-maxY, Math.min(maxY, posY));
      }
      updateImageTransform();
    });

    document.addEventListener('mouseup', () => {
      if (!isDragging) return;
      img.style.transition = 'all 0.3s ease';

      if (scale === 1) {
        const threshold = 100;
        if (Math.abs(dragDeltaX) > threshold) {
          navigateImage(dragDeltaX > 0 ? -1 : 1);
        } else {
          dragDeltaX = 0;
          updateImageTransform();
        }
      } else {
        lastPosX = posX; lastPosY = posY;
      }

      isDragging = false;
      container.style.cursor = scale > 1 ? 'grab' : 'grab';
    });
  }

  // Progress bar
  function initProgressBar() {
    const track = $('progressTrack'), thumb = $('progressThumb'), tooltip = $('progressTooltip');
    const container = document.querySelector('.thumbnail-progress-container');
    if (!track || !thumb || !tooltip) return;

    container?.addEventListener('click', e => e.stopPropagation());
    container?.addEventListener('mousedown', e => e.stopPropagation());

    // Click on track
    track.addEventListener('mousedown', (e) => {
      if (e.target === thumb) return;
      e.stopPropagation();
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      showImage(Math.round(percentage * (displayedImages.length - 1)));
    });

    // Drag thumb
    thumb.addEventListener('mousedown', (e) => {
      e.preventDefault(); e.stopPropagation();
      isProgressDragging = true;
      thumb.style.transition = 'none';
      document.body.style.userSelect = 'none';
      showProgressTooltip(currentImageIndex);
    });

    document.addEventListener('mousemove', (e) => {
      if (!isProgressDragging) return;
      e.preventDefault();
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const newIndex = Math.round(percentage * (displayedImages.length - 1));
      if (newIndex !== currentImageIndex) { currentImageIndex = newIndex; showImage(newIndex); }
      updateTooltipPosition(percentage);
      showProgressTooltip(newIndex);
    });

    document.addEventListener('mouseup', () => {
      if (isProgressDragging) {
        isProgressDragging = false; wasProgressDragging = true;
        setTimeout(() => wasProgressDragging = false, 100);
        thumb.style.transition = ''; document.body.style.userSelect = '';
        hideProgressTooltip();
      }
    });

    // Hover tooltip
    track.addEventListener('mouseenter', () => { if (!isProgressDragging) showProgressTooltip(currentImageIndex); });
    track.addEventListener('mouseleave', () => { if (!isProgressDragging) hideProgressTooltip(); });
    track.addEventListener('mousemove', (e) => {
      if (isProgressDragging) return;
      const rect = track.getBoundingClientRect();
      const percentage = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const hoverIndex = Math.round(percentage * (displayedImages.length - 1));
      updateTooltipPosition(percentage);
      showProgressTooltip(hoverIndex);
    });

    updateProgressBar(currentImageIndex);
  }

  function updateProgressBar(index) {
    if (displayedImages.length === 0) return;
    const thumb = $('progressThumb'), fill = $('progressFill');
    if (!thumb || !fill) return;
    const percentage = displayedImages.length > 1 ? (index / (displayedImages.length - 1)) * 100 : 0;
    thumb.style.left = `${percentage}%`;
    fill.style.width = `${percentage}%`;
  }

  function showProgressTooltip(index) {
    const tooltip = $('progressTooltip');
    if (!tooltip || index < 0 || index >= displayedImages.length) return;
    const img = displayedImages[index];
    const tooltipIndex = tooltip.querySelector('.tooltip-index');
    const tooltipTime = tooltip.querySelector('.tooltip-time');
    if (tooltipIndex) tooltipIndex.style.display = 'none';
    if (tooltipTime) tooltipTime.textContent = getTime(img.time);
    tooltip.classList.add('visible');
  }

  function hideProgressTooltip() {
    $('progressTooltip')?.classList.remove('visible');
  }

  function updateTooltipPosition(percentage) {
    const tooltip = $('progressTooltip');
    if (tooltip) tooltip.style.left = `${percentage * 100}%`;
  }

  document.addEventListener('keydown', e => {
    const lightbox = $('lightbox');
    if (!lightbox?.classList.contains('active')) return;
    if (e.key === 'ArrowLeft') navigateImage(-1);
    else if (e.key === 'ArrowRight') navigateImage(1);
    else if (e.key === 'Escape') closeLightbox();
  });

  const lightbox = $('lightbox');
  if (lightbox) {
    lightbox.addEventListener('mousedown', e => {
      if (e.target.id === 'lightbox') {
        isLightboxDown = true;
        ptMouseDown.x = e.clientX; ptMouseDown.y = e.clientY;
      } else {
        isLightboxDown = false;
      }
    });

    lightbox.addEventListener('mouseup', e => {
      if (isLightboxDown && e.target.id === 'lightbox') {
        const dist = Math.hypot(e.clientX - ptMouseDown.x, e.clientY - ptMouseDown.y);
        if (dist < 5 && !wasDragging && !wasProgressDragging) closeLightbox();
      }
      isLightboxDown = false;
      wasDragging = false;
    });
  }

  document.querySelector('.lightbox-header')?.addEventListener('click', e => e.stopPropagation());
  document.querySelector('.lightbox-filter-container')?.addEventListener('click', e => e.stopPropagation());

  window.closeLightbox = closeLightbox;
  window.navigateImage = navigateImage;

  // State management for page navigation
  const saveLightboxState = () => {
    const lightbox = $('lightbox');
    const gridViewState = savedGridViewState || captureGridViewState();

    if (!lightbox?.classList.contains('active')) {
      return {
        isLightboxActive: false,
        gridViewState
      };
    }

    return {
      isLightboxActive: true,
      currentImageIndex,
      currentImageUId: displayedImages[currentImageIndex]?._uId,
      filterState: {
        plate: document.querySelector('#lightboxFilterForm #plateInput')?.value || '',
        date: $('lbDateInput')?.value || '',
        camera: $('camInput')?.value || '',
        timeFrom: $('timeFrom')?.value || '',
        timeTo: $('timeTo')?.value || '',
        group: $('groupSelect')?.value || 'all'
      },
      savedGridFilterState,
      savedGridViewState: gridViewState,
      savedSelectedPlate,
      savedSelectedTime,
      thumbnailScrollLeft: document.querySelector('.lightbox-thumbnails')?.scrollLeft || 0
    };
  };

  const restoreSavedVars = (state) => {
    if (state.savedGridFilterState) savedGridFilterState = state.savedGridFilterState;
    if (state.savedGridViewState) savedGridViewState = state.savedGridViewState;
    if (state.savedSelectedPlate) savedSelectedPlate = state.savedSelectedPlate;
    if (state.savedSelectedTime) savedSelectedTime = state.savedSelectedTime;
  };

  const reopenLightbox = (imageIndex, scrollLeft) => {
    const lightbox = $('lightbox');
    if (!lightbox || lightbox.classList.contains('active')) return;

    setElementVisibility('#list-image .container', false);
    setElementVisibility($('filter-camera'), false);
    lightbox.classList.add('active');
    setBodyScroll(true);

    requestAnimationFrame(() => {
      showImage(imageIndex);
      setupImageInteraction();
      initProgressBar();
      if (scrollLeft) document.querySelector('.lightbox-thumbnails').scrollLeft = scrollLeft;
    });
  };

  // Register state handler
  if (!window.pageStateHandlers) window.pageStateHandlers = {};
  window.pageStateHandlers.camera = {
    save: saveLightboxState,
    restore: (container, state) => {
      if (!state?.isLightboxActive) {
        if (state?.gridViewState?.filterState) {
          lastGridFilterState = { ...state.gridViewState.filterState };
          window.searchCameraImages(lastGridFilterState, true, true);
          restoreGridViewState(state.gridViewState);
        }
        return;
      }

      if (!state.filterState?.plate) return;

      restoreSavedVars(state);
      window.searchCameraImages(state.filterState, true, true);

      setTimeout(() => {
        const imageIndex = state.currentImageUId
          ? displayedImages.findIndex(img => img._uId === state.currentImageUId)
          : 0;
        currentImageIndex = imageIndex >= 0 ? imageIndex : 0;
        reopenLightbox(currentImageIndex, state.thumbnailScrollLeft);
      }, 100);
    }
  };

  loadData();
})();
