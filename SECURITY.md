# Security Documentation

## Overview

This document outlines the security measures implemented in the Floya Store backend.

## Security Features

### Authentication & Authorization

- **JWT Tokens**: Short-lived (8 hours) tokens with issuer and audience claims
- **Rate Limiting**: Prevents brute-force attacks on login endpoints
- **Password Security**: bcrypt with 12 rounds of hashing
- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, and numbers
- **Session Management**: Tokens invalidated on password change (client-side)

### Input Validation

- **SQL Injection Prevention**: Parameterized queries throughout
- **XSS Protection**: Input sanitization and output escaping
- **Field Whitelisting**: Only allowed fields can be updated
- **Length Limits**: Prevents DoS via oversized payloads
- **Type Checking**: All inputs validated for expected types

### Request Security

- **Rate Limiting**: 100 requests per 15 minutes (configurable)
- **CORS**: Whitelist-based origin validation
- **Helmet Headers**: CSP, HSTS, X-Frame-Options, etc.
- **Body Parsing Limits**: 1MB max request size

### Database Security

- **Foreign Keys**: Enabled for referential integrity
- **Soft Deletes**: Prevents accidental data loss
- **Indexes**: Optimized queries for performance
- **Prepared Statements**: All database operations parameterized

## Environment Configuration

### Required Environment Variables

```bash
# Required: Minimum 32 characters, generate with:
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
JWT_SECRET=your-super-secret-64-character-random-string

# Optional
NODE_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
PORT=3000
```

## Security Checklist

Before deploying to production:

- [ ] Generate strong JWT_SECRET (64+ characters)
- [ ] Set NODE_ENV=production
- [ ] Configure ALLOWED_ORIGINS with your domain(s)
- [ ] Change default admin password
- [ ] Enable HTTPS
- [ ] Set up reverse proxy (nginx)
- [ ] Configure firewall rules
- [ ] Review CORS origins
- [ ] Test rate limiting
- [ ] Verify CSP headers work with your frontend

## Vulnerability Reporting

If you discover a security vulnerability, please:

1. Do not open a public issue
2. Email the maintainers directly
3. Provide detailed reproduction steps
4. Allow time for fixes before disclosure

## Security Updates

Security patches are released as quickly as possible. Update dependencies regularly:

```bash
npm audit
npm update
```
