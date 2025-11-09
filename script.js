    // State aplikasi
let cart = [];
let currentStore = null;
let currentChatStore = null;
let currentView = 'stores';

// DOM Elements
const contentContainer = document.getElementById('content-container');
const mainHeader = document.getElementById('main-header');
const cartModal = document.getElementById('cart-modal');
const chatModal = document.getElementById('chat-modal');
const paymentModal = document.getElementById('payment-modal');

// Format Rupiah
function formatRupiah(amount) {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(amount);
}

// ==================== RENDER FUNCTIONS ====================

// Render toko (menu utama)
function renderStores() {
    currentView = 'stores';
    
    mainHeader.innerHTML = `
        <h2 class="page-title">Daftar Toko</h2>
        <p class="page-subtitle">Pilih toko untuk melihat produk yang dijual</p>
    `;
    
    contentContainer.innerHTML = `
        <div class="stores-container">
            ${storesData.map(store => `
                <div class="store-card" data-store-id="${store.id}">
                    <div class="store-profile">
                        <div class="store-avatar">
                            <img src="${store.profilePic}" alt="${store.name}">
                        </div>
                        <div class="store-info">
                            <h3>${store.name}</h3>
                            <p class="store-seller">Penjual: ${store.seller}</p>
                            <p class="store-products">${store.products.length} produk tersedia</p>
                        </div>
                        <div class="store-actions">
                            <button class="btn-chat" data-store-id="${store.id}">
                                <i class="fas fa-comments"></i> Chat
                            </button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Event listeners untuk toko
    attachStoreEventListeners();
}

// Attach event listeners untuk toko
function attachStoreEventListeners() {
    // Klik toko
    document.querySelectorAll('.store-card').forEach(card => {
        card.addEventListener('click', (e) => {
            if (!e.target.closest('.btn-chat')) {
                const storeId = parseInt(e.currentTarget.dataset.storeId);
                showStoreProducts(storeId);
            }
        });
    });
    
    // Tombol chat
    document.querySelectorAll('.btn-chat').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const storeId = parseInt(e.target.closest('.btn-chat').dataset.storeId);
            openChat(storeId);
        });
    });
}

// Tampilkan produk dari toko
function showStoreProducts(storeId) {
    const store = storesData.find(s => s.id === storeId);
    currentStore = store;
    currentView = 'products';
    
    mainHeader.innerHTML = `
        <div class="store-header-detail">
            <button class="btn-back" id="back-to-stores">
                <i class="fas fa-arrow-left"></i> Kembali ke Daftar Toko
            </button>
            <div class="store-info-detail">
                <div class="store-avatar">
                    <img src="${store.profilePic}" alt="${store.name}">
                </div>
                <div>
                    <h2>${store.name}</h2>
                    <p>Penjual: ${store.seller}</p>
                </div>
            </div>
            <button class="btn-chat" data-store-id="${store.id}">
                <i class="fas fa-comments"></i> Chat Penjual
            </button>
        </div>
    `;
    
    contentContainer.innerHTML = `
        <div class="products-container">
            ${store.products.map(product => `
                <div class="product-card">
                    <div class="product-info">
                        <h4>${product.name}</h4>
                        <p class="product-stock">
                            <i class="fas fa-box"></i> Stok: ${product.stock}
                        </p>
                        <div class="product-price">${formatRupiah(product.price)}</div>
                    </div>
                    <div class="product-actions">
                        <div class="quantity-controls">
                            <button class="quantity-btn minus" data-product-id="${product.id}" data-store-id="${store.id}">
                                <i class="fas fa-minus"></i>
                            </button>
                            <span class="quantity" id="quantity-${product.id}">0</span>
                            <button class="quantity-btn plus" data-product-id="${product.id}" data-store-id="${store.id}">
                                <i class="fas fa-plus"></i>
                            </button>
                        </div>
                        <button class="btn-add" data-product-id="${product.id}" data-store-id="${store.id}">
                            <i class="fas fa-cart-plus"></i> Tambah
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
    
    // Event listeners untuk halaman produk
    attachProductEventListeners(storeId);
}

// Attach event listeners untuk produk
function attachProductEventListeners(storeId) {
    // Tombol kembali
    document.getElementById('back-to-stores').addEventListener('click', renderStores);
    
    // Tombol chat
    document.querySelector('.btn-chat').addEventListener('click', () => {
        openChat(storeId);
    });
    
    // Tombol tambah ke keranjang
    document.querySelectorAll('.btn-add').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.btn-add').dataset.productId);
            const storeId = parseInt(e.target.closest('.btn-add').dataset.storeId);
            addToCart(productId, storeId, 1);
        });
    });
    
    // Tombol plus quantity
    document.querySelectorAll('.plus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.plus').dataset.productId);
            const storeId = parseInt(e.target.closest('.plus').dataset.storeId);
            updateQuantity(productId, storeId, 1);
        });
    });
    
    // Tombol minus quantity
    document.querySelectorAll('.minus').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const productId = parseInt(e.target.closest('.minus').dataset.productId);
            const storeId = parseInt(e.target.closest('.minus').dataset.storeId);
            updateQuantity(productId, storeId, -1);
        });
    });
}

// ==================== CART FUNCTIONS ====================

// Tambah ke keranjang
function addToCart(productId, storeId, quantity) {
    const store = storesData.find(s => s.id === storeId);
    const product = store.products.find(p => p.id === productId);
    
    // Cek apakah produk sudah ada di keranjang
    const existingItem = cart.find(item => item.productId === productId && item.storeId === storeId);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            productId,
            storeId,
            name: product.name,
            price: product.price,
            quantity,
            storeName: store.name
        });
    }
    
    updateCartDisplay();
    updateQuantityDisplay(productId, quantity);
}

// Update kuantitas produk
function updateQuantity(productId, storeId, change) {
    const existingItem = cart.find(item => item.productId === productId && item.storeId === storeId);
    
    if (existingItem) {
        existingItem.quantity += change;
        
        if (existingItem.quantity <= 0) {
            cart = cart.filter(item => !(item.productId === productId && item.storeId === storeId));
        }
        
        updateCartDisplay();
        updateQuantityDisplay(productId, change);
    }
}

// Update tampilan kuantitas di produk
function updateQuantityDisplay(productId, change) {
    const quantityElement = document.getElementById(`quantity-${productId}`);
    if (quantityElement) {
        let currentQuantity = parseInt(quantityElement.textContent) || 0;
        currentQuantity += change;
        quantityElement.textContent = Math.max(0, currentQuantity);
    }
}

// Update tampilan keranjang
function updateCartDisplay() {
    // Update jumlah item di keranjang
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cart-count').textContent = totalItems;
    
    // Update item di modal keranjang
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        cartItems.innerHTML = '';
        
        if (cart.length === 0) {
            cartItems.innerHTML = '<p style="text-align: center; color: #747d8c; padding: 40px 0;">Keranjang belanja kosong</p>';
            document.getElementById('total-amount').textContent = '0';
            return;
        }
        
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <div class="cart-item-store">${item.storeName}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)} x ${item.quantity}</div>
                </div>
                <div class="cart-item-controls">
                    <button class="quantity-btn minus-cart" data-index="${index}">
                        <i class="fas fa-minus"></i>
                    </button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn plus-cart" data-index="${index}">
                        <i class="fas fa-plus"></i>
                    </button>
                    <button class="quantity-btn remove-cart" data-index="${index}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            cartItems.appendChild(cartItem);
        });
        
        // Hitung total
        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        document.getElementById('total-amount').textContent = formatRupiah(total).replace('Rp', '').trim();
        
        // Event listeners untuk tombol di keranjang
        attachCartEventListeners();
    }
}

// Attach event listeners untuk cart items
function attachCartEventListeners() {
    // Tombol minus di cart
    document.querySelectorAll('.minus-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.minus-cart').dataset.index);
            const item = cart[index];
            updateQuantity(item.productId, item.storeId, -1);
        });
    });
    
    // Tombol plus di cart
    document.querySelectorAll('.plus-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.plus-cart').dataset.index);
            const item = cart[index];
            updateQuantity(item.productId, item.storeId, 1);
        });
    });
    
    // Tombol hapus di cart
    document.querySelectorAll('.remove-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const index = parseInt(e.target.closest('.remove-cart').dataset.index);
            const item = cart[index];
            
            // Reset quantity display
            const quantityElement = document.getElementById(`quantity-${item.productId}`);
            if (quantityElement) {
                quantityElement.textContent = '0';
            }
            
            // Hapus dari keranjang
            cart.splice(index, 1);
            updateCartDisplay();
        });
    });
}

// ==================== MODAL FUNCTIONS ====================

// Buka modal keranjang
function openCartModal() {
    cartModal.style.display = 'block';
}

// Tutup modal
function closeModal(modal) {
    modal.style.display = 'none';
}

// Buka modal chat
function openChat(storeId) {
    currentChatStore = storesData.find(store => store.id === storeId);
    const chatMessages = document.getElementById('chat-messages');
    chatMessages.innerHTML = '';
    
    // Tambahkan pesan selamat datang
    addMessage(`Halo! Selamat datang di ${currentChatStore.name}. Ada yang bisa saya bantu?`, 'seller');
    
    chatModal.style.display = 'block';
}

// Tambah pesan ke chat
function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    document.getElementById('chat-messages').appendChild(messageDiv);
    document.getElementById('chat-messages').scrollTop = document.getElementById('chat-messages').scrollHeight;
}

// Kirim pesan chat
function sendMessage() {
    const chatInput = document.getElementById('chat-input');
    const message = chatInput.value.trim();
    
    if (message) {
        addMessage(message, 'user');
        chatInput.value = '';
        
        // Simulasi balasan penjual
        setTimeout(() => {
            const responses = [
                'Jika anda ingin menghubungi penjual, silakan hubungi ke nomor ini: 081383065203',
            ];
            const randomResponse = responses[Math.floor(Math.random() * responses.length)];
            addMessage(randomResponse, 'seller');
        }, 1000);
    }
}

// Checkout process
function checkout() {
    if (cart.length === 0) {
        alert('Keranjang belanja kosong!');
        return;
    }
    
    cartModal.style.display = 'none';
    showPaymentModal();
}

// Tampilkan modal pembayaran
function showPaymentModal() {
    const paymentItems = document.getElementById('payment-items');
    const paymentTotal = document.getElementById('payment-total');
    
    // Update payment items
    paymentItems.innerHTML = '';
    cart.forEach(item => {
        const paymentItem = document.createElement('div');
        paymentItem.className = 'payment-item';
        paymentItem.innerHTML = `
            <div>${item.name} (${item.storeName})</div>
            <div>${formatRupiah(item.price * item.quantity)}</div>
        `;
        paymentItems.appendChild(paymentItem);
    });
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    paymentTotal.textContent = formatRupiah(total).replace('Rp', '').trim();
    
    paymentModal.style.display = 'block';
}

// Proses pembayaran
function confirmPayment() {
    alert('Pembayaran berhasil! Struk akan diunduh.');
    downloadReceipt();
    
    // Reset keranjang
    cart = [];
    updateCartDisplay();
    
    // Reset quantity display
    document.querySelectorAll('[id^="quantity-"]').forEach(el => {
        el.textContent = '0';
    });
    
    paymentModal.style.display = 'none';
}

// ==================== RECEIPT FUNCTIONS ====================

// Generate struk pembayaran
function generateReceipt() {
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const date = new Date().toLocaleString('id-ID');
    const receiptNumber = 'INV-' + Date.now();
    
    let receiptContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Struk Pembayaran</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .receipt { max-width: 400px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
                .header { text-align: center; margin-bottom: 20px; }
                .store-name { font-size: 18px; font-weight: bold; }
                .receipt-info { margin-bottom: 15px; }
                .items { margin-bottom: 15px; }
                .item { display: flex; justify-content: space-between; margin-bottom: 5px; }
                .total { border-top: 1px solid #000; padding-top: 10px; font-weight: bold; }
                .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            </style>
        </head>
        <body>
            <div class="receipt">
                <div class="header">
                    <div class="store-name">Marketplace 5 Toko</div>
                    <div>Struk Pembayaran</div>
                </div>
                <div class="receipt-info">
                    <div>No: ${receiptNumber}</div>
                    <div>Tanggal: ${date}</div>
                </div>
                <div class="items">
    `;
    
    cart.forEach(item => {
        receiptContent += `
            <div class="item">
                <div>${item.name} (${item.storeName})</div>
                <div>${formatRupiah(item.price)} x ${item.quantity}</div>
            </div>
        `;
    });
    
    receiptContent += `
                </div>
                <div class="total">
                    <div class="item">
                        <div>Total:</div>
                        <div>${formatRupiah(total)}</div>
                    </div>
                </div>
                <div class="footer">
                    Terima kasih atas pembelian Anda!
                </div>
            </div>
        </body>
        </html>
    `;
    
    return receiptContent;
}

// Download struk
function downloadReceipt() {
    const receiptContent = generateReceipt();
    const blob = new Blob([receiptContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `struk-pembayaran-${Date.now()}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// ==================== AUTH FUNCTIONS ====================

// Logout
function logout() {
    if (confirm('Apakah Anda yakin ingin logout?')) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = 'login.html';
    }
}

// ==================== INITIALIZATION ====================

// Initialize aplikasi
function initializeMarketplace() {
    renderStores();
    updateCartDisplay();
}

// Event listeners untuk modal dan interaksi global
function setupGlobalEventListeners() {
    // Cart button
    document.getElementById('cart-btn').addEventListener('click', openCartModal);
    
    // Close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });
    
    // Close modal when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal(this);
            }
        });
    });
    
    // Checkout button
    document.getElementById('checkout-btn').addEventListener('click', checkout);
    
    // Confirm payment button
    document.getElementById('confirm-payment').addEventListener('click', confirmPayment);
    
    // Chat send button
    document.getElementById('send-btn').addEventListener('click', sendMessage);
    
    // Chat input enter key
    document.getElementById('chat-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// Main initialization - MODIFIED FOR GITHUB PAGES
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication - SIMPLE VERSION
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
        window.location.href = 'login.html';
        return;
    }
    
    // Update user info
    const userData = JSON.parse(user);
    const userName = document.getElementById('user-name');
    if (userData && userName) {
        const firstName = userData.full_name.split(' ')[0];
        userName.textContent = `Halo, ${firstName}`;
    }
    
    // Redirect admin to admin page
    if (userData.user_type === 'admin') {
        window.location.href = 'admin.html';
        return;
    }
    
    // Setup semua event listeners
    setupGlobalEventListeners();
    
    // Initialize marketplace
    initializeMarketplace();
});
