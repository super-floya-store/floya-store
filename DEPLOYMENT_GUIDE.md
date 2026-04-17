# Floya Store - Complete Deployment Guide

## Admin Credentials
- **Username:** `admin`
- **Password:** `floyastore1999`
- **To change in the future:** Update the `ADMIN_PASSWORD` in Vercel Environment Variables

---

## Step 1: Set Up Database (DO THIS FIRST!)

1. Go to your Supabase project: https://supabase.com/dashboard/project/cvpsslbfswjduqxvrsxi
2. Click on **SQL Editor** (left sidebar)
3. Click **New query**
4. Copy the entire contents of `supabase_schema.sql` file
5. Paste it in the SQL Editor
6. Click **Run**
7. You should see "Success" message

**Important:** This creates the tables and default products. Don't skip this step!

---

## Step 2: Deploy to Vercel

### Option A: Connect GitHub Repo (Recommended)

1. Go to your Vercel dashboard: https://vercel.com/chrifabdrahim61-hubs-projects
2. Click **Add New...** → **Project**
3. Select your `Floya-Store` GitHub repository
4. Click **Import**
5. Configure:
   - Framework Preset: `Other`
   - Root Directory: `./` (leave as is)
   - Build Command: leave empty
   - Output Directory: leave empty
6. Click **Deploy**

Wait for deployment to complete, then:

### Option B: Deploy with Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Go to your project folder
cd "floya store"

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

---

## Step 3: Add Environment Variables

After first deployment:

1. In Vercel dashboard, click on your deployed project
2. Go to **Settings** → **Environment Variables**
3. Add these variables one by one:

| Name | Value |
|------|-------|
| `SUPABASE_URL` | `https://cvpsslbfswjduqxvrsxi.supabase.co` |
| `SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTEwMTEsImV4cCI6MjA5MjAyNzAxMX0.DETW2-CAdC6Pikh2h6svyg3j_yf7Iw2eW_D96zGOYs0` |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MTAxMSwiZXhwIjoyMDkyMDI3MDExfQ.ociVVdlgZkzTJP2IFYBN3uPPhfoPtlRln878pvXFYrY` |
| `ADMIN_USERNAME` | `admin` |
| `ADMIN_PASSWORD` | `floyastore1999` |
| `ADMIN_TOKEN` | `floyastore-admin-token-2024` |

4. Click **Save**
5. Go to **Deployments** tab
6. Click the three dots on the latest deployment → **Redeploy**

---

## Step 4: Test Your Live Site

Once redeployed, your site will be live at:
`https://floya-store.vercel.app` (or similar)

- **Customer Store:** `/` (homepage)
- **Admin Panel:** `/admin`

---

## How to Change Admin Password in the Future

1. Go to Vercel dashboard → your project → Settings → Environment Variables
2. Find `ADMIN_PASSWORD`
3. Click **Edit** → enter new password
4. Click **Save**
5. Redeploy the project

---

## Troubleshooting

### "Cannot connect to database" error
→ You forgot to run the SQL schema in Supabase. Go back to Step 1.

### "Unauthorized" when logging in
→ Environment variables not set correctly. Check Step 3.

### Products not showing
→ Database tables not created. Run the SQL schema again.

### Images not loading
→ Check browser console for errors. Might be CORS issues.

---

## Your Live Links Will Be:

**Store:** `https://floya-store-[random].vercel.app`
**Admin:** `https://floya-store-[random].vercel.app/admin`

(You'll see the exact URL after deployment)
