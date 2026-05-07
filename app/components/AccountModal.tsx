'use client';

import { useState, FormEvent, useEffect } from 'react';

export type AuthUser = {
  id: string;
  email: string;
  name?: string | null;
  role: 'USER' | 'ADMIN' | 'INFLUENCER';
};

export type AuthMode = 'login' | 'register';

interface AccountModalProps {
  isOpen: boolean;
  mode: AuthMode;
  onClose: () => void;
  onModeChange: (mode: AuthMode) => void;
  onAuthSuccess: (user: AuthUser) => void;
  preSelectInfluencer?: boolean;
}

export default function AccountModal({ isOpen, mode, onClose, onModeChange, onAuthSuccess, preSelectInfluencer = false }: AccountModalProps) {
  const [formValues, setFormValues] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    wantsAdmin: false,
    wantsInfluencer: false,
    adminKey: '',
    defaultPrefix: '',
  });

  // Pre-select influencer mode when opened from admin
  useEffect(() => {
    if (isOpen && preSelectInfluencer && mode === 'register') {
      setFormValues((prev) => ({
        ...prev,
        wantsInfluencer: true,
        wantsAdmin: false,
        defaultPrefix: 'STYLE_A',
      }));
    } else if (isOpen && !preSelectInfluencer) {
      // Reset when modal opens without pre-select
      setFormValues((prev) => ({
        ...prev,
        wantsInfluencer: false,
        defaultPrefix: '',
      }));
    }
  }, [isOpen, preSelectInfluencer, mode]);

  const [status, setStatus] = useState<{ type: 'idle' | 'error' | 'success'; message: string }>({ type: 'idle', message: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const resetState = () => {
    setFormValues({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      wantsAdmin: false,
      wantsInfluencer: false,
      adminKey: '',
      defaultPrefix: '',
    });
    setStatus({ type: 'idle', message: '' });
  };

  const closeModal = () => {
    resetState();
    onClose();
  };

  const handleChange = (field: keyof typeof formValues, value: string | boolean) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setStatus({ type: 'idle', message: '' });

    if (mode === 'register' && formValues.password !== formValues.confirmPassword) {
      setStatus({ type: 'error', message: 'Passwords do not match.' });
      return;
    }

    try {
      setIsSubmitting(true);

      const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth';
      const payload =
        mode === 'login'
          ? { email: formValues.email, password: formValues.password }
          : {
              email: formValues.email,
              password: formValues.password,
              name: formValues.name,
              wantsAdmin: formValues.wantsAdmin,
              wantsInfluencer: formValues.wantsInfluencer,
              adminKey: formValues.adminKey,
              defaultPrefix: formValues.defaultPrefix,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok || !data.user) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      if (mode === 'register') {
        // After successful registration, switch to login mode
        setStatus({ type: 'success', message: 'Account created successfully! Please login with your credentials.' });
        setFormValues({
          name: '',
          email: formValues.email, // Keep email for convenience
          password: '',
          confirmPassword: '',
          wantsAdmin: false,
          wantsInfluencer: false,
          adminKey: '',
          defaultPrefix: '',
        });
        onModeChange('login');
        setIsSubmitting(false);
      } else {
        // After successful login, close modal and handle auth success
        onAuthSuccess(data.user as AuthUser);
        setStatus({ type: 'success', message: 'Logged in successfully.' });
        closeModal();
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Something went wrong.';
      setStatus({ type: 'error', message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm px-4 py-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative overflow-hidden max-h-[90vh] flex flex-col">
        <button className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 z-10" onClick={closeModal} aria-label="Close account modal">
          ✕
        </button>

        <div className="p-6 overflow-y-auto flex-1">
          <div className="flex justify-center mb-4 space-x-3">
            <button
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                mode === 'login' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => onModeChange('login')}
            >
              Login
            </button>
            <button
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-all ${
                mode === 'register' ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-100 text-gray-600'
              }`}
              onClick={() => onModeChange('register')}
            >
              Sign Up
            </button>
          </div>

          <form className="space-y-3" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formValues.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                  placeholder="Jane Doe"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Email</label>
              <input
                type="email"
                required
                value={formValues.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-900 mb-1">Password</label>
              <input
                type="password"
                required
                value={formValues.password}
                onChange={(e) => handleChange('password', e.target.value)}
                className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                placeholder="••••••••"
                minLength={8}
              />
              {mode === 'register' && <p className="text-xs text-gray-600 mt-0.5">Use at least 8 characters combining letters and numbers.</p>}
            </div>

            {mode === 'register' && (
              <div>
                <label className="block text-xs font-semibold text-gray-900 mb-1">Confirm Password</label>
                <input
                  type="password"
                  required
                  value={formValues.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                  placeholder="••••••••"
                />
              </div>
            )}

            {mode === 'register' && preSelectInfluencer && (
              <div className="space-y-2 rounded-lg border border-purple-100 p-2.5 bg-purple-50/50">
                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={formValues.wantsInfluencer}
                    onChange={(e) => {
                      handleChange('wantsInfluencer', e.target.checked);
                      if (e.target.checked) {
                        handleChange('wantsAdmin', false);
                      }
                    }}
                    className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span>Register as Influencer</span>
                </label>

                {formValues.wantsInfluencer && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Promo Code Prefix (e.g., STYLE_A)</label>
                    <input
                      type="text"
                      required
                      value={formValues.defaultPrefix}
                      onChange={(e) => handleChange('defaultPrefix', e.target.value.toUpperCase())}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300 uppercase"
                      placeholder="STYLE_A"
                      pattern="[A-Z0-9_]+"
                    />
                    <p className="text-xs text-gray-600 mt-0.5">Only letters, numbers, and underscores</p>
                  </div>
                )}
              </div>
            )}

            {mode === 'register' && (
              <div className="space-y-2 rounded-lg border border-purple-100 p-2.5 bg-purple-50/50">
                <label className="flex items-center space-x-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={formValues.wantsAdmin}
                    onChange={(e) => {
                      handleChange('wantsAdmin', e.target.checked);
                      if (e.target.checked) {
                        handleChange('wantsInfluencer', false);
                      }
                    }}
                    className="w-3.5 h-3.5 text-purple-600 rounded border-gray-300 focus:ring-purple-500"
                  />
                  <span>I have an administrative key</span>
                </label>

                {formValues.wantsAdmin && (
                  <div>
                    <label className="block text-xs font-semibold text-gray-900 mb-1">Administrative Key</label>
                    <input
                      type="password"
                      required
                      value={formValues.adminKey}
                      onChange={(e) => handleChange('adminKey', e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-lg px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 focus:outline-none transition-all hover:border-gray-300"
                      placeholder="Enter administrative key"
                    />
                  </div>
                )}
              </div>
            )}

            {status.type === 'error' && <p className="text-xs text-red-600">{status.message}</p>}
            {status.type === 'success' && <p className="text-xs text-green-600">{status.message}</p>}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2.5 rounded-xl font-semibold text-sm shadow-lg hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-60 mt-2"
            >
              {isSubmitting ? 'Please wait...' : mode === 'login' ? 'Login' : 'Register'}
            </button>
          </form>

          <p className="text-xs text-gray-500 text-center mt-3 px-2">
            By continuing you agree to our terms of service. Users can browse products without logging in, but an account is required for purchases or
            admin access.
          </p>
        </div>
      </div>
    </div>
  );
}

