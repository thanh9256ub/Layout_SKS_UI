// Hàm khởi tạo search button với modal
function initSearchButton() {
    const searchButton = document.querySelector(".button-search");
    const searchModal = document.getElementById("searchModal");
    const searchModalClose = document.getElementById("searchModalClose");
    const searchModalOverlay = searchModal?.querySelector(".search-modal-overlay");
    const searchModalInput = document.getElementById("searchModalInput");
    const searchModalForm = document.getElementById("searchModalForm");

    if (!searchButton || !searchModal) {
        return;
    }

    // Xóa event listeners cũ bằng cách clone button
    const newSearchButton = searchButton.cloneNode(true);
    searchButton.parentNode.replaceChild(newSearchButton, searchButton);

    // Mở modal khi click vào nút search
    newSearchButton.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (searchModal) {
            searchModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Ngăn scroll khi modal mở
            // Auto focus vào input khi mở
            setTimeout(() => {
                if (searchModalInput) {
                    searchModalInput.focus();
                }
            }, 300);
        }
    });

    // Đóng modal khi click vào nút close
    if (searchModalClose) {
        searchModalClose.addEventListener("click", () => {
            closeSearchModal();
        });
    }

    // Đóng modal khi click vào overlay
    if (searchModalOverlay) {
        searchModalOverlay.addEventListener("click", () => {
            closeSearchModal();
        });
    }

    // Đóng modal khi nhấn ESC
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && searchModal?.classList.contains("active")) {
            closeSearchModal();
        }
    });

    // Xử lý submit form
    if (searchModalForm) {
        searchModalForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const searchTerm = searchModalInput?.value.trim();
            if (searchTerm) {
                // Thực hiện tìm kiếm ở đây
                console.log("Searching for:", searchTerm);
                // TODO: Thêm logic tìm kiếm thực tế
                closeSearchModal();
            }
        });
    }

    // Hàm đóng modal
    function closeSearchModal() {
        if (searchModal) {
            searchModal.classList.remove("active");
            document.body.style.overflow = ""; // Khôi phục scroll
            if (searchModalInput) {
                searchModalInput.value = "";
            }
        }
    }
}

(function initNavbar() {

    const navLinks = document.querySelectorAll(".nav-link");
    const navLinkNames = document.querySelectorAll(".nav-link-name");
    const allNavLinks = [...navLinks, ...navLinkNames];
    const usernameElement = document.querySelector(".username");
    const searchButton = document.querySelector(".button-search");
    const searchInput = document.querySelector('.form-group .form-control');

    const username = localStorage.getItem("username") || "Khách";
    if (usernameElement) usernameElement.textContent = username;

    let activePage = "home";

    // Nếu không có history state, coi như reload và về home
    if (!window.history.state?.page) {
        activePage = "home";
        localStorage.setItem("activeNav", "home");
        localStorage.setItem("currentPage", "home");
    } else {
        // Khi điều hướng, xác định trang active dựa trên URL hiện tại
        const currentPath = window.location.pathname;

        // Mapping URL paths to page names
        if (currentPath.includes("tracking.html")) {
            activePage = "tracking";
        } else if (currentPath.includes("index.html") || currentPath === "/" || currentPath.endsWith("/")) {
            activePage = "home";
        } else {
            // Nếu không phải các trang trên, thử dùng hash hoặc localStorage
            const hashPath = window.location.hash.replace("#/", "");
            if (hashPath) {
                activePage = hashPath;
            } else {
                // Tìm link có href khớp với URL hiện tại
                const matchingLink = Array.from(navLinks).find(link => {
                    const href = link.getAttribute("href");
                    return href && (currentPath.includes(href) || href.includes(currentPath));
                });
                if (matchingLink && matchingLink.dataset.name) {
                    activePage = matchingLink.dataset.name;
                } else {
                    // Lấy từ localStorage (nhưng chỉ khi không phải reload)
                    const savedActive = localStorage.getItem("activeNav");
                    activePage = savedActive || "home";
                }
            }
        }
    }

    allNavLinks.forEach(link => link.classList.remove("active"));

    const activeLink = document.querySelector(`.nav-link[data-name="${activePage}"]`);
    if (activeLink) {
        activeLink.classList.add("active");
    }

    // Cập nhật localStorage để đồng bộ
    localStorage.setItem("activeNav", activePage);

    // Đồng bộ với router sau khi router chạy xong (đặc biệt khi reload)
    const syncWithRouter = () => {
        // Đợi router chạy xong
        if (!window.__routerReady) {
            setTimeout(syncWithRouter, 50);
            return;
        }

        const routerPage = localStorage.getItem("currentPage");
        if (routerPage && routerPage !== activePage) {
            activePage = routerPage;
            allNavLinks.forEach(link => link.classList.remove("active"));
            const activeLink = document.querySelector(`.nav-link[data-name="${activePage}"]`);
            if (activeLink) {
                activeLink.classList.add("active");
            }
            // Cập nhật sidebar
            document.querySelectorAll('.sidebar-nav-item').forEach(link => {
                link.classList.remove('active');
                if (link.dataset.name === activePage) {
                    link.classList.add('active');
                }
            });
            localStorage.setItem("activeNav", activePage);
        }
    };

    // Gọi nhiều lần để đảm bảo đồng bộ
    setTimeout(syncWithRouter, 50);
    setTimeout(syncWithRouter, 150);
    setTimeout(syncWithRouter, 300);
    setTimeout(syncWithRouter, 500);


    // Khởi tạo search button
    initSearchButton();

    // Xử lý toggle menu cho màn hình <= 1024px
    const navbarToggler = document.querySelector('.navbar-toggler');
    const mainNavbar = document.getElementById('mainNavbar');
    const navbarBottom = document.querySelector('.navbar-bottom');
    const body = document.body;

    if (navbarToggler && mainNavbar && navbarBottom) {
        // Lắng nghe sự kiện khi menu được mở
        mainNavbar.addEventListener('show.bs.collapse', () => {
            navbarBottom.classList.add('show');
            body.classList.add('navbar-menu-open');
        });

        // Lắng nghe sự kiện khi menu được đóng
        mainNavbar.addEventListener('hide.bs.collapse', () => {
            navbarBottom.classList.remove('show');
            body.classList.remove('navbar-menu-open');
        });

        // Kiểm tra trạng thái ban đầu
        if (mainNavbar.classList.contains('show')) {
            navbarBottom.classList.add('show');
            body.classList.add('navbar-menu-open');
        }
    }
})();

function changeMainContent(page) {
    // Navigation được xử lý bởi các link href trong navbar
    // Hàm này không cần làm gì vì không sử dụng SPA approach
    return;
}