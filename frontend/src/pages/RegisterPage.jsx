import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AlertCircle } from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const { register, isLoading } = useAuthStore();

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
  });
  const [errorMessage, setErrorMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    try {
      await register(formData);
      navigate('/');
    } catch (err) {
      setErrorMessage(err.message || 'Registration failed. Email may already be registered.');
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center px-4 py-10">
      {/* Logo */}
      <Link to="/" className="mb-6" aria-label="Home">
        <span className="font-display font-bold text-3xl tracking-tight text-ink">
          Iron <span className="text-gradient">&amp;</span> Ivy
        </span>
      </Link>

      {/* Register card */}
      <div className="w-full max-w-[400px] bg-white border border-gray-100 rounded-3xl p-7 shadow-card">
        <h1 className="text-2xl font-medium text-gray-900 mb-4">Create account</h1>

        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-300 rounded flex items-start gap-2 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="reg-name" className="block text-xs font-bold text-gray-800 mb-1">
              Your name
            </label>
            <input
              id="reg-name"
              type="text"
              required
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="First and last name"
              autoComplete="name"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="reg-email" className="block text-xs font-bold text-gray-800 mb-1">
              Email
            </label>
            <input
              id="reg-email"
              type="email"
              required
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="you@example.com"
              autoComplete="email"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="reg-phone" className="block text-xs font-bold text-gray-800 mb-1">
              Phone number (optional)
            </label>
            <input
              id="reg-phone"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="9876543210"
              autoComplete="tel"
              className="input"
            />
          </div>

          <div>
            <label htmlFor="reg-password" className="block text-xs font-bold text-gray-800 mb-1">
              Password
            </label>
            <input
              id="reg-password"
              type="password"
              required
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="At least 6 characters"
              autoComplete="new-password"
              className="input"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="btn-primary w-full !py-3 disabled:opacity-60"
          >
            {isLoading ? 'Creating your account…' : 'Create account'}
          </button>
        </form>

        <p className="text-xs text-gray-600 mt-4 leading-relaxed">
          By creating an account, you agree to Iron & Ivy's{' '}
          <span className="a-link">Conditions of Use</span> and{' '}
          <span className="a-link">Privacy Notice</span>.
        </p>
      </div>

      {/* Sign-in link */}
      <div className="w-full max-w-[400px] mt-5 pt-4 border-t border-gray-300 text-center">
        <p className="text-xs text-gray-700 mb-2">Already have an account?</p>
        <Link
          to="/login"
          className="btn-secondary w-full mt-2"
        >
          Sign in instead
        </Link>
      </div>
    </div>
  );
};
