# Floya Store

متجر Floya - متجر إلكتروني للديكورات والمنتجات الخرسانية

## Project Structure

```
floya-store/
├── index.html          # Customer storefront
├── admin.html          # Admin dashboard
├── package.json        # Dependencies
├── vercel.json         # Vercel config
├── supabase_schema.sql # Database schema
├── README.md           # This file
├── js/
│   └── api.js          # API client
└── api/                # Serverless functions
    ├── auth.js         # Admin login
    ├── products.js     # List/Create products
    ├── products/
    │   └── [id].js     # Get/Update/Delete product
    ├── orders.js       # List/Create orders
    └── orders/
        └── [id].js     # Update/Delete order
```

## Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Once created, go to the SQL Editor
4. Copy the contents of `supabase_schema.sql` and run it
5. Go to Project Settings > API to get your credentials:
   - Project URL (`SUPABASE_URL`)
   - Anon public key (`SUPABASE_ANON_KEY`)
   - Service role key (`SUPABASE_SERVICE_ROLE_KEY`) - keep this secret!

### 2. Configure Environment Variables

Create a `.env.local` file (copy from `.env.local.example`):

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_secure_password_here

# JWT Secret (can be any random string)
ADMIN_TOKEN=your_random_token_here
```

### 3. Deploy to Vercel

#### Option A: Using Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy:
   ```bash
   cd "floya store"
   vercel --prod
   ```

4. Add environment variables in Vercel Dashboard:
   - Go to your project settings
   - Navigate to Environment Variables
   - Add all variables from `.env.local`

#### Option B: Using Vercel Web Interface

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Configure build settings (should auto-detect)
5. Add environment variables in the settings
6. Deploy

### 4. Access Your Store

- Customer store: `https://your-project.vercel.app`
- Admin panel: `https://your-project.vercel.app/admin`

Default admin credentials:
- Username: `admin` (or what you set in ADMIN_USERNAME)
- Password: your chosen ADMIN_PASSWORD

## Features

### Customer Features
- Browse products with filters and search
- View product details
- Place orders with phone validation
- Algerian wilayas support

### Admin Features
- Secure login
- Dashboard with statistics
- Add/Edit/Delete products
- Manage orders and update statuses
- Image upload (base64)

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product (admin) |
| GET | `/api/products/:id` | Get single product |
| PUT | `/api/products/:id` | Update product (admin) |
| DELETE | `/api/products/:id` | Delete product (admin) |
| GET | `/api/orders` | List all orders (admin) |
| POST | `/api/orders` | Create order (public) |
| PUT | `/api/orders/:id` | Update order status (admin) |
| DELETE | `/api/orders/:id` | Delete order (admin) |
| POST | `/api/auth` | Admin login |

## Free Tier Limits

### Vercel (Hobby Plan)
- Serverless Functions: 100 GB-hours
- Bandwidth: 100 GB
- Build time: 6,000 minutes/month

### Supabase (Free Tier)
- Database: 500 MB
- Auth: Unlimited users
- API requests: Unlimited (fair use)
- Storage: 1 GB

## Customization

### Change Default Products
Edit `supabase_schema.sql` and modify the INSERT statements, then run the SQL in Supabase.

### Change Colors/Theme
Edit CSS variables in `index.html` and `admin.html`:

```css
:root {
    --primary: #C17B7B;
    --primary-light: #D9A5A5;
    --primary-dark: #A06060;
    /* ... */
}
```

### Change Logo
Replace the image URLs in both HTML files with your own logo URL.

## Troubleshooting

### API 500 errors
Check Vercel logs for detailed error messages.

### Database connection issues
Verify your Supabase credentials are correct in the environment variables.

### CORS errors
The API already includes CORS headers. If issues persist, check your Supabase CORS settings.

## License

MIT
