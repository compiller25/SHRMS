# SMRS Deployment Guide - GitHub Pages + Render

This guide will walk you through deploying the Smart Rental Management System (SMRS) to production using GitHub Pages for the frontend and Render for the backend.

## Prerequisites

- GitHub account
- Render account (free at render.com)
- Git installed and configured
- Project code ready

---

## STEP 1: Create GitHub Repository

### 1.1 Initialize Git (if not already done)

```bash
cd /home/egovridc27/Desktop/SEAN/projects/advanced/projects/desktop-softwares/SMRS
git init
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 1.2 Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Backend
backend/venv/
backend/.env
backend/__pycache__/
backend/db.sqlite3
backend/db.sqlite3.bak*
backend/media/
backend/*.pyc

# Frontend
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
EOF
```

### 1.3 Create GitHub Repository

1. Go to https://github.com/new
2. Enter repository name: `smrs-rental-system`
3. Add description: "Smart Rental Management System"
4. Choose Public (for GitHub Pages to work)
5. Click "Create repository"

### 1.4 Push Code to GitHub

```bash
cd /home/egovridc27/Desktop/SEAN/projects/advanced/projects/desktop-softwares/SMRS

git add .
git commit -m "Initial commit: SMRS project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/smrs-rental-system.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

---

## STEP 2: Deploy Backend to Render

### 2.1 Create render.yaml

Create a `render.yaml` file in the project root:

```bash
cat > render.yaml << 'EOF'
services:
  - type: web
    name: smrs-backend
    env: python
    plan: free
    region: oregon
    
    buildCommand: |
      cd backend
      pip install -r requirements.txt
      python manage.py migrate
      python manage.py collectstatic --noinput
    
    startCommand: |
      cd backend
      gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
    
    envVars:
      - key: PYTHON_VERSION
        value: 3.10
      - key: DEBUG
        value: false
      - key: ALLOWED_HOSTS
        value: "*.onrender.com"
      - key: CORS_ALLOWED_ORIGINS
        value: "https://YOUR_GITHUB_USERNAME.github.io"
    
    envVarFile: backend/.env
EOF
```

### 2.2 Update Backend Production Settings

Edit `backend/.env`:

```env
# Django Settings
SECRET_KEY=django-insecure-zrz7tv5&ecvt&-i@_fh#uzczm8x$d-ntxg@)s=k$7)3=s9amxm
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,*.onrender.com

# Database (Use SQLite for now, upgrade to PostgreSQL later)
DB_ENGINE=django.db.backends.sqlite3
DB_NAME=db.sqlite3

# ClickPesa
CLICKPESA_CLIENT_ID=ID68e126iay3hfTH5HPlj7Keo8Hb3HFT
CLICKPESA_API_KEY=SKv8YbGuI4OLYaHKVoaK5FAyDzU0b8xebWc2rKLLJv

# Google OAuth
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
```

### 2.3 Deploy on Render

1. Go to https://render.com
2. Click "New" → "Web Service"
3. Connect your GitHub repository
4. Select `smrs-rental-system` repo
5. Name: `smrs-backend`
6. Root Directory: `backend`
7. Build Command:
   ```
   pip install -r requirements.txt && python manage.py migrate
   ```
8. Start Command:
   ```
   gunicorn core.wsgi:application --bind 0.0.0.0:$PORT
   ```
9. Click "Create Web Service"
10. Add environment variables from your `.env` file

**Your backend URL will be:** `https://smrs-backend.onrender.com`

---

## STEP 3: Configure Frontend for GitHub Pages

### 3.1 Update vite.config.js

Edit `frontend/vite.config.js`:

```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/smrs-rental-system/',  // Replace with your repo name
  server: {
    proxy: {
      '/api': {
        target: 'https://smrs-backend.onrender.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api')
      }
    }
  }
})
```

### 3.2 Update Frontend Environment

Edit `frontend/.env`:

```env
VITE_API_BASE_URL=https://smrs-backend.onrender.com/api
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
VITE_FRONTEND_URL=https://YOUR_GITHUB_USERNAME.github.io/smrs-rental-system
VITE_BACKEND_URL=https://smrs-backend.onrender.com
```

### 3.3 Update API Base URL in Code

Edit `frontend/src/services/api.js`:

```javascript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://smrs-backend.onrender.com/api';

// ... rest of the code
```

### 3.4 Create GitHub Pages Deployment Workflow

Create `.github/workflows/deploy.yml`:

```bash
mkdir -p .github/workflows

cat > .github/workflows/deploy.yml << 'EOF'
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        working-directory: ./frontend
        run: npm install
      
      - name: Build
        working-directory: ./frontend
        run: npm run build
      
      - name: Deploy to GitHub Pages
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./frontend/dist
EOF
```

### 3.5 Enable GitHub Pages

1. Go to your GitHub repository
2. Settings → Pages
3. Source: Deploy from a branch
4. Branch: `gh-pages`
5. Folder: `/ (root)`
6. Click Save

---

## STEP 4: Deploy Frontend

### 4.1 Build Frontend Locally

```bash
cd frontend
npm install
npm run build
```

### 4.2 Push to GitHub

```bash
cd /home/egovridc27/Desktop/SEAN/projects/advanced/projects/desktop-softwares/SMRS
git add .
git commit -m "Configure for production deployment"
git push origin main
```

GitHub Actions will automatically build and deploy to GitHub Pages!

**Your frontend URL will be:** `https://YOUR_GITHUB_USERNAME.github.io/smrs-rental-system`

---

## STEP 5: Final Configuration

### 5.1 Update Backend CORS Settings

Once you have your frontend URL, update `backend/.env`:

```env
CORS_ALLOWED_ORIGINS=https://YOUR_GITHUB_USERNAME.github.io/smrs-rental-system
```

### 5.2 Update Google OAuth

1. Go to Google Cloud Console
2. Update authorized redirect URIs:
   - `https://YOUR_GITHUB_USERNAME.github.io/smrs-rental-system/login`
   - `https://smrs-backend.onrender.com/api/auth/google/callback/`

---

## Testing Your Deployment

### Check Backend

```bash
curl https://smrs-backend.onrender.com/api/auth/profile/
# Should return 401 (no auth)
```

### Check Frontend

Visit: `https://YOUR_GITHUB_USERNAME.github.io/smrs-rental-system`

### Test Login

1. Go to login page
2. Use credentials:
   - Email: `landlord@smrs.com`
   - Password: `Landlord@123456`
3. Should redirect to dashboard

---

## Troubleshooting

### Frontend not loading styles

- Check `base` in `vite.config.js` matches repo name
- Clear browser cache
- Rebuild: `npm run build`

### Backend CORS errors

- Update `CORS_ALLOWED_ORIGINS` in backend `.env`
- Restart Render service

### Environment variables not working

- Render: Add each variable in dashboard
- Check for typos in variable names
- Restart service after changes

### GitHub Pages 404

- Check base URL in vite.config.js
- Ensure gh-pages branch exists
- Check repository is public

---

## Production Checklist

- [ ] Backend deployed on Render
- [ ] Frontend deployed on GitHub Pages
- [ ] CORS configured correctly
- [ ] Google OAuth credentials updated
- [ ] Environment variables set
- [ ] Login tested
- [ ] Database migrations applied
- [ ] Static files collected on backend
- [ ] Custom domain configured (optional)

---

## Next Steps

1. Share frontend URL with your client
2. Test all features (register, login, properties, payments)
3. Monitor Render logs for errors
4. Set up custom domain (optional)
5. Configure automated backups

---

## Useful Links

- Render Documentation: https://render.com/docs
- GitHub Pages: https://pages.github.com
- Vite Deployment: https://vitejs.dev/guide/static-deploy.html
- Django Deployment: https://docs.djangoproject.com/en/5.0/howto/deployment/

---

**Questions?** Check the logs:
- Backend: `render.com` dashboard → Logs
- Frontend: GitHub Actions → Workflows → Deploy logs
