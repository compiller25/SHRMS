# SMRS Deployment - Quick Start Guide

**You're at Task 2: Configure Render for backend deployment**

---

## Current Status

✅ Code pushed to: https://github.com/compiller25/SHRMS
- All commits attributed to: Steven Emmanuel (mwakasalasteven19@gmail.com)
- Main branch ready
- Configuration files prepared

---

## What's Next: Deploy Backend to Render

### Step 1: Go to Render Dashboard

1. Open https://render.com (login with your GitHub account)
2. Click **"New"** → **"Web Service"**

### Step 2: Connect GitHub Repository

1. Click **"Connect account"** if needed
2. Select `compiller25/SHRMS` repository
3. Click **"Connect"**

### Step 3: Fill in Service Settings

| Setting | Value |
|---------|-------|
| Name | `smrs-backend` |
| Environment | `Python 3` |
| Region | `Oregon` |
| Branch | `main` |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt && python manage.py migrate` |
| Start Command | `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT` |
| Plan | `Free` |

### Step 4: Add Environment Variables

Click **"Add Environment Variable"** and add these one by one:

```
DEBUG=false
ALLOWED_HOSTS=*.onrender.com,localhost
SECRET_KEY=django-insecure-zrz7tv5&ecvt&-i@_fh#uzczm8x$d-ntxg@)s=k$7)3=s9amxm
CLICKPESA_CLIENT_ID=ID68e126iay3hfTH5HPlj7Keo8Hb3HFT
CLICKPESA_API_KEY=SKv8YbGuI4OLYaHKVoaK5FAyDzU0b8xebWc2rKLLJv
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
CORS_ALLOWED_ORIGINS=https://compiller25.github.io/SHRMS
```

**⚠️ Don't have Google OAuth credentials?** Leave those blank for now and we'll add them later.

### Step 5: Click "Create Web Service"

Wait for deployment to complete (3-5 minutes). You'll see:
- ✓ Build logs
- ✓ Migration running
- ✓ Service deployed

Your backend URL: `https://smrs-backend.onrender.com`

### Step 6: Test Backend

Once deployed, run in your terminal:

```bash
curl https://smrs-backend.onrender.com/api/auth/profile/
```

You should get a 401 response (not authenticated) - this is good!

---

## After Render Deployment is Complete

Tell me and we'll move to:
- ✅ Task 2: Configure Render ← **YOU ARE HERE**
- Task 3: Update frontend API URL
- Task 4: Build and deploy frontend to GitHub Pages
- Task 5: Test production URLs

---

## Quick Reference

**Your Production URLs:**
- Frontend: https://compiller25.github.io/SHRMS
- Backend: https://smrs-backend.onrender.com

**Test Credentials:**
- Email: `landlord@smrs.com`
- Password: `Landlord@123456`

---

## Help?

- Render Docs: https://render.com/docs
- Check Render Logs: Dashboard → smrs-backend → Logs
- See detailed guide: `RENDER_SETUP.md`

---

**Start Render deployment now, then let me know when it's done!** 🚀
