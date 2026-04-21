const express = require('express');
const crypto = require('crypto');
const db = require('../database');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Get all products (public)
router.get('/', async (req, res) => {
    try {
        const products = await db.all(
            `SELECT id, name, description, price, promo_price, category, image, stock, created_at
             FROM products
             WHERE is_active = $1
             ORDER BY created_at DESC`, [1]
        );

        // Format for frontend compatibility
        const formatted = products.map(p => ({
            id: p.id,
            name: p.name,
            description: p.description,
            price: p.price,
            promo_price: p.promo_price,
            category: p.category,
            image: p.image,
            stock: p.stock,
            created_at: p.created_at
        }));

        res.json(formatted);
    } catch (err) {
        console.error('Get products error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get single product (public)
router.get('/:id', async (req, res) => {
    try {
        const product = await db.get(
            'SELECT * FROM products WHERE id = $1 AND is_active = $2',
            [req.params.id, 1]
        );

        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            promo_price: product.promo_price,
            category: product.category,
            image: product.image,
            stock: product.stock,
            created_at: product.created_at
        });
    } catch (err) {
        console.error('Get product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Create product (protected)
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { name, description, price, promoPrice, category, image, stock } = req.body;

        // Validation
        if (!name || !price || !category) {
            return res.status(400).json({ error: 'Name, price, and category are required' });
        }

        if (typeof name !== 'string' || name.trim().length < 1 || name.trim().length > 200) {
            return res.status(400).json({ error: 'Name must be between 1 and 200 characters' });
        }

        if (typeof category !== 'string' || category.trim().length < 1 || category.trim().length > 100) {
            return res.status(400).json({ error: 'Category must be between 1 and 100 characters' });
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 10000000) {
            return res.status(400).json({ error: 'Price must be a positive number less than 10,000,000' });
        }

        // Generate unique ID with collision check
        let id;
        let attempts = 0;
        do {
            id = 'prod_' + Date.now() + '_' + crypto.randomBytes(8).toString('hex');
            attempts++;
        } while (await db.get('SELECT id FROM products WHERE id = $1', [id]) && attempts < 5);

        if (attempts >= 5) {
            return res.status(500).json({ error: 'Failed to generate unique ID' });
        }

        const sanitizedName = sanitizeInput(name.trim(), 200);
        const sanitizedDescription = description ? sanitizeInput(description.trim(), 2000) : null;
        const sanitizedCategory = sanitizeInput(category.trim(), 100);

        // Validate image URL
        const sanitizedImage = isValidUrl(image) ? image.trim() : null;

        await db.run(
            `INSERT INTO products (id, name, description, price, promo_price, category, image, stock)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
            [
                id,
                sanitizedName,
                sanitizedDescription,
                parsedPrice,
                promoPrice ? parseFloat(promoPrice) : null,
                sanitizedCategory,
                sanitizedImage,
                parseInt(stock) || 0
            ]
        );

        const product = await db.get('SELECT * FROM products WHERE id = $1', [id]);

        res.status(201).json({
            success: true,
            product: {
                id: product.id,
                name: escapeHtml(product.name),
                description: escapeHtml(product.description),
                price: product.price,
                promo_price: product.promo_price,
                category: escapeHtml(product.category),
                image: product.image,
                stock: product.stock,
                created_at: product.created_at
            }
        });
    } catch (err) {
        console.error('Create product error:', err.message);
        console.error('Stack:', err.stack);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
});

// Update product (protected)
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const { name, description, price, promoPrice, category, image, stock, is_active } = req.body;

        const existing = await db.get('SELECT id FROM products WHERE id = $1', [req.params.id]);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        // Whitelist of allowed fields to prevent SQL injection via field names
        const allowedFields = ['name', 'description', 'price', 'promoPrice', 'category', 'image', 'stock', 'is_active'];
        const fieldMapping = {
            name: 'name',
            description: 'description',
            price: 'price',
            promoPrice: 'promo_price',
            category: 'category',
            image: 'image',
            stock: 'stock',
            is_active: 'is_active'
        };

        const updates = [];
        const values = [];

        for (const [key, value] of Object.entries(req.body)) {
            if (!allowedFields.includes(key)) continue;

            const dbField = fieldMapping[key];

            switch (key) {
                case 'name':
                    if (typeof value === 'string' && value.trim()) {
                        updates.push(`${dbField} = ?`);
                        values.push(sanitizeInput(value.trim(), 200));
                    }
                    break;
                case 'description':
                    updates.push(`${dbField} = ?`);
                    values.push(value ? sanitizeInput(value.trim(), 2000) : null);
                    break;
                case 'price':
                    if (!isNaN(value) && parseFloat(value) > 0 && parseFloat(value) < 10000000) {
                        updates.push(`${dbField} = ?`);
                        values.push(parseFloat(value));
                    }
                    break;
                case 'promoPrice':
                    updates.push(`${dbField} = ?`);
                    values.push(value ? parseFloat(value) : null);
                    break;
                case 'category':
                    if (typeof value === 'string' && value.trim()) {
                        updates.push(`${dbField} = ?`);
                        values.push(sanitizeInput(value.trim(), 100));
                    }
                    break;
                case 'image':
                    if (isValidUrl(value)) {
                        updates.push(`${dbField} = ?`);
                        values.push(value.trim());
                    } else {
                        updates.push(`${dbField} = ?`);
                        values.push(null);
                    }
                    break;
                case 'stock':
                    updates.push(`${dbField} = ?`);
                    values.push(parseInt(value) || 0);
                    break;
                case 'is_active':
                    updates.push(`${dbField} = ?`);
                    values.push(value ? 1 : 0);
                    break;
            }
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No valid fields to update' });
        }

        updates.push('updated_at = CURRENT_TIMESTAMP');

        // Build parameterized query for Supabase - replace ? with $1, $2, etc.
        let paramIndex = 1;
        const parameterizedUpdates = updates.map(u => {
            return u.replace('= ?', `= $${paramIndex++}`);
        });

        // Add the WHERE clause parameter
        values.push(req.params.id);

        await db.run(
            `UPDATE products SET ${parameterizedUpdates.join(', ')} WHERE id = $${paramIndex}`,
            values
        );

        const product = await db.get(`SELECT * FROM products WHERE id = $${paramIndex}`, [req.params.id]);

        res.json({
            success: true,
            product: {
                id: product.id,
                name: escapeHtml(product.name),
                description: escapeHtml(product.description),
                price: product.price,
                promo_price: product.promo_price,
                category: escapeHtml(product.category),
                image: product.image,
                stock: product.stock,
                is_active: product.is_active,
                created_at: product.created_at,
                updated_at: product.updated_at
            }
        });
    } catch (err) {
        console.error('Update product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Input sanitization helper
function sanitizeInput(str, maxLength = 1000) {
    if (typeof str !== 'string') return '';
    return str.slice(0, maxLength).replace(/[<>]/g, '');
}

// XSS escape helper for output
function escapeHtml(text) {
    if (!text) return text;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// URL validation helper - accepts both HTTP URLs and base64 images
function isValidUrl(string) {
    if (!string || typeof string !== 'string') return false;
    // Accept base64 images
    if (string.startsWith('data:image/')) {
        return true;
    }
    try {
        const url = new URL(string);
        return ['http:', 'https:'].includes(url.protocol);
    } catch (_) {
        return false;
    }
}

// Delete product (protected) - soft delete
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const existing = await db.get('SELECT id FROM products WHERE id = $1', [req.params.id]);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await db.run(
            'UPDATE products SET is_active = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [0, req.params.id]
        );

        res.json({ success: true, message: 'Product deleted' });
    } catch (err) {
        console.error('Delete product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Hard delete product (protected)
router.delete('/:id/permanent', authMiddleware, async (req, res) => {
    try {
        const existing = await db.get('SELECT id FROM products WHERE id = $1', [req.params.id]);
        if (!existing) {
            return res.status(404).json({ error: 'Product not found' });
        }

        await db.run('DELETE FROM products WHERE id = $1', [req.params.id]);

        res.json({ success: true, message: 'Product permanently deleted' });
    } catch (err) {
        console.error('Hard delete product error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
