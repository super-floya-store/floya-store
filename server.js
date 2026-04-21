const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const db = require('./database');
const crypto = require('crypto');

const app = express();

// CSRF token store (in production, use Redis or database)
const csrfTokens = new Map();

// CSRF middleware
function csrfProtection(req, res, next) {
    // Skip CSRF for GET requests and non-authenticated routes
    if (req.method === 'GET' || req.path === '/api/csrf-token') {
        return next();
    }

    // Skip for order creation (public endpoint) and auth endpoints
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

    // Validate token exists and matches session
    const storedToken = csrfTokens.get(sessionToken);
    if (!storedToken || storedToken !== csrfToken) {
        return res.status(403).json({ error: 'Invalid CSRF token' });
    }

    next();
}
const PORT = process.env.PORT || 3000;

// Validate environment
if (!process.env.JWT_SECRET) {
    console.error('ERROR: JWT_SECRET environment variable is required');
    process.exit(1);
}

// Trust proxy if behind reverse proxy
if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
}

// Rate limiting - stricter for production
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: process.env.NODE_ENV === 'production' ? 50 : 100,
    message: { error: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false,
});

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
    crossOriginEmbedderPolicy: false, // Allow images from external sources
}));

// CORS configuration - Updated 2026-04-21 to fix CORS issues
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token', 'X-Requested-With']
}));

// Body parsing middleware
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CSRF Protection middleware (applied after auth, before routes)
app.use(csrfProtection);

// CSRF token endpoint - must be authenticated
app.get('/api/csrf-token', (req, res) => {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    // Store with expiration (1 hour)
    csrfTokens.set(authHeader, token);

    // Clean up old tokens after 1 hour
    setTimeout(() => {
        csrfTokens.delete(authHeader);
    }, 60 * 60 * 1000);

    res.json({ csrfToken: token });
});

// Logging
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Apply rate limiting to API routes only
app.use('/api/', limiter);

// SECURITY FIX: Block access to data directory (CVE-FL-07)
app.use('/data', (req, res) => {
    res.status(403).json({ error: 'Forbidden - Access to data directory is not allowed' });
});

// Static files
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path) => {
        // Prevent caching of HTML files
        if (path.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));

// Health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'admin.html'));
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal Server Error'
        : err.message;

    res.status(err.status || 500).json({ error: message });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Not Found' });
});

// Graceful shutdown handling
const server = app.listen(PORT, () => {
    console.log(`Floya Store server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`Frontend: http://localhost:${PORT}`);
    console.log(`Admin: http://localhost:${PORT}/admin`);
});

// Graceful shutdown
function gracefulShutdown(signal) {
    console.log(`\n${signal} received. Starting graceful shutdown...`);

    server.close(async () => {
        console.log('HTTP server closed');

        try {
            await db.close();
            console.log('Database connection closed');
            process.exit(0);
        } catch (err) {
            console.error('Error during shutdown:', err);
            process.exit(1);
        }
    });

    // Force shutdown after 10 seconds
    setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
    }, 10000);
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle uncaught errors
process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
    gracefulShutdown('uncaughtException');
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

module.exports = app;
