# Floya Store - E-commerce Platform

## 🚀 Project Overview

Floya Store is a modern e-commerce platform built with Express.js backend and vanilla JavaScript frontend. This project has been refactored from a single-file architecture to a modular, maintainable codebase following best practices.

## 📁 Project Structure

```
/workspace
├── src/                      # Modular frontend source code
│   ├── admin-app.js          # Main admin application entry point
│   ├── components/           # UI components
│   │   └── ui.js            # UI rendering and interactions
│   ├── services/            # API service layer
│   │   ├── auth.js         # Authentication service
│   │   ├── products.js     # Product CRUD operations
│   │   └── orders.js       # Order management
│   ├── utils/              # Utility functions
│   │   ├── storage.js     # LocalStorage wrapper
│   │   └── validators.js  # Input validation
│   └── styles/            # Separated CSS
│       └── main.css      # Main stylesheet
├── routes/                 # Backend API routes
│   ├── auth.js            # Authentication endpoints
│   ├── products.js        # Product management
│   └── orders.js          # Order handling
├── middleware/            # Express middleware
│   └── auth.js           # JWT authentication
├── scripts/              # Database and utility scripts
├── tests/               # Test files (coming soon)
├── docs/                # Documentation
├── public/             # Static assets
├── api/               # Vercel serverless functions
├── server.js          # Express server entry point
├── database.js        # Database abstraction layer
└── package.json       # Dependencies and scripts
```

## 🔧 Key Improvements (v2.0)

### Architecture
- ✅ **Modular Code Structure**: Separated concerns into services, components, and utilities
- ✅ **ES6 Modules**: Using import/export for better code organization
- ✅ **No Global Variables**: Encapsulated state in class instances
- ✅ **Separation of Concerns**: Logic, UI, and styling are now separate

### Security Enhancements
- ✅ **Input Validation**: Comprehensive validation on both client and server
- ✅ **XSS Protection**: HTML escaping for all user-generated content
- ✅ **SQL Injection Prevention**: Parameterized queries throughout
- ✅ **Rate Limiting**: Configured for auth and API endpoints
- ✅ **CSRF Protection**: Token-based CSRF protection
- ✅ **Password Requirements**: Strong password enforcement

### Performance
- ✅ **Pagination Support**: Load data in chunks instead of all at once
- ✅ **Lazy Loading**: Components load only when needed
- ✅ **Event Delegation**: Reduced event listener overhead
- ✅ **CSS Optimization**: Separated stylesheet with variables

### Code Quality
- ✅ **Error Handling**: Try-catch blocks with proper error propagation
- ✅ **Type Checking**: Runtime type validation for all inputs
- ✅ **Code Comments**: JSDoc-style documentation
- ✅ **Consistent Formatting**: ESLint configuration included

## 🛠️ Setup & Installation

### Prerequisites
- Node.js >= 16.0.0
- npm or yarn
- Supabase account (for production) OR SQLite (for development)

### Installation Steps

1. **Clone the repository**
```bash
cd /workspace
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your credentials
```

4. **Initialize the database**
```bash
npm run init-db
```

5. **Start development server**
```bash
npm run dev
```

6. **Access the application**
- Storefront: http://localhost:3000
- Admin Panel: http://localhost:3000/admin

## 🔐 Default Admin Credentials

**⚠️ IMPORTANT**: Change these immediately after first login!

- Username: `admin`
- Password: Check console logs after running `npm run init-db`

Or set your own:
```env
INITIAL_ADMIN_PASSWORD=your-secure-password
```

## 📦 Available Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm run init-db` | Initialize database and create default admin |
| `npm run check-admin` | Check if admin user exists |
| `npm run reset-admin` | Reset admin password |
| `npm test` | Run tests (coming soon) |
| `npm run lint` | Run ESLint |
| `npm run security-audit` | Run npm audit |

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/change-password` - Change password

### Products
- `GET /api/products` - Get all products (public)
- `GET /api/products/:id` - Get single product (public)
- `POST /api/products` - Create product (protected)
- `PUT /api/products/:id` - Update product (protected)
- `DELETE /api/products/:id` - Delete product (protected)

### Orders
- `GET /api/orders` - Get all orders (protected)
- `GET /api/orders/stats` - Get order statistics (protected)
- `POST /api/orders` - Create order (public)
- `PATCH /api/orders/:id/status` - Update order status (protected)
- `DELETE /api/orders/:id` - Delete order (protected)

## 🛡️ Security Features

1. **JWT Authentication**: Secure token-based auth with expiration
2. **Password Hashing**: bcrypt with salt rounds
3. **Input Sanitization**: All user inputs sanitized
4. **Rate Limiting**: Prevents brute force attacks
5. **CORS Configuration**: Configurable allowed origins
6. **Helmet.js**: Security headers
7. **CSRF Protection**: Token-based CSRF prevention

## 📊 Database Schema

### Products Table
```sql
- id (TEXT PRIMARY KEY)
- name (TEXT NOT NULL)
- description (TEXT)
- price (REAL NOT NULL)
- promo_price (REAL)
- category (TEXT NOT NULL)
- image (TEXT)
- stock (INTEGER DEFAULT 0)
- is_active (INTEGER DEFAULT 1)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Orders Table
```sql
- id (TEXT PRIMARY KEY)
- product_id (TEXT NOT NULL)
- product_name (TEXT NOT NULL)
- product_price (REAL NOT NULL)
- customer_name (TEXT NOT NULL)
- customer_state (TEXT NOT NULL)
- customer_phone (TEXT NOT NULL)
- status (TEXT DEFAULT 'جديد')
- notes (TEXT)
- created_at (DATETIME)
- updated_at (DATETIME)
```

### Admin Users Table
```sql
- id (INTEGER PRIMARY KEY)
- username (TEXT UNIQUE NOT NULL)
- password_hash (TEXT NOT NULL)
- role (TEXT DEFAULT 'admin')
- is_active (INTEGER DEFAULT 1)
- token_version (INTEGER DEFAULT 0)
- created_at (DATETIME)
```

## 🚨 Common Issues & Solutions

### Issue: "JWT_SECRET environment variable is required"
**Solution**: Add `JWT_SECRET` to your `.env` file (minimum 32 characters)

### Issue: "Too many login attempts"
**Solution**: Wait 15 minutes or restart the server (development only)

### Issue: Products not loading
**Solution**: Check browser console for errors, verify API is running

### Issue: Can't login with default credentials
**Solution**: Run `npm run reset-admin` to reset admin password

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Support

For issues and questions:
- GitHub Issues: [Create an issue]
- Email: support@floya-store.com

---

**Built with ❤️ by Floya Store Team**

*Last Updated: 2024*
