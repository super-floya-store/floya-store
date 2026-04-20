const express = require('express');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Valid status values
const VALID_STATUSES = ['جديد', 'قيد المعالجة', 'تم الشحن', 'تم التسليم', 'ملغي'];
const MAX_NOTES_LENGTH = 5000;
const MAX_NAME_LENGTH = 200;
const MAX_PHONE_LENGTH = 20;

// Sanitize input helper
function sanitizeInput(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    return str.slice(0, maxLength).trim().replace(/[<>]/g, '');
}

// Validate Algerian phone number
function isValidAlgerianPhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    const cleaned = phone.replace(/\s/g, '');
    // Algerian mobile: 05, 06, 07 followed by 8 digits
    // Landline: 0[1-4] for various regions
    return /^(0[5-7])[0-9]{8}$/.test(cleaned) && cleaned.length <= MAX_PHONE_LENGTH;
}

// Get all orders (protected - admin only)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const { status, limit = 50, offset = 0 } = req.query;

        // Validate limit and offset
        const parsedLimit = Math.min(parseInt(limit) || 50, 100); // Max 100 per request
        const parsedOffset = Math.max(parseInt(offset) || 0, 0);

        let query = `
            SELECT o.*, p.image as product_image
            FROM orders o
            LEFT JOIN products p ON o.product_id = p.id
            WHERE 1=1
        `;
        const params = [];

        if (status) {
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({ error: 'Invalid status filter' });
            }
            query += ' AND o.status = ?';
            params.push(status);
        }

        query += ' ORDER BY o.created_at DESC LIMIT ? OFFSET ?';
        params.push(parsedLimit, parsedOffset);

        const orders = await db.all(query, params);

        res.json(orders.map(o => ({
            id: o.id,
            productId: o.product_id,
            productName: o.product_name ? escapeHtml(o.product_name) : o.product_name,
            productPrice: o.product_price,
            productImage: o.product_image,
            customerName: o.customer_name ? escapeHtml(o.customer_name) : o.customer_name,
            customerState: o.customer_state ? escapeHtml(o.customer_state) : o.customer_state,
            customerPhone: o.customer_phone,
            status: o.status,
            notes: o.notes ? escapeHtml(o.notes) : o.notes,
            created_at: o.created_at,
            updated_at: o.updated_at
        })));
    } catch (err) {
        console.error('Get orders error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get order statistics (protected - admin only)
router.get('/stats', authMiddleware, async (req, res) => {
    try {
        const total = await db.get('SELECT COUNT(*) as count FROM orders');
        const newOrders = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'جديد'");
        const processing = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'قيد المعالجة'");
        const shipped = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'تم الشحن'");
        const delivered = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'تم التسليم'");
        const cancelled = await db.get("SELECT COUNT(*) as count FROM orders WHERE status = 'ملغي'");

        // Revenue stats
        const revenue = await db.get(`
            SELECT COALESCE(SUM(product_price), 0) as total
            FROM orders
            WHERE status != 'ملغي'
        `);

        const todayRevenue = await db.get(`
            SELECT COALESCE(SUM(product_price), 0) as total
            FROM orders
            WHERE status != 'ملغي'
            AND DATE(created_at) = DATE('now', 'localtime')
        `);

        res.json({
            counts: {
                total: total.count,
                new: newOrders.count,
                processing: processing.count,
                shipped: shipped.count,
                delivered: delivered.count,
                cancelled: cancelled.count
            },
            revenue: {
                total: revenue.total,
                today: todayRevenue.total
            }
        });
    } catch (err) {
        console.error('Get order stats error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single order (protected - admin only)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        // Validate order ID format
        if (!req.params.id || !/^ord_[a-zA-Z0-9_]+$/.test(req.params.id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const order = await db.get(
            `SELECT o.*, p.image as product_image
             FROM orders o
             LEFT JOIN products p ON o.product_id = p.id
             WHERE o.id = ?`,
            [req.params.id]
        );

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        res.json({
            id: order.id,
            productId: order.product_id,
            productName: order.product_name ? escapeHtml(order.product_name) : order.product_name,
            productPrice: order.product_price,
            productImage: order.product_image,
            customerName: order.customer_name ? escapeHtml(order.customer_name) : order.customer_name,
            customerState: order.customer_state ? escapeHtml(order.customer_state) : order.customer_state,
            customerPhone: order.customer_phone,
            status: order.status,
            notes: order.notes ? escapeHtml(order.notes) : order.notes,
            created_at: order.created_at,
            updated_at: order.updated_at
        });
    } catch (err) {
        console.error('Get order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create order (public)
router.post('/', async (req, res) => {
    try {
        const { productId, productName, productPrice, customerName, customerState, customerPhone, notes } = req.body;

        // Validation
        if (!productId || !customerName || !customerState || !customerPhone) {
            return res.status(400).json({
                error: 'Product, customer name, state, and phone are required'
            });
        }

        // Validate product ID format
        if (!/^prod_[a-zA-Z0-9_]+$/.test(productId)) {
            return res.status(400).json({ error: 'Invalid product ID format' });
        }

        // Validate and sanitize customer name
        if (typeof customerName !== 'string' || customerName.trim().length < 2 || customerName.trim().length > MAX_NAME_LENGTH) {
            return res.status(400).json({ error: 'Name must be between 2 and 200 characters' });
        }

        // Validate customer state
        if (typeof customerState !== 'string' || customerState.trim().length < 1) {
            return res.status(400).json({ error: 'State is required' });
        }

        // Validate Algerian phone number
        if (!isValidAlgerianPhone(customerPhone)) {
            return res.status(400).json({ error: 'Invalid phone number format. Use 05, 06, or 07 followed by 8 digits' });
        }
        const phoneClean = customerPhone.replace(/\s/g, '').slice(0, MAX_PHONE_LENGTH);

        // Verify product exists and is active
        const product = await db.get(
            'SELECT id, name, price, promo_price FROM products WHERE id = ? AND is_active = 1',
            [productId]
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found or unavailable' });
        }

        // Use actual product data to prevent manipulation
        const actualProductName = product.name;
        const actualProductPrice = product.promo_price || product.price;

        // Generate unique order ID
        let id;
        let attempts = 0;
        const crypto = require('crypto');
        do {
            id = 'ord_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
            attempts++;
        } while (await db.get('SELECT id FROM orders WHERE id = ?', [id]) && attempts < 5);

        if (attempts >= 5) {
            return res.status(500).json({ error: 'Failed to generate order ID' });
        }

        const sanitizedName = sanitizeInput(customerName, MAX_NAME_LENGTH);
        const sanitizedState = sanitizeInput(customerState, 100);
        const sanitizedNotes = notes ? sanitizeInput(notes, MAX_NOTES_LENGTH) : null;

        await db.run(
            `INSERT INTO orders (id, product_id, product_name, product_price, customer_name, customer_state, customer_phone, status, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                id,
                productId,
                actualProductName,
                actualProductPrice,
                sanitizedName,
                sanitizedState,
                phoneClean,
                'جديد',
                sanitizedNotes
            ]
        );

        const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);

        res.status(201).json({
            success: true,
            order: {
                id: order.id,
                productId: order.product_id,
                productName: order.product_name ? escapeHtml(order.product_name) : order.product_name,
                productPrice: order.product_price,
                customerName: order.customer_name ? escapeHtml(order.customer_name) : order.customer_name,
                customerState: order.customer_state ? escapeHtml(order.customer_state) : order.customer_state,
                customerPhone: order.customer_phone,
                status: order.status,
                notes: order.notes ? escapeHtml(order.notes) : order.notes,
                created_at: order.created_at
            }
        });
    } catch (err) {
        console.error('Create order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update order status (protected - admin only)
router.patch('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body;

        // Validate order ID format
        if (!req.params.id || !/^ord_[a-zA-Z0-9_]+$/.test(req.params.id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        if (!VALID_STATUSES.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const existing = await db.get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await db.run(
            'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [status, req.params.id]
        );

        res.json({ success: true, message: 'Status updated' });
    } catch (err) {
        console.error('Update order status error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add notes to order (protected - admin only)
router.patch('/:id/notes', authMiddleware, async (req, res) => {
    try {
        const { notes } = req.body;

        // Validate order ID format
        if (!req.params.id || !/^ord_[a-zA-Z0-9_]+$/.test(req.params.id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const existing = await db.get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const sanitizedNotes = notes ? sanitizeInput(notes, MAX_NOTES_LENGTH) : null;

        await db.run(
            'UPDATE orders SET notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
            [sanitizedNotes, req.params.id]
        );

        res.json({ success: true, message: 'Notes updated' });
    } catch (err) {
        console.error('Update order notes error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Delete order (protected - admin only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Validate order ID format
        if (!req.params.id || !/^ord_[a-zA-Z0-9_]+$/.test(req.params.id)) {
            return res.status(400).json({ error: 'Invalid order ID format' });
        }

        const existing = await db.get('SELECT id FROM orders WHERE id = ?', [req.params.id]);
        if (!existing) {
            return res.status(404).json({ error: 'Order not found' });
        }

        await db.run('DELETE FROM orders WHERE id = ?', [req.params.id]);

        res.json({ success: true, message: 'Order deleted' });
    } catch (err) {
        console.error('Delete order error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// XSS escape helper for output
function escapeHtml(text) {
    if (!text || typeof text !== 'string') return text;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

module.exports = router;
