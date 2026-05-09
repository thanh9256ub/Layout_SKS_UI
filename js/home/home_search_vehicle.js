(function () {
  const images = {
    car1: "images/car1.jpg",
    car2: "images/car2.jpg",
    car3: "images/car3.jpg",
  };

  const searchInput = document.getElementById("vehicle-search");
  const previewImg = document.getElementById("preview-img");

  previewImg.src = images["car1"];

  searchInput.addEventListener("input", () => {
    const value = searchInput.value.trim().toLowerCase();

    if (value && images[value]) {
      previewImg.src = images[value];
    } else {
      previewImg.src = images["car1"];
    }
  });

})(); 
