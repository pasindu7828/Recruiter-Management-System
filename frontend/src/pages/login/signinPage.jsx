import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { loginUser } from '../../services/authService';
import logo from '../../assets/logo.jpg';

const brandColor = '#401A94';

export const SignInPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Please fill in all fields');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await loginUser({
        email: formData.email,
        password: formData.password,
      });

      if (response.token) {
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.user._id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
          phone: response.user.phone,
        }));
      }

      toast.success(response.message || 'Login successful!');

      const userRole = String(response.user.role || '').toLowerCase();
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'recruiter') {
        navigate('/recruiter/dashboard');
      } else if (userRole === 'candidate') {
        navigate('/candidate/dashboard');
      } else {
        navigate('/manager/dashboard');
      }
    } catch (err) {
      const errorMessage = err.message || 'Login failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row gap-4 p-4 md:p-6 bg-white">
      {/* Left Panel - Purple Section */}
      <div
        className="w-full md:w-1/2 rounded-3xl p-8 md:p-12 flex flex-col justify-center relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${brandColor} 0%, #2D0D6F 50%, #1A0340 100%)` }}
      >
        {/* Decorative background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Logo in white rounded box */}
          <div className="mb-12">
            <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center shadow-lg">
              <img
                src={logo}
                alt="HIREHUB Logo"
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>

          {/* Text content */}
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6 text-white">
            Simplify your hiring process
          </h1>
          <p className="text-lg text-purple-100 leading-relaxed max-w-lg">
            Streamline your recruitment process with a powerful platform designed to manage job postings, track candidates, and simplify hiring decisions.
          </p>
        </div>
      </div>

      {/* Right Panel - Sign In Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center bg-white rounded-3xl p-8 md:p-12">
        <div className="max-w-md mx-auto w-full">
          {/* Welcome Section */}
          <div className="mb-8 md:mb-10">
            <h2 className="text-4xl font-bold text-gray-900 mb-3" style={{ color: brandColor }}>
              Welcome Back
            </h2>
            <p className="text-gray-600 text-base">Please enter your details to sign in.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-900 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-500 font-medium transition focus:outline-none"
                disabled={isLoading}
                onFocus={(e) => {
                  e.target.style.borderColor = brandColor;
                  e.target.style.backgroundColor = '#F3E8FF';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#D1D5DB';
                  e.target.style.backgroundColor = 'white';
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-semibold text-gray-900">
                  Password
                </label>
                <Link
                  to="/forgot-password"
                  className="text-sm font-medium transition hover:opacity-80"
                  style={{ color: brandColor }}
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter your password"
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg placeholder-gray-500 font-medium transition focus:outline-none"
                  disabled={isLoading}
                  onFocus={(e) => {
                    e.target.style.borderColor = brandColor;
                    e.target.style.backgroundColor = '#F3E8FF';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = '#D1D5DB';
                    e.target.style.backgroundColor = 'white';
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-3.5 text-gray-400 hover:text-gray-600 transition disabled:opacity-50"
                  disabled={isLoading}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-5 h-5 rounded cursor-pointer"
                style={{ accentColor: brandColor }}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="text-sm text-gray-700 cursor-pointer font-medium">
                Remember me
              </label>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full text-white font-bold py-3 rounded-lg transition duration-300 disabled:opacity-75 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl mt-8"
              style={{
                backgroundColor: brandColor,
              }}
              onMouseEnter={(e) => !isLoading && (e.target.style.backgroundColor = '#2D0D6F')}
              onMouseLeave={(e) => !isLoading && (e.target.style.backgroundColor = brandColor)}
            >
              {isLoading ? (
                <>
                  <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Sign Up Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-700 text-sm">
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="font-bold transition hover:opacity-80"
                style={{ color: brandColor }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};