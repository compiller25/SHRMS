import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const [formData, setFormData] = useState({
    identifier: '', // Can be username or email
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState('email'); // 'email' or 'username'
  
  const { login, googleLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the page user came from (if redirected from marketplace)
  const from = location.state?.from || null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Prepare login data based on login method
    const loginData = loginMethod === 'email' 
      ? { email: formData.identifier, password: formData.password }
      : { username: formData.identifier, password: formData.password };

    const result = await login(loginData);

    if (result.success) {
      // If user came from marketplace, redirect back there
      if (from === '/marketplace') {
        navigate('/marketplace');
      }
      // Otherwise, redirect based on user role
      else if (result.user.role === 'LANDLORD') {
        navigate('/landlord/dashboard');
      } else if (result.user.role === 'TENANT') {
        navigate('/tenant/dashboard');
      } else if (result.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setError('');
    setLoading(true);
    
    try {
      // Extract role from URL params if available, otherwise default to TENANT
      const urlParams = new URLSearchParams(location.search);
      const role = urlParams.get('role') || 'TENANT';
      
      const result = await googleLogin({
        token: credentialResponse.credential,
        role: role
      });

      if (result.success) {
        // Redirect based on user role
        if (result.user.role === 'LANDLORD') {
          navigate('/landlord/dashboard');
        } else if (result.user.role === 'TENANT') {
          navigate('/tenant/dashboard');
        } else if (result.user.role === 'ADMIN') {
          navigate('/admin/dashboard');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Google login failed');
      }
    } catch (err) {
      setError('Google login error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.');
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4">
      <div className="max-w-md w-full">
        <div className="card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-lime-green rounded-full flex items-center justify-center font-bold text-primary-blue text-2xl mx-auto mb-4">
              SR
            </div>
            <h2 className="text-3xl font-bold text-primary-blue">Welcome Back</h2>
            <p className="text-gray-600 mt-2">Sign in to access your account</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}

          {/* Google Login Button */}
          <div className="mb-6">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                theme="outline"
                size="large"
                text="signin_with"
              />
            </div>
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with email</span>
              </div>
            </div>
          </div>

          {/* Login Method Toggle */}
          <div className="flex gap-2 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMethod('email');
                setFormData({ identifier: '', password: '' });
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition text-sm md:text-base ${
                loginMethod === 'email'
                  ? 'bg-[#99CC33] text-[#003152] font-semibold'
                  : 'bg-gray-200 text-[#003333] hover:bg-gray-300'
              }`}
            >
              📧 Email
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMethod('username');
                setFormData({ identifier: '', password: '' });
              }}
              className={`flex-1 py-2 px-4 rounded-lg transition text-sm md:text-base ${
                loginMethod === 'username'
                  ? 'bg-[#99CC33] text-[#003152] font-semibold'
                  : 'bg-gray-200 text-[#003333] hover:bg-gray-300'
              }`}
            >
              👤 Username
            </button>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="label">
                {loginMethod === 'email' ? 'Email Address' : 'Username'}
              </label>
              <input
                type={loginMethod === 'email' ? 'email' : 'text'}
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className="input-field"
                placeholder={loginMethod === 'email' ? 'your@email.com' : 'your_username'}
                required
              />
            </div>

            <div>
              <label className="label">Password</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="input-field"
                placeholder="••••••••"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Register Link */}
          <div className="text-center mt-6">
            <p className="text-gray-600 text-sm md:text-base">
              Don't have an account?{' '}
              <Link to="/register" className="text-lime-green font-semibold hover:underline">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
