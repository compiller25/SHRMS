# Deploy on Render - Fresh Start

I've fixed the migration issue. The new code checks if columns exist before adding them, so there won't be duplicate column errors.

## How to Deploy (Fresh Start)

### Step 1: Delete Old Service

1. Go to Render Dashboard: https://render.com
2. Click your service: `smrs-backend`
3. Go to **Settings** → scroll down
4. Click **"Delete Service"** → confirm
5. Wait for deletion to complete

### Step 2: Create New Service

1. Back in dashboard, click **"New"** → **"Web Service"**
2. Select `compiller25/SHRMS` repository
3. Fill in settings:

| Field | Value |
|-------|-------|
| **Name** | `smrs-backend` |
| **Language** | `Python 3` |
| **Region** | `Oregon` |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Build Command** | `pip install -r requirements.txt && python manage.py migrate --noinput && python manage.py collectstatic --noinput --clear` |
| **Start Command** | `gunicorn core.wsgi:application --bind 0.0.0.0:$PORT` |
| **Plan** | `Free` |

### Step 3: Add Environment Variables

Add these:
```
DEBUG=false
ALLOWED_HOSTS=*.onrender.com,localhost
SECRET_KEY=django-insecure-zrz7tv5&ecvt&-i@_fh#uzczm8x$d-ntxg@)s=k$7)3=s9amxm
CLICKPESA_CLIENT_ID=ID68e126iay3hfTH5HPlj7Keo8Hb3HFT
CLICKPESA_API_KEY=SKv8YbGuI4OLYaHKVoaK5FAyDzU0b8xebWc2rKLLJv
GOOGLE_CLIENT_ID=(leave blank for now)
GOOGLE_CLIENT_SECRET=(leave blank for now)
CORS_ALLOWED_ORIGINS=https://compiller25.github.io/SHRMS
```

### Step 4: Click "Create Web Service"

Wait for build (3-5 minutes). This time it should succeed!

---

## Test After Deployment

```bash
curl https://smrs-backend.onrender.com/api/auth/profile/
```

Should return: `401 Unauthorized` (correct!)

---

## What Changed in Code

✅ Migration now checks if columns exist before adding them
✅ Uses `RunPython` with conditional logic
✅ Won't fail on duplicate columns

---

**Do this now and let me know when it succeeds!** 🚀
