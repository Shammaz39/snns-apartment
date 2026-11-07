import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, User, ArrowRight, ShieldCheck, KeyRound, Sparkles } from 'lucide-react';

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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-500 text-white shadow-xl mb-4">
          <Building2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-extrabold text-white tracking-tight">SNNS Apartment</h2>
        <p className="mt-2 text-sm text-slate-300">
          Smart Community, Gate Security & Multi-Floor Management
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-2xl rounded-2xl sm:px-10 border border-slate-100">
          {/* Quick Default Super Admin Login */}
          <div className="mb-6 pb-5 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">
              Super Admin Quick Access
            </span>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@snnsapartment', 'Abc@123')}
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-brand-50 hover:bg-brand-100 text-brand-800 rounded-xl text-xs font-semibold border border-brand-200 transition"
            >
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Login as Default Super Admin (admin@snnsapartment)</span>
            </button>
            <p className="text-[11px] text-slate-400 text-center mt-2">
              Default password for all initial accounts is <span className="font-mono font-semibold text-slate-600">Abc@123</span>
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Identifier (Email / Phone / Room # / Name)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin@snnsapartment, Room 101, or Phone"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block">
                • Admin: <span className="font-mono">admin@snnsapartment</span> or username<br />
                • Resident: Room Number (e.g. <span className="font-mono">101</span>) or Mobile<br />
                • Security Guard: Mobile Number or Name
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="block w-full pl-10 pr-3.5 py-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center space-x-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 transition disabled:opacity-50"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
