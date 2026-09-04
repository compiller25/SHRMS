# Quick Deployment Checklist

## Your Information
Fill in these details:
- **GitHub Username:** ___________________
- **Google OAuth Client ID:** ___________________
- **Google OAuth Client Secret:** ___________________

---

## Step 1: Push to GitHub ✅ (Ready)

Code is already initialized and committed locally. Now push to GitHub:

```bash
cd /home/egovridc27/Desktop/SEAN/projects/advanced/projects/desktop-softwares/SMRS

# Replace USERNAME with your GitHub username
git remote add origin https://github.com/USERNAME/smrs-rental-system.git
git push -u origin main
```

### What to do:
1. Create empty repo on GitHub: https://github.com/new
   - Name: `smrs-rental-system`
   - Public (required for Pages)
   - Click "Create repository"
2. Run the git push command above
3. Wait for push to complete

---

## Step 2: Deploy Backend to Render

### 2.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub

### 2.2 Connect Repository
1. Click "New" → "Web Service"
2. Connect your GitHub repo: `smrs-rental-system`
3. Fill in settings:
   - **Name:** `smrs-backend`
   - **Environment:** Python
   - **Region:** Oregon (or closest to you)
   - **Build Command:**
     ```
     pip install -r requirements.txt && python manage.py migrate
     ```
   - **Start Command:**
     ```
     gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
     ```

### 2.3 Add Environment Variables (IMPORTANT!)

In Render dashboard, add these variables for your service:

```
DEBUG = false
ALLOWED_HOSTS = *.onrender.com,localhost
SECRET_KEY = django-insecure-zrz7tv5&ecvt&-i@_fh#uzczm8x$d-ntxg@)s=k$7)3=s9amxm
CLICKPESA_CLIENT_ID = ID68e126iay3hfTH5HPlj7Keo8Hb3HFT
CLICKPESA_API_KEY = SKv8YbGuI4OLYaHKVoaK5FAyDzU0b8xebWc2rKLLJv
GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET
CORS_ALLOWED_ORIGINS = https://USERNAME.github.io/smrs-rental-system
```

Replace `YOUR_GOOGLE_CLIENT_ID`, `YOUR_GOOGLE_CLIENT_SECRET`, and `USERNAME` with your values.

### 2.4 Deploy
- Click "Create Web Service"
- Wait for build to complete (~3-5 minutes)
- Your backend URL: `https://smrs-backend.onrender.com`

---

## Step 3: Update Frontend Configuration

### 3.1 Update `frontend/.env`

Edit the file and replace:

```env
VITE_API_BASE_URL=https://smrs-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_FRONTEND_URL=https://USERNAME.github.io/smrs-rental-system
VITE_BACKEND_URL=https://smrs-backend.onrender.com
```

### 3.2 Update `frontend/src/services/api.js`

Make sure it uses the env variable:

```javascript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://smrs-backend.onrender.com/api';
```

### 3.3 Commit Changes

```bash
git add frontend/.env frontend/src/services/api.js
git commit -m "Configure frontend for production deployment"
git push origin main
```

---

## Step 4: Enable GitHub Pages

1. Go to your GitHub repository
2. Click "Settings" → "Pages"
3. Under "Build and deployment":
   - **Source:** Deploy from a branch
   - **Branch:** `gh-pages` / `root`
4. Click "Save"

The workflow will automatically build and deploy when you push!

**Your frontend URL:** `https://USERNAME.github.io/smrs-rental-system`

---

## Step 5: Test Everything

### Backend Health Check
```bash
curl https://smrs-backend.onrender.com/api/auth/profile/
# Should return 401 (not authenticated)
```

### Frontend Load Test
1. Open: `https://USERNAME.github.io/smrs-rental-system`
2. Should see login page

### Full Login Test
1. Go to login page
2. Login with:
   - Email: `landlord@smrs.com`
   - Password: `Landlord@123456`
3. Should redirect to dashboard

### Google OAuth Test
1. Click "Sign in with Google"
2. Select your Google account
3. Should create account and login

---

## Deployment Complete! 🎉

Your system is now live:
- **Frontend:** https://USERNAME.github.io/smrs-rental-system
- **Backend:** https://smrs-backend.onrender.com

Share the frontend URL with your client!

---

## Troubleshooting

### "CORS error" on login
- Update `CORS_ALLOWED_ORIGINS` in Render env vars
- Restart Render service

### "Page not found" on GitHub Pages
- Check vite.config.js has correct base: `/smrs-rental-system/`
- Clear browser cache (Ctrl+Shift+Delete)

### Backend not deploying
- Check Render logs for errors
- Ensure requirements.txt has all dependencies
- Verify environment variables are set

### Google OAuth not working
- Check Client ID matches in frontend and backend
- Add redirect URI to Google Cloud Console: `https://USERNAME.github.io/smrs-rental-system/login`

---

**Need help?** Check:
- Render Logs: Dashboard → Services → Logs
- GitHub Actions: Your repo → Actions → Deploy logs
- Browser Console: F12 → Console tab for errors
