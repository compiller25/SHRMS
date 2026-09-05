# Render Backend Deployment Setup

## Quick Summary

Your backend will be deployed on Render (free tier) at: `https://smrs-backend.onrender.com`

---

## Step-by-Step Render Deployment

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub account
5. Complete signup

### Step 2: Create Web Service

1. In Render Dashboard, click **"New"** → **"Web Service"**
2. Connect your GitHub repository:
   - Click "Connect account" (if needed)
   - Select `compiller25/SHRMS` repository
   - Click "Connect"

### Step 3: Configure Service Settings

Fill in these fields:

| Field | Value |
|-------|-------|
| **Name** | `smrs-backend` |
| **Environment** | `Python 3` |
| **Region** | `Oregon` (closest to you) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt && python manage.py migrate` |
| **Start Command** | `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT` |
| **Plan** | `Free` |

### Step 4: Add Environment Variables

Click **"Add Environment Variable"** for each of these:

```
DEBUG = false
ALLOWED_HOSTS = *.onrender.com,localhost
SECRET_KEY = django-insecure-zrz7tv5&ecvt&-i@_fh#uzczm8x$d-ntxg@)s=k$7)3=s9amxm
CLICKPESA_CLIENT_ID = ID68e126iay3hfTH5HPlj7Keo8Hb3HFT
CLICKPESA_API_KEY = SKv8YbGuI4OLYaHKVoaK5FAyDzU0b8xebWc2rKLLJv
GOOGLE_CLIENT_ID = YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET = YOUR_GOOGLE_CLIENT_SECRET
CORS_ALLOWED_ORIGINS = https://compiller25.github.io/SHRMS
```

**Note:** Replace `YOUR_GOOGLE_CLIENT_ID` and `YOUR_GOOGLE_CLIENT_SECRET` with your actual credentials from Google Cloud Console.

### Step 5: Deploy

1. Click **"Create Web Service"**
2. Wait for build to complete (~3-5 minutes)
3. You'll see logs showing:
   ```
   Installing dependencies...
   Running migrations...
   Collecting static files...
   ```
4. Once complete, you'll see a green checkmark and a unique URL

### Step 6: Verify Deployment

Once deployment is complete, test the backend:

```bash
# Test health check (should return 401 - not authenticated)
curl https://smrs-backend.onrender.com/api/auth/profile/

# Expected response: 401 Unauthorized
```

---

## What Happens During Deployment

1. **Build Phase:**
   - Installs all packages from `requirements.txt`
   - Runs Django migrations (updates database)
   - Collects static files (CSS, JS, images)
   - Builds the app

2. **Start Phase:**
   - Starts Gunicorn web server
   - Listens on port assigned by Render
   - Ready to accept requests

---

## Your Backend URL

```
https://smrs-backend.onrender.com
```

This URL will be used in:
- Frontend API calls
- GitHub Pages CORS configuration
- Google OAuth redirect URIs

---

## Troubleshooting Render Deployment

### Build Fails

1. Check logs in Render dashboard
2. Common issues:
   - Missing dependencies in `requirements.txt`
   - Python version incompatibility
   - Migration errors

**Solution:**
- Add missing package to `requirements.txt`
- Commit and push to GitHub
- Render auto-redeploys

### 502 Bad Gateway Error

1. Service crashed after deployment
2. Check logs for runtime errors
3. Common causes:
   - Database connection issues
   - Missing environment variables
   - Migration errors

**Solution:**
- Check all environment variables are set
- Verify `ALLOWED_HOSTS` includes `*.onrender.com`
- Check logs for specific error message

### Static Files Not Loading

- WhiteNoise is configured in `settings.py`
- Static files are automatically collected during build
- Should work out of the box

---

## Environment Variables Explained

| Variable | Purpose |
|----------|---------|
| `DEBUG` | Set to `false` for production |
| `ALLOWED_HOSTS` | Hosts that can access your API |
| `SECRET_KEY` | Django secret (keep it safe!) |
| `CLICKPESA_*` | Payment gateway credentials |
| `GOOGLE_CLIENT_*` | Google OAuth credentials |
| `CORS_ALLOWED_ORIGINS` | Allow frontend to make requests |

---

## Next Steps After Deployment

1. ✅ Backend deployed on Render
2. ⏭️ Update frontend API URL (Task 3)
3. ⏭️ Build and deploy frontend to GitHub Pages (Task 4)
4. ⏭️ Test everything works (Task 5)

---

## Monitoring & Logs

In Render Dashboard:
1. Click your service: `smrs-backend`
2. Click **"Logs"** tab
3. See real-time logs of requests and errors

---

## Advanced: Auto-Deploy on Push

Render automatically redeploys when you push to `main` branch:

```bash
# Make changes
git add .
git commit -m "Fix something"
git push origin main

# Render automatically rebuilds and deploys!
```

---

## Cost & Limits (Free Tier)

- **CPU:** Shared
- **RAM:** 512 MB
- **Storage:** Ephemeral (resets on deploy)
- **Auto-sleep:** Sleeps after 15 mins of inactivity
- **Cost:** FREE

**Note:** First request after sleep takes ~10 seconds to wake up. This is normal on free tier.

---

For more help: https://render.com/docs
