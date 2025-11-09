// Auth System untuk GitHub Pages (Frontend Only)
const users = {
    'admin@marketplace.com': {
        id: 1,
        email: 'admin@marketplace.com',
        password: 'password',
        full_name: 'Administrator',
        user_type: 'admin'
    },
    'customer@example.com': {
        id: 2,
        email: 'customer@example.com',
        phone: '081234567890',
        password: 'password',
        full_name: 'John Customer',
        user_type: 'customer'
    }
};

// DOM Elements
const loginForm = document.getElementById('login-form');
const registerForm = document.getElementById('register-form');
const loginCard = document.querySelector('.login-card');
const registerCard = document.querySelector('.register-card');
const showRegisterLink = document.getElementById('show-register');
const showLoginLink = document.getElementById('show-login');

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
document.getElementById('toggle-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('login-password');
    const icon = this.querySelector('i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
});

document.getElementById('toggle-register-password').addEventListener('click', function() {
    const passwordInput = document.getElementById('register-password');
    const icon = this.querySelector('i');
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        icon.className = 'fas fa-eye';
    }
});

// Show messages
function showMessage(message, type, form) {
    const existingMsg = form.querySelector('.error-message, .success-message');
    if (existingMsg) existingMsg.remove();
    
    const msgDiv = document.createElement('div');
    msgDiv.className = type + '-message';
    msgDiv.textContent = message;
    form.insertBefore(msgDiv, form.firstChild);
    
    setTimeout(() => msgDiv.remove(), 5000);
}

// Generate simple token
function generateToken(userId) {
    return 'token-' + userId + '-' + Date.now();
}

// Login function
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(loginForm);
    const credential = formData.get('credential');
    const password = formData.get('password');
    const userType = formData.get('user_type');
    
    if (!credential || !password) {
        showMessage('Harap isi semua field', 'error', loginForm);
        return;
    }
    
    // Load stored users
    const storedUsers = JSON.parse(localStorage.getItem('marketplace_users') || '{}');
    const allUsers = { ...users, ...storedUsers };
    
    // Find user
    const user = allUsers[credential];
    
    if (!user || user.password !== password || user.user_type !== userType) {
        showMessage('Email/nomor telepon atau password salah', 'error', loginForm);
        return;
    }
    
    // Login successful
    const token = generateToken(user.id);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    // Redirect
    if (userType === 'admin') {
        window.location.href = 'admin.html';
    } else {
        window.location.href = 'index.html';
    }
});

// Register function
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const formData = new FormData(registerForm);
    const fullName = formData.get('full_name');
    const email = formData.get('email');
    const phone = formData.get('phone');
    const password = formData.get('password');
    const confirmPassword = formData.get('confirm_password');
    
    // Validation
    if (!fullName || !email || !password || !confirmPassword) {
        showMessage('Harap isi semua field yang wajib', 'error', registerForm);
        return;
    }
    
    if (password !== confirmPassword) {
        showMessage('Password tidak cocok', 'error', registerForm);
        return;
    }
    
    if (password.length < 6) {
        showMessage('Password minimal 6 karakter', 'error', registerForm);
        return;
    }
    
    // Load stored users
    const storedUsers = JSON.parse(localStorage.getItem('marketplace_users') || '{}');
    
    // Check if email exists
    if (users[email] || storedUsers[email]) {
        showMessage('Email sudah terdaftar', 'error', registerForm);
        return;
    }
    
    // Create new user
    const newUser = {
        id: Object.keys(users).length + Object.keys(storedUsers).length + 1,
        full_name: fullName,
        email: email,
        phone: phone,
        password: password,
        user_type: 'customer'
    };
    
    // Save to localStorage
    storedUsers[email] = newUser;
    localStorage.setItem('marketplace_users', JSON.stringify(storedUsers));
    
    showMessage('Registrasi berhasil! Silakan login.', 'success', registerForm);
    
    setTimeout(() => {
        registerCard.style.display = 'none';
        loginCard.style.display = 'block';
        registerForm.reset();
    }, 2000);
});

// Check if already logged in
document.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
        const userData = JSON.parse(user);
        window.location.href = userData.user_type === 'admin' ? 'admin.html' : 'index.html';
    }
});
