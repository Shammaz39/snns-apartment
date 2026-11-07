import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Lock,
  User,
  ArrowRight,
  ShieldCheck,
  KeyRound,
  Sparkles,
  Shield,
  Home,
  CheckCircle2,
} from 'lucide-react';
import ThemeToggle from '../components/common/ThemeToggle';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please verify your identifier and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (user, pass) => {
    setUsername(user);
    setPassword(pass);
    setError('');
    setLoading(true);
    try {
      await login(user, pass);
      navigate('/');
    } catch (err) {
      setError('Login failed: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-app flex flex-col justify-between transition-colors duration-200">
      {/* Top Bar with Brand & Theme Switcher */}
      <header className="px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-deep via-[#1b5f77] to-ocean-cyan text-white flex items-center justify-center shadow-md shadow-ocean-cyan/20">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-extrabold text-content-primary tracking-tight block leading-tight">
              SNNS Apartment
            </span>
            <span className="text-[11px] font-semibold text-ocean-cyan block">
              Ocean Modern SaaS
            </span>
          </div>
        </div>

        <ThemeToggle variant="dropdown" />
      </header>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card container */}
          <div className="bg-surface-main p-8 sm:p-10 rounded-3xl border border-line-subtle shadow-saas-dropdown dark:shadow-saas-dropdown-dark backdrop-blur-md">
            {/* Header info */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-ocean-cyan/10 text-ocean-cyan border border-ocean-cyan/30 mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Enterprise Portal</span>
              </div>
              <h2 className="text-2xl font-black text-content-primary tracking-tight">
                Welcome back
              </h2>
              <p className="text-xs text-content-secondary mt-1">
                Enter your residential credentials to access your dashboard
              </p>
            </div>

            {/* Quick Demo Access Bar */}
            <div className="mb-6 p-3.5 rounded-2xl bg-surface-secondary/70 border border-line-subtle">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-content-muted">
                  Super Admin Quick Sign-In
                </span>
                <span className="text-[10px] font-mono font-bold text-ocean-cyan">
                  Abc@123
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@snnsapartment', 'Abc@123')}
                disabled={loading}
                className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-ocean-deep hover:bg-ocean-deepHover text-white rounded-xl text-xs font-bold transition shadow-xs disabled:opacity-50"
              >
                <ShieldCheck className="w-4 h-4 text-ocean-cyan" />
                <span>Fill & Login as Super Admin</span>
              </button>
            </div>

            {/* Error banner */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs rounded-xl font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* Credentials Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                  Identifier
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Email, Flat # (101, 201), or Mobile"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition placeholder:text-content-muted"
                  />
                </div>
                <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px] text-content-muted font-medium">
                  <span className="truncate">🏢 Admin: email</span>
                  <span className="truncate">🏠 Resident: flat #</span>
                  <span className="truncate">🛡 Guard: phone</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-content-primary uppercase tracking-wider mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password"
                    className="block w-full pl-10 pr-3.5 py-2.5 text-sm bg-surface-main text-content-primary border border-line-subtle rounded-xl focus:ring-2 focus:ring-ocean-cyan focus:border-ocean-cyan focus:outline-none transition placeholder:text-content-muted"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center items-center space-x-2 py-3 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-ocean-deep via-[#164E63] to-ocean-cyan hover:opacity-95 shadow-md shadow-ocean-cyan/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ocean-cyan transition disabled:opacity-50 mt-2"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-content-muted border-t border-line-subtle/50">
        SNNS Apartment Management Platform • Ocean Modern Architecture
      </footer>
    </div>
  );
}
