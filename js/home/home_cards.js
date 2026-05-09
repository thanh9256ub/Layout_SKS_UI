(function () {
  const elements = [
    { title: "Active Rentals", number: 28, percent: 25, icon: "fa-users", class: "active" },
    { title: "Available Vehicles", number: 252, percent: 12, icon: "fa-car", class: "available" },
    { title: "Pending Returns", number: 13, percent: 21, icon: "fa-clock-rotate-left", class: "pending" },
    { title: "Feedback", number: 86, percent: 25, icon: "fa-regular fa-comments", class: "feedback" }
  ];

  const container = document.getElementById("cards-container");
  container.innerHTML = "";

  elements.forEach((el) => {
    const card = document.createElement("div");
    card.className = `card ${el.class}`;
    card.innerHTML = `
      <div style="display: flex; padding: 10x"> 
        <i class="icon fa-solid ${el.icon}"></i>
        <div class="title">${el.title}</div>
      </div>
      <div class="bottom-card"> 
        <div class="number">${el.number}</div>
        <div class="percent">+${el.percent}%</div>
      </div>
    `;
    container.appendChild(card);
  });
})();
