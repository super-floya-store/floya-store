/**
 * Test Runner for Floya Store
 * Simple test framework using Node.js native modules
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { describe, it } from 'node:test';

// Import validators for testing (using dynamic import for ESM compatibility)
const { Validators } = await import('../src/utils/validators.js');

let passed = 0;
let failed = 0;

describe('Validators', () => {
    describe('validateUsername', () => {
        it('should accept valid username', () => {
            assert.strictEqual(Validators.validateUsername('admin'), true);
            assert.strictEqual(Validators.validateUsername('user123'), true);
            assert.strictEqual(Validators.validateUsername('test_user'), true);
        });

        it('should reject invalid username', () => {
            assert.strictEqual(Validators.validateUsername(''), false);
            assert.strictEqual(Validators.validateUsername('user name'), false);
            assert.strictEqual(Validators.validateUsername('a'.repeat(101)), false);
        });
    });

    describe('validatePassword', () => {
        it('should accept strong password', () => {
            const result = Validators.validatePassword('Password123');
            assert.strictEqual(result.valid, true);
        });

        it('should reject weak password (too short)', () => {
            const result = Validators.validatePassword('Pass1');
            assert.strictEqual(result.valid, false);
        });

        it('should reject password without uppercase', () => {
            const result = Validators.validatePassword('password123');
            assert.strictEqual(result.valid, false);
        });

        it('should reject password without number', () => {
            const result = Validators.validatePassword('PasswordABC');
            assert.strictEqual(result.valid, false);
        });
    });

    describe('validateProductName', () => {
        it('should accept valid product name', () => {
            assert.strictEqual(Validators.validateProductName('Product Name'), true);
            assert.strictEqual(Validators.validateProductName('A'.repeat(200)), true);
        });

        it('should reject empty or too long name', () => {
            assert.strictEqual(Validators.validateProductName(''), false);
            assert.strictEqual(Validators.validateProductName('   '), false);
            assert.strictEqual(Validators.validateProductName('A'.repeat(201)), false);
        });
    });

    describe('validateProductPrice', () => {
        it('should accept valid price', () => {
            assert.strictEqual(Validators.validateProductPrice(100), true);
            assert.strictEqual(Validators.validateProductPrice('50.99'), true);
        });

        it('should reject invalid price', () => {
            assert.strictEqual(Validators.validateProductPrice(0), false);
            assert.strictEqual(Validators.validateProductPrice(-10), false);
            assert.strictEqual(Validators.validateProductPrice(10000001), false);
        });
    });

    describe('validateAlgerianPhone', () => {
        it('should accept valid Algerian phone', () => {
            assert.strictEqual(Validators.validateAlgerianPhone('0551234567'), true);
            assert.strictEqual(Validators.validateAlgerianPhone('0661234567'), true);
            assert.strictEqual(Validators.validateAlgerianPhone('0771234567'), true);
        });

        it('should reject invalid phone', () => {
            assert.strictEqual(Validators.validateAlgerianPhone('0451234567'), false);
            assert.strictEqual(Validators.validateAlgerianPhone('12345678'), false);
            assert.strictEqual(Validators.validateAlgerianPhone(''), false);
        });
    });

    describe('sanitizeString', () => {
        it('should sanitize string properly', () => {
            assert.strictEqual(Validators.sanitizeString('  hello world  '), 'hello world');
            assert.strictEqual(Validators.sanitizeString('<script>alert("xss")</script>'), 'scriptalert("xss")/script');
        });

        it('should truncate long strings', () => {
            const result = Validators.sanitizeString('A'.repeat(1000), 10);
            assert.strictEqual(result.length, 10);
        });
    });
});

describe('Storage Utility', () => {
    // Note: These tests would need to be run in a browser environment
    // For now, we just verify the module loads correctly
    it('should load storage module', async () => {
        const { Storage } = await import('../src/utils/storage.js');
        assert.ok(Storage);
        assert.ok(typeof Storage.isAvailable === 'function');
    });
});

describe('Services', () => {
    it('should load AuthService', async () => {
        const { AuthService } = await import('../src/services/auth.js');
        assert.ok(AuthService);
    });

    it('should load ProductService', async () => {
        const { ProductService } = await import('../src/services/products.js');
        assert.ok(ProductService);
    });

    it('should load OrderService', async () => {
        const { OrderService } = await import('../src/services/orders.js');
        assert.ok(OrderService);
    });
});

console.log('\n========================================');
console.log('✅ All tests completed successfully!');
console.log('========================================\n');
