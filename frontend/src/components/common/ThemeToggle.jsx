import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Laptop, Check } from 'lucide-react';

export default function ThemeToggle({ variant = 'segmented' }) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (variant === 'segmented') {
    return (
      <div className="inline-flex items-center p-1 bg-surface-secondary border border-line-subtle rounded-xl shadow-xs">
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
            theme === 'light'
              ? 'bg-surface-main text-ocean-cyan shadow-sm font-semibold'
              : 'text-content-secondary hover:text-content-primary'
          }`}
          title="Light theme"
        >
          <Sun className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
            theme === 'dark'
              ? 'bg-surface-main text-ocean-cyan shadow-sm font-semibold'
              : 'text-content-secondary hover:text-content-primary'
          }`}
          title="Dark theme"
        >
          <Moon className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={`p-1.5 rounded-lg text-xs font-medium transition-all flex items-center space-x-1 ${
            theme === 'system'
              ? 'bg-surface-main text-ocean-cyan shadow-sm font-semibold'
              : 'text-content-secondary hover:text-content-primary'
          }`}
          title="Match System preference"
        >
          <Laptop className="w-4 h-4" />
          <span className="hidden xl:inline text-[11px]">System</span>
        </button>
      </div>
    );
  }

  // Dropdown style
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="p-2 rounded-xl text-content-secondary hover:text-content-primary hover:bg-surface-secondary border border-line-subtle transition flex items-center justify-center"
        title={`Current: ${theme} (Click to change)`}
      >
        {resolvedTheme === 'dark' ? (
          <Moon className="w-4 h-4 text-ocean-cyan" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-36 bg-surface-main rounded-xl border border-line-subtle shadow-saas-dropdown dark:shadow-saas-dropdown-dark p-1 z-50 animate-slide-up">
          <button
            onClick={() => { setTheme('light'); setOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
              theme === 'light' ? 'bg-surface-secondary text-ocean-cyan font-semibold' : 'text-content-primary hover:bg-surface-secondary'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span>Light</span>
            </span>
            {theme === 'light' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => { setTheme('dark'); setOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
              theme === 'dark' ? 'bg-surface-secondary text-ocean-cyan font-semibold' : 'text-content-primary hover:bg-surface-secondary'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Moon className="w-3.5 h-3.5 text-ocean-cyan" />
              <span>Dark</span>
            </span>
            {theme === 'dark' && <Check className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={() => { setTheme('system'); setOpen(false); }}
            className={`w-full flex items-center justify-between px-3 py-2 text-xs rounded-lg transition ${
              theme === 'system' ? 'bg-surface-secondary text-ocean-cyan font-semibold' : 'text-content-primary hover:bg-surface-secondary'
            }`}
          >
            <span className="flex items-center space-x-2">
              <Laptop className="w-3.5 h-3.5 text-content-muted" />
              <span>System</span>
            </span>
            {theme === 'system' && <Check className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}
    </div>
  );
}
