@echo off
chcp 65001 >nul
echo ==========================================
echo    Floya Store - Auto Deployment Script
echo ==========================================
echo.

:: Check if git is available
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Git is not installed or not in PATH
    echo Please install Git from: https://git-scm.com/download/win
    pause
    exit /b 1
)

:: Check if node/npm is available
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed
    echo Please install Node.js from: https://nodejs.org/
    pause
    exit /b 1
)

echo [1/5] Installing Vercel CLI...
npm install -g vercel

echo.
echo [2/5] Committing changes to Git...
cd /d "%~dp0"
git add .
git commit -m "Prepare for deployment with backend API" || echo No changes to commit
git push origin main

echo.
echo [3/5] Setting up environment variables...
echo Creating .env.production file...
(
echo SUPABASE_URL=https://cvpsslbfswjduqxvrsxi.supabase.co
echo SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTEwMTEsImV4cCI6MjA5MjAyNzAxMX0.DETW2-CAdC6Pikh2h6svyg3j_yf7Iw2eW_D96zGOYs0
echo SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MTAxMSwiZXhwIjoyMDkyMDI3MDExfQ.ociVVdlgZkzTJP2IFYBN3uPPhfoPtlRln878pvXFYrY
echo ADMIN_USERNAME=admin
echo ADMIN_PASSWORD=floyastore1999
echo ADMIN_TOKEN=floyastore-admin-token-2024
) > .env.production

echo.
echo [4/5] Logging into Vercel...
echo Please complete login in the browser window that opens...
vercel login

echo.
echo [5/5] Deploying to Vercel...
echo This will deploy your project with all environment variables...
vercel --prod --yes -e SUPABASE_URL="https://cvpsslbfswjduqxvrsxi.supabase.co" -e SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NTEwMTEsImV4cCI6MjA5MjAyNzAxMX0.DETW2-CAdC6Pikh2h6svyg3j_yf7Iw2eW_D96zGOYs0" -e SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN2cHNzbGJmc3dqZHVxeHZyc3hpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjQ1MTAxMSwiZXhwIjoyMDkyMDI3MDExfQ.ociVVdlgZkzTJP2IFYBN3uPPhfoPtlRln878pvXFYrY" -e ADMIN_USERNAME="admin" -e ADMIN_PASSWORD="floyastore1999" -e ADMIN_TOKEN="floyastore-admin-token-2024"

echo.
echo ==========================================
echo    Deployment Complete!
echo ==========================================
echo.
echo Your site should be live at:
echo Check the URL shown above (ends with .vercel.app)
echo.
echo Admin Panel: https://YOUR-URL/admin
echo Username: admin
echo Password: floyastore1999
echo.
echo IMPORTANT: Don't forget to run the SQL in Supabase!
echo Go to: https://supabase.com/dashboard/project/cvpsslbfswjduqxvrsxi
echo SQL Editor ^> New Query ^> Paste schema ^> Run
echo.
pause
