// API Base URL - sesuaikan dengan server Anda
const API_BASE_URL = 'http://localhost:3000/api';

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginCard = document.querySelector('.login-card');
const registerCard = document.querySelector('.register-card');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');
const togglePasswordBtn = document.getElementById('toggle-password');
const toggleRegisterPasswordBtn = document.getElementById('toggle-register-password');
const loading = document.getElementById('loading');

// Toggle between login and register
showRegisterLink.addEventListener('click', (e) => {
    e.preventDefault();
    loginCard.style.display = 'none';
    registerCard.style.display = 'block';
});

showLoginLink.addEventListener('click', (e) => {
    e.preventDefault();
    registerCard.style.display = 'none';
    loginCard.style.display = 'block';
});

// Toggle password visibility
togglePasswordBtn.addEventListener('click', () => {
    const passwordInput = document.getElementById('login-password');
    const icon = togglePasswordBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
});

toggleRegisterPasswordBtn.addEventListener('click', () => {
    const passwordInput = document.getElementById('register-password');
    const icon = toggleRegisterPasswordBtn.querySelector('i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
});

// Show loading
function showLoading() {
    loading.style.display = 'flex';
}

// Hide loading
function hideLoading() {
    loading.style.display = 'none';
}

// Show error message
function showError(message, form) {
    // Remove existing error messages
    const existingError = form.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    form.insertBefore(errorDiv, form.firstChild);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        errorDiv.remove();
    }, 5000);
}

// Show success message
function showSuccess(message, form) {
    const existingSuccess = form.querySelector('.success-message');
    if (existingSuccess) {
        existingSuccess.remove();
    }
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    form.insertBefore(successDiv, form.firstChild);
    
    setTimeout(() => {
        successDiv.remove();
    }, 5000);
}

// Login function
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credential = formData.get('credential');
    const password = formData.get('password');
    const userType = formData.get('user_type');
    
    if (!credential || !password) {
        showError('Harap isi semua field', loginForm);
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                credential: credential,
                password: password,
                user_type: userType
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Simpan token dan user data di localStorage
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            
            // Redirect berdasarkan user type
            if (userType === 'admin') {
                window.location.href = 'admin-dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            showError(data.message || 'Login gagal', loginForm);
        }
    } catch (error) {
        console.error('Login error:', error);
        showError('Terjadi kesalahan saat login', loginForm);
    } finally {
        hideLoading();
    }
});

// Register function
registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const fullName = formData.get('full_name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validasi
    if (!fullName || !email || !password || !confirmPassword) {
        showError('Harap isi semua field yang wajib', registerForm);
        return;
    }
    
    if (password !== confirmPassword) {
        showError('Password dan konfirmasi password tidak cocok', registerForm);
        return;
    }
    
    if (password.length < 6) {
        showError('Password minimal 6 karakter', registerForm);
        return;
    }
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                full_name: fullName,
                email: email,
                phone: phone,
                password: password
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            showSuccess('Registrasi berhasil! Silakan login.', registerForm);
            setTimeout(() => {
                registerCard.style.display = 'none';
                loginCard.style.display = 'block';
                registerForm.reset();
            }, 2000);
        } else {
            showError(data.message || 'Registrasi gagal', registerForm);
        }
    } catch (error) {
        console.error('Register error:', error);
        showError('Terjadi kesalahan saat registrasi', registerForm);
    } finally {
        hideLoading();
    }
});

// Check if user is already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        if (userData.user_type === 'admin') {
            window.location.href = 'admin-dashboard.html';
        } else {
            window.location.href = 'index.html';
        }
    }
});