# Floya Store - فلويا ستور

<p align="center">
  <img src="public/images/logo.svg" alt="Floya Store Logo" width="200"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Tailwind-3-38B2AC?style=for-the-badge&logo=tailwind-css" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" alt="Supabase" />
</p>

## Table of Contents

1. [About](#about)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Architecture Overview](#architecture-overview)
5. [Database Schema](#database-schema)
6. [Getting Started](#getting-started)
7. [Environment Variables](#environment-variables)
8. [Development](#development)
9. [Project Structure](#project-structure)
10. [API Documentation](#api-documentation)
11. [Authentication](#authentication)
12. [Deployment Guide](#deployment-guide)
13. [Admin Guide](#admin-guide)
14. [Security](#security)
15. [Testing](#testing)
16. [Troubleshooting](#troubleshooting)
17. [License](#license)

---

## About

**Floya Store (فلويا ستور)** is a premium Arabic-first e-commerce platform built specifically for the Algerian market. It delivers a luxurious shopping experience with enterprise-grade reliability, security, and performance. The platform is designed to feel like a high-end boutique online, with smooth animations, beautiful product presentations, intuitive navigation, and an admin dashboard that makes store management effortless.

The platform supports both Arabic (RTL) and English (LTR) languages, with Arabic as the default. It handles payments via Cash on Delivery (COD), the primary payment method in Algeria, and supports promo/sale prices per product. The system is built to be production-ready on day one, deployable to Vercel + Supabase with zero configuration changes.

---

## Features

### Customer Store
- **Beautiful Product Browsing**: Clean, modern design with responsive product grids
- **Advanced Search**: Full-text search with debounced suggestions
- **Smart Filtering**: Filter by category, price range, stock status, and sale items
- **Product Detail Pages**: Image galleries, zoom, related products
- **Shopping Cart**: Persistent cart with drawer and full-page views
- **Multi-step Checkout**: Customer info, order review, and confirmation
- **Order Tracking**: Track orders by order number and phone
- **WhatsApp Integration**: Floating WhatsApp button for customer support
- **RTL Arabic Layout**: Native Arabic experience with proper typography

### Admin Dashboard
- **Secure Authentication**: JWT-based auth with role-based access control
- **Product Management**: CRUD operations with image upload
- **Order Management**: Full order lifecycle with status transitions
- **Category Management**: Hierarchical categories with sorting
- **Analytics Dashboard**: Revenue, orders, and product statistics
- **Store Settings**: Configure store info, delivery fees, and notifications
- **Admin Profile**: Password change and activity tracking

### Technical Features
- **TypeScript Strict Mode**: Full type safety across the codebase
- **Row Level Security**: PostgreSQL RLS policies for data protection
- **Rate Limiting**: Configurable rate limits per endpoint
- **Input Validation**: Zod schemas shared between frontend and backend
- **Image Optimization**: WebP conversion with responsive images
- **i18n Support**: Complete Arabic and English translations
- **Dark Mode**: Full dark mode support across the application

---

## Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Framework | Next.js 14+ (App Router) | Full-stack React with SSR/SSG |
| Language | TypeScript 5+ | Type safety |
| Styling | Tailwind CSS 3+ | Utility-first CSS |
| UI | shadcn/ui + Radix UI | Accessible components |
| Animation | Framer Motion | Smooth transitions |
| State | Zustand | Client state management |
| Server State | TanStack Query | Data fetching and caching |
| Forms | React Hook Form + Zod | Form handling and validation |
| i18n | next-intl | Internationalization |
| Icons | Lucide React | Icon library |
| Charts | Recharts | Analytics visualization |
| Database | Supabase PostgreSQL | Primary database |
| Auth | Custom JWT + bcryptjs | Authentication |
| Storage | Supabase Storage | Image/file storage |
| Email | Nodemailer | Email notifications |

---

## Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Customer      │     │   Next.js 14    │     │   Supabase      │
│   Browser       │────▶│   App Router    │────▶│   PostgreSQL    │
│   (RTL Arabic)  │     │   API Routes    │     │   Storage       │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                               │
                               ▼
                        ┌─────────────────┐
                        │   Admin         │
                        │   Dashboard     │
                        │   (LTR/RTL)     │
                        └─────────────────┘
```

The architecture follows a modern full-stack pattern:
- **Frontend**: Next.js App Router with server and client components
- **API Layer**: Next.js API routes with middleware for auth and rate limiting
- **Database**: Supabase PostgreSQL with Row Level Security policies
- **Storage**: Supabase Storage for product images
- **Auth**: Custom JWT implementation with refresh tokens

---

## Database Schema

### Core Tables
- **users**: Admin users with roles (super_admin, admin, viewer)
- **categories**: Product categories with hierarchical support
- **products**: Products with multi-language names, images, and SEO
- **orders**: Customer orders with full lifecycle tracking
- **order_items**: Line items for each order
- **audit_logs**: Audit trail for admin actions
- **settings**: Store configuration key-value storage

### Key Features
- Auto-generated order numbers (FLY-YYMMDD-XXXX)
- Auto-updated timestamps via triggers
- Full-text search indexes for Arabic and English
- Foreign key constraints with proper cascade rules
- RLS policies for secure data access

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm (recommended) or npm
- Supabase account
- Vercel account (for deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/floya-store.git
cd floya-store

# Install dependencies
pnpm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run database migrations in Supabase SQL Editor
# (See supabase/migrations/)

# Start development server
pnpm dev
```

The application will be available at `http://localhost:3000`.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_APP_URL` | Yes | Application URL |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key |
| `JWT_SECRET` | Yes | 64+ character secret for JWT signing |
| `SMTP_HOST` | No | SMTP server for email |
| `SMTP_USER` | No | SMTP username |
| `SMTP_PASSWORD` | No | SMTP password |

See `.env.example` for the complete list.

---

## Development

```bash
# Run development server
pnpm dev

# Run linter
pnpm lint

# Run type check
pnpm type-check

# Run tests
pnpm test

# Run E2E tests
pnpm test:e2e

# Build for production
pnpm build
```

---

## Project Structure

```
floya-store/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (store)/           # Customer-facing routes
│   │   ├── (auth)/            # Auth routes
│   │   ├── admin/             # Admin dashboard
│   │   └── api/               # API endpoints
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   ├── store/             # Store components
│   │   ├── admin/             # Admin components
│   │   ├── auth/              # Auth components
│   │   └── shared/            # Shared components
│   ├── lib/                   # Utilities and clients
│   ├── hooks/                 # Custom React hooks
│   ├── stores/                # Zustand stores
│   ├── types/                 # TypeScript types
│   ├── config/                # Configuration
│   └── i18n/                  # Translations
├── supabase/migrations/        # Database migrations
├── tests/                      # Test suites
└── public/                     # Static assets
```

---

## API Documentation

### Authentication
- `POST /api/auth/login` - Login with username/password
- `POST /api/auth/logout` - Logout and invalidate tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user
- `POST /api/auth/change-password` - Change password
- `POST /api/auth/forgot-password` - Request password reset

### Products
- `GET /api/products` - List products (public)
- `GET /api/products/[id]` - Get product details (public)
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Categories
- `GET /api/categories` - List categories (public)
- `POST /api/categories` - Create category (admin)
- `PUT /api/categories/[id]` - Update category (admin)
- `DELETE /api/categories/[id]` - Delete category (super_admin)

### Orders
- `GET /api/orders` - List orders (admin)
- `GET /api/orders/[id]` - Get order details (admin)
- `POST /api/orders` - Create order (public)
- `PATCH /api/orders/[id]` - Update order status (admin)

### Other
- `POST /api/upload` - Upload images (admin)
- `GET /api/stats` - Dashboard statistics (admin)
- `GET/PUT /api/settings` - Store settings (admin/super_admin)

---

## Authentication

The authentication system uses a custom JWT implementation:
- **Access Token**: Short-lived (15 minutes), stored in memory
- **Refresh Token**: Long-lived (7 days), stored in httpOnly cookie
- **Password Security**: bcrypt with 12 salt rounds
- **Account Protection**: Lockout after 5 failed attempts for 30 minutes
- **Role-Based Access**: super_admin, admin, viewer roles

---

## Deployment Guide

### Supabase Setup
1. Create a new Supabase project
2. Run all migration files in `supabase/migrations/` in order
3. Create the `product-images` storage bucket
4. Configure CORS for your domain
5. Create the first admin user via SQL

### Vercel Setup
1. Import your GitHub repository
2. Configure environment variables from `.env.example`
3. Set framework preset to Next.js
4. Deploy

See the full deployment checklist in the specification document.

---

## Admin Guide

### First Login
1. Navigate to `/login`
2. Use the admin credentials created during setup
3. You'll be redirected to the admin dashboard

### Managing Products
1. Go to "المنتجات" (Products) in the sidebar
2. Click "إضافة منتج" to create a new product
3. Fill in the required fields (Arabic name, English name, price, category)
4. Upload product images
5. Click "حفظ المنتج"

### Managing Orders
1. Go to "الطلبات" (Orders) in the sidebar
2. View all orders with filtering by status
3. Click on an order number to view details
4. Update order status with valid transitions
5. Add tracking numbers for shipped orders

---

## Security

- **Password Hashing**: bcrypt with 12 rounds
- **JWT Security**: HMAC-SHA256 with 64+ character secret
- **Rate Limiting**: Configurable per endpoint
- **Input Validation**: Zod schemas on all endpoints
- **SQL Injection Prevention**: Parameterized queries only
- **XSS Prevention**: Content Security Policy, escaped output
- **CSRF Protection**: SameSite cookies
- **File Upload Security**: Type validation, size limits, magic bytes
- **RLS Policies**: Row Level Security on all tables

---

## Testing

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage
pnpm test --coverage
```

Tests cover:
- Validation schemas (Zod)
- Utility functions
- API endpoints
- Authentication flows
- E2E customer journey
- E2E admin workflows

---

## Troubleshooting

### Build Errors
- Ensure all environment variables are set
- Check TypeScript strict mode compliance
- Verify all imports use `@/` path alias

### Database Issues
- Run migrations in correct order
- Verify RLS policies are enabled
- Check Supabase connection settings

### Authentication Problems
- Verify JWT_SECRET is 64+ characters
- Check cookie settings in production
- Ensure refresh token cookie is set

---

## License

This project is licensed under the MIT License.

---

## Contact

- **Email**: contact@floya.dz
- **WhatsApp**: +213 555 123 456
- **Website**: https://floya.dz

---

<p align="center">
  <strong>Built with love for the Algerian market</strong>
</p>
