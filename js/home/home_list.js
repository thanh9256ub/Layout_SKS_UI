(function () {
  const elements = [
    {
      src: "./images/1.png",
      name: "David",
      placeholder: "Toyota",
      icon: "fa-ellipsis",
    },
    {
      src: "./images/1.png",
      name: "Alice",
      placeholder: "BMW",
      icon: "fa-ellipsis",
    },
    {
      src: "./images/1.png",
      name: "Bob",
      placeholder: "Audi",
      icon: "fa-ellipsis",
    }
  ];

  const container = document.getElementById("list_container_id");

  elements.forEach((el) => {
    const card = document.createElement("div");
    card.classList.add("container_card"); // đặt class đúng theo CSS

    card.innerHTML = `
    <img src="${el.src}" class="card-image">
    <div class="card-content">
      <p>${el.placeholder}</p>
      <h3>${el.name}</h3>
    </div>
    <i class="fa-solid ${el.icon} icon-menu"></i>
  `;

    container.appendChild(card);
  })
})(); 
