import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  LogOut,
  KeyRound,
  Shield,
  ShieldCheck,
  Home,
  Menu,
  ChevronDown,
  User,
  Sparkles,
} from 'lucide-react';
import ChangePasswordModal from './ChangePasswordModal';
import ThemeToggle from './common/ThemeToggle';

export default function Navbar({
  apartmentName = 'SNNS Apartment',
  onMobileMenuToggle,
  isMobileMenuOpen,
}) {
  const { user, logout, isAdmin, isSecurity } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getRoleLabel = () => {
    if (isAdmin) return 'Super Admin';
    if (isSecurity) return 'Gate Security';
    return `Resident • Flat ${user?.roomNumber || ''}`;
  };

  const getRoleIcon = () => {
    if (isAdmin) return <ShieldCheck className="w-3.5 h-3.5 text-ocean-cyan" />;
    if (isSecurity) return <Shield className="w-3.5 h-3.5 text-amber-500" />;
    return <Home className="w-3.5 h-3.5 text-ocean-violet" />;
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-surface-main/90 backdrop-blur-md border-b border-line-subtle shadow-xs transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile hamburger & Brand */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={onMobileMenuToggle}
              className="md:hidden p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-secondary border border-line-subtle transition"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ocean-deep via-[#1b5f77] to-ocean-cyan text-white flex items-center justify-center shadow-md shadow-ocean-cyan/20 shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="truncate">
                <div className="flex items-center space-x-2">
                  <h1 className="text-base font-extrabold text-content-primary tracking-tight truncate leading-tight">
                    {apartmentName}
                  </h1>
                  <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-ocean-cyan/10 text-ocean-cyan border border-ocean-cyan/30">
                    SaaS v2.0
                  </span>
                </div>
                <p className="text-[11px] text-content-secondary font-medium hidden sm:block truncate">
                  Smart Residential & Gate Operations
                </p>
              </div>
            </div>
          </div>

          {/* Right: Actions, Theme Selector, Profile */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Theme Toggle (3-way Segmented on lg, Dropdown on smaller) */}
            <div className="hidden sm:block">
              <ThemeToggle variant="segmented" />
            </div>
            <div className="sm:hidden">
              <ThemeToggle variant="dropdown" />
            </div>

            <div className="h-6 w-px bg-line-subtle hidden sm:block"></div>

            {/* User Profile Dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-line-subtle hover:bg-surface-secondary transition group text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-ocean-deep to-ocean-violet text-white flex items-center justify-center text-xs font-bold shadow-xs shrink-0">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="hidden md:flex flex-col text-left">
                  <span className="text-xs font-bold text-content-primary leading-tight group-hover:text-ocean-cyan transition">
                    {user?.fullName || user?.username}
                  </span>
                  <span className="text-[10px] text-content-muted font-medium flex items-center space-x-1">
                    {getRoleIcon()}
                    <span>{getRoleLabel()}</span>
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-content-muted hidden md:block" />
              </button>

              {/* Profile Dropdown Menu */}
              {showProfileMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-surface-main rounded-2xl border border-line-subtle shadow-saas-dropdown dark:shadow-saas-dropdown-dark p-2 z-50 animate-slide-up">
                  <div className="px-3 py-2 border-b border-line-subtle/60 mb-1">
                    <p className="text-xs font-bold text-content-primary truncate">
                      {user?.fullName || user?.username}
                    </p>
                    <p className="text-[11px] text-content-muted flex items-center space-x-1 mt-0.5">
                      {getRoleIcon()}
                      <span>{getRoleLabel()}</span>
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setShowPasswordModal(true);
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-content-secondary hover:text-content-primary hover:bg-surface-secondary rounded-xl transition"
                  >
                    <KeyRound className="w-4 h-4 text-ocean-cyan" />
                    <span>Change Password</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-xl transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
