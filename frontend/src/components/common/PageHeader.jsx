import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PageHeader({
  title,
  subtitle,
  badge,
  badgeIcon: BadgeIcon,
  breadcrumbs = [],
  actions,
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 border-b border-line-subtle/50">
      <div className="space-y-1.5">
        {/* Breadcrumbs if provided */}
        {breadcrumbs.length > 0 && (
          <nav className="flex items-center space-x-1.5 text-xs text-content-muted">
            <Link to="/" className="hover:text-ocean-cyan transition flex items-center">
              <Home className="w-3.5 h-3.5" />
            </Link>
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3 h-3 text-content-muted/60" />
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-ocean-cyan transition">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-content-secondary font-medium">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </nav>
        )}

        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="text-xl sm:text-2xl font-extrabold text-content-primary tracking-tight">
            {title}
          </h1>

          {badge && (
            <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-ocean-cyan/10 text-ocean-cyan border border-ocean-cyan/30">
              {BadgeIcon && <BadgeIcon className="w-3 h-3 shrink-0" />}
              <span>{badge}</span>
            </span>
          )}
        </div>

        {subtitle && (
          <p className="text-xs sm:text-sm text-content-secondary max-w-2xl">
            {subtitle}
          </p>
        )}
      </div>

      {actions && (
        <div className="flex flex-wrap items-center gap-2 shrink-0 self-start sm:self-auto">
          {actions}
        </div>
      )}
    </div>
  );
}
