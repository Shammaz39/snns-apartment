import React from 'react';

export default function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'cyan', // 'cyan', 'violet', 'deep', 'amber', 'emerald'
  badge,
  badgeType = 'neutral',
  onClick,
}) {
  const variantStyles = {
    cyan: {
      iconBg: 'bg-ocean-cyan/10 text-ocean-cyan dark:bg-ocean-cyan/20',
      glow: 'group-hover:border-ocean-cyan/40',
      badge: 'bg-ocean-cyan/10 text-ocean-cyan border-ocean-cyan/30',
    },
    violet: {
      iconBg: 'bg-ocean-violet/10 text-ocean-violet dark:bg-ocean-violet/20',
      glow: 'group-hover:border-ocean-violet/40',
      badge: 'bg-ocean-violet/10 text-ocean-violet border-ocean-violet/30',
    },
    deep: {
      iconBg: 'bg-ocean-deep/10 text-ocean-deep dark:bg-ocean-deep/40 dark:text-cyan-300',
      glow: 'group-hover:border-ocean-deep/40',
      badge: 'bg-ocean-deep/10 text-ocean-deep border-ocean-deep/30',
    },
    amber: {
      iconBg: 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400',
      glow: 'group-hover:border-amber-500/40',
      badge: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
    },
    emerald: {
      iconBg: 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400',
      glow: 'group-hover:border-emerald-500/40',
      badge: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    },
  };

  const current = variantStyles[variant] || variantStyles.cyan;

  return (
    <div
      onClick={onClick}
      className={`group relative bg-surface-main p-5 rounded-2xl border border-line-subtle shadow-saas-card transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:shadow-saas-card-hover hover:-translate-y-0.5' : ''
      } ${current.glow}`}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
            {title}
          </span>
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-content-primary tracking-tight">
              {value}
            </span>
            {badge && (
              <span className={`inline-flex items-center px-2 py-0.5 text-[11px] font-semibold rounded-full border ${current.badge}`}>
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-content-secondary pt-0.5">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div className={`p-3 rounded-xl ${current.iconBg} transition-transform duration-200 group-hover:scale-105 shrink-0`}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        )}
      </div>
    </div>
  );
}
