/**
 * UI Component Manager
 * Handles rendering and UI interactions
 */

export class UI {
    constructor() {
        this.toastDuration = 5000; // 5 seconds - easier to read
    }

    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        const iconMap = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        toast.innerHTML = `
            <i class="fas ${iconMap[type] || iconMap.info}"></i>
            <span>${this.escapeHtml(message)}</span>
        `;

        container.appendChild(toast);

        // Auto remove after duration
        setTimeout(() => {
            toast.style.animation = 'toastOut .4s ease forwards';
            setTimeout(() => toast.remove(), 400);
        }, this.toastDuration);
    }

    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
            modal.style.display = 'flex';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
            setTimeout(() => {
                if (!modal.classList.contains('active')) {
                    modal.style.display = 'none';
                }
            }, 300);
        }
    }

    renderProductsList(products) {
        const container = document.getElementById('adminProductsList');
        if (!container) return;

        if (!products || products.length === 0) {
            container.innerHTML = `
                <div class="empty-state fade-in">
                    <i class="fas fa-box-open"></i>
                    <p>لا توجد منتجات بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = products.map(product => `
            <div class="admin-product-item fade-in" data-id="${this.escapeHtml(product.id)}">
                <img src="${this.escapeHtml(product.image || '')}" 
                     alt="${this.escapeHtml(product.name)}" 
                     class="admin-product-thumb"
                     onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2765%27 height=%2765%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%23ccc%27 stroke-width=%271%27%3E%3Crect x=%273%27 y=%273%27 width=%2718%27 height=%2718%27 rx=%272%27/%3E%3Ccircle cx=%278.5%27 cy=%278.5%27 r=%271.5%27/%3E%3Cpolyline points=%2721 15 16 10 5 21%27/%3E%3C/svg%3E'">
                <div class="admin-product-info">
                    <h4>${this.escapeHtml(product.name)}</h4>
                    <div class="admin-product-meta">
                        <span>${this.escapeHtml(product.category)}</span>
                        <span class="meta-promo">${this.formatPrice(product.price)}${product.promo_price ? `<span style="margin-right:8px;text-decoration:line-through;color:var(--text-muted);font-size:11px">${this.formatPrice(product.promo_price)}</span>` : ''}</span>
                        <span>المخزون: ${product.stock || 0}</span>
                    </div>
                </div>
                <div class="admin-product-actions">
                    <button class="btn-edit" onclick="window.adminApp.editProduct('${this.escapeHtml(product.id)}')" title="تعديل">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="btn-delete" onclick="window.adminApp.deleteProduct('${this.escapeHtml(product.id)}')" title="حذف">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderOrdersList(orders) {
        const container = document.getElementById('adminOrdersList');
        if (!container) return;

        if (!orders || orders.length === 0) {
            container.innerHTML = `
                <div class="empty-state fade-in">
                    <i class="fas fa-shopping-cart"></i>
                    <p>لا توجد طلبات بعد</p>
                </div>
            `;
            return;
        }

        container.innerHTML = orders.map(order => `
            <div class="order-item status-${this.getStatusClass(order.status)} fade-in" data-id="${this.escapeHtml(order.id)}">
                <div class="order-header">
                    <span class="order-id">#${this.escapeHtml(order.id.slice(-8).toUpperCase())}</span>
                    <span class="order-date">${this.formatDate(order.created_at)}</span>
                </div>
                <div class="order-details">
                    <div class="order-detail-item product-name">
                        <span>المنتج:</span> <strong>${this.escapeHtml(order.productName)}</strong>
                    </div>
                    <div class="order-detail-item">
                        <span>العميل:</span> <strong>${this.escapeHtml(order.customerName)}</strong>
                    </div>
                    <div class="order-detail-item">
                        <span>الولاية:</span> <strong>${this.escapeHtml(order.customerState)}</strong>
                    </div>
                    <div class="order-detail-item">
                        <span>الهاتف:</span> <strong>${this.escapeHtml(order.customerPhone)}</strong>
                    </div>
                    <div class="order-detail-item">
                        <span>السعر:</span> <strong>${this.formatPrice(order.productPrice)}</strong>
                    </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap">
                    <select class="order-status-select" onchange="window.adminApp.updateOrderStatus('${this.escapeHtml(order.id)}', this.value)">
                        ${['جديد', 'قيد المعالجة', 'تم الشحن', 'تم التسليم', 'ملغي'].map(status => `
                            <option value="${status}" ${order.status === status ? 'selected' : ''}>${status}</option>
                        `).join('')}
                    </select>
                    <button class="btn-delete btn-sm" onclick="window.adminApp.deleteOrder('${this.escapeHtml(order.id)}')">
                        <i class="fas fa-trash"></i> حذف
                    </button>
                </div>
                ${order.notes ? `<div style="margin-top:10px;padding:10px;background:var(--bg-alt);border-radius:var(--radius-xs);font-size:12px"><span style="color:var(--text-muted)">ملاحظات:</span> ${this.escapeHtml(order.notes)}</div>` : ''}
            </div>
        `).join('');
    }

    renderStats(stats) {
        const statsContainer = document.getElementById('adminStatsGrid');
        if (!statsContainer || !stats) return;

        const counts = stats.counts || {};
        const revenue = stats.revenue || {};

        statsContainer.innerHTML = `
            <div class="stat-card fade-in">
                <div class="stat-icon" style="color:var(--primary)">📦</div>
                <div class="stat-value">${counts.total || 0}</div>
                <div class="stat-label">إجمالي الطلبات</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="color:var(--warning)">✨</div>
                <div class="stat-value">${counts.new || 0}</div>
                <div class="stat-label">طلبات جديدة</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="color:var(--success)">💰</div>
                <div class="stat-value">${this.formatPrice(revenue.total || 0)}</div>
                <div class="stat-label">إجمالي المبيعات</div>
            </div>
            <div class="stat-card fade-in">
                <div class="stat-icon" style="color:var(--secondary)">📊</div>
                <div class="stat-value">${this.formatPrice(revenue.today || 0)}</div>
                <div class="stat-label">مبيعات اليوم</div>
            </div>
        `;
    }

    getStatusClass(status) {
        const statusMap = {
            'جديد': 'new',
            'قيد المعالجة': 'confirmed',
            'تم الشحن': 'shipped',
            'تم التسليم': 'completed',
            'ملغي': 'cancelled'
        };
        return statusMap[status] || 'new';
    }

    formatPrice(price) {
        const numPrice = parseFloat(price) || 0;
        return new Intl.NumberFormat('ar-DZ', { 
            style: 'currency', 
            currency: 'DZD',
            minimumFractionDigits: 0
        }).format(numPrice);
    }

    formatDate(dateString) {
        if (!dateString) return '';
        try {
            return new Date(dateString).toLocaleDateString('ar-DZ', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (e) {
            return dateString;
        }
    }

    escapeHtml(text) {
        if (!text || typeof text !== 'string') return '';
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    }

    showLoading(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.innerHTML = '<div class="empty-state"><i class="fas fa-spinner fa-spin"></i><p>جاري التحميل...</p></div>';
        }
    }

    enableButton(button) {
        if (button) {
            button.disabled = false;
        }
    }

    disableButton(button, loadingText = 'جاري...') {
        if (button) {
            button.disabled = true;
            button.dataset.originalText = button.innerHTML;
            button.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${loadingText}`;
        }
    }

    resetForm(form) {
        if (form) {
            form.reset();
        }
    }
}
