/**
 * Storage Utility
 * Safe wrapper for localStorage with error handling
 */

export class Storage {
    static isAvailable() {
        try {
            const test = '__storage_test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            console.warn('localStorage not available:', e);
            return false;
        }
    }

    static get(key) {
        if (!this.isAvailable()) {
            return null;
        }
        try {
            return localStorage.getItem(key);
        } catch (e) {
            console.error('Storage get error:', e);
            return null;
        }
    }

    static set(key, value) {
        if (!this.isAvailable()) {
            return false;
        }
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (e) {
            console.error('Storage set error:', e);
            return false;
        }
    }

    static remove(key) {
        if (!this.isAvailable()) {
            return false;
        }
        try {
            localStorage.removeItem(key);
            return true;
        } catch (e) {
            console.error('Storage remove error:', e);
            return false;
        }
    }

    static clear() {
        if (!this.isAvailable()) {
            return false;
        }
        try {
            localStorage.clear();
            return true;
        } catch (e) {
            console.error('Storage clear error:', e);
            return false;
        }
    }
}
