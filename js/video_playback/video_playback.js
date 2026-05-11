(function () {
    const SAMPLE_VIDEO = 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
    const VIDEOS = [
        { plate: '29A-12345', date: '2026-05-09', time: '08:00:00', camera: 'Camera 1', duration: '00:15:32', src: SAMPLE_VIDEO },
        { plate: '29A-12345', date: '2026-05-09', time: '09:30:00', camera: 'Camera 2', duration: '00:10:18', src: SAMPLE_VIDEO },
        { plate: '30B-67890', date: '2026-05-09', time: '10:45:00', camera: 'Camera 1', duration: '00:22:04', src: SAMPLE_VIDEO },
        { plate: '51C-11111', date: '2026-05-08', time: '14:20:00', camera: 'Camera 3', duration: '00:08:47', src: SAMPLE_VIDEO }
    ];

    let hls = null;
    const $ = (id) => document.getElementById(id);

    function initPlateOptions() {
        const datalist = $('videoPlaybackPlates');
        if (!datalist) return;
        datalist.innerHTML = [...new Set(VIDEOS.map(v => v.plate))]
            .map(plate => `<option value="${plate}"></option>`)
            .join('');
    }

    function getFilteredVideos() {
        const date = $('videoPlaybackDate')?.value || '';
        const plate = ($('videoPlaybackPlate')?.value || '').trim().toLowerCase();
        return VIDEOS.filter(video =>
            (!date || video.date === date) &&
            (!plate || video.plate.toLowerCase().includes(plate))
        );
    }

    function renderList() {
        const list = $('videoPlaybackList');
        if (!list) return;
        const videos = getFilteredVideos();

        if (!videos.length) {
            list.innerHTML = '<div class="video-file-empty"><i class="fas fa-video-slash"></i><span>Khong co video phu hop</span></div>';
            return;
        }

        list.innerHTML = videos.map((video, index) => `
            <article class="video-file-item">
                <div class="video-file-meta">
                    <strong>${video.plate}</strong>
                    <span>${video.camera} - ${video.date} ${video.time}</span>
                    <small>${video.duration}</small>
                </div>
                <div class="video-file-actions">
                    <button type="button" class="video-action-btn play" data-index="${index}" title="Phat">
                        <i class="fas fa-play"></i>
                    </button>
                    <a class="video-action-btn download" href="${video.src}" download title="Tai xuong">
                        <i class="fas fa-download"></i>
                    </a>
                </div>
            </article>
        `).join('');

        list.querySelectorAll('.video-action-btn.play').forEach(button => {
            button.addEventListener('click', () => playVideo(videos[Number(button.dataset.index)]));
        });
    }

    function playVideo(video) {
        const player = $('videoPlaybackPlayer');
        const empty = $('videoPlaybackEmpty');
        if (!player || !video) return;

        if (hls) {
            hls.destroy();
            hls = null;
        }

        if (window.Hls?.isSupported() && video.src.endsWith('.m3u8')) {
            hls = new Hls();
            hls.loadSource(video.src);
            hls.attachMedia(player);
        } else {
            player.src = video.src;
        }

        empty?.classList.add('hidden');
        player.play().catch(() => { });
    }

    function init() {
        const dateInput = $('videoPlaybackDate');
        if (dateInput && !dateInput.value) dateInput.value = '2026-05-09';
        initPlateOptions();
        renderList();
        $('videoPlaybackFilter')?.addEventListener('submit', (event) => {
            event.preventDefault();
            renderList();
        });
        dateInput?.addEventListener('change', renderList);
        $('videoPlaybackPlate')?.addEventListener('input', renderList);
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
    else init();
})();
