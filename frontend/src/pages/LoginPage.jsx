import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isLoading } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await login({ email, password });
      navigate(location.state?.from || '/');
    } catch (err) {
      setErrorMessage(err.message || 'Invalid credentials. Please check your email and password.');
    }
  };

  // Demo accounts helper
  const handleQuickLogin = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center px-4 py-10">
      {/* Logo */}
      <Link to="/" className="mb-6" aria-label="Home">
        <span className="font-display font-bold text-3xl tracking-tight text-ink">
          Iron <span className="text-gradient">&amp;</span> Ivy
        </span>
      </Link>

      {/* Sign-in card */}
      <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-3xl p-7 shadow-card">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Sign in</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-xs font-bold text-gray-800 mb-1">
              Email or mobile phone number
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-xs font-bold text-gray-800 mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Your password"
              autoComplete="current-password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full !py-3 disabled:opacity-60"
          >
            {isLoading ? 'Signing you in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-xs text-gray-600 mt-4 leading-relaxed">
          By continuing, you agree to Iron & Ivy's{' '}
          <span className="a-link">Conditions of Use</span> and{' '}
          <span className="a-link">Privacy Notice</span>.
        </p>

        {/* Demo credentials */}
        <div className="mt-5 pt-4 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-700 mb-2">Demo accounts (click to fill):</p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleQuickLogin('customer@test.com', 'Pass123!')}
              className="p-2 bg-white rounded border border-gray-300 shadow-sm hover:bg-gray-50 text-left transition-colors"
            >
              <span className="font-bold text-gray-800 block">Customer</span>
              <span className="text-[10px] text-gray-400 truncate block">customer@test.com</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@vortex.com', 'Pass123!')}
              className="p-2 bg-white rounded border border-gray-300 shadow-sm hover:bg-gray-50 text-left transition-colors"
            >
              <span className="font-bold text-gray-800 block">Admin</span>
              <span className="text-[10px] text-gray-400 truncate block">admin@vortex.com</span>
            </button>
          </div>
          <p className="text-[10px] text-gray-400 mt-2">Password for both: Pass123!</p>
        </div>
      </div>

      {/* Create account */}
      <div className="w-full max-w-[400px] mt-5 pt-5 border-t border-gray-200/70 text-center">
        <p className="text-xs text-gray-500">New here?</p>
        <Link
          to="/register"
          className="btn-secondary w-full mt-2"
        >
          Create your Iron & Ivy account
        </Link>
      </div>
    </div>
  );
};
