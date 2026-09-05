# Render Deployment Checklist

Fill in these exact values in the Render form:

## Configuration Tab

| Field | Value |
|-------|-------|
| **Source Code** | `compiller25/SHRMS` ✓ (already selected) |
| **Name** | `smrs-backend` |
| **Language** | `Python 3` |
| **Branch** | `main` ✓ (already selected) |
| **Region** | `Oregon (US West)` ✓ (already selected) |
| **Root Directory** | `backend` ⚠️ **ADD THIS** |
| **Build Command** | `pip install -r requirements.txt && python manage.py migrate && python manage.py collectstatic --noinput` |
| **Start Command** | `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT` |

## Environment Variables Tab

Click **"Add Environment Variable"** for each:

```
DEBUG = false
ALLOWED_HOSTS = *.onrender.com,localhost
SECRET_KEY = django-insecure-zrz7tv5&ecvt&-i@_fh#uzczm8x$d-ntxg@)s=k$7)3=s9amxm
CLICKPESA_CLIENT_ID = ID68e126iay3hfTH5HPlj7Keo8Hb3HFT
CLICKPESA_API_KEY = SKv8YbGuI4OLYaHKVoaK5FAyDzU0b8xebWc2rKLLJv
GOOGLE_CLIENT_ID = (leave blank for now, add later)
GOOGLE_CLIENT_SECRET = (leave blank for now, add later)
CORS_ALLOWED_ORIGINS = https://compiller25.github.io/SHRMS
```

## Compute Plan

✓ Select **Free** (already highlighted in blue)

---

## What to Do Now

1. ✅ **Name:** Change to `smrs-backend`
2. ✅ **Root Directory:** Enter `backend`
3. ✅ **Build Command:** Paste the full command above
4. ✅ **Start Command:** Paste the gunicorn command above
5. ✅ **Scroll down** and add all Environment Variables
6. ✅ **Click "Deploy web service"**

---

## After Clicking Deploy

- Build takes 3-5 minutes
- You'll see logs showing:
  - `Installing dependencies...`
  - `Running migrations...`
  - `Collecting static files...`
  - `Build successful!`
- Service will be live at: `https://smrs-backend.onrender.com`

---

## Quick Test After Deployment

```bash
curl https://smrs-backend.onrender.com/api/auth/profile/
```

Expected: `401 Unauthorized` (this is correct - you're not authenticated)

---

Done with Render? Tell me and we'll move to Task 3! 🚀
