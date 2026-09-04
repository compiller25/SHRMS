# Google OAuth Setup Guide

This document explains how to set up Google OAuth authentication for the Smart Rental Management System (SMRS).

## Overview

The project now supports Google OAuth authentication in addition to traditional email/password login. Users can sign in with their Google accounts, and new users will have accounts automatically created.

## Features

- ✅ Sign in with Google button on login page
- ✅ Automatic account creation for new Google users
- ✅ Support for both Tenant and Landlord roles
- ✅ Token-based authentication with JWT
- ✅ Secure backend verification of Google tokens
- ✅ Mobile-responsive OAuth UI

## Prerequisites

1. Google Cloud Console account
2. A registered application in Google Cloud Console
3. OAuth 2.0 credentials (Client ID and Client Secret)

## Step 1: Create Google OAuth Credentials

### 1.1 Go to Google Cloud Console

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**

### 1.2 Create OAuth 2.0 Credentials

1. Click **Create Credentials** > **OAuth client ID**
2. If prompted, configure the OAuth consent screen first:
   - Choose **External** user type
   - Fill in required fields (app name, user support email, etc.)
   - Add scopes: `openid`, `email`, `profile`
   - Add test users (your email)

### 1.3 Configure Authorized URIs

1. Go back to **Credentials**
2. Create a new **Web application** OAuth 2.0 credential
3. Add Authorized JavaScript origins:
   ```
   http://localhost:5173
   http://localhost:3000
   http://127.0.0.1:5173
   https://yourdomain.com  (production)
   ```

4. Add Authorized redirect URIs:
   ```
   http://localhost:5173/login
   http://localhost:3000/login
   http://127.0.0.1:5173/login
   https://yourdomain.com/login  (production)
   ```

5. Copy your **Client ID** and **Client Secret**

## Step 2: Configure Backend (.env)

Edit `/backend/.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET_HERE
GOOGLE_REDIRECT_URI=http://localhost:5173/login
```

**Example:**
```env
GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-1234567890abcdefghijkl
GOOGLE_REDIRECT_URI=http://localhost:5173/login
```

## Step 3: Configure Frontend (.env)

Edit `/frontend/.env`:

```env
VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE
```

**Example:**
```env
VITE_GOOGLE_CLIENT_ID=1234567890-abcdefghijklmnopqrstuvwxyz.apps.googleusercontent.com
```

**Important:** Only the Client ID is needed on the frontend. The Client Secret should NEVER be exposed to the frontend.

## Step 4: Install Dependencies

### Backend

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
```

### Frontend

```bash
cd frontend
npm install
```

## Step 5: Run the Application

### Terminal 1 - Backend

```bash
cd backend
source venv/bin/activate
python manage.py makemigrations users
python manage.py migrate
python manage.py runserver
```

Backend will run on: `http://localhost:8000`

### Terminal 2 - Frontend

```bash
cd frontend
npm run dev
```

Frontend will run on: `http://localhost:5173`

## Step 6: Test Google OAuth

1. Navigate to `http://localhost:5173/login`
2. You should see a "Sign in with Google" button
3. Click it to sign in with your Google account
4. You'll be automatically logged in and redirected to your dashboard

## API Endpoints

### Google OAuth Authentication

**POST** `/api/auth/google/`

Request body:
```json
{
  "token": "google_id_token_from_frontend",
  "role": "TENANT"  // or "LANDLORD", defaults to TENANT
}
```

Response:
```json
{
  "user": {
    "id": 1,
    "email": "user@gmail.com",
    "first_name": "John",
    "last_name": "Doe",
    "role": "TENANT",
    "phone": "",
    "gender": "",
    "address": ""
  },
  "tokens": {
    "refresh": "eyJ0eXAiOiJKV1QiLCJhbGc...",
    "access": "eyJ0eXAiOiJKV1QiLCJhbGc..."
  },
  "created": false,
  "message": "Login successful via Google"
}
```

### Alternative Callback Endpoint

**POST** `/api/auth/google/callback/`

Request body:
```json
{
  "id_token": "google_id_token",
  "access_token": "google_access_token",
  "role": "TENANT"
}
```

## Frontend Integration

The frontend already includes:

1. **GoogleOAuthProvider wrapper** - Wraps the entire app
2. **Login component** - Displays Google Sign-In button
3. **Auth service** - Handles token exchange with backend
4. **Auth context** - Provides `googleLogin()` method

### Using Google Login in Components

```jsx
import { useAuth } from './context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

function MyComponent() {
  const { googleLogin } = useAuth();

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await googleLogin({
      token: credentialResponse.credential,
      role: 'TENANT'
    });

    if (result.success) {
      // User logged in successfully
      console.log('User:', result.user);
    } else {
      console.error('Login failed:', result.error);
    }
  };

  return (
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={() => console.log('Login failed')}
    />
  );
}
```

## Troubleshooting

### 1. "Invalid Client ID" Error

- Verify the Client ID is correct in both `.env` files
- Check that the Client ID is for a **Web application**, not Android/iOS
- Ensure the origin is authorized in Google Cloud Console

### 2. CORS Errors

- Make sure `ALLOWED_HOSTS` in backend includes your frontend URL
- Check CORS settings in `core/settings.py`

### 3. Token Verification Failed

- Ensure `GOOGLE_CLIENT_ID` is set in backend `.env`
- Verify the token hasn't expired
- Check that you're using the correct Client ID (not Client Secret)

### 4. User Not Created

- Check backend logs for errors
- Verify the role parameter is either 'TENANT' or 'LANDLORD'
- Ensure Landlord/Tenant models are properly created

## Security Considerations

1. **Never expose Client Secret** - Keep it only in backend `.env`
2. **Token verification** - Always verify tokens on the backend
3. **HTTPS in production** - Use HTTPS for all OAuth flows
4. **Authorized URIs** - Only add trusted domains to Google Cloud Console
5. **Environment variables** - Never commit `.env` files to git

## Database Migrations

The following fields were added to the User model:

- `google_id` - Unique Google user ID
- `google_access_token` - Google access token (for future use)
- `auth_provider` - Authentication method ('LOCAL' or 'GOOGLE')

Run migrations:
```bash
python manage.py makemigrations users
python manage.py migrate users
```

## Production Deployment

1. Update Google Cloud Console with production URLs
2. Set `DEBUG=False` in production `.env`
3. Update `ALLOWED_HOSTS` with your production domain
4. Update `GOOGLE_REDIRECT_URI` to your production URL
5. Update frontend `.env` with production URLs
6. Use HTTPS for all URLs
7. Implement proper error logging and monitoring

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [React Google Login Library](https://www.npmjs.com/package/@react-oauth/google)
- [Google Identity Services](https://developers.google.com/identity)
- [Django JWT Authentication](https://django-rest-framework-simplejwt.readthedocs.io/)

## Support

For issues or questions, please refer to:
1. Google Identity documentation
2. Django REST Framework documentation
3. Project-specific implementation details in `users/google_auth.py`
