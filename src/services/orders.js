/**
 * Order Service
 * Handles order CRUD operations with pagination and filtering
 */

import { Storage } from '../utils/storage.js';

const API_BASE = '';
const VALID_STATUSES = ['جديد', 'قيد المعالجة', 'تم الشحن', 'تم التسليم', 'ملغي'];

export class OrderService {
    constructor() {
        this.defaultPageSize = 50;
    }

    async getAll(options = {}) {
        const { 
            limit = this.defaultPageSize, 
            offset = 0,
            status = null 
        } = options;
        
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        const params = new URLSearchParams({ 
            limit: Math.min(limit, 100), 
            offset: Math.max(offset, 0) 
        });
        
        if (status && VALID_STATUSES.includes(status)) {
            params.append('status', status);
        }

        const response = await fetch(`${API_BASE}/api/orders?${params}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'فشل تحميل الطلبات');
        }

        return response.json();
    }

    async getById(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('معرف الطلب غير صالح');
        }

        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'الطلب غير موجود');
        }

        return response.json();
    }

    async create(orderData) {
        // Validate required fields
        if (!orderData.productId || !orderData.customerName || 
            !orderData.customerState || !orderData.customerPhone) {
            throw new Error('المنتج واسم العميل والولاية والهاتف مطلوبة');
        }

        // Validate phone number (Algerian format)
        const phone = orderData.customerPhone.replace(/\s/g, '');
        if (!/^(0[5-7])[0-9]{8}$/.test(phone)) {
            throw new Error('رقم الهاتف يجب أن يكون بصيغة جزائرية صحيحة (يبدأ بـ 05، 06، أو 07 ويتبع بـ 8 أرقام)');
        }

        const sanitizedData = {
            productId: orderData.productId,
            customerName: orderData.customerName.trim().slice(0, 200),
            customerState: orderData.customerState.trim().slice(0, 100),
            customerPhone: phone,
            notes: orderData.notes ? orderData.notes.trim().slice(0, 5000) : null
        };

        const response = await fetch(`${API_BASE}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(sanitizedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'فشل إنشاء الطلب');
        }

        return result;
    }

    async updateStatus(id, status) {
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        if (!id || typeof id !== 'string') {
            throw new Error('معرف الطلب غير صالح');
        }

        if (!VALID_STATUSES.includes(status)) {
            throw new Error('حالة الطلب غير صالحة');
        }

        const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}/status`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ status })
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'فشل تحديث حالة الطلب');
        }

        return result;
    }

    async delete(id) {
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        if (!id || typeof id !== 'string') {
            throw new Error('معرف الطلب غير صالح');
        }

        const response = await fetch(`${API_BASE}/api/orders/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'فشل حذف الطلب');
        }

        return true;
    }

    async getStats() {
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        const response = await fetch(`${API_BASE}/api/orders/stats`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'فشل تحميل الإحصائيات');
        }

        return response.json();
    }
}
