"""Google OAuth utilities for authentication"""
import json
from google.auth.transport import requests
from google.oauth2 import id_token
from decouple import config


def verify_google_token(token):
    """
    Verify Google ID token and return user info
    
    Args:
        token: Google ID token from frontend
        
    Returns:
        dict: User information from Google (sub, email, name, picture, etc.)
        
    Raises:
        ValueError: If token is invalid or verification fails
    """
    try:
        # Get the Google Client ID from environment
        google_client_id = config('GOOGLE_CLIENT_ID', default='')
        
        if not google_client_id:
            raise ValueError("GOOGLE_CLIENT_ID not configured in environment")
        
        # Verify the token
        idinfo = id_token.verify_oauth2_token(token, requests.Request(), google_client_id)
        
        # Token is valid
        return {
            'google_id': idinfo.get('sub'),
            'email': idinfo.get('email'),
            'first_name': idinfo.get('given_name', ''),
            'last_name': idinfo.get('family_name', ''),
            'picture': idinfo.get('picture', ''),
            'email_verified': idinfo.get('email_verified', False),
        }
    except ValueError as e:
        raise ValueError(f"Invalid Google token: {str(e)}")
    except Exception as e:
        raise ValueError(f"Error verifying Google token: {str(e)}")


def get_or_create_google_user(google_info, role='TENANT'):
    """
    Get or create a user from Google authentication info
    
    Args:
        google_info: Dictionary with google_id, email, first_name, last_name
        role: User role ('TENANT' or 'LANDLORD')
        
    Returns:
        tuple: (User object, created boolean)
    """
    from .models import User, Tenant, Landlord
    
    email = google_info.get('email')
    google_id = google_info.get('google_id')
    
    if not email or not google_id:
        raise ValueError("Email and Google ID are required")
    
    # Try to find existing user by google_id
    try:
        user = User.objects.get(google_id=google_id)
        return user, False
    except User.DoesNotExist:
        pass
    
    # Try to find by email (in case they registered with email first)
    try:
        user = User.objects.get(email=email)
        # Update google info
        user.google_id = google_id
        user.auth_provider = 'GOOGLE'
        user.save()
        return user, False
    except User.DoesNotExist:
        pass
    
    # Create new user
    username = email.split('@')[0]
    
    # Ensure unique username
    base_username = username
    counter = 1
    while User.objects.filter(username=username).exists():
        username = f"{base_username}{counter}"
        counter += 1
    
    user = User.objects.create_user(
        username=username,
        email=email,
        first_name=google_info.get('first_name', ''),
        last_name=google_info.get('last_name', ''),
        google_id=google_id,
        auth_provider='GOOGLE',
        role=role,
        password=None  # No password for OAuth users
    )
    
    # Create related profile based on role
    if role == 'LANDLORD':
        Landlord.objects.create(user=user)
    elif role == 'TENANT':
        Tenant.objects.create(user=user)
    
    return user, True
