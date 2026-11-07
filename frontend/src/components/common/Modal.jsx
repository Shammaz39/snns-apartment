import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon: Icon,
  children,
  maxWidth = 'max-w-lg', // 'max-w-md', 'max-w-lg', 'max-w-2xl', 'max-w-3xl'
  footer,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div
        className={`bg-surface-main text-content-primary rounded-2xl shadow-saas-dropdown dark:shadow-saas-dropdown-dark border border-line-subtle w-full ${maxWidth} overflow-hidden flex flex-col max-h-[92vh] animate-slide-up`}
      >
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-line-subtle flex items-center justify-between bg-surface-secondary/40 shrink-0">
          <div className="flex items-center space-x-2.5">
            {Icon && (
              <div className="p-2 rounded-xl bg-ocean-cyan/10 text-ocean-cyan dark:bg-ocean-cyan/20">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h3 className="text-base font-bold text-content-primary leading-tight">
                {title}
              </h3>
              {subtitle && (
                <p className="text-xs text-content-secondary mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-content-muted hover:text-content-primary hover:bg-surface-secondary transition"
            title="Close dialog (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <div className="px-6 py-4 border-t border-line-subtle bg-surface-secondary/30 flex items-center justify-end space-x-2.5 shrink-0">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
