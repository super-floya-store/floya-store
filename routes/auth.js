const express = require('express');
const bcrypt = require('bcryptjs');
const rateLimit = require('express-rate-limit');
const db = require('../database');
const { authMiddleware, generateToken } = require('../middleware/auth');

const router = express.Router();

// Rate limiting for auth endpoints
const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per window
    message: { error: 'Too many login attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

const passwordChangeLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: { error: 'Too many password change attempts, please try again later' },
});

// Login
router.post('/login', loginLimiter, async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password required' });
        }

        // Validate input types and lengths
        if (typeof username !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        if (username.length > 100 || password.length > 100) {
            return res.status(400).json({ error: 'Input too long' });
        }

        const user = await db.get(
            'SELECT * FROM admin_users WHERE username = ? AND is_active = 1',
            [username.trim()]
        );

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await db.run(
            'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            [user.id]
        );

        const token = generateToken(user);

        res.json({
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                last_login: new Date().toISOString()
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await db.get(
            'SELECT id, username, role, last_login, created_at FROM admin_users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (err) {
        console.error('Profile error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Change password
router.post('/change-password', authMiddleware, passwordChangeLimiter, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current and new password required' });
        }

        if (typeof currentPassword !== 'string' || typeof newPassword !== 'string') {
            return res.status(400).json({ error: 'Invalid input format' });
        }

        if (currentPassword.length > 100) {
            return res.status(400).json({ error: 'Invalid current password' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ error: 'New password must be at least 8 characters' });
        }

        if (newPassword.length > 100) {
            return res.status(400).json({ error: 'New password too long' });
        }

        // Check password strength
        const hasUpperCase = /[A-Z]/.test(newPassword);
        const hasLowerCase = /[a-z]/.test(newPassword);
        const hasNumbers = /\d/.test(newPassword);
        const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(newPassword);

        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            return res.status(400).json({
                error: 'Password must contain uppercase, lowercase, and numbers'
            });
        }

        const user = await db.get(
            'SELECT password_hash FROM admin_users WHERE id = ?',
            [req.user.id]
        );

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const validPassword = await bcrypt.compare(currentPassword, user.password_hash);

        if (!validPassword) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 12);

        // Increment token_version to invalidate all existing tokens
        await db.run(
            'UPDATE admin_users SET password_hash = ?, token_version = token_version + 1 WHERE id = ?',
            [hashedPassword, req.user.id]
        );

        res.json({ success: true, message: 'Password changed successfully. Please log in again.' });
    } catch (err) {
        console.error('Change password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
