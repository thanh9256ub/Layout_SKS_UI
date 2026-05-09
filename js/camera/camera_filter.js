(function () {
    const outerForm = document.getElementById('filterForm');
    const lightboxForm = document.getElementById('lightboxFilterForm');

    const lbDateInput = document.getElementById('lbDateInput');
    const groupSelect = document.getElementById('groupSelect');

    const mainPlateInput = document.querySelector('#filterForm #plateInput');
    const mainSuggestionsList = document.querySelector('#filterForm #plate-suggestions');

    const lbPlateInput = document.querySelector('#lightboxFilterForm #plateInput');
    const lbSuggestionsList = document.querySelector('#lightboxFilterForm #plate-suggestions');

    function setupPlateSuggestions(plateInput, suggestionsList) {
        if (!plateInput || !suggestionsList) return;

        plateInput.addEventListener('input', function () {
            const query = this.value.trim().toLowerCase();
            suggestionsList.innerHTML = '';
            suggestionsList.style.display = 'none';

            if (!query) return;
            if (document.activeElement !== this) return;
            if (!window.getAvailablePlates) return;

            const allPlates = window.getAvailablePlates();
            const matches = allPlates.filter(plate => plate.toLowerCase().includes(query));

            if (matches.length > 0) {
                matches.forEach(plate => {
                    const li = document.createElement('li');
                    li.textContent = plate;
                    li.onclick = function () {
                        plateInput.value = plate;
                        suggestionsList.style.display = 'none';
                    };
                    suggestionsList.appendChild(li);
                });
                suggestionsList.style.display = 'block';
            }
        });

        document.addEventListener('click', function (e) {
            if (!plateInput.contains(e.target) && !suggestionsList.contains(e.target)) {
                suggestionsList.style.display = 'none';
            }
        });

        plateInput.addEventListener('keydown', function (e) {
            if (e.key === 'Escape') {
                suggestionsList.style.display = 'none';
            }
        });
    }

    setupPlateSuggestions(mainPlateInput, mainSuggestionsList);
    setupPlateSuggestions(lbPlateInput, lbSuggestionsList);

    // Main Form Submit (Outside lightbox)
    if (outerForm) {
        outerForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const group = groupSelect ? groupSelect.value : 'all';
            const plate = mainPlateInput ? mainPlateInput.value.trim() : '';

            if (mainSuggestionsList) {
                mainSuggestionsList.style.display = 'none';
            }

            if (window.searchCameraImages) {
                window.searchCameraImages({
                    date: '',
                    group: group,
                    plate: plate,
                    camera: '',
                    timeFrom: '',
                    timeTo: ''
                });
            }
        });

        outerForm.addEventListener('reset', function () {
            setTimeout(() => {
                if (mainPlateInput) mainPlateInput.value = '';
                if (mainSuggestionsList) mainSuggestionsList.style.display = 'none';
            }, 50);
        });
    }

    // Lightbox Form Submit (Detailed)
    if (lightboxForm) {
        lightboxForm.addEventListener('submit', function (e) {
            e.preventDefault();
            const date = lbDateInput ? lbDateInput.value : '';
            const plate = lbPlateInput ? lbPlateInput.value.trim() : '';
            const cam = document.getElementById('camInput')?.value || '';
            const timeFrom = document.getElementById('timeFrom')?.value || '';
            const timeTo = document.getElementById('timeTo')?.value || '';
            const group = groupSelect ? groupSelect.value : 'all';

            if (lbSuggestionsList) {
                lbSuggestionsList.style.display = 'none';
            }

            if (window.searchCameraImages) {
                window.searchCameraImages({
                    plate: plate,
                    date: date,
                    camera: cam,
                    timeFrom: timeFrom,
                    timeTo: timeTo,
                    group: group
                }, true);
            }
        });
    }
})();