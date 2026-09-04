# Change Password API Documentation

## Overview

The Change Password endpoint allows authenticated users to securely update their password. This endpoint requires the user to provide their current password for verification before allowing the password change.

## Endpoint

**POST** `/api/auth/change-password/`

## Authentication

**Required:** JWT Bearer Token

```
Authorization: Bearer <access_token>
```

## Request Body

```json
{
  "old_password": "current_password_here",
  "new_password": "new_secure_password",
  "new_password_confirm": "new_secure_password"
}
```

### Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `old_password` | string | Yes | User's current password (for verification) |
| `new_password` | string | Yes | New password to set |
| `new_password_confirm` | string | Yes | Confirmation of new password (must match `new_password`) |

## Validation Rules

1. **Old Password:**
   - Must be the user's current password
   - Will return `400 Bad Request` if incorrect

2. **New Password:**
   - Must be different from old password (Django validation)
   - Must meet password strength requirements:
     - At least 8 characters long
     - Cannot be entirely numeric
     - Cannot match common passwords
   - Passwords are case-sensitive

3. **New Password Confirmation:**
   - Must exactly match `new_password`
   - Returns error if they don't match

## Success Response

**Status Code:** `200 OK`

```json
{
  "message": "Password changed successfully"
}
```

## Error Responses

### 1. Invalid Old Password

**Status Code:** `400 Bad Request`

```json
{
  "old_password": [
    "Old password is incorrect."
  ]
}
```

### 2. Passwords Don't Match

**Status Code:** `400 Bad Request`

```json
{
  "new_password": [
    "New password fields didn't match."
  ]
}
```

### 3. Weak New Password

**Status Code:** `400 Bad Request`

```json
{
  "new_password": [
    "This password is too common.",
    "Your password must contain at least 8 characters."
  ]
}
```

### 4. Missing Fields

**Status Code:** `400 Bad Request`

```json
{
  "old_password": ["This field is required."],
  "new_password": ["This field is required."],
  "new_password_confirm": ["This field is required."]
}
```

### 5. Unauthorized (No Token)

**Status Code:** `401 Unauthorized`

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 6. Invalid/Expired Token

**Status Code:** `401 Unauthorized`

```json
{
  "detail": "Given token is invalid for any token type"
}
```

## Usage Examples

### cURL

```bash
curl -X POST http://localhost:8000/api/auth/change-password/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "OldPassword123!",
    "new_password": "NewSecurePassword123!",
    "new_password_confirm": "NewSecurePassword123!"
  }'
```

### JavaScript/Fetch

```javascript
const changePassword = async (oldPassword, newPassword, accessToken) => {
  try {
    const response = await fetch('http://localhost:8000/api/auth/change-password/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      console.log('Password changed successfully:', data.message);
      return { success: true };
    } else {
      console.error('Password change failed:', data);
      return { success: false, errors: data };
    }
  } catch (error) {
    console.error('Error:', error);
    return { success: false, error: error.message };
  }
};

// Usage
changePassword('OldPassword123!', 'NewSecurePassword123!', accessToken);
```

### Python/Requests

```python
import requests

def change_password(old_password, new_password, access_token):
    url = 'http://localhost:8000/api/auth/change-password/'
    headers = {
        'Authorization': f'Bearer {access_token}',
        'Content-Type': 'application/json'
    }
    data = {
        'old_password': old_password,
        'new_password': new_password,
        'new_password_confirm': new_password
    }
    
    response = requests.post(url, json=data, headers=headers)
    return response.json()

# Usage
result = change_password('OldPassword123!', 'NewSecurePassword123!', access_token)
if response.status_code == 200:
    print('Password changed successfully')
else:
    print('Error:', result)
```

### Axios (React)

```javascript
import axios from 'axios';

const changePassword = async (oldPassword, newPassword, accessToken) => {
  try {
    const response = await axios.post(
      'http://localhost:8000/api/auth/change-password/',
      {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: newPassword
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return { success: true, message: response.data.message };
  } catch (error) {
    return {
      success: false,
      errors: error.response?.data || { error: error.message }
    };
  }
};
```

## Important Notes

1. **Security:**
   - Always use HTTPS in production
   - Never transmit passwords in URLs
   - Store access tokens securely (httpOnly cookies recommended)
   - Never log or expose passwords

2. **Session:**
   - After password change, existing tokens remain valid
   - User doesn't need to log in again
   - Password change is immediate

3. **Audit Trail:**
   - Password changes are tracked in Django's admin interface
   - Check `updated_at` timestamp on user record

4. **Password Requirements:**
   - Minimum 8 characters
   - Cannot be entirely numeric
   - Cannot be a common password
   - Should include uppercase, lowercase, numbers, and special characters (recommended)

## Rate Limiting

Currently, there is no rate limiting on the change password endpoint. Consider implementing rate limiting in production to prevent brute force attacks:

- Max 5 attempts per hour per user
- Or 10 attempts per day per IP address

## Frontend Integration Tips

1. **UX Best Practices:**
   - Show password strength indicator
   - Clear error messages for validation failures
   - Confirm password change with success message
   - Don't require re-authentication after password change

2. **Validation Before Sending:**
   ```javascript
   const validatePasswords = (oldPwd, newPwd, confirmPwd) => {
     if (newPwd.length < 8) return 'Password must be at least 8 characters';
     if (newPwd !== confirmPwd) return 'Passwords do not match';
     if (oldPwd === newPwd) return 'New password must be different';
     return null;
   };
   ```

3. **Error Handling:**
   - Display field-specific errors
   - Highlight problematic fields in form
   - Provide clear guidance for password requirements

## Related Endpoints

- **POST** `/api/auth/login/` - User login
- **POST** `/api/auth/register/` - User registration
- **GET** `/api/auth/profile/` - Get user profile
- **PATCH** `/api/auth/profile/` - Update user profile
- **POST** `/api/auth/logout/` - User logout

## Troubleshooting

### "Old password is incorrect"
- Verify the password is typed correctly
- Check caps lock is off
- Ensure you're using the right user account

### "New password fields didn't match"
- Ensure both password fields are identical
- Check for extra spaces or typos

### "This password is too common"
- Choose a more unique password
- Add numbers and special characters
- Avoid dictionary words

### "Given token is invalid"
- Token may have expired
- Get a new access token by using refresh token
- Log in again to get new tokens

## See Also

- [Authentication API](./API_DOCUMENTATION.md)
- [Google OAuth Setup](./GOOGLE_OAUTH_SETUP.md)
- [Django Password Validation](https://docs.djangoproject.com/en/5.0/topics/auth/passwords/)
