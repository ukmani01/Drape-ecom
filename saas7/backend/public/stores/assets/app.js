// =============================================================
// 🔥 FINAL VERSION – Cart with Cache-Busting & Authorization
// =============================================================

const CONFIG = window.__STORE_CONFIG__ || { 
  storeSlug: '', 
  storeId: '', 
  apiBase: '/api', 
  currency: 'INR' 
};

console.log('🔧 [CONFIG] Initial CONFIG:', CONFIG);

// =============================================================
// GUARD: Fallback if CONFIG is empty
// =============================================================
if (!CONFIG.storeSlug) {
  console.warn('⚠️ [GUARD] CONFIG.storeSlug is empty! Trying to recover...');
  
  if (window.__STORE_CONFIG__ && window.__STORE_CONFIG__.storeSlug) {
    CONFIG.storeSlug = window.__STORE_CONFIG__.storeSlug;
    CONFIG.storeId = window.__STORE_CONFIG__.storeId;
    CONFIG.apiBase = window.__STORE_CONFIG__.apiBase || '/api';
    CONFIG.currency = window.__STORE_CONFIG__.currency || 'INR';
    console.log('✅ [GUARD] Fixed storeSlug:', CONFIG.storeSlug);
  } else {
    console.warn('⚠️ [GUARD] No store config found.');
  }
} else {
  console.log('✅ [GUARD] Store config loaded:', CONFIG.storeSlug);
}

// =============================================================
// ✅ FIXED: CART COUNT (Cache-Busting + Token)
// =============================================================
async function getCartCount() {
  if (!CONFIG.storeSlug) {
    console.warn('⚠️ [getCartCount] storeSlug missing');
    return 0;
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    // ✅ 🔥 FIX: Add cache-busting parameter!
    const url = `${CONFIG.apiBase}/public/cart/count?storeSlug=${CONFIG.storeSlug}&_=${Date.now()}`;
    const res = await fetch(url, { headers });

    if (res.ok) {
      const data = await res.json();
      return data.count || 0;
    }
    return 0;
  } catch {
    return 0;
  }
}

// =============================================================
// ADD TO CART
// =============================================================
async function addToCart(productId, quantity = 1) {
  if (!CONFIG.storeSlug) {
    console.warn('⚠️ [addToCart] storeSlug missing');
    return { success: false, error: 'Store configuration missing' };
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${CONFIG.apiBase}/public/cart`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ productId, quantity, storeSlug: CONFIG.storeSlug })
    });

    if (res.ok) {
      const data = await res.json();
      const count = data.data?.items?.length || 0;
      updateCartUI(count);
      showToast('✅ Product added to cart!', 'success');
      return { success: true, data };
    }
    const err = await res.json();
    if (res.status === 401) {
      showToast('❌ Please login to add items to cart.', 'error');
    } else {
      showToast('❌ ' + (err.message || 'Failed to add to cart'), 'error');
    }
    return { success: false, error: err.message };
  } catch (err) {
    showToast('❌ Error adding to cart.', 'error');
    return { success: false, error: err.message };
  }
}

// =============================================================
// GET CART
// =============================================================
async function getCart() {
  if (!CONFIG.storeSlug) {
    console.warn('⚠️ [getCart] storeSlug missing');
    return { success: true, data: { items: [] } };
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    // Also add cache-busting here for good measure
    const url = `${CONFIG.apiBase}/public/cart?storeSlug=${CONFIG.storeSlug}&_=${Date.now()}`;
    const res = await fetch(url, { headers });

    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return { success: false, data: { items: [] } };
  } catch {
    return { success: false, data: { items: [] } };
  }
}

// =============================================================
// UPDATE CART ITEM
// =============================================================
async function updateCartItem(productId, quantity) {
  if (!CONFIG.storeSlug) {
    return { success: false };
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${CONFIG.apiBase}/public/cart`, {
      method: 'PUT',
      headers,
      body: JSON.stringify({ productId, quantity, storeSlug: CONFIG.storeSlug })
    });

    if (res.ok) {
      const data = await res.json();
      const count = data.data?.items?.length || 0;
      updateCartUI(count);
      return { success: true, data };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

// =============================================================
// REMOVE FROM CART
// =============================================================
async function removeFromCart(productId) {
  if (!CONFIG.storeSlug) {
    return { success: false };
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${CONFIG.apiBase}/public/cart/${productId}?storeSlug=${CONFIG.storeSlug}&_=${Date.now()}`, {
      method: 'DELETE',
      headers
    });

    if (res.ok) {
      const data = await res.json();
      const count = data.data?.items?.length || 0;
      updateCartUI(count);
      return { success: true, data };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

// =============================================================
// CLEAR CART
// =============================================================
async function clearCart() {
  if (!CONFIG.storeSlug) {
    return { success: false };
  }

  try {
    const token = localStorage.getItem('accessToken');
    const headers = {};
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${CONFIG.apiBase}/public/cart?storeSlug=${CONFIG.storeSlug}&_=${Date.now()}`, {
      method: 'DELETE',
      headers
    });

    if (res.ok) {
      updateCartUI(0);
      return { success: true };
    }
    return { success: false };
  } catch {
    return { success: false };
  }
}

// =============================================================
// UPDATE CART UI BADGE (Desktop + Mobile)
// =============================================================
function updateCartUI(count) {
  const el = document.getElementById('cart-count');
  if (el) {
    el.textContent = count;
  }
  const mobileEl = document.getElementById('mobile-cart-count');
  if (mobileEl) {
    mobileEl.textContent = count;
  }
  console.log('✅ Cart count updated to:', count);
}

// =============================================================
// AUTH FUNCTIONS
// =============================================================
function isLoggedIn() {
  return !!localStorage.getItem('accessToken');
}

async function getCurrentUser() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return null;
    const res = await fetch(`${CONFIG.apiBase}/auth/me`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const data = await res.json();
      return data.data?.user || null;
    }
    return null;
  } catch {
    return null;
  }
}

async function login(email, password) {
  try {
    const res = await fetch(`${CONFIG.apiBase}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem('accessToken', data.data.token);
      localStorage.setItem('refreshToken', data.data.refreshToken);
      updateAuthUI();
      showToast('✅ Login successful!', 'success');
      return { success: true, data };
    }
    const err = await res.json();
    showToast('❌ Login failed: ' + (err.message || 'Invalid credentials'), 'error');
    return { success: false, error: err.message };
  } catch (err) {
    showToast('❌ Error: ' + err.message, 'error');
    return { success: false, error: err.message };
  }
}

function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  updateAuthUI();
  showToast('✅ Logged out', 'success');
  window.location.reload();
}

function updateAuthUI() {
  const token = localStorage.getItem('accessToken');
  const container = document.getElementById('auth-buttons');
  const mobileContainer = document.getElementById('mobile-auth-buttons');

  const authHTML = token
    ? `
      <a href="/stores/${CONFIG.storeSlug}/orders.html">My Orders</a>
      <a href="#" onclick="logout(); return false;">Logout</a>
    `
    : `
      <a href="/stores/${CONFIG.storeSlug}/login.html">Login</a>
      <a href="/stores/${CONFIG.storeSlug}/register.html">Register</a>
    `;

  const mobileAuthHTML = token
    ? `
      <a href="/stores/${CONFIG.storeSlug}/orders.html" class="mobile-btn-outline">My Orders</a>
      <button onclick="logout(); return false;" class="mobile-btn-primary" style="cursor:pointer;border:none;">Logout</button>
    `
    : `
      <a href="/stores/${CONFIG.storeSlug}/login.html" class="mobile-btn-outline">Login</a>
      <a href="/stores/${CONFIG.storeSlug}/register.html" class="mobile-btn-primary">Register</a>
    `;

  if (container) container.innerHTML = authHTML;
  if (mobileContainer) mobileContainer.innerHTML = mobileAuthHTML;
}

// =============================================================
// ✅ MOBILE MENU CONTROLLER
// =============================================================
function initMobileMenu() {
  const toggleBtn = document.getElementById('mobile-menu-toggle');
  const closeBtn = document.getElementById('mobile-nav-close');
  const overlay = document.getElementById('mobile-nav-overlay');

  if (!overlay) return;

  const openMenu = () => {
    overlay.classList.add('is-open');
    document.body.classList.add('menu-open');
  };

  const closeMenu = () => {
    overlay.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  if (toggleBtn) {
    toggleBtn.addEventListener('click', openMenu);
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeMenu);
  }

  // Auto-close on clicking any nav link
  overlay.querySelectorAll('.mobile-nav-link').forEach((link) => {
    link.addEventListener('click', closeMenu);
  });
}

// =============================================================
// ✅ PLACE ORDER (UPDATED – Clears Badge on Success)
// =============================================================
async function placeOrder(orderData) {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = 'Bearer ' + token;

    const res = await fetch(`${CONFIG.apiBase}/public/orders`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ ...orderData, storeSlug: CONFIG.storeSlug })
    });

    if (res.ok) {
      const data = await res.json();

      updateCartUI(0);
      localStorage.removeItem('cartItems');

      showToast('✅ Order placed successfully!', 'success');
      window.location.href = `/stores/${CONFIG.storeSlug}/order-confirmation.html?orderId=${data.data?.orderId || data.orderId}`;
      return { success: true, data };
    } else {
      const err = await res.json();
      showToast('❌ Failed: ' + (err.message || 'Please try again'), 'error');
      return { success: false, error: err.message };
    }
  } catch (err) {
    showToast('❌ Error placing order.', 'error');
    return { success: false, error: err.message };
  }
}

// =============================================================
// GET ORDERS
// =============================================================
async function getOrders() {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) return { orders: [] };
    const res = await fetch(`${CONFIG.apiBase}/public/orders?storeSlug=${CONFIG.storeSlug}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    if (res.ok) {
      const data = await res.json();
      return data;
    }
    return { orders: [] };
  } catch {
    return { orders: [] };
  }
}

// =============================================================
// ✅ TOAST FUNCTION
// =============================================================
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    padding: 14px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 10000;
    max-width: 360px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    animation: slideIn 0.3s ease;
  `;
  toast.style.background = type === 'success' ? '#10b981' : '#ef4444';
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `@keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }`;
document.head.appendChild(style);

// =============================================================
// ✅ INITIALIZATION
// =============================================================
document.addEventListener('DOMContentLoaded', async () => {
  console.log('🚀 ===== APP.JS INITIALIZING =====');
  console.log('📦 CONFIG:', CONFIG);

  initMobileMenu();

  const count = await getCartCount();
  updateCartUI(count);
  updateAuthUI();

  console.log('✅ ===== APP.JS INITIALIZED =====');
});

// =============================================================
// EXPOSE TO GLOBAL
// =============================================================
window.Storefront = {
  CONFIG,
  addToCart,
  getCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  login,
  logout,
  isLoggedIn,
  getCurrentUser,
  placeOrder,
  getOrders,
  updateAuthUI,
  showToast
};

console.log('✅ Storefront API exposed');
console.log('🚀 ===== APP.JS FINAL VERSION LOADED =====');        