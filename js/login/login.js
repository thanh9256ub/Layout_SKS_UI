document.addEventListener('DOMContentLoaded', function () {
    const APP_ROOT = window.location.pathname.toLowerCase().includes('/html/') ? '../' : '';

    const loginForm = document.getElementById('loginForm');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const togglePasswordIcon = togglePasswordBtn.querySelector('i');
    const rememberMeCheckbox = document.getElementById('rememberMe');

    togglePasswordBtn.addEventListener('click', function () {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);

        if (type === 'password') {
            togglePasswordIcon.classList.remove('fa-eye-slash');
            togglePasswordIcon.classList.add('fa-eye');
        } else {
            togglePasswordIcon.classList.remove('fa-eye');
            togglePasswordIcon.classList.add('fa-eye-slash');
        }
    });

    loginForm.addEventListener('submit', function (e) {
        e.preventDefault();

        clearValidation();
        handleLogin();
    });

    usernameInput.addEventListener('blur', function () {
        if (!this.value.trim()) {
            showError(this, 'Vui lòng nhập tên đăng nhập');
        } else {
            clearError(this);
        }
    });

    passwordInput.addEventListener('blur', function () {
        if (!this.value.trim()) {
            showError(this, 'Vui lòng nhập mật khẩu');
        } else {
            clearError(this);
        }
    });

    usernameInput.addEventListener('input', function () {
        if (this.value.trim()) {
            clearError(this);
        }
    });

    passwordInput.addEventListener('input', function () {
        if (this.value.trim()) {
            clearError(this);
        }
    });

    function showError(input, message) {
        input.classList.add('is-invalid');
        const feedback = input.parentElement.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    function clearError(input) {
        input.classList.remove('is-invalid');
    }

    function clearValidation() {
        usernameInput.classList.remove('is-invalid');
        passwordInput.classList.remove('is-invalid');
    }

    function handleLogin() {
        const loginButton = loginForm.querySelector('.btn-login');
        const btnText = loginButton.querySelector('.btn-text');
        const btnIcon = loginButton.querySelector('.btn-icon');

        const originalText = btnText.textContent;
        btnText.textContent = 'Đang đăng nhập...';
        btnIcon.style.display = 'none';
        loginButton.disabled = true;
        loginButton.style.opacity = '0.7';
        loginButton.style.cursor = 'not-allowed';

        const formData = {
            username: usernameInput.value.trim(),
            password: passwordInput.value,
            rememberMe: rememberMeCheckbox.checked
        };

        const username = formData.username || 'demo';

        if (formData.rememberMe) {
            localStorage.setItem('rememberMe', 'true');
            localStorage.setItem('username', username);
        } else {
            localStorage.removeItem('rememberMe');
            localStorage.setItem('username', username);
        }

        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('currentUser', username);

        showSuccessMessage('Đăng nhập thành công! Đang chuyển hướng...');

        setTimeout(() => {
            window.location.href = `${APP_ROOT}index.html`;
        }, 300);
    }
    function showSuccessMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-success alert-dismissible fade show';
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <i class="fas fa-check-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 3000);
    }

    function showErrorMessage(message) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'alert alert-danger alert-dismissible fade show';
        alertDiv.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
        alertDiv.innerHTML = `
            <i class="fas fa-exclamation-circle me-2"></i>
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.body.appendChild(alertDiv);

        setTimeout(() => {
            alertDiv.classList.remove('show');
            setTimeout(() => alertDiv.remove(), 150);
        }, 2000);
    }

    if (localStorage.getItem('rememberMe') === 'true') {
        const savedUsername = localStorage.getItem('username');
        if (savedUsername) {
            usernameInput.value = savedUsername;
            rememberMeCheckbox.checked = true;
        }
    }
});
