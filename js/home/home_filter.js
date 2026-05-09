(function () {
  async function initFilterComponent() {
    try {
      const response = await fetch("json/package.json");
      const data = await response.json();

      const carSelect = document.getElementById("carSelect");
      const modelSelect = document.getElementById("modelSelect");
      const typeOptions = document.getElementById("typeOptions");
      const colorOptions = document.getElementById("colorOptions");

      if (!carSelect || !modelSelect || !typeOptions || !colorOptions) {
        return;
      }

      data.car.forEach(car => {
        const option = document.createElement("option");
        option.value = car.id;
        option.textContent = car.name;
        carSelect.appendChild(option);
      });

      carSelect.addEventListener("change", () => {
        const selectedCarId = parseInt(carSelect.value);
        const selectedCar = data.car.find(c => c.id === selectedCarId);

        modelSelect.innerHTML = '<option selected>Select model</option>';
        
        if (selectedCar) {
          selectedCar.listModel.forEach(model => {
            const option = document.createElement("option");
            option.value = model.id;
            option.textContent = model.name;
            modelSelect.appendChild(option);
          });
        }
      });

      data.carType.forEach(type => {
        const div = document.createElement("div");
        div.className = "form-check";
        div.innerHTML =
          `<input class="form-check-input " type="checkbox" id="type-${type.id}" value="${type.name}">
        <label class="form-check-label" for="type-${type.id}">${type.name}</label>`;
        typeOptions.appendChild(div);
      });

      data.color.forEach(color => {
        const div = document.createElement("div");
        div.className = "form-check";
        div.innerHTML =
          `<input class="form-check-input round-check" type="checkbox" id="color-${color.id}" value="${color.name}">
        <label class="form-check-label" for="color-${color.id}">${color.name}</label>`;
        colorOptions.appendChild(div);
      });
    } catch (error) {
      console.error("Lỗi load JSON:", error);
    }
  }

  function init() {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", initFilterComponent);
    } else {
      initFilterComponent();
    }
  }

  // Khởi tạo lần đầu
  init();

  // Lắng nghe event khi trang được hiển thị lại
  window.addEventListener('pageShown', (e) => {
    if (e.detail?.page === 'home') {
      // Kiểm tra xem dữ liệu đã được load chưa
      const carSelect = document.getElementById("carSelect");
      if (carSelect && carSelect.options.length <= 1) {
        initFilterComponent();
      }
    }
  });
})();
