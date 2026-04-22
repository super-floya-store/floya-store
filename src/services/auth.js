/**
 * Authentication Service
 * Handles login, logout, and session management
 */

import { Storage } from '../utils/storage.js';
import { Validators } from '../utils/validators.js';

const API_BASE = '';

export class AuthService {
    constructor() {
        this.tokenKey = 'floya_token';
        this.userKey = 'floya_user';
    }

    async login(username, password) {
        // Validate inputs
        if (!Validators.validateUsername(username)) {
            throw new Error('اسم المستخدم غير صالح');
        }

        if (!password || typeof password !== 'string') {
            throw new Error('كلمة المرور مطلوبة');
        }

        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'فشل تسجيل الدخول');
        }

        // Store token and user info
        Storage.set(this.tokenKey, data.token);
        Storage.set(this.userKey, JSON.stringify(data.user));

        return data;
    }

    logout() {
        Storage.remove(this.tokenKey);
        Storage.remove(this.userKey);
    }

    getToken() {
        return Storage.get(this.tokenKey);
    }

    getUser() {
        const userStr = Storage.get(this.userKey);
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            return null;
        }
    }

    isLoggedIn() {
        return !!this.getToken();
    }

    async getProfile() {
        const token = this.getToken();
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        const response = await fetch(`${API_BASE}/api/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'فشل تحميل الملف الشخصي');
        }

        return data;
    }

    async changePassword(currentPassword, newPassword) {
        const validation = Validators.validatePassword(newPassword);
        if (!validation.valid) {
            throw new Error(validation.message);
        }

        const token = this.getToken();
        if (!token) {
            throw new Error('غير مسجل الدخول');
        }

        const response = await fetch(`${API_BASE}/api/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ currentPassword, newPassword })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'فشل تغيير كلمة المرور');
        }

        // Clear session after password change
        this.logout();

        return data;
    }
}
