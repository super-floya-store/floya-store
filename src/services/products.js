/**
 * Product Service
 * Handles product CRUD operations with pagination support
 */

import { Storage } from '../utils/storage.js';

const API_BASE = '';

export class ProductService {
    constructor() {
        this.defaultPageSize = 20;
    }

    async getAll(options = {}) {
        const { limit = this.defaultPageSize, offset = 0 } = options;
        
        const token = Storage.get('floya_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const params = new URLSearchParams({ limit, offset });
        const response = await fetch(`${API_BASE}/api/products?${params}`, { headers });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'فشل تحميل المنتجات');
        }

        return response.json();
    }

    async getById(id) {
        if (!id || typeof id !== 'string') {
            throw new Error('معرف المنتج غير صالح');
        }

        const token = Storage.get('floya_token');
        const headers = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, { headers });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'المنتج غير موجود');
        }

        return response.json();
    }

    async create(productData) {
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        // Validate required fields
        if (!productData.name || !productData.price || !productData.category) {
            throw new Error('الاسم والسعر والتصنيف مطلوبة');
        }

        // Sanitize and validate data
        const sanitizedData = this.sanitizeProductData(productData);

        const response = await fetch(`${API_BASE}/api/products`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sanitizedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'فشل إضافة المنتج');
        }

        return result;
    }

    async update(id, productData) {
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        if (!id || typeof id !== 'string') {
            throw new Error('معرف المنتج غير صالح');
        }

        const sanitizedData = this.sanitizeProductData(productData);

        const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(sanitizedData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'فشل تحديث المنتج');
        }

        return result;
    }

    async delete(id) {
        const token = Storage.get('floya_token');
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        if (!id || typeof id !== 'string') {
            throw new Error('معرف المنتج غير صالح');
        }

        const response = await fetch(`${API_BASE}/api/products/${encodeURIComponent(id)}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'فشل حذف المنتج');
        }

        return true;
    }

    sanitizeProductData(data) {
        const sanitized = {};

        if (data.name && typeof data.name === 'string') {
            sanitized.name = data.name.trim().slice(0, 200);
        }

        if (data.description !== undefined) {
            sanitized.description = data.description ? data.description.trim().slice(0, 2000) : null;
        }

        if (data.price !== undefined) {
            const price = parseFloat(data.price);
            if (!isNaN(price) && price > 0 && price < 10000000) {
                sanitized.price = price;
            } else {
                throw new Error('السعر يجب أن يكون رقم موجب أقل من 10,000,000');
            }
        }

        if (data.promoPrice !== undefined) {
            const promoPrice = parseFloat(data.promoPrice);
            sanitized.promoPrice = !isNaN(promoPrice) && promoPrice > 0 ? promoPrice : null;
        }

        if (data.category && typeof data.category === 'string') {
            sanitized.category = data.category.trim().slice(0, 100);
        }

        if (data.stock !== undefined) {
            sanitized.stock = parseInt(data.stock) || 0;
        }

        if (data.image !== undefined) {
            // Only accept valid URLs or base64 images
            if (typeof data.image === 'string' && 
                (data.image.startsWith('http') || data.image.startsWith('data:image/'))) {
                sanitized.image = data.image;
            } else {
                sanitized.image = null;
            }
        }

        return sanitized;
    }
}
