// Floya Store - Backend API Client
// Connects to the Express backend API

(function() {
    'use strict';

    const API_BASE_URL = window.location.origin;
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    // CSRF Token for additional security
    let csrfToken = null;

    function getCSRFToken() {
        return csrfToken || document.querySelector('meta[name="csrf-token"]')?.content || '';
    }

    async function fetchCSRFToken() {
        try {
            const data = await fetchAPI('/api/csrf-token');
            csrfToken = data.csrfToken;
            return csrfToken;
        } catch (err) {
            console.error('Failed to fetch CSRF token:', err);
            return null;
        }
    }

    // Helper function for making API requests with retry logic
    async function fetchAPI(endpoint, options = {}, retryCount = 0) {
        const url = `${API_BASE_URL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
                ...options.headers
            },
            credentials: 'same-origin',
            ...options
        };

        // Add auth token if available
        const token = localStorage.getItem('floya_token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add CSRF token for non-GET requests
        if (options.method && options.method !== 'GET') {
            const csrfToken = getCSRFToken();
            if (csrfToken) {
                config.headers['X-CSRF-Token'] = csrfToken;
            }
        }

        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);

            // Handle specific status codes
            if (response.status === 401) {
                // Token expired or invalid, clear storage and redirect to login
                localStorage.removeItem('floya_token');
                localStorage.removeItem('floya_user');
                window.location.href = '/admin';
                return Promise.reject(new Error('Session expired'));
            }

            if (response.status === 429) {
                // Rate limited
                return Promise.reject(new Error('Too many requests. Please try again later.'));
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `Request failed with status ${response.status}`);
            }

            return data;
        } catch (error) {
            // Retry logic for network errors
            if (retryCount < MAX_RETRIES && (error.name === 'TypeError' || error.message.includes('fetch'))) {
                await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)));
                return fetchAPI(endpoint, options, retryCount + 1);
            }

            console.error('API Error:', error);
            throw error;
        }
    }

    // Validate email-like usernames
    function isValidUsername(username) {
        return typeof username === 'string' &&
               username.length >= 1 &&
               username.length <= 100 &&
               /^[a-zA-Z0-9_-]+$/.test(username);
    }

    // Validate password strength
    function validatePassword(password) {
        if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
            return { valid: false, message: 'Password must be 8-100 characters' };
        }
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasUpper || !hasLower || !hasNumber) {
            return { valid: false, message: 'Password must contain uppercase, lowercase, and numbers' };
        }

        return { valid: true };
    }

    window.api = {
        // Products API
        getProducts: async function() {
            return await fetchAPI('/api/products');
        },

        getProduct: async function(productId) {
            if (!productId || typeof productId !== 'string') {
                throw new Error('Invalid product ID');
            }
            return await fetchAPI(`/api/products/${encodeURIComponent(productId)}`);
        },

        createProduct: async function(productData) {
            if (!productData || typeof productData !== 'object') {
                throw new Error('Invalid product data');
            }
            if (!productData.name || !productData.price || !productData.category) {
                throw new Error('Name, price, and category are required');
            }
            return await fetchAPI('/api/products', {
                method: 'POST',
                body: productData
            });
        },

        updateProduct: async function(productId, productData) {
            if (!productId || typeof productId !== 'string') {
                throw new Error('Invalid product ID');
            }
            if (!productData || typeof productData !== 'object') {
                throw new Error('Invalid product data');
            }
            return await fetchAPI(`/api/products/${encodeURIComponent(productId)}`, {
                method: 'PUT',
                body: productData
            });
        },

        deleteProduct: async function(productId) {
            if (!productId || typeof productId !== 'string') {
                throw new Error('Invalid product ID');
            }
            return await fetchAPI(`/api/products/${encodeURIComponent(productId)}`, {
                method: 'DELETE'
            });
        },

        // Orders API
        getOrders: async function(filters = {}) {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.limit) params.append('limit', String(filters.limit));
            if (filters.offset) params.append('offset', String(filters.offset));

            const queryString = params.toString();
            return await fetchAPI(`/api/orders${queryString ? '?' + queryString : ''}`);
        },

        getOrder: async function(orderId) {
            if (!orderId || typeof orderId !== 'string') {
                throw new Error('Invalid order ID');
            }
            return await fetchAPI(`/api/orders/${encodeURIComponent(orderId)}`);
        },

        createOrder: async function(orderData) {
            if (!orderData || typeof orderData !== 'object') {
                throw new Error('Invalid order data');
            }
            if (!orderData.productId || !orderData.customerName || !orderData.customerState || !orderData.customerPhone) {
                throw new Error('Product, customer name, state, and phone are required');
            }

            // Client-side phone validation
            const phone = orderData.customerPhone.replace(/\s/g, '');
            if (!/^(0[5-7])[0-9]{8}$/.test(phone)) {
                throw new Error('Invalid phone number format. Use 05, 06, or 07 followed by 8 digits');
            }

            return await fetchAPI('/api/orders', {
                method: 'POST',
                body: orderData
            });
        },

        updateOrderStatus: async function(orderId, newStatus) {
            if (!orderId || typeof orderId !== 'string') {
                throw new Error('Invalid order ID');
            }
            const validStatuses = ['جديد', 'قيد المعالجة', 'تم الشحن', 'تم التسليم', 'ملغي'];
            if (!validStatuses.includes(newStatus)) {
                throw new Error('Invalid status');
            }
            return await fetchAPI(`/api/orders/${encodeURIComponent(orderId)}/status`, {
                method: 'PATCH',
                body: { status: newStatus }
            });
        },

        deleteOrder: async function(orderId) {
            if (!orderId || typeof orderId !== 'string') {
                throw new Error('Invalid order ID');
            }
            return await fetchAPI(`/api/orders/${encodeURIComponent(orderId)}`, {
                method: 'DELETE'
            });
        },

        // Stats API (Admin)
        getOrderStats: async function() {
            return await fetchAPI('/api/orders/stats');
        },

        // Auth API
        login: async function(username, password) {
            console.log('Login attempt:', { username, passwordLength: password?.length });
            if (!isValidUsername(username)) {
                console.error('Username validation failed:', username);
                throw new Error('Invalid username format');
            }
            if (!password || typeof password !== 'string' || password.length < 1) {
                console.error('Password validation failed');
                throw new Error('Password is required');
            }

            try {
            const data = await fetchAPI('/api/auth/login', {
                method: 'POST',
                body: { username, password }
            });

            if (data.token) {
                localStorage.setItem('floya_token', data.token);
                localStorage.setItem('floya_user', JSON.stringify(data.user));
                // Fetch CSRF token after successful login
                await fetchCSRFToken();
            }

            return data;
            } catch (err) {
                console.error('Login API error:', err.message);
                throw err;
            }
        },

        logout: function() {
            localStorage.removeItem('floya_token');
            localStorage.removeItem('floya_user');
            csrfToken = null; // Clear CSRF token
            window.location.href = '/admin';
        },

        // Fetch CSRF token from server
        refreshCSRFToken: fetchCSRFToken,

        getProfile: async function() {
            return await fetchAPI('/api/auth/profile');
        },

        changePassword: async function(currentPassword, newPassword) {
            if (!currentPassword || !newPassword) {
                throw new Error('Current and new password are required');
            }

            const validation = validatePassword(newPassword);
            if (!validation.valid) {
                throw new Error(validation.message);
            }

            // Fetch fresh CSRF token before password change
            await fetchCSRFToken();

            const data = await fetchAPI('/api/auth/change-password', {
                method: 'POST',
                body: { currentPassword, newPassword }
            });

            // Clear token after password change
            localStorage.removeItem('floya_token');
            localStorage.removeItem('floya_user');

            return data;
        },

        // Token helpers
        getToken: function() {
            return localStorage.getItem('floya_token');
        },

        isLoggedIn: function() {
            return !!localStorage.getItem('floya_token');
        },

        getUser: function() {
            const user = localStorage.getItem('floya_user');
            try {
                return user ? JSON.parse(user) : null;
            } catch (e) {
                return null;
            }
        },

        // Security helpers
        validatePassword: validatePassword,
        isValidUsername: isValidUsername
    };

    // Security: Clear sensitive data on page unload
    window.addEventListener('beforeunload', () => {
        // Clear any in-memory sensitive data if needed
    });

    console.log('Floya Store API client loaded');
    console.log('API Base URL:', API_BASE_URL);
})();
