function initNavbarSearchInput() {
    const searchForm = document.getElementById("navbarSearchForm");
    const searchInput = document.getElementById("navbarSearchInput");

    if (!searchForm || !searchInput || searchForm.dataset.initialized === "true") {
        return;
    }

    searchForm.dataset.initialized = "true";

    const isCompactSearch = () => window.matchMedia("(max-width: 1024px)").matches;
    const openCompactSearch = () => {
        searchForm.classList.add("search-open");
        setTimeout(() => searchInput.focus(), 50);
    };
    const closeCompactSearch = () => {
        if (!searchInput.value.trim()) {
            searchForm.classList.remove("search-open");
        }
    };

    searchForm.addEventListener("click", (e) => {
        if (!isCompactSearch() || searchForm.classList.contains("search-open")) return;
        e.preventDefault();
        openCompactSearch();
    });

    searchForm.addEventListener("submit", (e) => {
        e.preventDefault();
        if (isCompactSearch() && !searchForm.classList.contains("search-open")) {
            openCompactSearch();
            return;
        }

        const searchTerm = searchInput.value.trim();

        if (!searchTerm) {
            searchInput.focus();
            return;
        }

        console.log("Searching for:", searchTerm);
        // TODO: Thêm logic tìm kiếm thực tế
    });

    document.addEventListener("click", (e) => {
        if (!isCompactSearch() || searchForm.contains(e.target)) return;
        closeCompactSearch();
    });

    searchInput.addEventListener("keydown", (e) => {
        if (e.key !== "Escape" || !isCompactSearch()) return;
        searchInput.value = "";
        searchForm.classList.remove("search-open");
        searchInput.blur();
    });

    window.addEventListener("resize", () => {
        if (!isCompactSearch()) {
            searchForm.classList.remove("search-open");
        }
    });
}

function initChangePasswordModal() {
    const changePasswordModal = document.getElementById("changePasswordModal");
    const changePasswordModalClose = document.getElementById("changePasswordModalClose");
    const changePasswordModalOverlay = changePasswordModal?.querySelector(".search-modal-overlay");
    const changePasswordCancel = document.getElementById("changePasswordCancel");
    const changePasswordForm = document.getElementById("changePasswordForm");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const confirmNewPasswordInput = document.getElementById("confirmNewPassword");
    const changePasswordMessage = document.getElementById("changePasswordMessage");
    const passwordInputs = [currentPasswordInput, newPasswordInput, confirmNewPasswordInput].filter(Boolean);
    let changePasswordVisible = false;

    if (!changePasswordModal || changePasswordModal.dataset.initialized === "true") {
        return;
    }

    changePasswordModal.dataset.initialized = "true";

    function setChangePasswordVisibility(visible) {
        changePasswordVisible = visible;
        passwordInputs.forEach((input) => {
            input.type = visible ? "text" : "password";
        });

        changePasswordModal.querySelectorAll(".change-password-toggle").forEach((button) => {
            const icon = button.querySelector("i");
            button.setAttribute("aria-label", visible ? "Ẩn mật khẩu" : "Hiện mật khẩu");
            button.setAttribute("title", visible ? "Ẩn mật khẩu" : "Hiện mật khẩu");
            icon?.classList.toggle("fa-eye", !visible);
            icon?.classList.toggle("fa-eye-slash", visible);
        });
    }

    function initPasswordVisibilityToggles() {
        passwordInputs.forEach((input) => {
            if (input.dataset.visibilityToggleReady === "true") return;
            input.dataset.visibilityToggleReady = "true";

            const wrapper = document.createElement("div");
            wrapper.className = "change-password-input-wrap";
            input.parentNode.insertBefore(wrapper, input);
            wrapper.appendChild(input);

            const button = document.createElement("button");
            button.type = "button";
            button.className = "change-password-toggle";
            button.setAttribute("aria-label", "Hiện mật khẩu");
            button.setAttribute("title", "Hiện mật khẩu");
            button.innerHTML = '<i class="fas fa-eye"></i>';

            button.addEventListener("mousedown", (e) => e.preventDefault());
            button.addEventListener("click", (e) => {
                e.preventDefault();
                const visible = input.type === "password";
                const icon = button.querySelector("i");

                input.type = visible ? "text" : "password";
                button.setAttribute("aria-label", visible ? "Ẩn mật khẩu" : "Hiện mật khẩu");
                button.setAttribute("title", visible ? "Ẩn mật khẩu" : "Hiện mật khẩu");
                icon?.classList.toggle("fa-eye", !visible);
                icon?.classList.toggle("fa-eye-slash", visible);
            });

            wrapper.appendChild(button);
        });
    }

    initPasswordVisibilityToggles();

    window.openChangePasswordModal = function () {
        changePasswordModal.classList.add("active");
        setChangePasswordVisibility(false);
        document.body.style.overflow = "hidden";
        currentPasswordInput?.focus();
    };

    function closeChangePasswordModal() {
        changePasswordModal.classList.remove("active");
        document.body.style.overflow = "";
        changePasswordForm?.reset();
        setChangePasswordVisibility(false);
        if (changePasswordMessage) {
            changePasswordMessage.textContent = "";
            changePasswordMessage.className = "change-password-message";
        }
    }

    changePasswordModalClose?.addEventListener("click", closeChangePasswordModal);
    changePasswordModalOverlay?.addEventListener("click", closeChangePasswordModal);
    changePasswordCancel?.addEventListener("click", closeChangePasswordModal);

    document.addEventListener("click", (e) => {
        const changePasswordButton = e.target.closest("#navbarChangePassword, #sidebarChangePassword");
        if (!changePasswordButton) return;

        e.preventDefault();
        window.openChangePasswordModal();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && changePasswordModal.classList.contains("active")) {
            closeChangePasswordModal();
        }
    });

    changePasswordForm?.addEventListener("submit", (e) => {
        e.preventDefault();

        const currentPassword = currentPasswordInput?.value.trim();
        const newPassword = newPasswordInput?.value.trim();
        const confirmNewPassword = confirmNewPasswordInput?.value.trim();

        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showChangePasswordMessage("Vui lòng nhập đầy đủ thông tin.", "error");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            showChangePasswordMessage("Mật khẩu xác nhận không khớp.", "error");
            return;
        }

        showChangePasswordMessage("Đổi mật khẩu thành công.", "success");
        setTimeout(closeChangePasswordModal, 800);
    });

    function showChangePasswordMessage(message, type) {
        if (!changePasswordMessage) return;
        changePasswordMessage.textContent = message;
        changePasswordMessage.className = `change-password-message ${type}`;
    }
}

(function initNavbar() {

    const navLinks = document.querySelectorAll(".nav-link");
    const navLinkNames = document.querySelectorAll(".nav-link-name");
    const allNavLinks = [...navLinks, ...navLinkNames];
    const usernameElement = document.querySelector(".username");
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


    initNavbarSearchInput();
    initChangePasswordModal();

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
