import api from './api';

const GOOGLE_AUTH_ENDPOINT = '/auth/google/';
const GOOGLE_CALLBACK_ENDPOINT = '/auth/google/callback/';

/**
 * Google OAuth Authentication Service
 * Handles authentication with Google using JWT tokens
 */
export const googleAuthService = {
  /**
   * Authenticate user with Google ID token
   * @param {string} token - Google ID token from frontend
   * @param {string} role - User role ('TENANT' or 'LANDLORD')
   * @returns {Promise} API response with user and tokens
   */
  authenticateWithGoogle: async (token, role = 'TENANT') => {
    try {
      const response = await api.post(GOOGLE_AUTH_ENDPOINT, {
        token,
        role,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Google authentication failed' };
    }
  },

  /**
   * Handle Google OAuth callback
   * @param {string} idToken - Google ID token
   * @param {string} accessToken - Google access token
   * @param {string} role - User role ('TENANT' or 'LANDLORD')
   * @returns {Promise} API response with user and tokens
   */
  handleGoogleCallback: async (idToken, accessToken, role = 'TENANT') => {
    try {
      const response = await api.post(GOOGLE_CALLBACK_ENDPOINT, {
        id_token: idToken,
        access_token: accessToken,
        role,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { error: 'Google callback failed' };
    }
  },

  /**
   * Verify Google token on backend
   * @param {string} token - Google token to verify
   * @returns {Promise} Verification result
   */
  verifyToken: async (token) => {
    try {
      // This would need a separate endpoint if you want to verify without logging in
      // For now, we use the authenticate endpoint which also verifies
      return await googleAuthService.authenticateWithGoogle(token);
    } catch (error) {
      throw error;
    }
  },

  /**
   * Decode Google token info (client-side only, use for display purposes)
   * Note: This does NOT verify the token signature. Always verify on server!
   * @param {string} token - JWT token
   * @returns {object} Decoded payload
   */
  decodeGoogleToken: (token) => {
    try {
      // Split the token
      const parts = token.split('.');
      if (parts.length !== 3) {
        throw new Error('Invalid token format');
      }

      // Decode the payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(atob(payload));
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Parse Google credential response
   * @param {object} credentialResponse - Response from Google Sign-In button
   * @returns {object} Parsed credential data
   */
  parseCredentialResponse: (credentialResponse) => {
    if (!credentialResponse || !credentialResponse.credential) {
      throw new Error('Invalid credential response');
    }

    const decoded = googleAuthService.decodeGoogleToken(credentialResponse.credential);
    if (!decoded) {
      throw new Error('Failed to decode credential');
    }

    return {
      token: credentialResponse.credential,
      decodedInfo: decoded,
      email: decoded.email,
      name: decoded.name,
      picture: decoded.picture,
      emailVerified: decoded.email_verified,
    };
  },
};

/**
 * Store Google authentication data in localStorage
 * @param {object} authData - Authentication response data
 */
export const storeGoogleAuthData = (authData) => {
  if (authData.tokens) {
    localStorage.setItem('access_token', authData.tokens.access);
    localStorage.setItem('refresh_token', authData.tokens.refresh);
  }
  if (authData.user) {
    localStorage.setItem('user', JSON.stringify(authData.user));
  }
};

/**
 * Clear Google authentication data from localStorage
 */
export const clearGoogleAuthData = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
};

/**
 * Get stored Google auth tokens
 * @returns {object} Stored tokens
 */
export const getStoredAuthTokens = () => {
  return {
    accessToken: localStorage.getItem('access_token'),
    refreshToken: localStorage.getItem('refresh_token'),
  };
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if access token exists
 */
export const isAuthenticated = () => {
  return !!localStorage.getItem('access_token');
};

/**
 * Get stored user data
 * @returns {object} Stored user object or null
 */
export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export default googleAuthService;
