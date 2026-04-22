/**
 * Validators Utility
 * Input validation functions for forms and data
 */

export class Validators {
    static validateUsername(username) {
        return typeof username === 'string' &&
               username.length >= 1 &&
               username.length <= 100 &&
               /^[a-zA-Z0-9_-]+$/.test(username.trim());
    }

    static validatePassword(password) {
        if (typeof password !== 'string' || password.length < 8 || password.length > 100) {
            return { 
                valid: false, 
                message: 'كلمة المرور يجب أن تكون بين 8 و 100 حرف' 
            };
        }
        
        const hasUpper = /[A-Z]/.test(password);
        const hasLower = /[a-z]/.test(password);
        const hasNumber = /\d/.test(password);

        if (!hasUpper || !hasLower || !hasNumber) {
            return { 
                valid: false, 
                message: 'كلمة المرور يجب أن تحتوي على أحرف كبيرة وصغيرة وأرقام' 
            };
        }

        return { valid: true };
    }

    static validateProductName(name) {
        return typeof name === 'string' && 
               name.trim().length >= 1 && 
               name.trim().length <= 200;
    }

    static validateProductPrice(price) {
        const numPrice = parseFloat(price);
        return !isNaN(numPrice) && numPrice > 0 && numPrice < 10000000;
    }

    static validateCategory(category) {
        return typeof category === 'string' && 
               category.trim().length >= 1 && 
               category.trim().length <= 100;
    }

    static validateAlgerianPhone(phone) {
        if (typeof phone !== 'string') return false;
        const cleaned = phone.replace(/\s/g, '');
        return /^(0[5-7])[0-9]{8}$/.test(cleaned);
    }

    static validateEmail(email) {
        if (!email) return true; // Email is optional
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static validateURL(url) {
        if (!url) return true; // URL is optional
        try {
            new URL(url);
            return true;
        } catch (_) {
            return false;
        }
    }

    static sanitizeString(str, maxLength = 1000) {
        if (typeof str !== 'string') return '';
        return str.trim().slice(0, maxLength).replace(/[<>]/g, '');
    }

    static validateRequired(value, fieldName = 'الحقل') {
        if (!value || (typeof value === 'string' && !value.trim())) {
            return { valid: false, message: `${fieldName} مطلوب` };
        }
        return { valid: true };
    }
}
