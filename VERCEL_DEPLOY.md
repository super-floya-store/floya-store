# ONE-CLICK DEPLOY

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fchrifabdrahim61-hub%2FFloya-Store&project-name=floya-store&repository-name=floya-store&env=SUPABASE_URL,SUPABASE_ANON_KEY,SUPABASE_SERVICE_ROLE_KEY,ADMIN_USERNAME,ADMIN_PASSWORD,ADMIN_TOKEN)

## Deploy Steps:

### 1. Click the button above ☝️

### 2. You'll see this screen:
   - **Git Scope**: Select your account
   - **Repository Name**: `Floya-Store` (keep it or change it)
   - **Project Name**: `floyastore` (suggested)

### 3. Environment Variables (Copy-Paste These):

Click "Add" for each variable and paste these values:

**SUPABASE_URL:**
```
https://cvpsslbfswjduqxvrsxi.supabase.co
```

**SUPABASE_ANON_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTEwMTEsImV4cCI6MjA5MjAyNzAxMX0.DETW2-CAdC6Pikh2h6svyg3j_yf7Iw2eW_D96zGOYs0
```

**SUPABASE_SERVICE_ROLE_KEY:**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MTAxMSwiZXhwIjoyMDkyMDI3MDExfQ.ociVVdlgZkzTJP2IFYBN3uPPhfoPtlRln878pvXFYrY
```

**ADMIN_USERNAME:**
```
admin
```

**ADMIN_PASSWORD:**
```
floyastore1999
```

**ADMIN_TOKEN:**
```
floyastore-admin-token-2024
```

### 4. Click "Deploy"

Wait 2-3 minutes...

### 5. Done! Your site is live!

**Your URLs:**
- Store: `https://floyastore.vercel.app`
- Admin: `https://floyastore.vercel.app/admin`

**Admin Login:**
- Username: `admin`
- Password: `floyastore1999`

---

## ⚠️ IMPORTANT: SET UP DATABASE

After deployment, you MUST run the database setup:

1. Go to: https://supabase.com/dashboard/project/cvpsslbfswjduqxvrsxi
2. Click **"SQL Editor"** (left sidebar)
3. Click **"New query"**
4. Copy the code below and paste it:

```sql
-- Floya Store Database Schema
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL,
    promo_price INTEGER,
    category TEXT NOT NULL,
    image TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id),
    product_name TEXT NOT NULL,
    product_price INTEGER NOT NULL,
    customer_name TEXT NOT NULL,
    customer_state TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    status TEXT DEFAULT 'جديد',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

INSERT INTO products (name, description, price, promo_price, category, image) VALUES
('مزهرية خرسانية أنيقة', 'مزهرية يدوية الصنع من الخرسانة المصقولة', 2500, 1800, 'ديكور', 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop'),
('حامل شموع خرساني', 'حامل شموع بتصميم عصري من الخرسانة الناعمة', 1200, NULL, 'ديكور', 'https://images.unsplash.com/photo-1603006905003-be475563bc59?w=400&h=400&fit=crop'),
('لوحة اسماء للأطفال', 'لوحة اسم مخصصة للطفل من الخرسانة الملونة', 800, NULL, 'اطفال', 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=400&fit=crop'),
('طقم توزيعات خرسانية', 'طقم توزيعات متناسق يشمل صناديق صغيرة', 3000, 2200, 'توزيعات', 'https://images.unsplash.com/photo-1513519245088-0e12902e35ca?w=400&h=400&fit=crop'),
('صندوق هدية فاخر', 'صندوق هدية خرساني فاخر مع بطاقة مخصصة', 3500, NULL, 'الهدايا', 'https://images.unsplash.com/photo-1512909006721-3d6018887383?w=400&h=400&fit=crop');
```

5. Click **"Run"**

✅ Done! Your store is now fully working!

---

## How to Change Admin Password Later:

1. Go to https://vercel.com/dashboard
2. Click your `floyastore` project
3. Settings → Environment Variables
4. Find `ADMIN_PASSWORD`, click **Edit**
5. Enter new password, click **Save**
6. Redeploy: Deployments → Click three dots → Redeploy

---

**Your site will be live at:** `https://floyastore.vercel.app` 🎉
