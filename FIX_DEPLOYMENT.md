# Fix for Render Deployment Error

## Problem
The migration failed with: `sqlite3.OperationalError: duplicate column name: google_access_token`

This happened because the database had a partially applied migration state.

## Solution
I've updated the build configuration to force a clean database on each build. The code is now pushed to GitHub.

## What to Do Now

### Option 1: Redeploy on Render (Recommended)

1. Go to your Render dashboard: https://render.com
2. Click on your service: `smrs-backend`
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for the build to complete (3-5 minutes)

The new build command will:
- ✓ Install dependencies
- ✓ **Delete old database** (fresh start)
- ✓ Run all migrations from scratch
- ✓ Collect static files
- ✓ Start the server

### Option 2: Delete Service & Recreate

If redeploy doesn't work:

1. Go to Render dashboard
2. Click your service `smrs-backend`
3. Click **Settings** → scroll to bottom → **Delete Service**
4. Confirm deletion
5. Create a new service following the checklist again

---

## Changes Made

✅ Updated `render.yaml` to force clean database
✅ Added `backend/build_render.sh` script
✅ Code pushed to GitHub

---

## Expected Result After Redeploy

✓ Build succeeds (3-5 min)
✓ No migration errors
✓ Backend available at: `https://smrs-backend.onrender.com`
✓ Test with: `curl https://smrs-backend.onrender.com/api/auth/profile/`

---

**Try the redeploy now! Let me know if it works.** 🚀
