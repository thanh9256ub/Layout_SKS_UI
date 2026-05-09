(function () {
    async function filterPreviewCar() {
        try {

            const response = await fetch("json/package.json");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            const detailContainer = document.getElementById("vehicle-detail");
            const listContainer = document.getElementById("vehicle-list");
            if (!detailContainer || !listContainer) {
                console.error("Required containers not found");
                return;
            }

            // Check if car data exists
            if (!data.car || !Array.isArray(data.car) || data.car.length === 0) {
                console.error("No vehicle data found in JSON");
                return;
            }

            function renderVehicleDetail(vehicle) {
                const totalVotes =
                    vehicle.vote.oneStar +
                    vehicle.vote.twoStar +
                    vehicle.vote.threeStar +
                    vehicle.vote.fourStar +
                    vehicle.vote.fiveStar;
                const avgRating =
                    (vehicle.vote.fiveStar * 5 +
                        vehicle.vote.fourStar * 4 +
                        vehicle.vote.threeStar * 3 +
                        vehicle.vote.twoStar * 2 +
                        vehicle.vote.oneStar * 1) /
                    totalVotes;

                detailContainer.innerHTML = `
                    <div class="header-preview">
                        <label class="search-preview">
                            <input type="text" placeholder="Vehicle">
                            <i class="fa-solid fa-magnifying-glass"></i>
                        </label>
                        <div class="vote">
                            <i class="fa-solid fa-star vote-icon"></i>
                            <span>${avgRating.toFixed(1)} (${totalVotes})</span>
                        </div>
                        <div class="location">
                            <i class="fa-solid fa-location-dot location-icon-preview"></i>
                            <span>${vehicle.distance.met}m (${vehicle.distance.time} min)</span>
                        </div>
                        <div class="car-available">
                            <i class="fa-solid fa-circle-dot car-available-icon"></i>
                            <span>${vehicle.available} Available</span>
                        </div>
                    </div>

                    <img src="${vehicle.image}" alt="${vehicle.name}" class="detail-preview-img">

                    <div class="vehicle-info">
                        <div class="vehicle-name">
                            <h3>${vehicle.name}</h3>
                            <p>${vehicle.detail}</p>
                        </div>
                        <span class="divider-vehicle"></span>
                        <div class="price">
                            <h4>$${vehicle.price.toFixed(2)}</h4>
                            <p>/hour</p>
                        </div>
                    </div>

                    <div class="vehicle-specs">
                        <div class="car-type"><i class="fa-solid fa-car"></i><p>${vehicle.type}</p></div>
                        <div class="car-transmission"><i class="fa-solid fa-gear"></i><p>${vehicle.mode}</p></div>
                        <div class="car-fuel"><i class="fa-solid fa-temperature-full"></i><p>${vehicle.fuel}</p></div>
                        <div class="car-seat"><i class="fa-solid fa-couch"></i><p>${vehicle.seat}</p></div>
                    </div>
                `;
            }

            function renderVehicleList(vehicles) {
                listContainer.innerHTML = "";

                vehicles.forEach((v, index) => {
                    const img = document.createElement("img");
                    img.src = v.thumb || "images/car1.jpg";
                    img.alt = v.name;
                    img.className = "vehicle-thumb";

                    // onclick thumbnail
                    img.addEventListener("click", () => {
                        document.querySelectorAll(".vehicle-thumb").forEach(el => el.classList.remove("active"));
                        img.classList.add("active");
                        renderVehicleDetail(v);
                    });

                    if (index === 0) img.classList.add("active");
                    listContainer.appendChild(img);
                });
            }

            // Access vehicles from the car array in the JSON data
            const vehicles = data.car;

            renderVehicleDetail(vehicles[0]);
            renderVehicleList(vehicles);
        } catch (error) {
            console.error("Error loading vehicle data:", error);
        }
    }
    function init() {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", filterPreviewCar);
        } else {
            filterPreviewCar();
        }
    }

    // Khởi tạo lần đầu
    init();

    // Lắng nghe event khi trang được hiển thị lại
    window.addEventListener('pageShown', (e) => {
        if (e.detail?.page === 'home') {
            // Kiểm tra xem dữ liệu đã được render chưa
            const listContainer = document.getElementById("vehicle-list");
            if (!listContainer || listContainer.children.length === 0) {
                filterPreviewCar();
            }
        }
    });
})();
