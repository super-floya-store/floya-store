const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const crypto = require('crypto');
const db = require('../database');

const app = express();

// CSRF token store (use Redis in production for multi-instance)
const csrfTokens = new Map();

// CSRF middleware
function csrfProtection(req, res, next) {
    if (req.method === 'GET' || req.path === '/api/csrf-token') {
        return next();
    }

    if (req.path === '/api/orders' && req.method === 'POST') {
        return next();
    }
    if (req.path.startsWith('/api/auth/')) {
        return next();
    }

    const csrfToken = req.headers['x-csrf-token'];
    const sessionToken = req.headers.authorization;

    if (!csrfToken) {
        return res.status(403).json({ error: 'CSRF token required' });
    }

    const storedToken = csrfTokens.get(sessionToken);
    if (!storedToken || storedToken !== csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
}

// Validate environment
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is required');
}

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_KEY are required');
}

// Trust proxy for Vercel
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            connectSrc: ["'self'"],
        },
    },
    crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            return callback(new Error('CORS policy violation'), false);
        }
        return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);
app.use(csrfProtection);

// CSRF token endpoint
app.get('/api/csrf-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    csrfTokens.set(authHeader, token);

    setTimeout(() => {
        csrfTokens.delete(authHeader);
    }, 60 * 60 * 1000);

    res.json({ csrfToken: token });
});

// Block access to data directory
app.use('/data', (req, res) => {
    res.status(403).json({ error: 'Forbidden' });
});

// Routes
app.use('/api/auth', require('../routes/auth'));
app.use('/api/products', require('../routes/products'));
app.use('/api/orders', require('../routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;
    res.status(err.status || 500).json({ error: message });
});

app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Export for Vercel
module.exports = app;
