# Floya Store

E-commerce store with Node.js/Express backend and Supabase PostgreSQL database.

## Features

- **Products API**: Full CRUD operations
- **Orders API**: Order management with status tracking
- **Authentication**: JWT-based with rate limiting
- **Security**: XSS protection, CSRF tokens, rate limiting
- **Database**: Supabase PostgreSQL (production) / SQLite (local)

## Quick Start

### 1. Clone and Install

```bash
cd "floya store"
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a project
2. In the SQL Editor, run the contents of `supabase-schema.sql`
3. Go to Project Settings > API and copy:
   - `URL` → set as `SUPABASE_URL`
   - `service_role key` → set as `SUPABASE_SERVICE_KEY`

### 3. Configure Environment

```bash
# Copy example file
cp .env.example .env

# Edit .env and add your Supabase credentials
```

### 4. Run Locally

```bash
# Development server
npm run dev

# Production mode
npm start
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | 64+ character string for JWT signing |
| `SUPABASE_URL` | Production | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Production | Supabase service role key |
| `PORT` | No | Server port (default: 3000) |
| `NODE_ENV` | No | Environment (development/production) |
| `ALLOWED_ORIGINS` | No | Comma-separated CORS origins |

## Deploy to Vercel

### 1. Push to GitHub

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit"

# Create GitHub repo and push
git remote add origin https://github.com/YOUR_USERNAME/floya-store.git
git branch -M main
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to [vercel.com](https://vercel.com) and import your GitHub repo
2. Add environment variables in Vercel Dashboard:
   - `JWT_SECRET` - Generate with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
   - `SUPABASE_URL` - Your Supabase URL
   - `SUPABASE_SERVICE_KEY` - Your Supabase service role key
   - `ALLOWED_ORIGINS` - Your Vercel domain (e.g., `https://your-project.vercel.app`)

3. Deploy!

### Default Admin Credentials

- **Username**: `admin`
- **Password**: Check Vercel logs on first deploy or set `INITIAL_ADMIN_PASSWORD`

## API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/profile` | Get profile |
| POST | `/api/auth/change-password` | Change password |

### Products (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List products |
| GET | `/api/products/:id` | Get product |

### Products (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/products` | Create product |
| PUT | `/api/products/:id` | Update product |
| DELETE | `/api/products/:id` | Delete product |

### Orders (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/orders` | Create order |

### Orders (Admin)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/orders` | List orders |
| GET | `/api/orders/stats` | Statistics |
| PATCH | `/api/orders/:id/status` | Update status |
| DELETE | `/api/orders/:id` | Delete order |

## File Structure

```
floya store/
├── api/
│   └── index.js          # Vercel serverless handler
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── products.js       # Product routes
│   └── orders.js         # Order routes
├── middleware/
│   └── auth.js           # JWT middleware
├── database.js           # Database adapter (SQLite/Supabase)
├── supabase-schema.sql   # Database schema
├── vercel.json           # Vercel config
├── package.json
└── .env.example
```

## License

MIT
