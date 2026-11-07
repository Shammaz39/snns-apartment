import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Building2, LogOut, KeyRound, Shield, ShieldCheck, Home } from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';

export default function Navbar({ apartmentName = 'SNNS Apartment' }) {
  const { user, logout, isAdmin, isSecurity } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const getRoleLabel = () => {
    if (isAdmin) return 'System Admin / Manager';
    if (isSecurity) return 'Gate Security Staff';
    return `Room ${user?.roomNumber || 'Resident'}`;
  };

  const getRoleIcon = () => {
    if (isAdmin) return <ShieldCheck className="w-3.5 h-3.5 text-brand-600 inline mr-1" />;
    if (isSecurity) return <Shield className="w-3.5 h-3.5 text-amber-600 inline mr-1" />;
    return <Home className="w-3.5 h-3.5 text-blue-600 inline mr-1" />;
  };

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-brand-600 text-white p-2 rounded-xl shadow-sm">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">{apartmentName}</h1>
              <p className="text-xs text-slate-500 font-medium">Multi-Floor Community & Gate Platform</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800">{user?.fullName || user?.username}</span>
              <span className="text-xs text-slate-500 font-medium flex items-center justify-end">
                {getRoleIcon()}
                {getRoleLabel()}
              </span>
            </div>

            <div className="h-8 w-px bg-slate-200 hidden sm:block"></div>

            <button
              onClick={() => setShowPasswordModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-brand-700 hover:bg-brand-50 transition border border-slate-200"
              title="Change Password"
            >
              <KeyRound className="w-3.5 h-3.5 text-brand-600" />
              <span className="hidden sm:inline">Password</span>
            </button>

            <button
              onClick={logout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:text-red-600 hover:bg-red-50 transition border border-transparent"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </div>
      </header>

      <ChangePasswordModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
    </>
  );
}
