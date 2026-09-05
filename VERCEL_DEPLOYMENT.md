# Deploy Frontend to Vercel

Your frontend will be deployed at: `https://smrs-rental-system.vercel.app`

---

## Step 1: Create Vercel Account

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Sign up with GitHub"
4. Authorize Vercel to access your GitHub account

---

## Step 2: Import Project from GitHub

1. Click **"Add New"** → **"Project"**
2. Search and select: `compiller25/SHRMS`
3. Click **"Import"**

---

## Step 3: Configure Project Settings

### Build Settings

- **Framework Preset:** Vite
- **Build Command:** `cd frontend && npm install && npm run build`
- **Output Directory:** `frontend/dist`

### Environment Variables

Add these variables:

```
VITE_API_BASE_URL=https://smrs-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=
VITE_FRONTEND_URL=https://smrs-rental-system.vercel.app
VITE_BACKEND_URL=https://smrs-backend.onrender.com
```

**Note:** Leave `VITE_GOOGLE_CLIENT_ID` blank for now, we'll add it later.

---

## Step 4: Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Once deployed, you'll see a success message

**Your frontend URL:** `https://smrs-rental-system.vercel.app`

---

## After Deployment

### Update Backend CORS

Your backend needs to allow requests from the frontend. Go to Render:

1. Click your service: `smrs-backend`
2. Click **"Environment"**
3. Find `CORS_ALLOWED_ORIGINS`
4. Update to: `https://smrs-rental-system.vercel.app`
5. Click **"Save"** (will auto-redeploy)

---

## Test the Deployment

1. Go to: `https://smrs-rental-system.vercel.app`
2. You should see the login page
3. Try logging in with:
   - Email: `landlord@smrs.com`
   - Password: `Landlord@123456`

---

## Auto-Deploy on Push

Every time you push to GitHub main branch, Vercel automatically:
1. Pulls latest code
2. Builds the project
3. Deploys to production

No manual deploys needed!

---

## Troubleshooting

### Build fails
- Check build logs in Vercel dashboard
- Make sure `frontend/package.json` exists
- Verify `npm run build` works locally

### 404 errors on routes
- Vercel is configured to redirect all routes to `index.html`
- React Router will handle the routing

### CORS errors in browser console
- Update `CORS_ALLOWED_ORIGINS` in Render
- Wait for Render to redeploy
- Clear browser cache

---

## Production URLs

- **Frontend:** https://smrs-rental-system.vercel.app
- **Backend:** https://smrs-backend.onrender.com

Share the frontend URL with your client! 🎉
