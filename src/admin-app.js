/**
 * Floya Store Admin - Main Entry Point
 * Modular architecture with separated concerns
 */

import { AuthService } from './services/auth.js';
import { ProductService } from './services/products.js';
import { OrderService } from './services/orders.js';
import { UI } from './components/ui.js';
import { Storage } from './utils/storage.js';
import { Validators } from './utils/validators.js';

class AdminApp {
    constructor() {
        this.authService = new AuthService();
        this.productService = new ProductService();
        this.orderService = new OrderService();
        this.ui = new UI();
        this.currentState = {
            products: [],
            orders: [],
            stats: null,
            currentPage: 'login',
            deleteTarget: null
        };
    }

    async init() {
        try {
            this.setupEventListeners();
            
            // Check if already logged in
            if (this.authService.isLoggedIn()) {
                await this.showDashboard();
            } else {
                this.showLogin();
            }

            console.log('Admin app initialized successfully');
        } catch (error) {
            console.error('Failed to initialize admin app:', error);
            this.ui.showToast('فشل تحميل التطبيق', 'error');
        }
    }

    setupEventListeners() {
        // Login form
        document.getElementById('loginForm')?.addEventListener('submit', (e) => this.handleLogin(e));
        
        // Tab navigation
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', (e) => this.handleTabChange(e));
        });

        // Product form
        document.getElementById('productForm')?.addEventListener('submit', (e) => this.handleProductSubmit(e));
        document.getElementById('cancelProductEdit')?.addEventListener('click', () => this.cancelProductEdit());

        // Logout
        document.getElementById('logoutBtn')?.addEventListener('click', () => this.handleLogout());
        
        // Password toggle
        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', (e) => this.togglePasswordVisibility(e));
        });

        // Image upload
        document.getElementById('productImageInput')?.addEventListener('change', (e) => this.handleImageUpload(e));

        // Delete confirmation modal
        document.getElementById('confirmDelete')?.addEventListener('click', () => this.confirmDelete());
        document.getElementById('cancelDelete')?.addEventListener('click', () => this.closeDeleteModal());
    }

    showLogin() {
        document.getElementById('adminLoginSection').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
        this.currentState.currentPage = 'login';
    }

    async showDashboard() {
        document.getElementById('adminLoginSection').style.display = 'none';
        document.getElementById('adminDashboard').style.display = 'block';
        this.currentState.currentPage = 'dashboard';
        
        // Load initial data
        await this.loadDashboardData();
        
        // Show products tab by default
        this.switchTab('products');
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('loginUser').value.trim();
        const password = document.getElementById('loginPass').value;

        if (!Validators.validateUsername(username)) {
            this.ui.showToast('اسم المستخدم غير صالح', 'error');
            return;
        }

        if (!password || password.length < 1) {
            this.ui.showToast('كلمة المرور مطلوبة', 'error');
            return;
        }

        try {
            const loginBtn = event.target.querySelector('button[type="submit"]');
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري التسجيل...';

            await this.authService.login(username, password);
            
            this.ui.showToast('تم تسجيل الدخول بنجاح', 'success');
            await this.showDashboard();
            
            // Reset form
            event.target.reset();
        } catch (error) {
            console.error('Login failed:', error);
            this.ui.showToast(error.message || 'فشل تسجيل الدخول', 'error');
        } finally {
            const loginBtn = event.target.querySelector('button[type="submit"]');
            loginBtn.disabled = false;
            loginBtn.innerHTML = 'تسجيل الدخول';
        }
    }

    async handleLogout() {
        if (!confirm('هل أنت متأكد من تسجيل الخروج؟')) {
            return;
        }
        
        this.authService.logout();
        this.ui.showToast('تم تسجيل الخروج', 'info');
        this.showLogin();
    }

    handleTabChange(event) {
        const tabId = event.target.dataset.tab;
        if (tabId) {
            this.switchTab(tabId);
        }
    }

    switchTab(tabId) {
        // Update tab styling
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabId);
        });

        // Update section visibility
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.toggle('active', section.id === `${tabId}Section`);
        });

        // Load data for specific tabs
        switch (tabId) {
            case 'products':
                this.loadProducts();
                break;
            case 'orders':
                this.loadOrders();
                break;
            case 'stats':
                this.loadStats();
                break;
            case 'settings':
                // Settings don't need loading
                break;
        }
    }

    async loadDashboardData() {
        await Promise.all([
            this.loadProducts(),
            this.loadOrders(),
            this.loadStats()
        ]);
    }

    async loadProducts() {
        try {
            const products = await this.productService.getAll();
            this.currentState.products = products;
            this.ui.renderProductsList(products);
        } catch (error) {
            console.error('Failed to load products:', error);
            this.ui.showToast('فشل تحميل المنتجات', 'error');
        }
    }

    async loadOrders() {
        try {
            const orders = await this.orderService.getAll();
            this.currentState.orders = orders;
            this.ui.renderOrdersList(orders);
        } catch (error) {
            console.error('Failed to load orders:', error);
            this.ui.showToast('فشل تحميل الطلبات', 'error');
        }
    }

    async loadStats() {
        try {
            const stats = await this.orderService.getStats();
            this.currentState.stats = stats;
            this.ui.renderStats(stats);
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    }

    async handleProductSubmit(event) {
        event.preventDefault();
        
        const formData = new FormData(event.target);
        const productData = {
            name: formData.get('name')?.trim(),
            description: formData.get('description')?.trim(),
            price: parseFloat(formData.get('price')),
            promoPrice: parseFloat(formData.get('promoPrice')) || null,
            category: formData.get('category')?.trim(),
            stock: parseInt(formData.get('stock')) || 0,
            image: this.currentState.currentImageBase64
        };

        // Validate
        if (!Validators.validateProductName(productData.name)) {
            this.ui.showToast('اسم المنتج مطلوب (1-200 حرف)', 'error');
            return;
        }

        if (!productData.price || isNaN(productData.price) || productData.price <= 0) {
            this.ui.showToast('السعر يجب أن يكون رقم موجب', 'error');
            return;
        }

        if (!productData.category) {
            this.ui.showToast('التصنيف مطلوب', 'error');
            return;
        }

        try {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> جاري الحفظ...';

            if (this.currentState.editingProductId) {
                await this.productService.update(this.currentState.editingProductId, productData);
                this.ui.showToast('تم تحديث المنتج', 'success');
            } else {
                await this.productService.create(productData);
                this.ui.showToast('تم إضافة المنتج', 'success');
            }

            // Reset and reload
            this.cancelProductEdit();
            await this.loadProducts();
            
        } catch (error) {
            console.error('Failed to save product:', error);
            this.ui.showToast(error.message || 'فشل حفظ المنتج', 'error');
        } finally {
            const submitBtn = event.target.querySelector('button[type="submit"]');
            submitBtn.disabled = false;
            submitBtn.innerHTML = 'حفظ';
        }
    }

    cancelProductEdit() {
        this.currentState.editingProductId = null;
        document.getElementById('productForm').reset();
        document.getElementById('productFormTitle').innerHTML = '<i class="fas fa-plus"></i> إضافة منتج جديد';
        document.getElementById('cancelProductEdit').style.display = 'none';
        this.currentState.currentImageBase64 = null;
        this.clearImagePreview();
    }

    async editProduct(productId) {
        try {
            const product = await this.productService.getById(productId);
            
            document.getElementById('editProductName').value = product.name;
            document.getElementById('editProductDescription').value = product.description || '';
            document.getElementById('editProductPrice').value = product.price;
            document.getElementById('editProductPromoPrice').value = product.promo_price || '';
            document.getElementById('editProductCategory').value = product.category;
            document.getElementById('editProductStock').value = product.stock || 0;
            
            if (product.image) {
                this.currentState.currentImageBase64 = product.image;
                this.showImagePreview(product.image);
            }

            document.getElementById('productFormTitle').innerHTML = '<i class="fas fa-edit"></i> تعديل المنتج';
            document.getElementById('cancelProductEdit').style.display = 'inline-block';
            this.currentState.editingProductId = productId;

            // Switch to product form section
            this.switchTab('products');
            
        } catch (error) {
            console.error('Failed to load product for edit:', error);
            this.ui.showToast('فشل تحميل بيانات المنتج', 'error');
        }
    }

    async deleteProduct(productId) {
        this.currentState.deleteTarget = { type: 'product', id: productId };
        document.getElementById('deleteModalTitle').textContent = 'تأكيد حذف المنتج';
        document.getElementById('deleteModalMessage').textContent = 'هل أنت متأكد من حذف هذا المنتج؟ لا يمكن التراجع عن هذا الإجراء.';
        this.ui.openModal('deleteModal');
    }

    async deleteOrder(orderId) {
        this.currentState.deleteTarget = { type: 'order', id: orderId };
        document.getElementById('deleteModalTitle').textContent = 'تأكيد حذف الطلب';
        document.getElementById('deleteModalMessage').textContent = 'هل أنت متأكد من حذف هذا الطلب؟';
        this.ui.openModal('deleteModal');
    }

    async confirmDelete() {
        const { type, id } = this.currentState.deleteTarget;
        
        try {
            if (type === 'product') {
                await this.productService.delete(id);
                this.ui.showToast('تم حذف المنتج', 'success');
                await this.loadProducts();
            } else if (type === 'order') {
                await this.orderService.delete(id);
                this.ui.showToast('تم حذف الطلب', 'success');
                await this.loadOrders();
            }
            
            this.ui.closeModal('deleteModal');
        } catch (error) {
            console.error('Failed to delete:', error);
            this.ui.showToast('فشل الحذف', 'error');
        }
    }

    closeDeleteModal() {
        this.ui.closeModal('deleteModal');
        this.currentState.deleteTarget = null;
    }

    handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            this.ui.showToast('يرجى اختيار ملف صورة', 'error');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.ui.showToast('حجم الصورة يجب أن لا يتجاوز 5 ميجابايت', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            this.currentState.currentImageBase64 = e.target.result;
            this.showImagePreview(e.target.result);
        };
        reader.onerror = () => {
            this.ui.showToast('فشل قراءة الصورة', 'error');
        };
        reader.readAsDataURL(file);
    }

    showImagePreview(src) {
        const uploadArea = document.getElementById('productImageUpload');
        uploadArea.classList.add('has-image');
        
        let preview = uploadArea.querySelector('.upload-preview');
        if (!preview) {
            preview = document.createElement('img');
            preview.className = 'upload-preview';
            preview.alt = 'معاينة الصورة';
            
            const removeBtn = document.createElement('button');
            removeBtn.className = 'remove-image';
            removeBtn.innerHTML = '<i class="fas fa-times"></i>';
            removeBtn.onclick = (e) => {
                e.preventDefault();
                this.clearImagePreview();
            };
            
            uploadArea.appendChild(preview);
            uploadArea.appendChild(removeBtn);
        }
        
        preview.src = src;
    }

    clearImagePreview() {
        const uploadArea = document.getElementById('productImageUpload');
        uploadArea.classList.remove('has-image');
        const preview = uploadArea.querySelector('.upload-preview');
        const removeBtn = uploadArea.querySelector('.remove-image');
        if (preview) preview.remove();
        if (removeBtn) removeBtn.remove();
        this.currentState.currentImageBase64 = null;
        document.getElementById('productImageInput').value = '';
    }

    togglePasswordVisibility(event) {
        const input = event.target.parentElement.querySelector('input');
        const icon = event.target.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('fa-eye');
            icon.classList.add('fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('fa-eye-slash');
            icon.classList.add('fa-eye');
        }
    }

    async updateOrderStatus(orderId, newStatus) {
        try {
            await this.orderService.updateStatus(orderId, newStatus);
            this.ui.showToast('تم تحديث حالة الطلب', 'success');
            await this.loadOrders();
        } catch (error) {
            console.error('Failed to update order status:', error);
            this.ui.showToast('فشل تحديث الحالة', 'error');
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.adminApp = new AdminApp();
    window.adminApp.init();
});

export { AdminApp };
