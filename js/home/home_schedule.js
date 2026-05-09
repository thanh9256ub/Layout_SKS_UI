(function () {
    const headerRow = document.getElementById("detailRow");
    const tableBody = document.getElementById("tableBody");
    const buttons = document.querySelectorAll(".filter-schedule button");

    const columnsMap = {
        day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        week: ["W1", "W2", "W3", "W4"],
        month: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    };

    const vehicleList = [
        {
            bienSo: "B 1234 ABC",
            nameUser: "W. Bahari",
            nameCar: "Toyota Avanza 1.5 A/T",
            timeStart: "W1",
            timeStop: "W2",
            avatar: "https://i.pravatar.cc/40?img=1"
        },
        {
            bienSo: "B 2456 RBH",
            nameUser: "W. Kahari",
            nameCar: "Toyota Calza",
            timeStart: "W2",
            timeStop: "W3",
            avatar: "https://i.pravatar.cc/40?img=2"
        },
        {
            bienSo: "B 1234 ABC",
            nameUser: "W. Bahari",
            nameCar: "Toyota Avanza 1.5 A/T",
            timeStart: "Jan",
            timeStop: "Feb",
            avatar: "https://i.pravatar.cc/40?img=1"
        },
        {
            bienSo: "B 2456 RBH",
            nameUser: "W. Kahari",
            nameCar: "Toyota Calza",
            timeStart: "Apr",
            timeStop: "Aug",
            avatar: "https://i.pravatar.cc/40?img=2"
        },
        {
            bienSo: "B 1234 ABC",
            nameUser: "W. Bahari",
            nameCar: "Toyota Avanza 1.5 A/T",
            timeStart: "Tue",
            timeStop: "Thu",
            avatar: "https://i.pravatar.cc/40?img=1"
        },
        {
            bienSo: "B 2456 RBH",
            nameUser: "W. Kahari",
            nameCar: "Toyota Calza",
            timeStart: "Thu",
            timeStop: "Sun",
            avatar: "https://i.pravatar.cc/40?img=2"
        }
    ];

    // Hàm render cột header
    function renderHeader(view) {
        headerRow.innerHTML = "";
        const th = document.createElement("th");
        th.textContent = "Vehicle List";
        headerRow.appendChild(th);

        columnsMap[view].forEach(col => {
            const th = document.createElement("th");
            th.textContent = col;
            headerRow.appendChild(th);
        });
    }

    // Hàm render dữ liệu
    function renderTable(view) {
        renderHeader(view);
        tableBody.innerHTML = "";

        vehicleList.forEach(vehicle => {
            const tr = document.createElement("tr");

            // Cột đầu tiên
            const tdVehicle = document.createElement("td");
            tdVehicle.innerHTML = `
      <b>${vehicle.bienSo}</b><br>
      <span style="font-size: 13px; color: gray;">${vehicle.nameCar}</span>
    `;
            tr.appendChild(tdVehicle);
            columnsMap[view].forEach(col => {
                const td = document.createElement("td");

                if (col === vehicle.timeStart) {
                    const startIndex = columnsMap[view].indexOf(vehicle.timeStart);
                    const stopIndex = columnsMap[view].indexOf(vehicle.timeStop);
                    const colSpan = (stopIndex > startIndex)
                        ? stopIndex - startIndex + 1
                        : 1;

                    td.colSpan = colSpan;

                    // Tạo phần tử chip
                    const chip = document.createElement("div");
                    chip.className = "schedule-chip";
                    chip.innerHTML = `
      <img src="${vehicle.avatar}" alt="">
      <span>${vehicle.nameUser}</span>
    `;
                    const widthPercent = 100;
                    chip.style.width = `${widthPercent}%`;

                    td.appendChild(chip);
                    tr.appendChild(td);
                }
                else if (
                    col !== vehicle.timeStop &&
                    col !== vehicle.timeStart &&
                    (
                        columnsMap[view].indexOf(col) < columnsMap[view].indexOf(vehicle.timeStart) ||
                        columnsMap[view].indexOf(col) > columnsMap[view].indexOf(vehicle.timeStop)
                    )
                ) {
                    tr.appendChild(td);
                }
            });

            tableBody.appendChild(tr);
        });
    }

    // Khi click nút thay đổi view
    buttons.forEach(btn => {
        btn.addEventListener("click", () => {
            buttons.forEach(b => b.classList.remove("active-filter-schedule"));
            btn.classList.add("active-filter-schedule");
            renderTable(btn.dataset.view);
        });
    });

    // Render mặc định Week
    renderTable("week");

})(); 