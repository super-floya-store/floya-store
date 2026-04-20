const jwt = require('jsonwebtoken');
const db = require('../database');

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
    console.error('FATAL ERROR: JWT_SECRET environment variable is required');
    console.error('Please set JWT_SECRET in your .env file');
}

if (JWT_SECRET && JWT_SECRET.length < 32) {
    console.error('FATAL ERROR: JWT_SECRET must be at least 32 characters long');
}

async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Access token required' });
    }

    const token = authHeader.split(' ')[1];

    if (!token || token.length > 1000) {
        return res.status(401).json({ error: 'Invalid token format' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Check token version to ensure token hasn't been revoked
        const user = await db.get('SELECT token_version FROM admin_users WHERE id = ?', [decoded.id]);
        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (decoded.tokenVersion !== user.token_version) {
            return res.status(401).json({ error: 'Token revoked. Please log in again.' });
        }

        req.user = decoded;
        next();
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token expired' });
        }
        return res.status(403).json({ error: 'Invalid token' });
    }
}

function generateToken(user) {
    return jwt.sign(
        { id: user.id, username: user.username, role: user.role, tokenVersion: user.token_version || 0 },
        JWT_SECRET,
        { expiresIn: '8h', issuer: 'floya-store', audience: 'floya-admin' }
    );
}

module.exports = { authMiddleware, generateToken, JWT_SECRET };
